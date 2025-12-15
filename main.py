from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import pytesseract
import cv2
import numpy as np

# Import logic
from allergen_engine import extract_ingredients_section, split_ingredients_list, detect_allergens_from_ingredient_items
from image_processor import preprocess_image_for_ocr

# If running on Windows (your laptop), use the D: drive path
if os.name == 'nt':
    pytesseract.pytesseract.tesseract_cmd = r"D:\Tesseract-OCR\tesseract.exe"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def score_ocr_text(text):
    """
    Scores the quality of the OCR text.
    """
    if not text: return 0
    score = 0
    lower_text = text.lower()
    if "ingredient" in lower_text or "ingredients" in lower_text:
        score += 50
    if "contains" in lower_text:
        score += 10
    return score

@app.get("/")
def home():
    return {"message": "Food Allergy Sentinel API is Running!"}

@app.post("/scan")
async def scan_food(
    file: UploadFile = File(...), 
    allergens: str = Form(...) 
):
    temp_filename = f"temp_{file.filename}"
    
    try:
        # 1. Save locally
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 2. Resizing (Critical for Memory & Speed)
        img = cv2.imread(temp_filename)
        height, width = img.shape[:2]
        max_dimension = 800  # Reduced to 800px for SPEED

        if max(height, width) > max_dimension:
            scale = max_dimension / max(height, width)
            new_width = int(width * scale)
            new_height = int(height * scale)
            img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_AREA)
            cv2.imwrite(temp_filename, img)

        # 3. SPEED OPTIMIZED OCR STRATEGY
        custom_config = r'--oem 3 --psm 6'
        best_text = ""
        
        # --- PASS 1: Raw Grayscale ---
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        text_1 = pytesseract.image_to_string(gray, config=custom_config)
        score_1 = score_ocr_text(text_1)

        # === EARLY EXIT (THE SPEED FIX) ===
        # If Pass 1 is good, we SKIP Pass 2 and 3. This saves 40 seconds on Cloud.
        if score_1 > 40:
            print(f"⚡ Fast Pass 1 Successful (Score: {score_1})")
            best_text = text_1
        else:
            # Only do the hard work if Pass 1 failed
            print("⚠️ Pass 1 Low Confidence. Trying Pass 2...")
            
            # Pass 2: Processed
            processed_img = preprocess_image_for_ocr(temp_filename)
            text_2 = pytesseract.image_to_string(processed_img, config=custom_config)
            score_2 = score_ocr_text(text_2)

            # Pass 3: Inverted (Only if Pass 2 is also bad)
            if score_2 < 40:
                print("⚠️ Pass 2 Low Confidence. Trying Pass 3 (Inverted)...")
                inverted_gray = cv2.bitwise_not(gray)
                inverted_gray = cv2.threshold(inverted_gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
                text_3 = pytesseract.image_to_string(inverted_gray, config=custom_config)
                score_3 = score_ocr_text(text_3)
            else:
                text_3 = ""
                score_3 = 0

            # Pick Winner
            if score_3 >= score_1 and score_3 >= score_2:
                best_text = text_3
            elif score_2 >= score_1:
                best_text = text_2
            else:
                best_text = text_1

        # 4. LOGIC PIPELINE
        ingredients_text = extract_ingredients_section(best_text)
        if len(ingredients_text) < 5: 
            ingredients_text = best_text

        items = split_ingredients_list(ingredients_text)
        
        if not allergens:
            user_allergen_list = []
        else:
            user_allergen_list = [x.strip().lower() for x in allergens.split(",")]
        
        analysis = detect_allergens_from_ingredient_items(items, user_allergen_list)

        # 5. RETURN WRAPPER (THE DATA FORMAT FIX)
        # We wrap it in { status, analysis } so the Frontend understands it.
        return {
            "status": "success",
            "text_preview": best_text[:300],
            "analysis": analysis
        }

    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
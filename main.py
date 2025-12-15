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

# Allow Vercel to talk to Render
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

    keywords = ["water", "sugar", "syrup", "acid", "gum", "oil", "starch", "corn", "red", "yellow", "blue", "color", "flavor", "sodium"]
    for k in keywords:
        if k in lower_text:
            score += 1
            
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
        # 1. Save the upload to disk momentarily
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # --- MEMORY PROTECTION (CRITICAL FIX) ---
        # We load the image with OpenCV and check its size immediately.
        img = cv2.imread(temp_filename)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        height, width = img.shape[:2]
        max_dimension = 1024 # Limit size to 1024px to save RAM (512MB limit on Render)

        if max(height, width) > max_dimension:
            # Calculate new size maintaining aspect ratio
            scale = max_dimension / max(height, width)
            new_width = int(width * scale)
            new_height = int(height * scale)
            
            print(f"📉 Resizing Image from {width}x{height} to {new_width}x{new_height} to save memory.")
            img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_AREA)
            
            # Save the smaller image back to disk so 'image_processor.py' uses the small version too
            cv2.imwrite(temp_filename, img)
        # ----------------------------------------

        # --- MULTI-PASS OCR STRATEGY ---
        custom_config = r'--oem 3 --psm 6' # Block of text mode
        
        # 1. Raw Grayscale (Best for Black-on-White)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        text_1 = pytesseract.image_to_string(gray, config=custom_config)
        
        # 2. Vision Pro (Best for Glare/Noise)
        # Note: This now reads the RESIZED image from disk, so it won't crash!
        processed_img = preprocess_image_for_ocr(temp_filename)
        text_2 = pytesseract.image_to_string(processed_img, config=custom_config)

        # 3. Inverted Raw (Best for White-on-Black labels)
        inverted_gray = cv2.bitwise_not(gray)
        inverted_gray = cv2.threshold(inverted_gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
        text_3 = pytesseract.image_to_string(inverted_gray, config=custom_config)

        # --- JUDGEMENT DAY ---
        score_1 = score_ocr_text(text_1)
        score_2 = score_ocr_text(text_2)
        score_3 = score_ocr_text(text_3)

        print(f"\n--- DEBUG SCORES ---")
        print(f"1. Raw: {score_1}")
        print(f"2. Proc: {score_2}")
        print(f"3. Inv:  {score_3}")

        # Pick the winner
        if score_3 >= score_1 and score_3 >= score_2:
            best_text = text_3
            print("✅ Winner: INVERTED (Pass 3)")
        elif score_2 >= score_1:
            best_text = text_2
            print("✅ Winner: PROCESSED (Pass 2)")
        else:
            best_text = text_1
            print("✅ Winner: RAW (Pass 1)")

        # 2. LOGIC PIPELINE
        ingredients_text = extract_ingredients_section(best_text)
        
        if len(ingredients_text) < 5: 
            ingredients_text = best_text

        items = split_ingredients_list(ingredients_text)
        
        if not allergens:
            user_allergen_list = []
        else:
            user_allergen_list = [x.strip().lower() for x in allergens.split(",")]
        
        results = detect_allergens_from_ingredient_items(items, user_allergen_list)

        return results

    except Exception as e:
        print(f"ERROR: {e}")
        # Return a 500 error so the frontend knows something went wrong
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Clean up the temp file
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
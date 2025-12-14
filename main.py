from fastapi import FastAPI, UploadFile, File, Form
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
    - Heavily prioritizes finding the 'INGREDIENTS' header.
    - Counts food terms.
    """
    if not text: return 0
    
    score = 0
    lower_text = text.lower()

    # CRITICAL: If we find the start of the list, this is the winning text.
    if "ingredient" in lower_text or "ingredients" in lower_text:
        score += 50  # Massive bonus
    if "contains" in lower_text:
        score += 10

    # Common words in ingredient lists (not nutrition facts)
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
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # --- MULTI-PASS OCR STRATEGY ---
        img = cv2.imread(temp_filename)
        custom_config = r'--oem 3 --psm 6' # Block of text mode
        
        # 1. Raw Grayscale (Best for Black-on-White)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        text_1 = pytesseract.image_to_string(gray, config=custom_config)
        
        # 2. Vision Pro (Best for Glare/Noise)
        processed_img = preprocess_image_for_ocr(temp_filename)
        text_2 = pytesseract.image_to_string(processed_img, config=custom_config)

        # 3. Inverted Raw (Best for White-on-Black labels like Mtn Dew)
        # We invert the grayscale image to turn White Text -> Black Text
        inverted_gray = cv2.bitwise_not(gray)
        # Boost contrast on the inverted image
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

        # Pick the one with the highest food score
        if score_3 >= score_1 and score_3 >= score_2:
            best_text = text_3
            print("✅ Winner: INVERTED (Pass 3)")
        elif score_2 >= score_1:
            best_text = text_2
            print("✅ Winner: PROCESSED (Pass 2)")
        else:
            best_text = text_1
            print("✅ Winner: RAW (Pass 1)")

        print("--- EXTRACTED TEXT START ---")
        print(best_text[:300]) # Print first 300 chars to check
        print("--- EXTRACTED TEXT END ---\n")

        # 2. LOGIC PIPELINE
        ingredients_text = extract_ingredients_section(best_text)
        
        if len(ingredients_text) < 5: # Fallback if extraction failed
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
        return {"error": str(e)}
    
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
import os
import cv2
import json
import pytesseract
import glob
from datetime import datetime

# Import Logic
from image_processor import preprocess_image_for_ocr
from allergen_engine import (
    extract_ingredients_section, 
    split_ingredients_list, 
    detect_allergens_from_ingredient_items,
    normalize_text
)

# If running on Windows (your laptop), use the D: drive path
if os.name == 'nt':
    pytesseract.pytesseract.tesseract_cmd = r"D:\Tesseract-OCR\tesseract.exe"

TEST_IMAGE_DIR = "test_images"
OUTPUT_FILE = "batch_test_results_v4_smart.json"

# We include "Corn" here to test your specific image
TEST_PROFILE = ["milk", "peanut", "soy", "gluten", "egg", "shellfish", "wheat", "corn", "sesame"]

def score_ocr_text(text):
    """
    Scores quality based on finding REAL FOOD WORDS.
    """
    if not text: return 0
    score = 0
    lower_text = text.lower()

    # Heavy bonus if we find the header
    if "ingredient" in lower_text: score += 50
    if "contains" in lower_text: score += 10

    # Common words in ingredients (especially for candy)
    keywords = [
        "sugar", "syrup", "corn", "water", "oil", "salt", "acid", 
        "flour", "starch", "maltose", "dextrose", "color", "flavor", "carbon"
    ]
    
    for k in keywords:
        if k in lower_text:
            score += 1
            
    return score

def run_smart_ocr(filepath):
    """
    Runs 3 strategies and picks the one that finds the most food words.
    """
    img = cv2.imread(filepath)
    if img is None: return None
    
    custom_config = r'--oem 3 --psm 6'

    # 1. Raw Grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    text_1 = pytesseract.image_to_string(gray, config=custom_config)

    # 2. Vision Pro (Upscaled + CLAHE) - BEST FOR CANDY WRAPPERS
    processed_img = preprocess_image_for_ocr(filepath)
    text_2 = pytesseract.image_to_string(processed_img, config=custom_config)

    # 3. Inverted (Good for dark packaging)
    inverted_gray = cv2.bitwise_not(gray)
    text_3 = pytesseract.image_to_string(inverted_gray, config=custom_config)

    # --- SCORE THEM ---
    s1 = score_ocr_text(text_1)
    s2 = score_ocr_text(text_2)
    s3 = score_ocr_text(text_3)

    print(f"   [Scores: Raw={s1}, Proc={s2}, Inv={s3}] -> ", end="")

    if s2 >= s1 and s2 >= s3:
        print("Winner: PROCESSED")
        return text_2
    elif s3 > s1:
        print("Winner: INVERTED")
        return text_3
    else:
        print("Winner: RAW")
        return text_1

def run_batch_test():
    print(f"--- STARTING BATCH TEST V4 (SMART SCORING) ---")
    
    image_files = []
    for ext in ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.PNG']:
        image_files.extend(glob.glob(os.path.join(TEST_IMAGE_DIR, ext)))
    
    if not image_files:
        print("❌ No images found!")
        return

    print(f"Found {len(image_files)} images. Processing...\n")
    results_data = []

    for filepath in image_files:
        filename = os.path.basename(filepath)
        print(f"Processing: {filename}...", end="")

        try:
            # 1. RUN SMART OCR
            best_ocr_text = run_smart_ocr(filepath)
            
            if not best_ocr_text:
                print(" [FAILED]")
                continue
            
            # 2. LOGIC PIPELINE
            extracted_section = extract_ingredients_section(best_ocr_text)
            if len(extracted_section) < 5: extracted_section = best_ocr_text 
            
            items = split_ingredients_list(extracted_section)
            detection_result = detect_allergens_from_ingredient_items(items, TEST_PROFILE)

            # 3. COMPILE RESULT
            entry = {
                "filename": filename,
                "risk_level": detection_result["risk_level"],
                "detected_allergens": list(detection_result["detected_allergens"].keys()),
                "detected_hazards": list(detection_result["detected_hazards"].keys()),
                "extracted_count": len(items),
                "ocr_sample": normalize_text(best_ocr_text)[:100] # Check what it read
            }
            
            results_data.append(entry)

        except Exception as e:
            print(f" [CRASH: {str(e)}]")

    # --- SAVE REPORT ---
    with open(OUTPUT_FILE, "w", encoding='utf-8') as f:
        json.dump(results_data, f, indent=2, ensure_ascii=False)

    print(f"\n--- BATCH V4 COMPLETED ---")
    print(f"📄 Saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    run_batch_test()
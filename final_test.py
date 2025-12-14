import pytesseract
import cv2
import os
import json
# Import your logic
from allergen_engine import extract_ingredients_section, split_ingredients_list, detect_allergens_from_ingredient_items

# --- CONFIGURATION ---
# This points to the file in your screenshot
pytesseract.pytesseract.tesseract_cmd = r"D:\Tesseract-OCR\tesseract.exe"

# Your image file name
IMAGE_PATH = "sample1.jpg" 

def run_test():
    # 1. Check if Tesseract exists
    if not os.path.exists(pytesseract.pytesseract.tesseract_cmd):
        print("ERROR: Python cannot find D:\\Tesseract-OCR\\tesseract.exe")
        return

    # 2. Check if Image exists
    if not os.path.exists(IMAGE_PATH):
        print(f"ERROR: Could not find image: {IMAGE_PATH}")
        print("Please put a food photo named 'sample1.jpg' in this folder.")
        return

    print("--- STARTING SCAN ---")
    
    # 3. Read Image
    img = cv2.imread(IMAGE_PATH)
    if img is None:
        print("Error: CV2 could not read the image. Check file format.")
        return

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 4. Run OCR
    try:
        print("Running Tesseract...")
        # Custom config to treat the image as a single block of text (often helps with labels)
        custom_config = r'--oem 3 --psm 6'
        ocr_text = pytesseract.image_to_string(gray, config=custom_config)
        
        print("\n--- RAW TEXT FOUND ---")
        print(ocr_text) 
    except Exception as e:
        print(f"OCR FAILED: {e}")
        return

    # 5. Run Your AI Engine
    print("\n--- ANALYZING INGREDIENTS ---")
    ingredients_text = extract_ingredients_section(ocr_text)
    
    if not ingredients_text:
        print("Warning: Could not automatically find an 'Ingredients:' section.")
        print("Using the whole text as a fallback...")
        ingredients_text = ocr_text

    items = split_ingredients_list(ingredients_text)
    
    # Test with dummy user profile
    results = detect_allergens_from_ingredient_items(items, ["milk", "peanut", "soy"])
    
    print(json.dumps(results, indent=2))
    print("\n--- SUCCESS ---")

if __name__ == "__main__":
    run_test()
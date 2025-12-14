import pytesseract
import cv2
from allergen_engine import extract_ingredients_section, split_ingredients_list, detect_allergens_from_ingredient_items

# If tesseract is not in PATH, manually set the path here:
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

IMAGE_PATH = "sample1.jpg"  # change to your actual image filename

# Read image
img = cv2.imread(IMAGE_PATH)
if img is None:
    raise SystemExit(f"Image not found: {IMAGE_PATH}")

# Preprocessing
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, th = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

# OCR
ocr_text = pytesseract.image_to_string(th, lang='eng')

print("\n--- RAW OCR TEXT ---\n")
print(ocr_text)

# Extract ingredients
ingredients_text = extract_ingredients_section(ocr_text)
print("\n--- EXTRACTED INGREDIENT SECTION ---\n")
print(ingredients_text)

# Convert to list
items = split_ingredients_list(ingredients_text)
print("\n--- INGREDIENT ITEMS ---\n")
print(items)

# Detect allergens
user_allergens = ["milk", "peanut"]  # you can customize this
results = detect_allergens_from_ingredient_items(items, user_allergens)

import json
print("\n--- FINAL DETECTION RESULTS ---\n")
print(json.dumps(results, indent=2))

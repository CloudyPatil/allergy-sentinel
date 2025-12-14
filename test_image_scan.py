import easyocr
import cv2
from allergen_engine import extract_ingredients_section, split_ingredients_list, detect_allergens_from_ingredient_items

# 1. Load OCR engine
reader = easyocr.Reader(['en'])

# 2. Load your product image (put image in same folder)
IMAGE_PATH = "sample1.jpg"   # change this to your actual image

# 3. Preprocess image slightly (optional but improves accuracy)
img = cv2.imread(IMAGE_PATH)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# 4. Run OCR
result = reader.readtext(gray, detail=0)
ocr_text = " ".join(result)

print("\n--- RAW OCR TEXT ---")
print(ocr_text)

# 5. Extract ingredient section
ingredients_text = extract_ingredients_section(ocr_text)
print("\n--- EXTRACTED INGREDIENT SECTION ---")
print(ingredients_text)

# 6. Split into list items
items = split_ingredients_list(ingredients_text)
print("\n--- INGREDIENT ITEMS ---")
print(items)

# 7. Run allergen detection
user_allergens = ["milk", "peanut"]  # <- you can customize this
results = detect_allergens_from_ingredient_items(items, user_allergens)

print("\n--- FINAL DETECTION RESULTS ---")
import json
print(json.dumps(results, indent=2))

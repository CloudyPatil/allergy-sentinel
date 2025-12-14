import cv2
import numpy as np

def preprocess_image_for_ocr(image_path):
    # 1. READ
    img = cv2.imread(image_path)
    if img is None: return None

    # 2. UPSCALE (Vital for small candy wrappers)
    # We zoom in 3x so Tesseract can see the letters
    img = cv2.resize(img, None, fx=3.0, fy=3.0, interpolation=cv2.INTER_CUBIC)

    # 3. CLAHE (Vital for Crinkled/Shiny Plastic)
    # Removes the glare and shadows caused by wrinkles
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
    cl = clahe.apply(l)
    limg = cv2.merge((cl,a,b))
    final = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)

    # 4. GRAYSCALE & DENOISE
    gray = cv2.cvtColor(final, cv2.COLOR_BGR2GRAY)
    processed_img = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 15, 5
    )
    processed_img = cv2.fastNlMeansDenoising(processed_img, None, 10, 7, 21)

    return processed_img
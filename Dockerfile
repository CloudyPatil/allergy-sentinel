# 1. Use Python 3.10 as the base
FROM python:3.10-slim

# 2. Install Tesseract and GL libraries (Required for OpenCV)
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 3. Set working directory
WORKDIR /app

# 4. Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of the application code
COPY . .

# 6. Command to run the server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
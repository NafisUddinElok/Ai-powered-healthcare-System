FROM node:20

# Install system dependencies (for whisper + OCR)
RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg tesseract-ocr

# Set working directory
WORKDIR /app

# Copy project
COPY . .

# Install Node dependencies
RUN npm install express cors multer tesseract.js

# Install Python dependencies
RUN pip3 install --break-system-packages openai-whisper spacy click

RUN python3 -m pip install --break-system-packages https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl

# Expose port
EXPOSE 3000

# Run server
CMD ["node", "server.js"]
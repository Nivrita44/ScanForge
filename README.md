# ScanForge
## Overview
DocuLens is a full-stack OCR-based web application designed to extract, process, and transform data from documents and images into structured formats. Inspired by Google Lens, this system enables users to seamlessly convert PDFs into Excel/CSV files and scan National ID (NID) cards to automatically extract and autofill information.

This project focuses on real-world document processing challenges, especially for Bangladeshi NID cards, supporting both English and Bangla text recognition.

---

## Features

### 1. PDF → CSV/Excel Generator
- Upload PDF documents (text-based or scanned)
- Extract text and structured data
- Convert extracted data into CSV/Excel format
- Download generated files instantly

### 2. NID Scan → OCR → Autofill
- Capture image using device camera
- Scan National ID (NID) card
- Extract text using OCR (Bangla + English)
- Automatically fill form fields:
  - Name
  - Date of Birth
  - NID Number
  - Address

---

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Webcam

### Backend
- Node.js
- Express.js

### OCR & Processing
- Tesseract OCR / EasyOCR
- pdf-parse
- xlsx / json2csv

### Database (Optional)
- MySQL

---

## How It Works

###  PDF Processing Flow
1. User uploads PDF
2. Backend parses text (or applies OCR if scanned)
3. Data is structured into JSON
4. CSV/Excel file is generated
5. User downloads the file

### NID Scanning Flow
1. User captures NID image
2. Image is processed using OCR
3. Extracted text is parsed using regex/NLP
4. Structured data is returned
5. Form is autofilled instantly

---

##  Installation

```bash
# Clone the repository
git clone https://github.com/your-username/doculens.git

# Navigate to project
cd doculens

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

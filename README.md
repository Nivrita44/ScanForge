# ScanForge

ScanForge is a professional document intelligence system designed for Bangladeshi government service portals. It extracts structured data from Voter List PDFs and performs OCR on National ID (NID) cards.

## Features

- **Voter List Data Extraction**: Convert scanned or text-based PDFs into structured CSV files.
- **NID Scanner**: Real-time camera capture or image upload for automatic NID form filling.
- **Bangla OCR Support**: Optimized for accurate Bangla character extraction.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/)

## Local Setup

### 1. Installation

To install all dependencies for both the frontend and backend, run the following command in the root directory:

```bash
npm run install-all
```

### 2. Environment Configuration

Create a `.env` file in the `backend/` directory (you can use `.env.example` as a template).

```bash
cp .env.example backend/.env
```

### 3. Run the Application

To start both the frontend and backend servers concurrently, run:

```bash
npm run dev
```

The application will be available at:
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:5001](http://localhost:5001)

## Project Structure

- `frontend/`: React + Vite application.
- `backend/`: Express.js server for OCR and PDF processing.
- `api/`: Vercel-specific serverless functions.
- `demo_nid/` & `demo_pdf/`: Sample files for testing.

# Connecting the Dots Backend

This is the backend for the Connecting the Dots MERN application. It handles PDF outline extraction, persona-driven analysis, and stores data in MongoDB Atlas.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file with your MongoDB URI:
   ```
   MONGODB_URI=your_mongodb_uri
   ```
3. Ensure Python 3 and PyMuPDF are installed:
   ```bash
   pip3 install pymupdf
   ```

## Running

- Locally:
  ```bash
  npm start
  ```
- With Docker:
  ```bash
  docker build -t ctd-backend .
  docker run --rm -p 5000:5000 ctd-backend
  ```

## API Endpoints

- `POST /api/outline/upload` — Upload a PDF, extract outline, store and return `{ pdfId, title }`.
- `GET /api/outline/:pdfId` — Get outline by `pdfId`.
- `POST /api/outline/analyze` — Upload 3–10 PDFs, persona, and job; returns `{ analysisId }`.
- `GET /api/outline/analysis/:analysisId` — Get analysis results.

## Error Handling
- Invalid PDFs: Returns 400.
- MongoDB connection issues: Returns 500.

## Notes
- All PDF processing is offline (no internet required except for MongoDB Atlas).
- Supports UTF-8 (multilingual PDFs). 
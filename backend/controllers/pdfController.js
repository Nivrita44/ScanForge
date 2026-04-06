const pdfParse = require('pdf-parse');
const pdfImg = require('pdf-img-convert');
const Tesseract = require('tesseract.js');
const { parseVoterList } = require('../utils/parser');
const { Parser: CsvParser } = require('json2csv');

exports.processPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }

    let rawText = '';
    
    // Step 1: Attempt standard text extraction
    try {
      const data = await pdfParse(req.file.buffer);
      rawText = data.text;
    } catch (parseErr) {
      console.warn('pdf-parse failed, falling back to OCR:', parseErr);
    }

    // Step 2: Fallback to OCR if text is missing or sparse/garbled
    // (threshold: less than 100 useful characters)
    if (!rawText || rawText.trim().replace(/\s/g, '').length < 100) {
      console.log('Detected scanned PDF / sparse text. Starting OCR pipeline...');
      
      // Convert PDF to images (buffers)
      const images = await pdfImg.convert(req.file.buffer, {
        width: 1200, // Higher resolution for better OCR
        base64: false
      });

      console.log(`Converted PDF to ${images.length} page images. Running Tesseract...`);

      const worker = await Tesseract.createWorker('ben'); // Reusable worker for Bangla
      
      let fullOcrText = '';
      for (let i = 0; i < images.length; i++) {
        console.log(`OCR processing page ${i + 1}/${images.length}...`);
        const { data: { text } } = await worker.recognize(images[i]);
        fullOcrText += text + '\n';
      }
      
      await worker.terminate();
      rawText = fullOcrText;
      console.log('OCR pipeline completed.');
    }

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({ error: 'Failed to extract text via both native parsing and OCR. File might be invalid or too low resolution.' });
    }

    // Step 3 & 4: Clean, Segment and Extract Fields using Parser
    const voters = parseVoterList(rawText);

    // Step 5: Convert JSON to CSV for download
    let csvData = '';
    if (voters.length > 0) {
      const csvVoters = voters.map(v => ({
        ...v,
        voter_id: v.voter_id ? `="${v.voter_id}"` : '' // Fix scientific notation in Excel
      }));
      const csvParser = new CsvParser();
      csvData = csvParser.parse(csvVoters);
    }

    res.json({
      success: true,
      data: voters,
      csv: csvData
    });
  } catch (err) {
    console.error('Error processing PDF:', err);
    res.status(500).json({ error: 'Internal server error processing PDF', details: err.message });
  }
};

const jimp = require('jimp');
const { extractTextFromImageBuffer } = require('../services/ocrService');
const { parseNidBlock } = require('../utils/parser');

exports.processNid = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No NID image uploaded.' });
    }

    // Advanced: Image Preprocessing with Jimp
    // Load image buffer, convert to grayscale, increase contrast
    const image = await jimp.read(req.file.buffer);
    image.greyscale().contrast(0.2);
    
    // Get processed buffer
    const processedBuffer = await image.getBufferAsync(jimp.MIME_PNG);

    // Run OCR with Tesseract
    const rawText = await extractTextFromImageBuffer(processedBuffer);

    // Parse the extracted text
    const extractedData = parseNidBlock(rawText);

    res.json({
      success: true,
      data: extractedData
    });
  } catch (err) {
    console.error('Error processing NID:', err);
    res.status(500).json({ error: 'Internal server error processing NID' });
  }
};

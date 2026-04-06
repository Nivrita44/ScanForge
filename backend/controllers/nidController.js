const { Jimp } = require('jimp');
const { extractTextFromImageBuffer } = require('../services/ocrService');
const { parseNidBlock } = require('../utils/parser');

exports.processNid = async (req, res) => {
  try {
    if (!req.files || (!req.files.front && !req.files.back)) {
      return res.status(400).json({ error: 'No NID images uploaded.' });
    }

    let combinedRawText = '';

    // Process Front Side
    if (req.files.front && req.files.front[0]) {
      const frontBuffer = req.files.front[0].buffer;
      const frontImage = await Jimp.read(frontBuffer);
      frontImage.greyscale().contrast(0.2);
      const frontProcessed = await frontImage.getBuffer('image/png');
      const frontText = await extractTextFromImageBuffer(frontProcessed);
      combinedRawText += `\n--- FRONT SIDE ---\n${frontText}`;
    }

    // Process Back Side
    if (req.files.back && req.files.back[0]) {
      const backBuffer = req.files.back[0].buffer;
      const backImage = await Jimp.read(backBuffer);
      backImage.greyscale().contrast(0.2);
      const backProcessed = await backImage.getBuffer('image/png');
      const backText = await extractTextFromImageBuffer(backProcessed);
      combinedRawText += `\n--- BACK SIDE ---\n${backText}`;
    }

    // Parse combined text
    const extractedData = parseNidBlock(combinedRawText);

    res.json({
      success: true,
      data: extractedData
    });
  } catch (err) {
    console.error('Error processing NID:', err);
    res.status(500).json({ error: 'Internal server error processing NID' });
  }
};

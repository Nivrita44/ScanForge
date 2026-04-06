const Tesseract = require('tesseract.js');

exports.extractTextFromImageBuffer = async (imageBuffer) => {
  try {
    const worker = await Tesseract.createWorker('ben+eng');
    const { data: { text } } = await worker.recognize(imageBuffer);
    await worker.terminate();
    return text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
};

const express = require('express');
const multer = require('multer');
const pdfController = require('../controllers/pdfController');
const nidController = require('../controllers/nidController');

const router = express.Router();

// Memory storage for multer to process streams efficiently
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-pdf', upload.single('pdf'), pdfController.processPdf);
router.post('/extract-nid', upload.single('nid'), nidController.processNid);

module.exports = router;

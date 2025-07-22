const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { spawn } = require('child_process');
const Outline = require('../models/Outline');
const Analysis = require('../models/Analysis');
const natural = require('natural');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const upload = multer({ dest: './uploads' });

// POST /api/outline/upload
router.post('/upload', upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No PDF uploaded.' });
  const pdfPath = req.file.path;
  const pdfId = uuidv4();
  try {
    const py = spawn('python3', [path.join(__dirname, '../extract_outline.py'), pdfPath]);
    let data = '';
    let errorData = '';
    py.stdout.on('data', chunk => { data += chunk; });
    py.stderr.on('data', chunk => { errorData += chunk; });
    py.on('close', async code => {
      fs.unlinkSync(pdfPath);
      if (code !== 0) {
        return res.status(400).json({ error: 'Failed to process PDF', details: errorData });
      }
      try {
        const outlineObj = JSON.parse(data);
        const outlineDoc = new Outline({ pdfId, ...outlineObj });
        await outlineDoc.save();
        res.json({ pdfId, title: outlineObj.title });
      } catch (err) {
        res.status(400).json({ error: 'Invalid PDF or extraction error.' });
      }
    });
  } catch (err) {
    fs.unlinkSync(pdfPath);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/outline/:pdfId
router.get('/:pdfId', async (req, res) => {
  try {
    const outline = await Outline.findOne({ pdfId: req.params.pdfId });
    if (!outline) return res.status(404).json({ error: 'Outline not found.' });
    res.json({ pdfId: outline.pdfId, title: outline.title, outline: outline.outline });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/outline/analyze
router.post('/analyze', upload.array('pdfs', 10), async (req, res) => {
  const { persona, jobToBeDone } = req.body;
  if (!req.files || req.files.length < 3 || !persona || !jobToBeDone) {
    req.files.forEach(f => fs.unlinkSync(f.path));
    return res.status(400).json({ error: '3-10 PDFs, persona, and jobToBeDone required.' });
  }
  const analysisId = uuidv4();
  const inputDocuments = [];
  const outlines = [];
  try {
    for (const file of req.files) {
      const pdfId = uuidv4();
      inputDocuments.push(pdfId);
      const py = spawn('python3', [path.join(__dirname, '../extract_outline.py'), file.path]);
      let data = '';
      let errorData = '';
      await new Promise((resolve, reject) => {
        py.stdout.on('data', chunk => { data += chunk; });
        py.stderr.on('data', chunk => { errorData += chunk; });
        py.on('close', async code => {
          fs.unlinkSync(file.path);
          if (code !== 0) return reject(errorData);
          try {
            const outlineObj = JSON.parse(data);
            outlines.push({ pdfId, ...outlineObj });
            const outlineDoc = new Outline({ pdfId, ...outlineObj });
            await outlineDoc.save();
            resolve();
          } catch (err) {
            reject('Invalid PDF or extraction error.');
          }
        });
      });
    }
    // Keyword analysis
    const jobTokens = new natural.WordTokenizer().tokenize(jobToBeDone.toLowerCase());
    const personaTokens = new natural.WordTokenizer().tokenize(persona.toLowerCase());
    let extractedSections = [];
    let subSectionAnalysis = [];
    for (const outline of outlines) {
      for (const item of outline.outline) {
        let score = 0;
        for (const token of jobTokens) {
          if (item.text.toLowerCase().includes(token)) score += 1;
        }
        for (const token of personaTokens) {
          if (item.text.toLowerCase().includes(token)) score += 0.5;
        }
        if (score > 0) {
          extractedSections.push({
            document: outline.pdfId,
            pageNumber: item.page,
            sectionTitle: item.text,
            importanceRank: score
          });
          subSectionAnalysis.push({
            document: outline.pdfId,
            refinedText: `Summary of ${item.text}`,
            pageNumber: item.page
          });
        }
      }
    }
    extractedSections.sort((a, b) => b.importanceRank - a.importanceRank);
    const analysisDoc = new Analysis({
      analysisId,
      inputDocuments,
      persona,
      jobToBeDone,
      processingTimestamp: new Date(),
      extractedSections,
      subSectionAnalysis
    });
    await analysisDoc.save();
    res.json({ analysisId });
  } catch (err) {
    req.files.forEach(f => fs.unlinkSync(f.path));
    res.status(400).json({ error: 'Analysis failed.', details: err.toString() });
  }
});

// GET /api/outline/analysis/:analysisId
router.get('/analysis/:analysisId', async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ analysisId: req.params.analysisId });
    if (!analysis) return res.status(404).json({ error: 'Analysis not found.' });
    res.json({
      analysisId: analysis.analysisId,
      inputDocuments: analysis.inputDocuments,
      persona: analysis.persona,
      jobToBeDone: analysis.jobToBeDone,
      processingTimestamp: analysis.processingTimestamp,
      extractedSections: analysis.extractedSections,
      subSectionAnalysis: analysis.subSectionAnalysis
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router; 
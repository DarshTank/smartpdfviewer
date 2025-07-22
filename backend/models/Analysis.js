const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema({
  analysisId: { type: String, required: true, unique: true },
  inputDocuments: [{ type: String, required: true }],
  persona: { type: String, required: true },
  jobToBeDone: { type: String, required: true },
  processingTimestamp: { type: Date, required: true },
  extractedSections: [
    {
      document: { type: String, required: true },
      pageNumber: { type: Number, required: true },
      sectionTitle: { type: String, required: true },
      importanceRank: { type: Number, required: true }
    }
  ],
  subSectionAnalysis: [
    {
      document: { type: String, required: true },
      refinedText: { type: String, required: true },
      pageNumber: { type: Number, required: true }
    }
  ]
});

module.exports = mongoose.model('Analysis', AnalysisSchema); 
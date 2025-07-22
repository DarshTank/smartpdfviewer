import React, { useState } from 'react';
import axios from 'axios';

export default function AnalysisForm() {
  const [files, setFiles] = useState([]);
  const [persona, setPersona] = useState('');
  const [job, setJob] = useState('');
  const [analysisId, setAnalysisId] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFilesChange = e => {
    setFiles(Array.from(e.target.files));
    setError('');
  };

  const handleSubmit = async () => {
    if (files.length < 3 || files.length > 10) return setError('Please select 3-10 PDF files.');
    if (!persona || !job) return setError('Please enter persona and job-to-be-done.');
    const formData = new FormData();
    files.forEach(f => formData.append('pdfs', f));
    formData.append('persona', persona);
    formData.append('jobToBeDone', job);
    setLoading(true);
    try {
      const res = await axios.post('/api/outline/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAnalysisId(res.data.analysisId);
      fetchResults(res.data.analysisId);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed.');
      setLoading(false);
    }
  };

  const fetchResults = async (id) => {
    try {
      const res = await axios.get(`/api/outline/analysis/${id}`);
      setResults(res.data);
    } catch (err) {
      setError('Failed to fetch analysis results.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Persona-Driven Document Analysis</h2>
      <div className="mb-4">
        <input type="file" accept="application/pdf" multiple onChange={handleFilesChange} className="border p-2 mb-2" />
        <input type="text" placeholder="Persona (e.g., PhD Researcher)" value={persona} onChange={e => setPersona(e.target.value)} className="border p-2 mb-2 w-full" />
        <input type="text" placeholder="Job to be done (e.g., Literature Review)" value={job} onChange={e => setJob(e.target.value)} className="border p-2 mb-2 w-full" />
        <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Analyzing...' : 'Analyze'}</button>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {results && (
        <div className="mt-4">
          <h3 className="font-semibold">Analysis Results</h3>
          <div className="mb-2">Persona: <span className="font-mono">{results.persona}</span></div>
          <div className="mb-2">Job: <span className="font-mono">{results.jobToBeDone}</span></div>
          <div className="mb-2">Processed: {new Date(results.processingTimestamp).toLocaleString()}</div>
          <h4 className="font-semibold mt-2">Ranked Sections</h4>
          <ul className="ml-4 list-decimal">
            {results.extractedSections.map((sec, idx) => (
              <li key={idx} className="mb-1">
                <span className="font-bold">{sec.sectionTitle}</span> (Doc: {sec.document}, Page: {sec.pageNumber}, Score: {sec.importanceRank})
              </li>
            ))}
          </ul>
          <h4 className="font-semibold mt-2">Subsection Summaries</h4>
          <ul className="ml-4 list-disc">
            {results.subSectionAnalysis.map((sub, idx) => (
              <li key={idx}>
                <span className="font-bold">{sub.refinedText}</span> (Doc: {sub.document}, Page: {sub.pageNumber})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 
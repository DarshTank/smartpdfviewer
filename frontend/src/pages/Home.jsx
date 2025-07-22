import React from 'react';
import PdfReader from '../components/PdfReader.jsx';
import AnalysisForm from '../components/AnalysisForm.jsx';

export default function Home({ mode }) {
  return (
    <div>
      {mode === 'single' ? <PdfReader /> : <AnalysisForm />}
    </div>
  );
} 
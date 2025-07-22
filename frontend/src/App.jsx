import React, { useState } from 'react';
import Home from './pages/Home.jsx';

export default function App() {
  const [mode, setMode] = useState('single');
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">Connecting the Dots</h1>
        <div>
          <button
            className={`mr-2 px-4 py-2 rounded ${mode === 'single' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setMode('single')}
          >
            Single PDF Mode
          </button>
          <button
            className={`px-4 py-2 rounded ${mode === 'analysis' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setMode('analysis')}
          >
            Analysis Mode
          </button>
        </div>
      </header>
      <main className="p-4">
        <Home mode={mode} />
      </main>
    </div>
  );
} 
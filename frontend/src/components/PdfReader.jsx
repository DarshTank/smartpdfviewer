import React, { useRef, useState } from 'react';
import axios from 'axios';

export default function PdfReader() {
  const [file, setFile] = useState(null);
  const [outline, setOutline] = useState(null);
  const [pdfId, setPdfId] = useState(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const viewerRef = useRef();

  const handleFileChange = e => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return setError('Please select a PDF file.');
    const formData = new FormData();
    formData.append('pdf', file);
    try {
      const res = await axios.post('/api/outline/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPdfId(res.data.pdfId);
      setTitle(res.data.title);
      setPdfUrl(URL.createObjectURL(file));
      fetchOutline(res.data.pdfId);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed.');
    }
  };

  const fetchOutline = async (id) => {
    try {
      const res = await axios.get(`/api/outline/${id}`);
      setOutline(res.data.outline);
    } catch (err) {
      setError('Failed to fetch outline.');
    }
  };

  // Adobe PDF Embed API
  React.useEffect(() => {
    if (pdfUrl && window.AdobeDC && viewerRef.current) {
      const adobeDCView = new window.AdobeDC.View({
        clientId: import.meta.env.VITE_REACT_APP_ADOBE_CLIENT_ID || process.env.REACT_APP_ADOBE_CLIENT_ID,
        divId: viewerRef.current.id
      });
      adobeDCView.previewFile({
        content: { location: { url: pdfUrl } },
        metaData: { fileName: file?.name || 'Document.pdf' }
      }, {
        embedMode: 'SIZED_CONTAINER',
        showDownloadPDF: false,
        showPrintPDF: false
      });
      adobeDCView.registerCallback(
        window.AdobeDC.View.Enum.CallbackType.EVENT_LISTENER,
        function(event) {
          if (event.type === 'PAGE_VIEW') {
            console.log('PAGE_VIEW', event.data.pageNumber);
          }
        },
        { enablePDFAnalytics: true }
      );
    }
  }, [pdfUrl, file]);

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Upload a PDF to Extract Outline</h2>
      <div className="flex items-center space-x-4 mb-4">
        <input type="file" accept="application/pdf" onChange={handleFileChange} className="border p-2" />
        <button onClick={handleUpload} className="bg-blue-600 text-white px-4 py-2 rounded">Upload</button>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {title && <div className="mb-2 font-bold">Title: {title}</div>}
      {outline && (
        <div className="mb-4">
          <h3 className="font-semibold">Outline</h3>
          <ul className="ml-4 list-disc">
            {outline.map((item, idx) => (
              <li key={idx} className={`ml-${(parseInt(item.level[1]) - 1) * 4}`}>{item.level}: {item.text} (Page {item.page})</li>
            ))}
          </ul>
        </div>
      )}
      <div ref={viewerRef} id="adobe-dc-view" style={{ height: 600 }} className="w-full border" />
    </div>
  );
} 
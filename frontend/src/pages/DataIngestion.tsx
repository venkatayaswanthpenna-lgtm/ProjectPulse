import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileText, Send, CheckCircle, AlertTriangle } from 'lucide-react';

export default function DataIngestion() {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  const demoText = "Date: Oct 12, 2026\nSupervisor: John Doe\n\nNotes:\nStarted tying rebar for the main raft foundation in Zone A. Reached about 50% completion today. Also, the North Sector trench excavation is going well, team is actively digging.";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setStatus('loading');
    try {
      await axios.post(`${apiUrl}/ingest`, {
        raw_content: content,
        submitted_by: 'Demo Supervisor',
        project_id: 1
      });
      setStatus('success');
      setTimeout(() => navigate('/review'), 1500);
    } catch (e: any) {
      setStatus('error');
      setErrorMsg(e.message || 'Failed to submit report');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white shadow-sm border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Submit Daily Progress Report</h2>
            <p className="text-gray-500 text-sm">Upload free-text updates. The Execution Truth Engine will structure and map them automatically.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Field Notes</label>
              <button type="button" onClick={() => setContent(demoText)} className="text-xs text-blue-600 hover:underline">
                Load Demo Data
              </button>
            </div>
            <textarea
              rows={8}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-3"
              placeholder="Describe the daily activities, locations, and progress..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={status === 'loading' || status === 'success'}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm">
              {status === 'loading' && <span className="text-blue-600 flex items-center"><span className="animate-spin mr-2">↻</span> AI is processing & mapping events...</span>}
              {status === 'success' && <span className="text-green-600 flex items-center"><CheckCircle size={16} className="mr-1"/> Processing complete. Redirecting to Trust Layer...</span>}
              {status === 'error' && <span className="text-red-600 flex items-center"><AlertTriangle size={16} className="mr-1"/> {errorMsg}</span>}
            </div>
            
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success' || !content.trim()}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {status === 'loading' ? 'Processing...' : 'Submit & Analyze'}
              <Send size={16} className="ml-2" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

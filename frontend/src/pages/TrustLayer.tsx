import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldAlert, Check, X, ArrowRight, ShieldCheck } from 'lucide-react';

export default function TrustLayer() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/review`);
      setMatches(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (matchId: number, action: string) => {
    try {
      setProcessingId(matchId);
      await axios.post(`${apiUrl}/review/${matchId}`, {
        action: action,
        reviewed_by: 'Lead Planner Demo'
      });
      await fetchReviews();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="flex justify-center p-12">Loading Trust Layer...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center"><ShieldAlert className="mr-2 text-yellow-600"/> Trust Layer: Planner Review</h2>
          <p className="text-gray-500 text-sm mt-1">Review and approve AI schedule linkages before they update the master schedule.</p>
        </div>
        <button onClick={fetchReviews} className="text-sm text-blue-600 hover:underline">Refresh Data</button>
      </div>

      {matches.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border text-center text-gray-500">
          No events pending review.
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className={`bg-white rounded-lg border shadow-sm overflow-hidden ${match.status === 'Auto-Linked' ? 'border-green-200' : 'border-yellow-200'}`}>
              <div className={`px-6 py-3 border-b flex justify-between items-center ${
                match.status === 'Auto-Linked' ? 'bg-green-50' : 
                match.status === 'Approved' ? 'bg-blue-50' :
                match.status === 'Rejected' ? 'bg-red-50' : 'bg-yellow-50'
              }`}>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm">Match ID: {match.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    match.status === 'Auto-Linked' ? 'bg-green-200 text-green-800' : 
                    match.status === 'Approved' ? 'bg-blue-200 text-blue-800' :
                    match.status === 'Rejected' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {match.status}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Confidence Score:</span>
                  <span className={`text-sm font-bold ${match.confidence_score >= 0.9 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {(match.confidence_score * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
                {/* Field Event */}
                <div className="flex-1 w-full bg-gray-50 p-4 rounded-md border">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Extracted from Field</h4>
                  <p className="font-medium text-lg">{match.extracted_event.description}</p>
                  <div className="mt-3 flex gap-2 text-xs text-gray-600">
                    {match.extracted_event.discipline && <span className="bg-gray-200 px-2 py-1 rounded">{match.extracted_event.discipline}</span>}
                    {match.extracted_event.location && <span className="bg-gray-200 px-2 py-1 rounded">{match.extracted_event.location}</span>}
                    {match.extracted_event.status && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{match.extracted_event.status}</span>}
                  </div>
                </div>

                <div className="text-gray-400">
                  <ArrowRight size={24} />
                </div>

                {/* Schedule Activity */}
                <div className="flex-1 w-full bg-blue-50 p-4 rounded-md border border-blue-100">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Proposed Schedule Link</h4>
                  {match.schedule_activity ? (
                    <>
                      <p className="font-medium text-lg">[{match.schedule_activity.activity_id}] {match.schedule_activity.name}</p>
                      <div className="mt-3 flex gap-2 text-xs text-blue-800">
                        <span className="bg-blue-100 px-2 py-1 rounded">{match.schedule_activity.discipline}</span>
                        <span className="bg-blue-100 px-2 py-1 rounded">{match.schedule_activity.location}</span>
                        <span className="bg-blue-100 px-2 py-1 rounded">Current Progress: {match.schedule_activity.progress_percent}%</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 italic">No strong match found.</p>
                  )}
                </div>
              </div>

              {match.status === 'Pending Review' && (
                <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
                  <button 
                    onClick={() => handleAction(match.id, 'Reject')}
                    disabled={processingId === match.id}
                    className="px-4 py-2 bg-white border border-red-300 text-red-600 hover:bg-red-50 font-medium rounded-md text-sm flex items-center"
                  >
                    <X size={16} className="mr-1" /> Reject Link
                  </button>
                  <button 
                    onClick={() => handleAction(match.id, 'Approve')}
                    disabled={processingId === match.id}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-md text-sm shadow-sm flex items-center"
                  >
                    <Check size={16} className="mr-1" /> Approve & Update Schedule
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

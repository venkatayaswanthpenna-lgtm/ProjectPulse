import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Activity, Clock, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const [activities, setActivities] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [actRes, anaRes] = await Promise.all([
        axios.get(`${apiUrl}/projects/1/activities`),
        axios.get(`${apiUrl}/analytics`)
      ]);
      setActivities(actRes.data);
      setAnalytics(anaRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12">Loading Dashboard...</div>;

  const chartData = activities.map(a => ({
    name: a.activity_id,
    progress: a.progress_percent,
    status: a.status
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Project Overview: Metro Line Extension</h2>
        <button onClick={fetchDashboardData} className="text-sm text-blue-600 hover:underline">Refresh</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><Activity size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Processed Events</p>
            <p className="text-2xl font-bold">{analytics?.total_events || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full"><CheckCircle size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">AI Auto-Link Accuracy</p>
            <p className="text-2xl font-bold">{analytics?.accuracy_percent || 0}%</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full"><Clock size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Reconciliation Time Saved</p>
            <p className="text-2xl font-bold">{analytics?.time_saved_minutes || 0} mins</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-4 text-lg">Schedule Progress (Actual vs Planned)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip formatter={(value) => [`${value}%`, `Progress`]} />
                <Legend />
                <Bar dataKey="progress" name="Actual Progress (%)" fill="#3b82f6" barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.progress === 100 ? '#10b981' : entry.progress > 0 ? '#3b82f6' : '#e5e7eb'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border overflow-hidden flex flex-col">
          <h3 className="font-semibold mb-4 text-lg">Schedule Activities Log</h3>
          <div className="flex-1 overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activities.map((act) => (
                  <tr key={act.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{act.activity_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{act.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        act.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        act.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {act.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

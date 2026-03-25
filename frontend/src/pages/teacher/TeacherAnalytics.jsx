import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { CardSkeleton } from '../../components/LoadingSkeleton';

const TeacherAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data: res } = await api.get('/analytics/teacher');
        setData(res || {});
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><CardSkeleton /><CardSkeleton /></div>;

  const chartData = data?.assignments?.map((a) => ({ name: a.title?.slice(0, 12) || 'Assignment', submissions: a.totalSubmissions })) || [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Assignment Submissions</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="submissions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
      {(!chartData || chartData.length === 0) && <p className="text-slate-500">No assignment data to display.</p>}
    </div>
  );
};

export default TeacherAnalytics;

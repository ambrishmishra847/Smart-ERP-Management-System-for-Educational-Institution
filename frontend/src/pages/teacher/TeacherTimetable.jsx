import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TeacherTimetable = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const { data } = await api.get('/timetable/teacher');
        setSlots(Array.isArray(data) ? data : []);
      } catch {
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, []);

  const byDay = slots.reduce((acc, s) => {
    const d = s.dayOfWeek;
    if (!acc[d]) acc[d] = [];
    acc[d].push(s);
    return acc;
  }, {});

  if (loading) return <TableSkeleton rows={6} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="py-2 px-3 text-left font-semibold text-slate-700">Slot</th>
              {DAYS.map((d, i) => (
                <th key={i} className="py-2 px-3 text-left font-semibold text-slate-700">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6].map((slotNum) => (
              <tr key={slotNum} className="border-b border-slate-100">
                <td className="py-2 px-3 font-medium text-slate-600">{slotNum}</td>
                {DAYS.map((_, dayNum) => {
                  const cell = (byDay[dayNum] || []).find((s) => s.slot === slotNum);
                  return (
                    <td key={dayNum} className="py-2 px-3">
                      {cell ? <span className="text-slate-800">{cell.subjectId?.subjectName}</span> : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {slots.length === 0 && <div className="py-12 text-center text-slate-500">No timetable slots.</div>}
    </motion.div>
  );
};

export default TeacherTimetable;

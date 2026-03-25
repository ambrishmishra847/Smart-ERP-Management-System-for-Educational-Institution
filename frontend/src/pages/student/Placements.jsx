import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const Placements = () => {
  const [placements, setPlacements] = useState([]);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('available'); // available | applied
  const [working, setWorking] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, statusRes] = await Promise.all([api.get('/placements'), api.get('/placements/student/status')]);
      const pArr = Array.isArray(pRes.data) ? pRes.data : [];
      setPlacements(pArr);
      const ids = Array.isArray(statusRes.data?.appliedPlacementIds) ? statusRes.data.appliedPlacementIds : [];
      setAppliedIds(new Set(ids.map(String)));
    } catch {
      setPlacements([]);
      setAppliedIds(new Set());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const now = Date.now();

  const normalized = useMemo(() => {
    return placements
      .map((p) => ({ ...p, _deadlineTs: new Date(p.deadline).getTime() }))
      .sort((a, b) => a._deadlineTs - b._deadlineTs);
  }, [placements]);

  const available = useMemo(() => normalized.filter((p) => !appliedIds.has(String(p._id))), [normalized, appliedIds]);
  const applied = useMemo(() => normalized.filter((p) => appliedIds.has(String(p._id))), [normalized, appliedIds]);

  const list = tab === 'applied' ? applied : available;

  const markApplied = async (id) => {
    setWorking(true);
    try {
      await api.post(`/placements/${id}/applied`);
      setAppliedIds((prev) => new Set([...prev, String(id)]));
      setTab('applied');
    } catch {
      // ignore
    } finally {
      setWorking(false);
    }
  };

  const deadlineBadge = (p) => {
    const diff = p._deadlineTs - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: 'Closed', cls: 'bg-slate-100 text-slate-600 border-slate-200' };
    if (days <= 2) return { label: `Due in ${days}d`, cls: 'bg-rose-50 text-rose-700 border-rose-200' };
    if (days <= 7) return { label: `Due in ${days}d`, cls: 'bg-amber-50 text-amber-800 border-amber-200' };
    return { label: `Due in ${days}d`, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Placement</h1>
          <p className="text-sm text-slate-500">Track drives and mark applications to avoid duplicates.</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTab('available')}
          className={[
            'px-4 py-2 rounded-xl text-sm font-medium border transition',
            tab === 'available' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50',
          ].join(' ')}
        >
          Available ({available.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('applied')}
          className={[
            'px-4 py-2 rounded-xl text-sm font-medium border transition',
            tab === 'applied' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50',
          ].join(' ')}
        >
          Applied ({applied.length})
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading placement drives...</div>
        ) : list.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            {tab === 'applied' ? 'You have not marked any applications yet.' : 'No available drives right now.'}
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {list.map((p) => {
              const badge = deadlineBadge(p);
              return (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-slate-800">{p.companyName}</div>
                      <div className="text-sm text-slate-600">{p.role}</div>
                    </div>
                    <span className={['text-xs font-medium px-2.5 py-1 rounded-full border', badge.cls].join(' ')}>
                      {badge.label}
                    </span>
                  </div>

                  {p.eligibilityCriteria && (
                    <div className="mt-3 text-sm">
                      <span className="text-slate-500">Eligibility:</span>{' '}
                      <span className="text-slate-700">{p.eligibilityCriteria}</span>
                    </div>
                  )}
                  {p.description && <p className="mt-3 text-sm text-slate-600 line-clamp-4">{p.description}</p>}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <a
                      href={p.registrationLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium"
                    >
                      Register
                    </a>
                    {appliedIds.has(String(p._id)) ? (
                      <span className="text-sm font-medium text-emerald-700">Applied</span>
                    ) : (
                      <button
                        type="button"
                        disabled={working || p._deadlineTs < now}
                        onClick={() => markApplied(p._id)}
                        className="px-3 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 text-sm font-medium"
                      >
                        I Have Applied
                      </button>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-slate-500">Deadline: {new Date(p.deadline).toLocaleString()}</div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Placements;


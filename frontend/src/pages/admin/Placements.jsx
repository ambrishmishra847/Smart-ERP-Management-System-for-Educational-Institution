import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const emptyForm = {
  companyName: '',
  role: '',
  description: '',
  eligibilityCriteria: '',
  registrationLink: '',
  deadline: '',
};

const Placements = () => {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/placements');
      setPlacements(Array.isArray(data) ? data : []);
    } catch {
      setPlacements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const upcomingCount = useMemo(() => {
    const now = Date.now();
    return placements.filter((p) => new Date(p.deadline).getTime() >= now).length;
  }, [placements]);

  const createPlacement = async (e) => {
    e.preventDefault();
    if (!form.companyName || !form.role || !form.registrationLink || !form.deadline) return;
    setSaving(true);
    try {
      await api.post('/placements', form);
      setForm(emptyForm);
      await fetchAll();
    } catch {
      // keep UI usable
    } finally {
      setSaving(false);
    }
  };

  const deletePlacement = async (id) => {
    setSaving(true);
    try {
      await api.delete(`/placements/${id}`);
      await fetchAll();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Placement Drives</h1>
          <p className="text-sm text-slate-500">{upcomingCount} upcoming drives</p>
        </div>
      </div>

      <motion.form
        onSubmit={createPlacement}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-base font-semibold text-slate-800 mb-4">Add placement drive</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600">Company Name</label>
            <input
              value={form.companyName}
              onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300"
              placeholder="Acme Corp"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Role</label>
            <input
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300"
              placeholder="Software Engineer Intern"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-600">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 min-h-[88px]"
              placeholder="What the drive is about, package info, hiring flow..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-600">Eligibility</label>
            <input
              value={form.eligibilityCriteria}
              onChange={(e) => setForm((f) => ({ ...f, eligibilityCriteria: e.target.value }))}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300"
              placeholder="CGPA >= 7.0, 2026 batch, CS/IT..."
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Registration Link</label>
            <input
              value={form.registrationLink}
              onChange={(e) => setForm((f) => ({ ...f, registrationLink: e.target.value }))}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300"
              placeholder="https://..."
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Deadline</label>
            <input
              type="datetime-local"
              value={form.deadline}
              onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300"
              required
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => setForm(emptyForm)}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Publish drive'}
          </button>
        </div>
      </motion.form>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">All drives</h2>
          <button
            type="button"
            onClick={fetchAll}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading placement drives...</div>
        ) : placements.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No placement drives yet.</div>
        ) : (
          <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {placements.map((p) => {
              const deadline = new Date(p.deadline);
              const isPast = deadline.getTime() < Date.now();
              return (
                <div key={p._id} className="rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-slate-800">{p.companyName}</div>
                      <div className="text-sm text-slate-600">{p.role}</div>
                    </div>
                    <span
                      className={[
                        'text-xs font-medium px-2.5 py-1 rounded-full border',
                        isPast ? 'border-slate-200 text-slate-500 bg-slate-50' : 'border-amber-200 text-amber-800 bg-amber-50',
                      ].join(' ')}
                    >
                      {isPast ? 'Closed' : 'Deadline'}
                      {!isPast ? `: ${deadline.toLocaleString()}` : ''}
                    </span>
                  </div>

                  {p.eligibilityCriteria && (
                    <div className="mt-3 text-sm">
                      <span className="text-slate-500">Eligibility:</span>{' '}
                      <span className="text-slate-700">{p.eligibilityCriteria}</span>
                    </div>
                  )}
                  {p.description && <p className="mt-3 text-sm text-slate-600">{p.description}</p>}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <a
                      href={p.registrationLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-primary-700 hover:text-primary-800"
                    >
                      Open registration link
                    </a>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => deletePlacement(p._id)}
                      className="px-3 py-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Placements;


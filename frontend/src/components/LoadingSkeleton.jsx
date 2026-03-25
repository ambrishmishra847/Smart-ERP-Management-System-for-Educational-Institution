import React from 'react';

export const CardSkeleton = () => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse">
    <div className="h-4 w-24 bg-slate-200 rounded mb-3" />
    <div className="h-8 w-16 bg-slate-200 rounded" />
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden animate-pulse">
    <div className="h-12 bg-slate-100 border-b border-slate-200" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-14 border-b border-slate-100 flex gap-4 px-4 items-center">
        <div className="h-4 flex-1 bg-slate-200 rounded" />
        <div className="h-4 w-24 bg-slate-200 rounded" />
        <div className="h-4 w-20 bg-slate-200 rounded" />
      </div>
    ))}
  </div>
);

export default CardSkeleton;

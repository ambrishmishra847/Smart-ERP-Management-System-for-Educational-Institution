import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  const icons = {
    success: <FiCheckCircle className="text-green-500 text-xl flex-shrink-0" />,
    error: <FiAlertCircle className="text-red-500 text-xl flex-shrink-0" />,
    info: <FiAlertCircle className="text-blue-500 text-xl flex-shrink-0" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -10 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-white border border-slate-200 min-w-[280px] max-w-md"
    >
      {icons[type]}
      <p className="text-slate-700 text-sm font-medium flex-1">{message}</p>
      <button type="button" onClick={onClose} className="p-1 rounded hover:bg-slate-100 text-slate-500">
        <FiX className="w-5 h-5" />
      </button>
    </motion.div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => (
  <AnimatePresence>
    {toasts.map((t) => (
      <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
    ))}
  </AnimatePresence>
);

export default Toast;

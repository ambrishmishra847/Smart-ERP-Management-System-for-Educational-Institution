import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useToast } from '../context/ToastContext';
import { getUser } from '../services/auth';

const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Connect to Socket.io and listen for real-time events.
 * Shows toasts for new_assignment, new_announcement, graded, new_study_material.
 */
export const useSocket = () => {
  const socketRef = useRef(null);
  const user = getUser();
  const { addToast } = useToast();

  useEffect(() => {
    if (!user?.id) return;
    const socket = io(socketUrl, {
      path: '/socket.io',
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;
    socket.emit('join', { userId: user.id, role: user.role });

    socket.on('new_assignment', (data) => {
      addToast(data?.assignment?.title ? `New assignment: ${data.assignment.title}` : 'New assignment posted', 'info');
      window.dispatchEvent(new CustomEvent('rt-notification', { detail: { type: 'assignment', data } }));
    });
    socket.on('new_announcement', (data) => {
      addToast(data?.notice?.title ? `New announcement: ${data.notice.title}` : 'New announcement', 'info');
      window.dispatchEvent(new CustomEvent('rt-notification', { detail: { type: 'announcement', data } }));
    });
    socket.on('assignment_graded', (data) => {
      addToast('An assignment has been graded', 'success');
      window.dispatchEvent(new CustomEvent('rt-notification', { detail: { type: 'graded', data } }));
    });
    socket.on('new_study_material', (data) => {
      addToast(data?.material?.title ? `New material: ${data.material.title}` : 'New study material', 'info');
      window.dispatchEvent(new CustomEvent('rt-notification', { detail: { type: 'study_material', data } }));
    });
    socket.on('newPlacement', (data) => {
      addToast(data?.companyName ? `New placement drive: ${data.companyName}` : 'New placement drive posted', 'info');
      window.dispatchEvent(new CustomEvent('rt-notification', { detail: { type: 'placement', data } }));
    });
    socket.on('notification', (data) => {
      window.dispatchEvent(new CustomEvent('rt-notification', { detail: { type: 'notification', data } }));
    });

    return () => {
      socket
        .off('new_assignment')
        .off('new_announcement')
        .off('assignment_graded')
        .off('new_study_material')
        .off('newPlacement')
        .off('notification');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id, addToast]);

  return socketRef.current;
};

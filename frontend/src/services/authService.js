import api from './api';

export const login = async (email, password, role) => {
  const { data } = await api.post('/auth/login', { email, password, role });
  return data;
};

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const logout = async () => {
  await api.post('/auth/logout');
};

export const getUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setAuthUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const logout = () => {
  localStorage.removeItem('user');
};


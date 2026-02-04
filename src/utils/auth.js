// Utilidades de autenticación

export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const setAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAdmin = () => {
  const user = getUser();
  return user && user.role === 'admin';
};

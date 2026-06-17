export const saveAuth = (token, user) => {
  if (token) {
    localStorage.setItem('token', token);
  }
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

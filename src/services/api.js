// Central API service — all backend calls go through here
// Dev: React dev server proxies /api/* to http://localhost:5000 via package.json "proxy"
// Prod: set REACT_APP_API_URL to the deployed backend's base URL (e.g. https://api.houseofmoo.shop/api) before building

const BASE = process.env.REACT_APP_API_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

const getToken  = ()      => sessionStorage.getItem('moo_admin_token');
const setToken  = (t)     => sessionStorage.setItem('moo_admin_token', t);
const clearToken = ()     => sessionStorage.removeItem('moo_admin_token');
const authHeader = ()     => ({ Authorization: `Bearer ${getToken()}` });

const getRole   = ()      => sessionStorage.getItem('moo_admin_role');
const setRole   = (r)     => sessionStorage.setItem('moo_admin_role', r);
const clearRole = ()      => sessionStorage.removeItem('moo_admin_role');

export const authAPI = {
  login:  (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  verify: ()                => request('/auth/verify', { method: 'POST', headers: authHeader() }),
  createStaff: (data)       => request('/auth/staff',  { method: 'POST', headers: authHeader(), body: JSON.stringify(data) }),
  getStaff:    ()           => request('/auth/staff',  { headers: authHeader() }),
  removeStaff: (id)         => request(`/auth/staff/${id}`, { method: 'DELETE', headers: authHeader() }),
};

export const productsAPI = {
  getAll:  (params = {}) => request('/products?' + new URLSearchParams(params).toString()),
  getOne:  (id)          => request(`/products/${id}`),
  create:  (data)        => request('/products',      { method: 'POST',   headers: authHeader(), body: JSON.stringify(data) }),
  update:  (id, data)    => request(`/products/${id}`, { method: 'PUT',   headers: authHeader(), body: JSON.stringify(data) }),
  remove:  (id)          => request(`/products/${id}`, { method: 'DELETE', headers: authHeader() }),
  restock: (id, quantity)=> request(`/products/${id}/restock`, { method: 'POST', headers: authHeader(), body: JSON.stringify({ quantity }) }),
  restockLog: ()         => request('/products/restock-log/all', { headers: authHeader() }),
};

export const salesAPI = {
  record:  (data)        => request('/sales', { method: 'POST', headers: authHeader(), body: JSON.stringify(data) }),
  getAll:  (params = {}) => request('/sales?' + new URLSearchParams(params).toString(), { headers: authHeader() }),
  getStats:()            => request('/sales/stats', { headers: authHeader() }),
};

export const bookingsAPI = {
  create:    (data)       => request('/bookings',             { method: 'POST', body: JSON.stringify(data) }),
  getAll:    (params = {}) => request('/bookings?' + new URLSearchParams(params).toString(), { headers: authHeader() }),
  getStats:  ()           => request('/bookings/stats',       { headers: authHeader() }),
  setStatus: (id, status) => request(`/bookings/${id}/status`, { method: 'PUT', headers: authHeader(), body: JSON.stringify({ status }) }),
};

export const ordersAPI = {
  create:    (data)       => request('/orders',               { method: 'POST', body: JSON.stringify(data) }),
  getAll:    (params = {}) => request('/orders?' + new URLSearchParams(params).toString(), { headers: authHeader() }),
  getStats:  ()           => request('/orders/stats',         { headers: authHeader() }),
  getOne:    (ref)        => request(`/orders/${ref}`,        { headers: authHeader() }),
  setStatus: (ref, status)=> request(`/orders/${ref}/status`, { method: 'PUT', headers: authHeader(), body: JSON.stringify({ status }) }),
};

export const paystackAPI = {
  initialize: (email, amount, reference, metadata) =>
    request('/paystack/initialize', { method: 'POST', body: JSON.stringify({ email, amount, reference, metadata }) }),
  verify: (reference) => request(`/paystack/verify/${reference}`, { method: 'POST' }),
};

export const uploadAPI = {
  image: (file) => {
    const form = new FormData();
    form.append('image', file);
    return fetch(BASE + '/upload', { method: 'POST', headers: authHeader(), body: form }).then(r => r.json());
  },
};

export { getToken, setToken, clearToken, getRole, setRole, clearRole };

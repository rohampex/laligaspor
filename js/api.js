window.LLapi = {
  async request(path, options = {}) {
    const headers = {
      Accept: 'application/json',
      ...(options.headers || {})
    };
    if (options.method && options.method.toUpperCase() !== 'GET' && options.csrf !== false) {
      headers['X-CSRF-TOKEN'] = await getCsrfToken();
    }
    const opts = {
      credentials: 'same-origin',
      ...options,
      headers
    };
    const response = await fetch(path, opts);
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.error || 'API request failed');
    }
    return json;
  },
  async get(path, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(query ? `${path}?${query}` : path, { method: 'GET' });
  },
  async post(path, body = {}, csrf = true) {
    return this.request(path, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
      csrf
    });
  },
  async postForm(path, formData) {
    return this.request(path, {
      method: 'POST',
      body: formData
    });
  }
};
async function getCsrfToken() {
  if (window.__csrfToken) return window.__csrfToken;
  const res = await LLapi.get('/api/auth/csrf.php');
  window.__csrfToken = res.data.csrfToken;
  return window.__csrfToken;
}

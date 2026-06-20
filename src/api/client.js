const BASE_URL = '/api';

async function request(path, options = {}) {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers
        }
    });

    if (response.status === 401) {
        const refreshed = await tryRefresh();
        if (refreshed) return reuqest(path, options);

        window.location.href = '/login';
        return;
    }

    return response;
}

async function tryRefresh() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    const response = await fetch(`${BASE_URL}/auth/refresh`, {
        methos: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
    });
    
    if (!response.ok)
    {
        localStorage.clear();
        return false;
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return true;
}

export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
    delete: (path) => request(path, { method: 'DELETE' })
}
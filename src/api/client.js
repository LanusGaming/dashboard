const BASE_URL = '/api'
let accessToken = null

export function setAccessToken(token) {
    accessToken = token
}

async function request(path, options = {}) {

    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
            ...options.headers
        }
    })

    if (response.status === 401 && path !== '/auth/login') {
        const refreshed = await tryRefresh()
        if (refreshed) return request(path, options)
        
        if (window.location.pathname !== '/login')
            window.location.href = '/login'
    }

    return response
}

async function tryRefresh() {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST'
    })
    
    if (!response.ok) return false

    const data = await response.json()
    setAccessToken(data.accessToken)
    return true
}

export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
    delete: (path) => request(path, { method: 'DELETE' })
}
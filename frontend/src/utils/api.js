const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

export async function fetchApi(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        credentials: 'include' // crucial for sending HttpOnly cookies cross-origin
    });

    if (!response.ok) {
        let errorMsg = 'An error occurred';
        try {
            const errorData = await response.json();
            if (errorData.detail) {
                if (typeof errorData.detail === 'string') {
                    errorMsg = errorData.detail;
                } else if (Array.isArray(errorData.detail)) {
                    errorMsg = errorData.detail.map(e => e.msg).join(', ');
                } else if (typeof errorData.detail === 'object') {
                    errorMsg = errorData.detail.message || JSON.stringify(errorData.detail);
                } else {
                    errorMsg = String(errorData.detail);
                }
            }
        } catch { /* empty */ }
        throw new Error(errorMsg);
    }

    // Handle No Content (204) or empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : {};
}

// User methods
export const registerUser = (data) => fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const loginUser = (data) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(data) });
export const logoutUser = () => fetchApi('/auth/logout', { method: 'POST' });
export const getCurrentUser = () => fetchApi('/auth/me', { method: 'GET' });
export const changeLoginPassword = (data) => fetchApi('/auth/login-password', { method: 'PUT', body: JSON.stringify(data) });
export const changeMasterPassword = (data) => fetchApi('/auth/master-password', { method: 'PUT', body: JSON.stringify(data) });

// File methods
export const getFiles = () => fetchApi('/files/', { method: 'GET' });
export const getFileMetadata = (id) => fetchApi(`/files/${id}`, { method: 'GET' });
export const deleteFile = (id) => fetchApi(`/files/${id}`, { method: 'DELETE' });

// Upload is special because it uses FormData
export async function uploadFile(formData) {
    const url = `${API_BASE}/files/upload`;
    const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
    }
    return response.json();
}

// Download also special because it returns raw bytes (blob)
export async function fetchFileBlob(fileId) {
    const url = `${API_BASE}/files/${fileId}/download`;
    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error('Download failed');
    }
    return response.blob(); // Get as ArrayBuffer via blob
}

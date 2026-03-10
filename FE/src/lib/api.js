// API Configuration
const API_BASE_URL = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:5000/api';
const API_TIMEOUT = 60000; // 60 seconds timeout for TiDB Cloud latency during startup

// Custom error class for network errors
export class NetworkError extends Error {
    constructor(message, originalError = null) {
        super(message);
        this.name = 'NetworkError';
        this.isNetworkError = true;
        this.originalError = originalError;
    }
}

// Custom error class for API errors (4xx, 5xx)
export class ApiError extends Error {
    constructor(message, status, data = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

// Helper function for API calls with timeout and better error handling
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    // Add auth token if exists
    const token = localStorage.getItem('authToken');
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const response = await fetch(url, {
            ...config,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            throw new ApiError(
                data?.message || data || `Error ${response.status}`,
                response.status,
                data
            );
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId);

        // Handle abort/timeout
        if (error.name === 'AbortError') {
            throw new NetworkError('Hết thời gian kết nối. Vui lòng thử lại.');
        }

        // Handle network errors (no connection, DNS failure, etc.)
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new NetworkError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc server.');
        }

        // Re-throw API errors as-is
        if (error instanceof ApiError) {
            throw error;
        }

        // Wrap other errors
        console.error('API Error:', error);
        throw error;
    }
}


// ========== AUTH API ==========
export const authApi = {
    register: async (userData) => {
        return apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    login: async (credentials) => {
        return apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    },

    checkEmail: async (email) => {
        return apiCall(`/auth/check-email?email=${encodeURIComponent(email)}`);
    },

    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    saveAuthData: (data) => {
        if (data.token) {
            localStorage.setItem('authToken', data.token);
        }
        if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
        }
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('authToken');
    },

    getToken: () => {
    },

    forgotPassword: async (email) => {
        return apiCall('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    resetPassword: async (data) => {
        return apiCall('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};

// ========== HEALTH REPORT API ==========
export const healthReportApi = {
    // Get all reports (admin)
    getAll: async () => {
        return apiCall('/healthreport');
    },

    // Get my family's reports (family)
    getMy: async () => {
        return apiCall('/healthreport/my');
    },

    // Get reports by patient
    getByPatient: async (patientId) => {
        return apiCall(`/healthreport/patient/${patientId}`);
    },

    // Get single report
    getById: async (id) => {
        return apiCall(`/healthreport/${id}`);
    },

    // Create report (caregiver/admin)
    create: async (data) => {
        return apiCall('/healthreport', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Update report
    update: async (id, data) => {
        return apiCall(`/healthreport/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // Delete report
    delete: async (id) => {
        return apiCall(`/healthreport/${id}`, {
            method: 'DELETE',
        });
    },
};

// ========== SERVICE PACKAGES API ==========
export const serviceApi = {
    // Get all service packages (public)
    getAll: async (activeOnly = true) => {
        return apiCall(`/service?activeOnly=${activeOnly}`);
    },

    // Get single service package
    getById: async (id) => {
        return apiCall(`/service/${id}`);
    },

    // Create (Admin only)
    create: async (data) => {
        return apiCall('/service', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Update (Admin only)
    update: async (id, data) => {
        return apiCall(`/service/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // Delete (Admin only)
    delete: async (id) => {
        return apiCall(`/service/${id}`, {
            method: 'DELETE',
        });
    },
};

// ========== CAREGIVER API ==========
export const caregiverApi = {
    // Get all caregivers (public)
    getAll: async (available = null) => {
        const query = available !== null ? `?available=${available}` : '';
        return apiCall(`/caregiver${query}`);
    },

    // Get single caregiver
    getById: async (id) => {
        return apiCall(`/caregiver/${id}`);
    },

    // Get own profile (caregiver)
    getProfile: async () => {
        return apiCall('/caregiver/profile');
    },

    // Update own profile (caregiver)
    updateProfile: async (data) => {
        return apiCall('/caregiver/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // Get own schedules (caregiver)
    getSchedules: async (from = null, to = null) => {
        let query = '';
        if (from) query += `from=${from}&`;
        if (to) query += `to=${to}`;
        return apiCall(`/caregiver/schedules${query ? '?' + query : ''}`);
    },

    // Check-in (caregiver)
    checkIn: async (scheduleId) => {
        return apiCall(`/schedule/${scheduleId}/checkin`, {
            method: 'POST',
        });
    },

    // Check-out (caregiver)
    checkOut: async (scheduleId, notes = '') => {
        return apiCall(`/schedule/${scheduleId}/checkout`, {
            method: 'POST',
            body: JSON.stringify({ notes }),
        });
    },

    // Get patient details (caregiver)
    getPatient: async (patientId) => {
        return apiCall(`/caregiver/patients/${patientId}`);
    },

    // Matching Engine (Admin/OperationAdmin)
    matchRequest: async (requestId) => {
        return apiCall(`/caregiver/match-request/${requestId}`);
    },
};

// ========== FAMILY API ==========
export const familyApi = {
    // Get profile
    getProfile: async () => {
        return apiCall('/family/profile');
    },

    // Update profile
    updateProfile: async (data) => {
        return apiCall('/family/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // Get patients
    getPatients: async () => {
        return apiCall('/family/patients');
    },

    // Get single patient
    getPatient: async (patientId) => {
        return apiCall(`/family/patients/${patientId}`);
    },

    // Add patient
    addPatient: async (data) => {
        return apiCall('/family/patients', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Update patient
    updatePatient: async (patientId, data) => {
        return apiCall(`/family/patients/${patientId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // Delete patient
    deletePatient: async (patientId) => {
        return apiCall(`/family/patients/${patientId}`, {
            method: 'DELETE',
        });
    },
};

// ========== ADMIN API ==========
export const adminApi = {
    // Get dashboard stats
    getDashboardStats: async () => {
        return apiCall('/admin/dashboard');
    },

    // Get recent activities
    getRecentActivities: async (count = 10) => {
        return apiCall(`/admin/activities?count=${count}`);
    },

    // Get pending requests
    getPendingRequests: async () => {
        return apiCall('/admin/pending-requests');
    },

    // Get all patients
    getPatients: async () => {
        return apiCall('/admin/patients');
    },
    // Create patient
    createPatient: async (data) => {
        return apiCall('/admin/patients', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Get all caregivers
    getCaregivers: async () => {
        return apiCall('/admin/caregivers');
    },

    // Get all schedules
    getSchedules: async (from = null, to = null) => {
        let query = '';
        if (from) query += `from=${from}&`;
        if (to) query += `to=${to}`;
        return apiCall(`/admin/schedules${query ? '?' + query : ''}`);
    },

    // Get all users
    getUsers: async (role = null) => {
        const query = role ? `?role=${role}` : '';
        return apiCall(`/admin/users${query}`);
    },

    // Get single user
    getUser: async (userId) => {
        return apiCall(`/admin/users/${userId}`);
    },

    // Toggle user status
    toggleUserStatus: async (userId, isActive) => {
        return apiCall(`/admin/users/${userId}/status`, {
            method: 'PATCH',
            body: JSON.stringify(isActive),
        });
    },

    // Create a new caregiver
    createCaregiver: async (data) => {
        return apiCall('/admin/caregivers', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Update a caregiver
    updateCaregiver: async (caregiverId, data) => {
        return apiCall(`/admin/caregivers/${caregiverId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // Delete (deactivate) a caregiver
    deleteCaregiver: async (caregiverId) => {
        return apiCall(`/admin/caregivers/${caregiverId}`, {
            method: 'DELETE',
        });
    },
};

// ========== PAYMENT API ==========
export const paymentApi = {
    // Get all payments (admin)
    getAll: async (status = null) => {
        const query = status ? `?status=${status}` : '';
        return apiCall(`/payment${query}`);
    },

    // Get family's payments
    getMyPayments: async () => {
        return apiCall('/payment/my');
    },

    // Get single payment
    getById: async (paymentId) => {
        return apiCall(`/payment/${paymentId}`);
    },

    // Create payment
    create: async (data) => {
        return apiCall('/payment', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Get VNPay URL
    getVnPayUrl: async (paymentId) => {
        return apiCall(`/payment/${paymentId}/vnpay-url`, {
            method: 'POST',
        });
    },
};

// ========== CONTRACT API ==========
export const contractApi = {
    // Get all contracts (admin)
    getAll: async () => {
        return apiCall('/contract');
    },

    // Get family's contracts
    getMyContracts: async () => {
        return apiCall('/contract/my-contracts');
    },

    // Get single contract
    getById: async (id) => {
        return apiCall(`/contract/${id}`);
    },

    // Create contract
    create: async (data) => {
        return apiCall('/contract', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Update status (admin)
    updateStatus: async (id, status) => {
        return apiCall(`/contract/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    },
};

// ========== SCHEDULE API ==========
export const scheduleApi = {
    // Get all schedules (admin)
    getAll: async (from = null, to = null) => {
        let query = '';
        if (from) query += `from=${from}&`;
        if (to) query += `to=${to}`;
        return apiCall(`/schedule${query ? '?' + query : ''}`);
    },

    // Get schedules by caregiver
    getByCaregiver: async (caregiverId, from = null, to = null) => {
        let query = '';
        if (from) query += `from=${from}&`;
        if (to) query += `to=${to}`;
        return apiCall(`/schedule/caregiver/${caregiverId}${query ? '?' + query : ''}`);
    },

    // Get schedules by patient
    getByPatient: async (patientId, from = null, to = null) => {
        let query = '';
        if (from) query += `from=${from}&`;
        if (to) query += `to=${to}`;
        return apiCall(`/schedule/patient/${patientId}${query ? '?' + query : ''}`);
    },

    // Get single schedule
    getById: async (id) => {
        return apiCall(`/schedule/${id}`);
    },

    // Create schedule (admin)
    create: async (data) => {
        return apiCall('/schedule', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Update schedule (admin)
    update: async (id, data) => {
        return apiCall(`/schedule/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // Delete schedule (admin)
    delete: async (id) => {
        return apiCall(`/schedule/${id}`, {
            method: 'DELETE',
        });
    },

    // Check conflict
    checkConflict: async (data) => {
        return apiCall('/schedule/check-conflict', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Generate from contract (admin)
    generateFromContract: async (contractId) => {
        return apiCall(`/schedule/generate/${contractId}`, {
            method: 'POST',
        });
    },

    // Check conflict for a care request (admin)
    checkRequestConflict: async (requestId, caregiverId) => {
        return apiCall(`/schedule/check-request-conflict/${requestId}/${caregiverId}`);
    },

    // Assign caregiver from request (OperationAdmin)
    assignFromRequest: async (requestId, caregiverId) => {
        return apiCall('/schedule/assign-from-request', {
            method: 'POST',
            body: JSON.stringify({ requestId, caregiverId }),
        });
    },

    // Get today's schedule for patient
    getTodayByPatient: async (patientId) => {
        return apiCall(`/schedule/patient/${patientId}/today`);
    },

    // Get today's schedule for caregiver
    getTodayByCaregiver: async (caregiverId) => {
        return apiCall(`/schedule/caregiver/${caregiverId}/today`);
    },
};

// ========== FEEDBACK API ==========
export const feedbackApi = {
    // Get feedback by caregiver
    getByCaregiver: async (caregiverId) => {
        return apiCall(`/feedback/caregiver/${caregiverId}`);
    },

    // Get caregiver rating
    getCaregiverRating: async (caregiverId) => {
        return apiCall(`/feedback/caregiver/${caregiverId}/rating`);
    },

    // Get my feedbacks (family)
    getMyFeedbacks: async () => {
        return apiCall('/feedback/my');
    },

    // Create feedback (family)
    create: async (data) => {
        return apiCall('/feedback', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};

// ========== CARE LOG API ==========
export const careLogApi = {
    // Get all care logs (admin)
    getAll: async () => {
        return apiCall('/carelog');
    },

    // Get care logs by schedule
    getBySchedule: async (scheduleId) => {
        return apiCall(`/carelog/schedule/${scheduleId}`);
    },

    // Get care logs by caregiver
    getByCaregiver: async (caregiverId, from = null, to = null) => {
        let query = '';
        if (from) query += `from=${from}&`;
        if (to) query += `to=${to}`;
        return apiCall(`/carelog/caregiver/${caregiverId}${query ? '?' + query : ''}`);
    },

    // Get my care logs (caregiver)
    getMy: async (from = null, to = null) => {
        let query = '';
        if (from) query += `from=${from}&`;
        if (to) query += `to=${to}`;
        return apiCall(`/carelog/my${query ? '?' + query : ''}`);
    },

    // Get care logs by patient
    getByPatient: async (patientId, from = null, to = null) => {
        let query = '';
        if (from) query += `from=${from}&`;
        if (to) query += `to=${to}`;
        return apiCall(`/carelog/patient/${patientId}${query ? '?' + query : ''}`);
    },

    // Get single care log
    getById: async (id) => {
        return apiCall(`/carelog/${id}`);
    },

    // Create care log
    create: async (data) => {
        return apiCall('/carelog', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Update care log
    update: async (id, data) => {
        return apiCall(`/carelog/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // Delete care log (admin)
    delete: async (id) => {
        return apiCall(`/carelog/${id}`, {
            method: 'DELETE',
        });
    },
};

// ========== INCIDENT API ==========
export const incidentApi = {
    // Get all incidents (admin)
    getAll: async () => {
        return apiCall('/incident');
    },

    // Get incidents by caregiver
    getByCaregiver: async (caregiverId) => {
        return apiCall(`/incident/caregiver/${caregiverId}`);
    },

    // Get my incidents (caregiver)
    getMy: async () => {
        return apiCall('/incident/my');
    },

    // Get incidents by patient
    getByPatient: async (patientId) => {
        return apiCall(`/incident/patient/${patientId}`);
    },

    // Get single incident
    getById: async (id) => {
        return apiCall(`/incident/${id}`);
    },

    // Create incident (caregiver)
    create: async (data) => {
        return apiCall('/incident', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Update incident status (admin)
    updateStatus: async (id, data) => {
        return apiCall(`/incident/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // Delete incident (admin)
    delete: async (id) => {
        return apiCall(`/incident/${id}`, {
            method: 'DELETE',
        });
    },
};

// ========== CARE REQUEST API ==========
export const careRequestApi = {
    // Get all requests (admin)
    getAll: async () => {
        return apiCall('/carerequest');
    },

    // Get my requests (family)
    getMy: async () => {
        return apiCall('/carerequest/my');
    },

    // Get requests by family (admin)
    getByFamily: async (familyId) => {
        return apiCall(`/carerequest/family/${familyId}`);
    },

    // Get single request
    getById: async (id) => {
        return apiCall(`/carerequest/${id}`);
    },

    // Create request (family)
    create: async (data) => {
        return apiCall('/carerequest', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Update request status (admin)
    updateStatus: async (id, data) => {
        return apiCall(`/carerequest/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // Assign caregiver (admin)
    assignCaregiver: async (id, caregiverId) => {
        return apiCall(`/carerequest/${id}/assign`, {
            method: 'PUT',
            body: JSON.stringify({ caregiverId }),
        });
    },

    // Delete request
    delete: async (id) => {
        return apiCall(`/carerequest/${id}`, {
            method: 'DELETE',
        });
    },

    // Refund request (admin)
    refund: async (id, data) => {
        return apiCall(`/carerequest/${id}/refund`, {
            method: 'PUT',
            body: JSON.stringify(data || {}),
        });
    },
};

// ========== NOTIFICATION API ==========
export const notificationApi = {
    getMy: async () => apiCall('/notification'),
    markRead: async (id) => apiCall(`/notification/${id}/read`, { method: 'PUT' }),
    markAllRead: async () => apiCall('/notification/read-all', { method: 'PUT' }),
};

export default apiCall;

// API configuration for different environments
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://kushal-15gt.onrender.com' 
  : 'http://localhost:5000'

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  REQUEST_OTP: `${API_BASE_URL}/api/auth/request-otp`,
  VERIFY_OTP: `${API_BASE_URL}/api/auth/verify-otp`,
  
  // Profile endpoints
  PROFILE: `${API_BASE_URL}/api/profile`,
  CHANGE_PASSWORD: `${API_BASE_URL}/api/account/change-password`,
  NOTIFICATION_PREFERENCES: `${API_BASE_URL}/api/account/notification-preferences`,
  DELETE_ACCOUNT: `${API_BASE_URL}/api/account/delete`,
  
  // Product endpoints
  PRODUCTS: `${API_BASE_URL}/api/products`,
  PRODUCT_DETAILS: (id) => `${API_BASE_URL}/api/products/${id}`,
  PRODUCT_REVIEWS: (id) => `${API_BASE_URL}/api/products/${id}/reviews`,
  
  // Cart endpoints
  CART: `${API_BASE_URL}/api/cart`,
  CART_ADD: `${API_BASE_URL}/api/cart/add`,
  CART_REMOVE: `${API_BASE_URL}/api/cart/remove`,
  CART_UPDATE: `${API_BASE_URL}/api/cart/update`,
  CART_CLEAR: `${API_BASE_URL}/api/cart/clear`,
  
  // Order endpoints
  ORDERS: `${API_BASE_URL}/api/orders`,
  MY_ORDERS: `${API_BASE_URL}/api/my-orders`,
  CHECKOUT: `${API_BASE_URL}/api/checkout`,
  
  // Consultation endpoints
  CONSULTATIONS: `${API_BASE_URL}/api/consultations`,
  CONSULTATION_SLOTS: `${API_BASE_URL}/api/consultations/slots`,
  CONSULTATION_DETAILS: (id) => `${API_BASE_URL}/api/consultations/${id}`,
  
  // Blog endpoints
  BLOGS: `${API_BASE_URL}/api/blogs`,
  BLOG_DETAILS: (id) => `${API_BASE_URL}/api/blogs/${id}`,
  
  // Admin endpoints
  ADMIN_LOGIN: `${API_BASE_URL}/api/admin/login`,
  ADMIN_ANALYTICS: `${API_BASE_URL}/api/admin/analytics/dashboard`,
  ADMIN_USERS: `${API_BASE_URL}/api/users`,
  ADMIN_ORDERS: `${API_BASE_URL}/api/orders`,
  ADMIN_PRODUCTS: `${API_BASE_URL}/api/products`,
  ADMIN_BLOGS: `${API_BASE_URL}/api/blogs`,
  ADMIN_CONSULTATIONS: `${API_BASE_URL}/api/consultations/all`,
  
  // Payment endpoints
  CREATE_PAYMENT_INTENT: `${API_BASE_URL}/api/payment/create-payment-intent`,
  CONFIRM_PAYMENT: `${API_BASE_URL}/api/payment/confirm-payment`,
  PHONEPE_CREATE: `${API_BASE_URL}/api/payment/phonepe/create`,
  PHONEPE_STATUS: `${API_BASE_URL}/api/payment/phonepe/status`,
  
  // Settings endpoints
  SETTINGS: `${API_BASE_URL}/api/settings/consultation-blocked`,
  
  // Utility endpoints
  UPLOAD: `${API_BASE_URL}/api/upload`,
  NEWSLETTER: `${API_BASE_URL}/api/newsletter`,
  GEMSTONES: `${API_BASE_URL}/api/gemstones`,
  SERVICES: `${API_BASE_URL}/api/services`,
  INSIGHTS: `${API_BASE_URL}/api/insights`
}

export default API_ENDPOINTS 
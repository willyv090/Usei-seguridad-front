// Default to Spring Boot's default port 8080 unless VITE_BACKEND_URL is provided
export const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

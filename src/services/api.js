import axios from 'axios';

// All requests now go through the Ocelot API Gateway
const API_GATEWAY = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:5000/api';

// Create a generic function to build Axios instances
const createApiClient = (baseURL) => {
  const client = axios.create({ baseURL });

  // Add a request interceptor to inject the JWT token if present
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('skybooker_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return client;
};

// Single gateway client
const gatewayClient = createApiClient(API_GATEWAY);

// Export individual configured clients (all routed through gateway)
export const authClient = createApiClient(API_GATEWAY);
export const flightClient = createApiClient(API_GATEWAY);
export const seatClient = createApiClient(API_GATEWAY);
export const bookingClient = createApiClient(API_GATEWAY);
export const passengerClient = createApiClient(API_GATEWAY);
export const notificationClient = createApiClient(API_GATEWAY);

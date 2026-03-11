import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';
const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  // #region agent log
  try {
    fetch('http://127.0.0.1:7649/ingest/319a953b-ab49-4ca6-8768-b969e4a6ca41', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '4c25e8'
      },
      body: JSON.stringify({
        sessionId: '4c25e8',
        runId: 'frontend-pre-fix',
        hypothesisId: 'H-api',
        location: 'frontend/src/services/api.js:request',
        message: 'API request',
        data: { method: config.method, url: config.baseURL + config.url },
        timestamp: Date.now()
      })
    }).catch(() => {});
  } catch (_) {}
  // #endregion
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use((response) => response, (error) => {
  // #region agent log
  try {
    fetch('http://127.0.0.1:7649/ingest/319a953b-ab49-4ca6-8768-b969e4a6ca41', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '4c25e8'
      },
      body: JSON.stringify({
        sessionId: '4c25e8',
        runId: 'frontend-pre-fix',
        hypothesisId: 'H-api',
        location: 'frontend/src/services/api.js:response',
        message: 'API error',
        data: {
          message: error.message,
          url: error.config && (error.config.baseURL + error.config.url),
          status: error.response && error.response.status
        },
        timestamp: Date.now()
      })
    }).catch(() => {});
  } catch (_) {}
  // #endregion
  return Promise.reject(error);
});

// Producers
export const getProducers = () => api.get('/producers');
export const getProducer = (id) => api.get('/producers/' + id);
export const createProducer = (data) => api.post('/producers', data);
export const updateProducer = (id, data) => api.put('/producers/' + id, data);
export const deleteProducer = (id) => api.delete('/producers/' + id);

// Products
export const getProducts = () => api.get('/products');
export const getProduct = (id) => api.get('/products/' + id);
export const getProductByBatch = (batch) => api.get('/products/batch/' + batch);
export const getProductsByProducer = (pid) => api.get('/products/producer/' + pid);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put('/products/' + id, data);
export const deleteProduct = (id) => api.delete('/products/' + id);

// Shipments
export const getShipments = () => api.get('/shipments');
export const getShipmentsByProduct = (pid) => api.get('/shipments/product/' + pid);
export const createShipment = (data) => api.post('/shipments', data);
export const updateShipment = (id, data) => api.put('/shipments/' + id, data);
export const deleteShipment = (id) => api.delete('/shipments/' + id);

// Blockchain
export const getBlockchain = (productId) => api.get('/blockchain/product/' + productId);
export const validateChain = () => api.get('/blockchain/validate');

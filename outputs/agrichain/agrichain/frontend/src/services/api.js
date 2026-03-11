import axios from 'axios';
const API_BASE = 'http://localhost:8080/api';
const api = axios.create({ baseURL: API_BASE });

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

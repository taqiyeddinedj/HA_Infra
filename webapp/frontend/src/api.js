// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://backend-service:3001', // Use the service name for the backend
});

export const insertData = async (message) => {
  try {
    const response = await api.post('/insert', { message });
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

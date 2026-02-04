// Configuración base de la API - Se adapta automáticamente al entorno
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SERVER_BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

/**
 * Función GET con autenticación
 * @param {string} endpoint - El endpoint de la API (ej: '/products', '/categories')
 * @returns {Promise} - Promesa con los datos de la respuesta
 */
export const GetWithAuth = async (endpoint) => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    // Verificar si la respuesta es JSON válido
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Respuesta no válida del servidor: ${text.substring(0, 100)}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('Error en GetWithAuth:', error);
    // Si el error ya tiene un mensaje, lanzarlo tal cual
    if (error.message) {
    throw error;
    }
    // Si es un error de red u otro tipo, crear un mensaje más descriptivo
    throw new Error(error.message || 'Error al obtener datos del servidor');
  }
};

/**
 * Función POST con autenticación
 * @param {string} endpoint - El endpoint de la API (ej: '/products', '/auth/login')
 * @param {Object|FormData} formData - Los datos a enviar (puede ser objeto JSON o FormData)
 * @returns {Promise} - Promesa con los datos de la respuesta
 */
export const PostWithAuth = async (endpoint, formData) => {
  try {
    const token = localStorage.getItem('token');

    // Determinar si formData es FormData o JSON
    const isFormData = formData instanceof FormData;

    const headers = {
      'Authorization': token ? `Bearer ${token}` : ''
    };

    // Solo agregar Content-Type para JSON, FormData lo maneja automáticamente
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: isFormData ? formData : JSON.stringify(formData)
    });

    // Verificar si la respuesta es JSON válido
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Respuesta no válida del servidor: ${text.substring(0, 100)}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('Error en PostWithAuth:', error);
    if (error.message) {
    throw error;
    }
    throw new Error(error.message || 'Error al enviar datos al servidor');
  }
};

/**
 * Función PUT con autenticación
 * @param {string} endpoint - El endpoint de la API
 * @param {Object|FormData} formData - Los datos a enviar
 * @returns {Promise} - Promesa con los datos de la respuesta
 */
export const PutWithAuth = async (endpoint, formData) => {
  try {
    const token = localStorage.getItem('token');

    const isFormData = formData instanceof FormData;

    const headers = {
      'Authorization': token ? `Bearer ${token}` : ''
    };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: headers,
      body: isFormData ? formData : JSON.stringify(formData)
    });

    // Verificar si la respuesta es JSON válido
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Respuesta no válida del servidor: ${text.substring(0, 100)}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('Error en PutWithAuth:', error);
    if (error.message) {
    throw error;
    }
    throw new Error(error.message || 'Error al actualizar datos en el servidor');
  }
};

/**
 * Función DELETE con autenticación
 * @param {string} endpoint - El endpoint de la API
 * @returns {Promise} - Promesa con los datos de la respuesta
 */
export const DeleteWithAuth = async (endpoint) => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    // Verificar si la respuesta es JSON válido
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Respuesta no válida del servidor: ${text.substring(0, 100)}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('Error en DeleteWithAuth:', error);
    if (error.message) {
    throw error;
    }
    throw new Error(error.message || 'Error al eliminar datos en el servidor');
  }
};

// Exportar configuraciones para uso en otros componentes
export const SERVER_URL = SERVER_BASE_URL;

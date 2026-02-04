import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GetWithAuth, PostWithAuth } from '../utils/api';
import './CreateReservationPlan.css';

const CreateReservationPlan = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    productId: '',
    quantity: 1,
    size: '',
    color: '',
    numberOfPayments: 3,
    paymentFrequency: 'mensual',
    notes: ''
  });

  useEffect(() => {
    loadUsers();
    loadProducts();
  }, []);

  useEffect(() => {
    if (formData.productId) {
      loadProductDetails(formData.productId);
    }
  }, [formData.productId]);

  const loadUsers = async () => {
    try {
      const data = await GetWithAuth('/users');
      setUsers(data.users || []);
    } catch (err) {
      setError('Error al cargar usuarios');
    }
  };

  const loadProducts = async () => {
    try {
      const data = await GetWithAuth('/products');
      setProducts(data.products || []);
    } catch (err) {
      setError('Error al cargar productos');
    }
  };

  const loadProductDetails = async (productId) => {
    try {
      const data = await GetWithAuth(`/products/${productId}`);
      if (data.success) {
        setSelectedProduct(data.product);
        // Resetear tamaño y color cuando cambia el producto
        setFormData(prev => ({
          ...prev,
          size: '',
          color: ''
        }));
      }
    } catch (err) {
      console.error('Error cargando producto:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'numberOfPayments' || name === 'quantity' ? parseInt(value) || 1 : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.userId || !formData.productId) {
      setError('Usuario y producto son requeridos');
      return;
    }

    if (selectedProduct?.sizes && selectedProduct.sizes.length > 0 && !formData.size) {
      setError('Debes seleccionar una talla');
      return;
    }

    if (selectedProduct?.colors && selectedProduct.colors.length > 0 && !formData.color) {
      setError('Debes seleccionar un color');
      return;
    }

    try {
      setLoading(true);
      await PostWithAuth('/reservation-plans', formData);
      navigate('/reservation-plans', {
        state: { success: 'Plan de reserva creado exitosamente' }
      });
    } catch (err) {
      setError(err.message || 'Error al crear plan de reserva');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = selectedProduct
    ? (selectedProduct.finalPrice || selectedProduct.price) * formData.quantity
    : 0;
  const paymentAmount = totalAmount / formData.numberOfPayments;

  return (
    <div className="reservation-plan-form-page">
      <div className="page-header">
        <button className="btn btn-outline" onClick={() => navigate('/reservation-plans')}>
          ← Volver
        </button>
        <h1 className="page-title">Crear Plan de Reserva</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="reservation-plan-form">
        <div className="form-section">
          <h2 className="section-title">Cliente</h2>
          <div className="form-group">
            <label className="form-label">Cliente *</label>
            <select
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Seleccionar cliente</option>
              {users
                .filter(user => user.role === 'user')
                .map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">Producto</h2>
          <div className="form-group">
            <label className="form-label">Producto *</label>
            <select
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Seleccionar producto</option>
              {products
                .filter(product => product.active)
                .map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ${product.finalPrice?.toFixed(2) || product.price.toFixed(2)}
                  </option>
                ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="product-preview">
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <img
                  src={`http://localhost:5000${selectedProduct.images[0]}`}
                  alt={selectedProduct.name}
                  className="product-preview-image"
                />
              )}
              <div className="product-preview-info">
                <h4>{selectedProduct.name}</h4>
                <p className="product-preview-price">
                  {selectedProduct.discount > 0 ? (
                    <>
                      <span>${selectedProduct.finalPrice?.toFixed(2) || (selectedProduct.price * (1 - selectedProduct.discount / 100)).toFixed(2)}</span>
                      <span className="original-price">${selectedProduct.price.toFixed(2)}</span>
                      <span className="discount-badge">-{selectedProduct.discount}%</span>
                    </>
                  ) : (
                    `$${selectedProduct.price.toFixed(2)}`
                  )}
                </p>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Cantidad *</label>
            <input
              type="number"
              name="quantity"
              min="1"
              max={selectedProduct?.stock || 1}
              value={formData.quantity}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          {selectedProduct?.sizes && selectedProduct.sizes.length > 0 && (
            <div className="form-group">
              <label className="form-label">Talla *</label>
              <select
                name="size"
                value={formData.size}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Seleccionar talla</option>
                {selectedProduct.sizes.map((size, index) => (
                  <option key={index} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedProduct?.colors && selectedProduct.colors.length > 0 && (
            <div className="form-group">
              <label className="form-label">Color *</label>
              <select
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Seleccionar color</option>
                {selectedProduct.colors.map((color, index) => (
                  <option key={index} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="form-section">
          <h2 className="section-title">Configuración del Plan</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Número de Pagos *</label>
              <input
                type="number"
                name="numberOfPayments"
                min="1"
                max="24"
                value={formData.numberOfPayments}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Frecuencia de Pago *</label>
              <select
                name="paymentFrequency"
                value={formData.paymentFrequency}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="mensual">Mensual</option>
                <option value="quincenal">Quincenal</option>
                <option value="semanal">Semanal</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notas</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="Notas adicionales sobre el plan de reserva..."
            />
          </div>
        </div>

        <div className="form-section summary-section">
          <h2 className="section-title">Resumen</h2>
          <div className="summary-item">
            <span>Monto Total:</span>
            <span className="summary-value">${totalAmount.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Número de Pagos:</span>
            <span className="summary-value">{formData.numberOfPayments}</span>
          </div>
          <div className="summary-item">
            <span>Frecuencia:</span>
            <span className="summary-value">
              {formData.paymentFrequency === 'mensual' ? 'Mensual' : formData.paymentFrequency === 'quincenal' ? 'Quincenal' : 'Semanal'}
            </span>
          </div>
          <div className="summary-item highlight">
            <span>Pago por Cuota:</span>
            <span className="summary-value highlight">${paymentAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate('/reservation-plans')}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Plan de Reserva'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateReservationPlan;

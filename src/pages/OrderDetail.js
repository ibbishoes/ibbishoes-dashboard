import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GetWithAuth, PutWithAuth } from '../utils/api';
import './OrderDetail.css';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await GetWithAuth(`/orders/${id}`);
      setOrder(data.order);
      setError('');
    } catch (err) {
      setError(err.message || 'Error al cargar la orden');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      setError('');
      console.log(`[handleStatusChange] Cambiando estado - OrderId: ${id}, NewStatus: ${newStatus}`);
      
      // Asegurar que el estado se envíe correctamente
      const statusToSend = newStatus.trim();
      
      await PutWithAuth(`/orders/${id}/status`, { orderStatus: statusToSend });
      setSuccessMsg('Estado de orden actualizado exitosamente');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadOrder();
    } catch (err) {
      console.error('[handleStatusChange] Error:', err);
      setError(err.message || 'Error al actualizar estado');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'pending': 'badge-warning',
      'confirmed': 'badge-info',
      'processing': 'badge-purple',
      'shipped': 'badge-success',
      'delivered': 'badge-success-dark',
      'cancelled': 'badge-danger'
    };
    return `status-badge ${statusClasses[status] || 'badge-secondary'}`;
  };

  const getPaymentStatusBadgeClass = (status) => {
    const statusClasses = {
      'pending': 'badge-warning',
      'pendiente': 'badge-warning',
      'paid': 'badge-success',
      'failed': 'badge-danger',
      'refunded': 'badge-secondary'
    };
    return `status-badge ${statusClasses[status] || 'badge-secondary'}`;
  };

  const getReceiptStatusBadgeClass = (status) => {
    const statusClasses = {
      'pendiente': 'badge-warning',
      'en_revision': 'badge-info',
      'aprobado': 'badge-success',
      'rechazado': 'badge-danger'
    };
    return `status-badge ${statusClasses[status] || 'badge-secondary'}`;
  };

  // Función para convertir estado de inglés a español para el select
  const getStatusForSelect = (status) => {
    const statusMap = {
      'pending': 'pendiente',
      'confirmed': 'confirmado',
      'processing': 'procesando',
      'shipped': 'enviado',
      'delivered': 'entregado',
      'cancelled': 'cancelado'
    };
    return statusMap[status?.toLowerCase()] || status || 'pendiente';
  };

  const translateOrderStatus = (status) => {
    const translations = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmada',
      'processing': 'Procesando',
      'shipped': 'Enviada',
      'delivered': 'Entregada',
      'cancelled': 'Cancelada',
      // Estados en español
      'pendiente': 'Pendiente',
      'confirmado': 'Confirmada',
      'procesando': 'Procesando',
      'enviado': 'Enviada',
      'entregado': 'Entregada',
      'cancelado': 'Cancelada'
    };
    return translations[status?.toLowerCase()] || status || 'Desconocido';
  };

  const translatePaymentStatus = (status) => {
    const translations = {
      'pending': 'Pendiente',
      'pendiente': 'Pendiente',
      'paid': 'Pagado',
      'failed': 'Fallido',
      'refunded': 'Reembolsado'
    };
    return translations[status] || status;
  };

  const translateReceiptStatus = (status) => {
    const translations = {
      'pendiente': 'Pendiente',
      'en_revision': 'En Revisión',
      'aprobado': 'Aprobado',
      'rechazado': 'Rechazado'
    };
    return translations[status] || status;
  };

  const viewReceipt = (receiptPath) => {
    if (receiptPath) {
      window.open(`http://localhost:5000${receiptPath}`, '_blank');
    }
  };

  if (loading) return <div className="loading">Cargando orden...</div>;

  if (error && !order) {
    return (
      <div className="order-detail-page">
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate('/orders')}>
            ← Volver a Órdenes
          </button>
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/orders')}>
          ← Volver a Órdenes
        </button>
        <div>
          <h1>Orden #{order?.orderNumber}</h1>
          <p>Creada el {formatDate(order?.createdAt)}</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMsg && <div className="success-message">{successMsg}</div>}

      {order && (
        <div className="order-detail-content">
          {/* Información General */}
          <div className="detail-card">
            <h2>Información General</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <strong>ID de Orden:</strong>
                <span>{order.id}</span>
              </div>
              <div className="detail-item">
                <strong>Número de Orden:</strong>
                <span>#{order.orderNumber}</span>
              </div>
              <div className="detail-item">
                <strong>Fecha de Creación:</strong>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="detail-item">
                <strong>Método de Pago:</strong>
                <span>{order.paymentMethod === 'efectivo' || order.paymentMethod === 'cash' ? 'Pago en Efectivo' : 'Transferencia Bancaria'}</span>
              </div>
              <div className="detail-item">
                <strong>Total:</strong>
                <span className="total-amount">{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Estados */}
            <div className="status-section">
              <div className="status-group">
                <h3>Estados</h3>
                <div className="status-badges">
                  <div className="status-item">
                    <span>Estado de Orden:</span>
                    <span className={getStatusBadgeClass(order.orderStatus)}>
                      {translateOrderStatus(order.orderStatus)}
                    </span>
                  </div>
                  <div className="status-item">
                    <span>Estado de Pago:</span>
                    <span className={getPaymentStatusBadgeClass(order.paymentStatus)}>
                      {translatePaymentStatus(order.paymentStatus)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="status-controls">
                <h4>Cambiar Estado de Orden</h4>
                <select
                  value={getStatusForSelect(order.orderStatus)}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  className="status-select"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmado">Confirmada</option>
                  <option value="procesando">Procesando</option>
                  <option value="enviado">Enviada</option>
                  <option value="entregado">Entregada</option>
                  <option value="cancelado">Cancelada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="detail-card">
            <h2>Información del Cliente</h2>
            <div className="customer-info">
              <div className="customer-details">
                <h3>Datos de Contacto</h3>
                <p><strong>Nombre:</strong> {order.shippingAddress?.fullName || 'N/A'}</p>
                <p><strong>Teléfono:</strong> {order.shippingAddress?.phone || 'N/A'}</p>
              </div>

              <div className="shipping-address">
                <h3>Dirección de Envío</h3>
                <div className="address-block">
                  <p>{order.shippingAddress?.address}</p>
                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                  <p>Código Postal: {order.shippingAddress?.zipCode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="detail-card">
            <h2>Productos Ordenados</h2>
            <div className="products-table">
              <div className="table-header">
                <span>Producto</span>
                <span>Opciones</span>
                <span>Cantidad</span>
                <span>Precio Unitario</span>
                <span>Total</span>
              </div>
              {order.items?.map((item, index) => (
                <div key={index} className="table-row">
                  <span className="product-name">{item.productName}</span>
                  <span className="product-options">
                    {item.size && <span className="option">Talla: {item.size}</span>}
                    {item.color && <span className="option">Color: {item.color}</span>}
                    {!item.size && !item.color && <span className="option">-</span>}
                  </span>
                  <span className="quantity">{item.quantity}</span>
                  <span className="unit-price">
                    {item.discount > 0 ? (
                      <div>
                        <div style={{ color: '#667eea', fontWeight: '600' }}>
                          {formatPrice(item.price)}
                        </div>
                        <div style={{ color: '#999', textDecoration: 'line-through', fontSize: '0.85rem' }}>
                          {formatPrice(item.originalPrice || item.price)}
                        </div>
                        <span style={{ background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', marginTop: '4px', display: 'inline-block' }}>
                          -{item.discount}%
                        </span>
                      </div>
                    ) : (
                      formatPrice(item.price)
                    )}
                  </span>
                  <span className="item-total">
                    {item.discount > 0 ? (
                      <div>
                        <div style={{ color: '#667eea', fontWeight: '600' }}>
                          {formatPrice(item.total)}
                        </div>
                        <div style={{ color: '#999', textDecoration: 'line-through', fontSize: '0.85rem' }}>
                          {formatPrice((item.originalPrice || item.price) * item.quantity)}
                        </div>
                      </div>
                    ) : (
                      formatPrice(item.total)
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen de Costos */}
          <div className="detail-card">
            <h2>Resumen de Costos</h2>
            <div className="cost-summary">
              <div className="cost-row total-row">
                <strong>Total:</strong>
                <strong>{formatPrice(order.total)}</strong>
              </div>
            </div>
          </div>

          {/* Información del Comprobante (solo para transferencias) */}
          {order.paymentMethod === 'transferencia' && (
            <div className="detail-card">
              <h2>Comprobante de Transferencia</h2>
              {order.receipt ? (
                <div className="receipt-info">
                  <div className="receipt-details">
                    <div className="detail-item">
                      <strong>Estado del Comprobante:</strong>
                      <span className={getReceiptStatusBadgeClass(order.receipt.receiptStatus)}>
                        {translateReceiptStatus(order.receipt.receiptStatus)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Archivo:</strong>
                      <span>{order.receipt.receiptFileName}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Fecha de Subida:</strong>
                      <span>{formatDate(order.receipt.uploadedAt)}</span>
                    </div>
                    {order.receipt.verifiedBy && (
                      <div className="detail-item">
                        <strong>Verificado el:</strong>
                        <span>{formatDate(order.receipt.verifiedAt)}</span>
                      </div>
                    )}
                    {order.receipt.rejectionReason && (
                      <div className="detail-item rejection-reason">
                        <strong>Motivo de Rechazo:</strong>
                        <span>{order.receipt.rejectionReason}</span>
                      </div>
                    )}
                  </div>

                  <div className="receipt-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => viewReceipt(order.receipt.receiptPath)}
                    >
                      Ver Comprobante
                    </button>
                  </div>
                </div>
              ) : (
                <div className="no-receipt">
                  <p>No se ha subido comprobante para esta orden.</p>
                </div>
              )}
            </div>
          )}

          {/* Notas Adicionales */}
          {order.notes && (
            <div className="detail-card">
              <h2>Notas Adicionales</h2>
              <div className="notes-content">
                <p>{order.notes}</p>
              </div>
            </div>
          )}

          {/* Historial de Cambios */}
          <div className="detail-card">
            <h2>Historial</h2>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-date">{formatDate(order.createdAt)}</div>
                <div className="timeline-content">Orden creada</div>
              </div>
              {order.updatedAt && order.updatedAt !== order.createdAt && (
                <div className="timeline-item">
                  <div className="timeline-date">{formatDate(order.updatedAt)}</div>
                  <div className="timeline-content">Última actualización</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GetWithAuth, PutWithAuth } from '../utils/api';
import './Orders.css';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await GetWithAuth('/orders');
      setOrders(data.orders || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setError('');
      console.log(`[handleStatusChange] Cambiando estado - OrderId: ${orderId}, NewStatus: ${newStatus}`);
      
      // Asegurar que el estado se envíe correctamente
      const statusToSend = newStatus.trim();
      
      await PutWithAuth(`/orders/${orderId}/status`, { orderStatus: statusToSend });
      setSuccessMsg('Estado de orden actualizado exitosamente');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadOrders();
    } catch (err) {
      console.error('[handleStatusChange] Error:', err);
      setError(err.message || 'Error al actualizar estado');
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

  const translateStatus = (status) => {
    const statusMap = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmada',
      'processing': 'Procesando',
      'shipped': 'Enviada',
      'delivered': 'Entregada',
      'cancelled': 'Cancelada',
      // Estados en español (por si acaso)
      'pendiente': 'Pendiente',
      'confirmado': 'Confirmada',
      'procesando': 'Procesando',
      'enviado': 'Enviada',
      'entregado': 'Entregada',
      'cancelado': 'Cancelada'
    };
    return statusMap[status?.toLowerCase()] || status || 'Desconocido';
  };

  const translatePaymentMethod = (method) => {
    const methodMap = {
      'efectivo': 'Efectivo',
      'transferencia': 'Transferencia',
      'cash': 'Efectivo',
      'transfer': 'Transferencia'
    };
    return methodMap[method?.toLowerCase()] || method || 'N/A';
  };

  const translatePaymentStatus = (status) => {
    const statusMap = {
      'pending': 'Pendiente',
      'paid': 'Pagado',
      'failed': 'Fallido',
      'refunded': 'Reembolsado',
      'pendiente': 'Pendiente',
      'pagado': 'Pagado',
      'fallido': 'Fallido',
      'reembolsado': 'Reembolsado'
    };
    return statusMap[status?.toLowerCase()] || status || 'Desconocido';
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'pendiente': 'badge-warning',
      'confirmado': 'badge-info',
      'procesando': 'badge-purple',
      'enviado': 'badge-success',
      'entregado': 'badge-success-dark',
      'cancelado': 'badge-danger'
    };
    return `status-badge ${statusClasses[status] || 'badge-secondary'}`;
  };

  const getPaymentStatusBadgeClass = (status) => {
    const statusClasses = {
      'pendiente': 'badge-warning',
      'pagado': 'badge-success',
      'fallido': 'badge-danger',
      'reembolsado': 'badge-secondary'
    };
    return `status-badge ${statusClasses[status] || 'badge-secondary'}`;
  };

  const filteredOrders = orders.filter(order => {
    // Mapear estados en inglés a español para comparación
    const statusMap = {
      'pending': 'pendiente',
      'confirmed': 'confirmado',
      'processing': 'procesando',
      'shipped': 'enviado',
      'delivered': 'entregado',
      'cancelled': 'cancelado'
    };
    
    const orderStatusEsp = statusMap[order.orderStatus?.toLowerCase()] || order.orderStatus?.toLowerCase();
    const statusMatch = statusFilter === 'all' || orderStatusEsp === statusFilter || order.orderStatus === statusFilter;
    
    const paymentMap = {
      'pending': 'pendiente',
      'paid': 'pagado',
      'failed': 'fallido',
      'refunded': 'reembolsado'
    };
    const orderPaymentEsp = paymentMap[order.paymentStatus?.toLowerCase()] || order.paymentStatus?.toLowerCase();
    const paymentMatch = paymentFilter === 'all' || orderPaymentEsp === paymentFilter || order.paymentStatus === paymentFilter;
    
    return statusMatch && paymentMatch;
  });

  if (loading) return <div className="loading">Cargando órdenes...</div>;

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Gestión de Órdenes</h1>
        <p>Administra todas las órdenes de la tienda</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMsg && <div className="success-message">{successMsg}</div>}

      {/* Filtros */}
      <div className="orders-filters">
        <div className="filter-group">
          <label htmlFor="statusFilter">Estado de Orden:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmada</option>
            <option value="processing">Procesando</option>
            <option value="shipped">Enviada</option>
            <option value="delivered">Entregada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>


        <div className="orders-stats">
          <span>Total: {filteredOrders.length} órdenes</span>
        </div>
      </div>

      {/* Lista de Órdenes */}
      <div className="orders-grid">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <p>No hay órdenes que coincidan con los filtros seleccionados</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-number">
                  <strong>#{order.orderNumber}</strong>
                </div>
                <div className="order-date">
                  {formatDate(order.createdAt)}
                </div>
              </div>

              <div className="order-customer">
                <strong>{order.shippingAddress?.fullName || 'N/A'}</strong>
                <small>{order.shippingAddress?.city || ''}</small>
              </div>

              <div className="order-items">
                <span>{order.items?.length || 0} productos</span>
                <strong>{formatPrice(order.total || 0)}</strong>
              </div>

              <div className="order-payment">
                <span>Pago: {translatePaymentMethod(order.paymentMethod)}</span>
              </div>

              <div className="order-status">
                <div className="status-row">
                  <span>Estado:</span>
                  <select
                    value={getStatusForSelect(order.orderStatus)}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
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
                <div className="status-badges">
                  <span className={getStatusBadgeClass(order.orderStatus)}>
                    {translateStatus(order.orderStatus)}
                  </span>
                  {order.paymentStatus && (
                    <span className={getPaymentStatusBadgeClass(order.paymentStatus)}>
                      {translatePaymentStatus(order.paymentStatus)}
                    </span>
                  )}
                </div>
              </div>

              <div className="order-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  Ver Detalle Completo
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
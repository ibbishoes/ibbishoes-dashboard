import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { GetWithAuth } from '../utils/api';
import './ReservationPlans.css';

const ReservationPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      const url = filterStatus ? `/reservation-plans?status=${filterStatus}` : '/reservation-plans';
      const data = await GetWithAuth(url);
      setPlans(data.plans || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Error al cargar planes de reserva');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { label: 'Activo', color: '#059669', bg: '#d1fae5' },
      'completed': { label: 'Completado', color: '#2563eb', bg: '#dbeafe' },
      'cancelled': { label: 'Cancelado', color: '#dc2626', bg: '#fee2e2' },
      'expired': { label: 'Expirado', color: '#6b7280', bg: '#f3f4f6' }
    };
    const config = statusConfig[status] || statusConfig['active'];
    return (
      <span style={{
        padding: '0.375rem 0.75rem',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        backgroundColor: config.bg,
        color: config.color,
        display: 'inline-block'
      }}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return <div className="loading">Cargando planes de reserva...</div>;
  }

  return (
    <div className="reservation-plans-page">
      <div className="page-header">
        <h1 className="page-title">Planes de Reserva</h1>
        <Link to="/reservation-plans/new" className="btn btn-primary">
          + Crear Plan de Reserva
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="filters" style={{ marginBottom: '1.5rem' }}>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="form-select"
          style={{ maxWidth: '200px' }}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="completed">Completados</option>
          <option value="cancelled">Cancelados</option>
          <option value="expired">Expirados</option>
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Producto</th>
              <th>Monto Total</th>
              <th>Pagado</th>
              <th>Restante</th>
              <th>Pagos</th>
              <th>Estado</th>
              <th>Fecha Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center">
                  No hay planes de reserva registrados
                </td>
              </tr>
            ) : (
              plans.map(plan => (
                <tr key={plan.id}>
                  <td>
                    <div>
                      <strong>{plan.userName}</strong>
                      <div style={{ fontSize: '0.875rem', color: '#666' }}>{plan.userEmail}</div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong>{plan.productName}</strong>
                      {plan.quantity > 1 && <div style={{ fontSize: '0.875rem', color: '#666' }}>Cantidad: {plan.quantity}</div>}
                      {plan.size && <div style={{ fontSize: '0.875rem', color: '#666' }}>Talla: {plan.size}</div>}
                      {plan.color && <div style={{ fontSize: '0.875rem', color: '#666' }}>Color: {plan.color}</div>}
                    </div>
                  </td>
                  <td>{formatPrice(plan.totalAmount)}</td>
                  <td>
                    <span style={{ color: '#059669', fontWeight: '600' }}>
                      {formatPrice(plan.paidAmount)}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: plan.remainingAmount > 0 ? '#dc2626' : '#059669', fontWeight: '600' }}>
                      {formatPrice(plan.remainingAmount)}
                    </span>
                  </td>
                  <td>{plan.paymentsCount} / {plan.numberOfPayments}</td>
                  <td>{getStatusBadge(plan.status)}</td>
                  <td>{formatDate(plan.createdAt)}</td>
                  <td>
                    <Link
                      to={`/reservation-plans/${plan.id}`}
                      className="btn btn-sm btn-outline"
                    >
                      Ver Detalles
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservationPlans;

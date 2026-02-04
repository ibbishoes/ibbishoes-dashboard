import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GetWithAuth, PutWithAuth, PostWithAuth } from '../utils/api';
import './ReservationPlanDetail.css';

const ReservationPlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState('');

  const loadPlan = useCallback(async () => {
    try {
      setLoading(true);
      const data = await GetWithAuth(`/reservation-plans/${id}`);
      if (data.success) {
        setPlan(data.plan);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar plan de reserva');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const handleVerifyPayment = async (paymentId) => {
    try {
      await PutWithAuth(`/reservation-plans/payments/${paymentId}/verify`, {});
      setSuccessMsg('Pago verificado exitosamente');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadPlan();
    } catch (err) {
      setError(err.message || 'Error al verificar pago');
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    try {
      await PostWithAuth(`/reservation-plans/${id}/payments`, {
        amount: parseFloat(paymentAmount),
        paymentDate,
        notes: paymentNotes
      });
      setSuccessMsg('Pago agregado exitosamente');
      setPaymentAmount('');
      setPaymentNotes('');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadPlan();
    } catch (err) {
      setError(err.message || 'Error al agregar pago');
    }
  };

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

  if (loading) {
    return <div className="loading">Cargando plan de reserva...</div>;
  }

  if (!plan) {
    return <div className="container">Plan de reserva no encontrado</div>;
  }

  const progressPercentage = (plan.paidAmount / plan.totalAmount) * 100;

  return (
    <div className="reservation-plan-detail-page">
      <div className="page-header">
        <button className="btn btn-outline" onClick={() => navigate('/reservation-plans')}>
          ← Volver
        </button>
        <h1 className="page-title">Plan de Reserva #{plan.id.substring(0, 8)}</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="grid grid-2" style={{ gap: '2rem', marginBottom: '2rem' }}>
        <div className="card">
          <h2 className="card-title">Información del Plan</h2>
          <div className="detail-row">
            <span className="detail-label">Cliente:</span>
            <span className="detail-value">{plan.userName || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{plan.userEmail || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Producto:</span>
            <span className="detail-value">{plan.productName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Cantidad:</span>
            <span className="detail-value">{plan.quantity}</span>
          </div>
          {plan.size && (
            <div className="detail-row">
              <span className="detail-label">Talla:</span>
              <span className="detail-value">{plan.size}</span>
            </div>
          )}
          {plan.color && (
            <div className="detail-row">
              <span className="detail-label">Color:</span>
              <span className="detail-value">{plan.color}</span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">Frecuencia de Pago:</span>
            <span className="detail-value">{plan.paymentFrequency}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Número de Pagos:</span>
            <span className="detail-value">{plan.numberOfPayments}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Estado:</span>
            <span className="detail-value">
              <span style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                backgroundColor: plan.status === 'active' ? '#d1fae5' : plan.status === 'completed' ? '#dbeafe' : '#fee2e2',
                color: plan.status === 'active' ? '#059669' : plan.status === 'completed' ? '#2563eb' : '#dc2626'
              }}>
                {plan.status === 'active' ? 'Activo' : plan.status === 'completed' ? 'Completado' : 'Cancelado'}
              </span>
            </span>
          </div>
          {plan.notes && (
            <div className="detail-row">
              <span className="detail-label">Notas:</span>
              <span className="detail-value">{plan.notes}</span>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="card-title">Progreso del Pago</h2>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Progreso:</span>
              <span style={{ fontWeight: '600' }}>{progressPercentage.toFixed(1)}%</span>
            </div>
            <div style={{
              width: '100%',
              height: '24px',
              backgroundColor: '#e5e7eb',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progressPercentage}%`,
                height: '100%',
                backgroundColor: progressPercentage === 100 ? '#059669' : '#2563eb',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
          <div className="detail-row">
            <span className="detail-label">Monto Total:</span>
            <span className="detail-value" style={{ fontSize: '1.25rem', fontWeight: '600' }}>
              {formatPrice(plan.totalAmount)}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Pagado:</span>
            <span className="detail-value" style={{ color: '#059669', fontSize: '1.25rem', fontWeight: '600' }}>
              {formatPrice(plan.paidAmount)}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Restante:</span>
            <span className="detail-value" style={{ 
              color: plan.remainingAmount > 0 ? '#dc2626' : '#059669',
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              {formatPrice(plan.remainingAmount)}
            </span>
          </div>
          {plan.completedAt && (
            <div className="detail-row">
              <span className="detail-label">Completado:</span>
              <span className="detail-value">{formatDate(plan.completedAt)}</span>
            </div>
          )}
        </div>
      </div>

      {plan.status === 'active' && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 className="card-title">Agregar Pago</h2>
          <form onSubmit={handleAddPayment}>
            <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Monto *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={plan.remainingAmount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de Pago *</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notas</label>
              <textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="form-textarea"
                rows="3"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Registrar Pago
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="card-title">Historial de Pagos</h2>
        {plan.payments && plan.payments.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Método</th>
                  <th>Notas</th>
                  <th>Verificado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {plan.payments.map(payment => (
                  <tr key={payment.id}>
                    <td>{formatDate(payment.paymentDate)}</td>
                    <td style={{ fontWeight: '600' }}>{formatPrice(payment.amount)}</td>
                    <td>{payment.paymentMethod}</td>
                    <td>{payment.notes || '-'}</td>
                    <td>
                      {payment.verified ? (
                        <span style={{ color: '#059669', fontWeight: '600' }}>✓ Verificado</span>
                      ) : (
                        <span style={{ color: '#f59e0b' }}>Pendiente</span>
                      )}
                    </td>
                    <td>
                      {!payment.verified && (
                        <button
                          onClick={() => handleVerifyPayment(payment.id)}
                          className="btn btn-sm btn-success"
                        >
                          Verificar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center">No hay pagos registrados</p>
        )}
      </div>
    </div>
  );
};

export default ReservationPlanDetail;

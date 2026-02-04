import React, { useState, useEffect } from 'react';
import { GetWithAuth, PutWithAuth } from '../utils/api';

const ReceiptVerification = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    limit: 20,
    offset: 0
  });
  const [pagination, setPagination] = useState({
    total: 0,
    hasMore: false
  });

  useEffect(() => {
    loadReceipts();
  }, [filters]);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (filters.status) queryParams.append('status', filters.status);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      queryParams.append('limit', filters.limit);
      queryParams.append('offset', filters.offset);

      const response = await GetWithAuth(`/receipts?${queryParams.toString()}`);

      if (response.success) {
        setReceipts(response.data);
        setPagination(response.pagination);
      } else {
        setMessage({ text: 'Error al cargar comprobantes', type: 'error' });
      }
    } catch (error) {
      console.error('Error loading receipts:', error);
      setMessage({ text: 'Error al cargar comprobantes', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus, reason = null) => {
    try {
      setProcessing(true);
      const payload = { status: newStatus };
      if (reason) payload.rejectionReason = reason;

      const response = await PutWithAuth(`/receipts/${orderId}/status`, payload);

      if (response.success) {
        setMessage({
          text: `Comprobante ${newStatus === 'aprobado' ? 'aprobado' : newStatus === 'rechazado' ? 'rechazado' : 'actualizado'} exitosamente`,
          type: 'success'
        });
        loadReceipts(); // Recargar lista
        closeModals();
      } else {
        setMessage({ text: response.message || 'Error al actualizar estado', type: 'error' });
      }
    } catch (error) {
      console.error('Error updating receipt status:', error);
      setMessage({ text: 'Error al actualizar estado', type: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  const closeModals = () => {
    setShowModal(false);
    setShowRejectModal(false);
    setSelectedReceipt(null);
    setRejectionReason('');
  };

  const openReceiptModal = (receipt) => {
    setSelectedReceipt(receipt);
    setShowModal(true);
  };

  const openRejectModal = (receipt) => {
    setSelectedReceipt(receipt);
    setShowRejectModal(true);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      setMessage({ text: 'Debe proporcionar un motivo de rechazo', type: 'error' });
      return;
    }
    handleStatusChange(selectedReceipt.id, 'rechazado', rejectionReason.trim());
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      offset: 0 // Reset pagination when filtering
    }));
  };

  const handlePageChange = (direction) => {
    const newOffset = direction === 'next'
      ? filters.offset + filters.limit
      : Math.max(0, filters.offset - filters.limit);

    setFilters(prev => ({
      ...prev,
      offset: newOffset
    }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pendiente': { label: 'Pendiente', color: '#f59e0b', bg: '#fef3c7' },
      'aprobado': { label: 'Aprobado', color: '#059669', bg: '#d1fae5' },
      'en_revision': { label: 'En Revisión', color: '#2563eb', bg: '#dbeafe' },
      'rechazado': { label: 'Rechazado', color: '#dc2626', bg: '#fee2e2' }
    };

    const config = statusConfig[status] || statusConfig['pendiente'];

    return (
      <span style={{
        padding: '0.25rem 0.5rem',
        borderRadius: '0.375rem',
        fontSize: '0.75rem',
        fontWeight: '500',
        backgroundColor: config.bg,
        color: config.color
      }}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Verificación de Comprobantes</h1>
        <p style={{ color: '#666', margin: '0.5rem 0' }}>
          Revisa y verifica los comprobantes de transferencia subidos por los clientes
        </p>
      </div>

      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '2rem' }}>
          {message.text}
        </div>
      )}

      {/* Filtros */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Filtros</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label>Estado</label>
            <select
              className="form-input"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_revision">En Revisión</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>

          <div className="form-group">
            <label>Desde</label>
            <input
              type="date"
              className="form-input"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Hasta</label>
            <input
              type="date"
              className="form-input"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Lista de comprobantes */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Cargando comprobantes...</div>
        </div>
      ) : receipts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ color: '#666' }}>No se encontraron comprobantes con los filtros aplicados</div>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Orden #</th>
                  <th>Cliente</th>
                  <th>Fecha Orden</th>
                  <th>Total</th>
                  <th>Subido</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt) => (
                  <tr key={receipt.id}>
                    <td style={{ fontFamily: 'monospace' }}>{receipt.orderNumber}</td>
                    <td>
                      <div>{receipt.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>{receipt.customerEmail}</div>
                    </td>
                    <td>{formatDate(receipt.orderDate)}</td>
                    <td style={{ fontWeight: '500' }}>${receipt.total.toFixed(2)}</td>
                    <td>{formatDate(receipt.receipt.uploadedAt)}</td>
                    <td>{getStatusBadge(receipt.receipt.receiptStatus)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => openReceiptModal(receipt)}
                        >
                          Ver
                        </button>

                        {receipt.receipt.receiptStatus !== 'aprobado' && (
                          <button
                            className="btn btn-sm"
                            style={{ backgroundColor: '#059669', color: 'white' }}
                            onClick={() => handleStatusChange(receipt.id, 'aprobado')}
                            disabled={processing}
                          >
                            Aprobar
                          </button>
                        )}

                        {receipt.receipt.receiptStatus === 'pendiente' && (
                          <button
                            className="btn btn-sm"
                            style={{ backgroundColor: '#2563eb', color: 'white' }}
                            onClick={() => handleStatusChange(receipt.id, 'en_revision')}
                            disabled={processing}
                          >
                            Revisión
                          </button>
                        )}

                        {receipt.receipt.receiptStatus !== 'rechazado' && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => openRejectModal(receipt)}
                            disabled={processing}
                          >
                            Rechazar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              Mostrando {filters.offset + 1} - {Math.min(filters.offset + filters.limit, pagination.total)} de {pagination.total}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-outline"
                onClick={() => handlePageChange('prev')}
                disabled={filters.offset === 0}
              >
                Anterior
              </button>
              <button
                className="btn btn-outline"
                onClick={() => handlePageChange('next')}
                disabled={!pagination.hasMore}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal de visualización de comprobante */}
      {showModal && selectedReceipt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Comprobante - Orden {selectedReceipt.orderNumber}</h3>
              <button
                onClick={closeModals}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div><strong>Cliente:</strong> {selectedReceipt.customerName}</div>
              <div><strong>Email:</strong> {selectedReceipt.customerEmail}</div>
              <div><strong>Total:</strong> ${selectedReceipt.total.toFixed(2)}</div>
              <div><strong>Estado:</strong> {getStatusBadge(selectedReceipt.receipt.receiptStatus)}</div>
              <div><strong>Subido:</strong> {formatDate(selectedReceipt.receipt.uploadedAt)}</div>
            </div>

            {selectedReceipt.receipt.receiptPath && (
              <div style={{ textAlign: 'center' }}>
                {selectedReceipt.receipt.receiptMimeType === 'application/pdf' ? (
                  <div>
                    <p>Archivo PDF</p>
                    <a
                      href={`http://localhost:5000${selectedReceipt.receipt.receiptPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      Abrir PDF
                    </a>
                  </div>
                ) : (
                  <img
                    src={`http://localhost:5000${selectedReceipt.receipt.receiptPath}`}
                    alt="Comprobante"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '500px',
                      objectFit: 'contain',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                )}
              </div>
            )}

            {selectedReceipt.receipt.rejectionReason && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#fee2e2',
                borderRadius: '4px',
                border: '1px solid #fca5a5'
              }}>
                <strong>Motivo de rechazo:</strong> {selectedReceipt.receipt.rejectionReason}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de rechazo */}
      {showRejectModal && selectedReceipt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>Rechazar Comprobante</h3>
            <p>Orden: {selectedReceipt.orderNumber}</p>
            <p>Cliente: {selectedReceipt.customerName}</p>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Motivo del rechazo *</label>
              <textarea
                className="form-textarea"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explique por qué se rechaza este comprobante..."
                rows={4}
              />
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-outline"
                onClick={closeModals}
                disabled={processing}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
              >
                {processing ? 'Rechazando...' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptVerification;
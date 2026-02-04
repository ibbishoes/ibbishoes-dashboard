import React, { useState, useEffect } from 'react';
import { GetWithAuth, PutWithAuth } from '../utils/api';

const PaymentConfig = () => {
  const [config, setConfig] = useState({
    transferencia: {
      enabled: false,
      alias: '',
      cbuCvu: '',
      accountHolderName: '',
      bankName: '',
      instructions: ''
    },
    efectivo: {
      enabled: true,
      instructions: 'El pago en efectivo se coordinará al momento de la entrega'
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [errors, setErrors] = useState({});

  // Opciones de bancos/billeteras
  const bankOptions = [
    'Banco Nación',
    'Banco Provincia',
    'Banco Santander',
    'Banco Galicia',
    'BBVA',
    'Banco Macro',
    'MercadoPago',
    'Ualá',
    'Brubank',
    'Otro'
  ];

  useEffect(() => {
    loadPaymentConfig();
  }, []);

  const loadPaymentConfig = async () => {
    try {
      setLoading(true);
      const response = await GetWithAuth('/payment-config');
      if (response.success) {
        setConfig(response.data);
      }
    } catch (error) {
      console.error('Error loading payment config:', error);
      setMessage({ text: 'Error al cargar configuración', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    // Clear specific error when user starts typing
    if (errors[`${section}.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };

  const handleToggle = (section) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        enabled: !prev[section].enabled
      }
    }));
  };

  const validateConfig = () => {
    const newErrors = {};

    // Validar que al menos un método esté habilitado
    if (!config.transferencia.enabled && !config.efectivo.enabled) {
      newErrors.general = 'Debe habilitar al menos un método de pago';
    }

    // Validar transferencia si está habilitada
    if (config.transferencia.enabled) {
      if (!config.transferencia.alias.trim()) {
        newErrors['transferencia.alias'] = 'El alias es requerido';
      }

      if (!config.transferencia.cbuCvu.trim()) {
        newErrors['transferencia.cbuCvu'] = 'El CVU/CBU es requerido';
      } else if (!/^[0-9]{22}$/.test(config.transferencia.cbuCvu)) {
        newErrors['transferencia.cbuCvu'] = 'Debe tener exactamente 22 dígitos numéricos';
      }

      if (!config.transferencia.accountHolderName.trim()) {
        newErrors['transferencia.accountHolderName'] = 'El nombre del titular es requerido';
      }

      if (!config.transferencia.bankName.trim()) {
        newErrors['transferencia.bankName'] = 'Debe seleccionar un banco/billetera';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateConfig()) {
      setMessage({ text: 'Por favor corrige los errores antes de guardar', type: 'error' });
      return;
    }

    try {
      setSaving(true);
      setMessage({ text: '', type: '' });

      const response = await PutWithAuth('/payment-config', config);

      if (response.success) {
        setMessage({ text: 'Configuración guardada exitosamente', type: 'success' });
        // Actualizar config con la respuesta del servidor
        setConfig(response.data);
      } else {
        setMessage({ text: response.message || 'Error al guardar configuración', type: 'error' });
      }
    } catch (error) {
      console.error('Error saving payment config:', error);
      setMessage({ text: 'Error al guardar configuración', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const formatCVU = (value) => {
    // Remove non-digits and limit to 22 characters
    const digits = value.replace(/\D/g, '').slice(0, 22);
    // Format as XXXX-XXXX-XXXX-XXXX-XXXXXX
    return digits.replace(/(\d{4})(?=\d)/g, '$1-');
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Cargando configuración...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Configuración de Pagos</h1>
        <p style={{ color: '#666', margin: '0.5rem 0' }}>
          Configura los métodos de pago disponibles para tu tienda
        </p>
      </div>

      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '2rem' }}>
          {message.text}
        </div>
      )}

      {errors.general && (
        <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
          {errors.general}
        </div>
      )}

      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* Transferencia Bancaria */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, color: '#2563eb' }}>Transferencia Bancaria</h2>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.transferencia.enabled}
                onChange={() => handleToggle('transferencia')}
                style={{ transform: 'scale(1.2)' }}
              />
              <span style={{ fontWeight: '500' }}>
                {config.transferencia.enabled ? 'Habilitado' : 'Deshabilitado'}
              </span>
            </label>
          </div>

          {config.transferencia.enabled && (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div className="form-group">
                <label>Alias *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: MiTienda.Online"
                  value={config.transferencia.alias}
                  onChange={(e) => handleInputChange('transferencia', 'alias', e.target.value)}
                  style={{ borderColor: errors['transferencia.alias'] ? '#ef4444' : undefined }}
                />
                {errors['transferencia.alias'] && (
                  <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {errors['transferencia.alias']}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>CVU/CBU *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="1234567890123456789012"
                  value={formatCVU(config.transferencia.cbuCvu)}
                  onChange={(e) => handleInputChange('transferencia', 'cbuCvu', e.target.value.replace(/\D/g, ''))}
                  maxLength={27} // 22 digits + 5 hyphens
                  style={{
                    fontFamily: 'monospace',
                    borderColor: errors['transferencia.cbuCvu'] ? '#ef4444' : undefined
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                  Debe tener exactamente 22 dígitos numéricos
                </div>
                {errors['transferencia.cbuCvu'] && (
                  <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {errors['transferencia.cbuCvu']}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Titular de la Cuenta *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nombre completo del titular"
                  value={config.transferencia.accountHolderName}
                  onChange={(e) => handleInputChange('transferencia', 'accountHolderName', e.target.value)}
                  style={{ borderColor: errors['transferencia.accountHolderName'] ? '#ef4444' : undefined }}
                />
                {errors['transferencia.accountHolderName'] && (
                  <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {errors['transferencia.accountHolderName']}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Banco/Billetera *</label>
                <select
                  className="form-input"
                  value={config.transferencia.bankName}
                  onChange={(e) => handleInputChange('transferencia', 'bankName', e.target.value)}
                  style={{ borderColor: errors['transferencia.bankName'] ? '#ef4444' : undefined }}
                >
                  <option value="">Seleccionar banco/billetera</option>
                  {bankOptions.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
                {errors['transferencia.bankName'] && (
                  <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {errors['transferencia.bankName']}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Instrucciones adicionales (opcional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Ej: Indicar número de orden en la transferencia"
                  value={config.transferencia.instructions}
                  onChange={(e) => handleInputChange('transferencia', 'instructions', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {!config.transferencia.enabled && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#666', background: '#f9fafb', borderRadius: '8px' }}>
              Las transferencias bancarias están deshabilitadas
            </div>
          )}
        </div>

        {/* Efectivo */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, color: '#059669' }}>Pago en Efectivo</h2>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.efectivo.enabled}
                onChange={() => handleToggle('efectivo')}
                style={{ transform: 'scale(1.2)' }}
              />
              <span style={{ fontWeight: '500' }}>
                {config.efectivo.enabled ? 'Habilitado' : 'Deshabilitado'}
              </span>
            </label>
          </div>

          <div className="form-group">
            <label>Instrucciones para el cliente</label>
            <textarea
              className="form-textarea"
              placeholder="Instrucciones sobre cómo coordinar el pago en efectivo"
              value={config.efectivo.instructions}
              onChange={(e) => handleInputChange('efectivo', 'instructions', e.target.value)}
              rows={3}
              disabled={!config.efectivo.enabled}
            />
          </div>

          {!config.efectivo.enabled && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#666', background: '#f9fafb', borderRadius: '8px' }}>
              El pago en efectivo está deshabilitado
            </div>
          )}
        </div>

        {/* Información adicional */}
        {config.updatedAt && (
          <div className="card" style={{ background: '#f9fafb' }}>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              <strong>Última actualización:</strong> {new Date(config.updatedAt).toLocaleString('es-AR')}
            </div>
          </div>
        )}
      </div>

      {/* Botón de guardar */}
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ minWidth: '150px' }}
        >
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </div>
  );
};

export default PaymentConfig;
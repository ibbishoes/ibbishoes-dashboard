import React, { useState, useEffect, useCallback } from 'react';
import { GetWithAuth, PutWithAuth } from '../utils/api';
import './Settings.css';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [settings, setSettings] = useState({
    company: {
      name: '',
      description: '',
      mission: '',
      vision: '',
      values: [],
      foundedYear: '',
      employeesCount: ''
    },
    contact: {
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      workingHours: {
        weekdays: '',
        saturday: '',
        sunday: ''
      }
    },
    social: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: ''
    },
    stats: {
      customers: '',
      products: '',
      orders: '',
      satisfaction: ''
    },
    team: []
  });

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await GetWithAuth('/settings');
      setSettings(prev => data.settings || prev);
      setError('');
    } catch (err) {
      setError(err.message || 'Error al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedChange = (section, subsection, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await PutWithAuth('/settings', settings);
      setSuccessMsg('Configuraciones actualizadas exitosamente');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al actualizar configuraciones');
    }
  };

  if (loading) {
    return <div className="loading">Cargando configuraciones...</div>;
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Configuración General</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <form onSubmit={handleSubmit}>
        {/* Información de la Empresa */}
        <div className="card">
          <h2 className="card-title">Información de la Empresa</h2>

          <div className="form-group">
            <label className="form-label">Nombre de la Empresa</label>
            <input
              type="text"
              className="form-input"
              value={settings.company.name}
              onChange={(e) => handleChange('company', 'name', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-textarea"
              value={settings.company.description}
              onChange={(e) => handleChange('company', 'description', e.target.value)}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Misión</label>
            <textarea
              className="form-textarea"
              value={settings.company.mission}
              onChange={(e) => handleChange('company', 'mission', e.target.value)}
              rows="2"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Visión</label>
            <textarea
              className="form-textarea"
              value={settings.company.vision}
              onChange={(e) => handleChange('company', 'vision', e.target.value)}
              rows="2"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Año de Fundación</label>
              <input
                type="text"
                className="form-input"
                value={settings.company.foundedYear}
                onChange={(e) => handleChange('company', 'foundedYear', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Número de Empleados</label>
              <input
                type="text"
                className="form-input"
                value={settings.company.employeesCount}
                onChange={(e) => handleChange('company', 'employeesCount', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="card">
          <h2 className="card-title">Información de Contacto</h2>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input
                type="text"
                className="form-input"
                value={settings.contact.phone}
                onChange={(e) => handleChange('contact', 'phone', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">WhatsApp</label>
              <input
                type="text"
                className="form-input"
                value={settings.contact.whatsapp}
                onChange={(e) => handleChange('contact', 'whatsapp', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={settings.contact.email}
              onChange={(e) => handleChange('contact', 'email', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Dirección</label>
            <input
              type="text"
              className="form-input"
              value={settings.contact.address}
              onChange={(e) => handleChange('contact', 'address', e.target.value)}
            />
          </div>

          <h3 className="section-subtitle">Horarios de Atención</h3>

          <div className="form-group">
            <label className="form-label">Lunes a Viernes</label>
            <input
              type="text"
              className="form-input"
              value={settings.contact.workingHours.weekdays}
              onChange={(e) => handleNestedChange('contact', 'workingHours', 'weekdays', e.target.value)}
              placeholder="9:00 AM - 6:00 PM"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Sábado</label>
              <input
                type="text"
                className="form-input"
                value={settings.contact.workingHours.saturday}
                onChange={(e) => handleNestedChange('contact', 'workingHours', 'saturday', e.target.value)}
                placeholder="10:00 AM - 2:00 PM"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Domingo</label>
              <input
                type="text"
                className="form-input"
                value={settings.contact.workingHours.sunday}
                onChange={(e) => handleNestedChange('contact', 'workingHours', 'sunday', e.target.value)}
                placeholder="Cerrado"
              />
            </div>
          </div>
        </div>

        {/* Redes Sociales */}
        <div className="card">
          <h2 className="card-title">Redes Sociales</h2>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Facebook</label>
              <input
                type="url"
                className="form-input"
                value={settings.social.facebook}
                onChange={(e) => handleChange('social', 'facebook', e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Instagram</label>
              <input
                type="url"
                className="form-input"
                value={settings.social.instagram}
                onChange={(e) => handleChange('social', 'instagram', e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Twitter</label>
              <input
                type="url"
                className="form-input"
                value={settings.social.twitter}
                onChange={(e) => handleChange('social', 'twitter', e.target.value)}
                placeholder="https://twitter.com/..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">LinkedIn</label>
              <input
                type="url"
                className="form-input"
                value={settings.social.linkedin}
                onChange={(e) => handleChange('social', 'linkedin', e.target.value)}
                placeholder="https://linkedin.com/..."
              />
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="card">
          <h2 className="card-title">Estadísticas para "Sobre Nosotros"</h2>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Clientes</label>
              <input
                type="text"
                className="form-input"
                value={settings.stats.customers}
                onChange={(e) => handleChange('stats', 'customers', e.target.value)}
                placeholder="10,000+"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Productos</label>
              <input
                type="text"
                className="form-input"
                value={settings.stats.products}
                onChange={(e) => handleChange('stats', 'products', e.target.value)}
                placeholder="500+"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Pedidos</label>
              <input
                type="text"
                className="form-input"
                value={settings.stats.orders}
                onChange={(e) => handleChange('stats', 'orders', e.target.value)}
                placeholder="50,000+"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Satisfacción</label>
              <input
                type="text"
                className="form-input"
                value={settings.stats.satisfaction}
                onChange={(e) => handleChange('stats', 'satisfaction', e.target.value)}
                placeholder="98%"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-large">
            Guardar Configuraciones
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;

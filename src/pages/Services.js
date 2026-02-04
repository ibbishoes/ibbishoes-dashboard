import React, { useState, useEffect } from 'react';
import { GetWithAuth, PostWithAuth, PutWithAuth, DeleteWithAuth, SERVER_URL } from '../utils/api';
import './Services.css';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    schedule: '',
    price: '',
    active: true,
    order: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await GetWithAuth('/services/admin');
      setServices(data.services || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData({ ...formData, image: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let imageUrl = formData.image;

      if (imageFile) {
        const formDataImages = new FormData();
        formDataImages.append('images', imageFile);

        const uploadResponse = await fetch(`${SERVER_URL}/api/upload/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formDataImages
        });

        if (!uploadResponse.ok) {
          throw new Error('Error al subir imagen');
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.images && uploadData.images.length > 0 ? uploadData.images[0] : '';

        if (!imageUrl) {
          throw new Error('Error: el servidor no devolvió una URL válida para la imagen');
        }
      }

      const serviceData = {
        name: formData.name,
        description: formData.description,
        image: imageUrl,
        schedule: formData.schedule || null,
        price: formData.price ? parseFloat(formData.price) : null,
        active: formData.active,
        order: parseInt(formData.order) || 0
      };

      if (editingId) {
        await PutWithAuth(`/services/${editingId}`, serviceData);
        setSuccessMsg('Servicio actualizado exitosamente');
      } else {
        await PostWithAuth('/services', serviceData);
        setSuccessMsg('Servicio creado exitosamente');
      }

      resetForm();
      setTimeout(() => setSuccessMsg(''), 3000);
      loadServices();
    } catch (err) {
      setError(err.message || 'Error al guardar servicio');
    }
  };

  const handleEdit = (service) => {
    setFormData({
      name: service.name,
      description: service.description || '',
      image: service.image || '',
      schedule: service.schedule || '',
      price: service.price != null ? String(service.price) : '',
      active: service.active,
      order: service.order || 0
    });
    setImagePreview(service.image ? `${SERVER_URL}${service.image}` : '');
    setImageFile(null);
    setEditingId(service.id);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de eliminar el servicio "${name}"?`)) {
      return;
    }

    try {
      await DeleteWithAuth(`/services/${id}`);
      setSuccessMsg('Servicio eliminado exitosamente');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadServices();
    } catch (err) {
      setError(err.message || 'Error al eliminar servicio');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      schedule: '',
      price: '',
      active: true,
      order: 0
    });
    setImageFile(null);
    setImagePreview('');
    setShowForm(false);
    setEditingId(null);
    setError('');
  };

  if (loading) {
    return <div className="loading">Cargando servicios...</div>;
  }

  return (
    <div className="services-page">
      <div className="page-header">
        <h1 className="page-title">Servicios</h1>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Nuevo Servicio
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {showForm && (
        <div className="card">
          <h2 className="card-title">
            {editingId ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nombre del Servicio *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Corte de cabello"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                name="description"
                className="form-input"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Describe el servicio..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Imagen del Servicio</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="form-input"
              />
              {imagePreview && (
                <div style={{ marginTop: '1rem', position: 'relative', display: 'inline-block' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 'bold'
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Horario (opcional)</label>
                <input
                  type="text"
                  name="schedule"
                  className="form-input"
                  value={formData.schedule}
                  onChange={handleChange}
                  placeholder="Ej: Lunes a Viernes 9:00 - 18:00"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Precio (opcional)</label>
                <input
                  type="number"
                  name="price"
                  className="form-input"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Orden</label>
                <input
                  type="number"
                  name="order"
                  className="form-input"
                  value={formData.order}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label checkbox-label">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                  />
                  <span>Activo</span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Actualizar' : 'Crear'} Servicio
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="services-list">
        {services.length === 0 ? (
          <div className="card">
            <p className="text-center">No hay servicios registrados</p>
          </div>
        ) : (
          services.map(service => (
            <div key={service.id} className="service-card">
              <div className="service-preview">
                {service.image ? (
                  <img src={`${SERVER_URL}${service.image}`} alt={service.name} />
                ) : (
                  <div className="service-preview-placeholder">Sin imagen</div>
                )}
              </div>
              <div className="service-info">
                <h3 className="service-name">{service.name}</h3>
                {service.description && (
                  <p className="service-description">{service.description}</p>
                )}
                <div className="service-details">
                  {service.price != null && (
                    <span className="service-price">${service.price.toFixed(2)}</span>
                  )}
                  {service.schedule && <span>Horario: {service.schedule}</span>}
                </div>
                <div className="service-meta">
                  <span className={`badge ${service.active ? 'badge-success' : 'badge-secondary'}`}>
                    {service.active ? 'Activo' : 'Inactivo'}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Orden: {service.order}
                  </span>
                </div>
                <div className="service-actions">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleEdit(service)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(service.id, service.name)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Services;

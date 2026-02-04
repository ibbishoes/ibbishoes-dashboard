import React, { useState, useEffect } from 'react';
import { GetWithAuth, PostWithAuth, PutWithAuth, DeleteWithAuth, SERVER_URL } from '../utils/api';
import './Banners.css';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    buttonText: '',
    buttonLink: '',
    active: true,
    order: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await GetWithAuth('/banners/admin');
      setBanners(data.banners || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Error al cargar banners');
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

      // Upload image if there's a new file
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

      const bannerData = {
        ...formData,
        image: imageUrl
      };

      if (editingId) {
        await PutWithAuth(`/banners/${editingId}`, bannerData);
        setSuccessMsg('Banner actualizado exitosamente');
      } else {
        await PostWithAuth('/banners', bannerData);
        setSuccessMsg('Banner creado exitosamente');
      }

      setFormData({
        title: '',
        subtitle: '',
        image: '',
        buttonText: '',
        buttonLink: '',
        active: true,
        order: 0
      });
      setImageFile(null);
      setImagePreview('');
      setShowForm(false);
      setEditingId(null);
      setTimeout(() => setSuccessMsg(''), 3000);
      loadBanners();
    } catch (err) {
      setError(err.message || 'Error al guardar banner');
    }
  };

  const handleEdit = (banner) => {
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image: banner.image,
      buttonText: banner.buttonText || '',
      buttonLink: banner.buttonLink || '',
      active: banner.active,
      order: banner.order
    });
    setImagePreview(banner.image ? `${SERVER_URL}${banner.image}` : '');
    setImageFile(null);
    setEditingId(banner.id);
    setShowForm(true);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`¿Estás seguro de eliminar el banner "${title}"?`)) {
      return;
    }

    try {
      await DeleteWithAuth(`/banners/${id}`);
      setSuccessMsg('Banner eliminado exitosamente');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadBanners();
    } catch (err) {
      setError(err.message || 'Error al eliminar banner');
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      subtitle: '',
      image: '',
      buttonText: '',
      buttonLink: '',
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
    return <div className="loading">Cargando banners...</div>;
  }

  return (
    <div className="banners-page">
      <div className="page-header">
        <h1 className="page-title">Banners</h1>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Nuevo Banner
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {showForm && (
        <div className="card">
          <h2 className="card-title">
            {editingId ? 'Editar Banner' : 'Nuevo Banner'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Título *</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subtítulo</label>
                <input
                  type="text"
                  name="subtitle"
                  className="form-input"
                  value={formData.subtitle}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Imagen del Banner *</label>
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                Formato recomendado: 1920x600px (relación 16:5) o 1920x800px. 
                La imagen ocupará todo el ancho y se ajustará automáticamente en altura.
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="form-input"
              />
              {imagePreview && (
                <div className="image-preview-container" style={{ marginTop: '1rem', position: 'relative' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="image-remove-btn"
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
                <label className="form-label">Texto del Botón</label>
                <input
                  type="text"
                  name="buttonText"
                  className="form-input"
                  value={formData.buttonText}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Enlace del Botón</label>
                <input
                  type="text"
                  name="buttonLink"
                  className="form-input"
                  value={formData.buttonLink}
                  onChange={handleChange}
                  placeholder="/products"
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
              <button type="button" className="btn btn-outline" onClick={handleCancel}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Actualizar' : 'Crear'} Banner
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="banners-list">
        {banners.length === 0 ? (
          <div className="card">
            <p className="text-center">No hay banners registrados</p>
          </div>
        ) : (
          banners.map(banner => (
            <div key={banner.id} className="banner-card">
              <div className="banner-preview">
                <img src={`${SERVER_URL}${banner.image}`} alt={banner.title} />
              </div>
              <div className="banner-info">
                <h3 className="banner-title">{banner.title}</h3>
                {banner.subtitle && <p className="banner-subtitle">{banner.subtitle}</p>}
                <div className="banner-meta">
                  <span className={`badge ${banner.active ? 'badge-success' : 'badge-secondary'}`}>
                    {banner.active ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="banner-order">Orden: {banner.order}</span>
                </div>
                <div className="banner-actions">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleEdit(banner)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(banner.id, banner.title)}
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

export default Banners;

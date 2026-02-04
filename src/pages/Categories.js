import React, { useState, useEffect } from 'react';
import { GetWithAuth, PostWithAuth, PutWithAuth, DeleteWithAuth } from '../utils/api';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await GetWithAuth('/categories');
      setCategories(data.categories || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingId) {
        await PutWithAuth(`/categories/${editingId}`, formData);
        setSuccessMsg('Categoría actualizada exitosamente');
      } else {
        await PostWithAuth('/categories', formData);
        setSuccessMsg('Categoría creada exitosamente');
      }

      setFormData({ name: '', description: '' });
      setShowForm(false);
      setEditingId(null);
      setTimeout(() => setSuccessMsg(''), 3000);
      loadCategories();
    } catch (err) {
      setError(err.message || 'Error al guardar categoría');
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de eliminar la categoría "${name}"?`)) {
      return;
    }

    try {
      await DeleteWithAuth(`/categories/${id}`);
      setSuccessMsg('Categoría eliminada exitosamente');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadCategories();
    } catch (err) {
      setError(err.message || 'Error al eliminar categoría');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '' });
    setShowForm(false);
    setEditingId(null);
    setError('');
  };

  if (loading) {
    return <div className="loading">Cargando categorías...</div>;
  }

  return (
    <div className="categories-page">
      <div className="page-header">
        <h1 className="page-title">Categorías</h1>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Nueva Categoría
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {showForm && (
        <div className="card">
          <h2 className="card-title">
            {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                name="description"
                className="form-textarea"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={handleCancel}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Actualizar' : 'Crear'} Categoría
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-3">
        {categories.length === 0 ? (
          <div className="card">
            <p className="text-center">No hay categorías registradas</p>
          </div>
        ) : (
          categories.map(category => (
            <div key={category.id} className="category-card">
              <h3 className="category-name">{category.name}</h3>
              {category.description && (
                <p className="category-description">{category.description}</p>
              )}
              <div className="category-actions">
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => handleEdit(category)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(category.id, category.name)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Categories;

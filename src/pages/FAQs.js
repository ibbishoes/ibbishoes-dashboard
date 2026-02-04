import React, { useState, useEffect } from 'react';
import { GetWithAuth, PostWithAuth, PutWithAuth, DeleteWithAuth } from '../utils/api';
import './FAQs.css';

const FAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    question: '',
    answer: ''
  });

  const categories = ['Compras', 'Envíos', 'Devoluciones', 'Productos', 'Cuenta'];

  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    try {
      setLoading(true);
      const data = await GetWithAuth('/faqs');
      setFaqs(data.faqs || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Error al cargar FAQs');
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
        await PutWithAuth(`/faqs/${editingId}`, formData);
        setSuccessMsg('FAQ actualizada exitosamente');
      } else {
        await PostWithAuth('/faqs', formData);
        setSuccessMsg('FAQ creada exitosamente');
      }

      setFormData({ category: '', question: '', answer: '' });
      setShowForm(false);
      setEditingId(null);
      setTimeout(() => setSuccessMsg(''), 3000);
      loadFaqs();
    } catch (err) {
      setError(err.message || 'Error al guardar FAQ');
    }
  };

  const handleEdit = (faq) => {
    setFormData({
      category: faq.category,
      question: faq.question,
      answer: faq.answer
    });
    setEditingId(faq.id);
    setShowForm(true);
  };

  const handleDelete = async (id, question) => {
    if (!window.confirm(`¿Estás seguro de eliminar esta pregunta?`)) {
      return;
    }

    try {
      await DeleteWithAuth(`/faqs/${id}`);
      setSuccessMsg('FAQ eliminada exitosamente');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadFaqs();
    } catch (err) {
      setError(err.message || 'Error al eliminar FAQ');
    }
  };

  const handleCancel = () => {
    setFormData({ category: '', question: '', answer: '' });
    setShowForm(false);
    setEditingId(null);
    setError('');
  };

  // Agrupar FAQs por categoría
  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  if (loading) {
    return <div className="loading">Cargando FAQs...</div>;
  }

  return (
    <div className="faqs-page">
      <div className="page-header">
        <h1 className="page-title">Preguntas Frecuentes</h1>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Nueva FAQ
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {showForm && (
        <div className="card">
          <h2 className="card-title">
            {editingId ? 'Editar FAQ' : 'Nueva FAQ'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Categoría *</label>
              <select
                name="category"
                className="form-input"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Pregunta *</label>
              <input
                type="text"
                name="question"
                className="form-input"
                value={formData.question}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Respuesta *</label>
              <textarea
                name="answer"
                className="form-textarea"
                value={formData.answer}
                onChange={handleChange}
                rows="4"
                required
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={handleCancel}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Actualizar' : 'Crear'} FAQ
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="faqs-list">
        {faqs.length === 0 ? (
          <div className="card">
            <p className="text-center">No hay FAQs registradas</p>
          </div>
        ) : (
          Object.keys(groupedFaqs).sort().map(category => (
            <div key={category} className="faq-category">
              <h2 className="faq-category-title">{category}</h2>
              <div className="faq-items">
                {groupedFaqs[category].map(faq => (
                  <div key={faq.id} className="faq-item">
                    <div className="faq-content">
                      <h3 className="faq-question">{faq.question}</h3>
                      <p className="faq-answer">{faq.answer}</p>
                    </div>
                    <div className="faq-actions">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleEdit(faq)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(faq.id, faq.question)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FAQs;

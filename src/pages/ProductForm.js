import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GetWithAuth, PostWithAuth, PutWithAuth } from '../utils/api';
import './ProductForm.css';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    categoryId: '',
    stock: '',
    sizes: '',
    colors: '',
    featured: false,
    active: true
  });
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadProduct();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await GetWithAuth('/categories');
      setCategories(data.categories || []);
    } catch (err) {
      setError('Error al cargar categorías');
    }
  };

  const loadProduct = async () => {
    try {
      const data = await GetWithAuth(`/products/${id}`);
      const product = data.product;

      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        discount: product.discount || '',
        categoryId: product.categoryId || '',
        stock: product.stock || '',
        sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
        colors: Array.isArray(product.colors) ? product.colors.join(', ') : '',
        featured: product.featured || false,
        active: product.active !== undefined ? product.active : true
      });

      // Cargar imágenes existentes
      if (Array.isArray(product.images) && product.images.length > 0) {
        setImages(product.images);
        setImagePreviews(product.images.map(url => ({
          url: `http://localhost:5000${url}`,
          isExisting: true
        })));
      }
    } catch (err) {
      setError('Error al cargar producto');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prevFiles => [...prevFiles, ...files]);

    // Crear previsualizaciones
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, {
          url: reader.result,
          isExisting: false,
          file: file
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    const preview = imagePreviews[index];

    if (preview.isExisting) {
      // Remover de imágenes existentes
      setImages(prev => prev.filter((_, i) => i !== index));
    } else {
      // Remover de archivos nuevos
      setImageFiles(prev => prev.filter(file => file !== preview.file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let uploadedImageUrls = [...images]; // Mantener imágenes existentes

      // Subir nuevas imágenes si hay
      if (imageFiles.length > 0) {
        const formDataImages = new FormData();
        imageFiles.forEach(file => {
          formDataImages.append('images', file);
        });

        const uploadResponse = await fetch('http://localhost:5000/api/upload/images', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formDataImages
        });

        const uploadResult = await uploadResponse.json();

        if (uploadResult.success) {
          uploadedImageUrls = [...uploadedImageUrls, ...uploadResult.images];
        } else {
          throw new Error(uploadResult.message || 'Error al subir imágenes');
        }
      }

      // Preparar datos del producto
      const discountValue = formData.discount === '' || formData.discount === null || formData.discount === undefined 
        ? 0 
        : (isNaN(parseFloat(formData.discount)) ? 0 : parseFloat(formData.discount));
      
      const submitData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        discount: discountValue,
        stock: parseInt(formData.stock) || 0,
        sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
        colors: formData.colors ? formData.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
        images: uploadedImageUrls,
        active: formData.active
      };

      if (isEdit) {
        await PutWithAuth(`/products/${id}`, submitData);
      } else {
        await PostWithAuth('/products', submitData);
      }

      navigate('/products');
    } catch (err) {
      setError(err.message || 'Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form-page">
      <h1 className="page-title">{isEdit ? 'Editar' : 'Nuevo'} Producto</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
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
              <label className="form-label">Categoría *</label>
              <select
                name="categoryId"
                className="form-select"
                value={formData.categoryId}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
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

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Precio *</label>
              <input
                type="number"
                name="price"
                className="form-input"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descuento (%)</label>
              <input
                type="number"
                name="discount"
                className="form-input"
                step="0.01"
                min="0"
                max="100"
                value={formData.discount}
                onChange={handleChange}
                placeholder="0"
              />
              <small className="form-help">Porcentaje de descuento (0-100)</small>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Stock *</label>
              <input
                type="number"
                name="stock"
                className="form-input"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Tamaños (separados por coma)</label>
              <input
                type="text"
                name="sizes"
                className="form-input"
                placeholder="S, M, L, XL"
                value={formData.sizes}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Colores (separados por coma)</label>
              <input
                type="text"
                name="colors"
                className="form-input"
                placeholder="Rojo, Azul, Verde"
                value={formData.colors}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Imágenes del Producto</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="form-input"
            />
            <small className="form-help">Selecciona una o más imágenes (JPG, PNG, GIF, WEBP - máx 5MB cada una)</small>
          </div>

          {imagePreviews.length > 0 && (
            <div className="image-preview-container">
              <label className="form-label">Vista previa de imágenes ({imagePreviews.length})</label>
              <div className="image-preview-grid">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={preview.url} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="image-remove-btn"
                      onClick={() => removeImage(index)}
                      title="Eliminar imagen"
                    >
                      ×
                    </button>
                    {preview.isExisting && (
                      <span className="image-existing-badge">Existente</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                name="featured"
                className="form-checkbox"
                checked={formData.featured}
                onChange={handleChange}
              />
              Producto destacado
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                name="active"
                className="form-checkbox"
                checked={formData.active}
                onChange={handleChange}
              />
              Producto activo
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/products')}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GetWithAuth, DeleteWithAuth, PutWithAuth } from '../utils/api';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        GetWithAuth('/products?includeInactive=true'),
        GetWithAuth('/categories')
      ]);

      setProducts(productsData.products || []);
      setCategories(categoriesData.categories || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto "${name}"?`)) {
      return;
    }

    try {
      await DeleteWithAuth(`/products/${id}`);
      setSuccessMsg('Producto eliminado exitosamente');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadData();
    } catch (err) {
      setError(err.message || 'Error al eliminar producto');
    }
  };

  const handleToggleActive = async (product) => {
    try {
      const newActive = !product.active;
      await PutWithAuth(`/products/${product.id}`, {
        ...product,
        active: newActive
      });
      setSuccessMsg(`Producto ${newActive ? 'activado' : 'desactivado'} exitosamente`);
      setTimeout(() => setSuccessMsg(''), 3000);
      loadData();
    } catch (err) {
      setError(err.message || 'Error al cambiar estado del producto');
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Sin categoría';
  };

  if (loading) {
    return <div className="loading">Cargando productos...</div>;
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1 className="page-title">Productos</h1>
        <Link to="/products/new" className="btn btn-primary">
          + Nuevo Producto
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Descuento</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Destacado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">
                  No hay productos registrados
                </td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.id} className={product.active === false ? 'product-inactive' : ''}>
                  <td>
                    <strong>{product.name}</strong>
                  </td>
                  <td>{getCategoryName(product.categoryId)}</td>
                  <td>
                    {product.discount > 0 ? (
                      <div>
                        <div style={{ color: '#667eea', fontWeight: '600' }}>
                          ${product.finalPrice?.toFixed(2) || (product.price * (1 - product.discount / 100)).toFixed(2)}
                        </div>
                        <div style={{ color: '#999', textDecoration: 'line-through', fontSize: '0.85rem' }}>
                          ${product.price.toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      `$${product.price.toFixed(2)}`
                    )}
                  </td>
                  <td>
                    {product.discount > 0 ? (
                      <span style={{ background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600' }}>
                        -{product.discount}%
                      </span>
                    ) : (
                      <span style={{ color: '#999' }}>-</span>
                    )}
                  </td>
                  <td>{product.stock}</td>
                  <td>
                    <button
                      onClick={() => handleToggleActive(product)}
                      className={`btn btn-sm ${product.active !== false ? 'btn-success' : 'btn-secondary'}`}
                      title={product.active !== false ? 'Desactivar producto' : 'Activar producto'}
                    >
                      {product.active !== false ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td>
                    {product.featured ? (
                      <span className="badge badge-success">Sí</span>
                    ) : (
                      <span className="badge badge-secondary">No</span>
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link
                        to={`/products/edit/${product.id}`}
                        className="btn btn-sm btn-outline"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="btn btn-sm btn-danger"
                      >
                        Eliminar
                      </button>
                    </div>
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

export default Products;

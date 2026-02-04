import React, { useState, useEffect, useCallback } from 'react';
import { GetWithAuth } from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    loading: true
  });

  const loadStats = useCallback(async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        GetWithAuth('/products'),
        GetWithAuth('/categories')
      ]);

      setStats({
        totalProducts: productsData.products?.length || 0,
        totalCategories: categoriesData.categories?.length || 0,
        loading: false
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (stats.loading) {
    return <div className="loading">Cargando estadísticas...</div>;
  }

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      <div className="grid grid-2">
        <div className="stat-card">
          <div className="stat-icon products">📦</div>
          <div className="stat-info">
            <h3 className="stat-value">{stats.totalProducts}</h3>
            <p className="stat-label">Productos</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon categories">🏷️</div>
          <div className="stat-info">
            <h3 className="stat-value">{stats.totalCategories}</h3>
            <p className="stat-label">Categorías</p>
          </div>
        </div>
      </div>

      <div className="card mt-3">
        <h2 className="card-title">Bienvenido al Dashboard</h2>
        <p>Desde aquí puedes administrar todos los productos y categorías de tu tienda.</p>
        <ul className="dashboard-features">
          <li>✅ Gestión completa de productos</li>
          <li>✅ Organización por categorías</li>
          <li>✅ Interfaz responsiva y moderna</li>
          <li>✅ Sistema de autenticación seguro</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;

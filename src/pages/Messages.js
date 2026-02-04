import React, { useState, useEffect } from 'react';
import { GetWithAuth, DeleteWithAuth, PutWithAuth } from '../utils/api';
import './Messages.css';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await GetWithAuth('/messages');
      setMessages(data.messages || []);
      setError('');
    } catch (err) {
      setError('Error al cargar los mensajes');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await PutWithAuth(`/messages/${id}/read`, {});
      await loadMessages();
    } catch (err) {
      console.error('Error marking message as read:', err);
      setError('Error al marcar como leído');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este mensaje?')) {
      try {
        await DeleteWithAuth(`/messages/${id}`);
        await loadMessages();
      } catch (err) {
        console.error('Error deleting message:', err);
        setError('Error al eliminar mensaje');
      }
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'unread') return !msg.read;
    if (filter === 'read') return msg.read;
    return true;
  });

  const unreadCount = messages.filter(msg => !msg.read).length;

  if (loading) {
    return <div className="loading">Cargando mensajes...</div>;
  }

  return (
    <div className="messages-container">
      <div className="messages-header">
        <div>
          <h1>Mensajes de Contacto</h1>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} sin leer</span>
          )}
        </div>
        <div className="messages-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todos ({messages.length})
          </button>
          <button
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Sin leer ({unreadCount})
          </button>
          <button
            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Leídos ({messages.length - unreadCount})
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {filteredMessages.length === 0 ? (
        <div className="messages-empty">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
          </svg>
          <p>No hay mensajes {filter === 'unread' ? 'sin leer' : filter === 'read' ? 'leídos' : ''}</p>
        </div>
      ) : (
        <div className="messages-list">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`message-card ${!message.read ? 'message-unread' : ''}`}
            >
              <div className="message-header">
                <div className="message-sender">
                  <h3>{message.name}</h3>
                  <span className="message-email">{message.email}</span>
                  {message.phone && <span className="message-phone"> | Tel: {message.phone}</span>}
                </div>
                <div className="message-meta">
                  <span className="message-date">
                    {new Date(message.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {!message.read && <span className="status-badge unread">Sin leer</span>}
                </div>
              </div>

              <div className="message-subject">
                <strong>Asunto:</strong> {message.subject}
              </div>

              <div className="message-content">
                <p>{message.message}</p>
              </div>

              <div className="message-actions">
                {!message.read && (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleMarkAsRead(message.id)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
                    </svg>
                    Marcar como leído
                  </button>
                )}
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(message.id)}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
                  </svg>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;

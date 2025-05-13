import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Badge, Button } from 'react-bootstrap';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Handle notification click and navigation
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.data) {
      const { type, conversationId, requestId, paymentId, propertyId } = notification.data;
      
      if (type === 'chat' && conversationId) {
        navigate(`/messages`, { state: { conversationId } });
      } else if (type === 'maintenance' && requestId) {
        navigate(`/maintenance/${requestId}`);
      } else if (type === 'payment' && paymentId) {
        navigate(`/payments/${paymentId}`);
      } else if (type === 'property' && propertyId) {
        navigate(`/properties/${propertyId}`);
      } else {
        // Default action
        navigate('/dashboard');
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'payment':
        return <i className="bi bi-credit-card text-success fs-4"></i>;
      case 'message':
        return <i className="bi bi-chat-dots text-primary fs-4"></i>;
      case 'maintenance':
        return <i className="bi bi-tools text-warning fs-4"></i>;
      case 'system':
        return <i className="bi bi-info-circle text-info fs-4"></i>;
      default:
        return <i className="bi bi-bell fs-4"></i>;
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary mb-0">
          Notifications
          {unreadCount > 0 && (
            <Badge bg="danger" className="ms-2">{unreadCount} new</Badge>
          )}
        </h2>
        {unreadCount > 0 && (
          <Button variant="outline-primary" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <Card className="shadow-sm border-0">
        {loading ? (
          <Card.Body className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading notifications...</p>
          </Card.Body>
        ) : notifications.length === 0 ? (
          <Card.Body className="text-center py-5">
            <i className="bi bi-bell-slash text-muted" style={{fontSize: '4rem'}}></i>
            <h4 className="mt-3">No notifications</h4>
            <p className="text-muted">You don't have any notifications at the moment.</p>
          </Card.Body>
        ) : (
          <ListGroup variant="flush">
            {notifications.map(notification => (
              <ListGroup.Item 
                key={notification.id} 
                className={`py-3 px-4 ${!notification.read ? 'bg-light' : ''}`}
                action
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="d-flex">
                  <div className="me-3">
                    {getNotificationIcon(notification.data?.type || 'system')}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-1 fw-bold">
                        {notification.title}
                        {!notification.read && (
                          <Badge bg="danger" pill className="ms-2">New</Badge>
                        )}
                      </h6>
                      <div>
                        <small className="text-muted me-3">
                          {formatDate(notification.timestamp)}
                        </small>
                        <Button 
                          variant="link" 
                          className="p-0 text-danger" 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                        >
                          <i className="bi bi-x-circle"></i>
                        </Button>
                      </div>
                    </div>
                    <p className="mb-0">{notification.body}</p>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card>
    </div>
  );
};

export default NotificationsPage;

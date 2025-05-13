import React, { useState } from 'react';
import { Dropdown, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { FaBell } from 'react-icons/fa';

const NotificationComponent = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAllNotifications } = useNotifications();
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

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
        navigate('/dashboard');
      }
    }
    
    setShow(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Dropdown show={show} onToggle={(isOpen) => setShow(isOpen)} align="end">
      <Dropdown.Toggle variant="link" id="notification-dropdown" className="position-relative p-0 bg-transparent border-0">
        <FaBell size={20} className="text-secondary" />
        {unreadCount > 0 && (
          <Badge 
            bg="danger" 
            pill 
            className="position-absolute" 
            style={{ top: '-5px', right: '-5px', fontSize: '0.6rem' }}
          >
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ width: '300px', maxHeight: '400px', overflowY: 'auto' }}>
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <h6 className="mb-0">Notifications</h6>
          {notifications.length > 0 && (
            <div>
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 text-primary" 
                onClick={markAllAsRead}
              >
                Mark all as read
              </Button>
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 text-danger ms-2" 
                onClick={clearAllNotifications}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-3 text-muted">
            <p className="mb-0">No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <Dropdown.Item 
              key={notification.id} 
              onClick={() => handleNotificationClick(notification)}
              className={`border-bottom ${!notification.read ? 'bg-light' : ''}`}
            >
              <div className="d-flex flex-column">
                <div className="d-flex justify-content-between">
                  <strong>{notification.title}</strong>
                  {!notification.read && <Badge bg="primary" pill className="ms-2">New</Badge>}
                </div>
                <p className="mb-1">{notification.body}</p>
                <small className="text-muted">{formatTime(notification.timestamp)}</small>
              </div>
            </Dropdown.Item>
          ))
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationComponent;

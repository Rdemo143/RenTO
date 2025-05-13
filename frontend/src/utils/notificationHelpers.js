/**
 * Utility functions for handling notifications in the RenTO application
 */

import { displayNotification } from '../services/notificationService';

/**
 * Send a payment notification
 * @param {Object} payment - Payment data
 * @param {string} recipientName - Name of the recipient
 */
export const sendPaymentNotification = (payment, recipientName) => {
  const title = `Payment ${payment.status === 'completed' ? 'Received' : 'Reminder'}`;
  const body = payment.status === 'completed' 
    ? `Payment of $${payment.amount} received from ${recipientName}`
    : `Rent payment of $${payment.amount} is due on ${new Date(payment.dueDate).toLocaleDateString()}`;
  
  displayNotification(title, body, {
    type: 'payment',
    paymentId: payment._id
  });
};

/**
 * Send a maintenance request notification
 * @param {Object} request - Maintenance request data
 * @param {string} status - Status of the request
 */
export const sendMaintenanceNotification = (request, status) => {
  let title, body;
  
  switch(status) {
    case 'submitted':
      title = 'New Maintenance Request';
      body = `A new maintenance request has been submitted for ${request.property?.title || 'your property'}`;
      break;
    case 'inProgress':
      title = 'Maintenance Request Update';
      body = `Your maintenance request for ${request.issueType} is now in progress`;
      break;
    case 'completed':
      title = 'Maintenance Request Completed';
      body = `Your maintenance request for ${request.issueType} has been completed`;
      break;
    case 'cancelled':
      title = 'Maintenance Request Cancelled';
      body = `Your maintenance request for ${request.issueType} has been cancelled`;
      break;
    default:
      title = 'Maintenance Request Update';
      body = `There is an update to your maintenance request for ${request.issueType}`;
  }
  
  displayNotification(title, body, {
    type: 'maintenance',
    requestId: request._id
  });
};

/**
 * Send a lease agreement notification
 * @param {Object} lease - Lease agreement data
 * @param {string} status - Status of the lease
 */
export const sendLeaseNotification = (lease, status) => {
  let title, body;
  
  switch(status) {
    case 'created':
      title = 'New Lease Agreement';
      body = `A new lease agreement has been created for ${lease.property?.title || 'a property'}`;
      break;
    case 'signed':
      title = 'Lease Agreement Signed';
      body = `The lease agreement for ${lease.property?.title || 'your property'} has been signed`;
      break;
    case 'expiring':
      title = 'Lease Agreement Expiring';
      body = `Your lease agreement for ${lease.property?.title || 'your property'} is expiring on ${new Date(lease.endDate).toLocaleDateString()}`;
      break;
    default:
      title = 'Lease Agreement Update';
      body = `There is an update to your lease agreement for ${lease.property?.title || 'your property'}`;
  }
  
  displayNotification(title, body, {
    type: 'lease',
    leaseId: lease._id,
    propertyId: lease.property?._id
  });
};

/**
 * Send a chat message notification
 * @param {Object} message - Message data
 * @param {string} senderName - Name of the sender
 */
export const sendChatNotification = (message, senderName) => {
  const title = `New Message from ${senderName}`;
  const body = message.content.length > 50 
    ? `${message.content.substring(0, 50)}...` 
    : message.content;
  
  displayNotification(title, body, {
    type: 'chat',
    conversationId: message.conversationId
  });
};

/**
 * Send a property notification
 * @param {Object} property - Property data
 * @param {string} action - Action performed on the property
 */
export const sendPropertyNotification = (property, action) => {
  let title, body;
  
  switch(action) {
    case 'new':
      title = 'New Property Listed';
      body = `A new property "${property.title}" has been listed`;
      break;
    case 'updated':
      title = 'Property Updated';
      body = `The property "${property.title}" has been updated`;
      break;
    case 'rented':
      title = 'Property Rented';
      body = `The property "${property.title}" has been rented`;
      break;
    default:
      title = 'Property Update';
      body = `There is an update to the property "${property.title}"`;
  }
  
  displayNotification(title, body, {
    type: 'property',
    propertyId: property._id
  });
};

import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, ListGroup, Badge, InputGroup, Spinner, Alert, Container } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { getUserConversations, getMessagesForConversation, sendMessage as sendMessageApi, markMessagesAsRead } from '../services/api';
import './Chat.css';

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  
  // Check if we have a conversationId from navigation state (e.g., from property details)
  const conversationIdFromState = location.state?.conversationId;

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);
  
  // Handle conversation from property details page
  useEffect(() => {
    if (conversationIdFromState && conversations.length > 0) {
      console.log('Loading conversation from state:', conversationIdFromState);
      const conversation = conversations.find(c => c._id === conversationIdFromState);
      if (conversation) {
        loadMessages(conversationIdFromState);
      }
    }
  }, [conversationIdFromState, conversations]);
  
  // Auto-scroll to bottom of messages when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Function to fetch conversations from API
  const fetchConversations = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUserConversations();
      setConversations(data);
    } catch (err) {
      setError('Failed to load conversations. Please try again.');
      console.error('Error fetching conversations:', err);
    }
    setLoading(false);
  };

  // Function to load messages for a conversation
  const loadMessages = async (conversationId) => {
    setLoading(true);
    setError('');
    try {
      // Find the selected conversation
      const selectedConv = conversations.find(c => c._id === conversationId);
      setSelectedConversation(selectedConv);
      
      // Fetch messages for this conversation
      const messagesData = await getMessagesForConversation(conversationId);
      setMessages(messagesData);
      
      // Mark messages as read if there are unread messages
      if (selectedConv.unreadCount > 0) {
        const unreadMessageIds = messagesData
          .filter(msg => !msg.isRead && msg.sender._id !== user._id)
          .map(msg => msg._id);
          
        if (unreadMessageIds.length > 0) {
          await markMessagesAsRead(unreadMessageIds);
          // Update the unread count in conversations list
          setConversations(prevConversations => 
            prevConversations.map(conv => 
              conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
            )
          );
        }
      }
    } catch (err) {
      setError('Failed to load messages. Please try again.');
      console.error('Error loading messages:', err);
    }
    setLoading(false);
  };

  // Function to send a message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
    
    setSendingMessage(true);
    try {
      // Optimistically add message to UI
      const tempId = `temp-${Date.now()}`;
      const tempMessage = {
        _id: tempId,
        sender: { _id: user._id, name: user.name },
        content: newMessage,
        createdAt: new Date().toISOString(),
        isRead: false,
        isOptimistic: true // Flag to identify optimistic updates
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      
      // Send message to API
      const sentMessage = await sendMessageApi(selectedConversation._id, newMessage);
      
      // Replace optimistic message with actual message from server
      setMessages(prev => 
        prev.map(msg => msg._id === tempId ? sentMessage : msg)
      );
      
      // Update conversation with latest message
      setConversations(prev => 
        prev.map(conv => 
          conv._id === selectedConversation._id 
            ? { 
                ...conv, 
                lastMessage: newMessage,
                updatedAt: new Date().toISOString() 
              } 
            : conv
        )
      );
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Error sending message:', err);
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => !msg.isOptimistic));
    }
    setSendingMessage(false);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for messages display
  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Same day - show time only
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${formatDate(dateString)}`;
    }
    // Yesterday - show 'Yesterday' and time
    else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${formatDate(dateString)}`;
    }
    // Other days - show date and time
    else {
      return `${date.toLocaleDateString()} at ${formatDate(dateString)}`;
    }
  };

  if (loading && conversations.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" className="mb-3">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <h4>Loading conversations...</h4>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4 fw-bold text-primary">Messages</h2>
      
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      
      <div className="row">
        {/* Conversation List */}
        <div className="col-md-4 mb-4 mb-md-0">
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-primary text-white py-3">
              <h5 className="mb-0">Conversations</h5>
            </Card.Header>
            <ListGroup variant="flush" className="conversation-list">
              {loading && conversations.length === 0 ? (
                <ListGroup.Item className="text-center py-4">
                  <Spinner animation="border" size="sm" role="status" />
                </ListGroup.Item>
              ) : conversations.length === 0 ? (
                <ListGroup.Item className="text-center py-4">No conversations yet</ListGroup.Item>
              ) : (
                conversations.map(conv => {
                  // Find the other participant (not the current user)
                  const otherParticipant = conv.participants?.find(p => p._id !== user?._id);
                  const lastMessageContent = typeof conv.lastMessage === 'string' ? conv.lastMessage : 
                                           conv.lastMessage?.content || 'No messages yet';
                  
                  return (
                    <ListGroup.Item 
                      key={conv._id} 
                      action 
                      active={selectedConversation?._id === conv._id}
                      onClick={() => loadMessages(conv._id)}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div className="fw-bold">
                          {otherParticipant?.name || 'Unknown User'}
                        </div>
                        <div className="text-truncate" style={{maxWidth: '200px'}}>
                          {lastMessageContent}
                        </div>
                        <small className="text-muted">
                          {new Date(conv.updatedAt).toLocaleDateString()}
                        </small>
                        {conv.property && (
                          <small className="d-block text-muted">
                            Property: {conv.property.title || 
                                      (conv.property.address ? `${conv.property.address.street}` : 'Property')}
                          </small>
                        )}
                      </div>
                      {conv.unreadCount > 0 && (
                        <Badge bg="danger" pill>
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </ListGroup.Item>
                  );
                })
              )}
            </ListGroup>
          </Card>
        </div>
        
        {/* Message Area */}
        <div className="col-md-8">
          <Card className="shadow-sm border-0 h-100">
            {selectedConversation ? (
              <>
                <Card.Header className="bg-light py-3">
                  <h5 className="mb-0">
                    {selectedConversation.participants && selectedConversation.participants.length > 0 
                      ? selectedConversation.participants.find(p => p._id !== user?._id)?.name || 'Chat'
                      : 'Chat'}
                  </h5>
                  {selectedConversation.property && (
                    <small className="text-muted">
                      Property: {selectedConversation.property.title || selectedConversation.property.address?.street || 'Property'}
                    </small>
                  )}
                </Card.Header>
                
                {loading ? (
                  <div className="d-flex justify-content-center align-items-center" style={{height: '300px'}}>
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading messages...</span>
                    </Spinner>
                  </div>
                ) : (
                  <div className="messages-display" style={{maxHeight: '400px', overflowY: 'auto', padding: '15px'}}>
                    {messages.length === 0 ? (
                      <div className="text-center text-muted p-4">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      <>
                        {messages.map(msg => (
                          <div key={msg._id} className={`message ${msg.sender?._id === user?._id ? 'sent' : 'received'}`}>
                            <div className={`message-bubble ${msg.sender?._id === user?._id ? 'bg-primary text-white' : 'bg-light'}`}>
                              {msg.content}
                            </div>
                            <div className="message-info">
                              <small className="text-muted">{formatMessageDate(msg.createdAt)}</small>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} /> {/* Scroll reference */}
                      </>
                    )}
                  </div>
                )}
                
                <Card.Footer className="bg-white border-top-0 p-3">
                  <Form onSubmit={sendMessage}>
                    <InputGroup>
                      <Form.Control
                        as="textarea"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        style={{ height: '50px', resize: 'none' }}
                        disabled={sendingMessage}
                      />
                      <Button variant="primary" type="submit" disabled={sendingMessage || !newMessage.trim()}>
                        {sendingMessage ? (
                          <Spinner animation="border" size="sm" role="status" />
                        ) : (
                          <i className="bi bi-send-fill"></i>
                        )}
                      </Button>
                    </InputGroup>
                  </Form>
                </Card.Footer>
              </>
            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center h-100 p-4">
                <i className="bi bi-chat-dots text-muted" style={{fontSize: '4rem'}}></i>
                <h4 className="mt-3">Select a conversation</h4>
                <p className="text-muted text-center">Choose a conversation from the list to start messaging</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default ChatPage;

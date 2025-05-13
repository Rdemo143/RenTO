import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [validated, setValidated] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
    } else {
      // In a real app, you would send the form data to your backend here
      console.log('Form submitted:', formData);
      setSubmitted(true);
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setTimeout(() => setSubmitted(false), 5000);
    }
    
    setValidated(true);
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    viewport: { once: true }
  };

  return (
    <Container className="py-5">
      <motion.div
        initial="initial"
        animate="animate"
        viewport={{ once: true }}
      >
        {/* Header Section */}
        <motion.div variants={fadeIn} className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-4">Contact Us</h1>
          <div className="mx-auto" style={{ width: '70px', height: '4px', background: 'var(--primary-color)', marginBottom: '1.5rem' }}></div>
          <p className="lead fs-4 text-muted">We'd love to hear from you. Get in touch with our team.</p>
        </motion.div>

        <Row className="g-5">
          {/* Contact Form */}
          <Col lg={7}>
            <motion.div variants={fadeIn}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4 p-md-5">
                  <h2 className="fw-bold mb-4">Send Us a Message</h2>
                  
                  {submitted && (
                    <Alert variant="success" dismissible>
                      <i className="bi bi-check-circle-fill me-2"></i>
                      Thank you for your message! We'll get back to you shortly.
                    </Alert>
                  )}
                  
                  <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group controlId="contactName">
                          <Form.Label>Your Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            required
                          />
                          <Form.Control.Feedback type="invalid">
                            Please provide your name.
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group controlId="contactEmail">
                          <Form.Label>Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                          />
                          <Form.Control.Feedback type="invalid">
                            Please provide a valid email address.
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3" controlId="contactSubject">
                      <Form.Label>Subject</Form.Label>
                      <Form.Control
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="What is this regarding?"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide a subject.
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-4" controlId="contactMessage">
                      <Form.Label>Message</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="How can we help you?"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide your message.
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Button type="submit" variant="primary" size="lg" className="px-4">
                      <i className="bi bi-send me-2"></i>
                      Send Message
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
          
          {/* Contact Information */}
          <Col lg={5}>
            <motion.div variants={fadeIn}>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-4">
                  <h3 className="fw-bold mb-4">Contact Information</h3>
                  
                  <div className="d-flex mb-4">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px', minWidth: '50px' }}>
                      <i className="bi bi-geo-alt text-primary fs-4"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold">Our Office</h5>
                      <p className="mb-0">123 Property Lane, Suite 456<br />San Francisco, CA 94103</p>
                    </div>
                  </div>
                  
                  <div className="d-flex mb-4">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px', minWidth: '50px' }}>
                      <i className="bi bi-telephone text-primary fs-4"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold">Phone</h5>
                      <p className="mb-0">(123) 456-7890</p>
                    </div>
                  </div>
                  
                  <div className="d-flex mb-4">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px', minWidth: '50px' }}>
                      <i className="bi bi-envelope text-primary fs-4"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold">Email</h5>
                      <p className="mb-0">support@rento.com</p>
                    </div>
                  </div>
                  
                  <div className="d-flex">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px', minWidth: '50px' }}>
                      <i className="bi bi-clock text-primary fs-4"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold">Business Hours</h5>
                      <p className="mb-0">Monday - Friday: 9:00 AM - 6:00 PM<br />Saturday: 10:00 AM - 4:00 PM<br />Sunday: Closed</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
              
              <Card className="border-0 shadow-sm bg-primary text-white">
                <Card.Body className="p-4">
                  <h3 className="fw-bold mb-3">Connect With Us</h3>
                  <p>Follow us on social media to stay updated with the latest properties and news.</p>
                  <div className="d-flex gap-3 mt-4">
                    <a href="#" className="text-white bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-facebook"></i>
                    </a>
                    <a href="#" className="text-white bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-twitter"></i>
                    </a>
                    <a href="#" className="text-white bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-instagram"></i>
                    </a>
                    <a href="#" className="text-white bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-linkedin"></i>
                    </a>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
        
        {/* Map Section */}
        <motion.div variants={fadeIn} className="mt-5">
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.1332899194894!2d-122.4194!3d37.7749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076adff!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1620751174264!5m2!1sen!2sus" 
                width="100%" 
                height="450" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="RenTO Office Location"
              ></iframe>
            </Card.Body>
          </Card>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default ContactPage;

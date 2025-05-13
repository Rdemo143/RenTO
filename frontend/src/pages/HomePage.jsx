import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Image, Carousel } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

function HomePage() {
  const { isAuthenticated, user } = useAuth();

  const heroStyle = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'white',
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden'
  };
  
  // Animation variants for framer-motion
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };
  
  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <>
      {/* Hero Section */}
      <div style={heroStyle} className="mb-5">
        <Container>
          <motion.div
            className="text-center py-5"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.h1 
              className="display-2 fw-bold mb-4" 
              variants={fadeIn}
            >
              Find Your Perfect <span className="text-primary">Rental Home</span>
            </motion.h1>
            <motion.p 
              className="lead fs-3 mb-4"
              variants={fadeIn}
            >
              Your ultimate solution for seamless property management and rental experience.
            </motion.p>
            <motion.p 
              className="fs-5 mb-5"
              variants={fadeIn}
            >
              Connecting property owners and tenants with powerful tools and simplified processes.
            </motion.p>
            
            <motion.div variants={fadeIn}>
              {!isAuthenticated && (
                <div className="d-flex justify-content-center gap-3 mt-5">
                  <Button 
                    as={Link} 
                    to="/register" 
                    variant="primary" 
                    size="lg" 
                    className="fw-bold px-4 py-3"
                  >
                    <i className="bi bi-house-door me-2"></i>
                    Get Started as Tenant
                  </Button>
                  <Button 
                    as={Link} 
                    to="/register?role=owner" 
                    variant="light" 
                    size="lg" 
                    className="fw-bold px-4 py-3"
                  >
                    <i className="bi bi-building me-2"></i>
                    List Your Property
                  </Button>
                </div>
              )}
              
              {isAuthenticated && user?.role === 'tenant' && (
                <Button 
                  as={Link} 
                  to="/properties" 
                  variant="primary" 
                  size="lg" 
                  className="mt-4 fw-bold px-4 py-3"
                >
                  <i className="bi bi-search me-2"></i>
                  Browse Properties
                </Button>
              )}
              
              {isAuthenticated && user?.role === 'owner' && (
                <Button 
                  as={Link} 
                  to="/owner/dashboard" 
                  variant="primary" 
                  size="lg" 
                  className="mt-4 fw-bold px-4 py-3"
                >
                  <i className="bi bi-speedometer2 me-2"></i>
                  Go to Your Dashboard
                </Button>
              )}
            </motion.div>
            
            <motion.div 
              className="mt-5 pt-5"
              variants={fadeIn}
            >
              <Row className="justify-content-center text-center">
                <Col md={3} className="mb-4">
                  <div className="bg-white bg-opacity-10 rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                    <i className="bi bi-house-check text-primary" style={{fontSize: '2.5rem'}}></i>
                  </div>
                  <h5 className="mt-3">5000+</h5>
                  <p className="text-light">Properties Listed</p>
                </Col>
                <Col md={3} className="mb-4">
                  <div className="bg-white bg-opacity-10 rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                    <i className="bi bi-people text-primary" style={{fontSize: '2.5rem'}}></i>
                  </div>
                  <h5 className="mt-3">10,000+</h5>
                  <p className="text-light">Happy Tenants</p>
                </Col>
                <Col md={3} className="mb-4">
                  <div className="bg-white bg-opacity-10 rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                    <i className="bi bi-building text-primary" style={{fontSize: '2.5rem'}}></i>
                  </div>
                  <h5 className="mt-3">2,500+</h5>
                  <p className="text-light">Property Owners</p>
                </Col>
              </Row>
            </motion.div>
          </motion.div>
        </Container>
      </div>

      {/* How It Works Section */}
      <Container className="my-5 py-5">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-4 fw-bold">How RenTO Works</h2>
              <div className="mx-auto" style={{ width: '70px', height: '4px', background: 'var(--primary-color)', marginBottom: '1.5rem' }}></div>
              <p className="text-muted fs-5">A simple process for both tenants and owners.</p>
            </Col>
          </Row>
          
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="position-relative">
                  <Image 
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80" 
                    rounded 
                    fluid 
                    className="shadow" 
                  />
                  <div 
                    className="position-absolute bg-primary text-white p-4 rounded shadow"
                    style={{ bottom: '-20px', right: '-20px', zIndex: 1 }}
                  >
                    <h4 className="mb-0">Simplified Rental Process</h4>
                    <p className="mb-0">Save time and reduce stress</p>
                  </div>
                </div>
              </motion.div>
            </Col>
            
            <Col lg={6}>
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="p-4 rounded bg-light shadow-sm mb-4">
                  <h4 className="d-flex align-items-center">
                    <span className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                      <i className="bi bi-house"></i>
                    </span>
                    For Tenants
                  </h4>
                  <ul className="list-unstyled fs-5 mt-3">
                    <li className="mb-3 d-flex">
                      <i className="bi bi-search text-primary me-3 fs-4"></i>
                      <div>
                        <strong>Search & Discover</strong>
                        <p className="text-muted mb-0">Find your perfect home with advanced filters and detailed listings.</p>
                      </div>
                    </li>
                    <li className="mb-3 d-flex">
                      <i className="bi bi-chat-dots text-primary me-3 fs-4"></i>
                      <div>
                        <strong>Direct Communication</strong>
                        <p className="text-muted mb-0">Connect instantly with property owners through our secure chat system.</p>
                      </div>
                    </li>
                    <li className="d-flex">
                      <i className="bi bi-file-earmark-text text-primary me-3 fs-4"></i>
                      <div>
                        <strong>Digital Lease Management</strong>
                        <p className="text-muted mb-0">Sign agreements, make payments, and request maintenance all in one place.</p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 rounded bg-light shadow-sm">
                  <h4 className="d-flex align-items-center">
                    <span className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                      <i className="bi bi-building"></i>
                    </span>
                    For Owners
                  </h4>
                  <ul className="list-unstyled fs-5 mt-3">
                    <li className="mb-3 d-flex">
                      <i className="bi bi-card-list text-primary me-3 fs-4"></i>
                      <div>
                        <strong>Effortless Listing</strong>
                        <p className="text-muted mb-0">Create detailed property listings with photos, amenities, and virtual tours.</p>
                      </div>
                    </li>
                    <li className="mb-3 d-flex">
                      <i className="bi bi-people text-primary me-3 fs-4"></i>
                      <div>
                        <strong>Tenant Management</strong>
                        <p className="text-muted mb-0">Screen applicants, manage leases, and maintain tenant relationships.</p>
                      </div>
                    </li>
                    <li className="d-flex">
                      <i className="bi bi-credit-card text-primary me-3 fs-4"></i>
                      <div>
                        <strong>Financial Tracking</strong>
                        <p className="text-muted mb-0">Collect rent payments online and track all financial transactions in real-time.</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </Container>

      {/* Features Section */}
      <Container className="mb-5">
        <Row className="text-center mb-4">
          <Col>
            <h2 className="fw-bold">Why Choose RenTO?</h2>
          </Col>
        </Row>
        <Row>
          <Col md={4} className="mb-4">
            <Card className="h-100 shadow-sm border-0">
              <Card.Img variant="top" src="https://picsum.photos/seed/tenantfeature/400/250" />
              <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                <i className="bi bi-people-fill fs-1 text-primary mb-3"></i>
                <Card.Title as="h4" className="fw-semibold">For Tenants</Card.Title>
                <Card.Text className="text-muted">
                  Easily search and filter for your perfect rental property.
                  Communicate directly with owners and manage your lease agreements seamlessly.
                </Card.Text>
                <Button as={Link} to="/properties" variant="outline-primary" className="mt-auto">Find a Home</Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 shadow-sm border-0">
              <Card.Img variant="top" src="https://picsum.photos/seed/ownerfeature/400/250" />
              <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                <i className="bi bi-building-fill-gear fs-1 text-primary mb-3"></i>
                <Card.Title as="h4" className="fw-semibold">For Owners</Card.Title>
                <Card.Text className="text-muted">
                  List your properties, manage tenants, track payments, and handle maintenance requests all in one place.
                </Card.Text>
                {isAuthenticated && user?.role === 'owner' ? (
                    <Button as={Link} to="/owner/dashboard" variant="outline-primary" className="mt-auto">Manage Properties</Button>
                ) : (
                    <Button as={Link} to="/register?role=owner" variant="outline-primary" className="mt-auto">List Your Property</Button>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 shadow-sm border-0">
              <Card.Img variant="top" src="https://picsum.photos/seed/commfeature/400/250" />
              <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                <i className="bi bi-chat-dots-fill fs-1 text-primary mb-3"></i>
                <Card.Title as="h4" className="fw-semibold">Seamless Communication</Card.Title>
                <Card.Text className="text-muted">
                  Built-in chat application facilitates direct and efficient communication between tenants and owners.
                </Card.Text>
                 {/* <Button variant="outline-primary" className="mt-auto">Learn More</Button> */}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Call to Action Section */}
      {!isAuthenticated && (
        <Container className="text-center py-5 bg-light rounded">
          <h2 className="fw-bold">Ready to Get Started?</h2>
          <p className="text-muted fs-5">Join RenTO today and simplify your rental journey.</p>
          <Button as={Link} to="/register" variant="success" size="lg" className="me-2 fw-bold">
            Sign Up Now
          </Button>
          <Button as={Link} to="/properties" variant="info" size="lg" className="text-white fw-bold">
            Explore Properties
          </Button>
        </Container>
      )}
    </>
  );
}

export default HomePage;

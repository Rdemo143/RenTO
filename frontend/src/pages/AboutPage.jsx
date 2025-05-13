import React from 'react';
import { Container, Row, Col, Card, Image } from 'react-bootstrap';
import { motion } from 'framer-motion';

const AboutPage = () => {
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
          <h1 className="display-4 fw-bold mb-4">About RenTO</h1>
          <div className="mx-auto" style={{ width: '70px', height: '4px', background: 'var(--primary-color)', marginBottom: '1.5rem' }}></div>
          <p className="lead fs-4 text-muted">Transforming the rental experience for property owners and tenants.</p>
        </motion.div>

        {/* Our Story Section */}
        <Row className="align-items-center mb-5">
          <Col lg={6}>
            <motion.div 
              variants={fadeIn}
              className="mb-4 mb-lg-0"
            >
              <h2 className="fw-bold mb-4">Our Story</h2>
              <p className="fs-5">RenTO was founded in 2023 with a simple mission: to make the rental process easier, more transparent, and more efficient for everyone involved.</p>
              <p>Our founders experienced firsthand the challenges of the traditional rental market - from the tenant side dealing with unresponsive landlords and confusing lease terms, and from the owner side struggling with tenant screening and property management.</p>
              <p>These experiences inspired the creation of a comprehensive platform that addresses the pain points of both property owners and tenants, creating a seamless rental ecosystem that benefits all parties.</p>
            </motion.div>
          </Col>
          <Col lg={6}>
            <motion.div variants={fadeIn}>
              <Image 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80" 
                fluid 
                rounded 
                className="shadow"
              />
            </motion.div>
          </Col>
        </Row>

        {/* Our Mission Section */}
        <motion.div 
          variants={fadeIn}
          className="bg-light p-5 rounded-3 shadow-sm mb-5"
        >
          <Row className="align-items-center">
            <Col lg={8}>
              <h2 className="fw-bold mb-3">Our Mission</h2>
              <p className="fs-5 mb-0">To create a transparent, efficient, and user-friendly platform that simplifies property rentals and management, empowering both property owners and tenants to achieve their goals with minimal friction.</p>
            </Col>
            <Col lg={4} className="text-center">
              <i className="bi bi-bullseye text-primary" style={{ fontSize: '5rem' }}></i>
            </Col>
          </Row>
        </motion.div>

        {/* Our Values Section */}
        <motion.div variants={fadeIn}>
          <h2 className="fw-bold text-center mb-4">Our Values</h2>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-shield-check text-primary" style={{ fontSize: '2.5rem' }}></i>
                  </div>
                  <Card.Title as="h4" className="fw-bold">Trust & Transparency</Card.Title>
                  <Card.Text>
                    We believe in building trust through transparent processes, clear communication, and secure transactions for all users.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-lightning-charge text-primary" style={{ fontSize: '2.5rem' }}></i>
                  </div>
                  <Card.Title as="h4" className="fw-bold">Innovation</Card.Title>
                  <Card.Text>
                    We continuously innovate to provide cutting-edge solutions that make property management and renting simpler and more efficient.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-people text-primary" style={{ fontSize: '2.5rem' }}></i>
                  </div>
                  <Card.Title as="h4" className="fw-bold">Community</Card.Title>
                  <Card.Text>
                    We're building more than a platform; we're creating a community where property owners and tenants can connect and thrive together.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </motion.div>

        {/* Team Section */}
        <motion.div variants={fadeIn} className="mt-5">
          <h2 className="fw-bold text-center mb-4">Our Leadership Team</h2>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="border-0 shadow-sm">
                <Card.Img variant="top" src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80" />
                <Card.Body className="text-center">
                  <Card.Title as="h5" className="fw-bold">Michael Johnson</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">CEO & Co-Founder</Card.Subtitle>
                  <Card.Text>
                    Former real estate investor with 15+ years of experience in property management and technology.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="border-0 shadow-sm">
                <Card.Img variant="top" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=776&q=80" />
                <Card.Body className="text-center">
                  <Card.Title as="h5" className="fw-bold">Sarah Chen</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">CTO & Co-Founder</Card.Subtitle>
                  <Card.Text>
                    Tech innovator with a background in developing scalable platforms for the real estate industry.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="border-0 shadow-sm">
                <Card.Img variant="top" src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80" />
                <Card.Body className="text-center">
                  <Card.Title as="h5" className="fw-bold">David Rodriguez</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">COO</Card.Subtitle>
                  <Card.Text>
                    Operations expert with experience scaling customer-focused businesses in the property sector.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default AboutPage;

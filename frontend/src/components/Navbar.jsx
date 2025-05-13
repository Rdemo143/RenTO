import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, NavDropdown, Container, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import NotificationComponent from './NotificationComponent';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BootstrapNavbar bg="light" expand="lg" className="shadow-sm sticky-top">
      <Container fluid>
        <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold text-primary">
          RenTO
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/properties">Properties</Nav.Link>
            <Nav.Link as={Link} to="/about">About Us</Nav.Link>
            <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
            <Nav.Link as={Link} to="/faq">FAQ</Nav.Link>
          </Nav>
          <Nav>
            {user ? (
              <>
                <Nav.Link as={Link} to="/messages" className="me-2 d-flex align-items-center">
                  <i className="bi bi-chat-dots me-1"></i> Messages
                </Nav.Link>
                <div className="me-3 d-flex align-items-center">
                  <NotificationComponent />
                </div>
                <NavDropdown title={<><i className="bi bi-person-circle me-1"></i>{user.name}</>} id="basic-nav-dropdown" align="end">
                  {user.role === 'owner' && (
                    <NavDropdown.Item as={Link} to="/owner/dashboard">
                      <i className="bi bi-speedometer2 me-2"></i>Owner Dashboard
                    </NavDropdown.Item>
                  )}
                  {user.role === 'tenant' && (
                    <NavDropdown.Item as={Link} to="/tenant/dashboard">
                      <i className="bi bi-layout-text-sidebar-reverse me-2"></i>Tenant Dashboard
                    </NavDropdown.Item>
                  )}
                  <NavDropdown.Item as={Link} to="/maintenance-requests">
                    <i className="bi bi-tools me-2"></i>Maintenance Requests
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/profile">
                    <i className="bi bi-person-fill-gear me-2"></i>My Profile
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout} className="text-danger">
                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  <Button variant="outline-primary" size="sm" className="me-2">Login</Button>
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <Button variant="primary" size="sm">Register</Button>
                </Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;

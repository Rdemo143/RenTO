import React from 'react';
import { Container } from 'react-bootstrap';

function Footer() {
  return (
    <footer className="bg-dark text-white mt-5 p-4 text-center">
      <Container>
        <p>&copy; {new Date().getFullYear()} RenTO. All Rights Reserved.</p>
        <p>Your trusted partner in property management.</p>
      </Container>
    </footer>
  );
}

export default Footer;

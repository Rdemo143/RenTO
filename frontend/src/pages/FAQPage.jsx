import React, { useState } from 'react';
import { Container, Row, Col, Accordion, Form, Button, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeKey, setActiveKey] = useState('0');

  // FAQ data
  const faqCategories = [
    {
      title: 'For Tenants',
      faqs: [
        {
          question: 'How do I search for properties on RenTO?',
          answer: 'You can search for properties by using the search bar on the homepage or by navigating to the Properties page. You can filter properties by location, price range, number of bedrooms, and other amenities to find your perfect match.'
        },
        {
          question: 'How do I apply for a property?',
          answer: 'Once you find a property you\'re interested in, you can click on the "Rent This Property" button on the property details page. This will open an application form where you can provide your information and submit your application directly to the property owner.'
        },
        {
          question: 'How do I pay my rent through RenTO?',
          answer: 'RenTO offers secure online rent payments. Once your application is approved and you\'ve signed the lease, you can make payments through your tenant dashboard. We accept credit/debit cards and bank transfers for your convenience.'
        },
        {
          question: 'How do I request maintenance for my rental?',
          answer: 'You can submit maintenance requests directly through your tenant dashboard or from the property details page. Simply click on "Request Maintenance", describe the issue, select the urgency level, and submit. The property owner will be notified immediately.'
        },
        {
          question: 'Is my personal information secure on RenTO?',
          answer: 'Yes, we take data security very seriously. All personal information and payment details are encrypted and stored securely. We comply with data protection regulations and never share your information with unauthorized third parties.'
        }
      ]
    },
    {
      title: 'For Property Owners',
      faqs: [
        {
          question: 'How do I list my property on RenTO?',
          answer: 'After creating an account as a property owner, you can list your property by clicking on "List Your Property" from your dashboard. Fill in the property details, upload photos, set your rental terms, and publish your listing.'
        },
        {
          question: 'How does tenant screening work?',
          answer: 'RenTO provides comprehensive tenant screening tools. When a tenant applies for your property, you\'ll receive their application with verification options for credit checks, background screening, and rental history verification to help you make informed decisions.'
        },
        {
          question: 'How do I manage lease agreements?',
          answer: 'RenTO offers digital lease management. You can create, customize, and send lease agreements directly through the platform. Tenants can review and sign electronically, and all documents are securely stored in your account for easy access.'
        },
        {
          question: 'How do I track rent payments?',
          answer: 'All rent payments are tracked in your owner dashboard. You\'ll receive notifications when payments are made, and you can view payment history, generate reports, and set up automatic payment reminders for tenants.'
        },
        {
          question: 'What fees does RenTO charge property owners?',
          answer: 'RenTO offers flexible pricing plans for property owners. Our basic listing plan is free, while premium features like advanced tenant screening, automated rent collection, and maintenance management are available in our paid subscription plans. Visit our pricing page for detailed information.'
        }
      ]
    },
    {
      title: 'Account & Technical Support',
      faqs: [
        {
          question: 'How do I create an account on RenTO?',
          answer: 'You can create an account by clicking on the "Register" button in the top right corner of the homepage. Select whether you\'re a tenant or property owner, fill in your details, verify your email, and you\'re ready to go!'
        },
        {
          question: 'I forgot my password. How do I reset it?',
          answer: 'Click on the "Login" button, then select "Forgot Password". Enter the email address associated with your account, and we\'ll send you a password reset link. Follow the instructions in the email to create a new password.'
        },
        {
          question: 'Is there a mobile app for RenTO?',
          answer: 'Yes, RenTO is available as a mobile app for both iOS and Android devices. You can download it from the App Store or Google Play Store to manage your properties or rental search on the go.'
        },
        {
          question: 'How do I contact customer support?',
          answer: 'You can reach our customer support team through the "Contact Us" page on our website, by emailing support@rento.com, or by calling our helpline at (123) 456-7890 during business hours.'
        },
        {
          question: 'Does RenTO work in my area?',
          answer: 'RenTO is currently available in major cities across the United States, with plans to expand to more locations soon. You can check property availability in your area by entering your location in the search bar on our homepage.'
        }
      ]
    }
  ];

  // Filter FAQs based on search term
  const filteredFAQs = searchTerm
    ? faqCategories.map(category => ({
        ...category,
        faqs: category.faqs.filter(faq =>
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.faqs.length > 0)
    : faqCategories;

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
          <h1 className="display-4 fw-bold mb-4">Frequently Asked Questions</h1>
          <div className="mx-auto" style={{ width: '70px', height: '4px', background: 'var(--primary-color)', marginBottom: '1.5rem' }}></div>
          <p className="lead fs-4 text-muted">Find answers to common questions about using RenTO.</p>
        </motion.div>

        {/* Search Section */}
        <motion.div variants={fadeIn} className="mb-5">
          <Card className="border-0 shadow-sm bg-light">
            <Card.Body className="p-4">
              <Row className="justify-content-center">
                <Col md={8}>
                  <Form>
                    <Form.Group className="mb-0">
                      <div className="position-relative">
                        <Form.Control
                          type="text"
                          placeholder="Search for questions..."
                          className="form-control-lg py-3 pe-5"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="position-absolute top-50 end-0 translate-middle-y pe-3">
                          <i className="bi bi-search text-muted fs-5"></i>
                        </div>
                      </div>
                    </Form.Group>
                  </Form>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </motion.div>

        {/* FAQ Categories */}
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((category, categoryIndex) => (
            <motion.div 
              key={categoryIndex} 
              variants={fadeIn} 
              className="mb-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <h2 className="fw-bold mb-4">{category.title}</h2>
              <Accordion defaultActiveKey={activeKey} className="shadow-sm">
                {category.faqs.map((faq, faqIndex) => {
                  const itemKey = `${categoryIndex}-${faqIndex}`;
                  return (
                    <Accordion.Item eventKey={itemKey} key={itemKey}>
                      <Accordion.Header onClick={() => setActiveKey(itemKey)}>
                        <span className="fw-semibold">{faq.question}</span>
                      </Accordion.Header>
                      <Accordion.Body>
                        <p className="mb-0">{faq.answer}</p>
                      </Accordion.Body>
                    </Accordion.Item>
                  );
                })}
              </Accordion>
            </motion.div>
          ))
        ) : (
          <motion.div variants={fadeIn} className="text-center py-5">
            <i className="bi bi-search text-muted" style={{ fontSize: '3rem' }}></i>
            <h3 className="mt-3">No results found</h3>
            <p className="text-muted">Try different keywords or browse our categories below.</p>
            <Button variant="primary" onClick={() => setSearchTerm('')}>View All FAQs</Button>
          </motion.div>
        )}

        {/* Still Have Questions Section */}
        <motion.div 
          variants={fadeIn} 
          className="bg-primary text-white p-5 rounded-3 shadow mt-5 text-center"
        >
          <h2 className="fw-bold mb-3">Still Have Questions?</h2>
          <p className="fs-5 mb-4">Our support team is here to help you with any questions you might have.</p>
          <Button 
            as="a" 
            href="/contact" 
            variant="light" 
            size="lg" 
            className="fw-bold px-4"
          >
            <i className="bi bi-chat-dots me-2"></i>
            Contact Us
          </Button>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default FAQPage;

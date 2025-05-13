const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = {
  stripe,
  createPaymentIntent: async (amount, currency = 'usd') => {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      return paymentIntent;
    } catch (error) {
      throw new Error(`Stripe payment intent creation failed: ${error.message}`);
    }
  },

  createCustomer: async (email, name) => {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
      });
      return customer;
    } catch (error) {
      throw new Error(`Stripe customer creation failed: ${error.message}`);
    }
  },

  createSubscription: async (customerId, priceId) => {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
      return subscription;
    } catch (error) {
      throw new Error(`Stripe subscription creation failed: ${error.message}`);
    }
  }
}; 
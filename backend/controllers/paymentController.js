// This is for demo purposes — do not use in production without securing payment details properly

exports.processPayment = async (req, res) => {
    const { tenantId, amount, paymentMethod } = req.body;
    try {
      // Simulate payment processing
      console.log(`Processing payment of $${amount} from tenant ${tenantId} using ${paymentMethod}`);
      
      // Simulated success response
      res.status(200).json({ msg: 'Payment processed successfully', transactionId: 'TXN12345' });
    } catch (error) {
      res.status(500).json({ msg: 'Payment failed', error });
    }
  };
  
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, paymentMethodId } = JSON.parse(event.body);
    
    if (!email || !paymentMethodId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email and payment method are required' })
      };
    }

    // Check if customer already exists
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    let customer;
    if (customers.data.length > 0) {
      // Update existing customer with new payment method
      customer = customers.data[0];
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id
      });
      await stripe.customers.update(customer.id, {
        invoice_settings: { default_payment_method: paymentMethodId }
      });
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        email,
        payment_method: paymentMethodId,
        invoice_settings: { default_payment_method: paymentMethodId }
      });
    }

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.STRIPE_PRICE_ID }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        customerId: customer.id
      })
    };
  } catch (error) {
    console.error('Upgrade subscription error:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message })
    };
  }
} 
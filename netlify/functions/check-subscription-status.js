const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email } = JSON.parse(event.body);
    
    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    // Find customer by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    // If no customer found in Stripe, they're a free user
    if (!customers.data.length) {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          active: false,
          message: 'Free account'
        })
      };
    }

    const customer = customers.data[0];

    // Check subscription status in Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1
    });

    const hasActiveSubscription = subscriptions.data.length > 0;

    return {
      statusCode: 200,
      body: JSON.stringify({
        active: hasActiveSubscription,
        message: hasActiveSubscription ? 'Premium account' : 'Free account',
        subscription: hasActiveSubscription ? subscriptions.data[0] : null
      })
    };
  } catch (error) {
    console.error('Subscription status error:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message })
    };
  }
} 
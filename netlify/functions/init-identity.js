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

    if (!customers.data.length) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'No subscription found' })
      };
    }

    const customer = customers.data[0];

    // Verify subscription status
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1
    });

    if (!subscriptions.data.length) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Active subscription required' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: "Identity initialized",
        subscription: subscriptions.data[0].id
      })
    };
  } catch (error) {
    console.error('Subscription verification error:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message })
    };
  }
}; 
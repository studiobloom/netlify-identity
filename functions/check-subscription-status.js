const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Verify the JWT token from Netlify Identity
async function verifyUser(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No authorization token provided');
    }

    try {
        // Get the JWT token
        const token = authHeader.split(' ')[1];
        
        // Make a request to Netlify Identity to verify the token
        const response = await fetch('https://netlify-identity.netlify.com/.netlify/identity/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Invalid token');
        }

        const user = await response.json();
        return user;
    } catch (error) {
        console.error('Token verification failed:', error);
        throw new Error('Invalid token');
    }
}

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Verify the user's token
        const user = await verifyUser(event.headers.authorization);
        const { email } = JSON.parse(event.body);

        // Check if the email matches the authenticated user
        if (user.email !== email) {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: 'You can only check your own subscription status' })
            };
        }
        
        // Find customer by email
        const customers = await stripe.customers.list({
            email: email,
            limit: 1
        });

        if (!customers.data.length) {
            return {
                statusCode: 200,
                body: JSON.stringify({ 
                    active: false,
                    message: 'Free account'
                })
            };
        }

        // Get customer's subscriptions
        const subscriptions = await stripe.subscriptions.list({
            customer: customers.data[0].id,
            limit: 1,
            status: 'active',
            expand: ['data.latest_invoice']
        });

        if (!subscriptions.data.length) {
            return {
                statusCode: 200,
                body: JSON.stringify({ 
                    active: false,
                    message: 'No active subscription'
                })
            };
        }

        const subscription = subscriptions.data[0];
        
        // Get customer's default payment method
        const customer = await stripe.customers.retrieve(customers.data[0].id, {
            expand: ['invoice_settings.default_payment_method']
        });

        const hasDefaultPayment = customer.invoice_settings.default_payment_method !== null;
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                active: true,
                cancelAtPeriodEnd: !hasDefaultPayment,
                currentPeriodEnd: subscription.current_period_end,
                message: !hasDefaultPayment ? 
                    'Premium (Cancels at end of period)' : 
                    'Premium'
            })
        };
    } catch (error) {
        console.error('Error checking subscription status:', error);
        return {
            statusCode: error.message === 'Invalid token' ? 401 : 400,
            body: JSON.stringify({ error: error.message })
        };
    }
}; 
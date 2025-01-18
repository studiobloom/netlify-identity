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
                body: JSON.stringify({ error: 'You can only modify your own payment settings' })
            };
        }
        
        // Find customer by email
        const customers = await stripe.customers.list({
            email: email,
            limit: 1
        });

        if (!customers.data.length) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Customer not found' })
            };
        }

        // Get the subscription to find the period end
        const subscriptions = await stripe.subscriptions.list({
            customer: customers.data[0].id,
            limit: 1,
            status: 'active'
        });

        if (!subscriptions.data.length) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'No active subscription found' })
            };
        }

        // Simply remove the default payment method
        await stripe.customers.update(customers.data[0].id, {
            invoice_settings: {
                default_payment_method: null
            }
        });

        // Format the end date
        const endDate = new Date(subscriptions.data[0].current_period_end * 1000).toLocaleDateString();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Payment method removed. Your subscription will remain active until ${endDate}.`
            })
        };
    } catch (error) {
        console.error('Error updating payment settings:', error);
        return {
            statusCode: error.message === 'Invalid token' ? 401 : 400,
            body: JSON.stringify({ error: error.message })
        };
    }
}; 
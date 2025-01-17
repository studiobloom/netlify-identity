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

        const customerId = customers.data[0].id;

        // Get subscription info for end date
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            limit: 1,
            status: 'active'
        });

        if (!subscriptions.data.length) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'No active subscription found' })
            };
        }

        // Get all payment methods
        const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card'
        });

        // Detach all payment methods from the customer
        for (const paymentMethod of paymentMethods.data) {
            await stripe.paymentMethods.detach(paymentMethod.id);
        }

        // Also remove default payment method from invoice settings
        await stripe.customers.update(customerId, {
            invoice_settings: {
                default_payment_method: null
            }
        });

        const endDate = new Date(subscriptions.data[0].current_period_end * 1000).toLocaleDateString();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `All payment methods removed. Your subscription will remain active until ${endDate}.`
            })
        };
    } catch (error) {
        console.error('Error removing payment methods:', error);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: error.message })
        };
    }
}; 
# Netlify Identity with Stripe Subscription (Premium Only)

This project implements a Netlify Identity authentication system with required Stripe subscription for account creation. Every user must be a paying subscriber to create an account.

> 🔍 **Looking for a freemium model?** Check out the `freemium` branch if you want optional subscriptions, tiered access (free/premium), and the ability to upgrade accounts later.

## Security First

This project is designed to be completely open source while maintaining security:
- No sensitive keys or credentials are stored in the repository
- All sensitive data is managed through Netlify environment variables
- Stripe integration is handled securely through environment variables

## Setup Instructions

### 1. Netlify Setup

1. Deploy this project to Netlify
2. Enable Netlify Identity for your site in the Netlify dashboard
3. Go to Site Settings > Identity > Registration preferences
4. Set registration to "Invite only" to ensure users can only sign up through your subscription flow

### 2. Stripe Setup

1. Create a Stripe account at https://stripe.com if you haven't already
2. Create a subscription product and price in your Stripe dashboard
3. Note down your price ID (starts with 'price_')
4. Get your Stripe API keys (both publishable and secret keys)

### 3. Environment Variables

Add the following environment variables in your Netlify dashboard (Site Settings > Build & Deploy > Environment):

```
STRIPE_SECRET_KEY=sk_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_your_stripe_publishable_key
STRIPE_PRICE_ID=price_your_subscription_price_id
```

IMPORTANT: Never commit these values to your repository. They should only be set in your Netlify dashboard.

## How It Works

1. User enters their email, password, and payment information
2. The system creates a Stripe subscription using secure environment variables
3. Upon successful subscription, the system creates a Netlify Identity account
4. User receives an email confirmation
5. After confirming email, user can log in

## Development

To run locally:

1. Install dependencies:
```bash
cd netlify/functions
npm install
```

2. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

3. Create a `.env.local` file (DO NOT COMMIT THIS FILE):
```bash
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
```

4. Run the development server:
```bash
netlify dev
```

## Contributing

## Security Notes

- NO sensitive data is stored in the repository
- All API keys and secrets are managed through Netlify environment variables
- The `.gitignore` file includes `.env` and `.env.local` to prevent accidental commits
- Stripe Elements handles payment information client-side
- All sensitive operations happen in Netlify Functions
- No sensitive data touches your application server

## Files Structure

```
├── index.html              # Main HTML file with auth forms
├── app.js                  # Frontend JavaScript (no sensitive data)
├── styles.css             # Styles including Stripe Elements
├── netlify/functions/
│   ├── create-subscription.js   # Handles Stripe subscription
│   ├── init-identity.js         # Verifies subscription before signup
│   └── package.json            # Function dependencies
└── netlify.toml           # Netlify configuration
```

## Troubleshooting

- If users can't sign up, check Netlify Identity settings
- For payment issues, check Stripe Dashboard > Events
- For function errors, check Netlify Functions log
- Verify all environment variables are set in Netlify dashboard

## Support

For issues:
1. Check Netlify Function logs
2. Check Stripe Dashboard events
3. Ensure all environment variables are set in Netlify dashboard
4. Verify Stripe price ID is correct 
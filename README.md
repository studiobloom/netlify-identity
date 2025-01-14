# Netlify Identity Template - Widget Implementation

A lightweight template for implementing user authentication using Netlify's Identity Widget. This template provides a simple, popup-based authentication flow using Netlify's official widget.

## Project Structure

```
├── index.html
├── app.js
├── styles.css
├── netlify.toml
└── netlify/
    └── functions/
        └── init-identity.js
```

## Features

- User authentication (signup, login, logout)
- Password recovery
- Email confirmation
- JWT token handling
- Serverless functions integration
- Popup-based authentication flow
- Consistent UI with Netlify's design

## Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/studiobloom/netlify-identity.git
   ```

2. Enable Identity in your Netlify site:
   - Go to your site settings in Netlify
   - Navigate to Identity
   - Click "Enable Identity"

3. Configure Identity settings:
   - Set registration preferences (open/invite only)
   - Configure external providers (optional)
   - Set password recovery and confirmation email templates

4. Deploy to Netlify:
   ```bash
   git push
   ```

## Usage

The template uses Netlify's Identity Widget for authentication. Here's how to use it:

```javascript
// Initialize the Identity widget
netlifyIdentity.init();

// Open the modal
netlifyIdentity.open();

// Handle login events
netlifyIdentity.on('login', user => {
  console.log('Logged in:', user);
});

// Handle logout events
netlifyIdentity.on('logout', () => {
  console.log('Logged out');
});

// Close the modal programmatically
netlifyIdentity.close();

// Get current user
const user = netlifyIdentity.currentUser();
```

## Environment Variables

Create a `.env` file with:
```
NETLIFY_IDENTITY_ENDPOINT=your-site-name.netlify.app/.netlify/identity
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
# Netlify Identity Template

A lightweight template for implementing user authentication using Netlify Identity. This template provides two implementation branches:

1. **Widget Branch** - Uses Netlify's default Identity widget
2. **Embedded Forms** - Custom forms integrated into the page

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

## Implementation Options

### Widget Branch
- Uses Netlify's official Identity widget
- Quick to implement
- Consistent UI with Netlify's design
- Popup-based authentication flow
- Minimal custom code required

### Embedded Forms Branch
- Custom forms integrated directly into your page
- Full control over the UI/UX
- Seamless user experience without popups
- Customizable styling and behavior

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

### Widget Branch
```javascript
// Initialize the Identity widget
netlifyIdentity.init();

// Open the modal
netlifyIdentity.open();

// Handle login events
netlifyIdentity.on('login', user => {
  console.log('Logged in:', user);
});
```

### Embedded Forms Branch
```javascript
// Handle form submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  // Form handling logic
});
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
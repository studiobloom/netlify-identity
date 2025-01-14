# Netlify Identity Template - Embedded Forms Implementation

A lightweight template for implementing user authentication using Netlify Identity with custom embedded forms. This template provides a seamless, integrated authentication experience with full control over the UI/UX.

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
- Custom forms integrated directly into your page
- Full control over UI/UX
- No popups - seamless user experience
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

The template uses custom forms that interact directly with Netlify's Identity API. Here's how to use it:

```javascript
// Handle signup
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  try {
    const response = await fetch('/.netlify/identity/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' }
    });
    const user = await response.json();
    console.log('Signed up:', user);
  } catch (error) {
    console.error('Signup error:', error);
  }
});

// Handle login
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch('/.netlify/identity/token', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' }
    });
    const token = await response.json();
    localStorage.setItem('netlifyIdentityToken', token);
    console.log('Logged in successfully');
  } catch (error) {
    console.error('Login error:', error);
  }
});

// Handle logout
function logout() {
  localStorage.removeItem('netlifyIdentityToken');
  // Additional cleanup as needed
}

// Check authentication status
function isAuthenticated() {
  return !!localStorage.getItem('netlifyIdentityToken');
}

// Get current user data
async function getCurrentUser() {
  const token = localStorage.getItem('netlifyIdentityToken');
  if (!token) return null;

  try {
    const response = await fetch('/.netlify/identity/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}
```

## Environment Variables

Create a `.env` file with:
```
NETLIFY_IDENTITY_ENDPOINT=your-site-name.netlify.app/.netlify/identity
```

## HTML Form Examples

```html
<!-- Signup Form -->
<form id="signup-form">
  <input type="email" id="signup-email" required>
  <input type="password" id="signup-password" required>
  <button type="submit">Sign Up</button>
</form>

<!-- Login Form -->
<form id="login-form">
  <input type="email" id="login-email" required>
  <input type="password" id="login-password" required>
  <button type="submit">Log In</button>
</form>
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
// Initialize Netlify Identity
const netlifyIdentity = window.netlifyIdentity;

// Form handling
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        await netlifyIdentity.gotrue.login({
            email,
            password
        }).then(response => {
            handleUserLoggedIn(response);
        });
    } catch (error) {
        showError('login-form', error.message);
    }
});

document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    try {
        await netlifyIdentity.gotrue.signup({
            email,
            password
        }).then(response => {
            if (response.confirmed_at) {
                handleUserLoggedIn(response);
            } else {
                showError('signup-form', 'Please confirm your email address to complete signup');
            }
        });
    } catch (error) {
        showError('signup-form', error.message);
    }
});

// Toggle between login and signup forms
function toggleForms(formToShow) {
    document.getElementById('login-form').style.display = formToShow === 'login' ? 'block' : 'none';
    document.getElementById('signup-form').style.display = formToShow === 'signup' ? 'block' : 'none';
}

// Handle user state
netlifyIdentity.on('init', user => {
    if (user) {
        handleUserLoggedIn(user);
    }
});

function handleUserLoggedIn(user) {
    document.getElementById('auth-forms').style.display = 'none';
    document.getElementById('user-info').style.display = 'block';
    document.getElementById('user-name').textContent = user.user_metadata.full_name || user.email;
}

function handleLogout() {
    netlifyIdentity.logout();
    document.getElementById('auth-forms').style.display = 'block';
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('signup-form').style.display = 'none';
}

function showError(formId, message) {
    const form = document.getElementById(formId);
    let errorDiv = form.querySelector('.error-message');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        form.insertBefore(errorDiv, form.firstChild);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
} 
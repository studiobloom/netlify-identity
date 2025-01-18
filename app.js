// Initialize Netlify Identity
const netlifyIdentity = window.netlifyIdentity;

// Handle initial user state
netlifyIdentity.on('init', user => {
    if (user) {
        handleUserLoggedIn(user);
    }
});

// Handle login events
netlifyIdentity.on('login', user => {
    handleUserLoggedIn(user);
});

// Handle logout events
netlifyIdentity.on('logout', () => {
    handleLogout();
});

// Check status when page becomes visible
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        const user = netlifyIdentity.currentUser();
        if (user) {
            checkSubscriptionStatus(user);
        }
    }
});

// Periodic check (every 5 minutes)
setInterval(() => {
    const user = netlifyIdentity.currentUser();
    if (user) {
        checkSubscriptionStatus(user);
    }
}, 5 * 60 * 1000);

// Initialize Stripe
const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
const elements = stripe.elements();
const card = elements.create('card');

// Handle card errors
card.addEventListener('change', ({error}) => {
    const displayError = document.querySelector('.card-errors');
    if (displayError) {
        displayError.textContent = error ? error.message : '';
    }
});

// Show/hide payment section based on account type selection
document.querySelectorAll('input[name="account-type"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const paymentSection = document.getElementById('payment-section');
        const signupButton = document.getElementById('signup-button');
        if (e.target.value === 'premium') {
            paymentSection.style.display = 'block';
            card.mount('#signup-card');
            signupButton.textContent = 'Subscribe & Create Account';
        } else {
            paymentSection.style.display = 'none';
            signupButton.textContent = 'Create Account';
        }
    });
});

// Show/hide upgrade payment info when upgrade button is clicked
document.getElementById('upgrade-subscription').addEventListener('click', function() {
    const upgradePaymentInfo = document.getElementById('upgrade-payment-info');
    const wasHidden = upgradePaymentInfo.style.display === 'none';
    
    if (wasHidden) {
        upgradePaymentInfo.style.display = 'block';
        card.mount('#upgrade-card');
        this.textContent = 'Confirm Upgrade';
    } else {
        handleUpgradeSubmission();
    }
});

// Handle form display toggling
function toggleForms(formToShow) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (formToShow === 'login') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        // Reset signup form state
        document.getElementById('payment-section').style.display = 'none';
        document.getElementById('free-account').checked = true;
        document.getElementById('signup-button').textContent = 'Create Account';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    }
}

// Handle confirmation tokens in URL
if (window.location.hash && window.location.hash.includes('confirmation_token=')) {
    // Hide the body immediately
    document.body.style.display = 'none';
    netlifyIdentity.on('login', user => {
        // Remove the hash and refresh the page
        window.location.href = window.location.pathname;
    });
} else {
    // Ensure body is visible if no confirmation token
    document.body.style.display = 'block';
}

// Helper functions to show/hide loaders
function showLoader(id) {
    const loader = document.getElementById(id);
    if (loader) {
        loader.style.display = 'flex';
    }
}

function hideLoader(id) {
    const loader = document.getElementById(id);
    if (loader) {
        loader.style.display = 'none';
    }
}

// Handle user state changes
async function handleUserLoggedIn(user) {
    try {
        // Verify the user exists in Netlify Identity
        if (!user || !user.token || !user.token.access_token) {
            console.error('Invalid user state detected');
            netlifyIdentity.logout();
            return;
        }

        // Update UI
        document.getElementById('auth-forms').style.display = 'none';
        document.getElementById('user-info').style.display = 'block';
        document.getElementById('user-name').textContent = user.email;

        // Check subscription status
        showLoader('subscription-loader');
        await checkSubscriptionStatus(user);
        hideLoader('subscription-loader');
    } catch (error) {
        hideLoader('subscription-loader');
        console.error('Error handling user login:', error);
        showError('user-info', 'Error verifying user status. Please try logging in again.');
        setTimeout(() => {
            netlifyIdentity.logout();
        }, 3000);
    }
}

// Handle the actual upgrade submission
async function handleUpgradeSubmission() {
    try {
        const {paymentMethod, error} = await stripe.createPaymentMethod({
            type: 'card',
            card: card,
        });

        if (error) {
            throw new Error(error.message);
        }

        // Create subscription
        const response = await fetch('/.netlify/functions/upgrade-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: netlifyIdentity.currentUser().email,
                paymentMethodId: paymentMethod.id
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error);
        }

        // Confirm subscription payment if required
        if (data.clientSecret) {
            const {error: confirmError} = await stripe.confirmCardPayment(data.clientSecret);
            if (confirmError) {
                throw new Error(confirmError.message);
            }
        }

        // Update UI
        checkSubscriptionStatus(netlifyIdentity.currentUser());
        alert('Successfully upgraded to premium!');
        
        // Reset upgrade section
        document.getElementById('upgrade-payment-info').style.display = 'none';
        document.getElementById('upgrade-subscription').textContent = 'Upgrade to Premium';
    } catch (error) {
        const displayError = document.querySelector('.card-errors');
        if (displayError) {
            displayError.textContent = error.message;
        }
    }
}

// Form handling
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoader('login-loader');
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const client = netlifyIdentity.gotrue;
        const response = await client.login(email, password, true);
        handleUserLoggedIn(response);
    } catch (error) {
        showError('login-form', error.message);
    } finally {
        hideLoader('login-loader');
    }
});

document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoader('signup-loader');
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const accountType = document.querySelector('input[name="account-type"]:checked').value;
    
    try {
        if (accountType === 'premium') {
            // Handle premium signup with Stripe
            const {paymentMethod, error} = await stripe.createPaymentMethod({
                type: 'card',
                card: card,
            });

            if (error) {
                throw new Error(error.message);
            }

            // Create subscription
            const subscriptionResponse = await fetch('/.netlify/functions/create-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    paymentMethodId: paymentMethod.id
                })
            });

            const subscriptionData = await subscriptionResponse.json();
            
            if (!subscriptionResponse.ok) {
                throw new Error(subscriptionData.error);
            }

            // Confirm subscription payment if required
            if (subscriptionData.clientSecret) {
                const {error: confirmError} = await stripe.confirmCardPayment(subscriptionData.clientSecret);
                if (confirmError) {
                    throw new Error(confirmError.message);
                }
            }
        }

        // Create user account
        const client = netlifyIdentity.gotrue;
        const user = await client.signup(email, password);
        
        if (user.confirmed_at) {
            handleUserLoggedIn(user);
        } else {
            showInfo('signup-form', 'Please check your email to confirm your account before logging in.');
        }
    } catch (error) {
        showError('signup-form', error.message);
    } finally {
        hideLoader('signup-loader');
    }
});

async function checkSubscriptionStatus(user) {
    try {
        showLoader('subscription-loader');
        const response = await fetch('/.netlify/functions/check-subscription-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token.access_token}`
            },
            body: JSON.stringify({
                email: user.email
            })
        });

        const data = await response.json();
        
        const statusMessage = document.getElementById('subscription-status-message');
        const upgradeSection = document.getElementById('upgrade-section');
        const cancelButton = document.getElementById('cancel-subscription');
        
        if (data.active) {
            if (data.cancelAtPeriodEnd) {
                statusMessage.textContent = 'Premium (Cancels at end of period)';
                statusMessage.style.color = '#ffc107'; // Warning color
                upgradeSection.style.display = 'none';
                cancelButton.style.display = 'none';
            } else {
                statusMessage.textContent = 'Premium';
                statusMessage.style.color = '#28a745';
                upgradeSection.style.display = 'none';
                cancelButton.style.display = 'block';
            }
        } else {
            statusMessage.textContent = 'Free';
            statusMessage.style.color = '#6c757d';
            upgradeSection.style.display = 'block';
            cancelButton.style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking subscription:', error);
        document.getElementById('subscription-status-message').textContent = 'Error checking subscription status';
    } finally {
        hideLoader('subscription-loader');
    }
}

// Add cancel subscription handler
document.getElementById('cancel-subscription').addEventListener('click', async function() {
    if (!confirm('Are you sure you want to cancel your subscription? You will continue to have access until the end of your current billing period.')) {
        return;
    }

    try {
        const user = netlifyIdentity.currentUser();
        const response = await fetch('/.netlify/functions/cancel-subscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token.access_token}`
            },
            body: JSON.stringify({
                email: user.email,
                cancelAtPeriodEnd: true
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('Subscription will be cancelled at the end of your current billing period');
            checkSubscriptionStatus(user);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        alert('Error cancelling subscription: ' + error.message);
    }
});

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

function showInfo(formId, message) {
    const form = document.getElementById(formId);
    let infoDiv = form.querySelector('.info-message');
    
    if (!infoDiv) {
        infoDiv = document.createElement('div');
        infoDiv.className = 'info-message';
        form.insertBefore(infoDiv, form.firstChild);
    }
    
    infoDiv.textContent = message;
    infoDiv.style.display = 'block';
}
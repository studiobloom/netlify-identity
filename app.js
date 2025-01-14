// Initialize Netlify Identity
const netlifyIdentity = window.netlifyIdentity;

netlifyIdentity.on('init', user => {
    if (user) {
        handleUserLoggedIn(user);
    }
});

netlifyIdentity.on('login', user => {
    handleUserLoggedIn(user);
    netlifyIdentity.close();
});

netlifyIdentity.on('logout', () => {
    handleUserLoggedOut();
});

function handleUserLoggedIn(user) {
    document.querySelector('.auth-buttons').style.display = 'none';
    document.querySelector('.user-info').style.display = 'block';
    document.getElementById('user-name').textContent = user.user_metadata.full_name || user.email;
}

function handleUserLoggedOut() {
    document.querySelector('.auth-buttons').style.display = 'block';
    document.querySelector('.user-info').style.display = 'none';
} 
// Authentication module for login, register, and guest access

const API_URL = 'http://localhost:3000/api';

// Register user
document.getElementById('register-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (!res.ok) {
            alert(data.error || 'Registration failed');
            return;
        }
        alert('Registration successful! Please login.');
        window.location.href = 'login.html';
    } catch (err) {
        alert('Error connecting to server.');
    }
});

// Login user
document.getElementById('login-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        
        if (res.ok) {
            // Note: In a real app we would use JWT, but here we just store the user response
            localStorage.setItem('currentUser', JSON.stringify(data));
            window.location.href = 'dashboard.html';
        } else {
            alert(data.error || 'Invalid username or password.');
        }
    } catch (err) {
        alert('Error connecting to server.');
    }
});

// Guest access
const guestBtn = document.getElementById('guest-btn');
const guestForm = document.getElementById('guest-form');
const guestSubmit = document.getElementById('guest-submit');

const GUEST_PASSWORD = 'guest123';

if (guestBtn && guestForm && guestSubmit) {
    guestBtn.addEventListener('click', () => {
        guestForm.style.display = 'block';
    });

    guestSubmit.addEventListener('click', () => {
        const enteredPassword = document.getElementById('guest-password').value;
        if (enteredPassword === GUEST_PASSWORD) {
            const guestUser = { id: 0, username: 'Guest', email: '' }; // Guest id 0
            localStorage.setItem('currentUser', JSON.stringify(guestUser));
            window.location.href = 'dashboard.html';
        } else {
            alert('Incorrect guest password.');
        }
    });
}

// Dark mode toggle
const themeToggleButtons = document.querySelectorAll('#theme-toggle');
themeToggleButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
});

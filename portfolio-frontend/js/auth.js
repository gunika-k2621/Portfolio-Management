// Authentication module for login, register, and guest access

// Utility function to get users from localStorage
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

// Utility function to save users to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Register user
document.getElementById('register-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    let users = getUsers();
    if (users.find(u => u.username === username)) {
        alert('Username already exists.');
        return;
    }

    users.push({ username, email, password, projects: [] });
    saveUsers(users);
    alert('Registration successful! Please login.');
    window.location.href = 'login.html';
});

// Login user
document.getElementById('login-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    let users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid username or password.');
    }
});

// Guest access
const guestBtn = document.getElementById('guest-btn');
const guestForm = document.getElementById('guest-form');
const guestSubmit = document.getElementById('guest-submit');

const GUEST_PASSWORD = 'guest123'; // Example guest password

if (guestBtn && guestForm && guestSubmit) {
    guestBtn.addEventListener('click', () => {
        guestForm.style.display = 'block';
    });

    guestSubmit.addEventListener('click', () => {
        const enteredPassword = document.getElementById('guest-password').value;
        if (enteredPassword === GUEST_PASSWORD) {
            const guestUser = { username: 'Guest', email: '', password: '', projects: [] };
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

// Load theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
});

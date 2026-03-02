// Dummy data for testing users and projects

const dummyUsers = [
    {
        username: 'alice',
        email: 'alice@example.com',
        password: 'password123',
        projects: [
            {
                title: 'Personal Website',
                description: 'A responsive personal website built with HTML, CSS, and JS.',
                technologies: 'HTML, CSS, JavaScript'
            },
            {
                title: 'Stock Portfolio Tracker',
                description: 'A web app to track stock portfolios with real-time data.',
                technologies: 'React, Node.js, API'
            }
        ]
    },
    {
        username: 'bob',
        email: 'bob@example.com',
        password: 'password123',
        projects: [
            {
                title: 'E-commerce Site',
                description: 'An online store with shopping cart and payment integration.',
                technologies: 'HTML, CSS, JavaScript, Stripe'
            }
        ]
    }
];

// Function to load dummy data if no users exist
function loadDummyData() {
    const users = localStorage.getItem('users');
    if (!users || JSON.parse(users).length === 0) {
        localStorage.setItem('users', JSON.stringify(dummyUsers));
        console.log('Dummy data loaded.');
    }
}

// Call loadDummyData on page load for testing
document.addEventListener('DOMContentLoaded', loadDummyData);

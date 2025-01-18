// Function to handle login
async function login(event) {
    event.preventDefault(); // Prevent form submission

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const loginData = {
        username,
        password
    };

    try {
        const response = await fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const data = await response.json();

        if (response.ok) {
            // Store the JWT token in localStorage
            localStorage.setItem('authToken', data.token);

            // Redirect to the dashboard page
            window.location.href = 'dashboard.html';
        } else {
            // Show error message
            document.getElementById('login-error-message').textContent = data.message;
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('login-error-message').textContent = 'An error occurred. Please try again.';
    }
}

// Function to handle signup
async function signup(event) {
    event.preventDefault(); // Prevent form submission

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const signupData = {
        username,
        email,
        password
    };

    try {
        const response = await fetch('http://localhost:8000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signupData)
        });

        const data = await response.json();

        if (response.ok) {
            // Redirect to login page if signup is successful
            window.location.href = 'login.html';
        } else {
            // Show error message
            document.getElementById('signup-error-message').textContent = data.message;
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('signup-error-message').textContent = 'An error occurred. Please try again.';
    }
}

// Function to check authentication when accessing the dashboard
async function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html'; // Redirect to login if no token
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('dashboard-message').textContent = data.message;
        } else {
            document.getElementById('dashboard-message').textContent = data.message;
            localStorage.removeItem('authToken'); // Remove invalid token
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Call the checkAuth function when the page loads
window.onload = checkAuth;

// Logout function to clear the token and redirect to login
function logout() {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html'; // Redirect to login page
}

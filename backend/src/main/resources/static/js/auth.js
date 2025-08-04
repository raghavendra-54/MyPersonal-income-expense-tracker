// API Configuration
const API_BASE_URL = 'https://symmetrical-space-guacamole-pjrjqp9jr9773rg7p-8080.app.github.dev/api';

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeAuthForms();
});

function initializeAuthForms() {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Registration Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Forgot Password Form
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) {
        console.error('Login button not found!');
        return;
    }

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        // Show loading state
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Logging in...';
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            // Try to parse JSON error first, fallback to text
            let errorText = 'Login failed';
            try {
                const errorData = await response.json();
                errorText = errorData.message || Object.values(errorData).join(', ') || 'Login failed.';
            } catch (jsonError) {
                errorText = await response.text();
            }
            throw new Error(errorText);
        }

        const data = await response.json();
        console.log('Login successful. Received data:', data);
        
        // Store tokens and user details
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userName', `${data.firstName} ${data.lastName}`); // NEW: Store full name
        
        // Redirect to dashboard
        window.location.href = '/index.html';

    } catch (error) {
        console.error('Login error:', error);
        showAlert(error.message || 'Login failed. Please try again.', 'danger'); // Use showAlert for consistent styling
    } finally {
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const formData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        position: document.getElementById('position').value,
        address: document.getElementById('address').value.trim(),
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };

    if (formData.password !== formData.confirmPassword) {
        showAlert('Passwords do not match', 'danger');
        return;
    }

    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        showAlert('Registration successful! Please login.', 'success');
        setTimeout(() => {
            window.location.href = '/auth/login.html';
        }, 1500);

    } catch (error) {
        console.error('Registration error:', error);
        showAlert(error.message || 'Registration failed. Please try again.', 'danger');
    } finally {
        showLoading(false);
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showAlert('New passwords do not match', 'danger'); // Changed message type
        return;
    }

    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email, 
                newPassword, 
                confirmPassword 
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Password reset failed');
        }

        showAlert('Password reset successful! Please login with your new password.', 'success');
        setTimeout(() => {
            window.location.href = '/auth/login.html';
        }, 1500);

    } catch (error) {
        console.error('Password reset error:', error);
        showAlert(error.message || 'Password reset failed. Please try again.', 'danger');
    } finally {
        showLoading(false);
    }
}

// Utility Functions
function showAlert(message, type = 'info') {
    // Remove any existing alerts first
    const existingAlert = document.querySelector('.auth-alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alertDiv = document.createElement('div');
    alertDiv.className = `auth-alert alert alert-${type}`;
    alertDiv.textContent = message;
    
    const form = document.querySelector('form');
    if (form) {
        form.prepend(alertDiv);
    }

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function showLoading(show) {
    const buttons = document.querySelectorAll('form button[type="submit"]');
    buttons.forEach(button => {
        button.disabled = show;
        button.innerHTML = show 
            ? '<span class="spinner-border spinner-border-sm" role="status"></span> Processing...'
            : button.textContent;
    });
}

// Logout function
function logoutUser() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId'); // Ensure userId is also cleared for consistency
    window.location.href = '/auth/login.html';
}
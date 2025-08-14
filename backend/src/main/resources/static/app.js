// API Configuration
const API_BASE_URL = window.location.origin + '/api';

// Global variables
let currentUser = null;
let currentView = 'dashboard';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    checkAuthentication();
});

// Authentication check
function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!token || !userEmail) {
        console.log('No authentication found, redirecting to login');
        window.location.href = '/auth/login.html';
        return;
    }
    
    console.log('Authentication found, initializing app for user:', userEmail);
    initializeApp();
}

// Initialize the main application
function initializeApp() {
    setupEventListeners();
    showDashboard(); // Default view
}

// Setup all event listeners
function setupEventListeners() {
    // Desktop navigation
    setupDesktopNavigation();
    
    // Mobile navigation
    setupMobileNavigation();
    
    console.log('Event listeners setup complete');
}

// Desktop navigation setup
function setupDesktopNavigation() {
    const navLinks = [
        { id: 'dashboard-link', view: 'dashboard', handler: showDashboard },
        { id: 'income-link', view: 'income', handler: showIncomeForm },
        { id: 'expense-link', view: 'expense', handler: showExpenseForm },
        { id: 'transactions-link', view: 'transactions', handler: showTransactions },
        { id: 'profile-link', view: 'profile', handler: showProfile },
        { id: 'contact-link', view: 'contact', handler: showContactInfo }
    ];

    navLinks.forEach(({ id, view, handler }) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                handler();
                updateActiveNavigation(view);
            });
        }
    });
}

// Mobile navigation setup
function setupMobileNavigation() {
    // Mobile header dropdown
    const mobileNavLinks = [
        { id: 'mobile-dashboard-link', view: 'dashboard', handler: showDashboard },
        { id: 'mobile-income-link', view: 'income', handler: showIncomeForm },
        { id: 'mobile-expense-link', view: 'expense', handler: showExpenseForm },
        { id: 'mobile-transactions-link', view: 'transactions', handler: showTransactions },
        { id: 'mobile-profile-link', view: 'profile', handler: showProfile },
        { id: 'mobile-contact-link', view: 'contact', handler: showContactInfo }
    ];

    mobileNavLinks.forEach(({ id, view, handler }) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                handler();
                updateActiveNavigation(view);
                // Close dropdown after selection
                const dropdown = bootstrap.Dropdown.getInstance(document.querySelector('.dropdown-toggle'));
                if (dropdown) dropdown.hide();
            });
        }
    });

    // Mobile bottom navigation
    const mobileBottomLinks = [
        { id: 'mobile-bottom-dashboard', view: 'dashboard', handler: showDashboard },
        { id: 'mobile-bottom-income', view: 'income', handler: showIncomeForm },
        { id: 'mobile-bottom-expense', view: 'expense', handler: showExpenseForm },
        { id: 'mobile-bottom-transactions', view: 'transactions', handler: showTransactions },
        { id: 'mobile-bottom-profile', view: 'profile', handler: showProfile }
    ];

    mobileBottomLinks.forEach(({ id, view, handler }) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                handler();
                updateActiveNavigation(view);
            });
        }
    });
}

// Update active navigation state
function updateActiveNavigation(activeView) {
    currentView = activeView;
    
    // Desktop navigation
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Mobile bottom navigation
    document.querySelectorAll('.mobile-nav .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Set active states
    const activeSelectors = [
        `#${activeView}-link`,
        `#mobile-${activeView}-link`,
        `#mobile-bottom-${activeView}`
    ];
    
    activeSelectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.classList.add('active');
        }
    });
}

// Dashboard view
async function showDashboard() {
    console.log('Showing dashboard...');
    const contentArea = document.getElementById('content-area');
    
    try {
        // Show loading
        contentArea.innerHTML = `
            <div class="text-center mt-5">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;

        // Fetch summary data
        const summaryData = await fetchWithAuth('/transactions/summary');
        
        contentArea.innerHTML = `
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 class="h2">Dashboard</h1>
                <div class="btn-toolbar mb-2 mb-md-0">
                    <div class="btn-group me-2">
                        <button type="button" class="btn btn-sm btn-outline-secondary" onclick="showIncomeForm()">Add Income</button>
                        <button type="button" class="btn btn-sm btn-outline-secondary" onclick="showExpenseForm()">Add Expense</button>
                    </div>
                </div>
            </div>

            <div class="row g-3 mb-4">
                <div class="col-md-4">
                    <div class="card summary-card income-card">
                        <div class="card-body">
                            <h5 class="card-title">Total Income</h5>
                            <p class="card-text">$${summaryData.totalIncome.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card summary-card expense-card">
                        <div class="card-body">
                            <h5 class="card-title">Total Expenses</h5>
                            <p class="card-text">$${summaryData.totalExpense.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card summary-card balance-card">
                        <div class="card-body">
                            <h5 class="card-title">Balance</h5>
                            <p class="card-text">$${summaryData.balance.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5>Income vs Expenses</h5>
                        </div>
                        <div class="card-body">
                            <div class="chart-container">
                                <canvas id="incomeExpenseChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5>Balance Overview</h5>
                        </div>
                        <div class="card-body">
                            <div class="chart-container">
                                <canvas id="balanceChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize charts
        initializeCharts(summaryData);

    } catch (error) {
        console.error('Error loading dashboard:', error);
        contentArea.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Error Loading Dashboard</h4>
                <p>${error.message}</p>
                <button class="btn btn-outline-danger" onclick="showDashboard()">Try Again</button>
            </div>
        `;
    }
}

// Income form view
function showIncomeForm() {
    console.log('Showing income form...');
    const contentArea = document.getElementById('content-area');
    
    contentArea.innerHTML = `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">Add Income</h1>
        </div>

        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <form id="incomeForm">
                            <div class="mb-3">
                                <label for="incomeTitle" class="form-label">Title</label>
                                <input type="text" class="form-control" id="incomeTitle" required>
                            </div>
                            <div class="mb-3">
                                <label for="incomeAmount" class="form-label">Amount</label>
                                <input type="number" class="form-control" id="incomeAmount" step="0.01" min="0" required>
                            </div>
                            <div class="mb-3">
                                <label for="incomeDate" class="form-label">Date</label>
                                <input type="date" class="form-control" id="incomeDate" required>
                            </div>
                            <div class="mb-3">
                                <label for="incomeCategory" class="form-label">Category</label>
                                <select class="form-select" id="incomeCategory">
                                    <option value="">Select Category</option>
                                    <option value="Salary">Salary</option>
                                    <option value="Freelance">Freelance</option>
                                    <option value="Business">Business</option>
                                    <option value="Investment">Investment</option>
                                    <option value="Gift">Gift</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-success">Add Income</button>
                            <button type="button" class="btn btn-secondary ms-2" onclick="showDashboard()">Cancel</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Set today's date as default
    document.getElementById('incomeDate').valueAsDate = new Date();
    
    // Setup form handler
    document.getElementById('incomeForm').addEventListener('submit', handleIncomeSubmit);
}

// Expense form view
function showExpenseForm() {
    console.log('Showing expense form...');
    const contentArea = document.getElementById('content-area');
    
    contentArea.innerHTML = `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">Add Expense</h1>
        </div>

        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <form id="expenseForm">
                            <div class="mb-3">
                                <label for="expenseTitle" class="form-label">Title</label>
                                <input type="text" class="form-control" id="expenseTitle" required>
                            </div>
                            <div class="mb-3">
                                <label for="expenseAmount" class="form-label">Amount</label>
                                <input type="number" class="form-control" id="expenseAmount" step="0.01" min="0" required>
                            </div>
                            <div class="mb-3">
                                <label for="expenseDate" class="form-label">Date</label>
                                <input type="date" class="form-control" id="expenseDate" required>
                            </div>
                            <div class="mb-3">
                                <label for="expenseCategory" class="form-label">Category</label>
                                <select class="form-select" id="expenseCategory">
                                    <option value="">Select Category</option>
                                    <option value="Food">Food</option>
                                    <option value="Transportation">Transportation</option>
                                    <option value="Housing">Housing</option>
                                    <option value="Utilities">Utilities</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Entertainment">Entertainment</option>
                                    <option value="Shopping">Shopping</option>
                                    <option value="Education">Education</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-danger">Add Expense</button>
                            <button type="button" class="btn btn-secondary ms-2" onclick="showDashboard()">Cancel</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Set today's date as default
    document.getElementById('expenseDate').valueAsDate = new Date();
    
    // Setup form handler
    document.getElementById('expenseForm').addEventListener('submit', handleExpenseSubmit);
}

// Transactions view
async function showTransactions() {
    console.log('Showing transactions...');
    const contentArea = document.getElementById('content-area');
    
    try {
        // Show loading
        contentArea.innerHTML = `
            <div class="text-center mt-5">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading transactions...</span>
                </div>
            </div>
        `;

        // Fetch transactions
        const transactions = await fetchWithAuth('/transactions');
        
        contentArea.innerHTML = `
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 class="h2">Transaction History</h1>
                <div class="btn-toolbar mb-2 mb-md-0">
                    <button type="button" class="btn btn-sm btn-outline-primary" onclick="exportTransactions()">
                        <i class="bi bi-download"></i> Export CSV
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${transactions.length === 0 ? 
                                    '<tr><td colspan="6" class="text-center">No transactions found</td></tr>' :
                                    transactions.map(transaction => `
                                        <tr class="${transaction.type === 'INCOME' ? 'table-success' : 'table-danger'}">
                                            <td>${new Date(transaction.date).toLocaleDateString()}</td>
                                            <td>${transaction.title}</td>
                                            <td>${transaction.category || 'N/A'}</td>
                                            <td>
                                                <span class="badge ${transaction.type === 'INCOME' ? 'bg-success' : 'bg-danger'}">
                                                    ${transaction.type}
                                                </span>
                                            </td>
                                            <td>$${transaction.amount.toFixed(2)}</td>
                                            <td>
                                                <button class="btn btn-sm btn-outline-primary" onclick="editTransaction(${transaction.id})">
                                                    <i class="bi bi-pencil"></i>
                                                </button>
                                                <button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteTransaction(${transaction.id})">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error loading transactions:', error);
        contentArea.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Error Loading Transactions</h4>
                <p>${error.message}</p>
                <button class="btn btn-outline-danger" onclick="showTransactions()">Try Again</button>
            </div>
        `;
    }
}

// Profile view
async function showProfile() {
    console.log('Showing profile...');
    const contentArea = document.getElementById('content-area');
    
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            throw new Error('User ID not found');
        }

        // Show loading
        contentArea.innerHTML = `
            <div class="text-center mt-5">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading profile...</span>
                </div>
            </div>
        `;

        // Fetch user data
        const userData = await fetchWithAuth(`/users/${userId}`);
        
        contentArea.innerHTML = `
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 class="h2">User Profile</h1>
            </div>

            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-body">
                            <form id="profileForm">
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="firstName" class="form-label">First Name</label>
                                        <input type="text" class="form-control" id="firstName" value="${userData.firstName}" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="lastName" class="form-label">Last Name</label>
                                        <input type="text" class="form-control" id="lastName" value="${userData.lastName}" required>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="email" value="${userData.email}" required>
                                </div>
                                <div class="mb-3">
                                    <label for="phone" class="form-label">Phone</label>
                                    <input type="tel" class="form-control" id="phone" value="${userData.phone}" required>
                                </div>
                                <div class="mb-3">
                                    <label for="position" class="form-label">Position</label>
                                    <input type="text" class="form-control" id="position" value="${userData.position}" required>
                                </div>
                                <div class="mb-3">
                                    <label for="address" class="form-label">Address</label>
                                    <input type="text" class="form-control" id="address" value="${userData.address || ''}">
                                </div>
                                <button type="submit" class="btn btn-primary">Update Profile</button>
                                <button type="button" class="btn btn-secondary ms-2" onclick="showDashboard()">Cancel</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Setup form handler
        document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);

    } catch (error) {
        console.error('Error loading profile:', error);
        contentArea.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Error Loading Profile</h4>
                <p>${error.message}</p>
                <button class="btn btn-outline-danger" onclick="showProfile()">Try Again</button>
            </div>
        `;
    }
}

// Contact info view
function showContactInfo() {
    console.log('Showing contact info...');
    const contentArea = document.getElementById('content-area');
    
    contentArea.innerHTML = `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">Contact Information</h1>
        </div>

        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Get in Touch</h5>
                        <p class="card-text">If you have any questions, suggestions, or need support, feel free to reach out to us.</p>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <h6><i class="bi bi-envelope me-2"></i>Email Support</h6>
                                <p>support@financetracker.com</p>
                                
                                <h6><i class="bi bi-telephone me-2"></i>Phone Support</h6>
                                <p>+1 (555) 123-4567</p>
                                
                                <h6><i class="bi bi-clock me-2"></i>Business Hours</h6>
                                <p>Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                            </div>
                            <div class="col-md-6">
                                <h6><i class="bi bi-geo-alt me-2"></i>Office Address</h6>
                                <p>123 Finance Street<br>
                                Business District<br>
                                New York, NY 10001</p>
                                
                                <h6><i class="bi bi-globe me-2"></i>Website</h6>
                                <p><a href="#" class="text-decoration-none">www.financetracker.com</a></p>
                            </div>
                        </div>
                        
                        <hr>
                        
                        <div class="text-center">
                            <h6>Follow Us</h6>
                            <div class="d-flex justify-content-center gap-3">
                                <a href="#" class="text-decoration-none"><i class="bi bi-twitter"></i> Twitter</a>
                                <a href="#" class="text-decoration-none"><i class="bi bi-facebook"></i> Facebook</a>
                                <a href="#" class="text-decoration-none"><i class="bi bi-linkedin"></i> LinkedIn</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Form handlers
async function handleIncomeSubmit(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('incomeTitle').value,
        amount: parseFloat(document.getElementById('incomeAmount').value),
        date: document.getElementById('incomeDate').value,
        type: 'INCOME',
        category: document.getElementById('incomeCategory').value
    };

    try {
        await fetchWithAuth('/transactions', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showAlert('Income added successfully!', 'success');
        showDashboard();
    } catch (error) {
        console.error('Error adding income:', error);
        showAlert(error.message, 'danger');
    }
}

async function handleExpenseSubmit(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('expenseTitle').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        date: document.getElementById('expenseDate').value,
        type: 'EXPENSE',
        category: document.getElementById('expenseCategory').value
    };

    try {
        await fetchWithAuth('/transactions', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showAlert('Expense added successfully!', 'success');
        showDashboard();
    } catch (error) {
        console.error('Error adding expense:', error);
        showAlert(error.message, 'danger');
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const userId = localStorage.getItem('userId');
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        position: document.getElementById('position').value,
        address: document.getElementById('address').value
    };

    try {
        await fetchWithAuth(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
        
        // Update stored user name
        localStorage.setItem('userName', `${formData.firstName} ${formData.lastName}`);
        localStorage.setItem('userEmail', formData.email);
        
        showAlert('Profile updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating profile:', error);
        showAlert(error.message, 'danger');
    }
}

// Transaction management
async function editTransaction(id) {
    // Implementation for editing transactions
    console.log('Edit transaction:', id);
    showAlert('Edit functionality coming soon!', 'info');
}

async function deleteTransaction(id) {
    if (!confirm('Are you sure you want to delete this transaction?')) {
        return;
    }

    try {
        await fetchWithAuth(`/transactions/${id}`, {
            method: 'DELETE'
        });
        
        showAlert('Transaction deleted successfully!', 'success');
        showTransactions(); // Refresh the list
    } catch (error) {
        console.error('Error deleting transaction:', error);
        showAlert(error.message, 'danger');
    }
}

// Export functionality
async function exportTransactions() {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions/export`, {
            headers: {
                'X-Auth-Token': localStorage.getItem('authToken')
            }
        });

        if (!response.ok) {
            throw new Error('Export failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'transactions.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        showAlert('Transactions exported successfully!', 'success');
    } catch (error) {
        console.error('Error exporting transactions:', error);
        showAlert('Export failed. Please try again.', 'danger');
    }
}

// Chart initialization
function initializeCharts(summaryData) {
    // Income vs Expense Chart
    const ctx1 = document.getElementById('incomeExpenseChart');
    if (ctx1) {
        new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: ['Income', 'Expenses'],
                datasets: [{
                    data: [summaryData.totalIncome, summaryData.totalExpense],
                    backgroundColor: ['#4cc9f0', '#f72585'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: window.innerWidth < 768 ? 'bottom' : 'right'
                    }
                }
            }
        });
    }

    // Balance Chart
    const ctx2 = document.getElementById('balanceChart');
    if (ctx2) {
        new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: ['Financial Overview'],
                datasets: [
                    {
                        label: 'Income',
                        data: [summaryData.totalIncome],
                        backgroundColor: '#4cc9f0',
                        borderColor: '#4cc9f0',
                        borderWidth: 1
                    },
                    {
                        label: 'Expenses',
                        data: [summaryData.totalExpense],
                        backgroundColor: '#f72585',
                        borderColor: '#f72585',
                        borderWidth: 1
                    },
                    {
                        label: 'Balance',
                        data: [summaryData.balance],
                        backgroundColor: '#4361ee',
                        borderColor: '#4361ee',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        position: window.innerWidth < 768 ? 'bottom' : 'top'
                    }
                }
            }
        });
    }
}

// Utility functions
async function fetchWithAuth(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': token,
            ...options.headers
        },
        ...options
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/auth/login.html';
        return;
    }
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Request failed');
    }
    
    return response.json();
}

function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert-dismissible');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const contentArea = document.getElementById('content-area');
    contentArea.insertBefore(alertDiv, contentArea.firstChild);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Logout function
function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = '/auth/login.html';
    }
}
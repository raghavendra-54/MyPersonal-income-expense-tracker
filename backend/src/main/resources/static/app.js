// API Configuration
const API_BASE_URL = https://finance-tracker-app-debk.onrender.com/api';

// Global variables
let currentChart = null;
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');

    // Check authentication first
    if (!isAuthenticated()) {
        console.log('User not authenticated, redirecting to login');
        window.location.href = '/auth/login.html';
        return;
    }

    // Initialize the app
    initializeApp();
});

function initializeApp() {
    console.log('Initializing app...');
    
    // Set up navigation
    setupNavigation();
    
    // Set up mobile menu from updated code
    setupMobileMenu();
    
    // Load initial view (dashboard)
    const initialHash = window.location.hash.substring(1) || 'dashboard';
    showPage(initialHash);
    
    console.log('App initialized successfully');
}

// Function to handle mobile menu logic (from updated app.js)
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    if (mobileMenuBtn && sidebar && overlay) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('show');
            overlay.classList.toggle('show');
        });
        
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
        });
        
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (sidebar.classList.contains('show')) {
                    sidebar.classList.remove('show');
                    overlay.classList.remove('show');
                }
            });
        });
    }
}

// Function to handle navigation and page loading (from updated app.js)
function setupNavigation() {
    document.getElementById('dashboard-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('dashboard');
    });
    
    document.getElementById('income-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('income');
    });
    
    document.getElementById('expense-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('expense');
    });
    
    document.getElementById('transactions-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('transactions');
    });
    
    document.getElementById('profile-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('profile');
    });
    
    document.getElementById('contact-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('contact');
    });
    
    document.getElementById('logout-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        showCustomConfirm('Are you sure you want to logout?', () => {
            logoutUser();
        });
    });
}

// Main page router function (from updated app.js)
function showPage(page) {
    console.log(`app.js: showPage called for: ${page}`);
    const contentArea = document.getElementById('content-area');

    if (contentArea) {
        contentArea.innerHTML = `
            <div class="d-flex justify-content-center align-items-center" style="min-height: 80vh;">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
    }

    switch(page) {
        case 'dashboard':
            showDashboard();
            break;
        case 'income':
            showAddIncome();
            break;
        case 'expense':
            showAddExpense();
            break;
        case 'transactions':
            showTransactions();
            break;
        case 'profile':
            showProfile();
            break;
        case 'contact':
            showDeveloperContact();
            break;
        default:
            showDashboard();
    }
    updateActiveNavigation(page);
}

// Other functions are taken from the updated code to maintain consistency
function updateActiveNavigation(activeSection) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.getElementById(`${activeSection}-link`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return token && token.trim() !== '';
}

function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'X-Auth-Token': token
    };
}

function logoutUser() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    window.location.href = '/auth/login.html';
}

async function showDashboard() {
    try {
        const userName = localStorage.getItem('userName') || 'User';
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 class="h2">Welcome, ${userName}!</h1>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-4 mb-3">
                    <div class="card summary-card income-card">
                        <div class="card-body">
                            <h5 class="card-title">Total Income</h5>
                            <p class="card-text" id="total-income">Loading...</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card summary-card expense-card">
                        <div class="card-body">
                            <h5 class="card-title">Total Expense</h5>
                            <p class="card-text" id="total-expense">Loading...</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card summary-card balance-card">
                        <div class="card-body">
                            <h5 class="card-title">Balance</h5>
                            <p class="card-text" id="balance">Loading...</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5>Income vs Expense</h5>
                        </div>
                        <div class="card-body">
                            <div class="chart-container">
                                <canvas id="incomeExpenseChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5>Recent Transactions</h5>
                        </div>
                        <div class="card-body">
                            <div id="recent-transactions">Loading...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        await loadDashboardData();
        
    } catch (error) {
        console.error('Error showing dashboard:', error);
        showAlert('Error loading dashboard', 'danger');
    }
}

async function loadDashboardData() {
    try {
        const summaryResponse = await fetch(`${API_BASE_URL}/transactions/summary`, {
            headers: getAuthHeaders()
        });
        
        if (summaryResponse.ok) {
            const summary = await summaryResponse.json();
            document.getElementById('total-income').textContent = `₹${summary.totalIncome.toFixed(2)}`;
            document.getElementById('total-expense').textContent = `₹${summary.totalExpense.toFixed(2)}`;
            document.getElementById('balance').textContent = `₹${summary.balance.toFixed(2)}`;
            createIncomeExpenseChart(summary.totalIncome, summary.totalExpense);
        }
        
        const transactionsResponse = await fetch(`${API_BASE_URL}/transactions`, {
            headers: getAuthHeaders()
        });
        
        if (transactionsResponse.ok) {
            const transactions = await transactionsResponse.json();
            displayRecentTransactions(transactions.slice(0, 5));
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function createIncomeExpenseChart(income, expense) {
    const ctx = document.getElementById('incomeExpenseChart');
    if (!ctx) return;
    if (currentChart) {
        currentChart.destroy();
    }
    currentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Income', 'Expense'],
            datasets: [{
                data: [income, expense],
                backgroundColor: ['#4cc9f0', '#f72585'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function displayRecentTransactions(transactions) {
    const container = document.getElementById('recent-transactions');
    if (!container) return;
    
    if (transactions.length === 0) {
        container.innerHTML = '<p class="text-muted">No transactions found</p>';
        return;
    }
    
    const html = transactions.map(transaction => `
        <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
            <div>
                <strong>${transaction.title}</strong>
                <br>
                <small class="text-muted">${transaction.date}</small>
            </div>
            <span class="badge ${transaction.type === 'INCOME' ? 'bg-success' : 'bg-danger'}">
                ${transaction.type === 'INCOME' ? '+' : '-'}₹${transaction.amount.toFixed(2)}
            </span>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

function showAddIncome() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">Add Income</h1>
        </div>
        
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <form id="incomeForm">
                            <div class="mb-3">
                                <label for="incomeTitle" class="form-label">Title</label>
                                <input type="text" class="form-control" id="incomeTitle" required>
                            </div>
                            <div class="mb-3">
                                <label for="incomeAmount" class="form-label">Amount (₹)</label>
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
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-success w-100">Add Income</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('incomeDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('incomeForm').addEventListener('submit', handleIncomeSubmit);
}

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
        const response = await fetch(`${API_BASE_URL}/transactions`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(formData)
        });
        if (response.ok) {
            showAlert('Income added successfully!', 'success');
            document.getElementById('incomeForm').reset();
            document.getElementById('incomeDate').value = new Date().toISOString().split('T')[0];
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add income');
        }
    } catch (error) {
        console.error('Error adding income:', error);
        showAlert(error.message || 'Error adding income', 'danger');
    }
}

function showAddExpense() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">Add Expense</h1>
        </div>
        
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <form id="expenseForm">
                            <div class="mb-3">
                                <label for="expenseTitle" class="form-label">Title</label>
                                <input type="text" class="form-control" id="expenseTitle" required>
                            </div>
                            <div class="mb-3">
                                <label for="expenseAmount" class="form-label">Amount (₹)</label>
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
                                    <option value="Entertainment">Entertainment</option>
                                    <option value="Shopping">Shopping</option>
                                    <option value="Bills">Bills</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-danger w-100">Add Expense</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('expenseForm').addEventListener('submit', handleExpenseSubmit);
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
        const response = await fetch(`${API_BASE_URL}/transactions`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(formData)
        });
        if (response.ok) {
            showAlert('Expense added successfully!', 'success');
            document.getElementById('expenseForm').reset();
            document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add expense');
        }
    } catch (error) {
        console.error('Error adding expense:', error);
        showAlert(error.message || 'Error adding expense', 'danger');
    }
}

async function showTransactions() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">Transactions</h1>
            <button class="btn btn-outline-primary" onclick="exportTransactions()">
                <i class="bi bi-download me-1"></i>Export CSV
            </button>
        </div>
        <div class="card mb-4">
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-3">
                        <select class="form-select" id="typeFilter">
                            <option value="">All Types</option>
                            <option value="INCOME">Income</option>
                            <option value="EXPENSE">Expense</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <input type="text" class="form-control" id="categoryFilter" placeholder="Category">
                    </div>
                    <div class="col-md-2">
                        <input type="date" class="form-control" id="startDateFilter">
                    </div>
                    <div class="col-md-2">
                        <input type="date" class="form-control" id="endDateFilter">
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn-primary w-100" onclick="loadTransactions()">Filter</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="card">
            <div class="card-body">
                <div id="transactions-table">Loading...</div>
            </div>
        </div>
    `;
    await loadTransactions();
}

async function loadTransactions() {
    try {
        const typeFilter = document.getElementById('typeFilter')?.value || '';
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';
        const startDateFilter = document.getElementById('startDateFilter')?.value || '';
        const endDateFilter = document.getElementById('endDateFilter')?.value || '';
        
        const params = new URLSearchParams();
        if (typeFilter) params.append('type', typeFilter);
        if (categoryFilter) params.append('category', categoryFilter);
        if (startDateFilter) params.append('startDate', startDateFilter);
        if (endDateFilter) params.append('endDate', endDateFilter);
        
        const response = await fetch(`${API_BASE_URL}/transactions?${params}`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const transactions = await response.json();
            displayTransactionsTable(transactions);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to load transactions');
        }
    } catch (error) {
        console.error('Error loading transactions:', error);
        const tableContainer = document.getElementById('transactions-table');
        if (tableContainer) {
            tableContainer.innerHTML = `<p class="text-danger">${error.message || 'Error loading transactions'}</p>`;
        }
    }
}

function displayTransactionsTable(transactions) {
    const container = document.getElementById('transactions-table');
    if (!container) return;
    
    if (transactions.length === 0) {
        container.innerHTML = '<p class="text-muted">No transactions found</p>';
        return;
    }
    
    const html = `
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
                    ${transactions.map(transaction => `
                        <tr class="${transaction.type === 'INCOME' ? 'table-success' : 'table-danger'}">
                            <td>${transaction.date}</td>
                            <td>${transaction.title}</td>
                            <td>${transaction.category || '-'}</td>
                            <td>
                                <span class="badge ${transaction.type === 'INCOME' ? 'bg-success' : 'bg-danger'}">
                                    ${transaction.type}
                                </span>
                            </td>
                            <td>₹${transaction.amount.toFixed(2)}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary me-1" onclick="editTransaction(${transaction.id})">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteTransaction(${transaction.id})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

async function editTransaction(id) {
    showAlert('Edit functionality coming soon!', 'info');
}

async function deleteTransaction(id) {
    showCustomConfirm('Are you sure you want to delete this transaction?', async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            if (response.ok) {
                showAlert('Transaction deleted successfully!', 'success');
                await loadTransactions();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete transaction');
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            showAlert(error.message || 'Error deleting transaction', 'danger');
        }
    });
}

async function exportTransactions() {
    try {
        const typeFilter = document.getElementById('typeFilter')?.value || '';
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';
        const startDateFilter = document.getElementById('startDateFilter')?.value || '';
        const endDateFilter = document.getElementById('endDateFilter')?.value || '';
        
        const params = new URLSearchParams();
        if (typeFilter) params.append('type', typeFilter);
        if (categoryFilter) params.append('category', categoryFilter);
        if (startDateFilter) params.append('startDate', startDateFilter);
        if (endDateFilter) params.append('endDate', endDateFilter);
        
        const response = await fetch(`${API_BASE_URL}/transactions/export?${params}`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'transactions.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showAlert('Transactions exported successfully!', 'success');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to export transactions');
        }
    } catch (error) {
        console.error('Error exporting transactions:', error);
        showAlert(error.message || 'Error exporting transactions', 'danger');
    }
}

async function showProfile() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">Profile</h1>
        </div>
        
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <div id="profile-content">Loading...</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    await loadProfile();
}

async function loadProfile() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        showAlert('User ID not found, please log in again.', 'danger');
        logoutUser();
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            headers: getAuthHeaders()
        });
        if (response.ok) {
            const user = await response.json();
            displayProfile(user);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to load profile');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        document.getElementById('profile-content').innerHTML = `<p class="text-danger">${error.message || 'Error loading profile'}</p>`;
    }
}

function displayProfile(user) {
    const container = document.getElementById('profile-content');
    if (!container) return;
    container.innerHTML = `
        <form id="profileForm">
            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="firstName" class="form-label">First Name</label>
                    <input type="text" class="form-control" id="firstName" value="${user.firstName}" required>
                </div>
                <div class="col-md-6">
                    <label for="lastName" class="form-label">Last Name</label>
                    <input type="text" class="form-control" id="lastName" value="${user.lastName}" required>
                </div>
            </div>
            <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" value="${user.email}" required>
            </div>
            <div class="mb-3">
                <label for="phone" class="form-label">Phone</label>
                <input type="tel" class="form-control" id="phone" value="${user.phone}" required>
            </div>
            <div class="mb-3">
                <label for="position" class="form-label">Position</label>
                <input type="text" class="form-control" id="position" value="${user.position}" required>
            </div>
            <div class="mb-3">
                <label for="address" class="form-label">Address</label>
                <input type="text" class="form-control" id="address" value="${user.address || ''}">
            </div>
            <button type="submit" class="btn btn-primary">Update Profile</button>
        </form>
    `;
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
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
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(formData)
        });
        if (response.ok) {
            showAlert('Profile updated successfully!', 'success');
            localStorage.setItem('userName', `${formData.firstName} ${formData.lastName}`);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showAlert(error.message || 'Error updating profile', 'danger');
    }
}

function showDeveloperContact() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">Developer Contact</h1>
        </div>
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body text-center">
                        <h3 class="mb-4">Get in Touch</h3>
                        <p class="lead mb-4">Have questions or feedback about the Finance Tracker? I'd love to hear from you!</p>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <div class="card h-100">
                                    <div class="card-body">
                                        <i class="bi bi-envelope-fill text-primary" style="font-size: 2rem;"></i>
                                        <h5 class="mt-3">Email</h5>
                                        <p>developer@financetracker.com</p>
                                        <a href="mailto:developer@financetracker.com" class="btn btn-outline-primary">Send Email</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 mb-3">
                                <div class="card h-100">
                                    <div class="card-body">
                                        <i class="bi bi-github text-dark" style="font-size: 2rem;"></i>
                                        <h5 class="mt-3">GitHub</h5>
                                        <p>View source code and contribute</p>
                                        <a href="https://github.com/developer/finance-tracker" target="_blank" class="btn btn-outline-dark">View on GitHub</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mt-4">
                            <h5>About This Project</h5>
                            <p class="text-muted">
                                This Finance Tracker is built with Spring Boot and vanilla JavaScript. 
                                It's designed to help you manage your personal finances with ease and security.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Utility functions (from updated app.js)
function showAlert(message, type = 'info') {
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    const contentArea = document.getElementById('content-area');
    contentArea.insertBefore(alertDiv, contentArea.firstChild);
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function showCustomConfirm(message, onConfirm) {
    const modalHtml = `
        <div class="modal fade" id="customConfirmModal" tabindex="-1" aria-labelledby="customConfirmModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="customConfirmModalLabel">Confirm Action</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${message}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" id="confirmActionBtn">Confirm</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    const existingModal = document.getElementById('customConfirmModal');
    if (existingModal) {
        existingModal.remove();
    }
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const confirmModal = new bootstrap.Modal(document.getElementById('customConfirmModal'));
    confirmModal.show();
    document.getElementById('confirmActionBtn').addEventListener('click', () => {
        onConfirm();
        confirmModal.hide();
    });
    document.getElementById('customConfirmModal').addEventListener('hidden.bs.modal', function (event) {
        this.remove();
    });
}

const API_BASE_URL = 'https://mypersonal-income-expense-tracker-production.up.railway.app/api';

// User state management
const currentUser = {
    email: null,
    name: 'Guest',
    isLoggedIn: false,
    id: null 
};

let expenseChartInstance = null;
let monthlyChartInstance = null;
const contentArea = document.getElementById('content-area');

document.addEventListener('DOMContentLoaded', async () => {
    const authToken = localStorage.getItem('authToken');
    const userEmail = localStorage.getItem('userEmail');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName'); 

    const isOnAuthPage = window.location.pathname.includes('/auth/'); 

    console.log('DOMContentLoaded: Checking auth state.');
    console.log('  authToken:', authToken ? 'Present' : 'Missing');
    console.log('  userEmail:', userEmail);
    console.log('  userId:', userId);
    console.log('  userName:', userName);

    // Scenario 1: User is already logged in (localStorage has all items)
    if (authToken && userEmail && userId && userName) {
        currentUser.email = userEmail;
        currentUser.id = userId;
        currentUser.name = userName;
        currentUser.isLoggedIn = true;

        if (isOnAuthPage) { 
            console.log('  Already logged in on auth page, redirecting to index.html.');
            window.location.href = '/index.html';
            return;
        } else { 
            console.log('  All required localStorage items found. Initializing app directly.');
            initApp();
            return; 
        }
    } 
    // Scenario 2: User is NOT logged in (missing localStorage items)
    else {
        if (!isOnAuthPage) {
            console.log('  Not logged in and not on auth page. Redirecting to login.html.');
            logoutUser(); 
            return;
        }
        console.log('  Not logged in, but on an auth page. Allowing page to load.');
    }
});

function initApp() {
    console.log('App initialized. User is logged in.');
    document.getElementById('dashboard-link').addEventListener('click', (e) => { e.preventDefault(); loadPage('dashboard'); });
    document.getElementById('income-link').addEventListener('click', (e) => { e.preventDefault(); loadPage('income'); });
    document.getElementById('expense-link').addEventListener('click', (e) => { e.preventDefault(); loadPage('expense'); });
    document.getElementById('transactions-link').addEventListener('click', (e) => { e.preventDefault(); loadPage('transactions'); });
    
    const sidebarNav = document.querySelector('.sidebar .nav');
    if (sidebarNav) {
        if (!document.getElementById('profile-link')) {
            const profileItem = document.createElement('li');
            profileItem.className = 'nav-item';
            profileItem.innerHTML = `<a class="nav-link" href="#profile" id="profile-link"><i class="bi bi-person-circle me-2"></i>Profile</a>`;
            sidebarNav.appendChild(profileItem);
            document.getElementById('profile-link').addEventListener('click', (e) => { e.preventDefault(); loadPage('profile'); });
        }

        if (!document.getElementById('logout-link')) {
            const logoutItem = document.createElement('li');
            logoutItem.className = 'nav-item mt-auto'; 
            logoutItem.innerHTML = `<a class="nav-link" href="#" id="logout-link"><i class="bi bi-box-arrow-right me-2"></i>Logout</a>`;
            sidebarNav.appendChild(logoutItem);
            document.getElementById('logout-link').addEventListener('click', (e) => { e.preventDefault(); logoutUser(); });
        }
    }

    if (sidebarNav && !document.getElementById('developer-contact-link')) {
        const devContactItem = document.createElement('li');
        devContactItem.className = 'nav-item';
        devContactItem.innerHTML = `<a class="nav-link" href="#" id="developer-contact-link"><i class="bi bi-info-circle me-2"></i>Contact Developer</a>`;
        sidebarNav.appendChild(devContactItem);
        document.getElementById('developer-contact-link').addEventListener('click', (e) => { 
            e.preventDefault(); 
            showDeveloperContact(); 
        });
    }

    const initialHash = window.location.hash.substring(1);
    loadPage(initialHash || 'dashboard');
}

function updateWelcomeMessage() {
    const welcomeElement = document.getElementById('welcome-message'); 
    if (welcomeElement) {
        welcomeElement.textContent = `Welcome, ${currentUser.name}`;
    }
}

function logoutUser() { 
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName'); 
    currentUser.email = null;
    currentUser.name = 'Guest';
    currentUser.isLoggedIn = false;
    currentUser.id = null;
    window.location.href = '/auth/login.html';
}

async function loadPage(page) {
    console.log(`app.js: loadPage called for: ${page}`);
    if (!currentUser.isLoggedIn && !window.location.pathname.includes('/auth/')) { 
        window.location.href = '/auth/login.html';
        return;
    }

    if (contentArea) { 
        contentArea.innerHTML = `<div class="text-center mt-5"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>`;
    }

    switch(page) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'income':
            loadIncomeForm();
            break;
        case 'expense':
            loadExpenseForm();
            break;
        case 'transactions':
            await loadTransactions();
            break;
        case 'profile':
            await loadProfilePage();
            break;
        default:
            await loadDashboard();
    }
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.getElementById(`${page}-link`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

async function fetchWithAuth(url, options = {}) {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        logoutUser();
        throw new Error('No auth token found');
    }

    const headers = {
        'Content-Type': 'application/json',
        'X-Auth-Token': authToken,
        ...options.headers
    };

    try {
    const response = await fetch(url, { 
        ...options,
        headers,
        credentials: 'omit'
    });

    if (response.status === 401 || response.status === 403) {
        if (!window.location.pathname.includes('/auth/login.html')) {
            alert('Session expired. Please log in again.');
            logoutUser();
        }
        throw new Error('Unauthorized');
    }

    // Only throw an error if the response status is not a success (200-299)
    if (!response.ok) {
        let errorText = 'API Error';
        try {
            errorText = await response.text(); // Try to get the error message text
        } catch (e) {
            // Ignore if response body is empty
        }
        throw new Error(`Server error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response; // Return the response object for all successful statuses
} catch (error) {
    console.error('API Error:', error);
    if (error.message && !error.message.includes('Unauthorized') && !error.message.includes('Failed to fetch')) {
        alert(`API Error: ${error.message}. Please check console for details.`);
    } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        alert('Network error. Could not connect to the server. Please check your internet connection or server status.');
    }
    throw error;
}
}

async function loadDashboard() {
    if (!currentUser.isLoggedIn) {
        contentArea.innerHTML = `<div class="alert alert-warning text-center">Please log in to view the dashboard.</div>`;
        return;
    }

    try {
        contentArea.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Dashboard</h2>
                <div class="text-muted" id="welcome-message">Welcome, ${currentUser.name}</div>
            </div>

            <div class="row mb-4">
                <div class="col-md-4 mb-3">
                    <div class="card summary-card income-card h-100">
                        <div class="card-body">
                            <h5 class="card-title text-success">Total Income</h5>
                            <h2 class="card-text" id="total-income">₹0</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card summary-card expense-card h-100">
                        <div class="card-body">
                            <h5 class="card-title text-danger">Total Expenses</h5>
                            <h2 class="card-text" id="total-expense">₹0</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card summary-card balance-card h-100">
                        <div class="card-body">
                            <h5 class="card-title text-primary">Balance</h5>
                            <h2 class="card-text" id="balance">₹0</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">Expense Categories</h5>
                            <div class="chart-container">
                                <canvas id="expenseChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">Monthly Overview</h5>
                            <div class="chart-container">
                                <canvas id="monthlyChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card mt-4">
                <div class="card-body">
                    <h5 class="card-title">Recent Transactions</h5>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody id="recent-transactions">
                                </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        // This ensures updateWelcomeMessage and data loading happens *after* the browser has parsed the new elements.
        updateWelcomeMessage();

        window.requestAnimationFrame(async () => {
            try {
                await loadSummaryData();
                await initExpenseChart();
                await initMonthlyChart();
                await loadRecentTransactions();
            } catch (error) {
                console.error('Error in deferred dashboard data loading:', error);
                // If dashboard still spins, the error likely comes from here.
                // Display a user-friendly error message on the dashboard itself.
                const dashboardArea = document.querySelector('#content-area .row'); // Select a relevant area
                if (dashboardArea) {
                    dashboardArea.innerHTML = `<div class="alert alert-danger text-center">Failed to load dashboard data. Please try again.</div>`;
                }
            }
        });

    } catch (error) {
        console.error('Error setting up dashboard HTML:', error); // This catches errors related to setting contentArea.innerHTML
        if (contentArea) {
            contentArea.innerHTML = `<div class="alert alert-danger">Error loading dashboard layout. ${error.message}</div>`;
        }
    }
}

async function loadSummaryData() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/transactions/summary`);
        if (!response.ok) throw new Error('Failed to fetch summary');
        const data = await response.json();

        document.getElementById('total-income').textContent = `₹${data.totalIncome.toLocaleString()}`;
        document.getElementById('total-expense').textContent = `₹${data.totalExpense.toLocaleString()}`;
        document.getElementById('balance').textContent = `₹${data.balance.toLocaleString()}`;
    } catch (error) {
        console.error('Failed to load summary data:', error);
        const incomeElement = document.getElementById('total-income');
        const expenseElement = document.getElementById('total-expense');
        const balanceElement = document.getElementById('balance');
        if (incomeElement) incomeElement.textContent = `Error`;
        if (expenseElement) expenseElement.textContent = `Error`;
        if (balanceElement) balanceElement.textContent = `Error`;
        throw error; // Re-throw to propagate to the calling requestAnimationFrame catch
    }
}

async function initExpenseChart() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/transactions`);
        if (!response.ok) throw new Error('Failed to fetch transactions for expense chart');
        const transactions = await response.json();

        const expenseCategories = {};
        transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
            const category = t.category || 'Uncategorized';
            expenseCategories[category] = (expenseCategories[category] || 0) + t.amount;
        });

        const labels = Object.keys(expenseCategories);
        const data = Object.values(expenseCategories);
        const backgroundColor = labels.map((_, i) => [
            '#4cc9f0', '#4361ee', '#3f37c9', '#4895ef', '#f72585', '#90e0ef', '#0077b6', '#023e8a', '#fee440'
        ][i % 9]);

        const ctx = document.getElementById('expenseChart').getContext('2d');
        if (expenseChartInstance) {
            expenseChartInstance.destroy();
        }
        expenseChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColor,
                    borderWidth: 1
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
    } catch (error) {
        console.error('Error initializing expense chart:', error);
        const chartContainer = document.getElementById('expenseChart') ? document.getElementById('expenseChart').closest('.chart-container') : null;
        if (chartContainer) chartContainer.innerHTML = '<div class="alert alert-warning text-center">Failed to load expense chart data.</div>';
        throw error; // Re-throw to propagate
    }
}

async function initMonthlyChart() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/transactions`);
        if (!response.ok) throw new Error('Failed to fetch transactions for monthly chart');
        const transactions = await response.json();

        const monthlyIncome = {};
        const monthlyExpense = {};

        transactions.forEach(t => {
            const date = new Date(t.date);
            const monthYear = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });

            if (t.type === 'INCOME') {
                monthlyIncome[monthYear] = (monthlyIncome[monthYear] || 0) + t.amount;
            } else if (t.type === 'EXPENSE') {
                monthlyExpense[monthYear] = (monthlyExpense[monthYear] || 0) + t.amount;
            }
        });

        const allMonthYears = Array.from(new Set([...Object.keys(monthlyIncome), ...Object.keys(monthlyExpense)]))
                               .sort((a, b) => new Date(a) - new Date(b));

        const incomeData = allMonthYears.map(monthYear => monthlyIncome[monthYear] || 0);
        const expenseData = allMonthYears.map(monthYear => monthlyExpense[monthYear] || 0);

        const ctx = document.getElementById('monthlyChart').getContext('2d');
        if (monthlyChartInstance) {
            monthlyChartInstance.destroy();
        }
        monthlyChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: allMonthYears,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        backgroundColor: '#4cc9f0'
                    },
                    {
                        label: 'Expenses',
                        data: expenseData,
                        backgroundColor: '#f72585'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: false
                    },
                    y: {
                        stacked: false,
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error initializing monthly chart:', error);
        const chartContainer = document.getElementById('monthlyChart') ? document.getElementById('monthlyChart').closest('.chart-container') : null;
        if (chartContainer) chartContainer.innerHTML = '<div class="alert alert-warning text-center">Failed to load monthly chart data.</div>';
        throw error; // Re-throw to propagate
    }
}

async function loadRecentTransactions() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/transactions`);
        if (!response.ok) throw new Error('Failed to fetch transactions');
        const transactions = await response.json();

        const tbody = document.getElementById('recent-transactions');
        if (!tbody) {
            console.warn('Recent transactions tbody not found. Skipping update.');
            return;
        }

        const sortedTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentDisplayTransactions = sortedTransactions.slice(0, 5);

        if (recentDisplayTransactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted">No recent transactions yet. Add some income or expenses!</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = recentDisplayTransactions.map(transaction => `
            <tr class="${transaction.type === 'INCOME' ? 'table-success' : 'table-danger'}">
                <td>${transaction.date}</td>
                <td>${transaction.title}</td>
                <td>${transaction.category || 'N/A'}</td>
                <td>₹${transaction.amount.toLocaleString()}</td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error loading recent transactions:', error);
        const tbody = document.getElementById('recent-transactions');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-danger">Error loading recent transactions</td>
                </tr>
            `;
        }
        throw error; // Re-throw to propagate
    }
}

function loadIncomeForm() {
    if (!currentUser.isLoggedIn) {
        contentArea.innerHTML = `<div class="alert alert-warning text-center">Please log in to add income.</div>`;
        return;
    }
    contentArea.innerHTML = `
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <h2 class="card-title mb-4">Add Income</h2>
                        <form id="incomeForm">
                            <div class="mb-3">
                                <label for="incomeTitle" class="form-label">Income Source</label>
                                <input type="text" class="form-control" id="incomeTitle" required>
                            </div>
                            <div class="mb-3">
                                <label for="incomeAmount" class="form-label">Amount (₹)</label>
                                <input type="number" class="form-control" id="incomeAmount" min="0" step="0.01" required>
                            </div>
                            <div class="mb-3">
                                <label for="incomeCategory" class="form-label">Category</label>
                                <select class="form-select" id="incomeCategory" required>
                                    <option value="SALARY">Salary</option>
                                    <option value="BONUS">Bonus</option>
                                    <option value="FREELANCE">Freelance</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="incomeDate" class="form-label">Date</label>
                                <input type="date" class="form-control" id="incomeDate" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Add Income</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('incomeDate').valueAsDate = new Date();

    document.getElementById('incomeForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const transactionData = {
                title: document.getElementById('incomeTitle').value,
                amount: parseFloat(document.getElementById('incomeAmount').value),
                type: 'INCOME',
                category: document.getElementById('incomeCategory').value,
                date: document.getElementById('incomeDate').value
            };

            const response = await fetchWithAuth(`${API_BASE_URL}/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transactionData)
            });

            if (!response.ok) {
                const errorData = await response.json(); 
                throw new Error(errorData.message || 'Failed to add income');
            }

            alert('Income added successfully!');
            loadDashboard();
        } catch (error) {
            console.error('Error:', error);
            if (error.message && !error.message.includes('Unauthorized')) {
                alert(`Error adding income: ${error.message}`);
            }
        }
    });
}

function loadExpenseForm() {
    if (!currentUser.isLoggedIn) {
        contentArea.innerHTML = `<div class="alert alert-warning text-center">Please log in to add expenses.</div>`;
        return;
    }
    contentArea.innerHTML = `
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <h2 class="card-title mb-4">Add Expense</h2>
                        <form id="expenseForm">
                            <div class="mb-3">
                                <label for="expenseTitle" class="form-label">Expense Description</label>
                                <input type="text" class="form-control" id="expenseTitle" required>
                            </div>
                            <div class="mb-3">
                                <label for="expenseCategory" class="form-label">Category</label>
                                <select class="form-select" id="expenseCategory" required>
                                    <option value="">Select a category</option>
                                    <option value="FOOD">Food</option>
                                    <option value="RENT">Rent</option>
                                    <option value="TRANSPORT">Transport</option>
                                    <option value="UTILITIES">Utilities</option>
                                    <option value="ENTERTAINMENT">Entertainment</option>
                                    <option value="HEALTH">Health</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="expenseAmount" class="form-label">Amount (₹)</label>
                                <input type="number" class="form-control" id="expenseAmount" min="0" step="0.01" required>
                            </div>
                            <div class="mb-3">
                                <label for="expenseDate" class="form-label">Date</label>
                                <input type="date" class="form-control" id="expenseDate" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Add Expense</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('expenseDate').valueAsDate = new Date();

    document.getElementById('expenseForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const transactionData = {
                title: document.getElementById('expenseTitle').value,
                amount: parseFloat(document.getElementById('expenseAmount').value),
                type: 'EXPENSE',
                category: document.getElementById('expenseCategory').value,
                date: document.getElementById('expenseDate').value
            };

            const response = await fetchWithAuth(`${API_BASE_URL}/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transactionData)
            });

            if (!response.ok) {
                const errorData = await response.json(); 
                throw new Error(errorData.message || 'Failed to add expense');
            }

            alert('Expense added successfully!');
            loadDashboard();
        } catch (error) {
            console.error('Error:', error);
            if (error.message && !error.message.includes('Unauthorized')) {
                alert(`Error adding expense: ${error.message}`);
            }
        }
    });
}

async function loadTransactions() {
    if (!currentUser.isLoggedIn) {
        contentArea.innerHTML = `<div class="alert alert-warning text-center">Please log in to view transactions.</div>`;
        return;
    }
    contentArea.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Transaction History</h2>
            <div>
                <button class="btn btn-outline-primary me-2" id="filterBtn">
                    <i class="bi bi-funnel"></i> Filters
                </button>
                <button class="btn btn-outline-success" id="exportBtn">
                    <i class="bi bi-download"></i> Export
                </button>
            </div>
        </div>

        <div class="card mb-4" id="filterCard" style="display: none;">
            <div class="card-body">
                <form id="transactionFilterForm" class="row g-3">
                    <div class="col-md-3">
                        <label for="filterType" class="form-label">Type</label>
                        <select id="filterType" class="form-select">
                            <option value="">All</option>
                            <option value="INCOME">Income</option>
                            <option value="EXPENSE">Expense</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label for="filterCategory" class="form-label">Category</label>
                        <select class="form-select" id="filterCategory">
                            <option value="">All</option>
                            <option value="FOOD">Food</option>
                            <option value="RENT">Rent</option>
                            <option value="TRANSPORT">Transport</option>
                            <option value="UTILITIES">Utilities</option>
                            <option value="ENTERTAINMENT">Entertainment</option>
                            <option value="HEALTH">Health</option>
                            <option value="OTHER">Other</option>
                            <option value="SALARY">Salary</option>
                            <option value="BONUS">Bonus</option>
                            <option value="FREELANCE">Freelance</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label for="filterStartDate" class="form-label">From Date</label>
                        <input type="date" class="form-control" id="filterStartDate">
                    </div>
                    <div class="col-md-3">
                        <label for="filterEndDate" class="form-label">To Date</label>
                        <input type="date" class="form-control" id="filterEndDate">
                    </div>
                    <div class="col-12">
                        <button type="submit" class="btn btn-primary me-2">Apply Filters</button>
                        <button type="reset" class="btn btn-outline-secondary">Reset</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Type</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="transactionsTableBody">
                            </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    document.getElementById('filterBtn').addEventListener('click', () => {
        const filterCard = document.getElementById('filterCard');
        filterCard.style.display = filterCard.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('transactionFilterForm').addEventListener('submit', (e) => {
        e.preventDefault();
        filterTransactions();
    });
    document.getElementById('transactionFilterForm').addEventListener('reset', () => {
        loadAllTransactions();
    });

    document.getElementById('exportBtn').addEventListener('click', async () => {
        const type = document.getElementById('filterType').value;
        const category = document.getElementById('filterCategory').value;
        const startDate = document.getElementById('filterStartDate').value;
        const endDate = document.getElementById('filterEndDate').value;

        const queryParams = new URLSearchParams();
        if (type) queryParams.append('type', type);
        if (category) queryParams.append('category', category);
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);

        const exportUrl = `${API_BASE_URL}/transactions/export?${queryParams.toString()}`;
        console.log("Attempting to export from URL:", exportUrl);

        try {
            const response = await fetchWithAuth(exportUrl);

            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }

            let filename = 'transactions.csv';
            const disposition = response.headers.get('Content-Disposition');
            if (disposition && disposition.indexOf('attachment') !== -1) {
                const filenameRegex = /filename="?([^"]*)"?/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) filename = matches[1];
            }

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

            console.log("Download successfully initiated.");
        } catch (error) {
            console.error('Error during export:', error);
            alert(`Failed to export transactions: ${error.message}`);
        }
    });

    loadAllTransactions();
}

async function loadAllTransactions() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/transactions`);
        if (!response.ok) throw new Error('Failed to fetch all transactions');
        const transactions = await response.json();
        renderTransactionTable(transactions);
    } catch (error) {
        console.error('Error loading all transactions:', error);
        const tbody = document.getElementById('transactionsTableBody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error loading transactions for history</td></tr>`;
        }
    }
}

function renderTransactionTable(transactions) {
    const tbody = document.getElementById('transactionsTableBody');
    if (!tbody) return;

    if (transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No transactions found for the selected criteria.</td></tr>`;
        return;
    }

    tbody.innerHTML = transactions.map(transaction => `
        <tr class="${transaction.type === 'INCOME' ? 'table-success' : 'table-danger'}">
            <td>${transaction.date}</td>
            <td>${transaction.title}</td>
            <td>${transaction.category || 'N/A'}</td>
            <td>₹${transaction.amount.toLocaleString()}</td>
            <td>${transaction.type}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editTransaction(${transaction.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteTransaction(${transaction.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function filterTransactions() {
    const type = document.getElementById('filterType').value;
    const category = document.getElementById('filterCategory').value;
    const startDate = document.getElementById('filterStartDate').value;
    const endDate = document.getElementById('filterEndDate').value;

    const queryParams = new URLSearchParams();
    if (type) queryParams.append('type', type);
    if (category) queryParams.append('category', category);
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/transactions?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch filtered transactions');
        const filteredTransactions = await response.json();
        renderTransactionTable(filteredTransactions);
    } catch (error) {
        console.error('Error filtering transactions:', error);
        const tbody = document.getElementById('transactionsTableBody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error filtering transactions</td></tr>`;
        }
    }
}

async function editTransaction(id) {
    try {
        // Fetch all transactions to find the one to edit (less efficient but works for small datasets)
        const allTransactionsResponse = await fetchWithAuth(`${API_BASE_URL}/transactions`);
        if (!allTransactionsResponse.ok) throw new Error('Failed to fetch transactions for edit lookup');
        const allTransactions = await allTransactionsResponse.json();
        const transactionToEdit = allTransactions.find(t => t.id === id);

        if (!transactionToEdit) {
            alert('Transaction not found or you do not have permission to edit it.');
            return;
        }

        const newTitle = prompt('Enter new title:', transactionToEdit.title);
        const newAmount = prompt('Enter new amount:', transactionToEdit.amount);
        const newCategory = prompt('Enter new category:', transactionToEdit.category);
        const newDate = prompt('Enter new date (YYYY-MM-DD):', transactionToEdit.date);

        if (newTitle === null || newAmount === null || newCategory === null || newDate === null) {
            return; // User cancelled
        }

        const updatedTransactionData = {
            title: newTitle,
            amount: parseFloat(newAmount),
            type: transactionToEdit.type, // Keep original type
            category: newCategory,
            date: newDate
        };

        const updateResponse = await fetchWithAuth(`${API_BASE_URL}/transactions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTransactionData)
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.error || errorData.message || 'Failed to update transaction');
        }

        const updatedTransaction = await updateResponse.json();
        alert('Transaction updated successfully!');
        loadAllTransactions(); // Refresh transaction list
        loadDashboard(); // Refresh dashboard summary/charts
    } catch (error) {
        console.error('Error updating transaction:', error);
        if (error.message && !error.message.includes('Unauthorized')) {
            alert(`Error updating transaction: ${error.message}`);
        }
    }
}

async function deleteTransaction(id) {
    showCustomConfirm(`Are you sure you want to delete transaction ${id}? This action cannot be undone.`, async () => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/transactions/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || `Failed to delete transaction with status ${response.status}`);
                } else {
                    throw new Error(`Failed to delete transaction: ${response.status} ${response.statusText}`);
                }
            }

            alert('Transaction deleted successfully!');
            loadAllTransactions();
            loadDashboard();
        } catch (error) {
            console.error('Error deleting transaction:', error);
            if (error.message && !error.message.includes('Unauthorized')) {
                alert(`Error deleting transaction: ${error.message}`);
            }
        }
    });
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
                        <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Delete</button>
                    </div>
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

    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        onConfirm();
        confirmModal.hide();
    });

    document.getElementById('customConfirmModal').addEventListener('hidden.bs.modal', function (event) {
        this.remove();
    });
}

async function loadProfilePage() {
    if (!currentUser.isLoggedIn) { 
        contentArea.innerHTML = `<div class="alert alert-warning text-center">Please log in to view your profile.</div>`;
        return;
    }

    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/users/${currentUser.id}`); 
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('User profile not found. Please try registering again.');
            }
            const errorData = await response.json();
            throw new Error(errorData.error || errorData.message || 'Failed to fetch user profile');
        }
        const userProfile = await response.json();

        contentArea.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-body">
                            <h2 class="card-title mb-4 text-center">User Profile</h2>
                            <form id="profileForm">
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="profileFirstName" class="form-label">First Name</label>
                                        <input type="text" class="form-control" id="profileFirstName" value="${userProfile.firstName}" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="profileLastName" class="form-label">Last Name</label>
                                        <input type="text" class="form-control" id="profileLastName" value="${userProfile.lastName}" required>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="profileEmail" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="profileEmail" value="${userProfile.email}" required>
                                </div>
                                <div class="mb-3">
                                    <label for="profilePhone" class="form-label">Contact Number</label>
                                    <input type="tel" class="form-control" id="profilePhone" value="${userProfile.phone}" pattern="\\d{10}" title="Phone number must be 10 digits" required>
                                </div>
                                <div class="mb-3">
                                    <label for="profilePosition" class="form-label">Position</label>
                                    <select class="form-select" id="profilePosition" required>
                                        <option value="">Select Position</option>
                                        <option value="Employee">Employee</option>
                                        <option value="Job Seeker">Job Seeker</option>
                                        <option value="Business Owner">Business Owner</option>
                                        <option value="Freelancer">Freelancer</option>
                                        <option value="Student">Student</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="profileAddress" class="form-label">Address (Optional)</label>
                                    <input type="text" class="form-control" id="profileAddress" value="${userProfile.address || ''}">
                                </div>
                                <div class="mb-3">
                                    <label for="profilePassword" class="form-label">New Password (leave blank to keep current)</label>
                                    <input type="password" class="form-control" id="profilePassword">
                                </div>
                                <div class="mb-3">
                                    <label for="profileConfirmPassword" class="form-label">Confirm New Password</label>
                                    <input type="password" class="form-control" id="profileConfirmPassword">
                                </div>
                                <button type="submit" class="btn btn-primary w-100">Update Profile</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('profilePosition').value = userProfile.position;

        document.getElementById('profileForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const newPassword = document.getElementById('profilePassword').value;
            const confirmNewPassword = document.getElementById('profileConfirmPassword').value;

            if (newPassword && newPassword !== confirmNewPassword) {
                alert('New password and confirm password do not match.');
                return;
            }

            const updatedProfileData = {
                firstName: document.getElementById('profileFirstName').value,
                lastName: document.getElementById('profileLastName').value,
                email: document.getElementById('profileEmail').value,
                phone: document.getElementById('profilePhone').value,
                position: document.getElementById('profilePosition').value,
                address: document.getElementById('profileAddress').value,
                password: newPassword 
            };

            try {
                const updateResponse = await fetchWithAuth(`${API_BASE_URL}/users/${currentUser.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedProfileData)
                });

                if (!updateResponse.ok) {
                    const errorData = await updateResponse.json();
                    throw new Error(errorData.error || errorData.message || 'Failed to update profile');
                }

                const updatedUser = await updateResponse.json();
                alert('Profile updated successfully!');
                localStorage.setItem('userEmail', updatedUser.email);
                localStorage.setItem('userName', `${updatedUser.firstName} ${updatedUser.lastName}`);
                currentUser.email = updatedUser.email;
                currentUser.name = `${updatedUser.firstName} ${updatedUser.lastName}`;
                updateWelcomeMessage(); 
                loadDashboard(); 
            } catch (error) {
                console.error('Error updating profile:', error);
                if (error.message && !error.message.includes('Unauthorized')) {
                    alert(`Error updating profile: ${error.message}`);
                }
            }
        });

    } catch (error) {
        console.error('Error loading profile page:', error);
        if (error.message && !error.message.includes('Unauthorized')) {
            contentArea.innerHTML = `<div class="alert alert-danger">Error loading user profile: ${error.message}</div>`;
        }
    }
}


function showDeveloperContact() {
    alert(
        "Developer Contact Information:\n\n" +
        "Name: Raghavendra Gattu\n" +
        "Email: gatturaghava.edu123@gmail.com\n" +
        "LinkedIn: www.linkedin.com/in/raghavendra-gattu\n" +
        "GitHub: github.com/Raghavendra-54\n" +
        "Project: MyPersonal-income-expense-tracker"
    );
}

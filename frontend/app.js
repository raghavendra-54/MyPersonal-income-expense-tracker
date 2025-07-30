// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// DOM Elements
const contentArea = document.getElementById('content-area');
const navLinks = document.querySelectorAll('.nav-link');

let currentUser = {
    email: 'user@example.com',
    name: 'Raghavendra'
};

let expenseChartInstance = null;
let monthlyChartInstance = null;

console.log("app.js: Script loaded.");

document.addEventListener('DOMContentLoaded', () => {
    console.log("app.js: DOMContentLoaded event fired.");
    loadPage(window.location.hash.substring(1) || 'dashboard');
    setupNavigation();
});

function setupNavigation() {
    console.log("app.js: setupNavigation called.");
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('href').substring(1);
            console.log(`app.js: Navigating to page: ${page}`);
            loadPage(page);
            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function loadPage(page) {
    console.log(`app.js: loadPage called for: ${page}`);
    switch(page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'income':
            loadIncomeForm();
            break;
        case 'expense':
            loadExpenseForm();
            break;
        case 'transactions':
            loadTransactions();
            break;
        default:
            loadDashboard();
    }
}

async function loadDashboard() {
    console.log("app.js: loadDashboard called.");
    try {
        contentArea.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Dashboard</h2>
                <div class="text-muted">Welcome, ${currentUser.name}</div>
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
                                <!-- Will be populated by JS -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        await loadSummaryData();
        initExpenseChart();
        initMonthlyChart();
        loadRecentTransactions();

    } catch (error) {
        console.error('Error loading dashboard:', error);
        contentArea.innerHTML = `<div class="alert alert-danger">Error loading dashboard data</div>`;
    }
}

async function loadSummaryData() {
    console.log("app.js: loadSummaryData called.");
    try {
        const response = await fetch(`${API_BASE_URL}/transactions/summary`);
        if (!response.ok) throw new Error('Failed to fetch summary');
        const data = await response.json();

        document.getElementById('total-income').textContent = `₹${data.totalIncome.toLocaleString()}`;
        document.getElementById('total-expense').textContent = `₹${data.totalExpense.toLocaleString()}`;
        document.getElementById('balance').textContent = `₹${data.balance.toLocaleString()}`;
    } catch (error) {
        console.error('Failed to load summary data:', error);
        document.getElementById('total-income').textContent = `Error`;
        document.getElementById('total-expense').textContent = `Error`;
        document.getElementById('balance').textContent = `Error`;
    }
}

async function initExpenseChart() {
    console.log("app.js: initExpenseChart called.");
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`);
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

        const expenseChartData = {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColor,
                borderWidth: 1
            }]
        };

        const ctx = document.getElementById('expenseChart').getContext('2d');
        if (expenseChartInstance) {
            expenseChartInstance.destroy();
        }
        expenseChartInstance = new Chart(ctx, {
            type: 'pie',
            data: expenseChartData,
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
        const chartContainer = document.getElementById('expenseChart').closest('.chart-container');
        if (chartContainer) chartContainer.innerHTML = '<div class="alert alert-warning text-center">Failed to load expense chart data.</div>';
    }
}

async function initMonthlyChart() {
    console.log("app.js: initMonthlyChart called.");
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`);
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

        const monthlyChartData = {
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
        };

        const ctx = document.getElementById('monthlyChart').getContext('2d');
        if (monthlyChartInstance) {
            monthlyChartInstance.destroy();
        }
        monthlyChartInstance = new Chart(ctx, {
            type: 'bar',
            data: monthlyChartData,
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
        const chartContainer = document.getElementById('monthlyChart').closest('.chart-container');
        if (chartContainer) chartContainer.innerHTML = '<div class="alert alert-warning text-center">Failed to load monthly chart data.</div>';
    }
}


async function loadRecentTransactions() {
    console.log("app.js: loadRecentTransactions called.");
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`);
        if (!response.ok) throw new Error('Failed to fetch transactions');
        const transactions = await response.json();

        const tbody = document.getElementById('recent-transactions');
        if (!tbody) {
            console.warn('Recent transactions tbody not found. Skipping update.');
            return;
        }

        const recentDisplayTransactions = transactions.slice(0, 5);

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
    }
}

function loadIncomeForm() {
    console.log("app.js: loadIncomeForm called.");
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

            const response = await fetch(`${API_BASE_URL}/transactions`, {
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
            alert(`Error adding income: ${error.message}`);
        }
    });
}

function loadExpenseForm() {
    console.log("app.js: loadExpenseForm called.");
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

            const response = await fetch(`${API_BASE_URL}/transactions`, {
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
            alert(`Error adding expense: ${error.message}`);
        }
    });
}

// Transactions Page
async function loadTransactions() {
    console.log("app.js: loadTransactions called.");
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
                        <select class="form-select" id="filterCategory" required>
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
                            <!-- Transactions will be loaded here -->
                        </tbody>
                    </table>
                </div>

                <nav aria-label="Transaction pagination" class="mt-4">
                    <ul class="pagination justify-content-center">
                        <li class="page-item disabled">
                            <a class="page-link" href="#" tabindex="-1">Previous</a>
                        </li>
                        <li class="page-item active"><a class="page-link" href="#">1</a></li>
                        <li class="page-item"><a class="page-link" href="#">2</a></li>
                        <li class="page-item">
                            <a class="page-link" href="#">Next</a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    `;

    // Toggle filter card visibility
    document.getElementById('filterBtn').addEventListener('click', () => {
        const filterCard = document.getElementById('filterCard');
        filterCard.style.display = filterCard.style.display === 'none' ? 'block' : 'none';
    });

    // Add event listener for filter form submission
    document.getElementById('transactionFilterForm').addEventListener('submit', (e) => {
        e.preventDefault();
        filterTransactions();
    });
    document.getElementById('transactionFilterForm').addEventListener('reset', () => {
        loadAllTransactions(); // Reload all transactions on reset
    });

    // Add event listener for export button
    document.getElementById('exportBtn').addEventListener('click', () => {
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
        window.open(exportUrl, '_blank');
    });

    // Load initial transactions for the table
    loadAllTransactions();
}

async function loadAllTransactions() {
    console.log("app.js: loadAllTransactions called.");
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`);
        if (!response.ok) throw new Error('Failed to fetch all transactions');
        const transactions = await response.json();
        renderTransactionTable(transactions);
    } catch (error) {
        console.error('Error loading all transactions:', error);
        const tbody = document.getElementById('transactionsTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger">Error loading transactions for history</td>
                </tr>
            `;
        }
    }
}

function renderTransactionTable(transactions) {
    console.log("app.js: renderTransactionTable called.");
    const tbody = document.getElementById('transactionsTableBody');
    if (!tbody) return;

    if (transactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">No transactions found for the selected criteria.</td>
            </tr>
        `;
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
    console.log("app.js: filterTransactions called.");
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
        const response = await fetch(`${API_BASE_URL}/transactions?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch filtered transactions');
        const filteredTransactions = await response.json();
        renderTransactionTable(filteredTransactions);
    } catch (error) {
        console.error('Error filtering transactions:', error);
        const tbody = document.getElementById('transactionsTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger">Error filtering transactions</td>
                </tr>
            `;
        }
    }
}

async function editTransaction(id) {
    console.log(`app.js: editTransaction called for ID: ${id}`);
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`);
        if (!response.ok) throw new Error('Failed to fetch transactions for edit');
        const transactions = await response.json();
        const transactionToEdit = transactions.find(t => t.id === id);

        if (!transactionToEdit) {
            alert('Transaction not found for editing.');
            return;
        }

        const newTitle = prompt('Enter new title:', transactionToEdit.title);
        const newAmount = prompt('Enter new amount:', transactionToEdit.amount);
        const newCategory = prompt('Enter new category:', transactionToEdit.category);
        const newDate = prompt('Enter new date (YYYY-MM-DD):', transactionToEdit.date);

        if (newTitle === null || newAmount === null || newCategory === null || newDate === null) {
            return;
        }

        const updatedTransactionData = {
            title: newTitle,
            amount: parseFloat(newAmount),
            type: transactionToEdit.type,
            category: newCategory,
            date: newDate
        };

        const updateResponse = await fetch(`${API_BASE_URL}/transactions/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedTransactionData)
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.error || errorData.message || 'Failed to update transaction');
        }

        alert('Transaction updated successfully!');
        loadAllTransactions();
        loadDashboard();
    } catch (error) {
        console.error('Error updating transaction:', error);
        alert(`Error updating transaction: ${error.message}`);
    }
}

async function deleteTransaction(id) {
    console.log(`app.js: deleteTransaction called for ID: ${id}`);
    showCustomConfirm(`Are you sure you want to delete transaction ${id}? This action cannot be undone.`, async () => {
        console.log(`app.js: Custom confirm confirmed for ID: ${id}`); // ADD THIS
        try {
            const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
                method: 'DELETE'
            });
            console.log(`app.js: Delete fetch response status: ${response.status}`); // ADD THIS

            if (!response.ok) {
                // Attempt to parse JSON error only if response has content type application/json
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || `Failed to delete transaction with status ${response.status}`);
                } else {
                    // If not JSON, throw a generic error with status text
                    throw new Error(`Failed to delete transaction: ${response.status} ${response.statusText}`);
                }
            }

            alert('Transaction deleted successfully!');
            loadAllTransactions();
            loadDashboard();
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert(`Error deleting transaction: ${error.message}`);
        }
    });
}

function showCustomConfirm(message, onConfirm) {
    console.log("app.js: showCustomConfirm called.");
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
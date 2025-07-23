// Admin JavaScript
class RestaurantAdmin {
    constructor() {
        this.password = 'admin123'; // Simple password
        this.githubToken = null;
        this.currentUser = null;
        this.repository = null; // Will be set from current origin
        this.menuData = null;
        this.hasChanges = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.detectRepository();
        
        // Check if already logged in
        const savedLogin = localStorage.getItem('sphinx_admin_logged_in');
        if (savedLogin === 'true') {
            this.showAdminInterface();
            this.loadMenuData();
        }
    }

    detectRepository() {
        // Try to detect repository from current URL or set manually
        const currentDomain = window.location.hostname;
        if (currentDomain.includes('github.io')) {
            // Extract repo from GitHub Pages URL
            const pathParts = window.location.pathname.split('/');
            const repoName = pathParts[1];
            const username = currentDomain.split('.')[0];
            this.repository = `${username}/${repoName}`;
        } else {
            // For local development or custom domains, you'll need to set this manually
            this.repository = 'YOUR_USERNAME/YOUR_REPO_NAME'; // Will be updated by user
        }
    }

    setupEventListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Save changes button
        document.getElementById('save-changes-btn').addEventListener('click', () => {
            this.saveChanges();
        });

        // Category filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterCategory(e.target.dataset.category);
            });
        });
    }

    handleLogin() {
        const passwordInput = document.getElementById('password');
        const errorDiv = document.getElementById('login-error');
        
        if (passwordInput.value === this.password) {
            localStorage.setItem('sphinx_admin_logged_in', 'true');
            this.showAdminInterface();
            this.loadMenuData();
            errorDiv.style.display = 'none';
        } else {
            errorDiv.style.display = 'block';
            passwordInput.value = '';
        }
    }

    handleLogout() {
        localStorage.removeItem('sphinx_admin_logged_in');
        this.showLoginScreen();
    }

    showLoginScreen() {
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('admin-interface').style.display = 'none';
    }

    showAdminInterface() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-interface').style.display = 'block';
    }

    async loadMenuData() {
        try {
            const response = await fetch('menu.json');
            this.menuData = await response.json();
            
            this.populateOpeningHours();
            this.populateMenuTable();
            
        } catch (error) {
            console.error('Error loading menu data:', error);
            this.showMessage('Fout bij het laden van menu data', 'error');
        }
    }

    populateOpeningHours() {
        const openingHours = this.menuData.opening_hours || {};
        
        Object.keys(openingHours).forEach(day => {
            const input = document.getElementById(day);
            if (input) {
                input.value = openingHours[day];
                input.addEventListener('input', () => this.markAsChanged());
            }
        });
    }

    populateMenuTable() {
        const tbody = document.querySelector('#menu-table tbody');
        tbody.innerHTML = '';

        this.menuData.categories.forEach(category => {
            category.items.forEach(item => {
                const row = document.createElement('tr');
                row.dataset.category = category.id;
                
                row.innerHTML = `
                    <td><span class="category-badge">${category.name}</span></td>
                    <td>${item.name}</td>
                    <td>€${item.price}</td>
                    <td>
                        <input type="text" 
                               class="price-input" 
                               value="${item.price}" 
                               data-item-id="${item.id}"
                               data-category-id="${category.id}"
                               placeholder="0,00">
                    </td>
                `;
                
                tbody.appendChild(row);
            });
        });

        // Add event listeners to price inputs
        document.querySelectorAll('.price-input').forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.classList.add('changed');
                this.markAsChanged();
            });
        });
    }

    filterCategory(category) {
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        // Filter table rows
        const rows = document.querySelectorAll('#menu-table tbody tr');
        rows.forEach(row => {
            if (category === 'all' || row.dataset.category === category) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    markAsChanged() {
        this.hasChanges = true;
        const saveBtn = document.getElementById('save-changes-btn');
        if (!saveBtn.textContent.includes('*')) {
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Wijzigingen Opslaan *';
        }
    }

    async saveChanges() {
        if (!this.hasChanges) {
            this.showMessage('Geen wijzigingen om op te slaan');
            return;
        }

        // Collect opening hours changes
        const openingHours = {};
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
            const input = document.getElementById(day);
            if (input && input.value) {
                openingHours[day] = input.value;
            }
        });

        // Collect price changes
        const priceInputs = document.querySelectorAll('.price-input');
        priceInputs.forEach(input => {
            if (input.classList.contains('changed')) {
                const categoryId = input.dataset.categoryId;
                const itemId = input.dataset.itemId;
                const newPrice = input.value;

                // Update the menu data
                const category = this.menuData.categories.find(cat => cat.id === categoryId);
                if (category) {
                    const item = category.items.find(item => item.id === itemId);
                    if (item) {
                        item.price = newPrice;
                    }
                }
            }
        });

        // Update opening hours in menu data
        this.menuData.opening_hours = openingHours;

        // Save to GitHub (for now, just simulate)
        await this.saveToGitHub();
    }

    async saveToGitHub() {
        this.showLoading('Wijzigingen opslaan naar GitHub...');

        try {
            // For demo purposes, we'll save to localStorage and show success
            // In production, this would use GitHub API
            
            localStorage.setItem('sphinx_menu_data', JSON.stringify(this.menuData));
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.hideLoading();
            this.showMessage('Wijzigingen succesvol opgeslagen!');
            
            // Reset change tracking
            this.hasChanges = false;
            document.querySelectorAll('.price-input.changed').forEach(input => {
                input.classList.remove('changed');
            });
            
            const saveBtn = document.getElementById('save-changes-btn');
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Wijzigingen Opslaan';
            
            // In a real implementation, you would use the GitHub API like this:
            /*
            const updatedContent = JSON.stringify(this.menuData, null, 2);
            const response = await this.updateGitHubFile('menu.json', updatedContent);
            */
            
        } catch (error) {
            this.hideLoading();
            this.showMessage('Fout bij opslaan: ' + error.message, 'error');
            console.error('Save error:', error);
        }
    }

    // GitHub API methods (for future implementation)
    async updateGitHubFile(filename, content) {
        const token = this.getGitHubToken();
        if (!token) {
            throw new Error('GitHub token niet geconfigureerd');
        }

        // Get current file SHA
        const getCurrentFile = await fetch(`https://api.github.com/repos/${this.repository}/contents/${filename}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        const currentFile = await getCurrentFile.json();
        
        // Update file
        const response = await fetch(`https://api.github.com/repos/${this.repository}/contents/${filename}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update menu prices and opening hours via admin panel',
                content: btoa(content), // Base64 encode
                sha: currentFile.sha
            })
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        return response.json();
    }

    getGitHubToken() {
        // In production, this would be set by the user during setup
        return localStorage.getItem('github_token') || null;
    }

    showLoading(text = 'Laden...') {
        document.getElementById('loading-text').textContent = text;
        document.getElementById('loading-overlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }

    showMessage(text, type = 'success') {
        const container = document.getElementById('message-container');
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        container.appendChild(message);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            message.remove();
        }, 5000);
    }
}

// Initialize admin when page loads
document.addEventListener('DOMContentLoaded', () => {
    new RestaurantAdmin();
});

// Warn user about unsaved changes
window.addEventListener('beforeunload', (e) => {
    const admin = window.restaurantAdmin;
    if (admin && admin.hasChanges) {
        e.preventDefault();
        e.returnValue = '';
    }
}); 
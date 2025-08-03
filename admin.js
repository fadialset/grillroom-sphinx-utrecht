// Admin JavaScript
class RestaurantAdmin {
    constructor() {
        this.password = window.ADMIN_CONFIG?.password;
        this.githubToken = window.ADMIN_CONFIG?.githubToken || null;
        this.repository = window.ADMIN_CONFIG?.repository || 'fadialset/grillroom-sphinx-utrecht';
        this.currentUser = null;
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
        const currentDomain = window.location.hostname;
        if (currentDomain.includes('github.io')) {
            const pathParts = window.location.pathname.split('/');
            const repoName = pathParts[1];
            const username = currentDomain.split('.')[0];
            this.repository = `${username}/${repoName}`;
        } else {
            // When running locally, keep the repository from config.js or use default
            // Don't override this.repository since it's already set in constructor
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

        // Add item form
        document.getElementById('add-item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddItem();
        });

        // Clear form button
        document.getElementById('clear-form-btn').addEventListener('click', () => {
            this.clearAddItemForm();
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
        
        // Check if password is configured
        if (!this.password) {
            errorDiv.textContent = 'Admin password niet geconfigureerd. Contacteer de beheerder.';
            errorDiv.style.display = 'block';
            return;
        }
        
        if (passwordInput.value === this.password) {
            localStorage.setItem('sphinx_admin_logged_in', 'true');
            this.showAdminInterface();
            this.loadMenuData();
            errorDiv.style.display = 'none';
        } else {
            errorDiv.textContent = 'Incorrect wachtwoord. Probeer opnieuw.';
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
                    <td>
                        <button class="delete-btn" 
                                data-item-id="${item.id}"
                                data-category-id="${category.id}"
                                data-item-name="${item.name}"
                                title="Verwijder item">
                            <i class="fas fa-trash"></i>
                        </button>
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

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const categoryId = e.target.closest('button').dataset.categoryId;
                const itemId = e.target.closest('button').dataset.itemId;
                const itemName = e.target.closest('button').dataset.itemName;
                this.handleDeleteItem(categoryId, itemId, itemName);
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
            if (!this.githubToken) {
                throw new Error('GitHub token niet geconfigureerd. Check je config.js bestand.');
            }

            // Update localStorage for immediate preview
            localStorage.setItem('sphinx_menu_data', JSON.stringify(this.menuData));
            
            // Save to GitHub using API
            const updatedContent = JSON.stringify(this.menuData, null, 2);
            await this.updateGitHubFile('menu.json', updatedContent);
            
            this.hideLoading();
            this.showMessage('Wijzigingen succesvol opgeslagen naar GitHub!', 'success');
            
            // Reset change tracking
            this.hasChanges = false;
            document.querySelectorAll('.price-input.changed').forEach(input => {
                input.classList.remove('changed');
            });
            
            const saveBtn = document.getElementById('save-changes-btn');
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Wijzigingen Opslaan';
            
        } catch (error) {
            this.hideLoading();
            this.showMessage('Fout bij opslaan: ' + error.message, 'error');
            console.error('Save error:', error);
        }
    }

    // GitHub API methods
    async updateGitHubFile(filename, content) {
        if (!this.githubToken) {
            throw new Error('GitHub token niet geconfigureerd');
        }

        try {
            const apiUrl = `https://api.github.com/repos/${this.repository}/contents/${filename}`;
            
            // Get current file SHA
            const getCurrentResponse = await fetch(apiUrl, {
                headers: {
                    'Authorization': `token ${this.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!getCurrentResponse.ok) {
                const errorText = await getCurrentResponse.text();
                throw new Error(`Kan ${filename} niet ophalen: ${getCurrentResponse.statusText}`);
            }

            const currentFile = await getCurrentResponse.json();
            
            // Update file
            const updateResponse = await fetch(`https://api.github.com/repos/${this.repository}/contents/${filename}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Update menu via admin panel',
                    content: btoa(unescape(encodeURIComponent(content))), // Proper UTF-8 encoding
                    sha: currentFile.sha,
                    branch: 'production'
                })
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json();
                throw new Error(`GitHub API error: ${errorData.message || updateResponse.statusText}`);
            }

            return await updateResponse.json();
            
        } catch (error) {
            console.error('GitHub API Error:', error);
            throw error;
        }
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

    handleAddItem() {
        const category = document.getElementById('new-item-category').value;
        const name = document.getElementById('new-item-name').value.trim();
        const price = document.getElementById('new-item-price').value.trim();
        const description = document.getElementById('new-item-description').value.trim();

        // Validation
        if (!category || !name || !price) {
            this.showMessage('Vul alle verplichte velden in', 'error');
            return;
        }

        // Validate price format
        if (!/^\d+,\d{2}$/.test(price)) {
            this.showMessage('Prijs moet in formaat 0,00 zijn (bijv. 10,50)', 'error');
            return;
        }

        // Generate unique ID
        const id = name.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);

        // Check if ID already exists
        const categoryData = this.menuData.categories.find(cat => cat.id === category);
        if (categoryData && categoryData.items.find(item => item.id === id)) {
            this.showMessage('Een item met deze naam bestaat al in deze categorie', 'error');
            return;
        }

        // Create new item
        const newItem = {
            id: id,
            name: name,
            price: price,
            description: description,
            image: `images/${id}.jpg`
        };

        // Add to menu data
        if (categoryData) {
            categoryData.items.push(newItem);
        }

        // Update display
        this.populateMenuTable();
        this.clearAddItemForm();
        this.markAsChanged();
        this.showMessage(`Item "${name}" succesvol toegevoegd!`);
    }

    handleDeleteItem(categoryId, itemId, itemName) {
        if (!confirm(`Weet je zeker dat je "${itemName}" wilt verwijderen?`)) {
            return;
        }

        // Find and remove item
        const category = this.menuData.categories.find(cat => cat.id === categoryId);
        if (category) {
            const itemIndex = category.items.findIndex(item => item.id === itemId);
            if (itemIndex > -1) {
                category.items.splice(itemIndex, 1);
                this.populateMenuTable();
                this.markAsChanged();
                this.showMessage(`Item "${itemName}" succesvol verwijderd!`);
            }
        }
    }

    clearAddItemForm() {
        document.getElementById('new-item-category').value = '';
        document.getElementById('new-item-name').value = '';
        document.getElementById('new-item-price').value = '';
        document.getElementById('new-item-description').value = '';
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
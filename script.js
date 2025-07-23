// Menu Application
class MenuApp {
    constructor() {
        this.menuData = null;
        this.currentCategory = 'all';
        this.menuContainer = document.getElementById('menu-container');
        this.loadingElement = document.getElementById('loading');
        this.categoryButtons = document.querySelectorAll('.category-btn');
        
        this.init();
    }

    async init() {
        try {
            await this.loadMenuData();
            this.setupEventListeners();
            this.renderMenu();
            this.renderOpeningHours();
            this.hideLoading();
        } catch (error) {
            console.error('Error initializing menu:', error);
            this.showError('Er is een fout opgetreden bij het laden van het menu.');
        }
    }

    async loadMenuData() {
        try {
            const response = await fetch('menu.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.menuData = await response.json();
        } catch (error) {
            console.error('Error loading menu data:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Category button listeners
        this.categoryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.getAttribute('data-category');
                this.setActiveCategory(category);
                this.renderMenu();
            });
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                if (targetId.startsWith('#')) {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
    }

    setActiveCategory(category) {
        this.currentCategory = category;
        
        // Update active button
        this.categoryButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-category') === category) {
                btn.classList.add('active');
            }
        });
    }

    renderMenu() {
        if (!this.menuData) return;

        this.menuContainer.innerHTML = '';

        const categoriesToShow = this.currentCategory === 'all' 
            ? this.menuData.categories 
            : this.menuData.categories.filter(cat => cat.id === this.currentCategory);

        categoriesToShow.forEach(category => {
            const categorySection = this.createCategorySection(category);
            this.menuContainer.appendChild(categorySection);
        });

        // Add animation delay for staggered effect
        const sections = this.menuContainer.querySelectorAll('.category-section');
        sections.forEach((section, index) => {
            section.style.animationDelay = `${index * 0.1}s`;
        });
    }

    createCategorySection(category) {
        const section = document.createElement('div');
        section.className = 'category-section';
        section.setAttribute('data-category', category.id);

        const title = document.createElement('h2');
        title.className = 'category-title';
        title.textContent = category.name;

        section.appendChild(title);

        // Add category description if exists
        if (category.description) {
            const description = document.createElement('p');
            description.className = 'category-description';
            description.textContent = category.description;
            section.appendChild(description);
        }

        const itemsGrid = document.createElement('div');
        itemsGrid.className = 'items-grid';

        category.items.forEach(item => {
            const itemElement = this.createMenuItem(item);
            itemsGrid.appendChild(itemElement);
        });

        section.appendChild(itemsGrid);
        return section;
    }

    createMenuItem(item) {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        
        if (item.vegetarian) {
            menuItem.classList.add('vegetarian');
        }

        // Create image placeholder
        const image = document.createElement('div');
        image.className = 'item-image';
        image.textContent = 'Afbeelding niet beschikbaar';
        
        // If you want to add actual images later, uncomment this:
        // const image = document.createElement('img');
        // image.className = 'item-image';
        // image.src = item.image;
        // image.alt = item.name;
        // image.onerror = function() {
        //     this.style.display = 'none';
        // };

        const itemHeader = document.createElement('div');
        itemHeader.className = 'item-header';

        const itemName = document.createElement('h3');
        itemName.className = 'item-name';
        itemName.textContent = item.name;

        const itemPrice = document.createElement('span');
        itemPrice.className = 'item-price';
        itemPrice.textContent = `€ ${item.price}`;

        itemHeader.appendChild(itemName);
        itemHeader.appendChild(itemPrice);

        menuItem.appendChild(image);
        menuItem.appendChild(itemHeader);

        // Add description if exists
        if (item.description) {
            const description = document.createElement('p');
            description.className = 'item-description';
            description.textContent = item.description;
            menuItem.appendChild(description);
        }

        return menuItem;
    }

    renderOpeningHours() {
        if (!this.menuData || !this.menuData.opening_hours) return;

        const openingHoursContainer = document.getElementById('opening-hours');
        if (!openingHoursContainer) return;

        const hours = this.menuData.opening_hours;
        const dayTranslations = {
            monday: 'Ma',
            tuesday: 'Di', 
            wednesday: 'Wo',
            thursday: 'Do',
            friday: 'Vr',
            saturday: 'Za',
            sunday: 'Zo'
        };

        // Group consecutive days with same hours
        const groupedHours = this.groupOpeningHours(hours, dayTranslations);
        
        openingHoursContainer.innerHTML = `
            ${groupedHours.map(group => `<p>${group}</p>`).join('')}
            <p><i class="fas fa-phone"></i> Bel voor bezorging</p>
        `;
    }

    groupOpeningHours(hours, dayTranslations) {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const groups = [];
        let currentGroup = [];
        let currentHours = null;

        days.forEach(day => {
            const dayHours = hours[day];
            
            if (dayHours === currentHours) {
                currentGroup.push(dayTranslations[day]);
            } else {
                if (currentGroup.length > 0) {
                    const dayRange = currentGroup.length > 1 
                        ? `${currentGroup[0]}-${currentGroup[currentGroup.length - 1]}`
                        : currentGroup[0];
                    groups.push(`${dayRange}: ${currentHours || 'Gesloten'}`);
                }
                
                currentGroup = [dayTranslations[day]];
                currentHours = dayHours;
            }
        });

        // Add the last group
        if (currentGroup.length > 0) {
            const dayRange = currentGroup.length > 1 
                ? `${currentGroup[0]}-${currentGroup[currentGroup.length - 1]}`
                : currentGroup[0];
            groups.push(`${dayRange}: ${currentHours || 'Gesloten'}`);
        }

        return groups;
    }

    hideLoading() {
        this.loadingElement.classList.add('hidden');
    }

    showError(message) {
        this.hideLoading();
        this.menuContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #d32f2f;">
                <h2>Oops!</h2>
                <p>${message}</p>
                <button onclick="location.reload()" style="
                    background: #8B4513; 
                    color: white; 
                    border: none; 
                    padding: 0.75rem 1.5rem; 
                    border-radius: 25px; 
                    cursor: pointer; 
                    margin-top: 1rem;
                    font-weight: 600;
                ">Probeer opnieuw</button>
            </div>
        `;
    }
}

// Utility functions for search and filtering
class MenuUtils {
    static searchItems(menuData, searchTerm) {
        if (!searchTerm) return menuData;
        
        const filteredCategories = menuData.categories.map(category => ({
            ...category,
            items: category.items.filter(item => 
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
        })).filter(category => category.items.length > 0);

        return { ...menuData, categories: filteredCategories };
    }

    static filterByPrice(menuData, minPrice, maxPrice) {
        const filteredCategories = menuData.categories.map(category => ({
            ...category,
            items: category.items.filter(item => {
                const price = parseFloat(item.price.replace(',', '.'));
                return price >= minPrice && price <= maxPrice;
            })
        })).filter(category => category.items.length > 0);

        return { ...menuData, categories: filteredCategories };
    }

    static filterVegetarian(menuData) {
        const filteredCategories = menuData.categories.map(category => ({
            ...category,
            items: category.items.filter(item => item.vegetarian)
        })).filter(category => category.items.length > 0);

        return { ...menuData, categories: filteredCategories };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MenuApp();
});

// Add keyboard navigation for accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close any open modals or reset search
        document.querySelectorAll('.category-btn').forEach(btn => {
            if (btn.getAttribute('data-category') === 'all') {
                btn.click();
            }
        });
    }
});

// Add smooth scroll behavior for better UX
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.boxShadow = '0 4px 20px rgba(139, 69, 19, 0.4)';
    } else {
        header.style.boxShadow = '0 4px 15px rgba(139, 69, 19, 0.3)';
    }
});

// Performance optimization: Lazy loading for images (when implemented)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '50px'
};

const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        }
    });
}, observerOptions);

// Error handling for uncaught errors
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
}); 
// Custom JS for Subhalaxmi Teleservice

// Shared state
let cart = [];
let products = [];

// Theme management
function setInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (savedTheme === 'dark') {
                icon.classList.remove('bi-moon');
                icon.classList.add('bi-sun');
            } else {
                icon.classList.remove('bi-sun');
                icon.classList.add('bi-moon');
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    setInitialTheme();
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const isDark = document.body.getAttribute('data-theme') === 'dark';
            const newTheme = isDark ? 'light' : 'dark';
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            // Toggle icon
            const icon = themeToggle.querySelector('i');
            if (newTheme === 'dark') {
                icon.classList.remove('bi-moon');
                icon.classList.add('bi-sun');
            } else {
                icon.classList.remove('bi-sun');
                icon.classList.add('bi-moon');
            }
        });
    }

    // Scroll-to-Top and WhatsApp Chat Logic
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 200) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });

    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Initialize animated numbers if they exist
    const animatedNumbers = document.querySelectorAll('.animated-number');
    if (animatedNumbers.length > 0) {
        animatedNumbers.forEach(number => {
            const target = +number.getAttribute('data-target');
            let count = 0;
            const increment = target / 100;

            const updateNumber = () => {
                count += increment;
                if (count >= target) {
                    number.textContent = target;
                } else {
                    number.textContent = Math.round(count);
                    requestAnimationFrame(updateNumber);
                }
            };

            updateNumber();
        });
    }

    // Determine which page we're on and initialize accordingly
    if (document.getElementById('product-list')) {
        initializeProductPage();
    }
    if (document.getElementById('featured-phones')) {
        displayFeaturedPhones();
    }
});

// Initialize Product Page
function initializeProductPage() {
    // Get DOM elements for product page
    const productList = document.getElementById('product-list');
    const totalResults = document.getElementById('total-results');
    const cartIcon = document.getElementById('cart-icon');
    const cartCount = document.getElementById('cart-count');
    const cartDetails = document.getElementById('cart-details');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const filterBrand = document.getElementById('filter-brand');
    const filterPrice = document.getElementById('filter-price');
    const filterStock = document.getElementById('filter-stock');
    const priceRangeDisplay = document.getElementById('price-range-display');
    const resetFilters = document.getElementById('reset-filters');
    const searchForm = document.getElementById('search-form');

    // Ensure DOM elements are available before using them
    if (!productList || !totalResults || !cartIcon || !cartCount || !cartDetails || 
        !cartTotalPrice || !filterBrand || !filterPrice || !filterStock || 
        !priceRangeDisplay || !resetFilters || !searchForm) {
        console.warn('One or more required DOM elements are missing. Please check the HTML structure.');
        return;
    }

    // Initialize filter values
    filterPrice.value = 200000;
    priceRangeDisplay.textContent = `Up to ₹${filterPrice.value}`;

    // Fetch products from the web app
    fetch('https://script.google.com/macros/s/AKfycbwiBI6rnl9vRjboPD5TX-t2FMxeLKsA1HwC0G2uaKR0UFUujeQ-h_7B9rpfePFmH1PWvg/exec')
        .then(response => response.json())
        .then(data => {
            if (data && data.data) {
                products = data.data.map(product => ({
                    Company: product.Company,
                    BrandLogo: product["Barnd Logo Image"],
                    Model: product.Model,
                    ImageLinks: product.imagelink ? JSON.parse(product.imagelink.replace(/'/g, '"')) : [],
                    Original: product.Original,
                    Offer: product.Offer,
                    Price: product.Price,
                    ViewDetails: product["View Details"],
                    Stock: product.Stock
                }));

                // Populate brand filter options dynamically
                const uniqueBrands = [...new Set(products.map(product => product.Company))].sort();
                const brandSelect = document.getElementById('filter-brand');
                if (brandSelect) {
                    uniqueBrands.forEach(brand => {
                        const option = document.createElement('option');
                        option.value = brand;
                        option.textContent = brand;
                        brandSelect.appendChild(option);
                    });
                }

                displayProducts(products);
            }
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            productList.innerHTML = '<div class="col-12"><p class="text-danger">Failed to load products. Please try again later.</p></div>';
        });

    // Setup event listeners
    filterBrand.addEventListener('change', applyFilters);
    filterPrice.addEventListener('input', function() {
        priceRangeDisplay.textContent = `Up to ₹${this.value}`;
        applyFilters();
    });
    filterStock.addEventListener('change', applyFilters);
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        applyFilters();
    });
    resetFilters.addEventListener('click', function() {
        filterBrand.value = '';
        filterPrice.value = 200000;
        filterStock.value = '';
        document.getElementById('search-bar').value = '';
        priceRangeDisplay.textContent = `Up to ₹${filterPrice.value}`;
        applyFilters();
    });

    // Filter and display functions
    function applyFilters() {
        const brand = filterBrand.value;
        const price = parseInt(filterPrice.value) || 0;
        const stock = filterStock.value;
        const searchQuery = document.getElementById('search-bar').value.toLowerCase();

        const filteredProducts = products.filter(product => {
            const brandMatch = brand === '' || product.Company === brand;
            const priceMatch = product.Price <= price;
            const stockMatch = stock === '' || product.Stock === stock;
            const searchMatch = searchQuery === '' || 
                              product.Model.toLowerCase().includes(searchQuery) ||
                              product.Company.toLowerCase().includes(searchQuery);

            return brandMatch && priceMatch && stockMatch && searchMatch;
        });

        displayProducts(filteredProducts);
    }

    // Display products in grid layout
    function displayProducts(productsToShow) {
        if (!productList) return;

        productList.innerHTML = '';
        totalResults.textContent = `Total Products: ${productsToShow.length}`;

        if (productsToShow.length === 0) {
            productList.innerHTML = '<div class="col-12"><p class="text-center">No products found matching your criteria.</p></div>';
            return;
        }

        const row = document.createElement('div');
        row.className = 'row g-4';

        productsToShow.forEach(product => {
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-4';
            
            col.innerHTML = `
                <div class="card h-100 product-card">
                    <img src="${product.ImageLinks[0] || 'assets/images/placeholder.jpg'}" class="card-img-top" alt="${product.Model}">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-2">
                            <img src="${product.BrandLogo}" alt="${product.Company} logo" class="brand-logo me-2" style="height: 20px;">
                            <h5 class="card-title mb-0">${product.Model}</h5>
                        </div>
                        <p class="card-text">
                            ${product.Original > product.Price ? 
                                `<span class="text-decoration-line-through text-muted">₹${product.Original}</span> ` : ''}
                            <span class="text-success">₹${product.Price}</span>
                        </p>
                        <p class="stock-status ${product.Stock === 'A' ? 'text-success' : 'text-danger'}">
                            <i class="bi ${product.Stock === 'A' ? 'bi-check-circle' : 'bi-x-circle'}"></i>
                            ${product.Stock === 'A' ? 'In Stock' : 'Out of Stock'}
                        </p>
                        <div class="d-flex justify-content-between mt-auto">
                            <button class="btn btn-primary btn-sm" onclick="addToCart('${product.Model}')">
                                <i class="bi bi-cart-plus"></i> Add to Cart
                            </button>
                            <a href="${product.ViewDetails}" class="btn btn-outline-secondary btn-sm" target="_blank">
                                <i class="bi bi-eye"></i> View Details
                            </a>
                        </div>
                    </div>
                </div>
            `;
            
            row.appendChild(col);
        });

        productList.appendChild(row);
    }
}

// Featured Phones Display Function
function displayFeaturedPhones() {
    const featuredPhonesContainer = document.getElementById('featured-phones');
    const carouselIndicators = document.querySelector('#featuredCarousel .carousel-indicators');
    if (!featuredPhonesContainer || !carouselIndicators) return;

    // Initialize carousel control state
    let isPlaying = true;
    const carouselControl = document.getElementById('carouselControl');
    let carousel;

    // Fetch products if not already loaded
    if (products.length === 0) {
        fetch('https://script.google.com/macros/s/AKfycbwiBI6rnl9vRjboPD5TX-t2FMxeLKsA1HwC0G2uaKR0UFUujeQ-h_7B9rpfePFmH1PWvg/exec')
            .then(response => response.json())
            .then(data => {
                if (data && data.data) {
                    products = data.data.map(product => ({
                        Company: product.Company,
                        BrandLogo: product["Barnd Logo Image"],
                        Model: product.Model,
                        ImageLinks: product.imagelink ? JSON.parse(product.imagelink.replace(/'/g, '"')) : [],
                        Original: product.Original,
                        Offer: product.Offer,
                        Price: product.Price,
                        ViewDetails: product["View Details"],
                        Stock: product.Stock
                    }));
                    displayFeaturedProducts();
                    initializeCarouselControls();
                }
            })
            .catch(error => {
                console.error('Error fetching featured products:', error);
                featuredPhonesContainer.innerHTML = '<p class="text-danger">Failed to load featured products.</p>';
            });
    } else {
        displayFeaturedProducts();
        initializeCarouselControls();
    }

    function initializeCarouselControls() {
        // Initialize Bootstrap carousel
        carousel = new bootstrap.Carousel(document.getElementById('featuredCarousel'), {
            interval: 3000,
            touch: true,
            pause: 'hover'
        });

        // Setup Pause/Play button
        if (carouselControl) {
            carouselControl.addEventListener('click', function() {
                const icon = this.querySelector('i');
                if (isPlaying) {
                    carousel.pause();
                    icon.classList.replace('bi-pause-fill', 'bi-play-fill');
                    this.querySelector('i + span').textContent = ' Play';
                    isPlaying = false;
                } else {
                    carousel.cycle();
                    icon.classList.replace('bi-play-fill', 'bi-pause-fill');
                    this.querySelector('i + span').textContent = ' Pause';
                    isPlaying = true;
                }
            });
        }

        // Add touch swipe support
        const carouselElement = document.getElementById('featuredCarousel');
        let touchStartX = 0;
        let touchEndX = 0;

        carouselElement.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);

        carouselElement.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);

        function handleSwipe() {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                carousel.next();
            }
            if (touchEndX > touchStartX + swipeThreshold) {
                carousel.prev();
            }
        }
    }

    function displayFeaturedProducts() {
        // Group products by company and get top 2 from each
        const groupedProducts = {};
        products.forEach(product => {
            if (!groupedProducts[product.Company]) {
                groupedProducts[product.Company] = [];
            }
            groupedProducts[product.Company].push(product);
        });

        const featuredPhones = Object.values(groupedProducts)
            .map(companyProducts => 
                companyProducts
                    .sort((a, b) => b.Price - a.Price)
                    .slice(0, 2)
            )
            .flat();

        // Clear existing content
        featuredPhonesContainer.innerHTML = '';
        carouselIndicators.innerHTML = '';

        // Create slides with exactly 3 phones each
        const numSlides = Math.ceil(featuredPhones.length / 3);

        for (let i = 0; i < numSlides; i++) {
            // Create indicator button
            const indicator = document.createElement('button');
            indicator.type = 'button';
            indicator.setAttribute('data-bs-target', '#featuredCarousel');
            indicator.setAttribute('data-bs-slide-to', i.toString());
            if (i === 0) indicator.classList.add('active');
            indicator.setAttribute('aria-label', `Slide ${i + 1}`);
            carouselIndicators.appendChild(indicator);

            // Create slide
            const slide = document.createElement('div');
            slide.className = `carousel-item${i === 0 ? ' active' : ''}`;

            // Create row for the 3 phones
            const row = document.createElement('div');
            row.className = 'row g-4 justify-content-center';

            // Get the 3 phones for this slide
            const slidePhones = featuredPhones.slice(i * 3, (i * 3) + 3);

            // Create columns for each phone
            slidePhones.forEach(phone => {
                const col = document.createElement('div');
                col.className = 'col-md-4';
                col.innerHTML = `
                    <div class="card h-100 featured-card">
                        <img src="${phone.ImageLinks[0] || 'assets/images/placeholder.jpg'}" 
                             class="card-img-top" alt="${phone.Model}">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-2">
                                <img src="${phone.BrandLogo}" alt="${phone.Company} logo" 
                                     class="brand-logo me-2" style="height: 20px;">
                                <h5 class="card-title mb-0">${phone.Model}</h5>
                            </div>
                            <p class="card-text">
                                ${phone.Original > phone.Price ? 
                                    `<span class="text-decoration-line-through text-muted">
                                        ₹${phone.Original.toLocaleString()}
                                     </span> ` : ''}
                                <span class="text-success">₹${phone.Price.toLocaleString()}</span>
                            </p>
                            <p class="stock-status ${phone.Stock === 'A' ? 'text-success' : 'text-danger'}">
                                <i class="bi ${phone.Stock === 'A' ? 'bi-check-circle' : 'bi-x-circle'}"></i>
                                ${phone.Stock === 'A' ? 'In Stock' : 'Out of Stock'}
                            </p>
                            <div class="d-flex justify-content-between mt-auto">
                                <button class="btn btn-primary btn-sm" onclick="addToCart('${phone.Model}')">
                                    <i class="bi bi-cart-plus"></i> Add to Cart
                                </button>
                                <a href="${phone.ViewDetails}" class="btn btn-outline-secondary btn-sm" target="_blank">
                                    <i class="bi bi-eye"></i> View Details
                                </a>
                            </div>
                        </div>
                    </div>
                `;
                row.appendChild(col);
            });

            slide.appendChild(row);
            featuredPhonesContainer.appendChild(slide);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const restrictedPages = ['cart.html', 'checkout.html', 'wishlist.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (restrictedPages.includes(currentPage)) {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to access this page.');
            window.location.href = 'login.html';
        }
    }
    // Function to update navbar auth links based on login state
    function updateNavbarAuthLinks() {
        const navLinks = document.getElementById('navLinks');
        if (!navLinks) return;

        // Clear existing auth links
        const existingAuthLinks = navLinks.querySelectorAll('.auth-link');
        existingAuthLinks.forEach(link => link.remove());

        const token = localStorage.getItem('token');
        if (token) {
            const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';
            const isProfilePage = window.location.pathname.endsWith('profile.html');
            if (isProfilePage) {
                // On profile.html, show only Home and Logout
                const homeLi = document.createElement('li');
                homeLi.classList.add('nav-item', 'auth-link');
                homeLi.innerHTML = `<a class="nav-link" href="index.html">Home</a>`;
                navLinks.appendChild(homeLi);

                const logoutLi = document.createElement('li');
                logoutLi.classList.add('nav-item', 'auth-link');
                const logoutLink = document.createElement('a');
                logoutLink.classList.add('nav-link');
                logoutLink.href = '#';
                logoutLink.textContent = 'Logout';
                logoutLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    logout();
                });
                logoutLi.appendChild(logoutLink);
                navLinks.appendChild(logoutLi);
            } else {
                const profileLi = document.createElement('li');
                profileLi.classList.add('nav-item', 'auth-link');
                profileLi.innerHTML = `<a class="nav-link" href="profile.html">Profile</a>`;

                navLinks.appendChild(profileLi);

                if (!isIndexPage) {
                    // Add wishlist and logout links on non-index pages
                    const wishlistLi = document.createElement('li');
                    wishlistLi.classList.add('nav-item', 'auth-link');
                    wishlistLi.innerHTML = `<a class="nav-link" href="wishlist.html">Wishlist</a>`;

                    const logoutLi = document.createElement('li');
                    logoutLi.classList.add('nav-item', 'auth-link');
                    const logoutLink = document.createElement('a');
                    logoutLink.classList.add('nav-link');
                    logoutLink.href = '#';
                    logoutLink.textContent = 'Logout';
                    logoutLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        logout();
                    });
                    logoutLi.appendChild(logoutLink);

                    navLinks.appendChild(wishlistLi);
                    navLinks.appendChild(logoutLi);
                }
            }
        } else {
            // User not logged in - show login and register links
            const loginLi = document.createElement('li');
            loginLi.classList.add('nav-item', 'auth-link');
            loginLi.innerHTML = `<a class="nav-link" href="login.html">Login</a>`;

            const registerLi = document.createElement('li');
            registerLi.classList.add('nav-item', 'auth-link');
            registerLi.innerHTML = `<a class="nav-link" href="register.html">Register</a>`;

            navLinks.appendChild(loginLi);
            navLinks.appendChild(registerLi);
        }
    }

    // Logout function
    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        updateNavbarAuthLinks();
        // Optionally redirect to home page after logout
        window.location.href = 'index.html';
    }

    // Function to fetch products from backend and render product cards dynamically
    async function loadProducts() {
        const productsContainer = document.getElementById('productsContainer');
        if (!productsContainer) return;

        try {
            const response = await fetch('/api/products');
            if (!response.ok) {
                productsContainer.innerHTML = '<p class="text-danger">Failed to load products.</p>';
                return;
            }
            const products = await response.json();

            if (!Array.isArray(products) || products.length === 0) {
                productsContainer.innerHTML = '<p>No products found.</p>';
                return;
            }

            // Clear existing content
            productsContainer.innerHTML = '';

            // Create product cards
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'col-md-4 product-card';
                productCard.setAttribute('data-category', product.category || 'unknown');
                productCard.setAttribute('data-price', product.price || '0');

                productCard.innerHTML = `
                    <div class="card h-100">
                        <img src="${product.image || 'placeholder.jpg'}" class="card-img-top" alt="${product.name}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text">${product.description || ''}</p>
                            <p class="price mt-auto">$${product.price.toFixed(2)}</p>
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <button class="btn btn-primary add-to-cart">Add to Cart</button>
                                <button class="btn btn-outline-secondary add-to-wishlist"><i class="fas fa-heart"></i></button>
                            </div>
                        </div>
                    </div>
                `;

                productsContainer.appendChild(productCard);
            });

            // Setup Add to Cart and Wishlist buttons for dynamically created products
            setupAddToCartButtons();
            setupWishlistButtons();

        } catch (error) {
            productsContainer.innerHTML = '<p class="text-danger">Error loading products.</p>';
        }
    }

    // Setup Wishlist buttons for dynamically created products
    function setupWishlistButtons() {
        const wishlistButtons = document.querySelectorAll('.add-to-wishlist');

        wishlistButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const productCard = button.closest('.product-card');
                if (!productCard) return;

                const productName = productCard.querySelector('.card-title').textContent;
                const productPrice = productCard.querySelector('.price').textContent;
                const productImage = productCard.querySelector('img').src;
                const userEmail = localStorage.getItem('userEmail');

                if (!userEmail) {
                    alert('You must be logged in to manage your wishlist.');
                    return;
                }

                try {
                    // Fetch all users to find user ID by email
                    const usersResponse = await fetch('/api/users');
                    const users = await usersResponse.json();
                    const user = users.find(u => u.email === userEmail);
                    if (!user) {
                        alert('User not found.');
                        return;
                    }
                    const userId = user.id;

                    // Check if product is already in wishlist (toggle)
                    const wishlistResponse = await fetch(`/api/users/${userId}/wishlist`);
                    const wishlistItems = await wishlistResponse.json();
                    const existingItem = wishlistItems.find(item => item.name === productName);

                    if (existingItem) {
                        // Remove from wishlist
                        const deleteResponse = await fetch(`/api/users/${userId}/wishlist/${existingItem.product_id}`, {
                            method: 'DELETE'
                        });
                        if (deleteResponse.ok) {
                            button.classList.remove('active');
                            alert(`${productName} removed from wishlist.`);
                        } else {
                            alert('Failed to remove from wishlist.');
                        }
                    } else {
                        // Add to wishlist
                        const addResponse = await fetch(`/api/users/${userId}/wishlist`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                name: productName,
                                price: productPrice,
                                image: productImage
                            })
                        });
                        if (addResponse.ok) {
                            button.classList.add('active');
                            alert(`${productName} added to wishlist.`);
                        } else {
                            alert('Failed to add to wishlist.');
                        }
                    }
                } catch (error) {
                    alert('Error managing wishlist.');
                }
            });
        });
    }

    // Call loadProducts on page load if productsContainer exists
    loadProducts();


    // Login form submission handling with OTP support
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const otpInput = document.getElementById('otp');
        const otpInputGroup = document.getElementById('otpInputGroup');
        const passwordGroup = document.getElementById('passwordGroup');
        const requestOtpBtn = document.getElementById('requestOtpBtn');
        const otpRequestMessage = document.getElementById('otpRequestMessage');
        const loginMessage = document.getElementById('loginMessage');
        const loginSubmitBtn = document.getElementById('loginSubmitBtn');

        // Removed OTP login related code

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            loginMessage.textContent = '';
            loginMessage.style.color = '';

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email) {
                loginMessage.style.color = 'red';
                loginMessage.textContent = 'Please enter your email.';
                return;
            }

            if (!password) {
                loginMessage.style.color = 'red';
                loginMessage.textContent = 'Please enter your password.';
                return;
            }
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

if (response.ok) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userEmail', email);
    updateNavbarAuthLinks();
    if (data.is_admin) {
        // Redirect admin users to admin login page for second step authentication
        window.location.href = `admin-login.html?email=${encodeURIComponent(email)}`;
    } else {
        window.location.href = 'index.html';
    }
} else {
    loginMessage.style.color = 'red';
    loginMessage.textContent = data.error || 'Login failed. Please try again.';
}
            } catch (error) {
                loginMessage.style.color = 'red';
                loginMessage.textContent = 'Error connecting to server.';
            }
        });

        // Forgot password and password reset functionality
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');
        const passwordResetSection = document.getElementById('passwordResetSection');
        const passwordResetForm = document.getElementById('passwordResetForm');
        const resetEmailInput = document.getElementById('resetEmail');
        const requestResetOtpBtn = document.getElementById('requestResetOtpBtn');
        const resetOtpInputGroup = document.getElementById('resetOtpInputGroup');
        const resetOtpInput = document.getElementById('resetOtp');
        const newPasswordGroup = document.getElementById('newPasswordGroup');
        const newPasswordInput = document.getElementById('newPassword');
        const passwordResetMessage = document.getElementById('passwordResetMessage');
        const passwordResetSubmitBtn = document.getElementById('passwordResetSubmitBtn');
        const cancelPasswordResetBtn = document.getElementById('cancelPasswordResetBtn');

        // Show password reset section and hide login form
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            passwordResetSection.style.display = 'block';
            loginForm.style.display = 'none';
            loginMessage.textContent = '';
        });

        // Cancel password reset and show login form
        cancelPasswordResetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            passwordResetSection.style.display = 'none';
            loginForm.style.display = 'block';
            passwordResetMessage.textContent = '';
            resetEmailInput.value = '';
            resetOtpInput.value = '';
            newPasswordInput.value = '';
            resetOtpInputGroup.style.display = 'none';
            newPasswordGroup.style.display = 'none';
            passwordResetSubmitBtn.style.display = 'none';
            document.getElementById('resetOtpRequestMessage').textContent = '';
        });

        // Request OTP for password reset
        requestResetOtpBtn.addEventListener('click', async () => {
            const email = resetEmailInput.value.trim();
            const otpRequestMessage = document.getElementById('resetOtpRequestMessage');
            otpRequestMessage.style.color = '';
            otpRequestMessage.textContent = '';

            if (!email) {
                otpRequestMessage.style.color = 'red';
                otpRequestMessage.textContent = 'Please enter your email to request OTP.';
                return;
            }

            try {
                const response = await fetch('/api/password-reset-request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                if (response.ok) {
                    otpRequestMessage.style.color = 'green';
                    otpRequestMessage.textContent = 'OTP sent to your email.';
                    resetOtpInputGroup.style.display = 'block';
                    newPasswordGroup.style.display = 'block';
                    passwordResetSubmitBtn.style.display = 'block';
                } else {
                    const data = await response.json();
                    otpRequestMessage.style.color = 'red';
                    otpRequestMessage.textContent = data.error || 'Failed to send OTP.';
                }
            } catch (error) {
                otpRequestMessage.style.color = 'red';
                otpRequestMessage.textContent = 'Error sending OTP.';
            }
        });

        // Handle password reset form submission
        passwordResetForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            passwordResetMessage.textContent = '';
            passwordResetMessage.style.color = '';

            const email = resetEmailInput.value.trim();
            const otp = resetOtpInput.value.trim();
            const newPassword = newPasswordInput.value.trim();

            if (!email) {
                passwordResetMessage.style.color = 'red';
                passwordResetMessage.textContent = 'Please enter your email.';
                return;
            }

            if (!otp || otp.length !== 6) {
                passwordResetMessage.style.color = 'red';
                passwordResetMessage.textContent = 'Please enter the 6-digit OTP.';
                return;
            }

            if (!newPassword || newPassword.length < 6) {
                passwordResetMessage.style.color = 'red';
                passwordResetMessage.textContent = 'Password must be at least 6 characters.';
                return;
            }

            try {
                const response = await fetch('/api/password-reset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, otp, new_password: newPassword })
                });

                if (response.ok) {
                    passwordResetMessage.style.color = 'green';
                    passwordResetMessage.textContent = 'Password reset successful! You can now login.';
                    // Reset form and hide password reset section
                    passwordResetForm.reset();
                    passwordResetSection.style.display = 'none';
                    loginForm.style.display = 'block';
                } else {
                    const data = await response.json();
                    passwordResetMessage.style.color = 'red';
                    passwordResetMessage.textContent = data.error || 'Password reset failed.';
                }
            } catch (error) {
                passwordResetMessage.style.color = 'red';
                passwordResetMessage.textContent = 'Error connecting to server.';
            }
        });
    }

    // Register form submission handling with OTP support
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const addressInput = document.getElementById('address');
        const contactNoInput = document.getElementById('contactNo');
        const passwordInput = document.getElementById('password');
        const otpInputRegister = document.getElementById('otpRegister');
        const otpInputGroupRegister = document.getElementById('otpInputGroupRegister');
        const passwordGroupRegister = document.getElementById('passwordGroupRegister');
        const requestOtpBtnRegister = document.getElementById('requestOtpBtnRegister');
        const otpRequestMessageRegister = document.getElementById('otpRequestMessageRegister');
        const registerMessage = document.getElementById('registerMessage');
        const registerSubmitBtn = document.getElementById('registerSubmitBtn');

        // Initially hide OTP input
        otpInputGroupRegister.style.display = 'none';
        otpRequestMessageRegister.textContent = '';

        // Handle OTP request button click
        requestOtpBtnRegister.addEventListener('click', async () => {
            const email = emailInput.value.trim();
            if (!email) {
                otpRequestMessageRegister.style.color = 'red';
                otpRequestMessageRegister.textContent = 'Please enter your email to request OTP.';
                return;
            }
            otpRequestMessageRegister.style.color = '';
            otpRequestMessageRegister.textContent = 'Requesting OTP...';

            try {
                const response = await fetch('/api/request-register-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                if (response.ok) {
                    otpRequestMessageRegister.style.color = 'green';
                    otpRequestMessageRegister.textContent = 'OTP sent to your email.';
                    otpInputGroupRegister.style.display = 'block';
                    passwordGroupRegister.style.display = 'none';
                } else {
                    const data = await response.json();
                    otpRequestMessageRegister.style.color = 'red';
                    otpRequestMessageRegister.textContent = data.error || 'Failed to send OTP.';
                }
            } catch (error) {
                otpRequestMessageRegister.style.color = 'red';
                otpRequestMessageRegister.textContent = 'Error sending OTP.';
            }
        });

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            registerMessage.textContent = '';
            registerMessage.style.color = '';

            const name = nameInput.value.trim();
            const address = addressInput.value.trim();
            const contactNo = contactNoInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            const otp = otpInputRegister.value.trim();

            if (!name || !email || !address || !contactNo) {
                registerMessage.style.color = 'red';
                registerMessage.textContent = 'Please fill in all required fields.';
                return;
            }

            // If OTP input is visible, verify OTP registration
            if (otpInputGroupRegister.style.display === 'block') {
                if (!otp || otp.length !== 6) {
                    registerMessage.style.color = 'red';
                    registerMessage.textContent = 'Please enter the 6-digit OTP.';
                    return;
                }
                try {
                    const response = await fetch('/api/verify-register-otp', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, email, address, contact_no: contactNo, otp })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        if (data.token) {
                            localStorage.setItem('token', data.token);
                            localStorage.setItem('userEmail', email);
                            updateNavbarAuthLinks();
                            window.location.href = 'index.html';
                        } else {
                            registerMessage.style.color = 'green';
                            registerMessage.textContent = 'Registration successful! Please login.';
                            registerForm.reset();
                            otpInputGroupRegister.style.display = 'none';
                            passwordGroupRegister.style.display = 'block';
                        }
                    } else {
                        registerMessage.style.color = 'red';
                        registerMessage.textContent = data.error || 'OTP verification failed.';
                    }
                } catch (error) {
                    registerMessage.style.color = 'red';
                    registerMessage.textContent = 'Error connecting to server.';
                }
            } else {
                // Fallback to password registration
                if (!password) {
                    registerMessage.style.color = 'red';
                    registerMessage.textContent = 'Please enter your password.';
                    return;
                }
                try {
                    const response = await fetch('/api/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, email, password })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        // Optionally store token and userEmail if returned
                        if (data.token) {
                            localStorage.setItem('token', data.token);
                            localStorage.setItem('userEmail', email);
                            updateNavbarAuthLinks();
                            window.location.href = 'index.html';
                        } else {
                            registerMessage.style.color = 'green';
                            registerMessage.textContent = 'Registration successful! Please login.';
                            registerForm.reset();
                        }
                    } else {
                        registerMessage.style.color = 'red';
                        registerMessage.textContent = data.error || 'Registration failed. Please try again.';
                    }
                } catch (error) {
                    registerMessage.style.color = 'red';
                    registerMessage.textContent = 'Error connecting to server.';
                }
            }
        });
    }


    // Consultation booking form submission handler
    const consultationForm = document.getElementById('consultationForm');
    if (consultationForm) {
        consultationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const serviceType = document.getElementById('serviceType').value;
            const scheduledTime = document.getElementById('scheduledTime').value;
            const messageEl = document.getElementById('consultationMessage');
            messageEl.textContent = '';

            if (!serviceType || !scheduledTime) {
                messageEl.style.color = 'red';
                messageEl.textContent = 'Please select a service and schedule time.';
                return;
            }

            const token = localStorage.getItem('token');
            const userEmail = localStorage.getItem('userEmail');
            if (!token || !userEmail) {
                messageEl.style.color = 'red';
                messageEl.textContent = 'You must be logged in to book a consultation.';
                return;
            }

            try {
                // Fetch user info to get user_id
                const usersResponse = await fetch('/api/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!usersResponse.ok) {
                    messageEl.style.color = 'red';
                    messageEl.textContent = 'Failed to get user info.';
                    return;
                }
                const users = await usersResponse.json();
                const user = users.find(u => u.email === userEmail);
                if (!user) {
                    messageEl.style.color = 'red';
                    messageEl.textContent = 'User not found.';
                    return;
                }
                const userId = user.id;

                // Submit consultation booking with token authorization
                const response = await fetch('/api/consultations', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        service_type: serviceType,
                        scheduled_time: scheduledTime
                    })
                });
                const data = await response.json();
                if (response.ok) {
                    messageEl.style.color = 'green';
                    messageEl.textContent = 'Consultation booked successfully!';
                    consultationForm.reset();
                } else {
                    messageEl.style.color = 'red';
                    messageEl.textContent = data.error || 'Failed to book consultation.';
                }
            } catch (error) {
                messageEl.style.color = 'red';
                messageEl.textContent = 'Error connecting to server.';
            }
        });
    }

    // Call updateNavbarAuthLinks on page load
    updateNavbarAuthLinks();

    // Buy Now button functionality
    function setupBuyNowButtons() {
        console.log('Setting up Buy Now buttons...');
        const buyNowButtons = document.querySelectorAll('.buy-now-btn');
        console.log('Found Buy Now buttons:', buyNowButtons.length);

        buyNowButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Buy Now button clicked');
                
                // Get product details from the product card
                const productCard = this.closest('.product-card');
                if (!productCard) {
                    console.error('Product card not found');
                    return;
                }

                const productName = productCard.querySelector('.product-title, h3').textContent;
                const productPrice = productCard.querySelector('.discounted-price, .product-price').textContent;
                const productImage = productCard.querySelector('.product-image img, img').src;
                const productCategory = productCard.dataset.category || 'rudraksha';

                console.log('Product details:', {
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    category: productCategory
                });

                // Create URL with query parameters
                const params = new URLSearchParams({
                    product: productName,
                    price: productPrice,
                    image: productImage,
                    category: productCategory
                });

                // Redirect to product details page
                const url = `product-details.html?${params.toString()}`;
                console.log('Redirecting to:', url);
                window.location.href = url;
            });
        });
    }

    // Call setupBuyNowButtons when the page loads
    setupBuyNowButtons();

    // Initial check for elements in viewport
    checkScroll();
    
    // Add scroll event listener
    window.addEventListener('scroll', checkScroll);
    
    function checkScroll() {
        const elements = document.querySelectorAll('.hero-section h1, .hero-section .lead, .about-content .title, .about-content .description, .products-section h2, .reviews-section h2, .footer h3, .expertise-item');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            
            // Check if element is in viewport
            if (elementTop < window.innerHeight && elementBottom > 0) {
                element.classList.add('active');
            }
        });
    }

    // Product Filtering
    const categoryButtons = document.querySelectorAll('.category-btn');
    const productCards = document.querySelectorAll('[data-category]');

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const category = button.dataset.category;

            productCards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                    // Trigger animation
                    setTimeout(() => {
                        card.querySelector('.product-card').classList.add('active');
                    }, 100);
                } else {
                    card.style.display = 'none';
                    card.querySelector('.product-card').classList.remove('active');
                }
            });
        });
    });

    // Product Modal
const viewDetailsButtons = document.querySelectorAll('.view-details-btn');
const productModalElement = document.getElementById('productModal');
let productModal = null;

if (productModalElement) {
    productModal = new bootstrap.Modal(productModalElement);

    viewDetailsButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productCard = button.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const productDescription = productCard.querySelector('.product-description').textContent;
            const productPrice = productCard.querySelector('.price').textContent;
            const productImage = productCard.querySelector('img').src;

            const modalBody = document.querySelector('.modal-body');
            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <img src="${productImage}" alt="${productName}" class="img-fluid rounded">
                    </div>
                    <div class="col-md-6">
                        <h3>${productName}</h3>
                        <p class="lead">${productDescription}</p>
                        <div class="product-details">
                            <p><strong>Price:</strong> ${productPrice}</p>
                            <p><strong>Availability:</strong> In Stock</p>
                            <p><strong>Shipping:</strong> Free worldwide shipping</p>
                        </div>
                        <button class="custom-btn mt-3">Add to Cart</button>
                    </div>
                </div>
            `;

            productModal.show();
        });
    });
}

    // Initialize product cards animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.product-card').forEach(card => {
        observer.observe(card);
    });

    // Initialize Variables
    const filterToggleBtn = document.querySelector('.filter-toggle-btn');
    const mobileFilterPanel = document.querySelector('.mobile-filter-panel');
    const closeFilterBtn = document.querySelector('.mobile-filter-panel .close-filter');
    const filterOverlay = document.querySelector('.mobile-filter-overlay');
    const sidebarFilter = document.querySelector('.sidebar-filter');
    const priceRange = document.getElementById('priceRange');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const sortSelect = document.getElementById('sortSelect');
    const productGrid = document.querySelector('.row.g-4');

    // Handle mobile filter panel
    if (filterToggleBtn && mobileFilterPanel) {
        // Open filter panel
        filterToggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileFilterPanel.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });

        // Close filter panel
        const closeFilter = () => {
            mobileFilterPanel.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (closeFilterBtn) {
            closeFilterBtn.addEventListener('click', closeFilter);
        }

        if (filterOverlay) {
            filterOverlay.addEventListener('click', closeFilter);
        }

        // Prevent closing when clicking inside the filter content
        const filterContent = mobileFilterPanel.querySelector('.mobile-filter-content');
        if (filterContent) {
            filterContent.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    }

    // Filter Sidebar Toggle
    if (filterToggleBtn && sidebarFilter) {
        filterToggleBtn.addEventListener('click', function() {
            sidebarFilter.classList.toggle('active');
        });

        if (closeFilterBtn) {
            closeFilterBtn.addEventListener('click', () => {
                sidebarFilter.classList.remove('active');
            });
        }

        // Close filter sidebar when clicking outside
        document.addEventListener('click', function(event) {
            if (!sidebarFilter.contains(event.target) && !filterToggleBtn.contains(event.target)) {
                sidebarFilter.classList.remove('active');
            }
        });
    }

    // Price range slider
    if (priceRange && minPriceInput && maxPriceInput) {
        priceRange.addEventListener('input', function() {
            const value = this.value;
            const max = this.getAttribute('max');
            minPriceInput.value = 0;
            maxPriceInput.value = value;
        });

        // Update slider when min/max inputs change
        minPriceInput.addEventListener('change', updatePriceRange);
        maxPriceInput.addEventListener('change', updatePriceRange);
    }

    // Product sorting
    if (sortSelect && productGrid) {
        sortSelect.addEventListener('change', function() {
            const products = Array.from(productGrid.children);
            const sortBy = this.value;

            products.sort((a, b) => {
                const priceA = parseFloat(a.querySelector('.discounted-price').textContent.replace('$', ''));
                const priceB = parseFloat(b.querySelector('.discounted-price').textContent.replace('$', ''));

                switch(sortBy) {
                    case 'price-low':
                        return priceA - priceB;
                    case 'price-high':
                        return priceB - priceA;
                    case 'name-asc':
                        return a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent);
                    case 'name-desc':
                        return b.querySelector('h3').textContent.localeCompare(a.querySelector('h3').textContent);
                    default:
                        return 0;
                }
            });

            // Clear and re-append sorted products
            productGrid.innerHTML = '';
            products.forEach(product => productGrid.appendChild(product));
        });
    }

    // Filter products based on selected categories and price range
    function filterProducts() {
        const selectedCategories = Array.from(document.querySelectorAll('.form-check-input:checked')).map(cb => cb.id);
        const minPrice = parseFloat(document.getElementById('minPrice').value);
        const maxPrice = parseFloat(document.getElementById('maxPrice').value);
        const products = document.querySelectorAll('[data-category]');

        products.forEach(product => {
            const category = product.getAttribute('data-category');
            const price = parseFloat(product.getAttribute('data-price'));
            
            const categoryMatch = selectedCategories.length === 0 || 
                                selectedCategories.includes('allProducts') || 
                                selectedCategories.includes(category);
            const priceMatch = (isNaN(minPrice) || price >= minPrice) && 
                              (isNaN(maxPrice) || price <= maxPrice);

            product.style.display = categoryMatch && priceMatch ? 'block' : 'none';
        });

        // Update product count
        const visibleProducts = document.querySelectorAll('[data-category][style="display: block"]').length;
        const productCountElement = document.getElementById('productCount');
        if (productCountElement) {
            productCountElement.textContent = visibleProducts;
        }
    }

    // Add event listeners for filters
    document.querySelectorAll('.form-check-input').forEach(checkbox => {
        checkbox.addEventListener('change', filterProducts);
    });

    // Add event listener for apply filters button
    const applyFiltersBtn = document.querySelector('.apply-filters-btn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', filterProducts);
    }

    // Update price range display
    function updatePriceRange() {
        const min = parseFloat(minPriceInput.value);
        const max = parseFloat(maxPriceInput.value);
        
        if (!isNaN(min) && !isNaN(max)) {
            priceRange.value = max;
        }
    }

    // Initialize price range
    if (priceRange) {
        const max = priceRange.getAttribute('max');
        minPriceInput.value = 0;
        maxPriceInput.value = max;
    }

    // Sync mobile and desktop filters
    function syncFilters(mobileId, desktopId) {
        const mobileElement = document.getElementById(mobileId);
        const desktopElement = document.getElementById(desktopId);
        
        if (mobileElement && desktopElement) {
            mobileElement.addEventListener('change', function() {
                desktopElement.checked = this.checked;
                filterProducts();
            });
            
            desktopElement.addEventListener('change', function() {
                mobileElement.checked = this.checked;
                filterProducts();
            });
        }
    }

    // Sync price range inputs
    function syncPriceRange() {
        const mobilePriceRange = document.getElementById('mobilePriceRange');
        const mobileMinPrice = document.getElementById('mobileMinPrice');
        const mobileMaxPrice = document.getElementById('mobileMaxPrice');
        const desktopPriceRange = document.getElementById('priceRange');
        const desktopMinPrice = document.getElementById('minPrice');
        const desktopMaxPrice = document.getElementById('maxPrice');

        if (mobilePriceRange && desktopPriceRange) {
            mobilePriceRange.addEventListener('input', function() {
                desktopPriceRange.value = this.value;
                mobileMaxPrice.value = this.value;
                desktopMaxPrice.value = this.value;
                filterProducts();
            });

            desktopPriceRange.addEventListener('input', function() {
                mobilePriceRange.value = this.value;
                mobileMaxPrice.value = this.value;
                desktopMaxPrice.value = this.value;
                filterProducts();
            });
        }
    }

    // Sync all filter pairs
    syncFilters('mobileAllProducts', 'allProducts');
    syncFilters('mobileRudraksha', 'rudraksha');
    syncFilters('mobileGemstones', 'gemstones');
    syncFilters('mobileCrystals', 'crystals');
    syncFilters('mobileAccessories', 'accessories');
    syncPriceRange();

    // Product Details Page Functionality
    // Initialize Swiper for product gallery
    if (document.querySelector('.product-swiper')) {
        const thumbsSwiper = new Swiper('.product-thumbs', {
            spaceBetween: 10,
            slidesPerView: 4,
            freeMode: true,
            watchSlidesProgress: true,
        });

        const mainSwiper = new Swiper('.product-swiper', {
            spaceBetween: 10,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            thumbs: {
                swiper: thumbsSwiper,
            },
        });
    }

    // Quantity controls
    const quantityInput = document.getElementById('quantity');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');

    if (quantityInput && minusBtn && plusBtn) {
        minusBtn.addEventListener('click', () => {
            let value = parseInt(quantityInput.value);
            if (value > 1) {
                quantityInput.value = value - 1;
            }
        });

        plusBtn.addEventListener('click', () => {
            let value = parseInt(quantityInput.value);
            quantityInput.value = value + 1;
        });

        quantityInput.addEventListener('change', () => {
            let value = parseInt(quantityInput.value);
            if (value < 1) {
                quantityInput.value = 1;
            }
        });
    }

    // Cart functionality
function updateCartDisplay() {
    const cartItemsList = document.getElementById('cartItemsList');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    
    if (!cartItemsList) return; // Not on cart page

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        if (emptyCartMessage) emptyCartMessage.style.display = 'block';
        cartItemsList.innerHTML = '';
        return;
    }
    
    if (emptyCartMessage) emptyCartMessage.style.display = 'none';
    
    let cartHTML = '';
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        const itemPrice = parseFloat(item.price.replace('$', ''));
        subtotal += itemPrice * item.quantity;
        cartHTML += `
            <div class="cart-item" data-index="${index}">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <img src="${item.image}" alt="${item.name}" class="img-fluid">
                    </div>
                    <div class="col-md-4">
                        <h4>${item.name}</h4>
                        <p class="text-muted">${item.category}</p>
                        <p class="text-muted">Size: ${item.size || 'Standard'}</p>
                    </div>
                    <div class="col-md-2">
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" onclick="updateQuantity(${index}, -1)">-</button>
                            <input type="number" value="${item.quantity}" min="1" max="10" 
                                onchange="updateQuantity(${index}, this.value - ${item.quantity})">
                            <button class="quantity-btn plus" onclick="updateQuantity(${index}, 1)">+</button>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <span class="price">${item.price}</span>
                    </div>
                    <div class="col-md-2">
                        <button class="remove-btn" onclick="removeFromCart(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartItemsList.innerHTML = cartHTML;
    
    // Update summary
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    
    const shipping = subtotal > 50 ? 0 : 10;
    if (shippingElement) shippingElement.textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
    
    const tax = subtotal * 0.1; // 10% tax
    if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
    
    const total = subtotal + shipping + tax;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}

function updateCartCounter() {
    const cartCountElement = document.querySelector('.cart-count');
    if (!cartCountElement) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    cartCountElement.textContent = totalQuantity;
    
    if (totalQuantity > 0) {
        cartCountElement.classList.add('has-items');
    } else {
        cartCountElement.classList.remove('has-items');
    }
}

function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Clean price string: remove newlines, extra spaces, and keep only first price if multiple
    if (product.price) {
        let priceText = product.price.replace(/\n/g, '').trim();
        // If multiple prices, take the last one (usually discounted price)
        const priceMatches = priceText.match(/\$\d+(\.\d{2})?/g);
        if (priceMatches && priceMatches.length > 0) {
            product.price = priceMatches[priceMatches.length - 1];
        } else {
            product.price = priceText;
        }
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => 
        item.name === product.name && 
        (item.size === product.size || (!item.size && !product.size))
    );

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity = Math.min(
            (cart[existingItemIndex].quantity || 1) + (product.quantity || 1),
            10
        );
    } else {
        cart.push({
            ...product,
            quantity: product.quantity || 1,
            size: product.size || 'Standard'
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter();
    updateCartDisplay();
    showSuccessMessage('Item added to cart successfully!');
}

    // Setup Add to Cart buttons for product listing pages
    function setupAddToCartButtons() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const productCard = this.closest('.product-card');
                if (!productCard) return;
                
                const product = {
                    name: productCard.querySelector('h3').textContent,
                    price: productCard.querySelector('.discounted-price, .product-price').textContent,
                    image: productCard.querySelector('img').src,
                    category: productCard.dataset.category || 'rudraksha',
                    quantity: 1
                };
                
                addToCart(product);
            });
        });
    }

    // Setup Add to Cart button for product details page
    const detailsAddToCartBtn = document.querySelector('.product-details .add-to-cart-btn');
    if (detailsAddToCartBtn) {
        detailsAddToCartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const quantityInput = document.getElementById('quantity');
            const sizeSelect = document.getElementById('size');
            
            const product = {
                name: document.querySelector('.product-title').textContent,
                price: document.querySelector('.product-price').textContent,
                image: document.querySelector('.product-gallery img').src,
                category: document.querySelector('.product-category').textContent,
                quantity: parseInt(quantityInput?.value || 1),
                size: sizeSelect?.value || 'Standard'
            };
            
            addToCart(product);
        });
    }

    // Initialize cart functionality
    setupAddToCartButtons();
    updateCartCounter();
    updateCartDisplay();

    // Checkout button
const checkoutBtn = document.getElementById('checkoutBtn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            showNotification('Your cart is empty!');
            return;
        }
        window.location.href = 'checkout.html';
    });
}

const stripe = Stripe('your_stripe_publishable_key_here'); // Replace with your Stripe publishable key

const shippingForm = document.getElementById('shippingForm');
if (shippingForm) {
    // Create an instance of Stripe Elements
    const elements = stripe.elements();

    // Create and mount the card Element
    const cardElement = elements.create('card');
    cardElement.mount('#card-element');

    // Handle real-time validation errors from the card Element.
    const cardErrors = document.getElementById('card-errors');
    cardElement.on('change', function(event) {
        if (event.error) {
            cardErrors.textContent = event.error.message;
        } else {
            cardErrors.textContent = '';
        }
    });

    shippingForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;

        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            alert('You must be logged in to place an order.');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }

        try {
            // Fetch all users to find user ID by email
            const usersResponse = await fetch('/api/users');
            const users = await usersResponse.json();
            const user = users.find(u => u.email === userEmail);
            if (!user) {
                alert('User not found.');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }
            const userId = user.id;

            // Gather cart items
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart.length === 0) {
                alert('Your cart is empty.');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }

            // Prepare order items for backend (simplified)
            const items = cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            }));

            // Gather shipping info
            const shippingAddress = {
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                address: document.getElementById('address').value.trim(),
                address2: document.getElementById('address2').value.trim(),
                city: document.getElementById('city').value.trim(),
                state: document.getElementById('state').value.trim(),
                zipCode: document.getElementById('zipCode').value.trim(),
                country: document.getElementById('country').value.trim()
            };

            // Determine payment method
            const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

            // Calculate total (simplified)
            let subtotal = 0;
            cart.forEach(item => {
                const priceNum = parseFloat(item.price.replace('$', ''));
                subtotal += priceNum * item.quantity;
            });
            const shippingCost = document.querySelector('input[name="shipping"]:checked').value === 'express' ? 15 : 0;
            const protectionCost = document.getElementById('protection').checked ? 4.99 : 0;
            const total = subtotal + shippingCost + protectionCost;

            // Create payment intent on backend
            const paymentIntentResponse = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: total })
            });
            const paymentIntentData = await paymentIntentResponse.json();

            if (!paymentIntentResponse.ok) {
                alert(paymentIntentData.error || 'Failed to create payment intent.');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }

            // Confirm card payment
            const result = await stripe.confirmCardPayment(paymentIntentData.clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
                        email: shippingAddress.email,
                        phone: shippingAddress.phone,
                        address: {
                            line1: shippingAddress.address,
                            line2: shippingAddress.address2,
                            city: shippingAddress.city,
                            state: shippingAddress.state,
                            postal_code: shippingAddress.zipCode,
                            country: shippingAddress.country
                        }
                    }
                }
            });

            if (result.error) {
                alert(result.error.message);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }

            if (result.paymentIntent.status === 'succeeded') {
                // Payment succeeded, create order in backend
                const shippingAddressStr = `${shippingAddress.firstName} ${shippingAddress.lastName}, ${shippingAddress.address}${shippingAddress.address2 ? ', ' + shippingAddress.address2 : ''}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.zipCode}, ${shippingAddress.country}`;

                const orderResponse = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: userId,
                        items: items,
                        total: total,
                        shipping_address: shippingAddressStr,
                        payment_method: 'card'
                    })
                });

                if (orderResponse.ok) {
                    alert('Order placed successfully! Thank you for your purchase.');
                    localStorage.removeItem('cart');
                    window.location.href = 'index.html';
                } else {
                    const orderData = await orderResponse.json();
                    alert(orderData.error || 'Failed to create order.');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            }
        } catch (error) {
            alert('Error connecting to server.');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

    // Tab functionality
    const tabLinks = document.querySelectorAll('.nav-tabs .nav-link');
    const tabContents = document.querySelectorAll('.tab-content > div');

    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and contents
            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding content
            const target = this.getAttribute('href').substring(1);
            document.getElementById(target).classList.add('active');
        });
    });

    function showSuccessMessage(message) {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = message;
        document.body.appendChild(successMessage);
        
        setTimeout(() => {
            successMessage.remove();
        }, 2000);
    }

    // Utility function to show notification messages
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Update consultation booking success to use notification and placeholder for email notification
    // Removed duplicate declaration to avoid redeclaration errors

    // Update order submission success to use notification and placeholder for email notification
    // Removed duplicate declaration to avoid redeclaration errors

window.updateQuantity = function(index, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart[index];
    const newQuantity = typeof change === 'number' ? 
        item.quantity + change : 
        parseInt(change);
        
    if (newQuantity >= 1 && newQuantity <= 10) {
        item.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        updateCartCounter();
    }
};

window.removeFromCart = function(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    updateCartCounter();
    showSuccessMessage('Item removed from cart');
};

// Wishlist button functionality
document.addEventListener('DOMContentLoaded', () => {
    const wishlistButtons = document.querySelectorAll('.add-to-wishlist');

    wishlistButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const productCard = button.closest('.product-card');
            if (!productCard) return;

            const productName = productCard.querySelector('h3').textContent;
            const productPrice = productCard.querySelector('.discounted-price, .product-price').textContent;
            const productImage = productCard.querySelector('img').src;
            const userEmail = localStorage.getItem('userEmail');

            if (!userEmail) {
                alert('You must be logged in to manage your wishlist.');
                return;
            }

            try {
                // Fetch all users to find user ID by email
                const usersResponse = await fetch('/api/users');
                const users = await usersResponse.json();
                const user = users.find(u => u.email === userEmail);
                if (!user) {
                    alert('User not found.');
                    return;
                }
                const userId = user.id;

                // Check if product is already in wishlist (toggle)
                const wishlistResponse = await fetch(`/api/users/${userId}/wishlist`);
                const wishlistItems = await wishlistResponse.json();
                const existingItem = wishlistItems.find(item => item.name === productName);

                if (existingItem) {
                    // Remove from wishlist
                    const deleteResponse = await fetch(`/api/users/${userId}/wishlist/${existingItem.product_id}`, {
                        method: 'DELETE'
                    });
                    if (deleteResponse.ok) {
                        button.classList.remove('active');
                        alert(`${productName} removed from wishlist.`);
                    } else {
                        alert('Failed to remove from wishlist.');
                    }
                } else {
                    // Add to wishlist
                    const addResponse = await fetch(`/api/users/${userId}/wishlist`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: productName,
                            price: productPrice,
                            image: productImage
                        })
                    });
                    if (addResponse.ok) {
                        button.classList.add('active');
                        alert(`${productName} added to wishlist.`);
                    } else {
                        alert('Failed to add to wishlist.');
                    }
                }
            } catch (error) {
                alert('Error managing wishlist.');
            }
        });
    });
});
});    
document.addEventListener('DOMContentLoaded', async () => {
    const wishlistContainer = document.getElementById('wishlistContainer');
    const userEmail = localStorage.getItem('userEmail');

    if (!userEmail) {
        wishlistContainer.innerHTML = '<p>You must be logged in to view your wishlist.</p>';
        return;
    }

    try {
        // Fetch all users to find user ID by email
        const usersResponse = await fetch('http://localhost:3001/api/users');
        const users = await usersResponse.json();
        const user = users.find(u => u.email === userEmail);
        if (!user) {
            wishlistContainer.innerHTML = '<p>User not found.</p>';
            return;
        }
        const userId = user.id;

        // Fetch wishlist items
        const wishlistResponse = await fetch(`http://localhost:3001/api/users/${userId}/wishlist`);
        if (!wishlistResponse.ok) {
            wishlistContainer.innerHTML = '<p>Failed to load wishlist.</p>';
            return;
        }
        const wishlistItems = await wishlistResponse.json();

        if (wishlistItems.length === 0) {
            wishlistContainer.innerHTML = '<p>Your wishlist is empty.</p>';
            return;
        }

        // Render wishlist items as Bootstrap cards
        wishlistContainer.innerHTML = '';
        wishlistItems.forEach(item => {
            const col = document.createElement('div');
            col.className = 'col-md-4';

            col.innerHTML = `
                <div class="card h-100">
                    <img src="${item.image}" class="card-img-top" alt="${item.name}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${item.name}</h5>
                        <p class="card-text">${item.description || ''}</p>
                        <p class="card-text fw-bold">Price: $${item.price}</p>
                        <button class="btn btn-danger mt-auto remove-btn" data-product-id="${item.product_id}">Remove</button>
                    </div>
                </div>
            `;
            wishlistContainer.appendChild(col);
        });

        // Add event listeners for remove buttons
        const removeButtons = wishlistContainer.querySelectorAll('.remove-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const productId = button.getAttribute('data-product-id');
                try {
                    const response = await fetch(`http://localhost:3001/api/users/${userId}/wishlist/${productId}`, {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        button.closest('.col-md-4').remove();
                        if (wishlistContainer.children.length === 0) {
                            wishlistContainer.innerHTML = '<p>Your wishlist is empty.</p>';
                        }
                    } else {
                        alert('Failed to remove item from wishlist.');
                    }
                } catch (error) {
                    alert('Error removing item from wishlist.');
                }
            });
        });

    } catch (error) {
        wishlistContainer.innerHTML = '<p>Error loading wishlist.</p>';
    }

    // Related products section
    const relatedProductsContainer = document.getElementById('relatedProductsContainer');
    if (!relatedProductsContainer) return;

    async function loadRelatedProducts() {
        relatedProductsContainer.innerHTML = '<p>Loading related products...</p>';

        try {
            // Fetch all products
            const productsResponse = await fetch('http://localhost:3001/api/products');
            if (!productsResponse.ok) {
                relatedProductsContainer.innerHTML = '<p>Failed to load related products.</p>';
                return;
            }
            const allProducts = await productsResponse.json();

            // Collect wishlist item names and categories for matching
            const wishlistNames = wishlistItems.map(item => item.name.toLowerCase());
            const wishlistCategories = wishlistItems.map(item => item.category ? item.category.toLowerCase() : '');

            // Filter related products: exclude wishlist items, match category or similar name
            const relatedProducts = allProducts.filter(product => {
                const productName = product.name.toLowerCase();
                const productCategory = product.category ? product.category.toLowerCase() : '';
                const isInWishlist = wishlistNames.includes(productName);
                const categoryMatch = wishlistCategories.includes(productCategory);
                const nameMatch = wishlistNames.some(name => productName.includes(name) || name.includes(productName));
                return !isInWishlist && (categoryMatch || nameMatch);
            });

            if (relatedProducts.length === 0) {
                relatedProductsContainer.innerHTML = '<p>No related products found.</p>';
                return;
            }

            // Render related products as cards
            relatedProductsContainer.innerHTML = '';
            relatedProducts.forEach(product => {
                const col = document.createElement('div');
                col.className = 'col-md-3';

                col.innerHTML = `
                    <div class="card h-100">
                        <img src="${product.image || 'placeholder.jpg'}" class="card-img-top" alt="${product.name}">
                        <div class="card-body d-flex flex-column">
                            <h6 class="card-title">${product.name}</h6>
                            <p class="card-text fw-bold">$${product.price.toFixed(2)}</p>
                            <button class="btn btn-primary mt-auto add-to-cart-btn">Add to Cart</button>
                        </div>
                    </div>
                `;
                relatedProductsContainer.appendChild(col);
            });

            // Setup Add to Cart buttons for related products
            const addToCartButtons = relatedProductsContainer.querySelectorAll('.add-to-cart-btn');
            addToCartButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const card = button.closest('.card');
                    if (!card) return;
                    const productName = card.querySelector('.card-title').textContent;
                    const productPrice = card.querySelector('.card-text').textContent;
                    const productImage = card.querySelector('img').src;

                    // Add product to cart using existing addToCart function if available
                    if (typeof addToCart === 'function') {
                        addToCart({
                            name: productName,
                            price: productPrice,
                            image: productImage,
                            quantity: 1
                        });
                    } else {
                        alert('Add to cart function not available.');
                    }
                });
            });

        } catch (error) {
            relatedProductsContainer.innerHTML = '<p>Error loading related products.</p>';
        }
    }

    // Load related products after wishlist is loaded
    loadRelatedProducts();
});
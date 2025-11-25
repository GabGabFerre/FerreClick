// js/cart.js -> Will be renamed/refactored to js/quote.js or similar in a future step if full rename is desired.
// For now, only updating localStorage key and relevant element IDs.
document.addEventListener('DOMContentLoaded', function() {
    updateQuoteDisplay(); // Renamed function
});

// Function to get quote from localStorage
function getQuote() { // Renamed function
    return JSON.parse(localStorage.getItem('shoppingQuote')) || []; // Updated localStorage key
}

// Function to save quote to localStorage
function saveQuote(quote) { // Renamed function
    localStorage.setItem('shoppingQuote', JSON.stringify(quote)); // Updated localStorage key
    updateQuoteDisplay(); // Update display whenever quote is saved
}

// Function to add item to quote
// product object should contain id, name, price, image
// quantity is the number of items to add
function addItemToCart(product, quantity = 1) { // Function name kept for now to minimize changes in products.js
    if (!product || !product.id || typeof product.price === 'undefined' || quantity <= 0) {
        console.error("Invalid product data or quantity for addItemToQuote:", product, quantity);
        return;
    }

    const quote = getQuote();
    const existingItemIndex = quote.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
        quote[existingItemIndex].quantity += quantity;
    } else {
        quote.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }
    saveQuote(quote);
}

// Function to update item quantity in quote
function updateItemQuantity(productId, newQuantity) {
    const quote = getQuote();
    const itemIndex = quote.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        if (newQuantity > 0) {
            quote[itemIndex].quantity = newQuantity;
        } else {
            quote.splice(itemIndex, 1);
        }
        saveQuote(quote);
    }
}

// Function to remove item from quote
function removeItemFromCart(productId) { // Function name kept for now
    let quote = getQuote();
    quote = quote.filter(item => item.id !== productId);
    saveQuote(quote);
}

// Function to calculate quote total (referential)
function calculateQuoteTotal() { // Renamed function
    const quote = getQuote();
    return quote.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Function to clear the entire quote
function clearCart() { // Function name kept for now
    localStorage.removeItem('shoppingQuote'); // Updated localStorage key
    updateQuoteDisplay();
}


// Function to update the quote display on cotizar.html
function updateQuoteDisplay() { // Renamed function
    const quoteItemsContainer = document.getElementById('quote-items'); // Updated ID
    const quoteSubtotalEl = document.getElementById('quote-subtotal'); // Updated ID
    const quoteTotalEl = document.getElementById('quote-total');       // Updated ID
    const quoteIconCount = document.getElementById('quote-icon-count'); // Updated ID
    const quote = getQuote();

    if (quoteIconCount) {
        const itemCount = quote.length; // Changed to count unique product lines
        quoteIconCount.textContent = itemCount;
        quoteIconCount.style.display = itemCount > 0 ? 'inline-block' : 'none';
    }

    if (window.location.pathname.endsWith('cotizar.html')) {
        if (!quoteItemsContainer) return;

        quoteItemsContainer.innerHTML = '';
        const emptyQuoteMessage = document.querySelector('.empty-quote-message'); // Updated class
        const quoteSummaryContainer = document.getElementById('quote-summary-container'); // Updated ID

        if (quote.length === 0) {
            if (emptyQuoteMessage) emptyQuoteMessage.style.display = 'block';
            if (quoteSummaryContainer) quoteSummaryContainer.style.display = 'none';
            quoteItemsContainer.style.display = 'none';
        } else {
            if (emptyQuoteMessage) emptyQuoteMessage.style.display = 'none';
            if (quoteSummaryContainer) quoteSummaryContainer.style.display = 'block';
            quoteItemsContainer.style.display = 'block';

            quote.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item'); // Class name can remain for styling consistency
                const itemImage = item.image || 'images/placeholder.png';
                itemElement.innerHTML = `
                    <img src="${itemImage}" alt="${item.name}" onerror="this.onerror=null;this.src='images/placeholder.png';">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>Precio unitario (ref.): S/${item.price.toFixed(2)}</p> <!-- Text updated -->
                    </div>
                    <div class="cart-item-quantity">
                        <label for="qty-${item.id}" class="sr-only">Cantidad:</label>
                        <input type="number" id="qty-${item.id}" class="item-quantity" value="${item.quantity}" min="1" data-product-id="${item.id}" aria-label="Cantidad para ${item.name}">
                    </div>
                    <p class="cart-item-subtotal">S/${(item.price * item.quantity).toFixed(2)}</p>
                    <button class="remove-item-btn" data-product-id="${item.id}" aria-label="Remover ${item.name} de la cotización">&times;</button> <!-- Aria-label updated -->
                `;
                quoteItemsContainer.appendChild(itemElement);
            });

            addQuotePageEventListeners(); // Renamed function
        }
        const total = calculateQuoteTotal();
        if (quoteSubtotalEl) quoteSubtotalEl.textContent = `S/${total.toFixed(2)}`;
        if (quoteTotalEl) quoteTotalEl.textContent = `S/${total.toFixed(2)}`;

    } else if (window.location.pathname.endsWith('checkout.html')) {
        const checkoutQuoteSummaryEl = document.getElementById('checkout-cart-summary'); // ID kept for now, or change to checkout-quote-summary
        if (!checkoutQuoteSummaryEl) return;

        checkoutQuoteSummaryEl.innerHTML = '';
        if (quote.length === 0) {
            checkoutQuoteSummaryEl.innerHTML = '<p>Tu solicitud de cotización está vacía. No puedes proceder.</p>'; // Text updated
            const submitQuoteBtn = document.getElementById('submit-quote-request-btn'); // Updated ID
            if(submitQuoteBtn) submitQuoteBtn.disabled = true;
        } else {
            const ul = document.createElement('ul');
            ul.classList.add('checkout-summary-list');
            quote.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${item.name} (x${item.quantity})</span> <span>S/${(item.price * item.quantity).toFixed(2)} (ref.)</span>`; // Text updated
                ul.appendChild(li);
            });
            checkoutQuoteSummaryEl.appendChild(ul);
            const total = calculateQuoteTotal();
            const totalEl = document.createElement('p');
            totalEl.classList.add('checkout-summary-total');
            totalEl.innerHTML = `<strong>Total Solicitud (referencial):</strong> <strong>S/${total.toFixed(2)}</strong>`; // Text updated
            checkoutQuoteSummaryEl.appendChild(totalEl);
        }
    }
}

function addQuotePageEventListeners() { // Renamed function
    document.querySelectorAll('.item-quantity').forEach(input => {
        input.addEventListener('change', function() {
            const productId = parseInt(this.dataset.productId);
            const newQuantity = parseInt(this.value);
            if (newQuantity < 1 && !isNaN(newQuantity)) { // Prevent quantity less than 1
                this.value = 1; // Reset to 1 if user tries to go lower
                updateItemQuantity(productId, 1);
            } else if (!isNaN(newQuantity)) {
                updateItemQuantity(productId, newQuantity);
            }
        });
         input.addEventListener('input', function() { // Handle direct input
            if (this.value === "" || parseInt(this.value) < 1) {
                // Don't update immediately, wait for change or blur
                // Or you could choose to enforce '1' immediately
            }
        });
    });

    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.dataset.productId);
            removeItemFromCart(productId);
        });
    });
}

// Example of how to add to cart from another script (e.g., products.js)
// This is already handled in products.js by directly calling addItemToCart
// but this shows how it could be structured if functions were not global.

// Make functions globally accessible if needed by other scripts, or use modules.
// For simplicity in this project, functions are global.
// window.addItemToCart = addItemToCart;
// window.updateCartDisplay = updateCartDisplay;
// window.getProductById = getProductById; // Assuming getProductById is in products.js and made global
// window.clearCart = clearCart;

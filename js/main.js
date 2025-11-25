// js/main.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("Ferretería Online - Main JS loaded");

    // Update active state for navigation links
    const navLinks = document.querySelectorAll('header nav a');
    const currentPath = window.location.pathname.split('/').pop(); // Gets the current file name e.g., "products.html"

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop();
        if (linkPath === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    // Special case for index.html if currentPath is empty (root)
    if (currentPath === '' || currentPath === 'index.html') {
        document.querySelector('header nav a[href="index.html"]').classList.add('active');
    }


    // Handle quote request form submission (formerly checkout)
    const quoteRequestForm = document.getElementById('checkout-form'); // ID of form is still 'checkout-form'
    if (quoteRequestForm) {
        // Initial call to update quote summary when page loads
        if (typeof updateQuoteDisplay === "function") { // Assuming updateCartDisplay is renamed to updateQuoteDisplay in cart.js
            updateQuoteDisplay();
        }

        quoteRequestForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent actual form submission

            const requiredFields = quoteRequestForm.querySelectorAll('[required]');
            let formIsValid = true;
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.style.borderColor = 'red';
                    formIsValid = false;
                } else {
                    field.style.borderColor = '';
                }
            });

            if (!formIsValid) {
                alert('Por favor, complete todos los campos obligatorios de información de envío.');
                return;
            }

            // Save form data to localStorage
            const formData = {
                ferreteriaName: document.getElementById('ferreteria-name').value,
                contactName: document.getElementById('name').value,
                city: document.getElementById('city').value,
                district: document.getElementById('postal-code').value, // ID is postal-code, value is district
                address: document.getElementById('address').value,
                email: document.getElementById('email').value,
                comments: document.getElementById('comments').value
            };
            localStorage.setItem('quoteShippingInfo', JSON.stringify(formData));

            // Redirect to the export page
            window.location.href = 'exportar-cotizacion.html';
        });
    }

    // Link "Solicitar Cotización" button on cotizar.html page to checkout.html (Finalizar Solicitud)
    const requestQuoteButton = document.getElementById('request-quote-btn'); // Updated ID
    if(requestQuoteButton) {
        requestQuoteButton.addEventListener('click', function() {
            if (typeof getQuote === "function" && getQuote().length === 0) { // Assuming getCart is renamed to getQuote
                alert("Tu solicitud de cotización está vacía. Añade productos antes de proceder.");
                return;
            }
            window.location.href = 'checkout.html';
        });
    }

    // Initial quote display update on all pages (for quote icon count)
    if (typeof updateQuoteDisplay === "function") { // Assuming updateCartDisplay is renamed
         updateQuoteDisplay();
    }

    // --- Dynamic District Loading for Checkout Form ---
    const citySelect = document.getElementById('city');
    const districtSelect = document.getElementById('postal-code'); // ID is still postal-code

    if (citySelect && districtSelect) {
        const districtMap = {
            "Arequipa": ["Arequipa", "Alto Selva Alegre", "Cayma", "Cerro Colorado", "Characato", "Chiguata", "Jacobo Hunter", "José Luis Bustamante y Rivero", "La Joya", "Mariano Melgar", "Miraflores", "Mollebaya", "Paucarpata", "Pocsi", "Polobaya", "Quequeña", "Sabandía", "Sachaca", "Socabaya", "Tiabaya", "Uchumayo", "Vitor", "Yanahuara", "Yarabamba", "Yura"],
            "Islay": ["Cocachacra", "Dean Valdivia", "Islay", "Mejia", "Mollendo", "Punta de Bombón"],
            // No need to list Joya, Pedregal, Camaná here as they have fixed districts
        };

        citySelect.addEventListener('change', function() {
            const selectedCity = this.value;
            districtSelect.innerHTML = ''; // Clear current options

            if (selectedCity === "Joya") {
                addOption(districtSelect, "El cruce", "El cruce");
                districtSelect.disabled = true;
                districtSelect.value = "El cruce";
            } else if (selectedCity === "Pedregal") {
                addOption(districtSelect, "Pedregal", "Pedregal");
                districtSelect.disabled = true;
                districtSelect.value = "Pedregal";
            } else if (selectedCity === "Camaná") {
                addOption(districtSelect, "Camaná", "Camaná");
                districtSelect.disabled = true;
                districtSelect.value = "Camaná";
            } else if (districtMap[selectedCity]) {
                districtSelect.disabled = false;
                addOption(districtSelect, "Seleccione un distrito", "");
                districtMap[selectedCity].forEach(district => {
                    addOption(districtSelect, district, district);
                });
            } else {
                addOption(districtSelect, "Seleccione una ciudad primero", "");
                districtSelect.disabled = true;
            }
        });

        function addOption(selectElement, text, value) {
            const option = document.createElement('option');
            option.textContent = text;
            option.value = value;
            selectElement.appendChild(option);
        }
    }

    

    // --- Search Form Handling for all pages ---
    // This function will handle search submissions from any header search bar
    function handleHeaderSearch(event) {
        event.preventDefault();
        const searchInput = event.target.querySelector('.search-input-header');
        if (searchInput) {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                // Redirect to products.html with the search query
                window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
            } else {
                // Optionally, if search term is empty, just go to products page without search
                window.location.href = 'products.html';
            }
        }
    }

    // Attach event listener to all header search forms
    const headerSearchForms = document.querySelectorAll('.search-form-header');
    headerSearchForms.forEach(form => {
        form.addEventListener('submit', handleHeaderSearch);
    });
});

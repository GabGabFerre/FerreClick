document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('reclamaciones-form');
    const confirmationDiv = document.getElementById('reclamacion-confirmacion');

    if (!form) {
        console.error("El formulario 'reclamaciones-form' no fue encontrado.");
        return;
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        console.log("Formulario enviado. Generando enlace de WhatsApp...");

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.textContent = 'Generando...';
        submitButton.disabled = true;

        // --- Recopilar datos del formulario ---
        const nombre = document.getElementById('reclamante-nombre').value;
        const documento = document.getElementById('reclamante-documento').value;
        const domicilio = document.getElementById('reclamante-domicilio').value;
        const telefono = document.getElementById('reclamante-telefono').value;
        const email = document.getElementById('reclamante-email').value;

        const bienTipo = document.getElementById('bien-tipo').value;
        const bienMonto = document.getElementById('bien-monto').value;
        const bienDescripcion = document.getElementById('bien-descripcion').value;

        const reclamoTipo = document.getElementById('reclamo-tipo').value;
        const reclamoDetalle = document.getElementById('reclamo-detalle').value;
        const reclamoPedido = document.getElementById('reclamo-pedido').value;

        // --- Formatear el mensaje para WhatsApp ---
        let message = `*NUEVO RECLAMO/QUEJA*

*1. Identificación del Consumidor*
- *Nombres y Apellidos:* ${nombre}
- *DNI/CE:* ${documento}
- *Domicilio:* ${domicilio}
- *Teléfono:* ${telefono}
- *Correo Electrónico:* ${email}

*2. Identificación del Bien Contratado*
- *Tipo:* ${bienTipo}
- *Monto Reclamado (S/.):* ${bienMonto || 'No especificado'}
- *Descripción:* ${bienDescripcion || 'No especificado'}

*3. Detalle de la Reclamación*
- *Tipo de Reclamación:* ${reclamoTipo}
- *Detalle:*
${reclamoDetalle}
- *Pedido del Consumidor:*
${reclamoPedido}
`;

        // --- Construir y abrir el enlace de WhatsApp ---
        const phoneNumber = '51963967613';
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

        // Abrir WhatsApp en una nueva pestaña
        window.open(whatsappUrl, '_blank');

        // Mostrar confirmación en la página
        form.style.display = 'none';
        const confirmationTitle = confirmationDiv.querySelector('h3');
        if (confirmationTitle) {
            confirmationTitle.textContent = 'Redirigiendo a WhatsApp...';
        }
        const confirmationParagraph = confirmationDiv.querySelector('p');
        if(confirmationParagraph) {
            confirmationParagraph.textContent = 'Se ha abierto una nueva pestaña para enviar su reclamo por WhatsApp. Por favor, confirme el envío en la aplicación.'
        }
        confirmationDiv.style.display = 'block';

        // Restaurar el botón por si el usuario vuelve
        setTimeout(() => {
            submitButton.textContent = 'Enviar Reclamo';
            submitButton.disabled = false;
        }, 3000);
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const exportButton = document.getElementById('export-pdf-btn');
    const whatsappButton = document.getElementById('send-whatsapp-btn');

    if (exportButton) {
        exportButton.addEventListener('click', function () {
            generateAndDownloadPDF();
        });
    }

    if (whatsappButton) {
        whatsappButton.addEventListener('click', function () {
            enviarPorWhatsApp();
        });
    }

    function enviarPorWhatsApp() {
        console.log("Preparando mensaje para WhatsApp...");
        whatsappButton.textContent = 'Abriendo WhatsApp...';
        whatsappButton.disabled = true;

        const shippingInfo = JSON.parse(localStorage.getItem('quoteShippingInfo')) || {};
        const quoteItems = JSON.parse(localStorage.getItem('shoppingQuote')) || [];

        const productosTexto = quoteItems.map(item => `- ${item.quantity}x ${item.name}`).join('\n');
        const totalReferencial = quoteItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

        let mensaje = `¡Hola! 👋\n\nQuisiera solicitar una cotización para los siguientes productos:\n\n*Ferretería:* ${shippingInfo.ferreteriaName}\n*Contacto:* ${shippingInfo.contactName}\n*Dirección de Entrega:* ${shippingInfo.address}, ${shippingInfo.district}, ${shippingInfo.city}\n\n*Productos:*\n${productosTexto}\n\n*Total Referencial:* S/${totalReferencial}\n\n${shippingInfo.comments ? `*Comentarios Adicionales:*\n${shippingInfo.comments}` : ''}\n\n¡Gracias!`;

        const numeroWhatsApp = '51963967613';
        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

        window.open(url, '_blank');

        setTimeout(() => {
            console.log('Limpiando cotización y redirigiendo...');
            localStorage.removeItem('quoteShippingInfo');
            localStorage.removeItem('shoppingQuote');
            window.location.href = 'index.html';
        }, 2500);
    }

    function generateAndDownloadPDF() {
        const { jsPDF } = window.jspdf;
        // PDF setup for A4 landscape, units in mm
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        const shippingInfo = JSON.parse(localStorage.getItem('quoteShippingInfo')) || {};
        const quoteItems = JSON.parse(localStorage.getItem('shoppingQuote')) || [];

        let yPosition = 20;
        const lineSpacing = 7;
        const sectionSpacing = 10;

        // Date and Time of Export
        const now = new Date();
        const formattedDateTime = `${now.toLocaleDateString('es-PE')} ${now.toLocaleTimeString('es-PE')}`;
        doc.setFontSize(9);
        doc.setTextColor(100); // Darker gray for date/time
        doc.text(`Generado: ${formattedDateTime}`, 105, yPosition, { align: "center" });
        yPosition += lineSpacing * 1.5;


        // Document Title
        doc.setFontSize(18);
        doc.setTextColor(0,0,0); // Black for title
        doc.text("Solicitud de Cotización", 105, yPosition, { align: "center" });
        yPosition += sectionSpacing * 1.5;

        // Shipping Information
        // doc.setFontSize(14); // Heading removed
        // doc.text("Información de Envío y Contacto:", 14, yPosition); // Heading removed
        // yPosition += lineSpacing; // Spacing for heading removed
        doc.setFontSize(10);
        doc.setTextColor(0,0,0); // Ensure text color is black for this section
        doc.text(`Ferretería: ${shippingInfo.ferreteriaName || 'N/A'}`, 14, yPosition);
        yPosition += lineSpacing;
        doc.text(`Nombre Contacto: ${shippingInfo.contactName || 'N/A'}`, 14, yPosition);
        yPosition += lineSpacing;

        const fullAddress = `Dirección Completa: ${shippingInfo.address || 'N/A'} - ${shippingInfo.city || 'N/A'} - ${shippingInfo.district || 'N/A'}`;
        doc.text(fullAddress, 14, yPosition);
        yPosition += lineSpacing;

        doc.text(`Correo Electrónico: ${shippingInfo.email || 'N/A'}`, 14, yPosition);
        yPosition += lineSpacing;
        if (shippingInfo.comments && shippingInfo.comments.trim() !== "") {
            doc.text(`Comentarios Adicionales: ${shippingInfo.comments}`, 14, yPosition);
            yPosition += lineSpacing;
        }
        yPosition += sectionSpacing;

        // Items Table
        if (quoteItems.length > 0) {
            doc.setFontSize(14);
            doc.text("Productos a Cotizar:", 14, yPosition);
            yPosition += lineSpacing;

            const tableColumn = ["Producto", "Cantidad", "Precio Unit. (Ref.)", "Subtotal (Ref.)"];
            const tableRows = [];

            let totalQuoteAmount = 0;

            quoteItems.forEach(item => {
                const itemSubtotal = item.price * item.quantity;
                const productData = [
                    item.name,
                    item.quantity,
                    `S/${item.price.toFixed(2)}`,
                    `S/${itemSubtotal.toFixed(2)}`
                ];
                tableRows.push(productData);
                totalQuoteAmount += itemSubtotal;
            });

            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: yPosition,
                theme: 'striped', // or 'grid', 'plain'
                headStyles: { fillColor: [40, 167, 69] }, // Green header like primary color
                margin: { top: yPosition }
            });

            yPosition = doc.lastAutoTable.finalY + sectionSpacing;

            // Relocated Footer Notes (now above Total)
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text("Esta cotización fue generada a través del sitio web oficial de FerreClick. Todos los derechos reservados.", 14, yPosition);
            yPosition += lineSpacing - 2;
            doc.text("Este documento es una solicitud de cotización y no representa un compromiso de compra.", 14, yPosition);
            yPosition += lineSpacing - 2;
            doc.text("Los precios son referenciales y están sujetos a confirmación según stock.", 14, yPosition);
            yPosition += sectionSpacing;


            // Total
            doc.setFontSize(12);
            doc.setTextColor(0,0,0); // Black for Total
            doc.text(`Total Referencial de la Cotización: S/${totalQuoteAmount.toFixed(2)}`, 14, yPosition);
            yPosition += sectionSpacing;
        } else {
            doc.setFontSize(10);
            doc.text("No hay productos en la solicitud de cotización.", 14, yPosition);
            yPosition += sectionSpacing;
        }

        // Watermark removed as per new instruction in this plan step.
        // const totalPages = doc.internal.getNumberOfPages();
        // for (let i = 1; i <= totalPages; i++) {
        //     doc.setPage(i);
        //     doc.saveGraphicsState();
        //     doc.setGState(new doc.GState({opacity: 0.15}));
        //     doc.setFontSize(50);
        //     doc.setTextColor(150, 150, 150);
        //     const text = "FerreClick";
        //     const pageWidth = doc.internal.pageSize.getWidth();
        //     const pageHeight = doc.internal.pageSize.getHeight();
        //     doc.text(text, pageWidth / 2, pageHeight / 2, {
        //         angle: -45,
        //         align: 'center',
        //         baseline: 'middle'
        //     });
        //     doc.restoreGraphicsState();
        // }

        doc.save('cotizacion-ferreteria.pdf');

        // Optionally clear data after export
        // localStorage.removeItem('quoteShippingInfo');
        // localStorage.removeItem('shoppingQuote');
        // if (typeof updateQuoteDisplay === "function") { // Assuming updateQuoteDisplay is global or accessible
        //     updateQuoteDisplay(); // To update icon count in header
        // }
        // alert("Cotización exportada. La información de la cotización ha sido limpiada.");
        // window.location.href = 'index.html';
    }

    // Update quote icon count in header on this page as well
    if (typeof updateQuoteDisplay === "function") {
        updateQuoteDisplay();
    }

    // This function will render one copy of the quote within a specific column
    function renderSingleQuoteContent(doc, startX, startY, columnWidth, columnHeight) {
        const shippingInfo = JSON.parse(localStorage.getItem('quoteShippingInfo')) || {};
        const quoteItems = JSON.parse(localStorage.getItem('shoppingQuote')) || [];

        let yPos = startY;
        const lineSpacing = 5;
        const sectionSpacing = 6;
        // leftMargin for text within the column is now startX itself, or startX + a small internal padding
        const internalPadding = 5;
        const textStartX = startX + internalPadding;
        const textColumnWidth = columnWidth - (internalPadding * 2);
        const centerOfColumn = startX + (columnWidth / 2);

        // Date and Time of Export
        const now = new Date();
        const formattedDateTime = `${now.toLocaleDateString('es-PE')} ${now.toLocaleTimeString('es-PE')}`;
        doc.setFontSize(7);
        doc.setTextColor(100);
        doc.text(`Generado: ${formattedDateTime}`, centerOfColumn, yPos, { align: "center" });
        yPos += lineSpacing * 1.5;

        // Document Title
        doc.setFontSize(12);
        doc.setTextColor(0,0,0);
        doc.text("Solicitud de Cotización", centerOfColumn, yPos, { align: "center" });
        yPos += sectionSpacing * 1.5;

        // Shipping Information
        doc.setFontSize(8);
        doc.text(`Ferretería: ${shippingInfo.ferreteriaName || 'N/A'}`, textStartX, yPos);
        yPos += lineSpacing;
        doc.text(`Nombre Contacto: ${shippingInfo.contactName || 'N/A'}`, textStartX, yPos);
        yPos += lineSpacing;

        const fullAddress = `Dirección Completa: ${shippingInfo.address || 'N/A'} - ${shippingInfo.city || 'N/A'} - ${shippingInfo.district || 'N/A'}`;
        const addressLines = doc.splitTextToSize(fullAddress, textColumnWidth);
        doc.text(addressLines, textStartX, yPos);
        yPos += (addressLines.length * lineSpacing * 0.85); // Adjust for wrapped lines

        doc.text(`Correo Electrónico: ${shippingInfo.email || 'N/A'}`, textStartX, yPos);
        yPos += lineSpacing;

        if (shippingInfo.comments && shippingInfo.comments.trim() !== "") {
            const commentLines = doc.splitTextToSize(`Comentarios Adicionales: ${shippingInfo.comments}`, textColumnWidth);
            doc.text(commentLines, textStartX, yPos);
            yPos += (commentLines.length * (lineSpacing * 0.85));
        }
        yPos += sectionSpacing;

        // Items Table
        if (quoteItems.length > 0) {
            doc.setFontSize(9);
            doc.text("Productos a Cotizar:", textStartX, yPos);
            yPos += lineSpacing;

            const tableColumn = ["Producto", "Cant.", "P.Unit(Ref)", "Subtotal(Ref)"];
            const tableRows = [];
            let totalQuoteAmount = 0;

            quoteItems.forEach(item => {
                const itemSubtotal = item.price * item.quantity;
                const productData = [
                    item.name,
                    item.quantity.toString(),
                    `S/${item.price.toFixed(2)}`,
                    `S/${itemSubtotal.toFixed(2)}`
                ];
                tableRows.push(productData);
                totalQuoteAmount += itemSubtotal;
            });

            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: yPos,
                theme: 'striped',
                headStyles: { fillColor: [40, 167, 69], fontSize: 7 },
                bodyStyles: { fontSize: 7 },
                columnStyles: { // Percentages relative to table width, which is constrained by margins
                    0: { cellWidth: textColumnWidth * 0.40 },
                    1: { cellWidth: textColumnWidth * 0.15, halign: 'right' },
                    2: { cellWidth: textColumnWidth * 0.20, halign: 'right' },
                    3: { cellWidth: textColumnWidth * 0.25, halign: 'right' }
                },
                margin: { left: textStartX, right: doc.internal.pageSize.getWidth() - (textStartX + textColumnWidth) }, // Ensure table respects column bounds
                tableWidth: 'wrap' // Let autoTable determine width based on columns, constrained by margins
            });
            yPos = doc.lastAutoTable.finalY + sectionSpacing / 2;
            if (yPos > startY + columnHeight - 25) { // Check if footer notes will fit
                // If not, this implies content is too long for one half.
                // For this iteration, we'll let it overflow or be cut by the next render.
                // console.warn("Content may be too long for one column half.");
            }


            // Relocated Footer Notes
            doc.setFontSize(7);
            doc.setTextColor(100);
            const footerNote1 = "Esta cotización fue generada a través del sitio web oficial de FerreClick. Todos los derechos reservados.";
            const footerNote2 = "Este documento es una solicitud de cotización y no representa un compromiso de compra.";
            const footerNote3 = "Los precios son referenciales y están sujetos a confirmación según stock.";

            // Wrap footer notes
            const note1Lines = doc.splitTextToSize(footerNote1, textColumnWidth);
            doc.text(note1Lines, textStartX, yPos);
            yPos += (note1Lines.length * (lineSpacing * 0.7));

            const note2Lines = doc.splitTextToSize(footerNote2, textColumnWidth);
            doc.text(note2Lines, textStartX, yPos);
            yPos += (note2Lines.length * (lineSpacing * 0.7));

            const note3Lines = doc.splitTextToSize(footerNote3, textColumnWidth);
            doc.text(note3Lines, textStartX, yPos);
            yPos += (note3Lines.length * (lineSpacing * 0.7)) + sectionSpacing / 2;


            // Total
            doc.setFontSize(9);
            doc.setTextColor(0,0,0);
            doc.text(`Total Referencial de la Cotización: S/${totalQuoteAmount.toFixed(2)}`, textStartX, yPos);
        } else {
            doc.setFontSize(8);
            doc.text("No hay productos en la solicitud de cotización.", textStartX, yPos);
        }
    }

    // Modified generateAndDownloadPDF to call renderSingleQuoteContent twice for side-by-side
    function generateAndDownloadPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        const pageMargin = 10;
        const columnGap = 5; // Small gap between the two columns

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        const contentColumnWidth = (pageWidth - (pageMargin * 2) - columnGap) / 2;
        const contentColumnHeight = pageHeight - (pageMargin * 2);

        // Render first copy in the left half
        renderSingleQuoteContent(doc, pageMargin, pageMargin, contentColumnWidth, contentColumnHeight);

        // Render second copy in the right half
        const startXRightCopy = pageMargin + contentColumnWidth + columnGap;
        renderSingleQuoteContent(doc, startXRightCopy, pageMargin, contentColumnWidth, contentColumnHeight);

        doc.save('cotizacion-ferreteria-lado-a-lado.pdf');
    }
});

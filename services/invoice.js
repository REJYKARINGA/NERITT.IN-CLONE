const easyinvoice = require('easyinvoice');

async function generateInvoice(order) {
    try {
        // Extract information from the order object to populate the invoice data dynamically
        const data = {
            "images": {
                "logo": "https://public.easyinvoice.cloud/img/logo_en_original.png",
                "background": "https://public.easyinvoice.cloud/img/watermark-draft.jpg"
            },
            "sender": {
                "company": "Sample Corp",
                "address": "Sample Street 123",
                "zip": "1234 AB",
                "city": "Sampletown",
                "country": "Samplecountry"
            },
            "client": {
                "company": order.billingDetails.fatherName, // Example: Use father's name as the client company
                "address": order.billingDetails.address,
                "zip": order.billingDetails.pincode,
                "city": order.billingDetails.district,
                "country": "India" // Assuming the country is fixed for all clients
            },
            "information": {
                "number": order.orderId,
                "date": order.createdAt.toDateString(), // Convert order creation date to a readable format
                "due-date": "15.1.2022" // Example: Due date can be a fixed value or calculated dynamically
            },
            "products": order.products.map(product => ({
                "quantity": product.quantity.toString(),
                "description": product.name,
                "tax-rate": 6, // Example: Tax rate can be a fixed value or retrieved from the product
                "price": product.price
            })),
            "bottom-notice": "Kindly pay your invoice within 15 days.",
            "settings": {
                "currency": "USD",
                "tax-notation": "vat",
                "margin-top": 25,
                "margin-right": 25,
                "margin-left": 25,
                "margin-bottom": 25
            }
        };
        
        // Generate invoice
        const result = await easyinvoice.createInvoice(data);
        return result.pdf;
    } catch (error) {
        console.error("Error generating invoice:", error);
        throw error;
    }
}

module.exports = { generateInvoice };

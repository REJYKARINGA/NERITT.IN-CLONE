const fs = require('fs');
const pdf = require('pdf-creator-node');
const path = require('path');

const Order = require('../../model/orderSchema');

const easyinvoice = require('easyinvoice');

const generateInvoice = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId).populate('products.product');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        const senderCompany = {
            name: "Marketing Office",
            companyName: "M/S. AKRA SOLUTIONS",
            address: "Kadampuzha PO 676553",
            district: "Malappuram District",
            state: "Kerala",
            country: "India",
            phone1: "+91 755 900 00 05",
            phone2: "+91 95398 00035",
            email: "info@neritt.in"
        };

        const data = {
            sender: {
                company: senderCompany.companyName,
                address: `${senderCompany.address}, ${senderCompany.district}`,
                city: senderCompany.state,
                country: senderCompany.country,
                zip: "676553",
                phone: senderCompany.phone1,
                email: senderCompany.email,
                logo: "https://neritt.in/assets/user/images/assets/logo.png"
            },
            client: {
                company: order.billingDetails.studentName,
                address: `${order.billingDetails.address}, ${order.billingDetails.landmark}, ${order.billingDetails.district}, Pincode: ${order.billingDetails.pincode}`  // Assuming address is the shipping address
            },
            information: {

                date: order.createdAt.toLocaleDateString(),
            },
            products: order.products.map((product, index) => ({
                slNo: index + 1,
                quantity: product.quantity,
                description: product.name,
                price: product.price,
                image: product.image
            })),
            bottomNotice: "Kindly pay your invoice within 15 days."
        };

        easyinvoice.createInvoice(data, function (result) {
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="invoice.pdf"'
            });
            res.send(Buffer.from(result.pdf, 'base64'));
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    generateInvoice
}
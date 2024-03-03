require('express')

const fs = require('fs')

const Coupon = require('../../model/couponSchema');


const getAllCoupons = async (req, res) => {
    try {
        if (!req.session.admin) {
            console.log('Unauthorized. Please log in.');
            return res.redirect('/admin');
        }

        // Fetch all coupons from the database
        const coupons = await Coupon.find();

        res.render('admin/couponManagement', { coupons }); // Pass coupons to the EJS template
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).send('Internal server error');
    }
};

const storeCoupon = async (req, res) => {
    try {

        if (!req.session.admin) {
            console.log('Unauthorized. Please log in.');
            return res.redirect('/admin');
        }

        // Extract coupon data from request body
        // const { code, description, discountType, discountValue, minimumAmount, startDate, endDate, maxUses, isActive } = req.body;
console.log(req.body,"req.body")
const { code, description, discountType, discountValue, minimumAmount, startDate, endDate, maxUses, isActive } = req.body;

// Create a new Coupon instance
const newCoupon = new Coupon({
    code,
    description,
    discountType,
    discountValue,
    minimumAmount,
    startDate,
    endDate,
    maxUses,
    isActive
});

// Save the new coupon to the database
const savedCoupon = await newCoupon.save();
console.log('Coupon saved successfully!');
        res.redirect('/admin/coupons');
    } catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const deleteCoupon = async (req, res) => {
    try {
        if (!req.session.admin) {
            console.log('Unauthorized. Please log in.');
            return res.redirect('/admin');
        }
        // Check if the request contains the coupon ID
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'Coupon ID is missing' });
        }

        // Find the coupon by ID and delete it from the database
        const deletedCoupon = await Coupon.findByIdAndDelete(id);
        if (!deletedCoupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        // Respond with a success message
        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const editCoupon = async (req, res) => {
    try {

        if (!req.session.admin) {
            console.log('Unauthorized. Please log in.');
            return res.redirect('/admin');
        }

        // Retrieve the coupon ID from the request parameters
        const { id } = req.params;

        // Find the coupon in the database by its ID
        const coupon = await Coupon.findById(id);

        if (!coupon) {
            // If the coupon is not found, return a 404 Not Found error
            return res.status(404).send('Coupon not found');
        }

        // Render the edit coupon form template with the retrieved coupon data
        res.render('admin/couponEdit', { coupon });
    } catch (error) {
        // If an error occurs, log the error and send a 500 Internal Server Error response
        console.error('Error fetching coupon for editing:', error);
        res.status(500).send('Internal server error');
    }
};

const updateCoupon = async (req, res) => {
    try {
        if (!req.session.admin) {
            console.log('Unauthorized. Please log in.');
            return res.redirect('/admin');
        }

        // Extract coupon data from the request body
        const { code, discountType, discountValue, minimumAmount, startDate, endDate, maxUses, isActive } = req.body;

        // Find the coupon by ID
        const id = req.params.id;
        const coupon = await Coupon.findById(id);

        // Update the coupon with the new data
        coupon.code = code;
        coupon.discountType = discountType;
        coupon.discountValue = discountValue;
        coupon.minimumAmount = minimumAmount;
        coupon.startDate = startDate;
        coupon.endDate = endDate;
        coupon.maxUses = maxUses;
        coupon.isActive = isActive;

        // Save the updated coupon
        const updatedCoupon = await coupon.save();

        // Redirect to a success page or return a success response
        res.redirect('/admin/coupons');
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).send('Internal server error');
    }
};


module.exports = {
    getAllCoupons,
    storeCoupon,
    editCoupon,
    updateCoupon,
    deleteCoupon
    
  }
 
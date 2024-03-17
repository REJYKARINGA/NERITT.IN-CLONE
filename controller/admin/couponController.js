require('express')

const fs = require('fs')

const Coupon = require('../../model/couponSchema');



const getAllCoupons = async (req, res, next) => {
    try {
        if (!req.session.admin) {
            return res.redirect('/admin');
        }

        const pageSize = 10;

        const currentPage = parseInt(req.query.page) || 1;

        const offset = (currentPage - 1) * pageSize;

        const coupons = await Coupon.find()
            .skip(offset)
            .limit(pageSize)
            .sort({ createdAt: -1 });

        const totalCoupons = await Coupon.countDocuments();

        const totalPages = Math.ceil(totalCoupons / pageSize);

        res.render('admin/couponManagement', {
            coupons,
            currentPage,
            totalPages
        });
    } catch (error) {

        return next(error);
    }
};


const storeCoupon = async (req, res, next) => {
    try {

        if (!req.session.admin) {
            return res.redirect('/admin');
        }

        const { code, description, discountType, discountValue, minimumAmount, startDate, endDate, maxUses, isActive } = req.body;

        let processedDiscountValue = discountValue;
        if (discountType === 'percentage') {
            if (discountValue < 0) {
                processedDiscountValue = 10;
            } else if (discountValue > 100) {
                processedDiscountValue = Math.min(100, parseFloat(parseFloat(discountValue).toFixed(2)));
            }
        } else if (discountType === 'fixedAmount') {
            if (discountValue < 10) {
                processedDiscountValue = 10;
            } else if (discountValue > 1000) {
                processedDiscountValue = 1000;
            }
        }


        const newCoupon = new Coupon({
            code,
            description,
            discountType,
            discountValue: processedDiscountValue,
            minimumAmount,
            startDate,
            endDate,
            maxUses,
            isActive
        });

        const savedCoupon = await newCoupon.save();
        res.redirect('/admin/coupons');
    } catch (error) {
        return next(error);
    }
};


const deleteCoupon = async (req, res, next) => {
    try {
        if (!req.session.admin) {
            return res.redirect('/admin');
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'Coupon ID is missing' });
        }

        const deletedCoupon = await Coupon.findByIdAndDelete(id);
        if (!deletedCoupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        return next(error);
    }
};

const editCoupon = async (req, res, next) => {
    try {

        if (!req.session.admin) {

            return res.redirect('/admin');
        }

        const { id } = req.params;
        const coupon = await Coupon.findById(id);

        if (!coupon) {
            return res.status(404).send('Coupon not found');
        }
        res.render('admin/couponEdit', { coupon });
    } catch (error) {
        return next(error);
    }
};

const updateCoupon = async (req, res, next) => {
    try {
        if (!req.session.admin) {
            return res.redirect('/admin');
        }
        const { code, discountType, discountValue, minimumAmount, startDate, endDate, maxUses, isActive } = req.body;

        const id = req.params.id;
        const coupon = await Coupon.findById(id);

        let processedDiscountValue = discountValue;
        if (discountType === 'percentage') {
            if (discountValue < 0) {
                processedDiscountValue = 10;
            } else if (discountValue > 100) {
                processedDiscountValue = Math.min(100, parseFloat(parseFloat(discountValue).toFixed(2)));
            }
        } else if (discountType === 'fixedAmount') {
            if (discountValue < 10) {
                processedDiscountValue = 10;
            } else if (discountValue > 1000) {
                processedDiscountValue = 1000;
            }
        }
        coupon.code = code;
        coupon.discountType = discountType;
        coupon.discountValue = processedDiscountValue;
        coupon.minimumAmount = minimumAmount;
        coupon.startDate = startDate;
        coupon.endDate = endDate;
        coupon.maxUses = maxUses;
        coupon.isActive = isActive;

        await coupon.save();
        res.redirect('/admin/coupons');
    } catch (error) {
        return next(error);
    }
};


module.exports = {
    getAllCoupons,
    storeCoupon,
    editCoupon,
    updateCoupon,
    deleteCoupon

}

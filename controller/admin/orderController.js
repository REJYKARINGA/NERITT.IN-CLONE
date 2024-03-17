require('express')

const Product = require('../../model/productSchema');
const Order = require('../../model/orderSchema');
const Wallet = require('../../model/walletSchema');

const displayOrders = async (req, res, next) => {
  try {
    if (!req.session.admin) {
      return res.redirect('/admin');
    }

    const pageSize = 10;
    const currentPage = parseInt(req.query.page) || 1;
    const skip = (currentPage - 1) * pageSize;

    const orders = await Order.find()
      .populate('user')
      .populate('products.product')
      .populate('address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / pageSize);

    res.render('admin/orders', { orders, currentPage, totalPages });
  } catch (error) {
    return next(error);
  }
};


const getOrderDetailsById = async (req, res, next) => {
  try {
    if (!req.session.admin) {
      return res.redirect('/admin');
    }

    const { orderId, productId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found in the order' });
    }

    res.render('admin/orderDetails', { order, product });
  } catch (error) {
    return next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.status !== status) {
      await Order.findByIdAndUpdate(orderId, { status });
      if (status === 'cancelled' || status === 'cancelledByAdmin' || status === 'Returned') {
        for (const product of order.products) {
          const productId = product.product;
          const productQuantity = product.quantity;

          await Product.findByIdAndUpdate(
            productId,
            { $inc: { quantity: productQuantity } },
            { new: true }
          );
        }
      } else if (order.status !== 'cancelledByAdmin' || order.status !== 'Returned') {
      } else {
        for (const product of order.products) {
          await Product.findByIdAndUpdate(
            product.product._id,
            { $inc: { quantity: -product.quantity } },
            { new: true }
          );
        }
      }
    }

    res.redirect(`/admin/orders`);
  } catch (error) {
    return next(error);
  }
};


const displayPendingOrders = async (req, res, next) => {
  try {
    if (!req.session.admin) {
      return res.redirect('/admin');
    }

    const page = parseInt(req.query.page) || 1;
    const perPage = 2;
    const skip = (page - 1) * perPage;

    const ordersPromise = Order.find({ status: 'pending' })
      .populate('user')
      .populate('products.product')
      .populate('address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage);
    const countPromise = Order.countDocuments({ status: 'pending' });

    const [orders, totalCount] = await Promise.all([ordersPromise, countPromise]);

    const totalPages = Math.ceil(totalCount / perPage);

    res.render('admin/orderPending', { orders, totalPages, currentPage: page });
  } catch (error) {
    return next(error);
  }
};


const displayCancelledOrders = async (req, res, next) => {
  try {
    if (!req.session.admin) {
      return res.redirect('/admin');
    }


    const orders = await Order.find({ status: { $in: ['cancelled', 'cancelledByAdmin', 'Return requested', 'Returned'] } })
      .populate('user')
      .populate('products.product')
      .populate('address')
      .sort({ createdAt: -1 });
    res.render('admin/ordersCancelled', { orders });
  } catch (error) {
    return next(error);
  }
};






module.exports = {
  displayOrders,
  getOrderDetailsById,
  updateOrderStatus,
  displayPendingOrders,
  displayCancelledOrders



}
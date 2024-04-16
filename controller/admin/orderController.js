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

      console.log(orders, 'orders founded')
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

    const orderId = req.params.orderId;
    const productId = req.params.productId;

    const order = await Order.findById(orderId)
      .populate('user')
      .populate('products.product')
      .populate('address');

    if (!order) {
      return res.status(404).send('Order not found');
    }

    // Find the specific product within the order
    const product = order.products.find(prod => prod.product._id.toString() === productId);
console.log(product.status,'product founded')
const products = await Product.findById(productId);

    if (!product) {
      return res.status(404).send('Product not found in the order');
    }
    res.render('admin/orderDetails', { order, product, products });
  } catch (error) {
    return next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    if (!req.session.admin) {
      return res.redirect('/admin');
    }

    const orderId = req.params.orderId;
    const productId = req.params.productId;
    const newStatus = req.body.status; // Assuming the status is sent in the request body
    const allowedStatus = ['pending', 'Accepted', 'shipped', 'completed', 'Returned', 'Return requested', 'Return Rejected', 'cancelled', 'cancelledByAdmin', 'Failed'];

    if (!allowedStatus.includes(newStatus)) {
      return res.status(400).send('Invalid status value');
    }

    const order = await Order.findById(orderId);
console.log(order.user,'order user id founded')
    if (!order) {
      return res.status(404).send('Order not found');
    }

    const product = order.products.find(prod => prod.product.toString() === productId);
    const wallet = await Wallet.findOne({ user: order.user });
    if (!product) {
      return res.status(404).send('Product not found in the order');
    }

    if (product.status !== newStatus) {
      // Update the product status within the order
      product.status = newStatus;
      await order.save();

      if (newStatus === 'cancelled' || newStatus === 'cancelledByAdmin' || newStatus === 'Returned') {
        // Increase product quantity if order is cancelled or returned
        await Product.findByIdAndUpdate(
          productId,
          { $inc: { quantity: product.quantity } },
          { new: true }
        );
        
        // Update user's wallet with the total cost of the cancelled/returned product
        const totalCost = product.totalCost * product.quantity; // Assuming totalCost is available in the product
        const user = order.user;
        user.wallet += totalCost;
        await wallet.save();
      }  else if (product.status !== 'cancelledByAdmin' && product.status !== 'Returned') {
        // Decrease product quantity if not cancelled or returned
        await Product.findByIdAndUpdate(
          productId,
          { $inc: { quantity: -product.quantity } },
          { new: true }
        );
      }
    }

    res.redirect(`/admin/order-details/${orderId}/${productId}`);
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

    const ordersPromise =  await Order.aggregate([
      {
        $match: { 'products.status': 'pending' } // Match orders with products having status "pending"
      },
      {
        $project: {
          billingDetails: 1,
          user: 1,
          products: {
            $filter: {
              input: '$products',
              as: 'product',
              cond: { $eq: ['$$product.status', 'pending'] } // Filter products with status "pending"
            }
          },
          totalAmount: 1,
          discountedAmount: 1,
          offeredAmount: 1,
          orderId: 1,
          payment_type: 1,
          createdAt: 1
        }
      }
    ]);
      // .populate('user')
      // .populate('products.product')
      // .populate('address')
      // .sort({ createdAt: -1 })
      // .skip(skip)
      // .limit(perPage);

      console.log(ordersPromise, 'Order promise founded ')
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


    const orders = await await Order.aggregate([
      { $match: { 'products.status': { $in: ['pending', 'cancelled', 'cancelledByAdmin', 'Return requested', 'Returned'] } } },

      {
        $project: {
          billingDetails: 1,
          user: 1,
          products: {
            $filter: {
              input: '$products',
          as: 'product',
          cond: {
            $in: ['$$product.status', [ 'cancelled', 'cancelledByAdmin', 'Return requested', 'Returned']]
          }
        }
      },
          totalAmount: 1,
          discountedAmount: 1,
          offeredAmount: 1,
          orderId: 1,
          payment_type: 1,
          createdAt: 1
        }
      }
    ]);
      // .populate('user')
      // .populate('products.product')
      // .populate('address')
      // .sort({ createdAt: -1 });
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
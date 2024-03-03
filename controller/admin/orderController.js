require('express')

const Product = require('../../model/productSchema');
const Order = require('../../model/orderSchema');
const Wallet = require('../../model/walletSchema');



// Order Management
const displayOrders = async (req, res) => {
  try {
    if (!req.session.admin) {
      console.log('Unauthorized. Please log in.');
      return res.redirect('/admin');
    }

    const pageSize = 2; // Number of orders per page
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

    
    console.log(orders,'displayOrders orders')
    res.render('admin/orders', { orders, currentPage, totalPages });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Internal server error');
  }
};


const getOrderDetailsById = async (req, res) => {
  try {
    if (!req.session.admin) {
      console.log('Unauthorized. Please log in.');
      return res.redirect('/admin');
    }

      const { orderId, productId } = req.params;

      const order = await Order.findById(orderId);
      
      if (!order) {
          return res.status(404).json({ message: 'Order not found' });
      }

      const product = await Product.findById(productId);
      console.log(product,'product')

      if (!product) {
          return res.status(404).json({ message: 'Product not found in the order' });
      }

      res.render('admin/orderDetails',{ order, product });
  } catch (error) {
      console.error('Error fetching order details:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;

    // Find the order by its ID
    const order = await Order.findById(orderId);

    // Check if the order exists
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the new status is different from the current status of the order
    if (order.status !== status) {
      // Update the order status
      await Order.findByIdAndUpdate(orderId, { status });

      // If the order status is 'cancelled' or 'cancelledByAdmin', adjust the product quantities
      if (status === 'cancelled' || status === 'cancelledByAdmin') {
        // Iterate over each product in the cancelled order
        for (const product of order.products) {
          const productId = product.product; // Extract productId from the product
          const productQuantity = product.quantity; // Extract product quantity

          // Find the product by its ID and increment the quantity
          await Product.findByIdAndUpdate(
            productId,
            { $inc: { quantity: productQuantity } },
            { new: true }
          );
        }
      } else if (order.status !== 'cancelledByAdmin') {
        // No need to change quantity if the status changes from 'pending' to other statuses
        // Do nothing
      } else {
        // For other status changes, reduce the product quantity
        for (const product of order.products) {
          await Product.findByIdAndUpdate(
            product.product._id,
            { $inc: { quantity: -product.quantity } },
            { new: true }
          );
        }
      }
    }

    // Redirect to the admin orders page after updating
    res.redirect(`/admin/orders`);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// const displayPendingOrders = async (req, res) => {
//   try {
//     if (!req.session.admin) {
//       console.log('Unauthorized. Please log in.');
//       return res.redirect('/admin');
//     }
 
    
//     const orders = await Order.find({status:'pending'})
//     .populate('user')
//     .populate('products.product')
//     .populate('address')
//     .sort({ createdAt: -1 });

//     res.render('admin/orderPending', { orders });
//   } catch (error) {
//     console.error('Error fetching orders:', error);
//     res.status(500).send('Internal server error');
//   }
// };

const displayPendingOrders = async (req, res) => {
  try {
    if (!req.session.admin) {
      console.log('Unauthorized. Please log in.');
      return res.redirect('/admin');
    }

    const page = parseInt(req.query.page) || 1; // Get the requested page number or default to 1
    const perPage = 2; // Number of orders per page
    const skip = (page - 1) * perPage;

    const ordersPromise = Order.find({ status: 'pending' })
      .populate('user')
      .populate('products.product')
      .populate('address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage);
    
      
      console.log(ordersPromise,'displayPendingOrders orders')
    const countPromise = Order.countDocuments({ status: 'pending' }); // Count total pending orders
    
    const [orders, totalCount] = await Promise.all([ordersPromise, countPromise]);

    const totalPages = Math.ceil(totalCount / perPage); // Calculate total number of pages

    res.render('admin/orderPending', { orders, totalPages, currentPage: page });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Internal server error');
  }
};


const displayCancelledOrders = async (req, res) => {
  try {
    if (!req.session.admin) {
      console.log('Unauthorized. Please log in.');
      return res.redirect('/admin');
    }

    
    const orders = await Order.find({ status: { $in: ['cancelled', 'cancelledByAdmin'] } })
    .populate('user')
    .populate('products.product')
    .populate('address')
    .sort({ createdAt: -1 });

    console.log(orders,'displayCancelledOrders orders')
    res.render('admin/ordersCancelled', { orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Internal server error');
  }
};






module.exports = {
    displayOrders,
    getOrderDetailsById,
    updateOrderStatus,
    displayPendingOrders,
    displayCancelledOrders
    

  
  }
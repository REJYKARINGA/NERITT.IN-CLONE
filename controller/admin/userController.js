require('express')
const excel = require('exceljs');
const PDFDocument = require('pdfkit');
const PDFTable = require('pdfkit-table');
const fs = require('fs');
const path = require('path');
const moment = require('moment')
const os = require('os');
const userCollection = require('../../model/userSchema')
const Order = require('../../model/orderSchema')
const Products = require('../../model/productSchema')
const Users = require('../../model/userSchema')
const salesPdfService = require('../../services/salesReportPdf')

const dashboard = async (req, res, next) => {
  try {
    if (req.session.admin) {
      let orders = await Order.find({ status: { $in: ['shipped', 'completed'] } });
      const { start_date, end_date, filter } = req.query;
      let filteredOrders = orders;

      if (start_date && end_date) {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        filteredOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= startDate && orderDate <= endDate;
        });
      } else if (filter) {
        const currentDate = new Date();
        let startDate, endDate;
        switch (filter) {
          case 'year':
            startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
            endDate = currentDate;
            break;

          case 'month':
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 30);
            endDate = currentDate;
            break;

          case 'weekly':
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7);
            endDate = currentDate;
            break;


          case 'today':
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 0);
            endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
            break;

          default:
            console.log('this is wrong', filter)
            break;
        }
        filteredOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= startDate && orderDate <= endDate;
        });
      }


      const totalSales = filteredOrders.reduce((total, order) => total + order.totalAmount, 0);
      const discount = filteredOrders.reduce((total, order) => total + order.discountedAmount, 0);
      const offered = filteredOrders.reduce((total, order) => total + order.offeredAmount, 0);
      const totalOrdersCount = filteredOrders.length;

      const orderPercentages = [];


      const categoryCounts = {};
      filteredOrders.forEach(order => {
        order.products.forEach(product => {
          const category = product.category;
          if (category) {
            if (!categoryCounts[category]) {
              categoryCounts[category] = 0;
            }
            categoryCounts[category]++;
          }
        });
      });

      const categoryData = Object.keys(categoryCounts).map(category => ({
        category,
        count: categoryCounts[category]
      }));
      const labelDatass = Object.keys(categoryCounts);
      const dataSet = Object.values(categoryCounts);

      const labelDatas = JSON.stringify(labelDatass);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const totalOrders = await Order.find({ createdAt: { $gte: today } });
      let productDetails = {};

      totalOrders.forEach(order => {
        order.products.forEach(product => {
          const { category, quantity } = product;
          if (productDetails.hasOwnProperty(category)) {
            productDetails[category] += quantity;
          } else {
            productDetails[category] = quantity;
          }
        });
      });

      const productDetailsArray = Object.entries(productDetails).map(([category, quantity]) => ({ category, quantity }));

      let label_data = Object.keys(productDetails)
      let data_setss = Object.values(productDetails)
      let data_sets = data_setss



      const newOrdersCount = totalOrders.filter(order => order.createdAt >= today).length;

      orders.forEach(order => {
        const percentage = ((order.totalAmount / totalSales) * 100).toFixed(2);
        orderPercentages.push(percentage);
        order.formattedCreatedAt = new Date(order.createdAt).toLocaleDateString('en-GB');
      });

      const sales = orderPercentages[orderPercentages.length - 1];


      const usersCount = await Users.countDocuments();
      const monthlyRevenueData = {};

      orders.forEach(order => {
        const monthYearKey = `${order.createdAt.getMonth() + 1}-${order.createdAt.getFullYear()}`;
        if (!monthlyRevenueData[monthYearKey]) {
          monthlyRevenueData[monthYearKey] = 0;
        }
        monthlyRevenueData[monthYearKey] += order.totalAmount;
      });

      const revenueLabels = [];
      const revenuedata = [];

      for (const monthYearKey in monthlyRevenueData) {
        const [month, year] = monthYearKey.split('-');
        const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short' });
        const fullMonthYear = `${monthName} ${year}`;
        revenueLabels.push(fullMonthYear);
        revenuedata.push(monthlyRevenueData[monthYearKey]);
      }


      const revenueLabelss = JSON.stringify(revenueLabels);

      res.render('admin/dashboard.ejs', { revenuedata, revenueLabelss, label_data, data_sets, totalSales, totalOrdersCount, sales, newOrdersCount, labelDatas, dataSet, filter, usersCount, discount, offered });
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    return next(error);
  }
};

const users = async (req, res, next) => {
  try {
    if (req.session.admin) {
      const { page } = req.query;
      const pageSize = 10;
      const currentPage = parseInt(page) || 1;
      const skip = (currentPage - 1) * pageSize;

      const admin = await userCollection.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize);

      const totalUsers = await userCollection.countDocuments();

      const totalPages = Math.ceil(totalUsers / pageSize);

      res.render('admin/users', {
        admin,
        currentPage,
        totalPages
      });
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    return next(error);
  }
};


const toggleBlockStatus = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const statusId = req.params.id;
    const user = await userCollection.findById(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }


    user.blocked = !user.blocked;

    await user.save();

    res.redirect('/admin/users');
  } catch (error) {
    return next(error);
  }
};

const salesReport = async (req, res, next) => {
  try {
    if (!req.session.admin) {
      return res.redirect('/admin');
    }

    const currentPage = parseInt(req.query.page) || 1;
    const pageSize = 2;
    const skip = (currentPage - 1) * pageSize;

    const orders = await Order.find({ status: { $in: ['shipped', 'completed'] } })
      .populate('user')
      .populate('products.product')
      .populate('address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const totalOrders = await Order.countDocuments({ status: { $in: ['shipped', 'completed'] } });

    const totalSales = orders.reduce((acc, order) => acc + order.totalAmount, 0);
    const totalPages = Math.ceil(totalOrders / pageSize);
    res.render('admin/salesReport', { orders, totalSales, totalOrders, currentPage, totalPages });

  } catch (error) {
    return next(error);
  }
};

const salesReportDate = async (req, res, next) => {
  try {
    if (!req.session.admin) {
      return res.redirect('/admin');
    }

    const { start_date, end_date, filter } = req.body;

    const currentPage = parseInt(req.query.page) || 1;
    const pageSize = 10;
    const skip = (currentPage - 1) * pageSize;
    const filterQuery = {
      status: { $in: ['shipped', 'completed'] }
    };

    if (start_date && end_date) {
      filterQuery.createdAt = {
        $gte: new Date(start_date + 'T00:00:00.000Z'),
        $lte: new Date(end_date + 'T23:59:59.999Z')
      };
    } else if (filter) {
      const currentDate = new Date();
      let startDate, endDate;
      switch (filter) {
        case 'year':
          startDate = new Date(currentDate.getFullYear() - 1, 0, 1);
          endDate = new Date(currentDate.getFullYear() - 1, 11, 31);
          break;
        case 'month':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0); h
          break;
        case 'weekly':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7);
          endDate = currentDate;
          break;
        case 'today':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
          endDate = currentDate;
          break;
        default:
          console.log('Invalid filter option:', filter);
          break;
      }

      filterQuery.createdAt = {
        $gte: startDate,
        $lte: endDate
      };
    }


    const orders = await Order.find(filterQuery)
      .populate('user')
      .populate('products.product')
      .populate('address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const totalOrders = await Order.countDocuments(filterQuery);
    const totalSales = orders.reduce((acc, order) => acc + order.totalAmount, 0);
    const totalPages = Math.ceil(totalOrders / pageSize);
    res.render('admin/salesReport', { orders, totalSales, totalOrders, currentPage, totalPages });

  } catch (error) {
    return next(error);
  }
};


const salesExport = async (req, res, next) => {
  try {
    const orders = await Order.find().select('orderId billingDetails totalAmount products.name  products.quantity payment_type category createdAt');
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Sales Data');

    worksheet.columns = [
      { header: 'Order ID', key: 'orderId', width: 30 },
      { header: 'Customer Name', key: 'customerName', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Product Name', key: 'productName', width: 40 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Total Amount', key: 'totalAmount', width: 15 },
      { header: 'Payment Type', key: 'paymentType', width: 20 },
      { header: 'Order Date', key: 'orderDate', width: 20 }
    ];

    orders.forEach((order) => {
      order.products.forEach((product) => {
        worksheet.addRow({
          orderId: order.orderId,
          customerName: order.billingDetails.studentName,
          email: order.billingDetails.email,
          phone: order.billingDetails.phone,
          productName: product.name,
          quantity: product.quantity,
          totalAmount: order.totalAmount,
          paymentType: order.payment_type,
          orderDate: order.createdAt.toDateString(),

        });
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="sales-report.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    return next(error);
  }
};


const salesReportPdf = async (req, res, next) => {
  try {
    const data = await Order.find().populate('products.product');

    const stream = res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment;filename=neritt.invoice.pdf',
    });

    const isOrder = [];

    const order = data.map((item) => ({
      orderNumber: item?.orderId,
      date: moment(item?.createdAt).format('DD/MM/YYYY'),
      price: item?.totalAmount,
      status: item?.status,
      street: item?.billingDetails?.address,
      city: item?.billingDetails?.address,
      phoneNumber: item?.billingDetails?.phone,
      zipCode: item?.billingDetails?.pincode,

    }));

    isOrder.push(...order)

    salesPdfService.dailySalesPDF((chunk) => stream.write(chunk),
      () => stream.end(), isOrder)
  } catch (error) {
    return next(error);
  }
}




module.exports = {
  dashboard,
  users,
  toggleBlockStatus
}
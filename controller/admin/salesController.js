require('express')
const excel = require('exceljs');
const PDFDocument = require('pdfkit');
const PDFTable = require('pdfkit-table');
const fs = require('fs');
const path = require('path');
const moment = require('moment')
const os = require('os');
const Order = require('../../model/orderSchema')
const salesPdfService = require('../../services/salesReportPdf')




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
    const { start_date, end_date, filter, filters } = req.query;
    const currentPage = parseInt(req.query.page) || 1;
    const pageSize = 10;
    const skip = (currentPage - 1) * pageSize;

    const filterQuery = {
      status: { $in: ['shipped', 'completed'] }
    };

    if (filter) {

      const currentDate = new Date();
      let startDate, endDate;
      switch (filter) {
        case 'year':
          startDate = new Date(currentDate.getFullYear() - 1, 0, 1);
          endDate = currentDate;
          break;
        case 'month':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
          endDate = currentDate;
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

const sales_ReportDate = async (req, res, next) => {
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

const sales_ReportDates = async (req, res, next) => {
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
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
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

const salesReportPdf = async (req, res, filter, next) => {
  try {
    let filterQuery = {};

    const filters = req.query
    const currentDate = new Date();
    let startDate, endDate;
    switch (filter) {
      case 'year':
        startDate = new Date(currentDate.getFullYear() - 1, 0, 1);
        endDate = currentDate;
        break;
      case 'month':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        endDate = currentDate;
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
        break;
    }
    if (startDate && endDate) {
      filterQuery.createdAt = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const data = await Order.find(filterQuery).populate('products.product');

    const stream = res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment;filename=neritt.invoice.pdf',
    });

    const isOrder = data.map((item) => ({
      orderNumber: item?.orderId,
      date: moment(item?.createdAt).format('DD/MM/YYYY'),
      price: item?.totalAmount,
      status: item?.status,
      street: item?.billingDetails?.address,
      city: item?.billingDetails?.address,
      phoneNumber: item?.billingDetails?.phone,
      zipCode: item?.billingDetails?.pincode,
    }));

    salesPdfService.dailySalesPDF((chunk) => stream.write(chunk),
      () => stream.end(), isOrder);
  } catch (error) {
    return next(error);
  }
}






module.exports = {
  salesReport,
  salesReportDate,
  salesExport,
  salesReportPdf,
  sales_ReportDate
}
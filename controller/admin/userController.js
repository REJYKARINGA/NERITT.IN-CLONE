require('express')
const excel = require('exceljs');
const PDFDocument = require('pdfkit');
const PDFTable = require('pdfkit-table');
const fs = require('fs');
const path = require('path');
const moment=require('moment')
const os = require('os');
const userCollection = require('../../model/userSchema')
const Order = require('../../model/orderSchema')
const Products = require('../../model/productSchema')
const Users = require('../../model/userSchema')
const salesPdfService=require('../../services/salesReportPdf')

// Dashboard and User Management
// const dashboard = async (req, res) => {
//   try {
//     if (req.session.admin) {
//       // Fetch orders with status "shipped" or "completed"
//       let orders = await Order.find({ status: { $in: ['shipped', 'completed'] } });

//       // Apply date filter based on the selected option (Year, Month, Day)
//       const { start_date, end_date, filter } = req.query;
//       let filteredOrders = orders;

//       if (start_date && end_date) {
//         // Parse start_date and end_date to Date objects
//         const startDate = new Date(start_date);
//         const endDate = new Date(end_date);
//         // Filter orders within the date range
//         filteredOrders = orders.filter(order => {
//           const orderDate = new Date(order.createdAt);
//           return orderDate >= startDate && orderDate <= endDate;
//         });
//       } else if (filter) {
//         // Apply filter based on the selected option
//         const currentDate = new Date();
//         let startDate, endDate;
//         switch (filter) {
//           case 'year':
//             startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate()); // Start of today, 1 year ago
//             endDate = currentDate; // End of today

//           console.log(startDate.toDateString(),'startDate', endDate.toDateString(),'endDate');
//             break;

//           case 'month':
//             startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 30); // Start of last 30 days
//             endDate = currentDate; // End of today
//             console.log(startDate.toDateString(),'startDate', endDate.toDateString(),'endDate');
//             break;

//           case 'weekly':
//             startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7); // Start of today, 7 days ago
//             endDate = currentDate; // End of today
//             console.log(startDate, 'startDate', endDate, 'endDate');
//             break;


//             case 'today':
//               startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 0); // Today
//               endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()  +1); // Today
//               console.log(startDate,'startDate', endDate,'endDate')
//               break;

//           default:
//             console.log('this is wrong', filter)
//             break;
//         }
//         // Filter orders within the date range
//         filteredOrders = orders.filter(order => {
//           const orderDate = new Date(order.createdAt);
//           return orderDate >= startDate && orderDate <= endDate;
//         });
//       }

//       // Calculate total sales from the filtered orders
//       const totalSales = filteredOrders.reduce((total, order) => total + order.totalAmount, 0);

//       // Get the total count of orders
//       const totalOrdersCount = filteredOrders.length;

//       // Initialize orderPercentages array
//       const orderPercentages = [];

//       // Aggregate category counts
//       const categoryCounts = await Order.find({category})

//       // Get the count of new orders (created today)
//       const today = new Date();
//       today.setHours(0, 0, 0, 0); // Set time to beginning of the day
//       let totalOrders = await Order.find()
//       const newOrdersCount = totalOrders.filter(order => order.createdAt >= today).length;
// console.log(newOrdersCount,'newOrdersCount')
//       // Calculate and store percentage for each order
//       orders.forEach(order => {
//         const percentage = ((order.totalAmount / totalSales) * 100).toFixed(2);
//         orderPercentages.push(percentage);
//         // Format createdAt date to dd-mm-yyyy
//         order.formattedCreatedAt = new Date(order.createdAt).toLocaleDateString('en-GB');
//       });

//       // Get the last index value of order percentages
//       const sales = orderPercentages[orderPercentages.length - 1];

//       // Extract category names and counts
//       const labelDatas = categoryCounts.map(category => category._id);
//       const dataSet = categoryCounts.map(category => category.count);
// console.log(labelDatas,'labelDatas', dataSet, 'dataSet')
//       const usersCount = await Users.countDocuments();
//       // Render dashboard view with total sales, total orders count, sales percentage, and category counts
//       res.render('admin/dashboard.ejs', { totalSales, totalOrdersCount, sales, newOrdersCount, labelDatas, dataSet, filter, usersCount });
//     } else {
//       res.redirect('/admin');
//     }
//   } catch (error) {
//     console.error('Error loading admin data:', error);
//     res.status(500).send('Internal server error');
//   }
// }; 

// Old
const dashboard = async (req, res) => {
  try {
    if (req.session.admin) {
      // Fetch orders with status "shipped" or "completed"
      let orders = await Order.find({ status: { $in: ['shipped', 'completed'] } });

      // Apply date filter based on the selected option (Year, Month, Day)
      const { start_date, end_date, filter } = req.query;
      let filteredOrders = orders;

      if (start_date && end_date) {
        // Parse start_date and end_date to Date objects
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        // Filter orders within the date range
        filteredOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= startDate && orderDate <= endDate;
        });
      } else if (filter) {
        // Apply filter based on the selected option
        const currentDate = new Date();
        let startDate, endDate;
        switch (filter) {
          case 'year':
            startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate()); // Start of today, 1 year ago
            endDate = currentDate; // End of today

            console.log(startDate.toDateString(), 'startDate', endDate.toDateString(), 'endDate');
            break;

          case 'month':
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 30); // Start of last 30 days
            endDate = currentDate; // End of today
            console.log(startDate.toDateString(), 'startDate', endDate.toDateString(), 'endDate');
            break;

          case 'weekly':
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7); // Start of today, 7 days ago
            endDate = currentDate; // End of today
            console.log(startDate, 'startDate', endDate, 'endDate');
            break;


          case 'today':
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 0); // Today
            endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1); // Today
            console.log(startDate, 'startDate', endDate, 'endDate')
            break;

          default:
            console.log('this is wrong', filter)
            break;
        }
        // Filter orders within the date range
        filteredOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= startDate && orderDate <= endDate;
        });
      }

      // Calculate total sales from the filtered orders
      const totalSales = filteredOrders.reduce((total, order) => total + order.totalAmount, 0);

      // Get the total count of orders
      const totalOrdersCount = filteredOrders.length;

      // Initialize orderPercentages array
      const orderPercentages = [];

      // Aggregate category counts
      const categoryCounts = await Order.aggregate([
        { $match: { status: { $in: ['shipped', 'completed'] } } }, // Match only "shipped" or "completed" orders
        { $unwind: "$products" }, // Unwind the products array
        { $lookup: { from: "productDetails", localField: "products.product", foreignField: "_id", as: "productInfo" } }, // Lookup product details
        { $unwind: "$productInfo" }, // Unwind the productInfo array
        { $lookup: { from: "categoryDetails", localField: "productInfo.category", foreignField: "_id", as: "categoryInfo" } }, // Lookup category details
        { $unwind: "$categoryInfo" }, // Unwind the categoryInfo array
        {
          $group: {
            _id: "$categoryInfo.category_name", // Group by category name
            count: { $sum: 1 } // Count the number of orders in each category
          }
        },
        { $sort: { count: -1 } } // Optional: Sort categories by order count in descending order
      ]);

      // Get the count of new orders (created today)
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set time to beginning of the day
      let totalOrders = await Order.find()
      const newOrdersCount = totalOrders.filter(order => order.createdAt >= today).length;
      console.log(newOrdersCount, 'newOrdersCount')
      // Calculate and store percentage for each order
      orders.forEach(order => {
        const percentage = ((order.totalAmount / totalSales) * 100).toFixed(2);
        orderPercentages.push(percentage);
        // Format createdAt date to dd-mm-yyyy
        order.formattedCreatedAt = new Date(order.createdAt).toLocaleDateString('en-GB');
      });

      // Get the last index value of order percentages
      const sales = orderPercentages[orderPercentages.length - 1];

      // Extract category names and counts
      const labelDatas = categoryCounts.map(category => category._id);
      const dataSet = categoryCounts.map(category => category.count);

      const usersCount = await Users.countDocuments();
      // Render dashboard view with total sales, total orders count, sales percentage, and category counts
      res.render('admin/dashboard.ejs', { totalSales, totalOrdersCount, sales, newOrdersCount, labelDatas, dataSet, filter, usersCount });
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    console.error('Error loading admin data:', error);
    res.status(500).send('Internal server error');
  }
};

const users = async (req, res) => {
  try {
    if (req.session.admin) {
      // Extract query parameters for pagination
      const { page } = req.query;
      const pageSize = 10; // Number of users per page
      const currentPage = parseInt(page) || 1;
      const skip = (currentPage - 1) * pageSize;

      // Fetch users from the database with pagination applied
      const admin = await userCollection.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize);

      // Get the total count of users for pagination
      const totalUsers = await userCollection.countDocuments();

      // Calculate the total number of pages
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
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const toggleBlockStatus = async (req, res) => {
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
    console.error(error);
    res.status(500).send('Error toggling user status: ' + error.message);
  }
};

const salesReport = async (req, res) => {
  try {
    if (!req.session.admin) {
      console.log('Unauthorized. Please log in.');
      return res.redirect('/admin');
    }

    const currentPage = parseInt(req.query.page) || 1; // Current page number, default to 1
    const pageSize = 2; // Number of orders per page
    const skip = (currentPage - 1) * pageSize; // Calculate the number of documents to skip

    const orders = await Order.find({ status: { $in: ['shipped', 'completed'] } })
      .populate('user')
      .populate('products.product')
      .populate('address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const totalOrders = await Order.countDocuments({ status: { $in: ['shipped', 'completed'] } });

    // Calculate total sales revenue
    const totalSales = orders.reduce((acc, order) => acc + order.totalAmount, 0);
    console.log(totalOrders, 'totalOrders', totalSales, 'totalSales got')
    // Calculate total number of pages
    const totalPages = Math.ceil(totalOrders / pageSize);


    // Render the EJS template with orders, total sales revenue, and pagination data
    res.render('admin/salesReport', { orders, totalSales, totalOrders, currentPage, totalPages });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Internal server error');
  }
};

const salesReportDate = async (req, res) => {
  try {
    if (!req.session.admin) {
      console.log('Unauthorized. Please log in.');
      return res.redirect('/admin');
    }

    // Extract start_date, end_date, and filter from request body
    const { start_date, end_date, filter } = req.body;

    // Define pagination parameters
    const currentPage = parseInt(req.query.page) || 1; // Current page number, default to 1
    const pageSize = 10; // Number of orders per page
    const skip = (currentPage - 1) * pageSize; // Calculate the number of documents to skip

    // Define filter object for MongoDB query
    const filterQuery = {
      status: { $in: ['shipped', 'completed'] }
    };

    // Add date range filter if start_date and end_date are provided
    if (start_date && end_date) {
      // Assuming start_date and end_date are in the format 'YYYY-MM-DD'
      filterQuery.createdAt = {
        $gte: new Date(start_date + 'T00:00:00.000Z'), // Start of the day
        $lte: new Date(end_date + 'T23:59:59.999Z') // End of the day
      };
    } else if (filter) {
      // Apply filter based on the selected option
      const currentDate = new Date();
      let startDate, endDate;
      switch (filter) {
        case 'year':
          startDate = new Date(currentDate.getFullYear() - 1, 0, 1); // Start of last year
          endDate = new Date(currentDate.getFullYear() - 1, 11, 31); // End of last year
          break;
        case 'month':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1); // Start of last month
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0); // End of last month
          break;
        case 'weekly':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7); // 7 days ago
          endDate = currentDate; // Today
          break;
        case 'today':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()); // Today
          endDate = currentDate; // Today
          break;
        default:
          console.log('Invalid filter option:', filter);
          break;
      }
      // Add date range filter
      filterQuery.createdAt = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // Fetch orders based on the filter and pagination parameters
    const orders = await Order.find(filterQuery)
      .populate('user')
      .populate('products.product')
      .populate('address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const totalOrders = await Order.countDocuments(filterQuery);

    // Calculate total sales revenue
    const totalSales = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    // Calculate total number of pages
    const totalPages = Math.ceil(totalOrders / pageSize);

    // Render the EJS template with orders, total sales revenue, and pagination data
    res.render('admin/salesReport', { orders, totalSales, totalOrders, currentPage, totalPages });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Internal server error');
  }
};


// Define route handler for Excel export
const salesExport = async (req, res) => {
  try {
    // Fetch sales data from the database (replace with your actual logic to fetch orders)
    const orders = await Order.find().select('orderId billingDetails totalAmount products.name  products.quantity payment_type category createdAt');
    console.log()
    // Create a new Excel workbook
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Sales Data');

    // Define worksheet columns
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

    // Populate worksheet with sales data
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

        }); console.log(order.totalAmount, 'order.billingDetails.fatherName')
      });
    });

    // Set response headers for Excel file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="sales-report.xlsx"');

    // Write Excel workbook to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting sales data:', error);
    res.status(500).send('Internal server error');
  }
};


// const salesReportPdf = async (req, res) => {
//   try {
//     // Fetch sales data from the database
//     const orders = await Order.find().populate('products.product');

//     // Create a new PDF document with landscape orientation
//     const doc = new PDFDocument({ size: 'letter', layout: 'landscape' });
//     const filename = 'sales-report.pdf';

//     // Set response headers for PDF file
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

//     // Write content to the PDF document
//     doc.fontSize(12).text('Sales Report', { align: 'center' }).moveDown();

//     // Create table headers
//       // Create table headers
//       const tableHeaders = ['Order ID', 'Order Date', 'Name', 'Email', 'Phone', 'Product', 'Qty', 'T Amount', 'Status'];

//       // Calculate column widths based on content width
//       const columnWidths = tableHeaders.map(header => doc.widthOfString(header)+20); // Add padding

//     // Draw table headers
//     let y = doc.y;
//     const headerRowHeight = 20;
//     let x = 20;

//     doc.fillColor('black').font('Helvetica-Bold').fontSize(10);

//     tableHeaders.forEach((header, index) => {
//       doc.text(header, x, y);
//       x += columnWidths[index];
//     });

//     // Draw table rows
//     doc.font('Helvetica').fontSize(7);
//     y += headerRowHeight;

//     orders.forEach(order => {
//       order.products.forEach(product => {
//         let x = 10;
//         const rowData = [
//           order.orderId,
//           order.createdAt.toDateString(),
//           order.billingDetails.studentName,
//           order.billingDetails.email,
//           order.billingDetails.phone,
//           product.name,
//           product.quantity.toString(), // Convert quantity to string
//           order.totalAmount.toString(), // Convert totalAmount to string
//           order.status
//         ];

//         // Calculate the maximum height of the row
//         const maxHeight = Math.max(...rowData.map(cell => doc.heightOfString(cell, { width: columnWidths[rowData.indexOf(cell)] })));

//         // Update column widths based on the width of each cell
//         rowData.forEach((cell, index) => {
//           const cellWidth = doc.widthOfString(cell) + 20; // Add padding
//           if (cellWidth > columnWidths[index]) {
//             columnWidths[index] = cellWidth;
//           }
//         });

//         // Draw the row data
//         rowData.forEach((cell, index) => {
//           const cellHeight = doc.heightOfString(cell, { width: columnWidths[index] }); // Get the height of the cell
//           const cellY = y + maxHeight - cellHeight; // Calculate the vertical position for aligning to the bottom
//           doc.text(cell, x, cellY, { width: columnWidths[index], align: 'left' }); // Align text to the bottom
//           x += columnWidths[index];
//         });

//         // Move to the next row
//         y += maxHeight + 5; // Adjust spacing between rows
//       });
//     });

//     // Finalize the PDF document
//     doc.end();

//     // Send the PDF file as response
//     doc.pipe(res);

//   } catch (error) {
//     console.error('Error exporting sales data:', error);
//     res.status(500).send('Internal server error');
//   }
// };











const salesReportPdf = async (req, res) => {
  try {
    const data = await Order.find().populate('products.product');

    const stream = res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment;filename=neritt.invoice.pdf',
    });

    const isOrder=[];

    const order = data.map((item) => ({
      orderNumber: item?.orderId,
      date: moment(item?.createdAt).format('DD/MM/YYYY'),
      price: item?.totalAmount,
      status: item?.status,
      street: item?.billingDetails?.address,
      city: item?.billingDetails?.address,
      phoneNumber:item?.billingDetails?.phone,
      zipCode: item?.billingDetails?.pincode,
      
    }));
      
isOrder.push(...order)

salesPdfService.dailySalesPDF((chunk)=>stream.write(chunk),
()=>stream.end(),isOrder)
  } catch (error) {
    console.error('Error exporting sales data:', error);
    res.status(500).send('Internal server error');
  }
}




module.exports = {
  dashboard,
  users,
  toggleBlockStatus,
  salesReport,
  salesReportDate,
  salesExport,
  salesReportPdf
}
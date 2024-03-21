const PDFDocument = require('pdfkit-table');
const moment=require('moment')
const path = require('path');
const fs = require('fs');

const phantom = require('phantomjs-prebuilt');

function dailySalesPDF(dataCallback, endCallback, isOrder) {
  const doc = new PDFDocument();
  doc.on('data', dataCallback);
  doc.on('end', endCallback);

  // Add a title to the PDF
  doc.fontSize(16).text('Sales Report', { align: 'center' });
  doc.moveDown();

  // Add Logo
  const logoPath = path.join(__dirname, '..', 'public', 'images', 'logo.png');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 50, { width: 100 });
  }

  // Invoice details
  doc.fontSize(8).text(`Date: ${moment(Date.now()).format("DD/MM/YYYY")}`);
  doc.moveDown();

  // Create a table for orders
  const orderTable = {
    headers: ['Sl.No', 'Order Number', 'Date', 'Price', 'Status', 'Street', 'City', 'Zip Code', 'Phone Number'],
    rows: [],
  };

  // Add data to the order table
  isOrder.forEach((item, index) => {
    orderTable.rows.push([
      index + 1,
      item.orderNumber,
      item.date,
      item.price,
      item.status,
      item.street,
      item.city,
      item.zipCode,
      item.phoneNumber,
    ]);
  });

  // Set the order table layout
  doc.moveDown();
  doc.fontSize(12).text('Orders', { align: 'center' });
  doc.moveDown();
  doc.table(orderTable, {
    prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
    prepareRow: (row, i) => doc.font('Helvetica').fontSize(6),
    border: true,
  });

  // Sales Summary
  doc.moveDown();
  doc.fontSize(12).text('Sales Summary', { align: 'center' });
  doc.moveDown();

  const statusSummary = {};
  const statusPrices = {}; // Store the total price for each status
  isOrder.forEach(item => {
    statusSummary[item.status] = (statusSummary[item.status] || 0) + 1;
    statusPrices[item.status] = (statusPrices[item.status] || 0) + item.price;
  });

  const summaryTable = {
    headers: ['Status', 'Count', 'Total Price'],
    rows: [],
  };

  // Add data to the summary table
  let totalOrders = 0;
  Object.entries(statusSummary).forEach(([status, count]) => {
    const totalPrice = statusPrices[status] || 0;
    summaryTable.rows.push([status, count, totalPrice]); // Adding total price for each status
    totalOrders += count;
  });

  // Add total count row to the summary table
  const totalSales = Object.values(statusPrices).reduce((total, price) => total + price, 0);
  summaryTable.rows.push(['Total', totalOrders, totalSales]); // Adding total count and total sales

  // Set the summary table layout
  doc.table(summaryTable, {
    prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
    prepareRow: (row, i) => doc.font('Helvetica').fontSize(6),
    border: true,
  });

    doc.moveDown();
    doc.fontSize(10).text(`Total Sales: ${totalSales}`);
    doc.moveDown();
    doc.fontSize(10).text(`Total Orders: ${totalOrders}`);
  
  doc.end();
}

module.exports = { dailySalesPDF };


const PDFDocument = require('pdfkit-table');
const moment=require('moment')
const path = require('path');
const fs = require('fs');


function dailySalesPDF(dataCallback, endCallback, isOrder) {
  const doc = new PDFDocument();
  doc.on('data', dataCallback);
  doc.on('end', endCallback);


  // Add a title to the PDF
  doc.fontSize(16).text('Sales Report', { align: 'center' });

  doc.moveDown();


// Add Logo
const logoPath = path.join(__dirname, '..', 'public', 'images', 'logo.png'); // Constructing the path
if (fs.existsSync(logoPath)) {
  doc.image(logoPath, 50, 50, { width: 100 }); // Adjust position and size as needed
}

  // Invoice details
  // doc.fontSize(12).text('nerrit.com');

  doc.fontSize(8).text(`Date: ${moment(Date.now()).format("DD/MM/YYYY")}`);

    doc.moveDown();

  // Create a table
  const table = {
    headers: ['Sl.No','Order Number', 'Date', 'Price', 'Status', 'Street', 'City', 'State', 'Zip Code', 'Phone Number'],
    rows: [],
   

  };

  // Add data to the table
  isOrder.forEach((item,index) => {
    table.rows.push([
      index+1,
      item.orderNumber,
      item.date,
      item.price,
      item.status,
      item.street,
      item.city,
      item.state,
      item.zipCode,
      item.phoneNumber,
    ]);
  });

  // Set the table layout
  doc.table(table, {
    prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
    prepareRow: (row, i) => doc.font('Helvetica').fontSize(6),
    border: true,
    
 
  });

  doc.end();
}


  module.exports={dailySalesPDF}






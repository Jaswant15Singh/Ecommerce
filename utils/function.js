const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const nodemailer = require('nodemailer');
const { toWords } = require('number-to-words');
const fontkit = require('fontkit');
// Function to generate the invoice and send the email
async function generateInvoiceAndSendEmail(order_id, customer_email) {

  
  

  try {
    // Fetch order details from the database
    const data = await global.Database.executeQuery(
      `select od2.id ,od.id ,concat(cd.customer_address,',',cd.customer_pincode) as address,od2.order_time ,cd.customer_name ,cd.customer_contact,concat(pd.product_name ,coalesce(Concat(' ',fd.flavour_name),''))as product_name,
        od2.quantity ,coalesce(pbd.label_name,'1Pc') as label_name ,od2.price ,od2.total_price ,pd.product_code
        from order_def od 
        inner join order_items_def od2 on
        od2.order_id = od.id
        inner join product_def pd on 
        pd.id = od2.product_id
        inner join product_batch_details pbd on
        pbd.id = od2.batch_id 
        left join flavour_def fd on
        fd.id =pbd.flavour_id 
        inner join customer_def_log cd on
        cd.id = od.new_customer_id 
        WHERE od.id= ${order_id} order by od2.id desc `
    );

    if (data.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = data[0]; // Customer details
    const pdfPath = "public/mail-template/invoice.pdf"; // Template PDF
    const existingPdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const page = pdfDoc.getPages()[0];
    const { width: initialWidth, height: initialHeight } = page.getSize();
    console.log(`Before PDF Modification: Width = ${initialWidth}, Height = ${initialHeight}`);

    pdfDoc.registerFontkit(fontkit);

    const fontBytes = fs.readFileSync('public/font/TiroDevanagariMarathi-Regular.ttf');
    
    const font = await pdfDoc.embedFont(fontBytes);
    const fontBold = await pdfDoc.embedFont(fontBytes);
    const fontSize = 10;    
    // **Header (Invoice & Customer Details)**
    
  
    page.drawText(`${order.id}`, { x: 552, y: 637, size: 10, font, color: rgb(0, 0, 0) });
    page.drawText(`${new Intl.DateTimeFormat("en-GB").format(new Date(order.order_time))}`, { x: 515, y: 623, size: 10, font, color: rgb(0, 0, 0) });
    page.drawText("Bill to:", { x: 10, y: 675, size: 12, font: fontBold, color: rgb(0, 0, 0) });
    page.drawText(`${order.customer_name}`, { x: 11, y: 660, size: 11, font: fontBold, color: rgb(0, 0, 0) });
    page.drawText("Contact:", { x: 10, y: 645, size: 10, font: fontBold, color: rgb(0, 0, 0) });

    page.drawText(`${order.customer_contact}`, { x: 55, y: 645, size: 11, font, color: rgb(0, 0, 0) });
    // page.drawText(order.address.slice(0, 20), { x: 12, y: 632, size: 11, font, color: rgb(0, 0, 0) });
    const maxLineLength = 35; // Maximum characters per line
    const address = order.address;
    const addressLines = [];
    
    for (let i = 0; i < address.length; i += maxLineLength) {
        addressLines.push(address.substring(i, i + maxLineLength));
    }
    
    let yPosition = 630; // Starting y position
    addressLines.forEach(line => {
        page.drawText(line, { x: 11, y: yPosition, size: 9, font, color: rgb(0, 0, 0) });
        yPosition -= 14; // Adjust y position for the next line
    });
    
    // **Table Header (Aligned Properly)**
    const headerY = 570;
    const colX = { no: 10, name: 40,code: 220, qty: 330,batchQty:400 ,price: 450, total: 530 };
    // **Product List**


    let currentPage = pdfDoc.getPages()[0]; // Start with the first page
    let y = headerY - 20; // Initial Y-position for product list
     minY = 80; // Minimum space before adding a new page
    
    data.forEach((item, index) => {
      // If Y-position goes below minY, create a new page
      if (y < minY) {
        currentPage = pdfDoc.addPage([576, 792]); // Create new A4 page
        y = 750; // Reset Y-position for new page
        // Re-draw table headers on the new page
      
        y -= 20; // Move down for content
      }
    
      currentPage.drawText((index + 1).toString(), { x: colX.no, y, size: fontSize, font, color: rgb(0, 0, 0) });
    
      // **Handle Wrapped Product Name**
      const productLines = item.product_name.match(/.{1,20}/g) || [];
      let currentY = y;
      
      productLines.forEach((line, i) => {
        currentPage.drawText(line, { x: colX.name, y: currentY - i * 12, size: fontSize, characterSpacing: 1, font, color: rgb(0, 0, 0) });
      });
    
      // Adjust Y for the rest of the row
      const maxNameHeight = (productLines.length - 1) * 12;
      currentPage.drawText(item.product_code, { x: colX.code, y: currentY, size: fontSize, font, color: rgb(0, 0, 0) });
      currentPage.drawText(item.quantity.toString(), { x: colX.qty, y: currentY, size: fontSize, font, color: rgb(0, 0, 0) });
      currentPage.drawText(`${item.label_name}`, { x: colX.batchQty, y: currentY, size: fontSize, font, color: rgb(0, 0, 0) });
      currentPage.drawText(` ${item.price}`, { x: colX.price, y: currentY, size: fontSize, font, color: rgb(0, 0, 0) });
      currentPage.drawText(` ${item.total_price}`, { x: colX.total, y: currentY, size: fontSize, font, color: rgb(0, 0, 0) });
    
      // Reduce Y for next item
      y -= 20 + maxNameHeight;
    });
  
    // **Total Calculation**
    const totalAmount = data.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
    const totalquantity = data.reduce((sum, item) => sum + parseFloat(item.quantity.toString()), 0);
    
    const capitalizedAmountInWords = toWords(totalAmount);
    const totalAmountInWords = capitalizedAmountInWords
   .split(" ") // Split into words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
    .join(" "); // Join words back


    const totalHeight = 5; // Approximate height needed for footer
    const availableSpacefortotal = y - minY; // Space left on the current page

    // If there is not enough space, create a new page
    if (availableSpacefortotal < totalHeight) {
      currentPage = pdfDoc.addPage([576, 792]); // Create new page
      y = 750; // Reset Y position for footer placement
    }

    currentPage.drawLine({
      start: { x: 5, y: y - 5 },  // Start from leftmost edge
  end: { x: 570, y: y - 5 },    // Extend to rightmost edge
      thickness: 1,
      color: rgb(0.502, 0.502, 0.502) // Gray (#808080)
    });

    currentPage.drawText(`Total: `, { x: 40, y: y - 20, size: 12, font: fontBold, color: rgb(0, 0, 0) });
    currentPage.drawText(`Rs ${totalAmount}`, { x: 520, y: y - 20, size: 12, font: fontBold, color: rgb(0, 0, 0) });
    currentPage.drawText(`${totalquantity}`, { x: 330, y: y - 20, size: 12, font: fontBold, color: rgb(0, 0, 0) });

    currentPage.drawLine({
      start: { x: 5, y: y - 30 },  // Start from leftmost edge
      end: { x: 570, y: y - 30 },   // Extend to rightmost edge
      thickness: 1,
      color: rgb(0.502, 0.502, 0.502) // Gray (#808080),
    });
// Define minimum space required for the footer section
const footerHeight = 85; // Approximate height needed for footer
const availableSpace = y - minY; // Space left on the current page

// If there is not enough space, create a new page
if (availableSpace < footerHeight) {
  currentPage = pdfDoc.addPage([576, 792]); // Create new page
  y = 750; // Reset Y position for footer placement
}

// **Invoice Amount in Words**
currentPage.drawText("Invoice Amount In Words:", { x: 10, y: y - 50, size: 12, font: fontBold, color: rgb(0, 0, 0) });
currentPage.drawText(`${totalAmountInWords}`, { x: 15, y: y - 70, size: fontSize, font, color: rgb(0, 0, 0) });

// **Terms and Conditions**
currentPage.drawText("Terms And Conditions", { x: 10, y: y - 100, size: 12, font: fontBold, color: rgb(0, 0, 0) });
currentPage.drawText("Good day, and thank you for choosing CableGuy CATV! We", { x: 14, y: y - 122, size: fontSize, font, color: rgb(0, 0, 0) });
currentPage.drawText("truly appreciate your trust and look forward to serving you", { x: 14, y: y - 134, size: fontSize, font, color: rgb(0, 0, 0) });
currentPage.drawText("even more in the future", { x: 14, y: y - 147, size: fontSize, font, color: rgb(0, 0, 0) });

// **Total Calculation Box**
currentPage.drawRectangle({
  x: 330, 
  y: y - 86, 
  width: 240, 
  height: 20, 
  color: rgb(0.976, 0.573, 0.110),
  opacity: 1,
});
currentPage.drawText("Sub Total:", { x: 330, y: y - 55, size: 12, font: fontBold, color: rgb(0, 0, 0) });
currentPage.drawText(`Rs ${totalAmount}`,{ x: 530, y: y - 55, size: fontSize, font, color: rgb(0, 0, 0) });

currentPage.drawText("Total:", { 
  x: 335,  
  y: y - 80, 
  size: 12, 
  font: fontBold, 
  color: rgb(1, 1, 1)
});

currentPage.drawText(`Rs ${totalAmount}`, { x: 527, y: y - 78, size: fontSize, font, color: rgb(0, 0, 0) });

currentPage.drawLine({
  start: { x: 330, y: y - 100 },
  end: { x: 570, y: y - 101 },
  thickness: 2,
  color: rgb(0.502, 0.502, 0.502),
});

// **Signature Placement**
const signImagePath = 'public/mail-template/signature.png';
const signImageBytes = fs.readFileSync(signImagePath);
const signImage = await pdfDoc.embedPng(signImageBytes);
const signImageDims = signImage.scale(0.5);

// Place signature at the bottom of the current or new page
currentPage.drawImage(signImage, {
  x: 415,
  y: y - 175, 
  width: signImageDims.width,
  height: signImageDims.height
});


    // **Save and Send**
    const newPdfBytes = await pdfDoc.save();

    // **Send email with attachment**
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or any email provider you use
      auth: {
      user: 'cableguytest@gmail.com',
        pass: 'nakz rgby tzwk pnnw'
      }
    });

    const mailOptions = {
      from: 'cableguytest@gmail.com',
      to: `${customer_email}`, 
      subject: `Invoice for Order ${order_id}`,
      text: 'Please find attached the invoice for your order.',
      attachments: [
        {
          filename: `invoice_${order_id}.pdf`,
          content: newPdfBytes,
          encoding: 'base64',
        }
      ]
    };
     transporter.sendMail(mailOptions);
    const insertQuery = `
    INSERT INTO email_log ( customer_email, subject, send_date)
    VALUES ('${customer_email}', 'Invoice for Order ${order_id}', now())
  `;
  
  await global.Database.executeQuery(insertQuery);

    return { success: true, message: "Invoice emailed successfully" };

  } catch (error) {
    console.error("Error generating invoice or sending email:", error);
    throw error;
  }
}


async function updateDeleiveryPos(orderId){
try {
  
  const data=await global.Database.executeQuery('Insert into deleivery_def (deleivery_status ,updated_date ,order_id) values ($1,$2,$3)',["SUCCESS",new Date(),orderId])
} catch (error) {
  
  res.status(500).json({success:false,message:"Internal Server error"})
}  
} 
module.exports = { generateInvoiceAndSendEmail,updateDeleiveryPos };

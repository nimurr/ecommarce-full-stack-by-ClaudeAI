import PDFDocument from 'pdfkit';
import Order from '../models/Order.js';
import asyncHandler from 'express-async-handler';

// @desc    Generate and download invoice PDF
// @route   GET /api/orders/:id/invoice
// @access  Private/Admin
export const generateInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Colors
  const PRIMARY = '#0ea5e9';
  const PRIMARY_DARK = '#0284c7';
  const DARK = '#1e293b';
  const GRAY = '#64748b';
  const LIGHT_GRAY = '#e2e8f0';
  const VERY_LIGHT = '#f8fafc';
  const GREEN = '#16a34a';
  const WHITE = '#ffffff';

  // Create PDF document
  const doc = new PDFDocument({
    size: 'A4',
    margin: 0,
  });

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);

  // Pipe PDF to response
  doc.pipe(res);

  const pageWidth = 595.28; // A4 width
  const pageHeight = 841.89; // A4 height
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // ---- TOP ACCENT BAR ----
  doc.rect(0, 0, pageWidth, 8).fill(PRIMARY);

  // ---- HEADER SECTION ----
  doc.rect(0, 8, pageWidth, 100).fill(DARK);

  // Company name
  doc.fillColor(WHITE).fontSize(26).font('Helvetica-Bold').text('INVOICE', margin, 28, { align: 'left' });
  doc.fontSize(11).font('Helvetica').text('Gadgets Lagbe', margin, 58, { align: 'left' });
  doc.fontSize(9).fillColor(GRAY).text('Dhaka, Bangladesh | 01852219894', margin, 74, { align: 'left' });

  // Order number on right
  doc.fillColor(PRIMARY).fontSize(14).font('Helvetica-Bold').text(`#${order.orderNumber}`, margin + 300, 28, { align: 'right', width: contentWidth - 300 });
  doc.fillColor(GRAY).fontSize(10).font('Helvetica').text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}`, margin + 300, 50, { align: 'right', width: contentWidth - 300 });
  doc.fillColor(GRAY).fontSize(10).font('Helvetica').text(`Status: ${order.orderStatus}`, margin + 300, 68, { align: 'right', width: contentWidth - 300 });

  // ---- CUSTOMER & PAYMENT INFO ----
  let y = 130;

  // Customer info box
  doc.fillColor(VERY_LIGHT).rect(margin, y, contentWidth / 2 - 5, 90).fill();
  doc.fillColor(LIGHT_GRAY).rect(margin, y, contentWidth / 2 - 5, 22).fill();
  doc.fillColor(DARK).fontSize(9).font('Helvetica-Bold').text('BILL TO', margin + 10, y + 5, { width: contentWidth / 2 - 25 });
  doc.fillColor(DARK).fontSize(11).font('Helvetica-Bold').text(order.shippingAddress?.fullName || order.user?.name || 'Guest', margin + 10, y + 30, { width: contentWidth / 2 - 25 });
  doc.fillColor(GRAY).fontSize(9).font('Helvetica').text(`Phone: ${order.shippingAddress?.phone || order.user?.phone || 'N/A'}`, margin + 10, y + 46, { width: contentWidth / 2 - 25 });
  doc.fillColor(GRAY).fontSize(9).font('Helvetica').text(`Email: ${order.user?.email || 'N/A'}`, margin + 10, y + 60, { width: contentWidth / 2 - 25 });
  doc.fillColor(GRAY).fontSize(9).font('Helvetica').text(
    `${order.shippingAddress?.address || ''}, ${order.shippingAddress?.city || ''}`,
    margin + 10, y + 74, { width: contentWidth / 2 - 25 }
  );

  // Payment info box
  const paymentX = margin + contentWidth / 2 + 5;
  doc.fillColor(VERY_LIGHT).rect(paymentX, y, contentWidth / 2 - 5, 90).fill();
  doc.fillColor(LIGHT_GRAY).rect(paymentX, y, contentWidth / 2 - 5, 22).fill();
  doc.fillColor(DARK).fontSize(9).font('Helvetica-Bold').text('PAYMENT INFO', paymentX + 10, y + 5, { width: contentWidth / 2 - 25 });
  doc.fillColor(DARK).fontSize(10).font('Helvetica').text(`Method: ${order.paymentMethod == "COD" ? "Cash on Delivery" : "Online"}`, paymentX + 10, y + 30, { width: contentWidth / 2 - 25 });
  // doc.fillColor(DARK).fontSize(10).font('Helvetica').text(`Status: ${order.paymentStatus}`, paymentX + 10, y + 46, { width: contentWidth / 2 - 25 });
  if (order.couponCode) {
    doc.fillColor(GREEN).fontSize(10).font('Helvetica').text(`Coupon: ${order.couponCode}`, paymentX + 10, y + 60, { width: contentWidth / 2 - 25 });
  }

  // ---- SHIPPING ADDRESS ----
  y = 235;
  doc.fillColor(VERY_LIGHT).rect(margin, y, contentWidth, 50).fill();
  doc.fillColor(LIGHT_GRAY).rect(margin, y, contentWidth, 20).fill();
  doc.fillColor(DARK).fontSize(9).font('Helvetica-Bold').text('SHIPPING ADDRESS', margin + 10, y + 4, { width: contentWidth - 20 });
  doc.fillColor(GRAY).fontSize(9).font('Helvetica').text(
    `${order.shippingAddress?.address || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.zipCode || ''}`,
    margin + 10, y + 28, { width: contentWidth - 20 }
  );

  // ---- ORDER ITEMS TABLE ----
  y = 300;
  doc.fillColor(DARK).fontSize(12).font('Helvetica-Bold').text('Order Items', margin, y);
  y += 20;

  // Table header background
  doc.fillColor(PRIMARY).rect(margin, y, contentWidth, 24).fill();

  const tableHeaders = ['#', 'Product', 'Qty', 'Unit Price', 'Subtotal'];
  const colWidths = [30, 260, 50, 90, 90];
  let currentX = margin + 5;

  doc.fillColor(WHITE).fontSize(9).font('Helvetica-Bold');
  tableHeaders.forEach((header, i) => {
    const align = i >= 2 ? 'right' : 'left';
    const xPos = i === 0 ? currentX + 5 : (i >= 2 ? currentX + colWidths[i] - 5 : currentX);
    doc.text(header, xPos, y + 6, { width: colWidths[i], align });
    currentX += colWidths[i];
  });

  y += 30;

  // Table rows
  order.orderItems.forEach((item, index) => {
    // Row background alternating
    if (index % 2 === 0) {
      doc.fillColor(VERY_LIGHT).rect(margin, y, contentWidth, 28).fill();
    }

    doc.fillColor(DARK).fontSize(9).font('Helvetica');
    currentX = margin + 5;

    const rowData = [
      String(index + 1),
      item.name,
      String(item.quantity),
      `Tk ${(item.price || 0).toLocaleString()}`,
      `Tk ${(item.subtotal || 0).toLocaleString()}`,
    ];

    rowData.forEach((cell, i) => {
      const align = i >= 2 ? 'right' : 'left';
      const xPos = i === 0 ? currentX + 5 : (i >= 2 ? currentX + colWidths[i] - 5 : currentX);
      doc.text(cell, xPos, y + 6, { width: colWidths[i], align });
      currentX += colWidths[i];
    });

    // Color/Size variant
    if (item.selectedColor || item.selectedSize) {
      let variantText = '';
      if (item.selectedColor) variantText += `Color: ${item.selectedColor}`;
      if (item.selectedSize) variantText += `${variantText ? ' | ' : ''}Size: ${item.selectedSize}`;
      doc.fontSize(7).fillColor(GRAY).text(variantText, margin + 35, y + 20, { width: 225 });
      doc.fontSize(9).fillColor(DARK);
    }

    y += 32;

    // Page break if needed
    if (y > 680) {
      doc.addPage();
      y = 50;
    }
  });

  // Table bottom border
  doc.fillColor(LIGHT_GRAY).rect(margin, y, contentWidth, 1).fill();
  y += 15;

  // ---- TOTALS ----
  const totalsX = margin + contentWidth - 200;

  doc.fontSize(10).font('Helvetica').fillColor(GRAY);
  doc.text('Subtotal', totalsX, y, { width: 100, align: 'right' });
  doc.fillColor(DARK).text(`Tk ${(order.itemsPrice || 0).toLocaleString()}`, totalsX + 100, y, { width: 100, align: 'right' });
  y += 20;

  doc.fillColor(GRAY);
  doc.text('Shipping', totalsX, y, { width: 100, align: 'right' });
  doc.fillColor(DARK).text(`Tk ${(order.shippingPrice || 0).toLocaleString()}`, totalsX + 100, y, { width: 100, align: 'right' });
  y += 20;

  if (order.discountPrice > 0) {
    doc.fillColor(GREEN);
    doc.text('Discount', totalsX, y, { width: 100, align: 'right' });
    doc.text(`-Tk ${(order.discountPrice || 0).toLocaleString()}`, totalsX + 100, y, { width: 100, align: 'right' });
    y += 20;
  }

  // Total box
  doc.fillColor(PRIMARY).rect(totalsX - 10, y, 210, 30).fill();
  doc.fillColor(WHITE).fontSize(12).font('Helvetica-Bold');
  doc.text('TOTAL', totalsX, y + 7, { width: 100, align: 'right' });
  doc.text(`Tk ${(order.totalPrice || 0).toLocaleString()}`, totalsX + 100, y + 7, { width: 100, align: 'right' });
  y += 45;

  // ---- FOOTER ----
  doc.fillColor(LIGHT_GRAY).rect(margin, y, contentWidth, 1).fill();
  y += 20;

  doc.fillColor(GRAY).fontSize(9).font('Helvetica');
  doc.text('Thank you for your purchase!', margin, y, { align: 'center', width: contentWidth });
  y += 16;
  doc.fontSize(8).fillColor(GRAY);
  doc.text('For any queries, contact: 01852219894', margin, y, { align: 'center', width: contentWidth });
  y += 14;
  doc.fontSize(7).fillColor('#94a3b8');
  doc.text(`Invoice generated on ${new Date().toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })} at ${new Date().toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })}`, margin, y, { align: 'center', width: contentWidth });

  // Bottom accent bar
  doc.fillColor(PRIMARY).rect(0, pageHeight - 8, pageWidth, 8).fill();

  // Finalize PDF
  doc.end();
});

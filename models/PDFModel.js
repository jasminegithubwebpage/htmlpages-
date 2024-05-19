const mongoose = require('mongoose');

// Define the schema for the PDF model
const pdfSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    data: {
        type: Buffer, // Store PDF file data as a Buffer
        required: true
    }
});

// Create and export the PDF model
const PDFModel = mongoose.model('PDF', pdfSchema);
module.exports = PDFModel;

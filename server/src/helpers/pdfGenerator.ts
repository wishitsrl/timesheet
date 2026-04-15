import path from 'path';
const PdfPrinter = require('pdfmake');

const fonts = {
  Roboto: {
    normal: path.join(__dirname, '../fonts/Roboto-Regular.ttf'),
    bold: path.join(__dirname, '../fonts/Roboto-Medium.ttf'),
    italics: path.join(__dirname, '../fonts/Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, '../fonts/Roboto-MediumItalic.ttf')
  }
};

const printer = new PdfPrinter(fonts);

export const createPDF = (docDefinition: any) => {
  return printer.createPdfKitDocument(docDefinition);
};
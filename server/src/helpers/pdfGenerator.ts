import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import path from 'path';

const fonts = {
  Roboto: {
    normal: path.join(__dirname, '../../fonts/Roboto-Regular.ttf'),
    bold: path.join(__dirname, '../../fonts/Roboto-Medium.ttf'),
    italics: path.join(__dirname, '../../fonts/Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, '../../fonts/Roboto-MediumItalic.ttf')
  }
};

// Usiamo (PdfPrinter as any) per risolvere l'errore ts(2351)
// Questo bypassa il controllo della "construct signature" che ti sta dando errore
const printer = new (PdfPrinter as any)(fonts);

export const createPDF = (docDefinition: TDocumentDefinitions) => {
  return printer.createPdfKitDocument(docDefinition);
};
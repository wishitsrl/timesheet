import { Request, Response } from 'express';
import Timesheet from '../models/timesheet.model';
import { AuthRequest } from '../types/authRequest';
import { createPDF } from '../helpers/pdfGenerator';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

// Recupera i records filtrati per email
export const getTimesheet = async (req: AuthRequest, res: Response) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ message: "Il parametro email è obbligatorio." });
    }

    const userRecords = await Timesheet.find({ email }).sort({ data: 1 });
    return res.json(userRecords);
  } catch (error: any) {
    console.error("❌ Errore caricamento timesheet:", error);
    res.status(500).json({ message: "Errore durante il caricamento" });
  }
};

// Recupera un singolo record tramite ID
export const getTimesheetById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const record = await Timesheet.findById(id);

    if (!record) {
      return res.status(404).json({ message: "Record non trovato." });
    }

    return res.json(record);
  } catch (error: any) {
    res.status(500).json({ message: "Errore nel recupero del record", error: error.message });
  }
};

// Salvataggio o aggiornamento (Upsert)
export const postTimesheet = async (req: AuthRequest, res: Response) => {
  try {
    const { email, data, ...updateData } = req.body;

    if (!email || !data) {
      return res.status(400).json({ message: "Email e data sono obbligatorie." });
    }

    const record = await Timesheet.findOneAndUpdate(
      { email, data },
      { $set: { ...updateData, email, data } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    const isNew = record && record.createdAt && record.updatedAt 
      ? record.createdAt.getTime() === record.updatedAt.getTime() 
      : false;
    
    res.json({ 
      message: isNew ? "✅ Nuovo timesheet salvato." : "🟢 Timesheet aggiornato.",
      data: record 
    });
  } catch (error: any) {
    console.error("❌ Errore nel salvataggio:", error);
    res.status(500).json({ message: "Errore nel salvataggio", error: error.message });
  }
};

// Aggiornamento parziale tramite ID
export const updateTimesheet = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updatedRecord = await Timesheet.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({ message: "Record non trovato." });
    }

    res.json({ message: "Aggiornamento completato", data: updatedRecord });
  } catch (error: any) {
    res.status(400).json({ message: "Errore nell'aggiornamento", error: error.message });
  }
};

// Eliminazione record tramite ID
export const deleteTimesheet = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deletedRecord = await Timesheet.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res.status(404).json({ message: "Record non trovato." });
    }

    res.json({ message: "Record eliminato correttamente" });
  } catch (error: any) {
    res.status(500).json({ message: "Errore nell'eliminazione", error: error.message });
  }
};

// Generazione e download del PDF mensile
export const downloadMonthlyPdf = async (req: Request, res: Response) => {
  try {
    const { email, month, year } = req.query;

    if (!email || !month || !year) {
      return res.status(400).json({ message: "Parametri mancanti: email, mese e anno sono obbligatori." });
    }

    const records = await Timesheet.find({ 
      email, 
      data: { $regex: `^${year}-${String(month).padStart(2, '0')}` } 
    });

    const summary = records.reduce((acc, curr) => {
      if (curr.presenza) acc.presenze++;
      if (curr.ferie) acc.ferie++;
      if (curr.malattia) acc.malattia++;
      if (curr.giorni104) acc.legge104++;
      
      acc.rol += Number(curr.permessiRol || 0);
      acc.straordinari += Number(curr.straordinari || 0);
      
      return acc;
    }, { presenze: 0, ferie: 0, malattia: 0, legge104: 0, rol: 0, straordinari: 0 });

    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: `REPORT MENSILE TIMESHEET`, style: 'header' },
        { text: `Periodo: ${month}/${year}`, style: 'subheader' },
        { text: `Dipendente: ${email}`, margin: [0, 0, 0, 20] },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*', '*'],
            body: [
              [
                { text: 'PRESENZE', bold: true, fillColor: '#eeeeee' }, 
                { text: 'FERIE', bold: true, fillColor: '#eeeeee' }, 
                { text: 'MALATTIA', bold: true, fillColor: '#eeeeee' }, 
                { text: 'L. 104', bold: true, fillColor: '#eeeeee' }, 
                { text: 'ROL (Ore)', bold: true, fillColor: '#eeeeee' }, 
                { text: 'STR (Ore)', bold: true, fillColor: '#eeeeee' }
              ],
              [
                summary.presenze, 
                summary.ferie, 
                summary.malattia, 
                summary.legge104, 
                summary.rol.toFixed(1), 
                summary.straordinari.toFixed(1)
              ]
            ]
          }
        },
        { text: '\n\nFirma del Dipendente: __________________________', margin: [0, 50, 0, 0] }
      ],
      styles: {
        header: { fontSize: 22, bold: true, color: '#1a237e' },
        subheader: { fontSize: 16, bold: true, margin: [0, 10, 0, 10] }
      },
      defaultStyle: { font: 'Roboto' }
    };

    const pdfDoc = createPDF(docDefinition);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=timesheet_${email}.pdf`);

    pdfDoc.pipe(res);
    pdfDoc.end();

  } catch (error: any) {
    console.error("Errore generazione PDF:", error);
    res.status(500).json({ message: "Errore interno durante il processamento del PDF" });
  }
};
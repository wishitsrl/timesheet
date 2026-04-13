import { Request, Response } from 'express';
import Timesheet from '../models/timesheet.model';
import { AuthRequest } from '../types/authRequest';

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

// Crea o aggiorna (Upsert) basato su email e data
export const postTimesheet = async (req: AuthRequest, res: Response) => {
  try {
    const { email, data, ...updateData } = req.body;

    if (!email || !data) {
      return res.status(400).json({ message: "Email e data sono obbligatorie." });
    }

    // Utilizzo di findOneAndUpdate con upsert per rendere l'operazione atomica
    const record = await Timesheet.findOneAndUpdate(
      { email, data },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    const isNew = record.createdAt.getTime() === record.updatedAt.getTime();
    
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

    res.json({ message: "🗑️ Record eliminato con successo." });
  } catch (error: any) {
    res.status(500).json({ message: "Errore durante l'eliminazione", error: error.message });
  }
};
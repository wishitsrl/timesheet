import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITimesheet extends Document {
  email: string;
  data: string; // Formato YYYY-MM-DD consigliato
  presenza: boolean;
  ferie: boolean;
  malattia: boolean;
  giorni104: boolean;
  permessi: string;
  permessiRol: string;
  certificato: string;
  straordinari: string;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

const TimesheetSchema = new Schema<ITimesheet>(
  {
    email: { 
      type: String, 
      required: [true, 'L’email è obbligatoria'], 
      trim: true, 
      lowercase: true 
    },
    data: { 
      type: String, 
      required: [true, 'La data è obbligatoria'], 
      trim: true 
    },
    presenza: { type: Boolean, default: false },
    ferie: { type: Boolean, default: false },
    malattia: { type: Boolean, default: false },
    giorni104: { type: Boolean, default: false },
    permessi: { type: String, default: "", trim: true },
    permessiRol: { type: String, default: "", trim: true },
    certificato: { type: String, default: "", trim: true },
    straordinari: { type: String, default: "", trim: true },
    note: { type: String, default: "", trim: true },
  },
  { 
    timestamps: true,
    // Ottimizza l'output JSON rimuovendo versionKey e trasformando _id
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false }
  }
);

// Indice composto per velocizzare le ricerche per utente/giorno 
// e garantire l'unicità della coppia se necessario
TimesheetSchema.index({ email: 1, data: 1 });

const Timesheet: Model<ITimesheet> = mongoose.model<ITimesheet>('Timesheet', TimesheetSchema);

export default Timesheet;
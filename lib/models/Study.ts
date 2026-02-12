import mongoose, { Schema, Document, Types } from "mongoose";

export interface IStudy extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description?: string;
  content: string; // All text content (from notes or extracted from PDFs)
  sourceType: "notes" | "pdf";
  pdfFileNames?: string[]; // Original PDF file names for reference
  createdAt: Date;
  updatedAt: Date;
}

const StudySchema = new Schema<IStudy>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    sourceType: {
      type: String,
      enum: ["notes", "pdf"],
      required: true,
    },
    pdfFileNames: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Study =
  mongoose.models.Study || mongoose.model<IStudy>("Study", StudySchema);


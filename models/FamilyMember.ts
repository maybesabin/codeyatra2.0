import mongoose, { Schema, Types } from "mongoose";

const MedicalNoteSchema = new mongoose.Schema({
    title: String,
    note: String,
    date: {
        type: Date,
        default: Date.now,
    },
});

export const FamilyMemberSchema = new Schema<FamilyMember>({
    name: { type: String, required: true },
    age: { type: Number, required: true, min: 0 },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    medicalNotes: [MedicalNoteSchema]
});
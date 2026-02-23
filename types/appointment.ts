import type { Schema } from "mongoose";

export type AppointmentStatus = "pending" | "completed" | "cancelled";

export interface AppointmentType {
    doctor: Schema.Types.ObjectId;
    user: Schema.Types.ObjectId;
    /** Optional: when set, the appointment is for this family member. */
    member?: Schema.Types.ObjectId;
    problem: string;
    date: Date;
    status: AppointmentStatus;
    cancellationMessage?: string;
}

export type Appointment = AppointmentType;

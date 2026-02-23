import type { Schema } from "mongoose";

export type AppointmentStatus = "pending" | "completed" | "cancelled";
export type AppointmentPriority = "low" | "moderate" | "high";

export interface AppointmentType {
    doctor: Schema.Types.ObjectId;
    user: Schema.Types.ObjectId;
    member?: Schema.Types.ObjectId;
    problem: string;
    date: Date;
    status: AppointmentStatus;
    cancellationMessage?: string;
    priority?: AppointmentPriority;
}

export type Appointment = AppointmentType;

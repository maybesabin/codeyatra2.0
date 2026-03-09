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
    startTime?: string; // e.g. "09:00"
    endTime?: string;   // e.g. "10:00"
    meetingLink?: string;
}

export type Appointment = AppointmentType;

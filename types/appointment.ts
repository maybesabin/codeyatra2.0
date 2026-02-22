import type { Schema } from "mongoose";

export type AppointmentStatus = "pending" | "completed" | "cancelled";

export interface AppointmentType {
    doctor: Schema.Types.ObjectId;
    user: Schema.Types.ObjectId;
    problem: string;
    date: Date;
    status: AppointmentStatus;
}

export type Appointment = AppointmentType;

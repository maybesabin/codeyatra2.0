import type { Appointment as AppointmentType } from "@/types/appointment";
import mongoose, { Schema } from "mongoose";

const AppointmentSchema = new Schema<AppointmentType>({
    doctor: {
        type: Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    member: {
        type: Schema.Types.ObjectId,
        ref: "Member",
        required: false,
    },
    problem: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "completed", "cancelled"],
        default: "pending",
    },
    cancellationMessage: {
        type: String,
        required: false,
    },
    priority: {
        type: String,
        enum: ["low", "moderate", "high"],
        required: false,
    },
}, {
    timestamps: true,
});

if (mongoose.models.Appointment) {
    delete mongoose.models.Appointment;
}

const Appointment = mongoose.model("Appointment", AppointmentSchema);

export default Appointment;

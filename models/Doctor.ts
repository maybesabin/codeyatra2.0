import type { Doctor } from "@/types/doctor";
import mongoose, { Schema } from "mongoose";

const DoctorSchema = new Schema<Doctor>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        minLength: [10, "Email should be at least 10 characters"],
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    verify: {
        type: Boolean,
        default: false
    },
    citizenship: {
        type: String
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },
    gender: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    profilePicture: {
        type: String,
        required: true
    },
    license: {
        type: String,
        default: ""
    },
    available: {
        type: Boolean,
        required: true,
        default: true
    },
    appointments: {
        type: [Schema.Types.ObjectId],
        ref: "Appointment"
    }
}, {
    timestamps: true
})

if (mongoose.models.Doctor) {
    delete mongoose.models.Doctor;
}

const Doctor = mongoose.model("Doctor", DoctorSchema);

export default Doctor
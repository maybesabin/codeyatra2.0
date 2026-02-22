import { UserType } from "@/types/user";
import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema<UserType>({
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
    problem: {
        type: String,
    },
    profilePicture: {
        type: String,
        required: true
    },
    member: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Member"
        }
    ],
    appointments: [
        {
            type: Schema.Types.ObjectId,
            ref: "Appointment"
        }
    ]

}, {
    timestamps: true
})

if (mongoose.models.User) {
    delete mongoose.models.User;
}

const User = mongoose.model("User", UserSchema);

export default User
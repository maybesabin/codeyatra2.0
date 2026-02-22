import { UserType } from "@/types/user";
import mongoose, { Schema } from "mongoose";

const AdminSchema = new Schema<UserType>({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    timestamps: true
})

if (mongoose.models.Member) {
    delete mongoose.models.Member;
}

const User = mongoose.model("User", AdminSchema);

export default User
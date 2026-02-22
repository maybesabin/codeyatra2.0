import { UserType } from "@/types/user";
import { FamilyMemberSchema } from "./FamilyMember";
import { model, Schema } from "mongoose";
import mongoose from "mongoose";

const UserSchema = new Schema<UserType>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    familyName: { type: String },
    familyMembers: {
        type: [FamilyMemberSchema],
        default: [],
        validate: [(val: FamilyMember[]) => val.length <= 5, "Max 5 family members allowed"],
    },
}, { timestamps: true });

if (mongoose.models.User) {
    delete mongoose.models.User;
}

export const User = model<UserType>("User", UserSchema);
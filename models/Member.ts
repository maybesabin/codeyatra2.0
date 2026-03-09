import type { Member } from "@/types/member";
import mongoose, { Schema } from "mongoose";

const MemberSchema = new Schema<Member>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },
    verify: {
        type: Boolean,
        default: false
    },
    citizenship: {
        type: String
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

}, {
    timestamps: true
})

if (mongoose.models.Member) {
    delete mongoose.models.Member;
}

const Member = mongoose.model("Member", MemberSchema);

export default Member;
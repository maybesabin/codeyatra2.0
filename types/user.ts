import { Document, Types } from "mongoose";

export interface UserType extends Document {
    name: string;
    email: string;
    password: string;
    gender: "male" | "female" | "other";
    familyMembers: Types.DocumentArray<FamilyMember>;
    familyName: string;
}
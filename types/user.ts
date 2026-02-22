import type { Schema } from "mongoose";
import { Member } from "./member";

export interface UserType {
    name: string;
    email: string;
    password: string;
    profilePicture: string;
    gender: "male" | "female" | "other";
    citizenship: string;
    problem: string;
    verify: boolean;
    age: number;
    member?: [Member];
    appointments?: Schema.Types.ObjectId[];
    isAdmin: boolean;
}
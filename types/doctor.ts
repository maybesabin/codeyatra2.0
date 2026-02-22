import type { Schema } from "mongoose";

export interface DoctorType {
    email: string,
    password: string,
    name: string,
    age: number,
    profilePicture: string,
    citizenship?: string,
    license?: string,
    gender: "male" | "female" | "others",
    verify: boolean,
    available: boolean,
    appointments: Schema.Types.ObjectId[],
    isAdmin: boolean;
}

export type Doctor = DoctorType;
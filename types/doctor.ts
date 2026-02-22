import { UserType } from "./user";

export interface Doctor {
    email: string,
    password: string,
    name: string,
    age: number,
    profilePicture: string,
    citizenship: string,
    license: string,
    gender: "male" | "female" | "others",
    verify: boolean,
    available: boolean,
    appointments: [UserType],
    isAdmin: boolean;
}
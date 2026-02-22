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
    isAdmin: boolean
}
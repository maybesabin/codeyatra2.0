export interface Member {
    name: string;
    gender: "male" | "female" | "other";
    citizenship: string;
    problem: string;
    verify: boolean;
    profilePicture: string;
    age: number;
    isAdmin: boolean;
}
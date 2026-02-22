type FamilyMember = {
    name: string;
    age: number;
    gender: "male" | "female" | "other";
    medicalNotes: Array<{
        title?: string;
        note?: string;
        date?: Date;
    }>
}
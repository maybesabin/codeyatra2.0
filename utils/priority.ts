export type AppointmentPriority = "low" | "moderate" | "high";

export interface SymptomRule {
    keywords: string[];
    weight: number;
    priority: AppointmentPriority;
}

export const TRIAGE_RULES: SymptomRule[] = [
    {
        keywords: ["chest pain", "heart pain", "tight chest", "pressure in chest", "chest discomfort"],
        weight: 10,
        priority: "high",
    },
    {
        keywords: ["difficulty breathing", "shortness of breath", "can't breathe", "wheezing", "gasping for air"],
        weight: 10,
        priority: "high",
    },
    {
        keywords: ["unconscious", "fainted", "passed out", "blackout", "loss of consciousness"],
        weight: 10,
        priority: "high",
    },
    {
        keywords: ["severe bleeding", "bleeding heavily", "profuse bleeding", "blood loss"],
        weight: 9,
        priority: "high",
    },
    {
        keywords: ["stroke", "paralysis", "slurred speech", "facial drooping", "weakness on one side"],
        weight: 10,
        priority: "high",
    },

    // moderate
    {
        keywords: ["high fever", "persistent fever", "fever for days", "elevated temperature", "spiking fever"],
        weight: 6,
        priority: "moderate",
    },
    {
        keywords: ["vomiting", "nausea", "diarrhea", "upset stomach", "stomach cramps"],
        weight: 5,
        priority: "moderate",
    },
    {
        keywords: ["severe headache", "migraine", "throbbing headache", "head pressure"],
        weight: 6,
        priority: "moderate",
    },
    {
        keywords: ["infection", "swelling", "pus", "redness", "painful area"],
        weight: 5,
        priority: "moderate",
    },
    {
        keywords: ["fracture", "sprain", "injury", "broken bone", "twisted ankle"],
        weight: 7,
        priority: "moderate",
    },

    // low
    {
        keywords: ["mild headache", "tired", "fatigue", "low energy", "sleepy"],
        weight: 2,
        priority: "low",
    },
    {
        keywords: ["common cold", "runny nose", "cough", "sneezing", "congestion"],
        weight: 2,
        priority: "low",
    },
    {
        keywords: ["minor cut", "small bruise", "scratches", "light bleeding"],
        weight: 1,
        priority: "low",
    },
    {
        keywords: ["checkup", "routine test", "annual exam", "general consultation"],
        weight: 1,
        priority: "low",
    },
];
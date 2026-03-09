import { TRIAGE_RULES, AppointmentPriority } from "./priority";

export function inferAppointmentPriority(problem: string): AppointmentPriority {
    const text = problem.toLowerCase();

    let score = 0;
    let highestPriority: AppointmentPriority = "low";

    for (const rule of TRIAGE_RULES) {
        // Check if any keyword partially matches the input text
        const matched = rule.keywords.some((keyword) => text.includes(keyword.toLowerCase()));
        if (matched) {
            score += rule.weight;

            const criticalKeywords = ["cancer", "heart attack", "stroke", "brain tumor", "cardiac arrest"];
            if (rule.keywords.some((kw) => criticalKeywords.includes(kw.toLowerCase()))) {
                return "high";
            }
            if (rule.priority === "high") highestPriority = "high";
            else if (rule.priority === "moderate" && highestPriority !== "high") highestPriority = "moderate";
        }
    }

    // Scoring-based fallback
    if (score >= 10) return "high";
    if (score >= 5) return "moderate";

    return highestPriority;
}
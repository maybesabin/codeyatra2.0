export type AppointmentPriority = "low" | "moderate" | "high";

const VALID_PRIORITIES: AppointmentPriority[] = ["low", "moderate", "high"];

export async function inferAppointmentPriority(problem: string): Promise<AppointmentPriority> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("GEMINI_API_KEY not set, defaulting to moderate");
        return "moderate";
    }

    const prompt = `You are a medical triage assistant. Based on the following patient problem/condition description, determine the appointment priority.

Rules:
- "high": urgent/serious (e.g., chest pain, severe bleeding, breathing difficulty, stroke symptoms, severe pain, possible fracture)
- "moderate": needs timely care but not emergency (e.g., persistent fever, infection, moderate pain, chronic condition flare-up)
- "low": routine/non-urgent (e.g., mild cold, checkup, minor skin issue, routine follow-up)

Respond with exactly one word: low, moderate, or high. Nothing else.

Problem: ${problem}`;

    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        maxOutputTokens: 10,
                        temperature: 0.1,
                    },
                }),
            }
        );

        if (!res.ok) {
            const errText = await res.text();
            console.error("Gemini API error:", res.status, errText);
            return "moderate";
        }

        const data = (await res.json()) as {
            candidates?: Array<{
                content?: { parts?: Array<{ text?: string }> };
            }>;
        };

        const text =
            data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() ?? "";

        const match = VALID_PRIORITIES.find((p) => text.includes(p));
        return match ?? "moderate";
    } catch (err) {
        console.error("Gemini inferAppointmentPriority error:", err);
        return "moderate";
    }
}

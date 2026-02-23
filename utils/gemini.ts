export type AppointmentPriority = "low" | "moderate" | "high";

const VALID_PRIORITIES: AppointmentPriority[] = ["low", "moderate", "high"];

export async function inferAppointmentPriority(problem: string): Promise<AppointmentPriority> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("GEMINI_API_KEY not set, defaulting to moderate");
        return "moderate";
    }

    const prompt = `Based on this medical problem, reply with only one word: low, moderate, or high. Problem: ${problem}`;

    try {
        let res: Response;
        try {
            res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            maxOutputTokens: 20,
                            temperature: 0.3,
                        },
                    }),
                }
            );
        } catch (networkErr) {
            console.error("Network error calling Gemini:", networkErr);
            return "moderate";
        }

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

        // Prefer exact match; "high" and "low" before "moderate" to avoid substring false positives
        const exactMatch = VALID_PRIORITIES.find((p) => {
            const regex = new RegExp(`\\b${p}\\b`, "i");
            return regex.test(text);
        });
        if (exactMatch) return exactMatch;

        const fallbackMatch = VALID_PRIORITIES.find((p) => text.includes(p));
        return fallbackMatch ?? "moderate";
    } catch (err) {
        console.error("Gemini inferAppointmentPriority error:", err);
        return "moderate";
    }
}
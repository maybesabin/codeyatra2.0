import Appointment from "@/models/Appointment";
import User from "@/models/User";
import connectToDb from "@/utils/db";
import { handleError } from "@/utils/error";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

function getUserIdFromToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      role?: string;
    };
    if (decoded.role !== "user") return null;
    return decoded.id;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Valid user token required." },
        { status: 401 }
      );
    }

    await connectToDb();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const appointmentIds = user.appointments ?? [];
    if (!appointmentIds.length) {
      return NextResponse.json(
        { success: false, message: "No appointments to summarize" },
        { status: 400 }
      );
    }

    const appointments = await Appointment.find({ _id: { $in: appointmentIds } })
      .sort({ date: 1 })
      .lean();

    const items = appointments.map((a, index) => {
      const date = a.date instanceof Date ? a.date : new Date(a.date);
      const when = date.toISOString().split("T")[0];
      return `${index + 1}. [${when}] ${a.problem}`;
    });

    const prompt = `
You are a helpful medical assistant summarizing a patient's past appointment requests.

Here are the past problems the patient reported (most recent last):
${items.join("\n")}

Write a very short, direct answer in this style:
- Start with: "You have ..." and briefly list the main ongoing issues.
- Then: "Next you should ..." and list 2–4 clear, practical next steps (follow-ups, monitoring, lifestyle tips).
Avoid medical jargon and DO NOT mention that you are an AI.
`;

    try {
      const res = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "phi3:mini",
          prompt,
          stream: false,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Ollama error:", res.status, text);
        return NextResponse.json(
          { success: false, message: "Local model failed to generate summary" },
          { status: 500 }
        );
      }

      const data = (await res.json()) as { response?: string };
      const summary = (data.response || "").trim();

      if (!summary) {
        return NextResponse.json(
          { success: false, message: "Model returned empty summary" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, summary },
        { status: 200 }
      );
    } catch (err) {
      console.error("Error calling Ollama:", err);
      return NextResponse.json(
        { success: false, message: "Could not reach local Ollama server. Is it running?" },
        { status: 500 }
      );
    }
  } catch (err) {
    return handleError(err);
  }
}


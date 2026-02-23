
import { handleError } from "@/utils/error";
import { inferAppointmentPriority } from "@/utils/inferPriority";
import { errorResponse } from "@/utils/response";
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

        const body = await req.json();
        const { problem } = body;
        if (!problem || typeof problem !== "string" || !problem.trim()) {
            return errorResponse("Problem description required");
        }

        const priority = await inferAppointmentPriority(problem.trim());

        return NextResponse.json(
            { success: true, priority },
            { status: 200 }
        );
    } catch (err) {
        return handleError(err);
    }
}

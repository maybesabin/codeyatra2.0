import Appointment from "@/models/Appointment";
import connectToDb from "@/utils/db";
import { handleError } from "@/utils/error";
import { errorResponse } from "@/utils/response";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_STATUSES = ["pending", "completed", "cancelled"] as const;

function getDoctorIdFromToken(req: NextRequest): string | null {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.slice(7);
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: string;
            email: string;
            role?: string;
        };
        if (decoded.role !== "doctor") return null;
        return decoded.id;
    } catch {
        return null;
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const doctorId = getDoctorIdFromToken(req);
        if (!doctorId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Valid doctor token required." },
                { status: 401 }
            );
        }

        const { id: appointmentId } = await params;
        if (!appointmentId) {
            return errorResponse("Appointment ID required");
        }

        const body = await req.json();
        const { status, message } = body;
        if (!status || !ALLOWED_STATUSES.includes(status)) {
            return errorResponse("Valid status required: pending, completed, or cancelled");
        }

        await connectToDb();

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return NextResponse.json(
                { success: false, message: "Appointment not found" },
                { status: 404 }
            );
        }

        if (String(appointment.doctor) !== String(doctorId)) {
            return NextResponse.json(
                { success: false, message: "You can only update your own appointments" },
                { status: 403 }
            );
        }

        appointment.status = status;
        if (status === "cancelled" && typeof message === "string" && message.trim()) {
            appointment.cancellationMessage = message.trim().slice(0, 500);
        }
        await appointment.save();

        return NextResponse.json(
            { success: true, message: "Appointment updated", appointment: { id: appointment._id, status: appointment.status } },
            { status: 200 }
        );
    } catch (err) {
        return handleError(err);
    }
}
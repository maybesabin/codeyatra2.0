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
        const { status, message, startTime, endTime, meetingLink } = body;
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
        if (status === "completed") {
            if (typeof startTime !== "string" || typeof endTime !== "string") {
                return errorResponse("startTime and endTime (HH:MM) are required when approving");
            }
            const toMinutes = (t: string) => {
                const m = /^(\d{2}):(\d{2})$/.exec(t);
                if (!m) return null;
                const h = Number(m[1]);
                const min = Number(m[2]);
                if (h < 0 || h > 23 || min < 0 || min > 59) return null;
                return h * 60 + min;
            };
            const startMin = toMinutes(startTime);
            const endMin = toMinutes(endTime);
            if (startMin === null || endMin === null || endMin <= startMin) {
                return errorResponse("Invalid time range. Use HH:MM, end must be after start.");
            }

            // Check overlap with other approved appointments for this doctor
            const others = await Appointment.find({
                doctor: appointment.doctor,
                status: "completed",
                _id: { $ne: appointmentId },
            }).lean();

            for (const other of others as { startTime?: string; endTime?: string }[]) {
                if (!other.startTime || !other.endTime) continue;
                const oStart = toMinutes(other.startTime);
                const oEnd = toMinutes(other.endTime);
                if (oStart === null || oEnd === null) continue;
                const overlap = !(endMin <= oStart || startMin >= oEnd);
                if (overlap) {
                    return errorResponse("Selected time overlaps with another approved appointment.");
                }
            }

            appointment.startTime = startTime;
            appointment.endTime = endTime;
            const trimmedLink =
                typeof meetingLink === "string" && meetingLink.trim().length > 0
                    ? meetingLink.trim()
                    : undefined;
            if (trimmedLink) {
                appointment.meetingLink = trimmedLink;
            } else if (!appointment.meetingLink) {
                const alphabet = "abcdefghijklmnopqrstuvwxyz";
                const randomCode = () => {
                    const part = () =>
                        Array.from({ length: 3 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
                    return `${part()}-${part()}-${part()}`;
                };
                appointment.meetingLink = `https://meet.google.com/${randomCode()}`;
            }
        }
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
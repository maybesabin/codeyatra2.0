import Appointment from "@/models/Appointment";
import Doctor from "@/models/Doctor";
import connectToDb from "@/utils/db";
import { handleError } from "@/utils/error";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

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

export async function GET(req: NextRequest) {
    try {
        const doctorId = getDoctorIdFromToken(req);
        if (!doctorId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Valid doctor token required." },
                { status: 401 }
            );
        }

        await connectToDb();

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return NextResponse.json(
                { success: false, message: "Doctor not found" },
                { status: 404 }
            );
        }

        const appointmentIds = doctor.appointments ?? [];
        if (appointmentIds.length === 0) {
            return NextResponse.json(
                { success: true, appointments: [], counts: { total: 0, pending: 0, completed: 0, cancelled: 0 } },
                { status: 200 }
            );
        }

        const appointments = await Appointment.find({ _id: { $in: appointmentIds } })
            .populate("user", "name age gender profilePicture")
            .populate("member", "name age gender profilePicture")
            .sort({ date: -1 })
            .lean();

        const counts = {
            total: appointments.length,
            pending: appointments.filter((a) => a.status === "pending").length,
            completed: appointments.filter((a) => a.status === "completed").length,
            cancelled: appointments.filter((a) => a.status === "cancelled").length,
        };

        const list = appointments.map((a) => {
            const u = a.user as unknown as { _id: string; name: string; age: number; gender: string; profilePicture?: string } | null;
            const m = a.member as unknown as { _id: string; name: string; age: number; gender: string; profilePicture?: string } | null;
            const displayName = m ? m.name : (u?.name ?? "Unknown");
            const age = m != null ? m.age : (u?.age ?? 0);
            const gender = (m ?? u)?.gender ?? "";
            return {
                id: a._id,
                user: displayName,
                age,
                gender: gender === "male" ? "M" : gender === "female" ? "F" : "O",
                problem: a.problem,
                bookedOn: (a as { createdAt?: string }).createdAt ?? a.date,
                date: a.date,
                status: a.status,
                priority: (a as { priority?: string }).priority,
                avatar: displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?",
                memberId: m?._id,
                userId: u?._id,
            };
        });

        return NextResponse.json(
            { success: true, appointments: list, counts },
            { status: 200 }
        );
    } catch (err) {
        return handleError(err);
    }
}

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

export async function GET(req: NextRequest) {
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
        if (appointmentIds.length === 0) {
            return NextResponse.json(
                { success: true, appointments: [] },
                { status: 200 }
            );
        }

        const appointments = await Appointment.find({ _id: { $in: appointmentIds } })
            .populate("doctor", "name profilePicture")
            .populate("member", "name")
            .sort({ date: -1 })
            .lean();

        const list = appointments.map((a) => {
            const doctor = a.doctor as unknown as { _id: string; name: string; profilePicture?: string } | null;
            const member = a.member as unknown as { _id: string; name: string } | null;
            const forName = member ? member.name : "Myself";
            return {
                id: a._id,
                doctorName: doctor?.name ?? "Unknown",
                problem: a.problem,
                date: a.date,
                status: a.status,
                forName,
                createdAt: (a as { createdAt?: string }).createdAt,
                cancellationMessage: (a as { cancellationMessage?: string }).cancellationMessage,
            };
        });

        return NextResponse.json(
            { success: true, appointments: list },
            { status: 200 }
        );
    } catch (err) {
        return handleError(err);
    }
}

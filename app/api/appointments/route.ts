import Appointment from "@/models/Appointment";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import connectToDb from "@/utils/db";
import type { Schema } from "mongoose";
import { handleError } from "@/utils/error";
import { errorResponse, successResponse } from "@/utils/response";
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
        const { doctorId, problem, date } = body;

        if (!doctorId || !problem || !date) {
            return errorResponse("Missing required fields: doctorId, problem, date");
        }

        const appointmentDate = new Date(date);
        if (Number.isNaN(appointmentDate.getTime())) {
            return errorResponse("Invalid date format");
        }

        await connectToDb();

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return errorResponse("Doctor not found");
        }
        if (!doctor.available) {
            return errorResponse("Doctor is not available for appointments");
        }
        if (doctor.verify !== true) {
            return errorResponse("Doctor is not verified yet");
        }

        const appointment = new Appointment({
            doctor: doctorId,
            user: userId,
            problem,
            date: appointmentDate,
            status: "pending",
        });
        await appointment.save();

        doctor.appointments = doctor.appointments || [];
        doctor.appointments.push(appointment._id as unknown as Schema.Types.ObjectId);
        await doctor.save();

        if (!user.appointments) user.appointments = [];
        user.appointments.push(appointment._id as unknown as Schema.Types.ObjectId);
        await user.save();

        return NextResponse.json(
            {
                success: true,
                message: "Appointment added successfully",
                appointment: {
                    id: appointment._id,
                    doctorId: doctor._id,
                    problem: appointment.problem,
                    date: appointment.date,
                    status: appointment.status,
                },
            },
            { status: 201 }
        );
    } catch (err) {
        return handleError(err);
    }
}

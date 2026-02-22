import Doctor from "@/models/Doctor";
import connectToDb from "@/utils/db";
import { handleError } from "@/utils/error";
import { errorResponse, successResponse } from "@/utils/response";
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

export async function POST(req: NextRequest) {
    try {
        const doctorId = getDoctorIdFromToken(req);
        if (!doctorId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Valid doctor token required." },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { citizenship, license } = body;

        if (!citizenship || !license) {
            return errorResponse("Both citizenship and license are required");
        }

        await connectToDb();

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return NextResponse.json(
                { success: false, message: "Doctor not found" },
                { status: 404 }
            );
        }

        doctor.citizenship = citizenship;
        doctor.license = license;
        await doctor.save();

        return successResponse(
            "Documents submitted successfully."
        );
    } catch (err) {
        return handleError(err);
    }
}

import Doctor from "@/models/Doctor";
import connectToDb from "@/utils/db";
import { handleError } from "@/utils/error";
import { errorResponse } from "@/utils/response";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return errorResponse("Email and password are required");
        }

        await connectToDb();

        const doctor = await Doctor.findOne({ email });
        if (!doctor) {
            return errorResponse("Invalid email or password");
        }

        const isMatch = await bcrypt.compare(password, doctor.password);
        if (!isMatch) {
            return errorResponse("Invalid email or password");
        }

        const token = jwt.sign(
            { id: doctor._id, email: doctor.email, role: "doctor" },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        return NextResponse.json(
            {
                success: true,
                message: "Logged in successfully",
                token,
                doctor: {
                    id: doctor._id,
                    name: doctor.name,
                    email: doctor.email,
                    profilePicture: doctor.profilePicture,
                    available: doctor.available,
                },
            },
            { status: 200 }
        );
    } catch (err) {
        return handleError(err);
    }
}

import { handleError } from "@/utils/error";
import { errorResponse } from "@/utils/response";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            return errorResponse("Admin credentials not configured");
        }

        const { email, password } = await req.json();
        if (!email || !password) {
            return errorResponse("Email and password required");
        }

        if (email !== adminEmail || password !== adminPassword) {
            return errorResponse("Invalid admin credentials");
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return errorResponse("JWT_SECRET not configured");
        }

        const token = jwt.sign(
            { id: adminEmail, email: adminEmail, role: "admin" },
            secret,
            { expiresIn: "7d" }
        );

        return NextResponse.json(
            { message: "Logged in successfully", token },
            { status: 200 }
        );
    } catch (err) {
        return handleError(err);
    }
}

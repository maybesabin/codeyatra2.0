import User from "@/models/User";
import connectToDb from "@/utils/db";
import { handleError } from "@/utils/error";
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

/** Submit or update your verification documents (citizenship, profile picture). */
export async function PATCH(req: NextRequest) {
    try {
        const userId = getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Valid user token required." },
                { status: 401 }
            );
        }
        const body = await req.json();
        const { citizenship, profilePicture } = body;
        if (!citizenship || typeof citizenship !== "string" || !citizenship.trim()) {
            return errorResponse("Citizenship document URL is required");
        }
        if (!profilePicture || typeof profilePicture !== "string" || !profilePicture.trim()) {
            return errorResponse("Profile picture URL is required");
        }
        await connectToDb();
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }
        user.citizenship = citizenship.trim();
        user.profilePicture = profilePicture.trim();
        await user.save();
        return NextResponse.json(
            { success: true, message: "Documents submitted for verification" },
            { status: 200 }
        );
    } catch (err) {
        return handleError(err);
    }
}

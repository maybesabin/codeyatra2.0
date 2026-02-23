import Member from "@/models/Member";
import User from "@/models/User";
import connectToDb from "@/utils/db";
import { handleError } from "@/utils/error";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

function getAdminIdFromToken(req: NextRequest): string | null {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.slice(7);
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: string;
            email: string;
            role?: string;
        };
        if (decoded.role !== "admin") return null;
        return decoded.id;
    } catch {
        return null;
    }
}

export async function GET(req: NextRequest) {
    try {
        const adminId = getAdminIdFromToken(req);
        if (!adminId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Admin access required." },
                { status: 401 }
            );
        }
        await connectToDb();
        const user = await User.findById(adminId);
        if (!user || !(user as { isAdmin?: boolean }).isAdmin) {
            return NextResponse.json(
                { success: false, message: "Forbidden. Super admin only." },
                { status: 403 }
            );
        }
        const pending = await Member.find({ verify: false })
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .lean();
        const list = pending.map((p) => {
            const u = p.user as unknown as { _id: string; name: string; email: string } | null;
            return {
                id: p._id,
                userName: u?.name ?? "Unknown",
                userEmail: u?.email ?? "",
                userId: u?._id,
                name: p.name,
                gender: p.gender,
                age: p.age,
                profilePicture: p.profilePicture,
                citizenship: p.citizenship,
                createdAt: (p as { createdAt?: string }).createdAt,
            };
        });
        return NextResponse.json(
            { success: true, requests: list },
            { status: 200 }
        );
    } catch (err) {
        return handleError(err);
    }
}

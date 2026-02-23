import Member from "@/models/Member";
import User from "@/models/User";
import connectToDb from "@/utils/db";
import { handleError } from "@/utils/error";
import { errorResponse } from "@/utils/response";
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

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const adminId = getAdminIdFromToken(req);
        if (!adminId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Admin access required." },
                { status: 401 }
            );
        }
        await connectToDb();
        const adminUser = await User.findById(adminId);
        if (!adminUser || !(adminUser as { isAdmin?: boolean }).isAdmin) {
            return NextResponse.json(
                { success: false, message: "Forbidden. Super admin only." },
                { status: 403 }
            );
        }
        const { id: memberId } = await params;
        if (!memberId) {
            return errorResponse("Member ID required");
        }
        const member = await Member.findById(memberId);
        if (!member) {
            return NextResponse.json(
                { success: false, message: "Member not found" },
                { status: 404 }
            );
        }
        if (member.verify) {
            return errorResponse("Member is already approved");
        }
        const ownerId = member.user;
        await Member.findByIdAndDelete(memberId);
        if (ownerId) {
            const owner = await User.findById(ownerId);
            if (owner && owner.member && owner.member.length) {
                owner.member = owner.member.filter((id) => String(id) !== String(memberId)) as unknown as typeof owner.member;
                await owner.save();
            }
        }
        return NextResponse.json(
            { success: true, message: "Request rejected" },
            { status: 200 }
        );
    } catch (err) {
        return handleError(err);
    }
}

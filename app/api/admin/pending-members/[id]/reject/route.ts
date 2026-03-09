import Member from "@/models/Member";
import connectToDb from "@/utils/db";
import { handleError } from "@/utils/error";
import { errorResponse } from "@/utils/response";
import { verifyAdminToken } from "@/utils/adminAuth";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!verifyAdminToken(req)) {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Admin access required." },
                { status: 401 }
            );
        }
        await connectToDb();
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

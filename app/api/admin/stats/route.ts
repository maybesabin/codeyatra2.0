import Doctor from "@/models/Doctor";
import Member from "@/models/Member";
import User from "@/models/User";
import connectToDb from "@/utils/db";
import { handleError } from "@/utils/error";
import { verifyAdminToken } from "@/utils/adminAuth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        if (!verifyAdminToken(req)) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        await connectToDb();
        const [userCount, doctorCount, memberCount, verifiedUsers, unverifiedUsers, verifiedDoctors, unverifiedDoctors] = await Promise.all([
            User.countDocuments({ isAdmin: { $ne: true } }),
            Doctor.countDocuments(),
            Member.countDocuments(),
            User.countDocuments({ isAdmin: { $ne: true }, verify: true }),
            User.countDocuments({ isAdmin: { $ne: true }, verify: false }),
            Doctor.countDocuments({ verify: true }),
            Doctor.countDocuments({ verify: false }),
        ]);
        const verifiedMembers = await Member.countDocuments({ verify: true });
        const unverifiedMembers = await Member.countDocuments({ verify: false });
        return NextResponse.json({
            success: true,
            stats: {
                users: userCount,
                doctors: doctorCount,
                members: memberCount,
                verifiedUsers,
                unverifiedUsers,
                verifiedDoctors,
                unverifiedDoctors,
                verifiedMembers,
                unverifiedMembers,
            },
        }, { status: 200 });
    } catch (err) {
        return handleError(err);
    }
}

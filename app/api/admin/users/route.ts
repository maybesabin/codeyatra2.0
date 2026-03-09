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
        const users = await User.find({ isAdmin: { $ne: true } })
            .populate("member")
            .sort({ createdAt: -1 })
            .lean();
        const list = users.map((u) => {
            const members = (u.member || []) as unknown as Array<{ _id: string; name: string; age: number; gender: string; verify?: boolean }>;
            return {
                id: u._id,
                name: u.name,
                email: u.email,
                age: u.age,
                gender: u.gender,
                verify: (u as { verify?: boolean }).verify ?? false,
                profilePicture: u.profilePicture,
                citizenship: (u as { citizenship?: string }).citizenship,
                members: members.map((m) => ({
                    id: m._id,
                    name: m.name,
                    age: m.age,
                    gender: m.gender,
                    verify: m.verify ?? false,
                })),
            };
        });
        return NextResponse.json({ success: true, users: list }, { status: 200 });
    } catch (err) {
        return handleError(err);
    }
}

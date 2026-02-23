import Member from "@/models/Member";
import connectToDb from "@/utils/db";
import { handleError } from "@/utils/error";
import { verifyAdminToken } from "@/utils/adminAuth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        if (!verifyAdminToken(req)) {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Admin access required." },
                { status: 401 }
            );
        }
        await connectToDb();
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

import Appointment from "@/models/Appointment";
import Member from "@/models/Member";
import User from "@/models/User";
import connectToDb from "@/utils/db";
import { handleError } from "@/utils/error";
import { verifyAdminToken } from "@/utils/adminAuth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!verifyAdminToken(req)) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        const { id } = await params;
        if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });
        await connectToDb();
        const user = await User.findById(id).populate("member").lean();
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }
        const u = user as { _id: string; name: string; email: string; age: number; gender: string; verify?: boolean; profilePicture?: string; citizenship?: string; member?: unknown[] };
        const members = (u.member || []) as Array<{ _id: string; name: string; age: number; gender: string; profilePicture?: string; citizenship?: string; verify?: boolean }>;
        return NextResponse.json({
            success: true,
            user: {
                id: u._id,
                name: u.name,
                email: u.email,
                age: u.age,
                gender: u.gender,
                verify: u.verify ?? false,
                profilePicture: u.profilePicture,
                citizenship: u.citizenship,
                members: members.map((m) => ({
                    id: m._id,
                    name: m.name,
                    age: m.age,
                    gender: m.gender,
                    profilePicture: m.profilePicture,
                    citizenship: m.citizenship,
                    verify: m.verify ?? false,
                })),
            },
        }, { status: 200 });
    } catch (err) {
        return handleError(err);
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!verifyAdminToken(req)) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        const { id } = await params;
        if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });
        await connectToDb();
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }
        const memberIds = user.member || [];
        await Member.deleteMany({ _id: { $in: memberIds } });
        await Appointment.deleteMany({ user: id });
        await User.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: "User deleted" }, { status: 200 });
    } catch (err) {
        return handleError(err);
    }
}

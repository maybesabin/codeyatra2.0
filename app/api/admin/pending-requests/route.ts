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
            return NextResponse.json(
                { success: false, message: "Unauthorized. Admin access required." },
                { status: 401 }
            );
        }
        await connectToDb();

        const [members, users, doctors] = await Promise.all([
            Member.find({ verify: false })
                .populate("user", "name email")
                .sort({ createdAt: -1 })
                .lean(),
            User.find({ isAdmin: { $ne: true }, verify: false })
                .select("name email age gender")
                .sort({ createdAt: -1 })
                .lean(),
            Doctor.find({ verify: false })
                .select("name email age gender")
                .sort({ createdAt: -1 })
                .lean(),
        ]);

        const memberList = members.map((p) => {
            const u = p.user as unknown as { _id: string; name: string; email: string } | null;
            return {
                type: "member" as const,
                id: String(p._id),
                name: p.name,
                email: u?.email ?? "",
                age: p.age,
                gender: p.gender,
                userName: u?.name ?? "Unknown",
                userEmail: u?.email ?? "",
            };
        });

        const userList = users.map((u) => ({
            type: "user" as const,
            id: String((u as { _id: unknown })._id),
            name: (u as { name: string }).name,
            email: (u as { email: string }).email,
            age: (u as { age: number }).age,
            gender: (u as { gender: string }).gender,
        }));

        const doctorList = doctors.map((d) => ({
            type: "doctor" as const,
            id: String((d as { _id: unknown })._id),
            name: (d as { name: string }).name,
            email: (d as { email: string }).email,
            age: (d as { age: number }).age,
            gender: (d as { gender: string }).gender,
        }));

        const requests = [...memberList, ...userList, ...doctorList];

        return NextResponse.json(
            { success: true, requests },
            { status: 200 }
        );
    } catch (err) {
        return handleError(err);
    }
}

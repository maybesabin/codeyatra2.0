import Doctor from "@/models/Doctor";
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
        const doctors = await Doctor.find().sort({ createdAt: -1 }).lean();
        const list = doctors.map((d) => ({
            id: d._id,
            name: d.name,
            email: d.email,
            age: d.age,
            gender: d.gender,
            verify: (d as { verify?: boolean }).verify ?? false,
            profilePicture: d.profilePicture,
            citizenship: (d as { citizenship?: string }).citizenship,
            license: (d as { license?: string }).license,
            available: (d as { available?: boolean }).available ?? true,
        }));
        return NextResponse.json({ success: true, doctors: list }, { status: 200 });
    } catch (err) {
        return handleError(err);
    }
}

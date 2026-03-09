import Doctor from "@/models/Doctor";
import connectToDb from "@/utils/db";
import { handleError } from "@/utils/error";
import { verifyAdminToken } from "@/utils/adminAuth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!verifyAdminToken(req)) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        const { id } = await params;
        if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });
        const body = await req.json();
        const verify = typeof body.verify === "boolean" ? body.verify : undefined;
        if (verify === undefined) {
            return NextResponse.json({ success: false, message: "verify (boolean) required" }, { status: 400 });
        }
        await connectToDb();
        const doctor = await Doctor.findByIdAndUpdate(id, { verify }, { new: true });
        if (!doctor) {
            return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, verify: doctor.verify }, { status: 200 });
    } catch (err) {
        return handleError(err);
    }
}

import Appointment from "@/models/Appointment";
import Doctor from "@/models/Doctor";
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
        const doctor = await Doctor.findById(id).lean();
        if (!doctor) {
            return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 });
        }
        const d = doctor as { _id: string; name: string; email: string; age: number; gender: string; verify?: boolean; profilePicture?: string; citizenship?: string; license?: string; available?: boolean };
        return NextResponse.json({
            success: true,
            doctor: {
                id: d._id,
                name: d.name,
                email: d.email,
                age: d.age,
                gender: d.gender,
                verify: d.verify ?? false,
                profilePicture: d.profilePicture,
                citizenship: d.citizenship,
                license: d.license,
                available: d.available ?? true,
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
        const doctor = await Doctor.findById(id);
        if (!doctor) {
            return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 });
        }
        await Appointment.deleteMany({ doctor: id });
        await Doctor.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: "Doctor deleted" }, { status: 200 });
    } catch (err) {
        return handleError(err);
    }
}

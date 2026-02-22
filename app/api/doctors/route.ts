import Doctor from "@/models/Doctor";
import connectToDb from "@/utils/db";
import { handleError } from "@/utils/error";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectToDb();
        const doctors = await Doctor.find({ verify: true, available: true })
            .select("name _id profilePicture")
            .lean();
        return NextResponse.json({
            success: true,
            doctors: doctors.map((d) => ({ id: d._id, name: d.name, profilePicture: d.profilePicture })),
        }, { status: 200 });
    } catch (err) {
        return handleError(err);
    }
}

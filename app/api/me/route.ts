import Doctor from "@/models/Doctor";
import User from "@/models/User";
import connectToDb from "@/utils/db";
import { handleError } from "@/utils/error";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

function getDecodedFromToken(req: NextRequest): { id: string; role: string } | null {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      role?: string;
    };
    const role = decoded.role === "doctor" ? "doctor" : "user";
    return { id: decoded.id, role };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const decoded = getDecodedFromToken(req);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }
    await connectToDb();
    if (decoded.role === "doctor") {
      const doctor = await Doctor.findById(decoded.id)
        .select("name profilePicture")
        .lean();
      if (!doctor) {
        return NextResponse.json(
          { success: false, message: "Doctor not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        name: doctor.name,
        profilePicture: doctor.profilePicture ?? "",
        role: "doctor",
      });
    }
    const user = await User.findById(decoded.id)
      .select("name profilePicture")
      .lean();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      name: user.name,
      profilePicture: user.profilePicture ?? "",
      role: "user",
    });
  } catch (err) {
    return handleError(err);
  }
}

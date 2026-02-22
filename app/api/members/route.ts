import Member from "@/models/Member";
import User from "@/models/User";
import connectToDb from "@/utils/db";
import { handleError } from "@/utils/error";
import { errorResponse } from "@/utils/response";
import jwt from "jsonwebtoken";
import type { Schema } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

function getUserIdFromToken(req: NextRequest): string | null {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.slice(7);
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: string;
            email: string;
            role?: string;
        };
        if (decoded.role !== "user") return null;
        return decoded.id;
    } catch {
        return null;
    }
}

export async function GET(req: NextRequest) {
    try {
        const userId = getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Valid user token required." },
                { status: 401 }
            );
        }
        await connectToDb();
        const user = await User.findById(userId).populate("member").lean();
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }
        const members = (user.member ?? []) as unknown as Array<{ _id: string; name: string; gender: string; age: number; profilePicture: string; problem?: string }>;
        return NextResponse.json(
            { success: true, members: members.map((m) => ({ id: m._id, name: m.name, gender: m.gender, age: m.age, profilePicture: m.profilePicture, problem: m.problem })) },
            { status: 200 }
        );
    } catch (err) {
        return handleError(err);
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Valid user token required." },
                { status: 401 }
            );
        }
        const body = await req.json();
        const { name, gender, age, profilePicture } = body;
        if (!name || !gender || !age || profilePicture === undefined) {
            return errorResponse("Missing required fields: name, gender, age, profilePicture");
        }
        const ageNum = Number(age);
        if (Number.isNaN(ageNum) || ageNum < 1 || ageNum > 150) {
            return errorResponse("Age must be a number between 1 and 150");
        }
        const validGenders = ["male", "female", "other", "others"];
        if (!validGenders.includes(String(gender).toLowerCase())) {
            return errorResponse("Invalid gender");
        }
        await connectToDb();
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }
        const member = new Member({
            name,
            gender: String(gender).toLowerCase() === "others" ? "other" : String(gender).toLowerCase(),
            age: ageNum,
            profilePicture: profilePicture || "",
            problem: "",
            verify: false,
            isAdmin: false,
            citizenship: "",
        });
        await member.save();
        const memberIds = (user.member ?? []) as Schema.Types.ObjectId[];
        memberIds.push(member._id as unknown as Schema.Types.ObjectId);
        user.member = memberIds as unknown as typeof user.member;
        await user.save();
        return NextResponse.json(
            { success: true, message: "Family member added", member: { id: member._id, name: member.name, gender: member.gender, age: member.age, profilePicture: member.profilePicture } },
            { status: 201 }
        );
    } catch (err) {
        return handleError(err);
    }
}


import User from "@/models/User";
import connectToDb from "@/utils/db";
import { handleError } from "@/utils/error";
import { errorResponse } from "@/utils/response";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { NextResponse } from "next/server";

export async function POST(req: Request) {

    try {
        await connectToDb()
        const { email, password } = await req.json();
        const user = await User.findOne({ email })
        if (!user) return errorResponse("User not found")

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return errorResponse("Wrong credentials")

        const token = jwt.sign(
            { id: user._id, email: user.email, role: "user" },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        )

        return NextResponse.json({
            message: "Logged in successfully",
            token
        }, {
            status: 200
        })

    } catch (err) {
        return handleError(err)
    }

}
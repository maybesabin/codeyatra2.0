import bcrypt from "bcrypt";
import { User } from "@/models/User";
import connectToDb from "../../../utils/db";
import { errorResponse, successResponse } from "@/utils/response";
import { handleError } from "@/utils/error";

export async function POST(req: Request) {
    try {
        const { name, email, password, gender, familyMembers } = await req.json();

        if (!name || !email || !password || !gender) {
            return errorResponse("Missing required fields");
        }

        await connectToDb();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return errorResponse("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            gender,
            familyMembers: familyMembers || [],
        });

        await newUser.save();

        return successResponse("User created successfully");
    } catch (err) {
        console.error(err);
        return handleError(err);
    }
}
import bcrypt from "bcrypt";
import connectToDb from "../../../utils/db";
import { errorResponse, successResponse } from "@/utils/response";
import { handleError } from "@/utils/error";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        const { name, email, password, gender, citizenship, age } = await req.json();

        if (!name || !email || !password || !gender || !citizenship || !age
        ) {
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
            verify: false,
            citizenship,
            gender,
            age,
            profilePicture: "https://www.istockphoto.com/illustrations/penguin"
        });

        await newUser.save();

        return successResponse("User created successfully");
    } catch (err) {
        console.error(err);
        return handleError(err);
    }
}
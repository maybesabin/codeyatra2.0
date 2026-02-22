import bcrypt from "bcrypt";
import connectToDb from "../../../utils/db";
import { errorResponse, successResponse } from "@/utils/response";
import { handleError } from "@/utils/error";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
<<<<<<< HEAD
        const { name, email, password, gender, age, profilePicture } = await req.json();

        if (!name || !email || !password || !gender || !age
=======
        const { name, email, password, gender, citizenship, age } = await req.json();

        if (!name || !email || !password || !gender || !citizenship || !age
>>>>>>> a1a6020fa478937e71644570e20bf088ee80ede9
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
<<<<<<< HEAD
            gender,
            age,
            profilePicture
=======
            citizenship,
            gender,
            age,
            profilePicture: "https://www.istockphoto.com/illustrations/penguin"
>>>>>>> a1a6020fa478937e71644570e20bf088ee80ede9
        });

        await newUser.save();

        return successResponse("User created successfully");
    } catch (err) {
        console.error(err);
        return handleError(err);
    }
}
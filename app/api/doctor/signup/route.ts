import bcrypt from "bcrypt";
import Doctor from "@/models/Doctor";
import connectToDb from "@/utils/db";
import { errorResponse, successResponse } from "@/utils/response";
import { handleError } from "@/utils/error";

const VALID_GENDERS = ["male", "female", "others"] as const;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, gender, age, profilePicture } = body;

        if (!name || !email || !password || !gender || !age || !profilePicture) {
            return errorResponse("Missing required fields: name, email, password, gender, age, profilePicture");
        }

        if (!VALID_GENDERS.includes(gender)) {
            return errorResponse("Invalid gender. Must be male, female, or others");
        }

        if (typeof age !== "number" || age < 1 || age > 150) {
            return errorResponse("Age must be a number between 1 and 150");
        }

        await connectToDb();

        const existingDoctor = await Doctor.findOne({ email });
        if (existingDoctor) {
            return errorResponse("A doctor with this email already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newDoctor = new Doctor({
            name,
            email,
            password: hashedPassword,
            gender,
            age,
            profilePicture,
            verify: false,
            available: true,
            appointments: [],
            isAdmin: false,
        });

        await newDoctor.save();

        return successResponse("Doctor registered successfully");
    } catch (err) {
        return handleError(err);
    }
}

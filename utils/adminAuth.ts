import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export function verifyAdminToken(req: NextRequest): boolean {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return false;
    const token = authHeader.slice(7);
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role?: string };
        return decoded.role === "admin";
    } catch {
        return false;
    }
}

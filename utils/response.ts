import { NextResponse } from "next/server";

export const successResponse = (message: string) => {
    return NextResponse.json({ success: true, message }, { status: 200 });
}

export const errorResponse = (message: string) => {
    return NextResponse.json({ success: false, message }, { status: 400 });
}
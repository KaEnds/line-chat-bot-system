import { getFacultiesAndDepartment } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const requests = await getFacultiesAndDepartment();
        if(!requests || requests.length === 0) {
            return NextResponse.json({ status: 'error', message: 'No data found' }, { status: 404 });
        }

        return NextResponse.json({ status: 'success', requests }, { status: 200 });

    } catch (error) {
        console.error('Error handling GET request:', error);
    }
}
import { getMyRequests } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('Requester ID:', body.requesterID);
        const requestInfo = await getMyRequests(body.requesterID);
        console.log('Request Info:', requestInfo);

        if (!requestInfo || requestInfo.length === 0) {
            return NextResponse.json({ status: 'error', message: 'No requests found' }, { status: 404 });
        }

        return NextResponse.json({status: 'success', requestInfo}, {status: 200});
    } catch (error) {
        console.error('Error fetching requests:', error);
    }
}
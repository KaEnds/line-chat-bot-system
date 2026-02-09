import { getSupporterRequest, insertSupporterRequest } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request){
    try{
        const requestData = await request.json();
        
        if (Object.keys(requestData).length === 0) {
            const supporterData = await getSupporterRequest()
            return NextResponse.json({ status: 'success', supporterData }, { status: 200 });
        }

        const response = await insertSupporterRequest(requestData.request_id, requestData.requester_id)

        console.log(requestData)
        if(!response) {
            throw new Error('Failed to insert book request')
        }

        console.log('inserted successfully')
    }
    catch(error){
        console.log('Error processing request', error);
        return NextResponse.json({ status: 'error', message: 'Invalid request data'}, { status: 400 });
    }
    return NextResponse.json({ status: 'success', message: 'Form data received' }, { status: 200 });
}
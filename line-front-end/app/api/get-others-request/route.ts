import { getOthersRequests } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from 'zod';

const FormDataSchema = z.object({
    requesterID: z.string()
})

export async function POST(request: Request) {
    try {

        const formData = await request.json()

        const validation = FormDataSchema.parse(formData);
        
        if(!validation){
            throw new Error('Validation failed');
        }

        const requests = await getOthersRequests(formData.requesterID);
        if(!requests || requests.length === 0) {
            return NextResponse.json({ status: 'error', message: 'No requests found' }, { status: 404 });
        }       

        return NextResponse.json({ status: 'success', requests }, { status: 200 });

    } catch (error) {
        console.error('Error handling GET request:', error);
    }

}
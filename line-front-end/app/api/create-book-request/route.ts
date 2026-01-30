import { z } from 'zod';

const FormDataSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    studentId: z.string().max(225),
    academicYear: z.string(),
    department: z.string(),
    major: z.string(),
    email: z.string(),
    title: z.string(),
    author: z.string(),
    isbn: z.string().max(30),
    publishYear: z.string().max(4),
    publisher: z.string(),
    reason: z.string(),
    reasonDescription: z.string()
});

export async function POST(request: Request) {
    try {
        const formData = await request.json();

        const validatedData = FormDataSchema.parse(formData);
        if (!validatedData) {
            throw new Error('Validation failed');
        }

        



        console.log('Received Form Data:', validatedData);
    } catch (error) {
        console.log('Error processing request:', error);
        return new Response(JSON.stringify({ status: 'error', message: 'Invalid request data' }), { status: 400 });
    }
    return new Response(JSON.stringify({ status: 'success', message: 'Form data received' }), { status: 200 });
}
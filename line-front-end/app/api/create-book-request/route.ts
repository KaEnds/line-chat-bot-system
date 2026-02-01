import { insertBookRequest } from '@/lib/db';
import { z } from 'zod';

const FormDataSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    studentId: z.string(),
    academicYear: z.string(),
    department: z.string(),
    faculty: z.string(),
    email: z.string(),
    title: z.string(),
    author: z.string(),
    isbn: z.string().max(30),
    publishYear: z.string().max(4),
    publisher: z.string(),
    reason: z.string(),
    reasonDescription: z.string(),
    branch: z.string()
});

export async function POST(request: Request) {
    try {
        const formData = await request.json();

        const validatedData = FormDataSchema.parse(formData);
        if (!validatedData) {
            throw new Error('Validation failed');
        }

        const formatedformData = {
            title: validatedData.title,
            authors: validatedData.author,
            isbn_issn: validatedData.isbn,
            publication_year: parseInt(validatedData.publishYear, 10), 
            publisher: validatedData.publisher,
            branch: validatedData.branch,
            requester_name: `${validatedData.firstName} ${validatedData.lastName}`,
            requester_id: validatedData.studentId,
            requester_role: 'student',
            faculty_id: parseInt(validatedData.faculty, 10),
            department_id: parseInt(validatedData.department, 10),
            request_reason_category: validatedData.reason,
            specify_reason: validatedData.reasonDescription,
        }

        const requestDB = await insertBookRequest(formatedformData);

        if (!requestDB) {
            throw new Error('Failed to insert book request');
        }

        console.log('Received Form Data:', validatedData);
    } catch (error) {
        console.log('Error processing request:', error);
        return new Response(JSON.stringify({ status: 'error', message: 'Invalid request data' }), { status: 400 });
    }
    return new Response(JSON.stringify({ status: 'success', message: 'Form data received' }), { status: 200 });
}
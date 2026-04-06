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
    let formData: unknown;

    try {
        formData = await request.json();
    } catch {
        return new Response(JSON.stringify({ status: 'error', message: 'Request body must be valid JSON' }), { status: 400 });
    }

    const validatedData = FormDataSchema.safeParse(formData);
    if (!validatedData.success) {
        return new Response(
            JSON.stringify({
                status: 'error',
                message: 'Invalid request data',
                errors: validatedData.error.flatten().fieldErrors,
            }),
            { status: 400 }
        );
    }

    const publicationYear = parseInt(validatedData.data.publishYear, 10);
    const facultyId = parseInt(validatedData.data.faculty, 10);
    const departmentId = parseInt(validatedData.data.department, 10);

    if ([publicationYear, facultyId, departmentId].some(Number.isNaN)) {
        return new Response(
            JSON.stringify({
                status: 'error',
                message: 'publishYear, faculty, and department must be valid numbers',
            }),
            { status: 400 }
        );
    }

    try {
        const formatedformData = {
            title: validatedData.data.title,
            authors: validatedData.data.author,
            isbn_issn: validatedData.data.isbn,
            publication_year: publicationYear,
            publisher: validatedData.data.publisher,
            branch: validatedData.data.branch,
            requester_name: `${validatedData.data.firstName} ${validatedData.data.lastName}`,
            requester_id: validatedData.data.studentId,
            requester_role: 'student',
            faculty_id: facultyId,
            department_id: departmentId,
            request_reason_category: validatedData.data.reason,
            specify_reason: validatedData.data.reasonDescription,
        };

        const requestDB = await insertBookRequest(formatedformData);
        if (!requestDB) {
            return new Response(
                JSON.stringify({
                    status: 'error',
                    message: 'No active batch is available for book requests right now',
                }),
                { status: 409 }
            );
        }

        console.log('Received Form Data:', validatedData.data);
        return new Response(
            JSON.stringify({
                status: 'success',
                message: 'Form data received',
                requestId: requestDB.new_id,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.log('Error processing request:', error);
        return new Response(
            JSON.stringify({ status: 'error', message: 'Failed to create book request' }),
            { status: 500 }
        );
    }
}
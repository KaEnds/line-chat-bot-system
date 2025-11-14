import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// เราจะใช้ handler ที่เราสร้างไว้ใน route.ts หลัก
import { handler as authHandler } from "@/app/api/auth/[...nextauth]/route";

// --- (สำคัญ!) แก้ไข URL นี้ ---
// นี่คือ URL ที่ชี้ไปที่ Backend (Python) ของคุณ
// (Docker Compose ทำให้ service 'backend' คุยกันได้ผ่านชื่อ 'http://backend:8000')
const PYTHON_BACKEND_URL = "http://backend:8000/api/books";
// ------------------------------

export async function GET(
request: Request,
{ params }: { params: { id: string } }
) {
// 1. ตรวจสอบสิทธิ์ (Security)
// เช็กว่าผู้ใช้ล็อกอินหรือยัง ก่อนที่จะยิง API
const session = await getServerSession(authHandler);
if (!session || !session.user) {
return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

const { id } = params;
if (!id) {
return NextResponse.json({ error: "Book ID is required" }, { status: 400 });
}

try {
// 2. ยิง API ไปที่ Python Backend
// (สมมติว่า API ของ Python คุณคือ http://backend:8000/api/books/123)
const response = await fetch(${PYTHON_BACKEND_URL}/${id}, {
// (ถ้า Python API ของคุณต้องการ Header พิเศษ ก็ใส่ตรงนี้)
// headers: { ... }
});

if (!response.ok) {
  // ถ้า Python ตอบ Error (เช่น 404 Not Found)
  return NextResponse.json(
    { error: "Book not found from backend" },
    { status: response.status }
  );
}

// 3. ถ้าสำเร็จ ส่ง "ก้อนข้อมูล" (JSON) กลับไปให้หน้าเว็บ
const data = await response.json();

// (สำคัญ!) ตรวจสอบว่า "ก้อนข้อมูล" ที่ Python ส่งมา
// มี field ตรงกับ Interface `BookData` (title, author, isbn, ...)
// ในหน้า `book-details/[id]/page.tsx`

return NextResponse.json(data);


} catch (error) {
console.error("Failed to fetch from Python backend:", error);
return NextResponse.json(
{ error: "Internal Server Error" },
{ status: 500 }
);
}
}
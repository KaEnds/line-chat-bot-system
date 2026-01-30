import { insertWebUser, testConnection } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. เช็คการเชื่อมต่อ
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json({ status: 'error', message: 'DB Connection Down' }, { status: 503 });
    }

    // 2. ข้อมูล Mock Up สำหรับ web_user ตามคอลัมน์ที่ระบุ
    const mockUser = {
      username: "admin_library_01",
      password: "securepassword123", // ข้อมูลสมมติ
      user_role: "admin",
      account_status: "active",
      name: "สมชาย",
      surname: "รักดี"
    };

    // 3. ทำการ Insert
    const result = await insertWebUser(mockUser);

    return NextResponse.json({
      status: 'success',
      message: 'สร้าง User Mock สำหรับตาราง web_user สำเร็จ!',
      data: result
    }, { status: 201 });

  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown Error'
    }, { status: 500 });
  }
}
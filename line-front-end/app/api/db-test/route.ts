import { getTestBib, testConnection } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 1. ตรวจสอบการเชื่อมต่อก่อน
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Database connection failed' 
        }, 
        { status: 503 }
      );
    }

    // 2. เรียกใช้ getTestBib ด้วย await (ดึงข้อมูล 50 แถวแรก)
    const data = await getTestBib(10);

    // 3. ส่งข้อมูลกลับไป
    return NextResponse.json(
      { 
        status: 'success',
        message: 'Data fetched successfully',
        count: data.length,
        environment: process.env.NODE_ENV,
        serverTime: new Date().toISOString(),
        data: data // ข้อมูลจากตาราง test_bib จะอยู่ในนี้
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
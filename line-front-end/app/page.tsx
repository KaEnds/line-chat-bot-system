import { redirect } from 'next/navigation';

/**
 * นี่คือหน้า Homepage (/)
 * เราจะใช้ Server-side redirect เพื่อส่งผู้ใช้ไปหน้า /login ทันที
 */
export default function HomePage() {
  // สั่ง redirect ไปที่หน้า login
  redirect('/login');

  // ส่วนนี้จะไม่ถูก render เพราะ redirect จะทำงานก่อน
  // แต่เราใส่ไว้เผื่อกรณีที่ redirect ใช้เวลาเล็กน้อย
  return (
    <div className="min-h-screen bg-[#FFB133] flex items-center justify-center">
      <p className="text-black text-xl">Redirecting to login...</p>
    </div>
  );
}

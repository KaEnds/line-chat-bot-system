"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Interface สำหรับ state ของฟอร์ม
interface FormData {
  firstName: string;
  lastName: string;
  studentId: string;
  academicYear: string;
  department: string; // <-- เราจะ Autofill อันนี้ด้วย
  email: string;
  topic: string;
  author: string;
  isbn: string;
  publishYear: string;
  publisher: string;
  reason: string;
}

export default function BookRequestPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    studentId: "",
    academicYear: "",
    department: "", // <-- เริ่มต้นเป็นค่าว่าง
    email: "",
    topic: "",
    author: "",
    isbn: "",
    publishYear: "",
    publisher: "",
    reason: "",
  });

  const { data: session, status } = useSession();
  const router = useRouter();

  // useEffect นี้จะทำงานเมื่อ session เปลี่ยน
  useEffect(() => {
    // 1. ตรวจสอบสถานะ Loading
    if (status === "loading") {
      return; // กำลังโหลด... ยังไม่ต้องทำอะไร
    }

    // 2. ถ้ายังไม่ Login (unauthenticated) ให้เด้งไปหน้า login
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // 3. ถ้า Login แล้ว (authenticated) ให้ Autofill ข้อมูล
    if (status === "authenticated" && session?.user) {
      const user = session.user;
      
      // พยายามแยกชื่อและนามสกุลจาก name
      const nameParts = user.name?.split(' ') || [''];
      const fName = nameParts[0] || '';
      const lName = nameParts.slice(1).join(' ') || '';

      setFormData(prev => ({
        ...prev,
        firstName: fName,
        lastName: lName,
        email: user.email || "",
        // [อัปเดต] ตอนนี้ user object ของเราจะมี type ที่ถูกต้องแล้ว
        studentId: user.studentId || "", 
        department: user.department || "", // <-- [เพิ่ม] Autofill ภาควิชา
      }));
    }

  }, [status, session, router]); // ทำงานเมื่อ 3 ค่านี้เปลี่ยน

  // Handler สำหรับ Input ธรรมดา
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler สำหรับ Select (shadcn/ui ใช้ onValueChange)
  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler สำหรับการ Submit ฟอร์ม
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: ส่งข้อมูล formData ไปยัง Backend (Python)
    console.log("Form data submitted:", formData);
  };

  // Handler สำหรับ Logout
  const handleSignOut = () => {
    // สั่ง Logout และเด้งกลับไปหน้า Login
    signOut({ callbackUrl: '/login' });
  };


  // แสดงหน้า Loading ขณะรอ session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#FFB133] p-4 md:p-8 flex items-center justify-center">
        <p className="text-white text-xl font-bold">Loading...</p>
      </div>
    )
  }

  // ถ้ายังไม่ Login (หรือกำลังเด้ง) ก็ไม่ต้องแสดงฟอร์ม
  if (status !== "authenticated") {
     return (
      <div className="min-h-screen bg-[#FFB133] p-4 md:p-8 flex items-center justify-center">
        <p className="text-white text-xl font-bold">Redirecting to login...</p>
      </div>
    )
  }

  return (
    // Container ที่ responsive
    <div className="min-h-screen bg-[#FFB133] p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md">
        
        {/* ย้ายปุ่ม Logout มาทางขวา */}
        <div className="flex justify-end items-center mb-4">
          <Button 
            variant="outline" 
            size="sm"
            className="text-red-500 border-red-500 hover:bg-red-50"
            onClick={handleSignOut}
          >
            Logout
          </Button>
        </div>


        <h1 className="text-2xl font-bold text-center mb-6">
          ลงทะเบียนคำขอจัดซื้อหนังสือ
        </h1>
        <p className="text-center text-gray-500 mb-8">
          กรุณาตรวจสอบข้อมูลให้ถูกต้อง
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* --- ส่วนข้อมูลผู้ใช้ (Responsive Grid) --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">ชื่อ</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName} // <-- Autofill
                placeholder="Auto fill"
                readOnly // <-- ข้อมูลจาก Authen ควรอ่านอย่างเดียว
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">สกุล</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName} // <-- Autofill
                placeholder="Auto fill"
                readOnly // <-- ข้อมูลจาก Authen ควรอ่านอย่างเดียว
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentId">รหัสนักศึกษา</Label>
              <Input
                id="studentId"
                name="studentId"
                value={formData.studentId} // <-- Autofill
                placeholder="Auto fill"
                readOnly // <-- ข้อมูลจาก Authen ควรอ่านอย่างเดียว
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="academicYear">ชั้นปี</Label>
              <Select onValueChange={handleSelectChange("academicYear")} value={formData.academicYear}>
                <SelectTrigger id="academicYear">
                  <SelectValue placeholder="เลือกชั้นปี" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">ปี 1</SelectItem>
                  <SelectItem value="2">ปี 2</SelectItem>
                  <SelectItem value="3">ปี 3</SelectItem>
                  <SelectItem value="4">ปี 4</SelectItem>
                  <SelectItem value="5">สูงกว่าปริญญาตรี</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="department">ภาควิชา</Label>
               {/* [อัปเดต] เราจะใช้ Input ที่อ่านอย่างเดียว เพราะ Autofill แล้ว */}
               <Input
                id="department"
                name="department"
                value={formData.department} // <-- Autofill
                placeholder="Auto fill"
                readOnly
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email} // <-- Autofill
                placeholder="Auto fill"
                readOnly // <-- ข้อมูลจาก Authen ควรอ่านอย่างเดียว
              />
            </div>
          </div>

          {/* --- เส้นคั่น --- */}
          <hr className="my-6" />

          {/* --- ส่วนข้อมูลหนังสือ (1 Column) --- */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic (ชื่อเรื่อง)</Label>
              <Input id="topic" name="topic" value={formData.topic} onChange={handleChange} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="author">Author (ผู้แต่ง)</Label>
              <Input id="author" name="author" value={formData.author} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="isbn">ISBN/ISSN</Label>
                <Input id="isbn" name="isbn" value={formData.isbn} onChange={handleChange} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="publishYear">Year of Publication (ปีที่พิมพ์)</Label>
                <Input id="publishYear" name="publishYear" value={formData.publishYear} onChange={handleChange} type="number" />
              </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="publisher">Publisher (สำนักพิมพ์)</Label>
              <Input id="publisher" name="publisher" value={formData.publisher} onChange={handleChange} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="reason">Request reason (เหตุผลที่ขอ)</Label>
              <Select onValueChange={handleSelectChange("reason")} value={formData.reason}>
                <SelectTrigger id="reason">
                  <SelectValue placeholder="เลือกเหตุผล" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="course">ใช้ประกอบการเรียน</SelectItem>
                  <SelectItem value="research">ใช้ทำวิจัย</SelectItem>
                  <SelectItem value="personal">อ่านส่วนตัว</SelectItem>
                  <SelectItem value="other">อื่นๆ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* --- ปุ่ม Submit --- */}
          <Button type="submit" className="w-full text-lg py-6">
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
}
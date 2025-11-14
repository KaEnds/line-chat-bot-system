"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useSession, signOut } from "next-auth/react";
// [เพิ่ม] import useSearchParams เพื่ออ่าน URL
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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
department: string;
major: string;
email: string;
topic: string; // <-- ช่องนี้จะถูก Autofill จาก URL
author: string; // <-- ช่องนี้จะถูก Autofill จาก URL
isbn: string; // <-- ช่องนี้จะถูก Autofill จาก URL
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
department: "",
major: "",
email: "",
topic: "", // <-- เริ่มต้นเป็นค่าว่าง
author: "", // <-- เริ่มต้นเป็นค่าว่าง
isbn: "", // <-- เริ่มต้นเป็นค่าว่าง
publishYear: "",
publisher: "",
reason: "",
});

const { data: session, status } = useSession();
const router = useRouter();
// [เพิ่ม] Hook สำหรับอ่าน URL
const searchParams = useSearchParams();

// [อัปเกรด] useEffect นี้จะทำงาน 2 อย่าง:
// 1. ดึงข้อมูลจาก Session (Azure AD)
// 2. ดึงข้อมูลจาก URL (ถ้ามี)
useEffect(() => {
if (status === "loading") {
return;
}
if (status === "unauthenticated") {
router.push("/login");
return;
}

// 1. Autofill จาก Session (Azure AD) (ทำเหมือนเดิม)
let sessionData = {};
if (status === "authenticated" && session?.user) {
  const user = session.user;
  const nameParts = user.name?.split(' ') || [''];
  const fName = nameParts[0] || '';
  const lName = nameParts.slice(1).join(' ') || '';

  sessionData = {
    firstName: fName,
    lastName: lName,
    email: user.email || "",
    studentId: user.studentId || "", 
    department: user.department || "",
    major: user.major || "",
  };
}

// 2. [เพิ่ม] Autofill จาก URL (ที่ส่งมาจากหน้า Details)
// เราจะดึงค่านี้ "เพียงครั้งเดียว" ตอนที่หน้าโหลด
const titleFromUrl = searchParams.get('title');
const authorFromUrl = searchParams.get('author');
const isbnFromUrl = searchParams.get('isbn');

let urlData = {};
if (titleFromUrl) {
  urlData = {
    topic: titleFromUrl,
    author: authorFromUrl || "",
    isbn: isbnFromUrl || "",
  };
}

// 3. [เพิ่ม] รวมข้อมูลทั้ง 2 ส่วน และตั้งค่า State
setFormData(prev => ({
  ...prev,
  ...sessionData,
  ...urlData
}));


}, [status, session, router, searchParams]); // ทำงานเมื่อ 4 ค่านี้เปลี่ยน

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
signOut({ callbackUrl: '/login' });
};

// --- ส่วน Loading / Redirect (เหมือนเดิม) ---
if (status === "loading") {
return (
<div className="min-h-screen bg-[#FFB133] p-4 md:p-8 flex items-center justify-center">
<p className="text-black text-xl font-bold">Loading...</p>
</div>
)
}
if (status !== "authenticated") {
return (
<div className="min-h-screen bg-[#FFB133] p-4 md:p-8 flex items-center justify-center">
<p className="text-black text-xl font-bold">Redirecting to login...</p>
</div>
)
}
// --- สิ้นสุดส่วน Loading ---

return (
// Container ที่ responsive
<div className="min-h-screen bg-[#FFB133] p-4 md:p-8">
<div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md">

    {/* [อัปเกรด] เพิ่มปุ่ม "ดูคำขอ" (ถ้ามี) */}
    <div className="flex justify-end items-center gap-2 mb-4">
      <Link href="/my-requests">
        <Button variant="outline" size="sm">
          ดูคำขอของฉัน
        </Button>
      </Link>
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
            value={formData.firstName}
            placeholder="Auto fill"
            readOnly
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">สกุล</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            placeholder="Auto fill"
            readOnly
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="studentId">รหัสนักศึกษา</Label>
          <Input
            id="studentId"
            name="studentId"
            value={formData.studentId}
            placeholder="Auto fill"
            readOnly
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
        <div className="space-y-2">
          <Label htmlFor="department">ภาควิชา</Label>
           <Input
            id="department"
            name="department"
            value={formData.department}
            placeholder="Auto fill"
            readOnly
          />
        </div>
         <div className="space-y-2">
          <Label htmlFor="major">สาขาวิชา</Label>
          <Input
            id="major"
            name="major"
            value={formData.major}
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
            value={formData.email}
            placeholder="Auto fill"
            readOnly
          />
        </div>
      </div>

      {/* --- เส้นคั่น --- */}
      <hr className="my-6" />

      {/* --- ส่วนข้อมูลหนังสือ (1 Column) --- */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Topic (ชื่อเรื่อง)</Label>
          {/* [อัปเกรด] ช่องนี้จะ Autofill จาก URL */}
          <Input 
            id="topic" 
            name="topic" 
            value={formData.topic} 
            onChange={handleChange} 
            placeholder="เช่น The Silent Patient (กรอกเองได้)"
          />
        </div>
         <div className="space-y-2">
          <Label htmlFor="author">Author (ผู้แต่ง)</Label>
          {/* [อัปเกรด] ช่องนี้จะ Autofill จาก URL */}
          <Input 
            id="author" 
            name="author" 
            value={formData.author} 
            onChange={handleChange} 
            placeholder="เช่น Alex Michaelides (กรอกเองได้)"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
            <Label htmlFor="isbn">ISBN/ISSN</Label>
            {/* [อัปเกรด] ช่องนี้จะ Autofill จาก URL */}
            <Input 
              id="isbn" 
              name="isbn" 
              value={formData.isbn} 
              onChange={handleChange} 
              placeholder="เช่น 978-1-250-30169-7 (กรอกเองได้)"
            />
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
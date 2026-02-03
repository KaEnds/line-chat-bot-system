"use client";

import { Suspense } from 'react';
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
  SelectGroup,
  SelectItem,
  SelectLabel,
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
  faculty: string;
  email: string;
  title: string;
  author: string;
  isbn: string;
  publishYear: string;
  publisher: string;
  reason: string;
  reasonDescription: string;
  branch: string;
}

// Interface สำหรับ Validation Errors
interface FormErrors {
  [key: string]: string;
}

export const dynamic = 'force-dynamic';

function BookRequestContent() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    studentId: "",
    academicYear: "",
    department: "",
    faculty: "",
    email: "",
    title: "",
    author: "",
    isbn: "",
    publishYear: "",
    publisher: "",
    reason: "",
    reasonDescription: "",
    branch: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [FactAndDept, setFactAndDept] = useState<any[]>([]);
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = `/book-request/?title=${searchParams.get('title')}&author=${searchParams.get('author')}&isbn=${searchParams.get('isbn')}`;

  // [อัปเกรด] useEffect นี้จะทำงาน 2 อย่าง:
  // 1. ดึงข้อมูลจาก Session (Azure AD)
  // 2. ดึงข้อมูลจาก URL (ถ้ามี)
  useEffect(() => {
    if (status === "loading") {
      return;
    }
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${searchParams.get('title') ? encodeURIComponent(callbackUrl) : '/book-request'}`);
      return;
    }

    fetch('/api/get-faculties-and-departments', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }).then(response => response.json())
    .then(data => { 
      setFactAndDept(data.requests);
    })
    console.log('Faculties and Departments Data:', FactAndDept);

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
        // faculty: user.faculty || "",
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
        title: titleFromUrl,
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


  }, [status, session, router, searchParams]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => {
    const newData = { ...prev, [name]: value };

    if (name === 'faculty') {
      newData.department = '';
    }

    return newData;
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const newErrors: FormErrors = {};
    
    if (!formData.academicYear.trim()) {
      newErrors.academicYear = "Please select academic year";
    }
    if (!formData.department.trim()) {
      newErrors.department = "Please enter department";
    }
    if (!formData.faculty.trim()) {
      newErrors.faculty = "Please enter faculty";
    }
    if (!formData.title.trim()) {
      newErrors.title = "Please enter book title";
    }
    if (!formData.reason.trim()) {
      newErrors.reason = "Please select request reason";
    }
    if (!formData.reasonDescription.trim()) {
      newErrors.reasonDescription = "Please enter reason description";
    }
    if (!formData.branch.trim()) {
      newErrors.branch = "Please enter branch";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    
    // TODO: Send data to Backend (Python)
    // After successful submission, redirect to complete page
    fetch('/api/create-book-request', {
      method: 'POST',
      headers: {},
      body: JSON.stringify(formData)
    }).then(response => {
      if (response.ok) {
        console.log('Form submitted successfully');
        router.push("/submit-complete");
      } else {
        console.error('Form submission failed');
      }
    }).catch(error => {
      console.error('Error submitting form:', error);
    });
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

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

        {/* Error message alert */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-semibold">กรุณากรอกข้อมูลที่จะเป็นให้ครบทุกช่อง:</p>
          </div>
        )}

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
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">สกุล</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                placeholder="Auto fill"
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentId">รหัสนักศึกษา</Label>
              <Input
                id="studentId"
                name="studentId"
                value={formData.studentId}
                placeholder="Auto fill"
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="academicYear">ชั้นปี</Label>
              <Select onValueChange={handleSelectChange("academicYear")} value={formData.academicYear}>
                <SelectTrigger id="academicYear" className={errors.academicYear ? "border-red-500" : ""}>
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
              {errors.academicYear && <p className="text-red-500 text-sm">{errors.academicYear}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="faculty">คณะ</Label>
              <Select onValueChange={handleSelectChange("faculty")} value={formData.faculty}>
                <SelectTrigger id="faculty" className={errors.faculty ? "border-red-500 w-full" : "w-full"}>
                  <SelectValue placeholder="เลือกคณะ" />
                </SelectTrigger>
                <SelectContent>
                  {FactAndDept
                    .filter((item, index, self) => 
                      index === self.findIndex((t) => t.faculty_id === item.faculty_id)
                    )
                    .map((item) => (
                      <SelectItem key={item.faculty_id} value={item.faculty_id.toString()}>
                        {item.faculty_name_th}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              {errors.faculty && <p className="text-red-500 text-sm">{errors.faculty}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">ภาควิชา</Label>
              <Select onValueChange={handleSelectChange("department")} value={formData.department}>
                <SelectTrigger id="department" className={errors.department ? "border-red-500 w-full" : "w-full"}>
                  <SelectValue placeholder="เลือกภาควิชา" />
                </SelectTrigger>
                <SelectContent>
                  {FactAndDept
                    .filter((item) => item.faculty_id === parseInt(formData.faculty))
                    .map((item) => (
                      <SelectItem key={item.department_id} value={item.department_id.toString()}>
                        {item.department_name_th}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              {errors.department && <p className="text-red-500 text-sm">{errors.department}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                placeholder="Auto fill"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* --- เส้นคั่น --- */}
          <hr className="my-6" />

          {/* --- ส่วนข้อมูลหนังสือ (1 Column) --- */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title (ชื่อหนังสือ)</Label>
              {/* [อัปเกรด] ช่องนี้จะ Autofill จาก URL */}
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder=""
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author (ผู้แต่ง)</Label>
              {/* [อัปเกรด] ช่องนี้จะ Autofill จาก URL */}
              <Input
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder=""
                className={errors.author ? "border-red-500" : ""}
              />
              {errors.author && <p className="text-red-500 text-sm">{errors.author}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN/ISSN ( ถ้าไม่มีให้ใส่ - )</Label>
                {/* [อัปเกรด] ช่องนี้จะ Autofill จาก URL */}
                <Input
                  id="isbn"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleChange}
                  placeholder=""
                  className={errors.isbn ? "border-red-500" : ""}
                />
                {errors.isbn && <p className="text-red-500 text-sm">{errors.isbn}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="publishYear">Year of Publication (ปีที่พิมพ์)</Label>
                <Input 
                  id="publishYear" 
                  name="publishYear" 
                  value={formData.publishYear} 
                  onChange={handleChange} 
                  type="number"
                  className={errors.publishYear ? "border-red-500" : ""}
                />
                {errors.publishYear && <p className="text-red-500 text-sm">{errors.publishYear}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="publisher">Publisher (สำนักพิมพ์)</Label>
              <Input 
                id="publisher" 
                name="publisher" 
                value={formData.publisher} 
                onChange={handleChange}
                className={errors.publisher ? "border-red-500" : ""}
              />
              {errors.publisher && <p className="text-red-500 text-sm">{errors.publisher}</p>}
            </div>
            <div className='space-y-2'>
              <Label htmlFor="branch">สาขาห้องสมุดที่ต้องการให้จัดซื้อ</Label>
              <Select onValueChange={handleSelectChange("branch")} value={formData.branch}>
                <SelectTrigger id="branch" className={errors.branch ? "border-red-500" : ""}>
                  <SelectValue placeholder="เลือกสาขาห้องสมุด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mai">KMUTT Library</SelectItem>
                  <SelectItem value="bkt">KMUTT Bangkhuntian Library</SelectItem>
                  <SelectItem value="rat">KMUTT Ratchaburi Library</SelectItem>
                </SelectContent>
              </Select>
              {errors.branch && <p className="text-red-500 text-sm">{errors.branch}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Request reason (เหตุผลที่ขอ)</Label>
              <Select onValueChange={handleSelectChange("reason")} value={formData.reason}>
                <SelectTrigger id="reason" className={errors.reason ? "border-red-500" : ""}>
                  <SelectValue placeholder="เลือกเหตุผล" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="course">ใช้ประกอบการเรียน</SelectItem>
                  <SelectItem value="research">ใช้ทำวิจัย</SelectItem>
                  <SelectItem value="personal">อ่านส่วนตัว</SelectItem>
                  <SelectItem value="other">อื่นๆ</SelectItem>
                </SelectContent>
              </Select>
              {errors.reason && <p className="text-red-500 text-sm">{errors.reason}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reasonDescription">คำอธิบายเหตุผลเพิ่มเติม</Label>
              <textarea
                id="reasonDescription"
                name="reasonDescription"
                value={formData.reasonDescription}
                onChange={handleChange}
                placeholder="กรุณาบรรยายเหตุผลหรือข้อมูลเพิ่มเติมที่เกี่ยวข้องอย่างละเอียด (มีผลนำไปประกอบการตัดสินใจจัดซื้อหนังสือ) เช่น ต้องการหนังสือ python programming เพื่อใช้ทำโปรเจคเกี่ยวกับ data analysis เป็นต้น"
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  errors.reasonDescription ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.reasonDescription && <p className="text-red-500 text-sm">{errors.reasonDescription}</p>}
            </div>
          </div>

          {/* --- ปุ่ม Submit --- */}
          <Button 
            type="submit" 
            className="w-full text-lg py-6"
          >
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function BookRequestPage() {
  return (
    <main>
      {/* 1. ต้องใช้ Suspense ห่อหุ้มส่วนที่ดึงค่าจาก URL */}
      <Suspense fallback={<div>กำลังโหลดข้อมูล...</div>}>
        <BookRequestContent />
      </Suspense>
    </main>
  );
}
"use client";

import { Suspense, useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LayoutList, Users, LogOut, BookOpenText } from "lucide-react";

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
  remark: string;
}

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
    branch: "",
    remark: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [FactAndDept, setFactAndDept] = useState<any[]>([]);
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = `/book-request/?title=${searchParams.get('title') || ''}&author=${searchParams.get('author') || ''}&isbn=${searchParams.get('isbn') || ''}`;

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${searchParams.get('title') ? encodeURIComponent(callbackUrl) : '/book-request'}`);
      return;
    }

    // ดึงข้อมูลคณะและภาควิชา
    fetch('/api/get-faculties-and-departments')
      .then(res => res.json())
      .then(data => { 
        if(data.requests) setFactAndDept(data.requests);
      })
      .catch(err => console.error("Error fetching faculties:", err));

    // Autofill ข้อมูลจาก Session และ URL
    let sessionData = {};
    if (status === "authenticated" && session?.user) {
      const nameParts = session.user.name?.split(' ') || [''];
      sessionData = {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: session.user.email || "",
        studentId: (session.user as any).studentId || "",
        department: (session.user as any).department || "",
      };
    }

    const urlData = {
      title: searchParams.get('title') || "",
      author: searchParams.get('author') || "",
      isbn: searchParams.get('isbn') || "",
    };

    setFormData(prev => ({ ...prev, ...sessionData, ...urlData }));
  }, [status, session, router, searchParams]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'faculty') newData.department = ''; // Reset ภาควิชาเมื่อเปลี่ยนคณะ
      return newData;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};
    
    // Validation ขั้นพื้นฐาน
    const requiredFields = ['academicYear', 'faculty', 'department', 'title', 'reason', 'reasonDescription', 'branch'];
    requiredFields.forEach(field => {
      if (!(formData as any)[field]) newErrors[field] = `Required field`;
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    
    try {
      const response = await fetch('/api/create-book-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) router.push("/submit-complete");
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (status === "loading") return <div className="min-h-screen bg-[#FFB133] flex items-center justify-center font-bold">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#FFB133] p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-xl">

        {/* --- Navigation Header --- */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-8 pb-6 border-b border-gray-100">
          <div className="flex gap-2">
            <Link href="/my-requests">
              <Button variant="outline" size="sm" className="flex gap-2 items-center border-black font-semibold hover:bg-gray-50 transition-all">
                <LayoutList size={16} />
                คำขอของฉัน
              </Button>
            </Link>
            <Link href="/other-requests">
              <Button variant="outline" size="sm" className="flex gap-2 items-center border-black font-semibold hover:bg-gray-50 text-blue-600 border-blue-600 transition-all">
                <Users size={16} />
                คำขอผู้อื่น
              </Button>
            </Link>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 flex gap-2 items-center font-bold"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>

        {/* --- Branding Header --- */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-black p-3 rounded-full mb-4 shadow-lg">
            <BookOpenText size={32} color="white" />
          </div>
          <h1 className="text-3xl font-black text-center text-gray-900">ลงทะเบียนจัดซื้อหนังสือ</h1>
          <p className="text-gray-400 mt-2">กรุณาตรวจสอบข้อมูลให้ถูกต้อง</p>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <p className="text-red-700 font-bold italic text-sm text-center">กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ข้อมูลผู้ใช้งาน */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-bold text-gray-700 text-xs">ชื่อ ( name )</Label>
              <Input value={formData.firstName} readOnly className="bg-gray-50 border-gray-200" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-gray-700 text-xs">สกุล ( surname )</Label>
              <Input value={formData.lastName} readOnly className="bg-gray-50 border-gray-200" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-gray-700 text-xs">รหัสนักศึกษา ( student ID )</Label>
              <Input value={formData.studentId} readOnly className="bg-gray-50 border-gray-200" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-gray-700 text-xs">ชั้นปี ( academic year )</Label>
              <Select onValueChange={handleSelectChange("academicYear")} value={formData.academicYear}>
                <SelectTrigger className={errors.academicYear ? "border-red-500 shadow-sm" : "shadow-sm"}>
                  <SelectValue placeholder="เลือกชั้นปี" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">ปี 1</SelectItem>
                  <SelectItem value="2">ปี 2</SelectItem>
                  <SelectItem value="3">ปี 3</SelectItem>
                  <SelectItem value="4">ปี 4</SelectItem>
                  <SelectItem value="5">ปริญญาโท ( Master )</SelectItem>
                  <SelectItem value="6">ปริญญาเอก ( Doctoror )</SelectItem>
                  <SelectItem value="7">เจ้าหน้าที่ ( Staff )</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Faculty & Department Selectors */}
            <div className="space-y-2">
              <Label className="font-bold text-gray-700 text-xs">คณะ ( faculty )</Label>
              <Select onValueChange={handleSelectChange("faculty")} value={formData.faculty}>
                <SelectTrigger className={errors.faculty ? "border-red-500 w-full" : "w-full"}>
                  <SelectValue placeholder="เลือกคณะ" />
                </SelectTrigger>
                <SelectContent>
                  {FactAndDept
                    .filter((item, idx, self) => idx === self.findIndex((t) => t.faculty_id === item.faculty_id))
                    .filter((item) => formData.academicYear === '6' ? item.faculty_name_th === 'อื่น ๆ' : true)
                    .map((item) => (
                      <SelectItem key={item.faculty_id} value={item.faculty_id.toString()}>
                        {item.faculty_name_th}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="font-bold text-gray-700  text-xs">ภาควิชา ( department )</Label>
              <Select onValueChange={handleSelectChange("department")} value={formData.department} disabled={!formData.faculty}>
                <SelectTrigger className={errors.department ? "border-red-500 w-full" : "w-full"}>
                  <SelectValue placeholder="เลือกภาควิชา" />
                </SelectTrigger>
                <SelectContent>
                  {FactAndDept
                    .filter((item) => item.faculty_id === parseInt(formData.faculty))
                    .filter((item) => {
                      if (formData.academicYear === '7') {
                        return item.department_name_th === 'อื่น ๆ';
                      } else if(formData.academicYear === '6') {
                        return item.degree && item.degree.toLowerCase().includes('doctor');
                      } else if (formData.academicYear === '5') {
                        return item.degree && item.degree.toLowerCase().includes('master');
                      } else {
                        return item.degree && item.degree.toLowerCase().includes('bachelor');
                      }
                    })
                    .map((item) => (
                      <SelectItem key={item.department_id} value={item.department_id.toString()}>
                        {item.department_name_th}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-2'>
            <Label className="font-bold text-gray-700 text-xs w-full">หมายเหตุ (remark)</Label>
            <Input name='remark' placeholder='ใส่ข้อมูล คณะ และภาควิชา ในกรณีที่ไม่มีข้อมูลสำหรับนักศึกษา และใส่หน่วยงานหรือสังกัดสำหรับเจ้าหน้าที่' value={formData.remark} onChange={handleChange} className="bg-gray-50 border-gray-200" />
          </div>

          <hr className="border-gray-100" />

          {/* ข้อมูลหนังสือ */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="font-bold text-gray-700  text-xs">ชื่อหนังสือ (Title)</Label>
              <Input name="title" value={formData.title} onChange={handleChange} className={errors.title ? "border-red-500 shadow-sm" : "shadow-sm"} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-gray-700  text-xs">ผู้แต่ง (Author)</Label>
                <Input name="author" value={formData.author} onChange={handleChange} className="shadow-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className='font-bold text-gray-700  text-xs' htmlFor="isbn">ISBN/ISSN ( ถ้าไม่มีไม่ต้องใส่ )</Label>
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
                <Label className="font-bold text-gray-700  text-xs">สำนักพิมพ์ ( Publisher )</Label>
                <Input name="publisher" value={formData.publisher} onChange={handleChange} className="shadow-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-gray-700  text-xs">สาขาห้องสมุดที่ต้องการ ( Library Branch )</Label>
              <Select onValueChange={handleSelectChange("branch")} value={formData.branch}>
                <SelectTrigger className={errors.branch ? "border-red-500" : ""}>
                  <SelectValue placeholder="เลือกสาขาห้องสมุด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mai">KMUTT Library</SelectItem>
                  <SelectItem value="bkt">KMUTT Bangkhuntian Library</SelectItem>
                  <SelectItem value="rat">KMUTT Ratchaburi Library</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-gray-700  text-xs">เหตุผลที่ขอ ( Reason )</Label>
              <Select onValueChange={handleSelectChange("reason")} value={formData.reason}>
                <SelectTrigger className={errors.reason ? "border-red-500" : ""}>
                  <SelectValue placeholder="เลือกเหตุผล" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Personal interest">Personal interest</SelectItem>
                  <SelectItem value="in class usage">in class usage</SelectItem>
                  <SelectItem value="insufficient existing resource">insufficient existing resource</SelectItem>
                  <SelectItem value="other">อื่นๆ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-gray-700 text-xs">คำอธิบายเพิ่มเติม ( Additional Reason )</Label>
              <textarea
                name="reasonDescription"
                value={formData.reasonDescription}
                onChange={handleChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-black outline-none resize-none shadow-sm text-sm ${
                  errors.reasonDescription ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="กรุณาบรรยายเหตุผลหรือข้อมูลเพิ่มเติมที่เกี่ยวข้องอย่างละเอียด (มีผลนำไปประกอบการตัดสินใจจัดซื้อหนังสือ) เช่น ต้องการหนังสือ python programming เพื่อใช้ทำโปรเจคเกี่ยวกับ data analysis เป็นต้น"
              />
            </div>
          </div>

          <Button type="submit" className="w-full text-lg py-7 bg-black hover:bg-gray-800 text-white rounded-xl shadow-lg transition-transform active:scale-[0.98] font-black">
            ส่งข้อมูลคำขอจัดซื้อ
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function BookRequestPage() {
  return (
    <main>
      <Suspense fallback={<div className="min-h-screen bg-[#FFB133] flex items-center justify-center font-bold">กำลังโหลดข้อมูล...</div>}>
        <BookRequestContent />
      </Suspense>
    </main>
  );
}
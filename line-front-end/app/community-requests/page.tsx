"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, Clock, Search, BookPlus, User } from "lucide-react";

// ข้อมูลสมมติของคนอื่นที่เคยขอไว้
const COMMUNITY_DATA = [
  { 
    id: "c1", 
    title: "The Silent Patient", 
    author: "Alex Michaelides", 
    isbn: "978-1-250-30169-7",
    requester: "Somchai S.",
    date: "2026-02-04" 
  },
  { 
    id: "c2", 
    title: "Atomic Habits", 
    author: "James Clear", 
    isbn: "978-0-735-21129-2",
    requester: "Jane D.",
    date: "2026-02-03" 
  },
  { 
    id: "c3", 
    title: "Deep Work", 
    author: "Cal Newport", 
    isbn: "978-1-455-58669-1",
    requester: "Anan K.",
    date: "2026-01-30" 
  },
];

export default function CommunityRequestsPage() {
  const router = useRouter();
  const [requests] = useState(COMMUNITY_DATA);

  // ฟังก์ชันส่งข้อมูลไปยังหน้าฟอร์ม
  const handleRequestSimilar = (book: typeof COMMUNITY_DATA[0]) => {
    // สร้าง Query String เพื่อส่งค่าไปยังหน้า Form ตามที่คุณเขียนไว้ใน useEffect
    const params = new URLSearchParams({
      title: book.title,
      author: book.author,
      isbn: book.isbn
    });
    
    // ยิงไปที่หน้าฟอร์ม (ปรับ path ให้ตรงกับโฟลเดอร์ฟอร์มของคุณ เช่น /book-request)
    router.push(`/book-request?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#FFB133]">
      {/* Navigation Bar สีดำตามธีม */}
      <header className="bg-black sticky top-0 z-10 px-4 py-4 flex items-center shadow-lg">
        <button 
          onClick={() => router.back()} 
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronLeft size={28} color="white" />
        </button>
        <h1 className="ml-2 text-xl font-bold text-white">Community Requests</h1>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        <p className="text-black font-medium mb-6 text-center bg-white/20 py-2 rounded-lg">
          ค้นหาหนังสือที่เพื่อนๆ สนใจ แล้วกดขอร่วมได้เลย!
        </p>

        {/* List of Requests */}
        <div className="space-y-4">
          {requests.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-2xl p-5 shadow-xl border border-black/5"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">{item.title}</h3>
                  <p className="text-sm text-gray-500 italic">By {item.author}</p>
                </div>
                <div className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-400 font-mono">
                  ISBN: {item.isbn}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                <User size={12} />
                <span>Requested by: {item.requester}</span>
                <span className="mx-1">•</span>
                <Clock size={12} />
                <span>{item.date}</span>
              </div>
              
              <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => handleRequestSimilar(item)}
                  className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 active:scale-95 transition-all shadow-md"
                >
                  <BookPlus size={18} />
                  ขอเล่มนี้ด้วย
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
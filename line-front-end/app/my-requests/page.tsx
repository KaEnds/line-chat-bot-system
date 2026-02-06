"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, Clock, Search, MoreVertical } from "lucide-react";

const MOCK_REQUESTS = [
  { id: "1", title: "Clean Code", category: "Programming", status: "pending", date: "2026-02-04" },
  { id: "2", title: "The Pragmatic Programmer", category: "Software Engineering", status: "approved", date: "2026-02-01" },
  { id: "3", title: "Next.js 15 Cookbook", category: "Web Dev", status: "rejected", date: "2026-01-25" },
];

export default function MyRequestPage() {
  const router = useRouter();
  const [requests] = useState(MOCK_REQUESTS);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-700 border-green-200";
      case "rejected": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  return (
    // เปลี่ยนพื้นหลังทั้งหน้าเป็นสีเหลือง
    <div className="min-h-screen bg-[#FFB133]">
      
      {/* Navigation Bar สีดำ */}
      <header className="bg-black sticky top-0 z-10 px-4 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center">
          <button 
            onClick={() => router.back()} 
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft size={28} color="white" />
          </button>
          <h1 className="ml-2 text-xl font-bold text-white">My Requests</h1>
        </div>
        <button className="text-white/70 hover:text-white">
          <MoreVertical size={20} />
        </button>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        {/* Search Bar ปรับให้เข้ากับพื้นหลังเหลือง */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search your requests..." 
            className="w-full pl-10 pr-4 py-3 rounded-2xl border-none bg-white/90 backdrop-blur-sm focus:ring-2 focus:ring-black outline-none transition-all shadow-md placeholder:text-gray-400"
          />
        </div>

        {/* Request Cards */}
        <div className="space-y-4">
          {requests.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-2xl p-5 shadow-xl border border-black/5 hover:scale-[1.01] transition-transform active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 font-medium">{item.category}</p>
                </div>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full border shadow-sm ${getStatusColor(item.status)}`}>
                  {item.status.toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-xs text-gray-400 font-medium">
                  <Clock size={14} className="mr-1" />
                  {item.date}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {requests.length === 0 && (
          <div className="text-center py-20">
            <p className="text-black/50 font-bold italic">No requests found.</p>
          </div>
        )}
      </main>
    </div>
  );
}
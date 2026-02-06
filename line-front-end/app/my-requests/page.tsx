"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { ChevronLeft, Clock, Search, MoreVertical } from "lucide-react";

const MOCK_REQUESTS = [
  { id: "1", title: "Clean Code", category: "Programming", status: "pending", date: "2026-02-04" },
  { id: "2", title: "The Pragmatic Programmer", category: "Software Engineering", status: "approved", date: "2026-02-01" },
  { id: "3", title: "Next.js 15 Cookbook", category: "Web Dev", status: "rejected", date: "2026-01-25" },
];

interface myRequest {
  authors: string,
  branch: string,
  department_id: number,
  faculty_id: number,
  isbn_issn: string,
  publication_year: number,
  publisher: string,
  remark: string,
  request_id: number,
  request_reason_category: string,
  requested_at: string,
  requester_id: string,
  requester_name: string,
  requester_role: String,
  specify_reason: string,
  status: string,
  title: string
}

export default function MyRequestPage() {
  const router = useRouter();
  const [requests] = useState(MOCK_REQUESTS);
  const [myRequest, setMyRequest] = useState<myRequest[]>([]);
  // State for dropdown open/close for each card
  const [openDropdowns, setOpenDropdowns] = useState<{[key:number]: boolean}>({});

  const { data: session, status } = useSession();
  console.log('Session Data in MyRequestContent:', session);
  console.log('Session Status in MyRequestContent:', status);
  console.log('Session Status in MyRequestContent:', myRequest);

  useEffect(() => {
    if (status === "loading") {
      return;
    }
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    console.log('Fetching my requests for studentId:', session?.user?.studentId);

    fetch('/api/get-my-request', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ requesterID: session?.user?.studentId }) 
    }).then(response => response.json())
    .then(data => {
        setMyRequest(data.requestInfo)
      })
      .catch(error => {
        console.error('Error fetching my requests:', error);
      });

  }, [status, router]);


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
      <main className="px-2 py-4 sm:p-4 max-w-2xl mx-auto">
        {/* Search Bar ปรับให้เข้ากับพื้นหลังเหลือง */}
        <div className="relative mb-4 sm:mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search your requests..." 
            className="w-full pl-10 pr-4 py-2 sm:py-3 rounded-2xl border-none bg-white/90 backdrop-blur-sm focus:ring-2 focus:ring-black outline-none transition-all shadow-md placeholder:text-gray-400 text-sm sm:text-base"
          />
        </div>
        
        {/* Request Cards */}
        <div className="space-y-3 sm:space-y-4">
          {myRequest
            .slice() // copy array
            .sort((a, b) => {
              const dateA = a.requested_at ? new Date(a.requested_at).getTime() : 0;
              const dateB = b.requested_at ? new Date(b.requested_at).getTime() : 0;
              return dateB - dateA; // latest first
            })
            .map((item, idx) => {
            // Only show these fields in dropdown
            const branchMap: Record<string, string> = {
              mai: "KMUTT Library",
              bkt: "KMUTT Bangkhuntian Library",
              rat: "KMUTT Ratchaburi Library",
            };
            const extraInfo = [
              { label: "ผู้แต่ง", value: item.authors },
              { label: "สาขาห้องสมุด", value: branchMap[item.branch] || item.branch },
              { label: "ISBN/ISSN", value: item.isbn_issn },
              { label: "ปีที่พิมพ์", value: item.publication_year },
              { label: "สำนักพิมพ์", value: item.publisher },
              { label: "หมวดเหตุผล", value: item.request_reason_category },
              { label: "ชื่อผู้ขอ", value: item.requester_name },
              { label: "บทบาทผู้ขอ", value: item.requester_role },
            ];
            const open = openDropdowns[item.request_id] || false;
            const toggleDropdown = () => setOpenDropdowns((prev) => ({ ...prev, [item.request_id]: !prev[item.request_id] }));
            return (
              <div
                key={item.request_id}
                className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xl border border-black/5"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-2 gap-1 sm:gap-0">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight mb-1 break-words max-w-[90vw] sm:max-w-none">{item.title}</h3>
                    {item.specify_reason && (
                      <p className="text-xs text-gray-600 italic max-w-[80vw] sm:max-w-xs truncate">{item.specify_reason}</p>
                    )}
                  </div>
                  <span className={`text-[10px] sm:text-[11px] font-bold px-2 sm:px-3 py-1 rounded-full border shadow-sm ${getStatusColor(item.status)}`}>{item.status.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between mt-2 sm:mt-3 text-xs text-gray-500 font-medium border-t border-gray-100 pt-2 sm:pt-3 gap-2">
                  <button
                    className="text-xs text-blue-600 hover:underline focus:outline-none"
                    onClick={toggleDropdown}
                  >
                    {open ? 'ซ่อนข้อมูลเพิ่มเติม' : 'ดูข้อมูลเพิ่มเติม'}
                  </button>
                  <span className="ml-auto whitespace-nowrap">
                    <span className="font-semibold text-gray-600">Request at:</span> {item.requested_at ? new Date(item.requested_at).toLocaleDateString() : '-'}
                  </span>
                </div>
                {open && (
                  <div className="mt-2 bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl p-3 border border-gray-200 text-xs text-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                      {extraInfo.map((info) => (
                        <div key={info.label} className="flex flex-col">
                          <span className="text-gray-500 font-semibold mb-0.5">{info.label}</span>
                          <span className="bg-gray-100 rounded px-2 py-1 text-gray-800 break-words shadow-sm border border-gray-100">
                            {info.value === null || info.value === undefined || info.value === '' ? '-' : info.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
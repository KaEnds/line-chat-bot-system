"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Clock, BookPlus, User } from "lucide-react";


import { useSession } from "next-auth/react";

export default function OthersRequestPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<any[]>([]);
  const [supporters, setSupporters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/other-requests");
      return;
    }
    const fetchData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    // ยิง API พร้อมกัน 2 เส้น
    const [resRequests, resSupporter] = await Promise.all([
      fetch("/api/get-others-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requesterID: session?.user?.studentId })
      }),
      fetch("/api/insert-request-supporter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      })
    ]);

    const data = await resRequests.json();
    const supporterData = await resSupporter.json();

    if (data.status === "success") {
      setRequests(data.requests);
    } else {
      setError(data.message || "ไม่พบข้อมูล requests");
    }

    if (supporterData.status === "success") {
      console.log("Supporter Data:", supporterData);
      setSupporters(supporterData.supporterData)
    } else {
      setError(supporterData.message || "ไม่พบข้อมูล supporters");
    }

    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย");
    } finally {
      setLoading(false);
    }
  };
    fetchData();
  }, [status, router, session?.user?.studentId]);
  const hasSupporter = (target_request_id: number, target_requester_id: string) => {
    
    let isMatch = false;

    supporters.forEach((row, index) => {
      const matchRequest = String(row.request_id) === String(target_request_id);
      const matchRequester = String(row.requester_id) === String(target_requester_id);

      if (matchRequest && matchRequester) {
        isMatch = true;
      }
    });

    return isMatch;
  };

  const handleSubmitSupporter = async (request_id: number, requester_id: string) => {
    if (hasSupporter(request_id, requester_id)) {
      return;
    }

    try{
      const response1 = await fetch('/api/insert-request-supporter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({request_id, requester_id})
      })

      const response2 = await fetch("/api/insert-request-supporter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      })

      const supporterData = await response2.json();

    if (supporterData.status === "success") {
      console.log("Supporter Data:", supporterData);
      setSupporters(supporterData.supporterData)
    } else {
      setError(supporterData.message || "ไม่พบข้อมูล supporters");
    }

      console.log('insert database complete:', response1.status)
    }catch{
      console.error('Error submitting', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFB133]">
      <main className="p-4 max-w-2xl mx-auto">
        <p className="text-black font-medium mb-6 text-center bg-white/20 py-2 rounded-lg">
          ค้นหาหนังสือที่เพื่อนๆ ขอไว้ แล้วกดขอร่วมได้เลย!
        </p>
        {loading ? (
          <div className="text-center text-gray-500">กำลังโหลดข้อมูล...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="space-y-4">
            {requests.map((item) => (
              <div 
                key={item.id || item.request_id} 
                className="bg-white rounded-2xl p-5 shadow-xl border border-black/5"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{item.title}</h3>
                    <p className="text-sm text-gray-500 italic">By {item.author}</p>
                  </div>
                  <div className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-400 font-mono">
                    ISBN: {item.isbn_issn || '-'}</div>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <User size={12} />
                  <span>Requested by: {item.requester || item.requester_name || item.requester_id}</span>
                  <span className="mx-1">•</span>
                  <Clock size={12} />
                  <span>{item.date || item.requested_at}</span>
                </div>
                <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">
                  <button 
                    disabled={hasSupporter(item.request_id, `${session?.user?.studentId}`)}
                    onClick={() => handleSubmitSupporter(item.request_id, `${session?.user?.studentId}`)}
                    className={`
                      flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md
                      ${hasSupporter(item.request_id, `${session?.user?.studentId}`) 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-black text-white hover:bg-gray-800 active:scale-95'
                      }
                    `}
                  >
                    <BookPlus size={18} />
                    {hasSupporter(item.request_id, `${session?.user?.studentId}`) ? 'ขอไปแล้ว' : 'ขอเล่มนี้ด้วย'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
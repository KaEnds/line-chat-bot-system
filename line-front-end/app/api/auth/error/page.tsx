"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  // อ่าน ?error=... จาก URL
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorMessage = getErrorMessage(error);

  return (
    <div className="min-h-screen bg-[#FFB133] flex flex-col items-center justify-start pt-16">
      <h1 className="text-white text-5xl font-bold mb-8">
        LibrAIry
      </h1>

      <div className="bg-white w-[90%] max-w-md p-8 rounded-2xl shadow-lg text-center">
        <h2 className="text-2xl font-semibold mb-2 text-red-600">
          Login Failed
        </h2>
        <p className="text-gray-500 mb-6">
          An error occurred during authentication.
        </p>

        {/* แสดงผล Error ที่อ่านได้จาก URL */}
        <div className="bg-gray-100 p-4 rounded-lg text-left">
          <p className="font-semibold text-gray-700">Error Code: {error || "Unknown"}</p>
          <p className="text-gray-600 text-sm mt-2">{errorMessage}</p>
        </div>

        <a
          href="/login"
          className="inline-block mt-8 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Try Again
        </a>
      </div>
    </div>
  );
}

// ฟังก์ชันสำหรับแปล Error code
function getErrorMessage(error: string | null) {
  switch (error) {
    case "Configuration":
      return "There is a problem with the server configuration. (Check .env.local file and restart Docker)";
    case "AccessDenied":
      return "You have denied access to the application.";
    case "Verification":
      return "The token verification failed.";
    default:
      return "An unknown error occurred.";
  }
}

// เราต้องใช้ Suspense เพราะ useSearchParams
export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFB133]">Loading error...</div>}>
      <ErrorContent />
    </Suspense>
  );
}

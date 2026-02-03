'use client'

import { useEffect } from "react"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function MyRequestContent() {

   const router = useRouter();
   const { data: session, status } = useSession();
   console.log('Session Data in MyRequestContent:', session);
   console.log('Session Status in MyRequestContent:', status);

  useEffect(() => {
    if (status === "loading") {
      return;
    }
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/my-requests");
      return;
    }

    console.log('Fetching my requests for studentId:', session?.user?.studentId);

    fetch('/api/get-my-request', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ requesterID: session?.user?.studentId }) 
    }).then(response => response.json())
    .then(data => {
        console.log('My Requests Data:', data);
      })
      .catch(error => {
        console.error('Error fetching my requests:', error);
      });

  }, [status, router]);

  return (
    <div>MyRequestContent</div>
  )
}
export default MyRequestContent
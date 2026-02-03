'use client'
import { useEffect } from "react"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function OthersRequestContent() {

    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
      if (status === "loading") {
        return;
      }
        if (status === "unauthenticated") { 
        router.push("/login?callbackUrl=/other-requests");
        return;
      }

      fetch('/api/get-others-request', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }).then(response => response.json())
      .then(data => {
        console.log('Others Requests Data:', data);
      })
    
    }, [status, router]);

  return (
    <div>OthersRequestContent</div>
  )
}
export default OthersRequestContent
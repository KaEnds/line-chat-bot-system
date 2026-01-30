'use client'

import { useEffect } from "react"

function MyRequestContent() {

  useEffect(() => {
    fetch('/api/get-my-request', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ requesterID: '65070501018' }) 
    }).then(response => response.json())
    .then(data => {
        console.log('My Requests Data:', data);
      })
      .catch(error => {
        console.error('Error fetching my requests:', error);
      });

  }, [])

  return (
    <div>MyRequestContent</div>
  )
}
export default MyRequestContent
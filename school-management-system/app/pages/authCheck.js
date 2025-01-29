"use client";
import { useEffect } from "react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function AuthCheck({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

   useEffect(() => {
     // Wait for the session to load before rendering the component
     console.log('session data', session, status)
     if (status === "loading") {
       return;
     }
   }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    // router.push("/authentication/login");
    console.log('no session')
    // return null;
  }

  return children;
}

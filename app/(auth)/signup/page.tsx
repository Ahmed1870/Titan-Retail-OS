"use client";
"use client";

import { useState, useEffect } from "react";
import Toast from "/modules/shared/components/Toast";
import SignUpForm from '@/modules/auth/components/SignUpForm';
export default function SignUpPage() {
const [toast, setToast] = useState<{msg:string,type:"success"|"error"}|null>(null); 
useEffect(()=>{document.body.classList.add("bg-gradient-to-br","from-zinc-900","via-zinc-800","to-black")},[]);
  return <SignUpForm />;
}

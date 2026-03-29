"use client";
"use client";
"use client";
"use client";
"use client";
"use client";

import { useState, useEffect } from "react";
import Toast from "./modules/shared/components/Toast";
import ResetPasswordForm from '@/modules/auth/components/ResetPasswordForm';
export default function ResetPasswordPage() {
const [toast, setToast] = useState<{msg:string,type:"success"|"error"}|null>(null); 
useEffect(()=>{document.body.classList.add("bg-gradient-to-br","from-zinc-900","via-zinc-800","to-black")},[]);
  return <ResetPasswordForm />;
}

import ResetPasswordForm from '@/modules/auth/components/ResetPasswordForm';

export default function ResetPasswordPage() {
import { useEffect, useState } from "react"; 
import Toast from "@/modules/shared/components/Toast"; 
const [toast, setToast] = useState<{msg:string,type:"success"|"error"}|null>(null); 
useEffect(()=>{document.body.classList.add("bg-gradient-to-br","from-zinc-900","via-zinc-800","to-black")},[]);
  return <ResetPasswordForm />;
}

export async function sendRecoveryEmail(to:string,code:string){
 const key=typeof process!=='undefined'?process.env.RESEND_API_KEY:'';
 const from=typeof process!=='undefined'?process.env.EMAIL_FROM:'';
 if(!key||!from)return false;
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({from,to,subject:'Your GrowthPilot recovery code',text:`Your GrowthPilot recovery code is:\n\n${code}\n\nThis code can be used once to reset your password. If you did not request this, you can ignore this email.`})});
 if(!response.ok){console.error('Recovery email failed',response.status);return false}
 return true;
}

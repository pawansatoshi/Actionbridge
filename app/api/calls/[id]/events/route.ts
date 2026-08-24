import { NextResponse } from "next/server";
import { calleRequest } from "@/lib/calle";
export const runtime="nodejs"; export const dynamic="force-dynamic";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;if(!/^[\w-]+$/.test(id))return NextResponse.json({error:"Invalid call id."},{status:400});try{const r=await calleRequest(`/v1/calls/${encodeURIComponent(id)}/events`);const data=await r.json().catch(()=>({}));if(!r.ok)return NextResponse.json({error:data?.error?.message||data?.message||"Unable to read call events."},{status:r.status});return NextResponse.json(data,{headers:{"Cache-Control":"no-store"}})}catch{return NextResponse.json({error:"Unable to reach CALL-E."},{status:502})}}

import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

export async function POST(req: Request) {
    try{
       const { query } = await req.json();

       const res = await fetch(`${BACKEND_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      console.log(data,"data")
      return NextResponse.json(data,{status: res.status});

   }catch(err: any){
    return NextResponse.json({error: err.message})
   }
}
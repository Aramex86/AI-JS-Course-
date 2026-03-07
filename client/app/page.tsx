'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@base-ui/react";
import { 
  SubmitEvent, useRef, useState } from "react";



type Answer = {
  summary: string;
  confidence: number;
}
export default function Home() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleQuerySubmit(event: SubmitEvent) {
    event.preventDefault();
    const q= query.trim();

    if(!q || loading) return

    setLoading(true);
    try{
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query:q }),
      });

      const data = await res.json();

      if(!res.ok){
        throw new Error("Request failed");
      }

      const {summary, confidence} = data as {
        summary: string;
        confidence: number;
      }
     
      setAnswer((prev) => [...prev, {summary, confidence}]);
      setQuery("");
      inputRef.current?.focus();

    }catch(err){
      console.log(err);
    }finally{
      setLoading(false);
    }
    
  }

  return (
    <div className="flex min-h-screen flex-col">
     <div className=" flex flex-col items-center justify-center h-[80vh] ">
      <h1 className="text-4xl font-bold">Hello Agent</h1>
      
      <Card className="flex-1 border-2 w-1/2  mb-4">
        <CardHeader>
          <CardTitle>Answer</CardTitle>
        </CardHeader>
        <CardContent className ='space-y-3'>
{answer.length === 0 ? (
  <p>Ask me a question</p>
) : (
  answer.map((a) => (
    <div key={a.summary} className="space-y-2 border-2 p-4 rounded-lg">
      <p>{a.summary}</p>
      <p>Confidence: {a.confidence}</p>
    </div>
  ))
)}
        </CardContent>
      </Card>
      <form ref={formRef} className="w-[50%] flex justify-center gap-2 align-center" onSubmit={handleQuerySubmit}>
  <div className="w-full flex justify-center gap-2 align-center">
    <Input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask me a question" disabled={loading} className="border-1 focus:ring-0 rounded-lg p-2 flex-1 w-[50%] "  />
    <Button type="submit" className="min-w-[100px] min-h-[40px] " disabled={loading}>{loading? "Thinking..." : "Ask"}</Button>
  </div>
      </form>
     </div>
    </div>
  );
}

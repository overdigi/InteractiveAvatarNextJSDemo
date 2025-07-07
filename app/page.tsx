"use client";

import { StreamingAvatarProvider } from "@/components/logic";
import MinimalTextReader from "@/components/MinimalTextReader";

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 py-8">
      <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
        <MinimalTextReader />
      </StreamingAvatarProvider>
    </div>
  );
}

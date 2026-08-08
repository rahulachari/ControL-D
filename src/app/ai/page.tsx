import AIHealthBot from "@/components/dashboard/AIHealthBot";

export default function AIPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28 sm:pb-12">
      <div>
        <h1 className="text-3xl font-heading font-black text-[#194793] tracking-tight [text-shadow:2px_2px_0px_#121421]">AI Health Assistant</h1>
        <p className="text-zinc-300 text-sm mt-1">Ask questions about diabetes management and lifestyle.</p>
      </div>
      <AIHealthBot />
    </div>
  );
}

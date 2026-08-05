import AIHealthBot from "@/components/dashboard/AIHealthBot";

export default function AIPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-gray-900 tracking-tight">AI Health Assistant</h1>
        <p className="text-gray-500">Ask questions about diabetes management and lifestyle.</p>
      </div>
      <AIHealthBot />
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Bot } from "lucide-react";

interface AIHealthBotProps {
  userId: string;
}

const AIHealthBot = ({ userId }: AIHealthBotProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at");

    if (data) {
      setMessages(data);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    try {
      await supabase.from("chat_messages").insert({
        user_id: userId,
        role: "user",
        content: userMessage,
      });

      const { data, error } = await supabase.functions.invoke("ai-health-chat", {
        body: { message: userMessage, userId },
      });

      if (error) throw error;

      await supabase.from("chat_messages").insert({
        user_id: userId,
        role: "assistant",
        content: data.response,
      });

      fetchMessages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card p-6 h-[600px] flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-6 h-6 text-secondary" />
        <h3 className="text-2xl font-semibold">AI Health Assistant</h3>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Ask me anything about diabetes management!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your health..."
          disabled={loading}
        />
        <Button type="submit" disabled={loading} className="bg-gradient-primary">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </Card>
  );
};

export default AIHealthBot;
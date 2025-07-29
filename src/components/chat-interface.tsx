"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, LoaderCircle } from "lucide-react";
import { ChatMessage, type Message } from "@/components/chat-message";
import { handleUserMessage } from "@/app/actions";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "bot",
      content: "Hello! I'm SevaSphere. How can I assist you today? You can ask me questions or enter a 6-digit PIN code for local information.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: input };
    const pendingBotMessage: Message = { id: crypto.randomUUID(), role: "bot", content: "", isLoading: true };

    setMessages((prev) => [...prev, userMessage, pendingBotMessage]);
    setInput("");

    startTransition(async () => {
      try {
        const botResponse = await handleUserMessage(userMessage.content);
        const botMessage: Message = { id: pendingBotMessage.id, role: "bot", content: botResponse };
        
        setMessages((prev) => prev.map(msg => msg.id === botMessage.id ? botMessage : msg));
      } catch (error) {
        const errorMessage: Message = {
          id: pendingBotMessage.id,
          role: "bot",
          content: "An unexpected error occurred. Please try again."
        };
        setMessages((prev) => prev.map(msg => msg.id === errorMessage.id ? errorMessage : msg));
      }
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="text-center bg-card border-b">
            <CardTitle className="font-headline text-3xl tracking-tight">SevaSphere</CardTitle>
            <CardDescription>Your AI assistant for public services</CardDescription>
        </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[55vh] w-full" ref={scrollAreaRef}>
          <div className="p-6 space-y-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t bg-card">
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about services or enter a PIN code..."
            className="flex-1 bg-background"
            disabled={isPending}
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={isPending}>
            {isPending ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { User, Bot } from 'lucide-react';

export type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
  isLoading?: boolean;
};

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-9 w-9 border border-primary/20">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[75%] rounded-xl p-3 text-sm shadow-sm flex items-center min-h-[40px]",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-white dark:bg-secondary"
        )}
      >
        {message.isLoading ? (
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-current/50 animate-pulse" style={{ animationDelay: '0.0s' }} />
            <span className="h-2 w-2 rounded-full bg-current/50 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <span className="h-2 w-2 rounded-full bg-current/50 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
      {isUser && (
        <Avatar className="h-9 w-9 border">
            <AvatarFallback className="bg-muted">
              <User className="h-5 w-5" />
            </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

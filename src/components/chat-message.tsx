
"use client";

import React, { useState, useMemo } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { User, Bot, PlayCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
  isLoading?: boolean;
};

const MediaViewer = ({ url, type, title }: { url: string; type: 'video' | 'image'; title: string }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-2 bg-background/20 hover:bg-background/40">
          {type === 'video' ? <PlayCircle className="mr-2 h-4 w-4" /> : <ImageIcon className="mr-2 h-4 w-4" />}
          {type === 'video' ? 'Play Video' : 'View Image'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          {type === 'video' ? (
            <video controls autoPlay className="w-full h-auto rounded-lg">
              <source src={url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img src={url} alt={title} className="w-full h-auto rounded-lg" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};


export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  // Regex to find markdown links: [Title](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  const parsedContent = useMemo(() => {
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(message.content)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(message.content.substring(lastIndex, match.index));
      }
      
      const title = match[1];
      const url = match[2];
      const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

      if ((isVideo || isImage) && !url.startsWith('http')) {
        parts.push(<MediaViewer key={match.index} url={url} type={isVideo ? 'video' : 'image'} title={title} />);
      } else {
         // It's a regular link, render as a standard anchor tag
        parts.push(
          <a key={match.index} href={url} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400">
            {title}
          </a>
        );
      }
      
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after the last link
    if (lastIndex < message.content.length) {
      parts.push(message.content.substring(lastIndex));
    }

    return parts;
  }, [message.content]);


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
          "max-w-[75%] rounded-xl p-3 text-sm shadow-sm flex flex-col items-start min-h-[40px]",
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
          <div className="whitespace-pre-wrap">{parsedContent.map((part, i) => <React.Fragment key={i}>{part}</React.Fragment>)}</div>
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

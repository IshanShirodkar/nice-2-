"use client";

import { createThread } from "@/lib/actions";
import { Button } from "../../ui/button";
import { useEffect, useState, useTransition } from "react";
import Image from "next/image";

import { usePathname } from "next/navigation";
import { Loader2, Paperclip } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Sentiment from 'sentiment';

export function Create({
  setOpen,
  create,
}: {
  setOpen: (open: boolean) => void;
  create: {
    id: string;
    name: string;
    image: string;
  };
}) {
  const [thread, setThread] = useState("");
  const [clicked, setClicked] = useState(false);
  const [sentimentScore, setSentimentScore] = useState(0);

  const { toast } = useToast();

  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const sentiment = new Sentiment();

  useEffect(() => {
    if (clicked && !isPending) {
      if (sentimentScore < 0) {
        setOpen(false);
        toast({
          title: "Tweet is not positive enough.",
        });
      } else {
        setThread("");
        setOpen(false);
        toast({
          title: "Thread created",
        });
      }
      setClicked(false);
    }
  }, [isPending]);

  const handleThreadChange = (e: { target: { value: any; }; }) => {
    const text = e.target.value;
    if (text.length > 200) return;
    setThread(text);

    // Analyze sentiment
    const result = sentiment.analyze(text);
    setSentimentScore(result.score);
  };

  return (
    <div>
      <div className="space-x-2 flex font-light">
        <div className="flex flex-col items-center justify-start">
          <div className="w-8 h-8 rounded-full bg-neutral-600 overflow-hidden">
            <Image
              src={create.image}
              height={32}
              width={32}
              className=""
              alt={create.name + "'s profile image"}
            />
          </div>
          <div className="w-0.5 grow mt-2 rounded-full bg-neutral-800" />
        </div>
        <div className="w-full">
          <div className="font-semibold text-left">Me</div>
          <textarea
            value={thread}
            onChange={handleThreadChange}
            className="mt-1 mini-scrollbar text-base/relaxed resize-none h-16 bg-transparent w-full placeholder:text-neutral-600 pb-1 outline-none focus:border-b border-b-neutral-700"
            placeholder="Start a thread..."
          />
          <div className="mt-1 text-end font-medium text-xs text-neutral-600">
            {thread.length}/200
          </div>
          {/* for adding attachments in the future */}
          <Paperclip className="w-[18px] h-[18px] mt-3" />
        </div>
      </div>
      <Button
        disabled={thread.length === 0 || isPending}
        variant="outline"
        className="w-full mt-4"
        onClick={() => {
          if (sentimentScore < 0) {
            toast({
              type: "foreground",
              title: "Tweet is not positive enough.",
              style: { background: "red", color: "white" },
            });
            setClicked(true);
          } else {
            startTransition(() => createThread(thread, create.id, pathname));
            setClicked(true);
          }
        }}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-neutral-600" />
        ) : (
          "Post"
        )}
      </Button>
      {/* <div className="flex justify"></div> */}
    </div>
  );
}

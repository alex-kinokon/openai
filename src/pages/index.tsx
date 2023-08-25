import { MessageList } from "@/components/message-list";
import { NewMessageForm } from "@/components/new-message-form";
import { MessageType } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { streamResponse } from "@/network";

/**
 * The list of messages displayed when the page is first loaded. You may remove or modify it as you wish.
 * @see src/types.ts
 */
const initialMessages: MessageType[] = [
  {
    role: "user",
    content: "Hey there, who are you?",
  },
  {
    role: "assistant",
    content:
      "Hey there! I am a language model created by [OpenAI](https://openai.com).",
  },
  {
    role: "user",
    content:
      "Oh neat! Can you show me a table of the 3 most populous provinces in Canada?",
  },
  {
    role: "assistant",
    content:
      "Certainly! Here's a table of the 3 most populous provinces in Canada as of my last update in 2021:\n\n| Province         | Population   |\n|------------------|--------------|\n| Ontario          | ~14.7 million|\n| Quebec           | ~8.5 million |\n| British Columbia | ~5.1 million |",
  },
];

const MESSAGE_KEY = "chat_messages";

export default function HomePage() {
  const restoredMessages = useRef(false);
  const [messages, _setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState<string>("");
  const msgList = useRef<HTMLDivElement>(null);

  const setMessages = useCallback(
    (action: MessageType[] | ((value: MessageType[]) => MessageType[])) => {
      _setMessages((existing) => {
        const next = typeof action === "function" ? action(existing) : action;
        try {
          localStorage.setItem(MESSAGE_KEY, JSON.stringify(next));
        } catch (e) {
          if (process.env.NODE_ENV === "development") {
            console.error(e);
          }
        } finally {
          return next;
        }
      });
    },
    []
  );

  useEffect(() => {
    // localStorage has strange behaviors in Safari and incognito mode
    try {
      const storedMessages = JSON.parse(
        localStorage.getItem(MESSAGE_KEY)!
      ) as MessageType[];
      if (Array.isArray(storedMessages)) {
        _setMessages(storedMessages);
      }
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.error(e);
      }
    } finally {
      restoredMessages.current = true;
    }
  }, []);

  const request = useCallback(
    async (messages: MessageType[]) => {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          max_tokens: 500,
          model: "gpt-3.5-turbo",
          temperature: 0.8,
          top_p: 1.0,
          presence_penalty: 1.0,
          messages: messages.map(
            ({ id, incomplete, timestamp, ...rest }) => rest
          ),
          stream: true,
        }),
      });

      void streamResponse(res, (chunk) => {
        switch (chunk.type) {
          case "chunk": {
            const [choice] = chunk.choices;

            setMessages((existing) => {
              const existingMessageIndex = existing.findIndex(
                (x) => x.id === chunk.id
              );
              if (existingMessageIndex === -1) {
                return [
                  ...existing,
                  {
                    id: chunk.id,
                    incomplete: true,
                    timestamp: Date.now(),
                    ...choice.delta,
                  },
                ] as MessageType[];
              }
              const existingMessage = {
                ...existing[existingMessageIndex],
              };
              if (choice.finish_reason != null) {
                existingMessage.incomplete = false;
              } else {
                existingMessage.content += choice.delta.content;
              }
              return existing.with(existingMessageIndex, existingMessage);
            });
          }
          case "done": {
            // noop
          }
        }

        requestAnimationFrame(() => {
          if (msgList.current != null) {
            msgList.current.scrollTop = msgList.current.scrollHeight;
          }
        });
      });
    },
    [setMessages]
  );

  useEffect(() => {
    (window as any).messages = messages;
  }, [messages]);

  const sendMessage = () => {
    if (newMessage === "/clear") {
      setMessages([]);
      setNewMessage("");
      return;
    }

    const id = crypto.randomUUID();
    const nextMessages: MessageType[] = [
      ...messages,
      { id, role: "user", content: newMessage, timestamp: Date.now() },
    ];
    setMessages(nextMessages);
    setNewMessage("");
    request(nextMessages);
  };

  return (
    <div
      className="flex flex-col lg:max-w-4xl lg:mx-auto justify-between mx-4"
      style={{ height: "88vh" }}
    >
      <MessageList ref={msgList} messages={messages} />
      <NewMessageForm
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
      />
    </div>
  );
}

import { createParser } from "eventsource-parser";
import type { MessageType } from "./types";

// TODO: Use [Symbol.dispose].
async function* fromStream<T>(stream: ReadableStream<T>) {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        return;
      }
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

export type ChunkMessage =
  | { type: "done" }
  | {
      type: "chunk";
      created: number;
      id: string;
      model: string;
      object: "chat.completion.chunk";
      choices: {
        delta: MessageType;
        finish_reason: null | "stop";
        index: number;
      }[];
    };

export async function streamResponse(
  res: Response,
  onChunk: (data: ChunkMessage) => void
): Promise<void> {
  const parser = createParser((event) => {
    if (event.type === "event") {
      const { data } = event;
      if (data === "[DONE]") {
        onChunk({ type: "done" });
      } else {
        onChunk({ type: "chunk", ...JSON.parse(data) });
      }
    }
  });

  for await (const chunk of fromStream(res.body!)) {
    const str = new TextDecoder().decode(chunk);
    parser.feed(str);
  }
}

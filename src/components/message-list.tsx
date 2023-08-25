import React, { forwardRef } from "react";
import { MessageType } from "@/types";
import { Message } from "./message";

export type MessageListProps = {
  /**
   * The list of messages to display.
   * @see src/types.ts
   */
  messages: MessageType[];
};

// eslint-disable-next-line react/display-name
export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  (props, ref) => {
    const { messages } = props;

    return (
      <div className="overflow-auto" ref={ref}>
        {messages.map((message, index) => (
          <Message message={message} key={index} />
        ))}
      </div>
    );
  }
);

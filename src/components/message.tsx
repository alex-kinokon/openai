import { MessageType } from "@/types";
import { cx } from "@emotion/css";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import RelativeTime from "@yaireo/relative-time";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@react-hookz/web";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/cjs/styles/prism";

const relativeTime = new RelativeTime();

export type MessageProps = {
  /**
   * The message to display.
   * @see src/types.ts
   */
  message: MessageType;
};

const remarkPlugins = [remarkGfm];

export const Message = (props: MessageProps) => {
  const { message } = props;
  const darkMode = useMediaQuery("(prefers-color-scheme: dark)");

  return (
    <div
      className={cx(
        "flex flex-row gap-4 p-2 first:rounded-t-md last:rounded-b-md text-black dark:text-white bg-white dark:bg-slate-800 rounded",
        message.role === "user" && "dark:bg-slate-700"
      )}
    >
      <div className="shrink">
        {message.role === "user" ? (
          <>
            <span className="sr-only">Message from you</span>
            <p className="text-gray-500 dark:text-gray-300">You</p>
          </>
        ) : (
          <>
            <span className="sr-only">Message from bot</span>
            <p className="text-gray-500 dark:text-gray-300">Bot</p>
          </>
        )}
      </div>

      {/* Maybe a non-plaintext format would be a bit nicer to read? */}
      <div className="grow">
        <ReactMarkdown
          remarkPlugins={remarkPlugins}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter
                  {...props}
                  style={darkMode ? oneDark : oneLight}
                  language={match[1]}
                  PreTag="div"
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code {...props} className={className}>
                  {children}
                </code>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
        {message.incomplete ? (
          <EllipsisHorizontalIcon className="w-6 h-6 -ml-1 animate-pulse" />
        ) : message.timestamp != null ? (
          <TimeStamp time={message.timestamp} />
        ) : null}
      </div>
    </div>
  );
};

function TimeStamp({ time }: { time: number }) {
  const [, forceUpdate] = useState(false);
  useEffect(() => {
    const timeout = setInterval(() => forceUpdate((x) => !x), 900);
    return () => clearInterval(timeout);
  }, []);

  return (
    <span className="text-gray-500 dark:text-gray-300 italic">
      {" "}
      ({relativeTime.from(new Date(time))})
    </span>
  );
}

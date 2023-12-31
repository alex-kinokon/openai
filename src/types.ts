/**
 * The message to display. By default, this is an object with a `role` and `content` property.
 * Feel free to modify this as you wish, or use a different type (even from another library) altogether.
 */
export type MessageType = {
  id?: string;
  role: "assistant" | "function" | "system" | "user";
  content: string;

  // An assistant message can be incomplete
  incomplete?: boolean;
  // ctime of the message
  timestamp?: number;
};

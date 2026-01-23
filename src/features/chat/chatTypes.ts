export interface SupportMessage {
  content: string;
  from: string;
  to: string;
  messageType: "TEXT" | "IMAGE" | "SYSTEM";
  timestamp: string;
  read: boolean;
}

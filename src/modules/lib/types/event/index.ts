import { MessageEvent } from "./message";
import { NoticeEvent } from "./notice";
import { RequestEvent } from "./request";
import { SystemEvent } from "./system";

export type EventData = MessageEvent | NoticeEvent | RequestEvent | SystemEvent;

export * from "./message";
export * from "./notice";
export * from "./request";
export * from "./system";
// ---------------
// --- Message ---
// ---------------

export enum MessageAction {
  CreateHeatmap,
  DisplayHeatmap,
}

export type Message = {
  action: MessageAction;
  payload?: any;
};

// ------------------------
// --- Message Response ---
// ------------------------

export enum MessageResponseStatus {
  Success,
  Error,
}

export type MessageResponse = {
  status: MessageResponseStatus;
  message?: string;
  payload?: any;
};

// ------------------------
// --- Message Callback ---
// ------------------------

export type MessageCallback = (response: MessageResponse) => void;

export type MessageSender = chrome.runtime.MessageSender;

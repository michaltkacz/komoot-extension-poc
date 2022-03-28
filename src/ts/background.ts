import {
  Message,
  MessageAction,
  MessageSender,
  MessageCallback,
  MessageResponseStatus,
} from './common/messaging';
import { HeatmapData } from './common/common';
import { syncData } from './background/sync';

chrome.runtime.onMessage.addListener(
  (message: Message, sender: MessageSender, sendResponse: MessageCallback) => {
    switch (message.action) {
      case MessageAction.CreateHeatmap:
        const userId = message.payload;
        if (isNaN(parseInt(userId))) {
          throw new Error('User ID should be a number');
        }

        syncData(userId)
          .then((data: HeatmapData) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              const tabId = tabs[0]?.id as number;
              if (!tabId) {
                throw new Error("Extension can't communicate with Komoot tab");
              }

              const message: Message = {
                action: MessageAction.DisplayHeatmap,
                payload: data,
              };

              const callback: MessageCallback = sendResponse;

              chrome.tabs.sendMessage(tabId, message, callback);
            });
          })
          .catch((error) => {
            sendResponse({
              status: MessageResponseStatus.Error,
              message: error.message,
            });
          });

        break;
      default:
        // nothing
        break;
    }
    return true;
  }
);

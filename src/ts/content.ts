import '../css/content.css';
import { HeatmapData } from './common/common';
import {
  Message,
  MessageAction,
  MessageCallback,
  MessageResponseStatus,
  MessageSender,
} from './common/messaging';
import { createHeatmap } from './content/heatmap';

chrome.runtime.onMessage.addListener(
  (message: Message, sender: MessageSender, sendResponse: MessageCallback) => {
    switch (message.action) {
      case MessageAction.DisplayHeatmap:
        const data = message.payload as HeatmapData;
        createHeatmap(data)
          .then(() => {
            sendResponse({
              status: MessageResponseStatus.Success,
              message: 'Heatmap created',
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
        break;
    }
    return true;
  }
);

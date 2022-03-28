import '@picocss/pico/css/pico.min.css';
import '../css/popup.css';
import { UserIds } from './common/common';
import {
  Message,
  MessageAction,
  MessageResponse,
  MessageCallback,
  MessageResponseStatus,
} from './common/messaging';

// -------------------
// --- Definitions ---
// -------------------

type AlertType = 'success' | 'error';

// --------------------
// --- DOM Elements ---
// --------------------

const userIdInput = document.querySelector('#userIdInput') as HTMLInputElement;

const progress = document.querySelector('#progress') as HTMLProgressElement;

const alertContainer = document.querySelector(
  '#alertContainer'
) as HTMLDivElement;

const createHeatmapButton = document.querySelector(
  '#createHeatmapButton'
) as HTMLInputElement;

const userIdsList = document.querySelector(
  '#userIdsList'
) as HTMLDataListElement;

const clearCacheButton = document.querySelector(
  '#clearCacheButton'
) as HTMLAnchorElement;

const clearUsersButton = document.querySelector(
  '#clearUsersButton'
) as HTMLAnchorElement;

// -----------------------
// --- Event Listeners ---
// -----------------------

createHeatmapButton.addEventListener('click', () => {
  showProcessing(true);
  showAlert(null);

  const message: Message = {
    action: MessageAction.CreateHeatmap,
    payload: userIdInput.value,
  };

  const callback: MessageCallback = (response: MessageResponse) => {
    showProcessing(false);
    switch (response.status) {
      case MessageResponseStatus.Success:
        showAlert('success', response.message);
        saveUserId(userIdInput.value);
        break;
      case MessageResponseStatus.Error:
        showAlert('error', response.message);
        break;
      default:
        // nothing
        break;
    }
  };

  chrome.runtime.sendMessage(message, callback);
});

clearCacheButton.addEventListener('click', (e: MouseEvent) => {
  e.preventDefault();
  chrome.storage.local.clear(() => {
    showAlert('success', 'Cache cleared');
  });
});

clearUsersButton.addEventListener('click', (e: MouseEvent) => {
  e.preventDefault();
  chrome.storage.local.remove('users', () => {
    showAlert('success', 'User IDs cleared');
  });
});

document.addEventListener('DOMContentLoaded', () => {
  loadUserIds();
});

// ------------------------
// --- Helper functions ---
// ------------------------

const showAlert = (type: AlertType | null, message?: string) => {
  if (type && message) {
    alertContainer.innerHTML = `<p class=${type}>${message}</p>`;
    return;
  }
  alertContainer.innerHTML = '';
};

const showProcessing = (show: boolean) => {
  if (show) {
    createHeatmapButton.disabled = true;
    userIdInput.disabled = true;
    progress.classList.remove('hidden');
  } else {
    createHeatmapButton.disabled = false;
    userIdInput.disabled = false;
    progress.classList.add('hidden');
  }
};

const saveUserId = (userId: string) => {
  chrome.storage.local.get('userIds', (result) => {
    const oldUserIds = result?.userIds as UserIds;
    if (oldUserIds && !oldUserIds.includes(userId)) {
      chrome.storage.local.set(
        { userIds: [userId, ...oldUserIds] },
        loadUserIds
      );
      return;
    }

    chrome.storage.local.set({ userIds: [userId] }, loadUserIds);
  });
};

const loadUserIds = () => {
  chrome.storage.local.get('userIds', (result) => {
    const userIds = result?.userIds as UserIds;
    if (userIds) {
      userIdsList.innerHTML = '';
      userIds.forEach((id) => {
        const option = document.createElement('option');
        option.value = id;
        userIdsList.appendChild(option);
      });
    }
  });
};

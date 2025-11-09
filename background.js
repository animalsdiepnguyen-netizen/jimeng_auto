// Background Service Worker
console.log('Jimeng Batch Generator - Background worker loaded');

// Handle download requests from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'download') {
    downloadImage(message.url, message.filename);
    sendResponse({ success: true });
  }
  return true;
});

async function downloadImage(url, filename) {
  try {
    console.log('⬇️ Background: Starting download:', filename);
    
    // Download the image to jimeng-download folder
    const downloadId = await chrome.downloads.download({
      url: url,
      filename: filename, // Already includes jimeng-download/ prefix
      saveAs: false,
      conflictAction: 'uniquify'
    });

    console.log('✅ Background: Download started:', downloadId, filename);

    // Listen for download completion
    chrome.downloads.onChanged.addListener(function listener(delta) {
      if (delta.id === downloadId && delta.state) {
        if (delta.state.current === 'complete') {
          console.log('✅ Background: Download completed:', filename);
          showNotification('Image downloaded', filename);
          chrome.downloads.onChanged.removeListener(listener);
        } else if (delta.state.current === 'interrupted') {
          console.error('❌ Background: Download failed:', filename);
          chrome.downloads.onChanged.removeListener(listener);
        }
      }
    });

  } catch (error) {
    console.error('❌ Background: Error downloading image:', error);
  }
}

function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: title,
    message: message,
    priority: 0
  });
}

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Jimeng Batch Generator installed');
    
    // Initialize storage
    chrome.storage.local.set({
      settings: {
        maxSendsPerRound: 9,
        waitIntervalMinutes: 3,
        promptIntervalSeconds: 45,
        sendMode: 'normal',
        autoDownload: true,
        fileNamePattern: '{timestamp}_{index}_{prompt}'
      },
      downloadedHashes: []
    });
    
    // Open welcome page (optional)
    // chrome.tabs.create({ url: 'welcome.html' });
  }
});

// Cleanup old data periodically (every 7 days)
chrome.alarms.create('cleanup', { periodInMinutes: 10080 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanup') {
    chrome.storage.local.get(['downloadedHashes'], (result) => {
      const hashes = result.downloadedHashes || [];
      
      // Keep only last 10000 hashes to prevent storage bloat
      if (hashes.length > 10000) {
        const trimmed = hashes.slice(-10000);
        chrome.storage.local.set({ downloadedHashes: trimmed });
        console.log('Cleaned up old download hashes');
      }
    });
  }
});

// Handle extension icon click - open popup
chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes('jimeng.jianying.com')) {
    // Already on Jimeng, the content script should be running
    chrome.tabs.sendMessage(tab.id, { action: 'getStatus' }, (response) => {
      if (response) {
        console.log('Extension status:', response);
      }
    });
  } else {
    // Not on Jimeng, redirect to it
    chrome.tabs.create({ url: 'https://jimeng.jianying.com/ai-tool/generate?type=image' });
  }
});

// Keep service worker alive
let keepAliveInterval;

function keepAlive() {
  keepAliveInterval = setInterval(() => {
    chrome.runtime.getPlatformInfo(() => {
      // Just checking to keep alive
    });
  }, 20000); // Every 20 seconds
}

keepAlive();

// Restart keep-alive if service worker restarts
chrome.runtime.onStartup.addListener(() => {
  console.log('Service worker restarted');
  keepAlive();
});

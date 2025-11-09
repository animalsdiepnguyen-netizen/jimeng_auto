// Popup Script
console.log('Popup loaded');

document.addEventListener('DOMContentLoaded', async () => {
  await loadStatus();
  attachEventListeners();
});

async function loadStatus() {
  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('jimeng.jianying.com')) {
      // Not on Jimeng website
      document.getElementById('status-text').textContent = 'Please open Jimeng website';
      return;
    }

    // Get status from content script
    chrome.tabs.sendMessage(tab.id, { action: 'getStatus' }, (response) => {
      if (chrome.runtime.lastError) {
        document.getElementById('status-text').textContent = 'Extension not loaded';
        return;
      }

      if (response) {
        updateUI(response);
      }
    });

  } catch (error) {
    console.error('Error loading status:', error);
  }
}

function updateUI(status) {
  document.getElementById('queue-count').textContent = status.queueLength || 0;
  document.getElementById('completed-count').textContent = status.stats?.completed || 0;
  document.getElementById('failed-count').textContent = status.stats?.failed || 0;
  document.getElementById('downloaded-count').textContent = status.stats?.downloaded || 0;

  const indicator = document.getElementById('status-indicator');
  const statusText = document.getElementById('status-text');

  if (status.isProcessing) {
    indicator.classList.add('active');
    indicator.classList.remove('inactive');
    statusText.textContent = 'Processing...';
  } else {
    indicator.classList.remove('active');
    indicator.classList.add('inactive');
    statusText.textContent = status.queueLength > 0 ? 'Ready' : 'No prompts in queue';
  }
}

function attachEventListeners() {
  document.getElementById('open-jimeng').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://jimeng.jianying.com/ai-tool/generate?type=image' });
  });

  document.getElementById('open-settings').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab.url.includes('jimeng.jianying.com')) {
      // Focus on the tab if it's Jimeng
      chrome.tabs.update(tab.id, { active: true });
      window.close();
    } else {
      alert('Please open Jimeng website first');
    }
  });

  document.getElementById('view-docs').addEventListener('click', () => {
    const docs = `
Jimeng Batch Generator - Quick Guide

1. ADDING PROMPTS:
   - Type or paste prompts in the text area (one per line)
   - Click "Import" to load from file (.txt, .csv, .json)
   - Click "Add to Queue" to add prompts

2. SETTINGS:
   - Send Mode: Fast/Normal/Slow presets
   - Max Sends/Round: How many before waiting
   - Wait Interval: Rest time between rounds
   - Prompt Interval: Wait between each prompt
   - Auto Download: Automatically save images

3. CONTROLS:
   - Start: Begin processing queue
   - Pause: Temporarily pause processing
   - Stop: Stop processing completely
   - Clear Queue: Remove all pending prompts

4. FEATURES:
   - Duplicate detection (won't download same image twice)
   - Queue management with status tracking
   - Export logs for analysis
   - Human-like behavior to avoid detection

5. TIPS:
   - Use Normal mode for best balance
   - Keep browser window visible while processing
   - Check downloaded images in Downloads/jimeng-batch/
   - Export logs regularly for record keeping

Need help? Check the panel on Jimeng website!
    `;
    
    alert(docs);
  });
}

// Refresh status every 2 seconds
setInterval(loadStatus, 2000);

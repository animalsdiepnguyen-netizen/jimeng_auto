// Content Script - Runs on jimeng.jianying.com
console.log('Jimeng Batch Generator loaded');

class JimengBatchGenerator {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.isPaused = false;
    this.currentIndex = 0;
    this.downloadedHashes = new Set();
    this.stats = {
      total: 0,
      completed: 0,
      failed: 0,
      downloaded: 0
    };
    
    // Settings
    this.settings = {
      maxSendsPerRound: 9,
      waitIntervalMinutes: 3,
      promptIntervalSeconds: 45,
      sendMode: 'normal',
      autoDownload: true,
      fileNamePattern: '{timestamp}_{index}_{prompt}'
    };
    
    this.init();
  }

  async init() {
    await this.loadSettings();
    await this.loadDownloadedHashes();
    this.createFloatingPanel();
    this.setupMessageListener();
    this.observeImageGeneration();
  }

  async loadSettings() {
    const stored = await chrome.storage.local.get(['settings']);
    if (stored.settings) {
      this.settings = { ...this.settings, ...stored.settings };
    }
  }

  async saveSettings() {
    await chrome.storage.local.set({ settings: this.settings });
  }

  async loadDownloadedHashes() {
    const stored = await chrome.storage.local.get(['downloadedHashes']);
    if (stored.downloadedHashes) {
      this.downloadedHashes = new Set(stored.downloadedHashes);
    }
  }

  async saveDownloadedHashes() {
    await chrome.storage.local.set({ 
      downloadedHashes: Array.from(this.downloadedHashes) 
    });
  }

  createFloatingPanel() {
    const panel = document.createElement('div');
    panel.id = 'jimeng-batch-panel';
    panel.className = 'jimeng-panel';
    panel.innerHTML = `
      <div class="panel-header">
        <h3>🎨 Jimeng Batch Generator</h3>
        <button id="panel-minimize">−</button>
      </div>
      <div class="panel-body">
        <div class="section">
          <h4>📝 Prompts Queue</h4>
          <textarea id="prompt-input" placeholder="Enter prompts (one per line)...
Example:
cute cat in garden
beautiful sunset over ocean
happy dog playing"></textarea>
          <div class="button-group">
            <button id="import-prompts" class="btn-secondary">📁 Import</button>
            <button id="add-prompts" class="btn-primary">➕ Add to Queue</button>
          </div>
        </div>

        <div class="section">
          <h4>📊 Statistics</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Queue:</span>
              <span class="stat-value" id="stat-total">0</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Completed:</span>
              <span class="stat-value" id="stat-completed">0</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Failed:</span>
              <span class="stat-value" id="stat-failed">0</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Downloaded:</span>
              <span class="stat-value" id="stat-downloaded">0</span>
            </div>
          </div>
          <div class="progress-bar">
            <div id="progress-fill" class="progress-fill"></div>
          </div>
          <div id="status-text" class="status-text">Ready</div>
        </div>

        <div class="section">
          <h4>⚙️ Settings</h4>
          <div class="setting-item">
            <label>Send Mode:</label>
            <select id="send-mode">
              <option value="fast">Fast</option>
              <option value="normal" selected>Normal</option>
              <option value="slow">Slow</option>
            </select>
          </div>
          <div class="setting-item">
            <label>Max Sends/Round:</label>
            <input type="number" id="max-sends" value="9" min="1" max="20">
          </div>
          <div class="setting-item">
            <label>Wait Interval (min):</label>
            <input type="number" id="wait-interval" value="3" min="0" max="15" step="0.5">
          </div>
          <div class="setting-item">
            <label>Prompt Interval (sec):</label>
            <input type="number" id="prompt-interval" value="45" min="3" max="180">
          </div>
          <div class="setting-item">
            <label>
              <input type="checkbox" id="auto-download" checked>
              Auto Download Images
            </label>
          </div>
        </div>

        <div class="section">
          <h4>🔧 Debug Tools</h4>
          <div class="button-group">
            <button id="inspect-page" class="btn-secondary">🔍 Inspect Page</button>
            <button id="test-generation" class="btn-secondary">🧪 Test Generate</button>
          </div>
          <div id="debug-output" class="debug-output"></div>
        </div>

        <div class="section">
          <h4>🎮 Controls</h4>
          <div class="button-group">
            <button id="start-btn" class="btn-success">▶ Start</button>
            <button id="pause-btn" class="btn-warning" disabled>⏸ Pause</button>
            <button id="stop-btn" class="btn-danger" disabled>⏹ Stop</button>
          </div>
          <div class="button-group">
            <button id="clear-queue" class="btn-secondary">🗑 Clear Queue</button>
            <button id="export-logs" class="btn-secondary">📤 Export Logs</button>
          </div>
        </div>

        <div class="section queue-list">
          <h4>📋 Current Queue (<span id="queue-count">0</span>)</h4>
          <div id="queue-items" class="queue-items"></div>
        </div>
      </div>
    `;
    
    document.body.appendChild(panel);
    this.attachPanelEvents();
    this.makePanelDraggable(panel);
  }

  makePanelDraggable(panel) {
    const header = panel.querySelector('.panel-header h3');
    let isDragging = false;
    let currentX, currentY, initialX, initialY;

    header.style.cursor = 'move';

    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      initialX = e.clientX - panel.offsetLeft;
      initialY = e.clientY - panel.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        panel.style.left = currentX + 'px';
        panel.style.top = currentY + 'px';
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  attachPanelEvents() {
    // Minimize button
    document.getElementById('panel-minimize').addEventListener('click', () => {
      const panel = document.getElementById('jimeng-batch-panel');
      panel.classList.toggle('minimized');
    });

    // Add prompts
    document.getElementById('add-prompts').addEventListener('click', () => {
      const input = document.getElementById('prompt-input');
      const prompts = input.value.split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);
      
      if (prompts.length > 0) {
        this.addPromptsToQueue(prompts);
        input.value = '';
      }
    });

    // Import prompts
    document.getElementById('import-prompts').addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt,.csv,.json';
      input.onchange = (e) => this.importPromptsFromFile(e.target.files[0]);
      input.click();
    });

    // Control buttons
    document.getElementById('start-btn').addEventListener('click', () => this.startProcessing());
    document.getElementById('pause-btn').addEventListener('click', () => this.pauseProcessing());
    document.getElementById('stop-btn').addEventListener('click', () => this.stopProcessing());
    document.getElementById('clear-queue').addEventListener('click', () => this.clearQueue());
    document.getElementById('export-logs').addEventListener('click', () => this.exportLogs());

    // Debug tools
    document.getElementById('inspect-page').addEventListener('click', () => this.inspectPage());
    document.getElementById('test-generation').addEventListener('click', () => this.testGeneration());

    // Settings
    document.getElementById('send-mode').addEventListener('change', (e) => {
      this.settings.sendMode = e.target.value;
      this.updateIntervalsByMode(e.target.value);
      this.saveSettings();
    });

    document.getElementById('max-sends').addEventListener('change', (e) => {
      this.settings.maxSendsPerRound = parseInt(e.target.value);
      this.saveSettings();
    });

    document.getElementById('wait-interval').addEventListener('change', (e) => {
      this.settings.waitIntervalMinutes = parseFloat(e.target.value);
      this.saveSettings();
    });

    document.getElementById('prompt-interval').addEventListener('change', (e) => {
      this.settings.promptIntervalSeconds = parseInt(e.target.value);
      this.saveSettings();
    });

    document.getElementById('auto-download').addEventListener('change', (e) => {
      this.settings.autoDownload = e.target.checked;
      this.saveSettings();
    });
  }

  updateIntervalsByMode(mode) {
    const presets = {
      fast: { maxSends: 5, wait: 0, interval: 30 },
      normal: { maxSends: 9, wait: 3, interval: 45 },
      slow: { maxSends: 11, wait: 9, interval: 90 }
    };

    const preset = presets[mode];
    document.getElementById('max-sends').value = preset.maxSends;
    document.getElementById('wait-interval').value = preset.wait;
    document.getElementById('prompt-interval').value = preset.interval;

    this.settings.maxSendsPerRound = preset.maxSends;
    this.settings.waitIntervalMinutes = preset.wait;
    this.settings.promptIntervalSeconds = preset.interval;
  }

  addPromptsToQueue(prompts) {
    prompts.forEach(prompt => {
      this.queue.push({
        id: Date.now() + Math.random(),
        prompt: prompt,
        status: 'pending',
        addedAt: new Date().toISOString()
      });
    });
    this.stats.total = this.queue.length;
    this.updateUI();
    this.showNotification('success', `Added ${prompts.length} prompts to queue`);
  }

  async importPromptsFromFile(file) {
    const text = await file.text();
    let prompts = [];

    if (file.name.endsWith('.json')) {
      try {
        const data = JSON.parse(text);
        prompts = Array.isArray(data) ? data : data.prompts || [];
      } catch (e) {
        this.showNotification('error', 'Invalid JSON file');
        return;
      }
    } else if (file.name.endsWith('.csv')) {
      prompts = text.split('\n').slice(1); // Skip header
    } else {
      prompts = text.split('\n');
    }

    prompts = prompts.map(p => p.trim()).filter(p => p.length > 0);
    this.addPromptsToQueue(prompts);
  }

  async startProcessing() {
    if (this.queue.length === 0) {
      this.showNotification('warning', 'Queue is empty! Add prompts first.');
      return;
    }

    this.isProcessing = true;
    this.isPaused = false;
    this.updateControlButtons();
    this.updateStatus('Processing...');

    await this.processQueue();
  }

  pauseProcessing() {
    this.isPaused = !this.isPaused;
    const btn = document.getElementById('pause-btn');
    btn.textContent = this.isPaused ? '▶ Resume' : '⏸ Pause';
    this.updateStatus(this.isPaused ? 'Paused' : 'Processing...');
  }

  stopProcessing() {
    this.isProcessing = false;
    this.isPaused = false;
    this.updateControlButtons();
    this.updateStatus('Stopped');
    this.showNotification('info', 'Processing stopped');
  }

  clearQueue() {
    if (confirm('Clear all pending prompts from queue?')) {
      this.queue = this.queue.filter(item => item.status !== 'pending');
      this.stats.total = this.queue.length;
      this.updateUI();
      this.showNotification('info', 'Queue cleared');
    }
  }

  async processQueue() {
    let roundCount = 0;
    
    while (this.isProcessing && this.currentIndex < this.queue.length) {
      // Wait if paused
      while (this.isPaused && this.isProcessing) {
        await this.sleep(1000);
      }

      if (!this.isProcessing) break;

      const item = this.queue[this.currentIndex];
      
      if (item.status === 'pending') {
        this.updateStatus(`Processing ${this.currentIndex + 1}/${this.queue.length}: ${item.prompt.substring(0, 30)}...`);
        
        try {
          await this.fillPromptAndGenerate(item.prompt);
          item.status = 'completed';
          this.stats.completed++;
          roundCount++;
          
          // Wait for image to be generated and download
          await this.sleep(3000);
          
        } catch (error) {
          console.error('Error processing prompt:', error);
          item.status = 'failed';
          this.stats.failed++;
        }

        this.currentIndex++;
        this.updateUI();

        // Check if we need to wait between rounds
        if (roundCount >= this.settings.maxSendsPerRound && this.currentIndex < this.queue.length) {
          const waitMs = this.settings.waitIntervalMinutes * 60 * 1000;
          this.updateStatus(`Waiting ${this.settings.waitIntervalMinutes} min before next round...`);
          await this.sleep(waitMs);
          roundCount = 0;
        } else if (this.currentIndex < this.queue.length) {
          // Wait between prompts
          await this.sleep(this.settings.promptIntervalSeconds * 1000);
        }
      } else {
        this.currentIndex++;
      }
    }

    if (this.isProcessing) {
      this.isProcessing = false;
      this.updateControlButtons();
      this.updateStatus('Completed!');
      this.showNotification('success', `Finished! Completed: ${this.stats.completed}, Failed: ${this.stats.failed}`);
    }
  }

  async fillPromptAndGenerate(prompt) {
    console.log('🎯 Starting generation for prompt:', prompt);
    
    // EXACT SELECTORS from Jimeng website
    let promptInput = null;
    
    // Strategy 1: Use exact class from Jimeng
    promptInput = document.querySelector('textarea.prompt-textarea-XfqAo8') ||
                  document.querySelector('textarea.lv-textarea') ||
                  document.querySelector('textarea[placeholder*="请描述"]') ||
                  document.querySelector('textarea[placeholder*="描述"]');
    
    // Strategy 2: Find by class pattern
    if (!promptInput) {
      const textareas = document.querySelectorAll('textarea');
      console.log('📝 Found textareas:', textareas.length);
      
      for (const ta of textareas) {
        if (ta.className.includes('prompt-textarea') || 
            ta.className.includes('lv-textarea')) {
          const rect = ta.getBoundingClientRect();
          if (rect.width > 100 && rect.height > 50) {
            promptInput = ta;
            console.log('✅ Found textarea by class pattern');
            break;
          }
        }
      }
    }
    
    // Strategy 3: Fallback to any visible textarea
    if (!promptInput) {
      const textareas = document.querySelectorAll('textarea');
      for (const ta of textareas) {
        const rect = ta.getBoundingClientRect();
        if (rect.width > 100 && rect.height > 50 && 
            window.getComputedStyle(ta).display !== 'none') {
          promptInput = ta;
          console.log('✅ Found visible textarea (fallback)');
          break;
        }
      }
    }
    
    if (!promptInput) {
      console.error('❌ Could not find prompt input');
      throw new Error('Could not find prompt input');
    }

    console.log('✅ Found prompt input:', {
      tag: promptInput.tagName,
      class: promptInput.className,
      placeholder: promptInput.placeholder
    });

    // Clear and fill the prompt
    promptInput.value = '';
    await this.sleep(200);
    
    // Focus first
    promptInput.focus();
    await this.sleep(100);
    
    // Type prompt character by character (more human-like)
    for (let i = 0; i < prompt.length; i++) {
      promptInput.value = prompt.substring(0, i + 1);
      promptInput.dispatchEvent(new Event('input', { bubbles: true }));
      await this.sleep(10); // Small delay between characters
    }
    
    // Trigger all necessary events
    promptInput.dispatchEvent(new Event('change', { bubbles: true }));
    promptInput.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a' }));
    promptInput.dispatchEvent(new Event('blur', { bubbles: true }));
    
    console.log('✅ Prompt filled, waiting for button to enable...');
    
    // Wait for button to become enabled (max 5 seconds)
    let generateBtn = null;
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds (50 * 100ms)
    
    while (attempts < maxAttempts && !generateBtn) {
      await this.sleep(100);
      attempts++;
      
      // Find button with exact class patterns from Jimeng
      const buttons = document.querySelectorAll('button');
      
      for (const btn of buttons) {
        const isSubmitButton = btn.className.includes('submit-button') ||
                              btn.className.includes('lv-btn');
        
        // NEW: Check if it's circular icon-only button (arrow button)
        const isCircularIconButton = btn.className.includes('lv-btn-shape-circle') &&
                                     btn.className.includes('lv-btn-icon-only');
        
        // Check if it's a generate/submit button
        const hasGenerateIcon = btn.querySelector('svg');
        const isVisible = btn.getBoundingClientRect().width > 0;
        const isEnabled = !btn.disabled;
        
        // Accept either submit button OR circular icon button
        if ((isSubmitButton || isCircularIconButton) && hasGenerateIcon && isVisible && isEnabled) {
          generateBtn = btn;
          console.log('✅ Found enabled generate button:', {
            class: btn.className.substring(0, 50),
            disabled: btn.disabled,
            attempts: attempts,
            type: isCircularIconButton ? 'circular-icon-button' : 'submit-button'
          });
          break;
        }
      }
      
      // Also try finding by button near textarea
      if (!generateBtn && attempts > 20) {
        const allButtons = Array.from(buttons);
        for (const btn of allButtons) {
          if (!btn.disabled && btn.getBoundingClientRect().width > 0) {
            const btnText = btn.textContent.trim();
            const hasIcon = btn.querySelector('svg');
            
            // If it has SVG icon and is enabled, likely the generate button
            if (hasIcon && btnText === '') {
              generateBtn = btn;
              console.log('✅ Found button by icon (fallback)');
              break;
            }
          }
        }
      }
    }
    
    if (!generateBtn) {
      console.error('❌ Generate button not enabled after 5 seconds');
      console.log('Available buttons:', 
        Array.from(document.querySelectorAll('button')).map(b => ({
          class: b.className.substring(0, 50),
          disabled: b.disabled,
          hasIcon: !!b.querySelector('svg'),
          text: b.textContent.trim().substring(0, 20)
        }))
      );
      throw new Error('Generate button did not enable. Try adding more text to prompt.');
    }

    console.log('🖱️ Clicking generate button...');
    
    // Simulate human-like click
    await this.humanLikeClick(generateBtn);
    
    console.log('✅ Generate button clicked successfully!');
    
    // Wait a bit for the generation to start
    await this.sleep(1000);
  }

  async humanLikeClick(element) {
    // Random small mouse movement before click
    await this.sleep(Math.random() * 200 + 100);
    
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await this.sleep(Math.random() * 50 + 50);
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    element.click();
  }

  observeImageGeneration() {
    console.log('🖼️ Setting up image observer...');
    
    // Watch for new images being generated
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // Look for image containers in Jimeng's structure
            const imageContainers = node.querySelectorAll ? 
              node.querySelectorAll('.image-record-xMHpRO, [class*="image-record"], [class*="scroll-slot"]') : [];
            
            imageContainers.forEach(container => {
              const imgs = container.querySelectorAll('img[src*="http"]');
              imgs.forEach(img => this.handleNewImage(img));
            });
            
            // Also check if the node itself is an image
            if (node.tagName === 'IMG' && node.src && node.src.startsWith('http')) {
              this.handleNewImage(node);
            }
            
            // Check images inside the node
            const images = node.querySelectorAll ? 
              node.querySelectorAll('img[src*="http"]') : [];
            
            images.forEach(img => {
              // Only process images that are large enough (generated images)
              const rect = img.getBoundingClientRect();
              if (rect.width > 100 && rect.height > 100) {
                this.handleNewImage(img);
              }
            });
          }
        });
      });
    });

    // Observe the main content area and results area
    const targetNode = document.body;
    observer.observe(targetNode, {
      childList: true,
      subtree: true,
      attributes: false
    });
    
    console.log('✅ Image observer active');
    
    // Also poll for new images every 3 seconds (backup method)
    setInterval(() => {
      if (this.isProcessing && this.settings.autoDownload) {
        this.scanForNewImages();
      }
    }, 3000);
  }

  scanForNewImages() {
    // Scan for images that might have been missed
    const allImages = document.querySelectorAll('img[src*="http"]');
    
    allImages.forEach(img => {
      const rect = img.getBoundingClientRect();
      // Only check visible, large images
      if (rect.width > 200 && rect.height > 200) {
        this.handleNewImage(img);
      }
    });
  }

  async handleNewImage(img) {
    if (!this.settings.autoDownload || !this.isProcessing) return;

    const imageUrl = img.src;
    
    // Skip data URLs and invalid URLs
    if (!imageUrl || imageUrl.startsWith('data:') || !imageUrl.startsWith('http')) {
      return;
    }
    
    const hash = await this.hashString(imageUrl);

    if (this.downloadedHashes.has(hash)) {
      console.log('⏭️ Image already downloaded, skipping:', imageUrl.substring(0, 50));
      return;
    }

    // Wait a bit to ensure image is fully loaded
    await this.sleep(1000);

    try {
      console.log('⬇️ Downloading image:', imageUrl.substring(0, 80));
      await this.downloadImage(imageUrl, hash);
      this.downloadedHashes.add(hash);
      await this.saveDownloadedHashes();
      this.stats.downloaded++;
      this.updateUI();
      this.showNotification('success', `Downloaded image ${this.stats.downloaded}`);
    } catch (error) {
      console.error('❌ Error downloading image:', error);
    }
  }

  async downloadImage(url, hash) {
    const filename = this.generateFilename(this.currentIndex, this.queue[this.currentIndex]?.prompt);
    
    // Send download request to background script with custom folder
    chrome.runtime.sendMessage({
      action: 'download',
      url: url,
      filename: `jimeng-download/${filename}` // Custom folder name
    });
    
    console.log('✅ Download request sent:', filename);
  }

  generateFilename(index, prompt) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
    const promptPreview = prompt ? prompt.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_') : 'image';
    return `jimeng_${timestamp}_${index + 1}_${promptPreview}.png`;
  }

  async hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  updateUI() {
    // Update stats
    document.getElementById('stat-total').textContent = this.stats.total;
    document.getElementById('stat-completed').textContent = this.stats.completed;
    document.getElementById('stat-failed').textContent = this.stats.failed;
    document.getElementById('stat-downloaded').textContent = this.stats.downloaded;

    // Update progress bar
    const progress = this.stats.total > 0 ? (this.stats.completed + this.stats.failed) / this.stats.total * 100 : 0;
    document.getElementById('progress-fill').style.width = progress + '%';

    // Update queue list
    this.updateQueueList();

    // Update queue count
    document.getElementById('queue-count').textContent = this.queue.filter(i => i.status === 'pending').length;
  }

  updateQueueList() {
    const container = document.getElementById('queue-items');
    const pendingItems = this.queue.filter(item => item.status === 'pending').slice(0, 10);
    
    container.innerHTML = pendingItems.map((item, idx) => `
      <div class="queue-item ${item.id === this.queue[this.currentIndex]?.id ? 'active' : ''}">
        <span class="queue-index">${idx + 1}</span>
        <span class="queue-prompt">${item.prompt}</span>
        <span class="queue-status status-${item.status}">${item.status}</span>
      </div>
    `).join('');

    if (this.queue.filter(i => i.status === 'pending').length > 10) {
      container.innerHTML += '<div class="queue-item">... and more</div>';
    }
  }

  updateStatus(text) {
    document.getElementById('status-text').textContent = text;
  }

  updateControlButtons() {
    document.getElementById('start-btn').disabled = this.isProcessing;
    document.getElementById('pause-btn').disabled = !this.isProcessing;
    document.getElementById('stop-btn').disabled = !this.isProcessing;
  }

  showNotification(type, message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  inspectPage() {
    const output = document.getElementById('debug-output');
    
    const textareas = Array.from(document.querySelectorAll('textarea')).map(t => ({
      tag: 'textarea',
      placeholder: t.placeholder,
      id: t.id,
      class: t.className,
      visible: window.getComputedStyle(t).display !== 'none',
      dimensions: `${t.getBoundingClientRect().width}x${t.getBoundingClientRect().height}`
    }));
    
    const buttons = Array.from(document.querySelectorAll('button')).slice(0, 20).map(b => ({
      text: b.textContent.trim().substring(0, 40),
      class: b.className,
      disabled: b.disabled,
      visible: b.getBoundingClientRect().width > 0
    }));
    
    const contentEditables = Array.from(document.querySelectorAll('[contenteditable="true"]')).map(e => ({
      tag: e.tagName,
      class: e.className,
      id: e.id
    }));
    
    const info = {
      url: window.location.href,
      textareas: textareas,
      buttons: buttons,
      contentEditables: contentEditables
    };
    
    output.innerHTML = `<pre style="max-height: 200px; overflow-y: auto; font-size: 11px; background: #f5f5f5; padding: 10px; border-radius: 4px; margin-top: 10px;">${JSON.stringify(info, null, 2)}</pre>`;
    
    console.log('🔍 Page inspection:', info);
    this.showNotification('info', 'Page inspected - check console and panel');
  }

  async testGeneration() {
    this.showNotification('info', 'Testing generation...');
    try {
      await this.fillPromptAndGenerate('Test prompt from extension');
      this.showNotification('success', 'Test generation initiated!');
    } catch (error) {
      this.showNotification('error', `Test failed: ${error.message}`);
      console.error('Test generation error:', error);
    }
  }

  async exportLogs() {
    const logs = {
      exportDate: new Date().toISOString(),
      settings: this.settings,
      stats: this.stats,
      queue: this.queue,
      downloadedCount: this.downloadedHashes.size
    };

    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jimeng-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.showNotification('success', 'Logs exported successfully');
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'getStatus') {
        sendResponse({
          isProcessing: this.isProcessing,
          stats: this.stats,
          queueLength: this.queue.length
        });
      }
    });
  }
}

// Initialize when page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.jimengBatchGenerator = new JimengBatchGenerator();
  });
} else {
  window.jimengBatchGenerator = new JimengBatchGenerator();
}

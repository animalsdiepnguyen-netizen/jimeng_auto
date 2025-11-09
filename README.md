# 🎨 Jimeng Batch Generator

A powerful Chrome extension for automating batch AI image generation on Jimeng (jimeng.jianying.com).

## ✨ Features

### Core Features
- **Batch Processing**: Process multiple prompts automatically
- **Smart Queue Management**: Organized queue with status tracking
- **Auto Download**: Automatically download generated images
- **Duplicate Detection**: Won't download the same image twice
- **Rate Limiting**: Configurable sending intervals to avoid detection
- **Human-like Behavior**: Random delays and mouse movements

### Advanced Features
- **Import/Export**: Load prompts from files (.txt, .csv, .json)
- **Progress Tracking**: Real-time statistics and progress bar
- **Pause/Resume**: Full control over batch processing
- **Settings Presets**: Fast, Normal, and Slow modes
- **Export Logs**: Save processing history for analysis
- **Floating Panel**: Clean, draggable UI overlay

## 📦 Installation

### Method 1: Load Unpacked (Development)

1. **Download the extension**
   - Download all files to a folder on your computer

2. **Open Chrome Extensions**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)

3. **Load the extension**
   - Click "Load unpacked"
   - Select the `jimeng-batch-extension` folder
   - Extension should now appear in your extensions list

4. **Pin the extension**
   - Click the puzzle icon in Chrome toolbar
   - Find "Jimeng Batch Generator" and click the pin icon

### Method 2: Build and Install (Coming soon)
- Package as .crx file for easier distribution

## 🚀 How to Use

### 1. Open Jimeng Website
Navigate to [Jimeng Image Generator](https://jimeng.jianying.com/ai-tool/generate?type=image)

### 2. The Floating Panel
The control panel will appear automatically on the right side of the page.

### 3. Add Prompts

**Option A: Type Manually**
```
cute cat in sunny garden
beautiful sunset over ocean
happy dog playing in park
```

**Option B: Import from File**
- Click "📁 Import"
- Select your .txt, .csv, or .json file
- Prompts will be added to queue

### 4. Configure Settings

**Send Mode Options:**
- **Fast**: Quick generation (5 per round, 0 min wait, 30s interval)
- **Normal**: Balanced (9 per round, 3 min wait, 45s interval) ⭐ Recommended
- **Slow**: Safe & careful (11 per round, 9 min wait, 90s interval)

**Custom Settings:**
- **Max Sends/Round**: How many prompts before taking a break
- **Wait Interval**: Minutes to wait between rounds
- **Prompt Interval**: Seconds between each prompt
- **Auto Download**: Enable/disable automatic image downloads

### 5. Start Processing
1. Click **▶ Start** button
2. Extension will process queue automatically
3. Monitor progress in real-time
4. Downloaded images appear in `Downloads/jimeng-batch/`

### 6. Control Options
- **⏸ Pause**: Temporarily pause processing
- **⏹ Stop**: Stop processing completely
- **🗑 Clear Queue**: Remove all pending prompts
- **📤 Export Logs**: Save processing history

## 📊 Statistics Panel

The panel shows real-time stats:
- **Queue**: Total prompts in queue
- **Completed**: Successfully processed
- **Failed**: Failed generations
- **Downloaded**: Images downloaded

## 🎮 Keyboard Shortcuts

Currently, no keyboard shortcuts are implemented. Control via panel buttons.

## 📁 File Formats

### Import Formats

**TXT File** (one prompt per line):
```
prompt one
prompt two
prompt three
```

**CSV File**:
```csv
prompt
"cute cat in garden"
"beautiful sunset"
"happy dog"
```

**JSON File**:
```json
[
  "prompt one",
  "prompt two",
  "prompt three"
]
```

Or:
```json
{
  "prompts": [
    "prompt one",
    "prompt two"
  ]
}
```

### Export Format

Exported logs are JSON files containing:
```json
{
  "exportDate": "2025-11-09T10:30:00.000Z",
  "settings": { ... },
  "stats": {
    "total": 100,
    "completed": 95,
    "failed": 5,
    "downloaded": 95
  },
  "queue": [ ... ],
  "downloadedCount": 95
}
```

## 🛡️ Anti-Detection Features

The extension includes several features to avoid being detected as a bot:

1. **Random Intervals**: Slight variations in timing
2. **Human-like Clicks**: Simulated mouse down/up events
3. **Round-based Processing**: Takes breaks between batches
4. **Configurable Delays**: Customize to match your needs

## 🎯 Best Practices

1. **Use Normal Mode**: Best balance between speed and safety
2. **Don't Minimize Browser**: Keep tab visible during processing
3. **Monitor Progress**: Check occasionally to ensure smooth operation
4. **Regular Exports**: Save logs regularly for record-keeping
5. **Reasonable Batch Sizes**: Start with smaller batches (10-20) to test

## 🔧 Troubleshooting

### Extension Not Working
- Refresh the Jimeng page
- Check if extension is enabled in chrome://extensions/
- Look for errors in Console (F12)

### **Generate Button Not Found (IMPORTANT!)**

If you see error: `Could not find generate button`, follow these steps:

**Method 1: Use Built-in Debug Tools**
1. Click **🔍 Inspect Page** button in the extension panel
2. Check the debug output for available buttons and textareas
3. Open Console (F12) to see detailed logs

**Method 2: Manual Inspection**
1. Open Console (F12) on Jimeng page
2. Copy and paste content from `inspect-jimeng.js`
3. Run the script to see all page elements
4. Look for the correct selectors

**Method 3: Test Generation**
1. Click **🧪 Test Generate** button in the extension panel
2. Check Console for detailed error messages
3. The console will show which selectors were tried

**Common Issues:**
- Jimeng may have updated their HTML structure
- Button might be inside an iframe
- Button might be hidden/disabled initially
- Using React/Vue dynamic rendering

**Quick Fix:**
```javascript
// In Console, find the right textarea:
document.querySelectorAll('textarea').forEach((t, i) => {
  console.log(i, t.placeholder, t.className);
});

// Find the right button:
document.querySelectorAll('button').forEach((b, i) => {
  console.log(i, b.textContent.trim());
});
```

### Images Not Downloading
- Check if "Auto Download" is enabled
- Verify download permissions in Chrome settings
- Check Downloads folder for `jimeng-batch/` directory

### Panel Not Appearing
- Refresh the page
- Reload the extension
- Clear browser cache

### Queue Not Processing
- Ensure you clicked "Start"
- Check if prompts are added to queue
- Verify Jimeng website is fully loaded

## 📝 Changelog

### Version 1.0.0 (2025-11-09)
- Initial release
- Batch prompt processing
- Auto-download with deduplication
- Floating control panel
- Import/Export functionality
- Settings presets (Fast/Normal/Slow)
- Progress tracking
- Queue management

## 🔒 Privacy & Security

- **No Data Collection**: Extension doesn't send data anywhere
- **Local Storage Only**: All data stored locally in browser
- **No External Servers**: Works entirely client-side
- **Open Source**: Code is transparent and reviewable

## ⚠️ Disclaimer

This extension is for personal use and educational purposes. Please:
- Respect Jimeng's Terms of Service
- Don't abuse the service with excessive requests
- Use reasonable rate limits
- Monitor your usage

## 🤝 Contributing

Suggestions and improvements welcome! Consider:
- Template system for prompts
- Advanced scheduling options
- Better error handling
- More file format support
- Cloud sync features

## 📧 Support

For issues or questions:
1. Check the troubleshooting section
2. Review console logs (F12)
3. Check if Jimeng website structure changed

## 🌟 Tips for Success

1. **Start Small**: Test with 5-10 prompts first
2. **Monitor First Batch**: Watch the first batch complete
3. **Adjust Settings**: Fine-tune based on results
4. **Use Quality Prompts**: Better prompts = better results
5. **Save Templates**: Keep successful prompt patterns

## 📦 Files Structure

```
jimeng-batch-extension/
├── manifest.json          # Extension configuration
├── content.js            # Main logic (runs on Jimeng)
├── background.js         # Background service worker
├── popup.html           # Extension popup UI
├── popup.js             # Popup logic
├── panel.css            # Floating panel styles
├── icons/               # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # This file
```

## 🎨 UI Features

- **Draggable Panel**: Move panel anywhere on screen
- **Minimizable**: Collapse panel to save space
- **Responsive**: Works on different screen sizes
- **Dark Mode**: Automatic dark mode support
- **Smooth Animations**: Polished user experience
- **Toast Notifications**: Instant feedback

## 🚀 Future Features (Roadmap)

- [ ] Keyboard shortcuts
- [ ] Advanced template system with variables
- [ ] Batch scheduling (run at specific times)
- [ ] Image gallery preview
- [ ] Better error recovery
- [ ] Multiple language support
- [ ] Cloud settings sync
- [ ] Webhook notifications
- [ ] API for external integration

---

Made with ❤️ for efficient AI image generation

**Version**: 1.0.0  
**Last Updated**: November 9, 2025  
**License**: MIT (or specify your license)

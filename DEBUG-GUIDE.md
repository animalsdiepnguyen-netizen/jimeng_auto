# 🔧 Hướng Dẫn Debug - Khi Extension Không Hoạt Động

## ❌ Lỗi: "Could not find generate button"

Đây là lỗi phổ biến nhất khi Jimeng thay đổi cấu trúc HTML. Đừng lo, có nhiều cách fix!

---

## 🎯 CÁCH 1: Dùng Debug Tools Có Sẵn (Dễ nhất)

### Bước 1: Mở Debug Tools
1. Mở trang Jimeng
2. Panel extension sẽ hiện bên phải
3. Scroll xuống phần **"🔧 Debug Tools"**
4. Click nút **"🔍 Inspect Page"**

### Bước 2: Xem Kết Quả
Panel sẽ hiển thị:
- Tất cả textarea trên trang
- Tất cả button (20 cái đầu)
- Các phần tử contenteditable

### Bước 3: Kiểm Tra Console
1. Nhấn F12 để mở DevTools
2. Tab "Console"
3. Bạn sẽ thấy thông tin chi tiết về trang

### Bước 4: Test Ngay
Click nút **"🧪 Test Generate"** để test xem có hoạt động không

---

## 🔍 CÁCH 2: Tự Inspect Bằng Script (Chi Tiết Hơn)

### Bước 1: Mở Console
1. Vào trang Jimeng: https://jimeng.jianying.com/ai-tool/generate?type=image
2. Nhấn F12
3. Tab "Console"

### Bước 2: Chạy Script Inspector
1. Mở file `inspect-jimeng.js` trong thư mục extension
2. Copy toàn bộ nội dung
3. Paste vào Console
4. Nhấn Enter

### Bước 3: Phân Tích Kết Quả

Script sẽ hiển thị:

```
📝 TEXTAREAS FOUND:
1. Textarea: {
  placeholder: "描述你想要的图片",
  id: "prompt-input",
  className: "ant-input",
  visible: true,
  dimensions: "400x100"
}

🔘 BUTTONS FOUND:
1. Button: {
  text: "生成",
  className: "generate-btn primary",
  disabled: false,
  visible: true
}
```

### Bước 4: Tìm Đúng Selector

**Với Textarea:**
- Tìm textarea có `visible: true`
- Có kích thước lớn (vd: 400x100)
- Thường có placeholder về "描述" hoặc "prompt"

**Với Button:**
- Tìm button có text "生成" hoặc "Generate"
- Có `visible: true`
- `disabled: false`

---

## 🛠️ CÁCH 3: Test Thủ Công (Để Hiểu Rõ)

### Test Textarea

Trong Console, chạy từng lệnh:

```javascript
// Xem tất cả textarea
document.querySelectorAll('textarea').forEach((t, i) => {
  console.log(`${i}: ${t.placeholder}`);
});

// Test fill prompt vào textarea số 0
document.querySelectorAll('textarea')[0].value = "test prompt";

// Trigger events
let ta = document.querySelectorAll('textarea')[0];
ta.dispatchEvent(new Event('input', { bubbles: true }));
ta.dispatchEvent(new Event('change', { bubbles: true }));
```

### Test Button

```javascript
// Xem tất cả button
document.querySelectorAll('button').forEach((b, i) => {
  console.log(`${i}: ${b.textContent.trim()}`);
});

// Test click button số X (thay X bằng số button)
document.querySelectorAll('button')[5].click();
```

### Test Contenteditable

```javascript
// Nếu không có textarea, có thể dùng contenteditable
let ce = document.querySelector('[contenteditable="true"]');
if (ce) {
  ce.textContent = "test prompt";
  ce.dispatchEvent(new Event('input', { bubbles: true }));
}
```

---

## 💡 CÁC TRƯỜNG HỢP ĐẶC BIỆT

### Trường Hợp 1: Button Trong Shadow DOM
```javascript
// Tìm shadow root
let shadowHost = document.querySelector('.shadow-host');
let shadowRoot = shadowHost.shadowRoot;
let button = shadowRoot.querySelector('button');
```

### Trường Hợp 2: Button Trong Iframe
```javascript
// Tìm iframe
let iframe = document.querySelector('iframe');
let iframeDoc = iframe.contentDocument;
let button = iframeDoc.querySelector('button');
```

### Trường Hợp 3: Button Bị Disabled Ban Đầu
Đợi một chút sau khi fill prompt:
```javascript
// Đợi 2 giây
await new Promise(r => setTimeout(r, 2000));
// Rồi mới click button
```

---

## 🔧 FIX EXTENSION (Nếu Cần)

Nếu bạn tìm được đúng selector, có thể tự sửa extension:

### Bước 1: Mở File content.js
Tìm đến dòng 380-430 trong file `content.js`

### Bước 2: Sửa Selector

**Ví dụ:** Nếu textarea có id="prompt-textarea"
```javascript
// Thay:
promptInput = document.querySelector('textarea[placeholder*="描述"]');

// Bằng:
promptInput = document.querySelector('#prompt-textarea');
```

**Ví dụ:** Nếu button có class="btn-generate"
```javascript
// Thay:
generateBtn = document.querySelector('button[class*="generate"]');

// Bằng:
generateBtn = document.querySelector('.btn-generate');
```

### Bước 3: Reload Extension
1. Vào chrome://extensions/
2. Click nút refresh ↻ trên extension
3. Refresh trang Jimeng
4. Test lại

---

## 📋 CHECKLIST DEBUG

Đi qua từng bước này:

- [ ] Extension đã load? (Panel hiện trên Jimeng?)
- [ ] Console có hiện "Jimeng Batch Generator loaded"?
- [ ] Đã click "Inspect Page" và xem kết quả?
- [ ] Đã chạy script inspect-jimeng.js?
- [ ] Đã test fill textarea thủ công?
- [ ] Đã test click button thủ công?
- [ ] Textarea có visible: true?
- [ ] Button có visible: true và disabled: false?
- [ ] Có lỗi CSP (Content Security Policy)?
- [ ] Có lỗi CORS?

---

## 🆘 KHI MỌI CÁCH ĐỀU THẤT BẠI

### Ghi Lại Thông Tin

1. **Screenshot trang Jimeng**
2. **Console logs** (F12 → Console → Right click → Save as...)
3. **Kết quả inspect-jimeng.js**
4. **HTML structure** của prompt area:
   ```javascript
   let promptArea = document.querySelector('textarea') || 
                    document.querySelector('[contenteditable]');
   console.log(promptArea.outerHTML);
   ```

### Workaround Tạm Thời

**Tự động hóa thủ công:**

```javascript
// Chạy script này trong Console để generate nhiều prompt
let prompts = [
  "cute cat",
  "beautiful sunset", 
  "happy dog"
];

async function batchGenerate() {
  for (let prompt of prompts) {
    // Fill prompt
    let ta = document.querySelector('textarea'); // Thay selector nếu cần
    ta.value = prompt;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Wait
    await new Promise(r => setTimeout(r, 1000));
    
    // Click button
    let btn = document.querySelectorAll('button')[5]; // Thay index nếu cần
    btn.click();
    
    // Wait before next
    await new Promise(r => setTimeout(r, 60000)); // 60 seconds
  }
}

batchGenerate();
```

---

## 📞 BÁO CÁO VẤN ĐỀ

Nếu vẫn không được, cung cấp:

1. ✅ URL chính xác của trang Jimeng
2. ✅ Screenshot trang + panel
3. ✅ Console logs (toàn bộ)
4. ✅ Kết quả của inspect-jimeng.js
5. ✅ Chrome version: chrome://version/
6. ✅ Extension version

---

## 💪 TIPS THÀNH CÔNG

1. **Luôn mở Console** khi chạy extension để xem logs
2. **Đọc kỹ error messages** - chúng rất hữu ích!
3. **Test từng bước một** - đừng chạy batch lớn ngay
4. **Dùng Debug Tools** trước khi hỏi
5. **Jimeng có thể thay đổi** - cần update selector

---

**Nhớ rằng:** Extension này dựa trên cấu trúc HTML của Jimeng. Nếu họ cập nhật website, extension cần được update selectors. Debug tools được tích hợp sẵn để giúp bạn tự fix!

Chúc bạn thành công! 🚀

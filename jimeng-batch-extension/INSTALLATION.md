# 📥 Hướng Dẫn Cài Đặt Chi Tiết

## Yêu Cầu Hệ Thống

- **Trình duyệt**: Google Chrome hoặc Microsoft Edge (Chromium-based)
- **Hệ điều hành**: Windows, macOS, hoặc Linux
- **Phiên bản Chrome**: 88 trở lên

## Các Bước Cài Đặt

### Bước 1: Tải Extension

Bạn đã có thư mục `jimeng-batch-extension` chứa tất cả các file cần thiết.

### Bước 2: Mở Trang Extensions trong Chrome

**Cách 1**: Gõ vào thanh địa chỉ
```
chrome://extensions/
```

**Cách 2**: Menu Chrome
1. Click vào icon 3 chấm ⋮ ở góc phải trên
2. Chọn **More tools** → **Extensions**

### Bước 3: Bật Chế Độ Developer

1. Tìm toggle **Developer mode** ở góc phải trên
2. Bật nó lên (chuyển sang màu xanh)

### Bước 4: Load Extension

1. Click nút **Load unpacked** (ở góc trái trên)
2. Duyệt đến thư mục `jimeng-batch-extension`
3. Click **Select Folder**

### Bước 5: Xác Nhận Cài Đặt

Extension sẽ xuất hiện trong danh sách với:
- Tên: **Jimeng Batch Generator**
- Icon: JB màu tím
- Trạng thái: Enabled (đã bật)

### Bước 6: Pin Extension (Khuyến nghị)

1. Click icon puzzle 🧩 trên thanh công cụ Chrome
2. Tìm **Jimeng Batch Generator**
3. Click icon pin 📌 để ghim

## Kiểm Tra Cài Đặt

### Test 1: Mở Jimeng Website
1. Truy cập: https://jimeng.jianying.com/ai-tool/generate?type=image
2. Panel điều khiển màu tím sẽ xuất hiện bên phải
3. Nếu không thấy, refresh trang (F5)

### Test 2: Kiểm Tra Console
1. Nhấn F12 để mở Developer Tools
2. Tab **Console**
3. Bạn sẽ thấy: `Jimeng Batch Generator loaded`

### Test 3: Test Extension Popup
1. Click icon JB trên thanh công cụ
2. Popup sẽ hiển thị với statistics
3. Nút "Open Jimeng Website" hoạt động

## Cấu Hình Quyền

Extension cần các quyền sau:

### ✅ Quyền Tự Động Được Cấp:
- **storage**: Lưu settings và queue
- **notifications**: Hiển thị thông báo
- **activeTab**: Truy cập tab hiện tại

### ⚠️ Quyền Cần Xác Nhận:
- **downloads**: Tải ảnh tự động

**Cách cấp quyền downloads:**
1. Chrome sẽ hỏi khi cần
2. Hoặc vào: chrome://extensions/
3. Click **Details** trên extension
4. Scroll xuống **Permissions**
5. Ensure "Download files" được check

## Các Vấn Đề Thường Gặp

### ❌ Panel không xuất hiện

**Nguyên nhân**: Extension chưa load hoặc website không đúng

**Giải pháp**:
1. Kiểm tra URL có phải jimeng.jianying.com không
2. Refresh trang (Ctrl+F5 / Cmd+Shift+R)
3. Reload extension:
   - Vào chrome://extensions/
   - Click icon refresh ↻ trên extension
4. Xóa cache và cookie của Jimeng

### ❌ Không tải được ảnh

**Nguyên nhân**: Quyền downloads chưa được cấp

**Giải pháp**:
1. Kiểm tra "Auto Download" đã bật chưa
2. Cấp quyền downloads (xem phần Cấu Hình Quyền)
3. Kiểm tra Chrome Downloads settings:
   - chrome://settings/downloads
   - Ensure "Ask where to save each file" là OFF

### ❌ Extension bị disabled

**Nguyên nhân**: Chrome tự động tắt extensions không trust

**Giải pháp**:
1. Vào chrome://extensions/
2. Tìm extension
3. Toggle để bật lại
4. Nếu vẫn bị, click "Details" → "Allow in incognito" (optional)

### ❌ Console báo lỗi

**Lỗi thường gặp**:

```
Refused to execute inline script
```
**Giải pháp**: Đã được xử lý trong code, nếu vẫn gặp, clear cache

```
Cannot read property of undefined
```
**Giải pháp**: Jimeng có thể đã thay đổi HTML structure, cần update selectors

### ❌ Queue không chạy

**Kiểm tra**:
1. Đã add prompts chưa?
2. Đã click Start chưa?
3. Check Console có lỗi không (F12)
4. Jimeng website đã load xong chưa?

## Gỡ Cài Đặt

Nếu muốn gỡ extension:

1. Vào chrome://extensions/
2. Tìm **Jimeng Batch Generator**
3. Click **Remove**
4. Confirm

**Lưu ý**: Settings và downloaded hashes sẽ bị xóa!

## Cập Nhật Extension

Khi có version mới:

### Cách 1: Manual Update
1. Download files mới
2. Vào chrome://extensions/
3. Click icon refresh ↻ trên extension
4. Hoặc Remove và Load unpacked lại

### Cách 2: Auto Update (Coming soon)
- Sẽ có khi publish lên Chrome Web Store

## Backup Settings

Để backup settings của bạn:

1. Mở extension panel trên Jimeng
2. Click **Export Logs**
3. File JSON sẽ chứa:
   - Settings
   - Queue history
   - Downloaded hashes

Để restore:
- Import file JSON này khi cần

## Tips Sau Khi Cài

### 1. Thử Nghiệm Ngay
```
1. Thêm 3-5 prompts test
2. Settings để Normal mode
3. Click Start
4. Quan sát kết quả
```

### 2. Tùy Chỉnh Settings
- Nếu muốn nhanh → Fast mode
- Nếu muốn an toàn → Slow mode
- Nếu cân bằng → Normal mode ⭐

### 3. Tạo Template Prompts
Tạo file `my-prompts.txt`:
```
beautiful landscape, 4K, detailed
cute anime character, colorful
professional portrait, studio lighting
```

### 4. Kiểm Tra Downloads
Folder mặc định:
- Windows: `C:\Users\YourName\Downloads\jimeng-batch\`
- macOS: `/Users/YourName/Downloads/jimeng-batch/`
- Linux: `/home/username/Downloads/jimeng-batch/`

## Hỗ Trợ Kỹ Thuật

Nếu gặp vấn đề:

1. **Kiểm tra Console Logs**
   - F12 → Console tab
   - Copy lỗi để debug

2. **Kiểm tra Chrome Version**
   - chrome://version/
   - Cần Chrome 88+

3. **Test trên Incognito**
   - Ctrl+Shift+N (Cmd+Shift+N trên Mac)
   - Load extension trong incognito
   - Test xem có hoạt động không

## Yêu Cầu Đặc Biệt

### Cho Doanh Nghiệp
Nếu cài trong môi trường doanh nghiệp:
- Cần Admin rights có thể
- Có thể cần whitelist jimeng.jianying.com
- Chrome policies có thể block extensions

### Cho Developers
Clone và customize:
```bash
git clone <repo-url>
cd jimeng-batch-extension
# Edit files
# Load in Chrome
```

## Checklist Hoàn Thành Cài Đặt

- [ ] Chrome version 88+
- [ ] Developer mode enabled
- [ ] Extension loaded và enabled
- [ ] Icon xuất hiện trên toolbar
- [ ] Panel xuất hiện trên Jimeng website
- [ ] Test thêm 1 prompt thành công
- [ ] Downloads folder tạo OK
- [ ] Console không có lỗi
- [ ] Settings được lưu

## 🎉 Xong!

Bây giờ bạn đã sẵn sàng sử dụng Jimeng Batch Generator!

Đọc thêm trong `README.md` để biết cách sử dụng chi tiết.

---

**Cần giúp đỡ?** Kiểm tra phần Troubleshooting hoặc console logs!

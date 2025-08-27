# XHR Interceptor Extension

Extension Chrome để intercept và ghi lại tất cả XHR/Fetch requests có URL chứa `/get_pc` và `/rcmd_items`.

## Tính năng

- ✅ Override XMLHttpRequest và Fetch API
- ✅ Tự động intercept requests có URL chứa `/get_pc` và `/rcmd_items`
- ✅ Ghi lại toàn bộ thông tin request/response
- ✅ Tự động tải file JSON cho mỗi response
- ✅ Giao diện popup để quản lý dữ liệu
- ✅ Tải tất cả dữ liệu dưới dạng file JSON

## Cài đặt

1. Mở Chrome và truy cập `chrome://extensions/`
2. Bật "Developer mode" (góc phải trên)
3. Click "Load unpacked" và chọn thư mục chứa extension này
4. Extension sẽ xuất hiện trong thanh công cụ

## Cách sử dụng

1. **Cài đặt extension** như hướng dẫn trên
2. **Truy cập website** có các API endpoints `/get_pc` hoặc `/rcmd_items`
3. **Extension sẽ tự động**:
   - Intercept tất cả XHR/Fetch requests
   - Lọc các requests có URL chứa `/get_pc` hoặc `/rcmd_items`
   - Ghi lại toàn bộ thông tin request/response
   - Tự động tải file JSON cho mỗi response

4. **Quản lý dữ liệu**:
   - Click vào icon extension để mở popup
   - Xem số lượng requests đã intercept
   - Tải tất cả dữ liệu dưới dạng file JSON
   - Xóa dữ liệu đã lưu

## Cấu trúc dữ liệu được ghi

Mỗi response sẽ được ghi với cấu trúc:

```json
{
  "url": "https://example.com/api/get_pc",
  "method": "GET",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer token"
  },
  "body": null,
  "response": {
    // Response data (JSON hoặc text)
  },
  "responseHeaders": {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache"
  },
  "status": 200,
  "statusText": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Debug

- Mở Developer Tools (F12)
- Xem Console để theo dõi logs của extension
- Sử dụng `window.xhrInterceptor.getInterceptedRequests()` trong console để xem dữ liệu đã intercept

## Files

- `manifest.json` - Cấu hình extension
- `content.js` - Script chính để override XHR/Fetch
- `background.js` - Background script để xử lý file download
- `popup.html` - Giao diện popup
- `popup.js` - Logic cho popup

## Lưu ý

- Extension chỉ hoạt động trên các trang web có protocol HTTP/HTTPS
- Dữ liệu được lưu tự động vào thư mục Downloads
- Có thể xem logs chi tiết trong Developer Tools Console # xhr-shopee

// ============================================================
// CẤU HÌNH BUILD — CHỈ SỬA FILE NÀY KHI ĐỔI DEV/RELEASE
// ------------------------------------------------------------
// DEV     : DEBUG_BUILD = true,  DEVTOOLS = true
// RELEASE : DEBUG_BUILD = false, DEVTOOLS = false
// ============================================================

module.exports = {
  // Cho phép hiện lỗi chi tiết (debug)
  DEBUG_BUILD: false,

  // Cho phép mở DevTools + phím tắt F12, Ctrl+Shift+I, chuột phải Inspect
  DEVTOOLS: false,

  // Thông tin app
  APP_NAME: 'METTC',
  APP_VERSION: '1.0.0',
  APP_TAGLINE: 'Mapping Encryption Text To Confused'
};
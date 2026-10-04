Đã xem qua repo của bạn. Dưới đây là README hoàn chỉnh, thay thế toàn bộ emoji bằng các ký hiệu Unicode chuyên nghiệp (⬢, ▸, ◈, ◆, ○, ●, ★, ✦, ❖, ⟡, ⌘, ⏣, v.v.).

---

```markdown
# ⬢ METTC — Mapping Encryption Text To Confused

> **Biến văn bản thành mật mã. Đơn giản, mạnh mẽ, miễn phí.**

Ứng dụng mã hóa văn bản thành ký hiệu đặc biệt sử dụng **AES-256-GCM** — chuẩn mã hóa công nghiệp được dùng bởi chính phủ, ngân hàng và các dịch vụ bảo mật hàng đầu thế giới.

[![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)](https://github.com/tonvanlam15052005-byte/METTC_Encryptor/releases)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11-lightgrey?style=flat-square)](#-yêu-cầu-hệ-thống)
[![Electron](https://img.shields.io/badge/electron-31-47848F?style=flat-square&logo=electron)](https://www.electronjs.org/)

---

## ▸ Giới thiệu

**METTC** (Mapping Encryption Text To Confused) là một ứng dụng desktop mã hóa văn bản thành các ký hiệu "rối" không thể đọc được, và ngược lại. Khác với các công cụ base64 hay rot13 đơn giản, METTC sử dụng **mã hóa đối xứng chuẩn NIST** với nhiều lớp bảo vệ chống tấn công.

Dự án được phát triển với mục tiêu:

- ○ **Giáo dục** — giúp người Việt tiếp cận với mã hóa hiện đại
- ○ **Miễn phí** — mã nguồn mở, không quảng cáo, không theo dõi
- ○ **Bảo mật** — dùng chuẩn công nghiệp, không tự chế crypto
- ○ **Cống hiến** — tài nguyên mở cho cộng đồng

---

## ▸ Tính năng

### ◈ Mã hóa & Giải mã

- **AES-256-GCM** — mã hóa đối xứng 256-bit với xác thực toàn vẹn
- **PBKDF2-SHA256** — 200.000 vòng lặp, chống brute-force
- **Salt ngẫu nhiên** — 16 byte cho mỗi phiên mã hóa
- **IV ngẫu nhiên** — 12 byte, không tái sử dụng
- **AAD (Additional Authenticated Data)** — bảo vệ metadata khỏi bị giả mạo

### ◈ 2 chế độ key

| Chế độ | Đặc điểm | Dùng khi nào |
|--------|----------|--------------|
| **Raw** | Deterministic — cùng input + key → cùng output | Cần kết quả ổn định, lặp lại |
| **Derived** | Salt + IV ngẫu nhiên — mỗi lần khác nhau | Cần bảo mật cao nhất |

### ◈ 2 bảng ký tự output

- **Unicode lạ** — `꧁༒ᚠᚢᛉᛟᛒᛏᚨᛗᛃ...` — nhìn đẹp, khó đoán
- **ASCII đặc biệt** — `!@#$%^&*()_+...` — dễ copy-paste, không bị lỗi font

### ◈ Strict Mode

Chế độ nghiêm ngặt — bản mã **không được phép thừa hoặc thiếu dù chỉ 1 byte**. Nếu dữ liệu bị sửa đổi dù chỉ 1 ký tự, quá trình giải mã sẽ thất bại ngay lập tức.

### ◈ Padding linh hoạt

Tùy chỉnh số ký tự output theo ý muốn (miễn ≥ độ dài gốc). Ví dụ: nhập `hi` (2 ký tự) nhưng muốn output 200 ký tự → app sẽ nhồi dữ liệu nhiễu để đạt đúng 200.

### ◈ Chống tấn công side-channel

- **Error Uniformity** — mọi lỗi giải mã đều trả về **cùng 1 thông báo** → không rò rỉ thông tin
- **Timing Padding** — mọi nhánh lỗi đều tốn thời gian tương đương (180ms + jitter ngẫu nhiên) → chống timing attack
- **DevTools Blocked** — không cho mở DevTools, F12, Ctrl+Shift+I, chuột phải Inspect ở bản release

---

## ▸ Ảnh chụp màn hình

> *Sẽ cập nhật sau*

---

## ▸ Cài đặt

### ◈ Cách 1 — Tải file `.exe` (khuyên dùng)

1. Vào tab [**Releases**](https://github.com/tonvanlam15052005-byte/METTC_Encryptor/releases)
2. Tải file `METTC_v1.0.0.exe` (Windows 10/11 x64)
3. Nhấp đúp để chạy — **không cần cài thêm gì**

> ❖ **Lưu ý:** Lần đầu chạy, Windows SmartScreen có thể cảnh báo "Unknown publisher" (vì file chưa mua chữ ký số). Nhấn **More info** → **Run anyway** để tiếp tục.

### ◈ Cách 2 — Build từ source

**Yêu cầu:**
- [Node.js](https://nodejs.org) ≥ 18
- [Git](https://git-scm.com/download/win)

```bash
# 1. Clone repo
git clone https://github.com/tonvanlam15052005-byte/METTC_Encryptor.git
cd METTC_Encryptor

# 2. Cài dependencies
npm install

# 3. Chạy dev
npm start

# 4. Build file .exe
npm run build
```

File `.exe` sẽ nằm trong `dist/`.

---

## ▸ Hướng dẫn sử dụng

### ◈ Mã hóa

1. Nhập văn bản cần mã hóa vào ô **Văn bản gốc**
2. Nhập key (hoặc bỏ trống để tự sinh key 64 ký tự hex)
3. Chọn:
   - **Chế độ key:** Raw hoặc Derived
   - **Bảng ký tự:** Unicode hoặc ASCII
   - **Strict mode:** Bật/tắt
   - **Số ký tự output:** 0 = không pad
4. Bấm **Mã hóa** (biểu tượng khóa)
5. **Copy kết quả + lưu key lại** — mất key = mất dữ liệu!

### ◈ Giải mã

1. Dán ký hiệu đã mã hóa vào ô **Văn bản gốc**
2. Nhập **đúng key** đã dùng khi mã hóa
3. Chọn **đúng bảng ký tự** đã dùng
4. Bấm **Giải mã**

---

## ▸ Chi tiết bảo mật

### ◈ Kiến trúc

```
[Văn bản gốc]
      ↓
[UTF-8 encode]
      ↓
[AES-256-GCM encrypt với key + IV + AAD]
      ↓
[Ciphertext + 16-byte auth tag]
      ↓
[Header + Blob + Padding]
      ↓
[Encode sang Unicode/ASCII]
      ↓
[Kết quả: chuỗi ký hiệu bất quy tắc]
```

### ◈ Format payload

```
[HEADER 7 byte — dùng làm AAD]
  ├── MAGIC      2 byte  = "CA" (0x43 0x41)
  ├── FLAGS      1 byte  = bit0 strict | bit1 derived
  └── blobLen    4 byte  = độ dài blob (big-endian)

[BLOB]
  ├── mode       1 byte  = 0x00 raw | 0x01 derived
  ├── salt      16 byte  (chỉ có ở derived mode)
  ├── iv        12 byte
  └── ciphertext + tag

[PADDING — nếu có]
  └── ký tự random để đạt targetLen
```

### ◈ Thông số kỹ thuật

| Thành phần | Giá trị |
|-----------|---------|
| Thuật toán mã hóa | AES-256-GCM |
| Key derivation | PBKDF2-SHA256 |
| Số vòng PBKDF2 | 200.000 |
| Salt length | 16 byte (128 bit) |
| IV length | 12 byte (96 bit) |
| Auth tag length | 16 byte (128 bit) |
| Raw mode IV | SHA-256(key + text) → 12 byte đầu |
| Raw mode key | SHA-256("RAW_KEY:" + key) |

### ◈ Những gì METTC **KHÔNG** làm

- ✗ Không gửi dữ liệu lên server — mọi thứ xử lý **offline tại máy bạn**
- ✗ Không lưu key — bạn phải tự lưu
- ✗ Không có backdoor — mã nguồn mở, ai cũng kiểm tra được
- ✗ Không thu thập telemetry — không gửi bất kỳ thông tin gì đi đâu

### ◈ Giới hạn

- ◆ **Mã hóa đối xứng** — cùng 1 key để mã hóa + giải mã → phải chia sẻ key qua kênh an toàn
- ◆ **Không có forward secrecy** — key bị lộ → mọi ciphertext cũ đều giải được
- ◆ **Không có chữ ký số** — không xác thực được **ai** gửi, chỉ xác thực **dữ liệu nguyên vẹn**
- ◆ **Raw mode kém an toàn hơn Derived** — vì không có salt, dễ bị rainbow table hơn

> ⟡ **Lưu ý:** Với mục đích cá nhân và chia sẻ bạn bè, METTC **thừa sức**. Với mục đích quân sự / ngân hàng, cần thêm nhiều lớp bảo vệ khác (ECDH, forward secrecy, chữ ký số...).

---

## ▸ Công nghệ sử dụng

- **[Electron 31](https://www.electronjs.org/)** — framework desktop đa nền tảng
- **[Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)** — crypto chuẩn trình duyệt
- **[electron-builder](https://www.electron.build/)** — đóng gói `.exe`
- **HTML / CSS / JavaScript thuần** — không framework, không dependencies thừa

---

## ▸ Cấu trúc dự án

```
METTC_Encryptor/
├── package.json           # Cấu hình npm + electron-builder
├── config.js              # Cấu hình build (dev/release)
├── main.js                # Entry point Electron
├── preload.js             # Cầu nối an toàn main ↔ renderer
├── LICENSE                # Giấy phép MIT
├── README.md              # File này
├── .gitignore             # File Git bỏ qua
├── build/
│   └── icon.ico           # Icon cho file .exe
└── src/
    ├── index.html         # Giao diện
    ├── style.css          # Style
    ├── cipher.js          # Lõi mã hóa AES-256-GCM
    └── renderer.js        # Xử lý UI
```

---

## ▸ Kiểm thử

### ◈ Test mã hóa cơ bản

| Input | Key | Kỳ vọng |
|-------|-----|---------|
| `chào bạn` | `hello` | Ra chuỗi ký hiệu bất quy tắc |
| `chào bạn` | `hello` (Raw mode, lần 2) | Ra **cùng** kết quả |
| `chào bạn` | `hello` (Derived mode, lần 2) | Ra **khác** kết quả |

### ◈ Test bảo mật

| Hành động | Kỳ vọng |
|-----------|---------|
| Giải mã với key sai | ✗ Cùng 1 thông báo lỗi chung |
| Giải mã với dư 1 ký tự (Strict ON) | ✗ Cùng 1 thông báo lỗi chung |
| Giải mã với thiếu 1 ký tự (Strict ON) | ✗ Cùng 1 thông báo lỗi chung |
| Đo thời gian giải mã (đúng/sai) | ~180–260ms, không phân biệt được |
| Nhấn F12 | Không có gì xảy ra |
| Nhấn Ctrl+Shift+I | Không có gì xảy ra |
| Chuột phải trong app | Không có menu Inspect |

---

## ▸ Đóng góp

Mọi đóng góp đều được hoan nghênh! Bạn có thể:

- ○ **Báo lỗi** — mở [Issue](https://github.com/tonvanlam15052005-byte/METTC_Encryptor/issues) mô tả chi tiết
- ○ **Đề xuất tính năng** — mở [Issue](https://github.com/tonvanlam15052005-byte/METTC_Encryptor/issues) với tag `enhancement`
- ○ **Gửi code** — Fork repo → tạo branch → Pull Request
- ○ **Cải thiện tài liệu** — sửa README, thêm hướng dẫn
- ○ **Star repo** — nếu bạn thấy hữu ích

### ◈ Quy trình Pull Request

```bash
# 1. Fork repo trên GitHub

# 2. Clone fork về máy
git clone https://github.com/YOUR_USERNAME/METTC_Encryptor.git

# 3. Tạo branch mới
git checkout -b feature/ten-tinh-nang

# 4. Sửa code + commit
git add .
git commit -m "Add: mô tả ngắn"

# 5. Push lên fork
git push origin feature/ten-tinh-nang

# 6. Mở Pull Request trên GitHub
```

---

## ▸ Câu hỏi thường gặp (FAQ)

<details>
<summary><b>Quên key thì có lấy lại được không?</b></summary>

**Không.** METTC không lưu key ở đâu cả. Mất key = mất dữ liệu vĩnh viễn. Đây là đặc điểm của mã hóa đối xứng — không có cơ chế "quên mật khẩu".

</details>

<details>
<summary><b>Tại sao file .exe bị Windows SmartScreen cảnh báo?</b></summary>

Vì file chưa được ký số (code signing certificate). Để ký số cần mua cert (~$100–400/năm). Đây là **false positive** — app không có virus.

**Cách xử lý:** Nhấn **More info** → **Run anyway**.

</details>

<details>
<summary><b>Có bản cho Mac/Linux không?</b></summary>

Hiện tại chỉ có bản Windows. Nếu bạn muốn, có thể tự build từ source — Electron hỗ trợ đa nền tảng.

</details>

<details>
<summary><b>METTC có an toàn không?</b></summary>

**Về thuật toán:** Có. AES-256-GCM là chuẩn công nghiệp, chưa từng bị phá vỡ.

**Về triển khai:** Mã nguồn mở, ai cũng kiểm tra được. Không có backdoor.

**Về mô hình bảo mật:** Mã hóa đối xứng — phụ thuộc vào việc bạn giữ key an toàn.

**Khuyến nghị:** Đừng dùng cho mục đích quân sự / y tế. Với mục đích cá nhân, METTC thừa sức.

</details>

<details>
<summary><b>Có phải virus không?</b></summary>

**Không.** Mã nguồn mở 100%, bạn có thể đọc từng dòng code. App không gửi dữ liệu đi đâu, không kết nối internet, không sửa registry.

</details>

---

## ▸ Giấy phép

Dự án này được phát hành dưới giấy phép [MIT License](LICENSE).

**Tóm tắt:** Bạn được tự do:
- ○ Sử dụng cho mục đích cá nhân, thương mại
- ○ Sửa đổi mã nguồn
- ○ Phân phối lại
- ○ Đóng gói vào sản phẩm khác

**Với điều kiện:** Giữ nguyên bản quyền và giấy phép gốc.

---

## ▸ Ghi nhận

- **AES-256-GCM** — [NIST FIPS 197](https://csrc.nist.gov/publications/detail/fips/197/final)
- **PBKDF2** — [RFC 2898](https://tools.ietf.org/html/rfc2898)
- **Web Crypto API** — [W3C Specification](https://www.w3.org/TR/WebCryptoAPI/)
- **Electron** — [electronjs.org](https://www.electronjs.org/)

---

## ▸ Liên hệ

- **GitHub Issues:** [Mở issue mới](https://github.com/tonvanlam15052005-byte/METTC_Encryptor/issues)
- **Email:** *(cập nhật sau)*

---

<div align="center">

**⬢ METTC — Text in. Confusion out.**

Made with ❤ for the community.

★ Nếu bạn thấy hữu ích, hãy **star** repo này!

</div>
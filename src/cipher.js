// ============================================================
// CIPHER CORE v3 — AES-256-GCM + AAD + Strict + Anti side-channel
// Format: [HEADER 7B][BLOB][PADDING tùy chọn]
// HEADER = MAGIC(2) + FLAGS(1) + blobLen(4) — dùng làm AAD
// FLAGS  = bit0 strict | bit1 derived
// ============================================================

// === BUILD FLAG (đồng bộ với config.js) ===
// Renderer sẽ ghi đè giá trị này từ APP_CONFIG.DEBUG_BUILD
let DEBUG_BUILD = false;

const MAGIC_0 = 0x43;
const MAGIC_1 = 0x41;
const HEADER_LEN = 7;

// ---------- Bảng ký tự ----------
function buildUnicodeCharset() {
  const ranges = [
    [0x0391, 0x03A9], [0x03B1, 0x03C9],
    [0x0410, 0x044F],
    [0x0531, 0x0556], [0x0561, 0x0586],
    [0x05D0, 0x05EA],
    [0x0621, 0x064A],
    [0x0905, 0x0939],
    [0x0E01, 0x0E2E],
    [0x10D0, 0x10FA]
  ];
  const seen = new Set();
  const out = [];
  for (const [a, b] of ranges) {
    for (let c = a; c <= b; c++) {
      const ch = String.fromCodePoint(c);
      if (!seen.has(ch)) {
        seen.add(ch);
        out.push(ch);
        if (out.length === 256) return out;
      }
    }
  }
  throw new Error('Không đủ 256 ký tự Unicode');
}
const UNICODE_CHARSET = buildUnicodeCharset();
const ASCII_ALPHABET =
  '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_~';

function bytesToUnicode(bytes) {
  let out = '';
  for (let i = 0; i < bytes.length; i++) out += UNICODE_CHARSET[bytes[i]];
  return out;
}
const UNICODE_REV = new Map();
for (let i = 0; i < 256; i++) UNICODE_REV.set(UNICODE_CHARSET[i], i);
function unicodeToBytes(str) {
  const out = [];
  for (const ch of str) if (UNICODE_REV.has(ch)) out.push(UNICODE_REV.get(ch));
  return new Uint8Array(out);
}

function bytesToAscii(bytes) {
  let out = '';
  let i = 0;
  while (i < bytes.length) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : null;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : null;
    out += ASCII_ALPHABET[b0 >> 2];
    out += ASCII_ALPHABET[((b0 & 0x03) << 4) | ((b1 ?? 0) >> 4)];
    if (b1 !== null) out += ASCII_ALPHABET[((b1 & 0x0F) << 2) | ((b2 ?? 0) >> 6)];
    if (b2 !== null) out += ASCII_ALPHABET[b2 & 0x3F];
    i += 3;
  }
  return out;
}
const ASCII_REV = new Map();
for (let i = 0; i < 64; i++) ASCII_REV.set(ASCII_ALPHABET[i], i);
function asciiToBytes(str) {
  const vals = [];
  for (const ch of str) if (ASCII_REV.has(ch)) vals.push(ASCII_REV.get(ch));
  const out = [];
  for (let i = 0; i < vals.length; i += 4) {
    const v0 = vals[i], v1 = vals[i + 1], v2 = vals[i + 2], v3 = vals[i + 3];
    if (v0 !== undefined && v1 !== undefined) out.push((v0 << 2) | (v1 >> 4));
    if (v1 !== undefined && v2 !== undefined) out.push(((v1 & 0x0F) << 4) | (v2 >> 2));
    if (v2 !== undefined && v3 !== undefined) out.push(((v2 & 0x03) << 6) | v3);
  }
  return new Uint8Array(out);
}

function encodedCharLen(byteLen, charsetName) {
  if (charsetName === 'unicode') return byteLen;
  const rem = byteLen % 3;
  const base = Math.floor(byteLen / 3) * 4;
  return base + (rem === 0 ? 0 : rem === 1 ? 2 : 3);
}

// ---------- Crypto helpers ----------
async function sha256Bytes(data) {
  const buf = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  return new Uint8Array(await crypto.subtle.digest('SHA-256', buf));
}
async function pbkdf2Key(password, salt, iterations) {
  const km = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
  );
  return new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, km, 256
  ));
}
async function aesGcmEncrypt(keyBytes, ivBytes, plaintext, aad) {
  const key = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt']
  );
  const params = { name: 'AES-GCM', iv: ivBytes };
  if (aad) params.additionalData = aad;
  return new Uint8Array(await crypto.subtle.encrypt(params, key, plaintext));
}
async function aesGcmDecrypt(keyBytes, ivBytes, ctBytes, aad) {
  const key = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt']
  );
  const params = { name: 'AES-GCM', iv: ivBytes };
  if (aad) params.additionalData = aad;
  return new Uint8Array(await crypto.subtle.decrypt(params, key, ctBytes));
}

function randomKey() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ---------- MÃ HÓA ----------
async function encrypt({ text, key, mode, charsetName, targetLen, strict }) {
  if (!text) throw new Error('Chưa nhập văn bản');
  if (!key) throw new Error('Chưa có key');

  targetLen = parseInt(targetLen) || 0;
  strict = !!strict;

  if (strict && targetLen > 0) {
    throw new Error('Strict mode không cho phép padding. Đặt "Số ký tự output" = 0.');
  }

  const textBytes = new TextEncoder().encode(text);
  const isDerived = mode === 'derived';
  const saltLen = isDerived ? 16 : 0;

  const ctLen = textBytes.length + 16;
  const blobLen = 1 + saltLen + 12 + ctLen;
  const byteLen = HEADER_LEN + blobLen;
  const charLen = encodedCharLen(byteLen, charsetName);

  let flags = 0;
  if (strict) flags |= 0x01;
  if (isDerived) flags |= 0x02;

  const header = new Uint8Array(HEADER_LEN);
  header[0] = MAGIC_0;
  header[1] = MAGIC_1;
  header[2] = flags;
  header[3] = (blobLen >>> 24) & 0xff;
  header[4] = (blobLen >>> 16) & 0xff;
  header[5] = (blobLen >>> 8) & 0xff;
  header[6] = blobLen & 0xff;

  let aesKey, ivBytes, salt;
  if (isDerived) {
    salt = new Uint8Array(16);
    crypto.getRandomValues(salt);
    aesKey = await pbkdf2Key(key, salt, 200000);
    ivBytes = new Uint8Array(12);
    crypto.getRandomValues(ivBytes);
  } else {
    salt = new Uint8Array(0);
    aesKey = await sha256Bytes('RAW_KEY:' + key);
    const ivHash = await sha256Bytes('RAW_IV:' + key + '\x00' + text);
    ivBytes = ivHash.slice(0, 12);
  }

  const ct = await aesGcmEncrypt(aesKey, ivBytes, textBytes, header);

  const blob = new Uint8Array(1 + saltLen + 12 + ct.length);
  blob[0] = isDerived ? 0x01 : 0x00;
  if (isDerived) blob.set(salt, 1);
  blob.set(ivBytes, 1 + saltLen);
  blob.set(ct, 1 + saltLen + 12);

  const full = new Uint8Array(HEADER_LEN + blob.length);
  full.set(header, 0);
  full.set(blob, HEADER_LEN);

  let encoded = charsetName === 'unicode'
    ? bytesToUnicode(full)
    : bytesToAscii(full);

  if (encoded.length !== charLen) {
    throw new Error(`Lỗi nội bộ: charLen mismatch (${encoded.length} vs ${charLen})`);
  }

  if (targetLen > 0) {
    if (targetLen < encoded.length) {
      throw new Error(
        `Không thể nén xuống ${targetLen} ký tự. Tối thiểu: ${encoded.length} ký tự.`
      );
    }
    const charset = charsetName === 'unicode' ? UNICODE_CHARSET : ASCII_ALPHABET;
    while (encoded.length < targetLen) {
      const r = new Uint8Array(1);
      crypto.getRandomValues(r);
      encoded += charset[r[0] % charset.length];
    }
  }

  return encoded;
}

// ---------- GIẢI MÃ (chống side-channel) ----------
const GENERIC_DECRYPT_ERROR =
  'Không thể giải mã. Kiểm tra lại key, bảng ký tự và dữ liệu đầu vào.';

const MIN_DECRYPT_TIME = 180;

async function _decryptInternal({ text, key, charsetName }) {
  const trimmed = text.trim();
  const charsIn = trimmed.length;

  const bytes = charsetName === 'unicode'
    ? unicodeToBytes(trimmed)
    : asciiToBytes(trimmed);

  if (bytes.length < HEADER_LEN) throw new Error('_internal: dữ liệu quá ngắn');
  if (bytes[0] !== MAGIC_0 || bytes[1] !== MAGIC_1) throw new Error('_internal: sai magic');

  const flags = bytes[2];
  const strict = (flags & 0x01) !== 0;
  const isDerived = (flags & 0x02) !== 0;

  const blobLen = (
    (bytes[3] << 24) | (bytes[4] << 16) | (bytes[5] << 8) | bytes[6]
  ) >>> 0;

  if (blobLen < 33) throw new Error('_internal: blobLen không hợp lệ');
  if (HEADER_LEN + blobLen > bytes.length) throw new Error('_internal: bị cắt ngắn');

  const expectedCharLen = encodedCharLen(HEADER_LEN + blobLen, charsetName);
  if (strict) {
    if (charsIn !== expectedCharLen) throw new Error('_internal: strict length mismatch');
  } else {
    if (charsIn < expectedCharLen) throw new Error('_internal: length too short');
  }

  const header = bytes.slice(0, HEADER_LEN);
  const blob = bytes.slice(HEADER_LEN, HEADER_LEN + blobLen);

  const modeByte = blob[0];
  if (modeByte !== 0x00 && modeByte !== 0x01) throw new Error('_internal: mode invalid');
  if ((modeByte === 0x01) !== isDerived) throw new Error('_internal: mode/flags mismatch');

  const saltLen = modeByte === 0x01 ? 16 : 0;
  const salt = blob.slice(1, 1 + saltLen);
  const ivBytes = blob.slice(1 + saltLen, 1 + saltLen + 12);
  const ct = blob.slice(1 + saltLen + 12);

  let aesKey;
  if (isDerived) aesKey = await pbkdf2Key(key, salt, 200000);
  else aesKey = await sha256Bytes('RAW_KEY:' + key);

  let plaintext;
  try {
    plaintext = await aesGcmDecrypt(aesKey, ivBytes, ct, header);
  } catch (e) {
    throw new Error('_internal: GCM auth fail');
  }
  return new TextDecoder().decode(plaintext);
}

async function decrypt({ text, key, charsetName, debug }) {
  if (!text) throw new Error('Chưa dán ký hiệu');
  if (!key) throw new Error('Chưa nhập key');

  const start = performance.now();
  let result = null;
  let internalError = null;

  try {
    result = await _decryptInternal({ text, key, charsetName });
  } catch (e) {
    internalError = e;
  }

  // Chống timing attack
  const elapsed = performance.now() - start;
  const jitter = Math.random() * 80;
  const target = MIN_DECRYPT_TIME + jitter;
  if (elapsed < target) await new Promise(r => setTimeout(r, target - elapsed));

  if (internalError) {
    if (DEBUG_BUILD) {
      // Chỉ log khi dev
      console.warn('[decrypt]', internalError.message);
      if (debug) throw new Error('❌ [DEBUG] ' + internalError.message);
    }
    throw new Error('❌ ' + GENERIC_DECRYPT_ERROR);
  }
  return result;
}

// ---------- Expose ----------
window.CipherCore = {
  encrypt,
  decrypt,
  randomKey,
  setDebugBuild: (v) => { DEBUG_BUILD = !!v; }
};
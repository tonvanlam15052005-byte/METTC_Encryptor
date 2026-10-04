const $ = id => document.getElementById(id);

// Nhận config từ preload
const APP_CONFIG = window.APP_CONFIG || { DEBUG_BUILD: false, APP_NAME: 'Cipher App' };

// Đồng bộ DEBUG_BUILD vào cipher core
if (window.CipherCore && window.CipherCore.setDebugBuild) {
  window.CipherCore.setDebugBuild(APP_CONFIG.DEBUG_BUILD);
}

// Ẩn checkbox debug nếu không phải DEBUG_BUILD
if (!APP_CONFIG.DEBUG_BUILD) {
  const row = $('debugRow');
  if (row) row.style.display = 'none';
} else {
  const row = $('debugRow');
  if (row) row.style.display = 'flex';
}

const els = {
  input: $('input'),
  key: $('key'),
  keyMode: $('keyMode'),
  charset: $('charset'),
  targetLen: $('targetLen'),
  strictMode: $('strictMode'),
  debugMode: $('debugMode'),
  output: $('output'),
  usedKey: $('usedKey'),
  status: $('status')
};

function setStatus(msg, type = '') {
  els.status.textContent = msg;
  els.status.className = 'status ' + type;
}

els.strictMode.addEventListener('change', () => {
  const on = els.strictMode.checked;
  els.targetLen.disabled = on;
  if (on) els.targetLen.value = '0';
});

$('btnEncrypt').addEventListener('click', async () => {
  try {
    let key = els.key.value.trim();
    if (!key) {
      key = CipherCore.randomKey();
      els.key.value = key;
      setStatus('Đã tự sinh key (64 ký tự hex).', 'ok');
    }

    const output = await CipherCore.encrypt({
      text: els.input.value,
      key,
      mode: els.keyMode.value,
      charsetName: els.charset.value,
      targetLen: els.targetLen.value,
      strict: els.strictMode.checked
    });

    els.output.value = output;
    els.usedKey.value = key;
    const modeLabel = els.strictMode.checked ? 'STRICT' : 'NORMAL';
    setStatus(`✅ Mã hóa xong [${modeLabel}] — ${output.length} ký tự output.`, 'ok');
  } catch (e) {
    setStatus('❌ ' + e.message, 'err');
  }
});

$('btnDecrypt').addEventListener('click', async () => {
  try {
    const debug = APP_CONFIG.DEBUG_BUILD && els.debugMode && els.debugMode.checked;
    const plain = await CipherCore.decrypt({
      text: els.input.value,
      key: els.key.value.trim(),
      charsetName: els.charset.value,
      debug
    });
    els.output.value = plain;
    setStatus('✅ Giải mã thành công.', 'ok');
  } catch (e) {
    setStatus(e.message, 'err');
  }
});

$('btnGenKey').addEventListener('click', () => {
  els.key.value = CipherCore.randomKey();
  setStatus('🎲 Đã sinh key mới (64 ký tự hex).', 'ok');
});

$('btnClear').addEventListener('click', () => {
  els.input.value = '';
  els.output.value = '';
  els.usedKey.value = '';
  setStatus('Đã xóa.');
});
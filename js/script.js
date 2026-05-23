// =============================================
// GREETING, CLOCK & CUSTOM NAME
// =============================================

const greetingEl  = document.getElementById('greeting');
const clockEl     = document.getElementById('clock');
const dateEl      = document.getElementById('date');
const nameInput   = document.getElementById('nameInput');
const nameSaveBtn = document.getElementById('nameSaveBtn');

const DAYS   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni',
                'Juli','Agustus','September','Oktober','November','Desember'];

function loadSavedName() {
  const saved = localStorage.getItem('userName');
  if (saved && nameInput) nameInput.value = saved;
}

function getGreetWord(hour) {
  if (hour >= 5  && hour < 12) return 'Selamat Pagi ☀️';
  if (hour >= 12 && hour < 15) return 'Selamat Siang 🌤';
  if (hour >= 15 && hour < 19) return 'Selamat Sore 🌇';
  return 'Selamat Malam 🌙';
}

function updateClock() {
  const now  = new Date();
  const hour = now.getHours();

  const hh = String(hour).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  clockEl.textContent = `${hh}:${mm}:${ss}`;

  dateEl.textContent =
    `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

  const userName = localStorage.getItem('userName');
  const namePart = userName ? `, ${userName}` : '';
  greetingEl.textContent = getGreetWord(hour) + namePart;
}

nameSaveBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (name) {
    localStorage.setItem('userName', name);
  } else {
    localStorage.removeItem('userName');
  }
  updateClock();
  nameInput.blur();
});

nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') nameSaveBtn.click();
});

loadSavedName();
setInterval(updateClock, 1000);
updateClock();


// =============================================
// FOCUS TIMER
// =============================================

const timerDisplay = document.getElementById('timerDisplay');
const startBtn     = document.getElementById('startBtn');
const stopBtn      = document.getElementById('stopBtn');
const resetBtn     = document.getElementById('resetBtn');
const timerStatus  = document.getElementById('timerStatus');

const TIMER_DURATION = 25 * 60;
let timerSeconds  = TIMER_DURATION;
let timerInterval = null;
let timerRunning  = false;

function formatTimer(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function setTimerStatus(text, type = '') {
  if (!timerStatus) return;
  timerStatus.textContent = text;
  timerStatus.className   = 'timer-status' + (type ? ` timer-status--${type}` : '');
}

startBtn.addEventListener('click', () => {
  if (timerRunning || timerSeconds <= 0) return;
  timerRunning = true;
  setTimerStatus('Fokus sedang berjalan...', 'running');

  timerInterval = setInterval(() => {
    timerSeconds--;
    timerDisplay.textContent = formatTimer(timerSeconds);
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerDisplay.textContent = '00:00';
      setTimerStatus('Sesi selesai! Istirahat dulu. 🎉', 'done');
    }
  }, 1000);
});

stopBtn.addEventListener('click', () => {
  if (!timerRunning) return;
  clearInterval(timerInterval);
  timerRunning = false;
  setTimerStatus('Timer dijeda.', 'paused');
});

resetBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerRunning = false;
  timerSeconds = TIMER_DURATION;
  timerDisplay.textContent = formatTimer(timerSeconds);
  setTimerStatus('');
});

timerDisplay.textContent = formatTimer(timerSeconds);


// =============================================
// TO-DO LIST
// =============================================

const todoForm    = document.getElementById('todoForm');
const todoInput   = document.getElementById('todoInput');
const todoList    = document.getElementById('todoList');
const todoCounter = document.getElementById('todoCounter'); // opsional

let todos = JSON.parse(localStorage.getItem('todos') || '[]');

/** Simpan array todos ke localStorage */
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

/**
 * Cek duplikat (case-insensitive, trim).
 * @param {string} text  - teks yang akan dicek
 * @param {number} skipIndex - index yang dikecualikan (untuk mode edit)
 * @returns {boolean}
 */
function isDuplicate(text, skipIndex = -1) {
  const normalized = text.trim().toLowerCase();
  return todos.some((t, i) => i !== skipIndex && t.text.toLowerCase() === normalized);
}

/** Tampilkan pesan inline di bawah input (lebih halus dari alert) */
function showTodoWarning(msg) {
  let warn = document.getElementById('todoWarning');
  if (!warn) {
    warn = document.createElement('p');
    warn.id        = 'todoWarning';
    warn.className = 'input-warning';
    todoForm.appendChild(warn);
  }
  warn.textContent = msg;
  warn.style.display = 'block';
  clearTimeout(warn._timer);
  warn._timer = setTimeout(() => { warn.style.display = 'none'; }, 3000);
}

/** Aktifkan mode edit inline pada item todo */
function activateEditMode(li, index) {
  // Hindari double-edit
  if (li.querySelector('.edit-input')) return;

  const span    = li.querySelector('.todo-text');
  const editBtn = li.querySelector('.btn-edit');
  const oldText = todos[index].text;

  // Ganti span dengan input
  const editInput = document.createElement('input');
  editInput.type      = 'text';
  editInput.value     = oldText;
  editInput.className = 'edit-input';
  span.replaceWith(editInput);
  editInput.focus();
  editInput.select();

  // Ganti tombol Edit → Simpan
  editBtn.textContent = '💾';
  editBtn.title       = 'Simpan perubahan';

  /** Simpan hasil edit */
  function saveEdit() {
    const newText = editInput.value.trim();

    if (!newText) {
      showTodoWarning('Nama tugas tidak boleh kosong.');
      editInput.focus();
      return;
    }

    if (newText.toLowerCase() !== oldText.toLowerCase() && isDuplicate(newText, index)) {
      showTodoWarning(`⚠️ Tugas "${newText}" sudah ada dalam daftar.`);
      editInput.focus();
      return;
    }

    todos[index].text = newText;
    saveTodos();
    renderTodos();
  }

  editBtn.addEventListener('click', saveEdit, { once: true });

  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter')  saveEdit();
    if (e.key === 'Escape') renderTodos(); // batalkan edit
  });
}

/** Render ulang seluruh daftar todo */
function renderTodos() {
  todoList.innerHTML = '';

  // Update counter jika elemen ada
  if (todoCounter) {
    const done  = todos.filter(t => t.done).length;
    todoCounter.textContent = `${done}/${todos.length} selesai`;
  }

  if (todos.length === 0) {
    todoList.innerHTML = '<li class="todo-empty">Belum ada tugas. Tambahkan sekarang!</li>';
    return;
  }

  todos.forEach((todo, index) => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.done ? ' todo-item--done' : '');

    // ── Checkbox ──────────────────────────────
    const checkbox    = document.createElement('input');
    checkbox.type     = 'checkbox';
    checkbox.checked  = todo.done;
    checkbox.title    = todo.done ? 'Tandai belum selesai' : 'Tandai selesai';
    checkbox.addEventListener('change', () => {
      // Update data
      todos[index].done = checkbox.checked;
      saveTodos();

      // Update DOM langsung — tidak perlu re-render seluruh list
      span.className = 'todo-text' + (checkbox.checked ? ' done' : '');
      li.className   = 'todo-item'  + (checkbox.checked ? ' todo-item--done' : '');
      checkbox.title = checkbox.checked ? 'Tandai belum selesai' : 'Tandai selesai';

      // Update counter jika ada
      if (todoCounter) {
        const done = todos.filter(t => t.done).length;
        todoCounter.textContent = `${done}/${todos.length} selesai`;
      }
    });

    // ── Teks tugas ────────────────────────────
    const span       = document.createElement('span');
    span.className   = 'todo-text' + (todo.done ? ' done' : '');
    span.textContent = todo.text;

    // Double-click untuk edit cepat
    span.addEventListener('dblclick', () => activateEditMode(li, index));

    // ── Tombol Edit ───────────────────────────
    const editBtn       = document.createElement('button');
    editBtn.className   = 'btn btn-edit';
    editBtn.textContent = '✏️';
    editBtn.title       = 'Edit tugas';
    editBtn.addEventListener('click', () => activateEditMode(li, index));

    // ── Tombol Hapus ──────────────────────────
    const delBtn       = document.createElement('button');
    delBtn.className   = 'btn btn-danger';
    delBtn.textContent = '✕';
    delBtn.title       = 'Hapus tugas';
    delBtn.addEventListener('click', () => {
      if (confirm(`Hapus tugas "${todo.text}"?`)) {
        todos.splice(index, 1);
        saveTodos();
        renderTodos();
      }
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(editBtn);
    li.appendChild(delBtn);
    todoList.appendChild(li);
  });
}

/** Tambah todo baru */
todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();

  if (!text) return;

  // ── Validasi duplikat ─────────────────────
  if (isDuplicate(text)) {
    showTodoWarning(`⚠️ Tugas "${text}" sudah ada dalam daftar.`);
    todoInput.select();
    return;
  }

  todos.push({ text, done: false });
  saveTodos();
  renderTodos();
  todoInput.value = '';
  todoInput.focus();
});

renderTodos();


// =============================================
// QUICK LINKS
// =============================================

const linkForm       = document.getElementById('linkForm');
const linkNameInput  = document.getElementById('linkName');
const linkUrlInput   = document.getElementById('linkUrl');
const linksContainer = document.getElementById('linksContainer');

let links = JSON.parse(localStorage.getItem('quicklinks') || '[]');

function saveLinks() {
  localStorage.setItem('quicklinks', JSON.stringify(links));
}

/** Pastikan URL punya protokol agar buka tab baru dengan benar */
function normalizeUrl(url) {
  if (!/^https?:\/\//i.test(url)) return 'https://' + url;
  return url;
}

function renderLinks() {
  linksContainer.innerHTML = '';

  if (links.length === 0) {
    linksContainer.innerHTML = '<p class="links-empty">Belum ada link tersimpan.</p>';
    return;
  }

  links.forEach((link, index) => {
    const wrapper     = document.createElement('div');
    wrapper.className = 'link-item';

    // Tombol link — buka tab baru
    const a       = document.createElement('a');
    a.href        = normalizeUrl(link.url);
    a.target      = '_blank';
    a.rel         = 'noopener noreferrer';
    a.className   = 'link-btn';
    a.textContent = link.name;
    a.title       = link.url;

    // Tombol hapus link
    const removeBtn       = document.createElement('button');
    removeBtn.className   = 'link-remove';
    removeBtn.textContent = '✕';
    removeBtn.title       = 'Hapus link';
    removeBtn.addEventListener('click', () => {
      if (confirm(`Hapus link "${link.name}"?`)) {
        links.splice(index, 1);
        saveLinks();
        renderLinks();
      }
    });

    wrapper.appendChild(a);
    wrapper.appendChild(removeBtn);
    linksContainer.appendChild(wrapper);
  });
}

linkForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = linkNameInput.value.trim();
  const url  = linkUrlInput.value.trim();
  if (!name || !url) return;

  links.push({ name, url: normalizeUrl(url) });
  saveLinks();
  renderLinks();
  linkNameInput.value = '';
  linkUrlInput.value  = '';
  linkNameInput.focus();
});

renderLinks();


// =============================================
// DARK / LIGHT MODE TOGGLE
// =============================================
// Catatan: data-theme sudah diterapkan di <head> (inline script)
// agar tidak ada flash saat halaman pertama kali dimuat.
// Di sini kita hanya sinkronkan ikon dan pasang event listener.

const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');
const htmlEl      = document.documentElement;

/** Sinkronkan ikon dengan tema yang sedang aktif */
function syncThemeIcon() {
  const current = htmlEl.getAttribute('data-theme');
  themeIcon.textContent = current === 'dark' ? '☀️' : '🌙';
  themeToggle.setAttribute('aria-label',
    current === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'
  );
}

/** Toggle tema dan simpan ke localStorage */
themeToggle.addEventListener('click', () => {
  const current = htmlEl.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  htmlEl.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  syncThemeIcon();
});

// Sinkronkan ikon saat halaman dimuat
syncThemeIcon();

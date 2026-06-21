/* ══════════════════════════════════════
   STATE
══════════════════════════════════════ */
const state = {
  openedCards:    0,
  collectedHearts: 0,
  noClickCount:   0,
};

/* ══════════════════════════════════════
   SCREEN NAVIGATION
══════════════════════════════════════ */
function showScreen(targetId) {
  const current = document.querySelector('.screen.active');
  const target  = document.getElementById(targetId);
  if (!target || current === target) return;

  // Slide current out
  if (current) {
    current.style.transition = 'opacity .35s ease, transform .35s ease, visibility .35s ease';
    current.style.opacity    = '0';
    current.style.transform  = 'translateY(-14px)';
    setTimeout(() => {
      current.classList.remove('active');
      current.style.cssText = '';
    }, 370);
  }

  // Slide next in
  setTimeout(() => {
    target.style.opacity    = '0';
    target.style.transform  = 'translateY(18px)';
    target.style.transition = 'none';
    target.classList.add('active');
    target.offsetHeight; // force reflow
    target.style.transition = 'opacity .48s ease, transform .48s ease';
    target.style.opacity    = '1';
    target.style.transform  = 'translateY(0)';
    target.scrollTop        = 0;

    // Per-screen setup
    if (targetId === 'screen-yes')       startConfetti();
    if (targetId === 'screen-scheduler') initScheduler();
    if (targetId === 'screen-loading')   initLoadingScreen();
  }, 340);
}

/* ══════════════════════════════════════
   SCREEN 1 · LOADING ANIMATION
══════════════════════════════════════ */
let loadingTimers = [];

function initLoadingScreen() {
  loadingTimers.forEach(clearTimeout);
  loadingTimers = [];

  // Reset lines
  document.querySelectorAll('.loading-line').forEach(el => el.classList.remove('visible'));
  const btn = document.getElementById('btn-to-welcome');
  if (btn) btn.style.display = 'none';

  const lineIds = ['ll-1', 'll-2', 'll-3'];
  const delays  = [1000, 2500, 4100];

  lineIds.forEach((id, i) => {
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.classList.add('visible');
    }, delays[i]);
    loadingTimers.push(t);
  });

  // Show continue button
  const t = setTimeout(() => {
    if (btn) {
      btn.style.display    = 'inline-flex';
      btn.style.animation  = 'fade-up .5s ease';
    }
  }, 5600);
  loadingTimers.push(t);
}

/* ══════════════════════════════════════
   AMBIENT HEARTS BACKGROUND
══════════════════════════════════════ */
function initAmbientHearts() {
  const container = document.querySelector('.ambient-hearts');
  if (!container) return;
  container.innerHTML = '';

  // Characters used in rotation
  const chars = ['❤️', '💕', '💗', '💝', '💖', '🌸', '✨', '💞'];
  const count = 18;

  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    span.className   = 'ambient-heart';
    span.textContent = chars[i % chars.length];
    span.setAttribute('aria-hidden', 'true');

    // Spread positions evenly with slight variation
    const leftPct  = 2 + ((i * 5.5 + (i % 3) * 3) % 94);
    const fontSize = 0.5 + Math.random() * 0.7; // 0.5rem – 1.2rem
    const duration = 10 + Math.random() * 14;    // 10s – 24s
    // Negative delay = start animation already mid-flight (no empty gap at load)
    const delay    = -(Math.random() * duration);

    span.style.left              = `${leftPct}%`;
    span.style.fontSize          = `${fontSize}rem`;
    span.style.animationDuration = `${duration}s`;
    span.style.animationDelay   = `${delay}s`;

    container.appendChild(span);
  }
}

/* ══════════════════════════════════════
   SCREEN 3 · MISSION CARDS
══════════════════════════════════════ */
function revealMissionCard(card) {
  if (card.classList.contains('flipped')) return;

  card.classList.add('flipped');
  state.openedCards++;

  // Update progress label
  const prog = document.getElementById('cards-progress');
  if (prog) prog.textContent = `${state.openedCards} / 5 revealed`;

  if (state.openedCards >= 5) {
    setTimeout(() => {
      const done = document.getElementById('missions-done');
      const btn  = document.getElementById('btn-to-memories');
      if (done) { done.style.display = 'block'; }
      if (btn)  { btn.style.display  = 'inline-flex'; btn.style.animation = 'fade-up .5s ease'; }
    }, 650);
  }
}

/* ══════════════════════════════════════
   SCREEN 4 · FUTURE MEMORIES REVEAL
══════════════════════════════════════ */
function revealMemoryCard(card) {
  // Cards stay open — tapping a revealed card does nothing
  if (card.classList.contains('revealed')) return;
  card.classList.add('revealed');
}

/* ══════════════════════════════════════
   SCREEN 5 · HEARTS MINI GAME
══════════════════════════════════════ */
function collectHeart(heart) {
  if (heart.classList.contains('collected')) return;

  const msg = heart.querySelector('.fh-msg');
  heart.classList.add('collected');
  state.collectedHearts++;

  // Update counter
  const counter = document.getElementById('hearts-count');
  if (counter) counter.textContent = state.collectedHearts;

  // Show message
  const msgBox = document.getElementById('heart-reveal-msg');
  if (msgBox && msg) {
    msgBox.textContent  = `"${msg.textContent}"`;
    msgBox.style.display = 'block';
    // Retrigger animation
    msgBox.style.animation = 'none';
    msgBox.offsetHeight;
    msgBox.style.animation = 'fade-up .4s ease';
  }

  if (state.collectedHearts >= 5) {
    setTimeout(() => {
      const done = document.getElementById('hearts-complete');
      if (done) { done.style.display = 'block'; }
    }, 650);
  }
}

/* ══════════════════════════════════════
   SCREEN 6 · BIG QUESTION
══════════════════════════════════════ */
function handleYes() {
  showScreen('screen-yes');
}

let noOffset = { x: 0, y: 0 };

function handleNo() {
  state.noClickCount++;
  const msgEl = document.getElementById('no-msg');
  const noBtn = document.getElementById('btn-no');

  // Messages for clicks 1-3
  const messages = [
    'Are you sure? 🥲',
    'Think again, wifey 😌',
    'Okay okay, look at this first...',
  ];

  if (state.noClickCount <= 3 && msgEl) {
    msgEl.style.display = 'block';
    // Re-trigger animation each time
    msgEl.style.animation = 'none';
    msgEl.offsetHeight;
    msgEl.style.animation = 'fade-up .3s ease';

    if (state.noClickCount < 3) {
      msgEl.textContent = messages[state.noClickCount - 1];
    } else {
      // Third click: show short sweet message after the opener
      msgEl.textContent = messages[2];
      setTimeout(() => {
        msgEl.innerHTML =
          'Okay okay, look at this first...<br><br>' +
          '<em style="font-style:italic;">"I just really like you, Christine.<br>' +
          'You make me feel calm, happy, and peaceful."</em>';
      }, 400);
    }
  }

  // Gently nudge the No button starting from 2nd click
  if (state.noClickCount >= 2 && noBtn) {
    nudgeNoButton(noBtn);
  }
}

function nudgeNoButton(btn) {
  // Each nudge stays within ±55px horizontal, ±38px vertical
  const dx = (Math.random() - 0.5) * 90;
  const dy = (Math.random() - 0.5) * 60;
  noOffset.x = Math.max(-55, Math.min(55, noOffset.x + dx));
  noOffset.y = Math.max(-38, Math.min(38, noOffset.y + dy));
  btn.style.transform  = `translate(${noOffset.x}px, ${noOffset.y}px)`;
  btn.style.transition = 'transform .32s ease';
}

/* ══════════════════════════════════════
   SCREEN 7 · CONFETTI
══════════════════════════════════════ */
let confettiRaf = null;

function startConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Size canvas to viewport
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.classList.add('active');

  // Cancel any previous run
  if (confettiRaf) cancelAnimationFrame(confettiRaf);

  const palette = ['#FFB7C5','#E0C8F5','#E07090','#FFF0F5','#C05878','#DDD0F0','#FFECF1'];
  const particles = [];

  for (let i = 0; i < 120; i++) {
    particles.push({
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height - canvas.height,
      w:    Math.random() * 10 + 4,
      h:    Math.random() * 6  + 3,
      color: palette[Math.floor(Math.random() * palette.length)],
      rot:  Math.random() * 360,
      rotV: (Math.random() - 0.5) * 7,
      vx:   (Math.random() - 0.5) * 1.8,
      vy:   Math.random() * 3 + 1.4,
      alpha: Math.random() * 0.6 + 0.35,
    });
  }

  let frame = 0;

  function draw() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x   += p.vx;
      p.y   += p.vy;
      p.rot += p.rotV;
      if (p.y > canvas.height + 10) {
        p.y = -12;
        p.x = Math.random() * canvas.width;
      }
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Run for ~5.5 seconds (330 frames at 60fps)
    if (frame < 330) {
      confettiRaf = requestAnimationFrame(draw);
    } else {
      canvas.classList.remove('active');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  confettiRaf = requestAnimationFrame(draw);
}

// Resize confetti canvas if window resizes during celebration
window.addEventListener('resize', () => {
  const canvas = document.getElementById('confetti-canvas');
  if (canvas && canvas.classList.contains('active')) {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
});

/* ══════════════════════════════════════
   SCREEN 8 · DATE SCHEDULER
══════════════════════════════════════ */
function initScheduler() {
  const picker = document.getElementById('date-picker');
  if (!picker) return;

  // Set minimum and default to today (local date)
  const today  = new Date();
  const yyyy   = today.getFullYear();
  const mm     = String(today.getMonth() + 1).padStart(2, '0');
  const dd     = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  picker.min   = todayStr;
  picker.value = todayStr;

  populateStartTimes();
}

// Generate hour slots from 9 AM to 11 PM
function buildTimeSlots() {
  const slots = [];
  for (let h = 9; h <= 23; h++) {
    const period  = h < 12 ? 'AM' : 'PM';
    const display = h === 12 ? 12 : h > 12 ? h - 12 : h;
    slots.push({ value: h, label: `${display}:00 ${period}` });
  }
  return slots;
}

function populateStartTimes() {
  const sel   = document.getElementById('start-time');
  const slots = buildTimeSlots();
  // Remove all except placeholder
  while (sel.options.length > 1) sel.remove(1);
  slots.forEach(s => sel.add(new Option(s.label, s.value)));
  updateEndTimes();
}

function updateEndTimes() {
  const startSel = document.getElementById('start-time');
  const endSel   = document.getElementById('end-time');
  const chosen   = parseInt(startSel.value);

  // Clear end options (keep placeholder)
  while (endSel.options.length > 1) endSel.remove(1);

  if (isNaN(chosen)) return;

  buildTimeSlots()
    .filter(s => s.value > chosen)
    .forEach(s => endSel.add(new Option(s.label, s.value)));

  // Reset end if it's now invalid
  if (endSel.value && parseInt(endSel.value) <= chosen) {
    endSel.value = '';
  }
}

function hourToLabel(h) {
  const n   = parseInt(h);
  const per = n < 12 ? 'AM' : 'PM';
  const dis = n === 12 ? 12 : n > 12 ? n - 12 : n;
  return `${dis}:00 ${per}`;
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  // Use local date constructor to avoid timezone offset shifting the day
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
}

function lockInDate() {
  const dateVal  = document.getElementById('date-picker').value;
  const startVal = document.getElementById('start-time').value;
  const endVal   = document.getElementById('end-time').value;
  const errEl    = document.getElementById('scheduler-error');

  // Validate
  if (!dateVal) {
    showError(errEl, 'Please pick a date first 📅'); return;
  }
  if (!startVal) {
    showError(errEl, 'Please choose a start time 🕘'); return;
  }
  if (!endVal) {
    showError(errEl, 'Please choose an end time 🕓'); return;
  }

  errEl.style.display = 'none';

  // Populate final screen
  document.getElementById('final-date-value').textContent = formatDate(dateVal);
  document.getElementById('final-time-value').textContent =
    `${hourToLabel(startVal)} – ${hourToLabel(endVal)}`;

  showScreen('screen-final');
}

function showError(el, msg) {
  el.textContent    = msg;
  el.style.display  = 'block';
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'fade-up .3s ease';
}

/* ══════════════════════════════════════
   RESET / START OVER
══════════════════════════════════════ */
function resetAllState() {
  state.openedCards     = 0;
  state.collectedHearts = 0;
  state.noClickCount    = 0;
  noOffset              = { x: 0, y: 0 };

  // Memory cards (screen 4)
  document.querySelectorAll('.memory-card').forEach(c => c.classList.remove('revealed'));

  // Mission cards
  document.querySelectorAll('.mission-card').forEach(c => c.classList.remove('flipped'));
  const prog = document.getElementById('cards-progress');
  if (prog) prog.textContent = '0 / 5 revealed';
  const done = document.getElementById('missions-done');
  if (done) done.style.display = 'none';
  const memBtn = document.getElementById('btn-to-memories');
  if (memBtn) memBtn.style.display = 'none';

  // Hearts
  document.querySelectorAll('.floating-heart').forEach(h => h.classList.remove('collected'));
  const hCount = document.getElementById('hearts-count');
  if (hCount) hCount.textContent = '0';
  const hMsg = document.getElementById('heart-reveal-msg');
  if (hMsg) hMsg.style.display = 'none';
  const hDone = document.getElementById('hearts-complete');
  if (hDone) hDone.style.display = 'none';

  // Question
  const noMsg = document.getElementById('no-msg');
  if (noMsg) noMsg.style.display = 'none';
  const noBtn = document.getElementById('btn-no');
  if (noBtn) { noBtn.style.transform = ''; noBtn.style.transition = ''; }

  // Confetti
  if (confettiRaf) cancelAnimationFrame(confettiRaf);
  const canvas = document.getElementById('confetti-canvas');
  if (canvas) {
    canvas.classList.remove('active');
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  }
}

function startOver() {
  resetAllState();
  showScreen('screen-loading');
  // initLoadingScreen is triggered inside showScreen when target === 'screen-loading'
}

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initAmbientHearts();
  initLoadingScreen();

  document.getElementById('btn-to-welcome').addEventListener('click', () => {
    showScreen('screen-welcome');
  });
});

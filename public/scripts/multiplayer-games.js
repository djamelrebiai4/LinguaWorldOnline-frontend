const MODE_LABELS = {
  hunt: 'Schnitzeljagd',
  tag: 'Fangen',
  hide: 'Verstecken',
  quiz: 'Quizrennen'
};

const ROLE_LABELS = {
  spieler: 'Spieler',
  it: 'Fänger',
  runner: 'Läufer',
  seeker: 'Sucher',
  hider: 'Versteckter',
  found: 'Gefunden',
  spectator: 'Zuschauer'
};

const EMOTES = [
  { id: 'wave', icon: '👋', label: 'Winken' },
  { id: 'dance', icon: '💃', label: 'Tanzen' },
  { id: 'laugh', icon: '😂', label: 'Lachen' },
  { id: 'point', icon: '👉', label: 'Zeigen' },
  { id: 'cheer', icon: '🙌', label: 'Jubeln' },
  { id: 'spin', icon: '🌀', label: 'Drehen' }
];

const WORLD_PRESETS = [
  { minute: 8 * 60, label: 'Morgen' },
  { minute: 12 * 60, label: 'Mittag' },
  { minute: 18 * 60, label: 'Abend' },
  { minute: 22 * 60, label: 'Nacht' }
];

const WEATHER_LABELS = {
  clear: 'Klar',
  rain: 'Regen',
  snow: 'Schnee',
  fog: 'Nebel'
};

function formatTime(milliseconds) {
  const total = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function awardOnce(storageKey, points, reason) {
  try {
    const list = JSON.parse(localStorage.getItem('de_mp_rewards') || '[]');
    if (Array.isArray(list) && list.includes(storageKey)) return;
    const next = Array.isArray(list) ? [...list, storageKey].slice(-200) : [storageKey];
    localStorage.setItem('de_mp_rewards', JSON.stringify(next));
  } catch {
    return;
  }
  const state = window.GermanEngine?.State;
  if (state && typeof state.addXP === 'function') state.addXP(points, reason);
}

export function createGameUi(options = {}) {
  const send = options.send || (() => {});
  const onGameState = options.onGameState || (() => {});
  const onWorldState = options.onWorldState || (() => {});
  const onHuntCollect = options.onHuntCollect || (() => {});
  const onQuestState = options.onQuestState || (() => {});
  const onEmote = options.onEmote || (() => {});

  let self = null;
  let players = [];
  let hostId = '';
  let game = null;
  let quest = null;
  let world = null;
  let quizResult = null;
  let selectedLeaderboardGame = 'hunt';
  let leaderboardPeriod = 'daily';
  let connected = false;
  let selectedQuizOption = null;
  let toastTimer = null;
  let timer = null;

  const root = element('div', 'lw-game-layer');
  root.dataset.lwNoTranslate = 'true';

  const launcher = element('button', 'lw-game-launcher');
  launcher.type = 'button';
  launcher.setAttribute('aria-label', 'Spiele öffnen');
  launcher.innerHTML = '<span aria-hidden="true">🎮</span><span>Spiele</span>';

  const menu = element('div', 'lw-game-overlay lw-game-menu');
  menu.hidden = true;
  menu.innerHTML = `
    <section class="lw-game-card" role="dialog" aria-modal="true" aria-labelledby="lw-game-menu-title">
      <header class="lw-game-card-head">
        <div>
          <p class="lw-game-eyebrow">Mehrspieler</p>
          <h2 id="lw-game-menu-title">Spiele mit Freunden</h2>
        </div>
        <button type="button" class="lw-game-close" aria-label="Schließen">×</button>
      </header>
      <p class="lw-game-connection" aria-live="polite">Verbinde …</p>
      <div class="lw-game-modes">
        <button type="button" data-game="hunt"><b>Schnitzeljagd</b><span>10 Wörter in 90 Sekunden finden</span></button>
        <button type="button" data-game="tag"><b>Fangen</b><span>Wer ist der Fänger? 2 Minuten</span></button>
        <button type="button" data-game="hide"><b>Verstecken</b><span>20 Sekunden verstecken, dann suchen</span></button>
        <button type="button" data-game="quiz"><b>Quizrennen</b><span>10 deutsche Fragen, schnelle Antworten</span></button>
      </div>
      <p class="lw-game-hint" hidden></p>
      <div class="lw-game-menu-actions">
        <button type="button" class="lw-game-ready">Bereit</button>
        <button type="button" class="lw-game-leave">Spiel verlassen</button>
      </div>
      <div class="lw-game-menu-grid">
        <section class="lw-game-menu-block">
          <h3>Spieler</h3>
          <ul class="lw-game-player-list"></ul>
        </section>
        <section class="lw-game-menu-block">
          <h3>Weltzeit <small>(nur Gastgeber)</small></h3>
          <div class="lw-world-presets"></div>
          <label class="lw-world-weather">Wetter
            <select>
              <option value="clear">Klar</option>
              <option value="rain">Regen</option>
              <option value="snow">Schnee</option>
              <option value="fog">Nebel</option>
            </select>
          </label>
        </section>
      </div>
      <section class="lw-game-menu-block lw-leaderboard">
        <div class="lw-leaderboard-head">
          <h3>Bestenliste</h3>
          <div class="lw-leaderboard-controls">
            <select class="lw-lb-game" aria-label="Spiel auswählen">
              <option value="hunt">Schnitzeljagd</option>
              <option value="tag">Fangen</option>
              <option value="hide">Verstecken</option>
              <option value="quiz">Quizrennen</option>
            </select>
            <button type="button" data-period="daily" class="is-active">Heute</button>
            <button type="button" data-period="all">Alle Zeit</button>
          </div>
        </div>
        <ol class="lw-leaderboard-list"><li class="lw-empty">Noch keine Einträge.</li></ol>
      </section>
    </section>`;

  const hud = element('section', 'lw-mp-hud');
  hud.hidden = true;
  hud.dataset.lwNoTranslate = 'true';
  hud.innerHTML = `
    <div class="lw-hud-mode"></div>
    <div class="lw-hud-meta">
      <span class="lw-hud-role"></span>
      <span class="lw-hud-timer"></span>
      <span class="lw-hud-score"></span>
    </div>
    <div class="lw-hud-progress"><span></span></div>`;

  const scoreboard = element('section', 'lw-game-scoreboard');
  scoreboard.hidden = true;
  scoreboard.dataset.lwNoTranslate = 'true';
  scoreboard.innerHTML = '<h3>Punkte</h3><ol></ol>';

  const coopQuest = element('section', 'lw-coop-quest');
  coopQuest.hidden = true;
  coopQuest.dataset.lwNoTranslate = 'true';
  coopQuest.innerHTML = `
    <header>
      <span class="lw-coop-eyebrow">Gemeinsame Aufgabe</span>
      <strong class="lw-coop-title"></strong>
    </header>
    <div class="lw-coop-progress"><span></span></div>
    <ul class="lw-coop-tasks"></ul>`;

  const emoteWheel = element('div', 'lw-emote-wheel');
  emoteWheel.hidden = true;
  emoteWheel.dataset.lwNoTranslate = 'true';
  emoteWheel.innerHTML = '<p>Geste wählen <kbd>E</kbd></p><div class="lw-emote-grid"></div>';
  const emoteGrid = emoteWheel.querySelector('.lw-emote-grid');
  EMOTES.forEach((emote, index) => {
    const button = element('button', 'lw-emote-button');
    button.type = 'button';
    button.dataset.emote = emote.id;
    button.innerHTML = `<span aria-hidden="true">${emote.icon}</span><b>${emote.label}</b><small>${index + 1}</small>`;
    button.addEventListener('click', () => {
      onEmote(emote.id);
      send({ type: 'emote', emote: emote.id });
      toggleEmoteWheel(false);
    });
    emoteGrid.appendChild(button);
  });

  const quiz = element('div', 'lw-game-overlay lw-quiz-overlay');
  quiz.hidden = true;
  quiz.dataset.lwNoTranslate = 'true';
  quiz.innerHTML = `
    <section class="lw-game-card lw-quiz-card" role="dialog" aria-modal="true" aria-labelledby="lw-quiz-title">
      <header class="lw-quiz-head">
        <span class="lw-quiz-progress"></span>
        <span class="lw-quiz-timer"></span>
      </header>
      <h2 id="lw-quiz-title" class="lw-quiz-question"></h2>
      <div class="lw-quiz-options" role="group" aria-label="Antworten"></div>
      <p class="lw-quiz-feedback" aria-live="polite"></p>
    </section>`;

  const end = element('div', 'lw-game-overlay lw-game-end');
  end.hidden = true;
  end.dataset.lwNoTranslate = 'true';
  end.innerHTML = `
    <section class="lw-game-card lw-game-end-card" role="dialog" aria-modal="true" aria-labelledby="lw-game-end-title">
      <p class="lw-game-eyebrow">Runde beendet</p>
      <h2 id="lw-game-end-title">Ergebnis</h2>
      <p class="lw-game-winner"></p>
      <ol class="lw-game-end-list"></ol>
      <div class="lw-game-end-actions">
        <button type="button" class="lw-game-again">Nochmal spielen</button>
        <button type="button" class="lw-game-close-end">Schließen</button>
      </div>
    </section>`;

  const toast = element('div', 'lw-game-toast');
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.hidden = true;
  toast.dataset.lwNoTranslate = 'true';

  root.append(launcher, hud, scoreboard, coopQuest, emoteWheel, menu, quiz, end, toast);
  document.body.appendChild(root);

  const menuClose = menu.querySelector('.lw-game-close');
  const connection = menu.querySelector('.lw-game-connection');
  const hint = menu.querySelector('.lw-game-hint');
  const readyButton = menu.querySelector('.lw-game-ready');
  const leaveButton = menu.querySelector('.lw-game-leave');
  const playerList = menu.querySelector('.lw-game-player-list');
  const worldPresets = menu.querySelector('.lw-world-presets');
  const weatherSelect = menu.querySelector('.lw-world-weather select');
  const leaderboardList = menu.querySelector('.lw-leaderboard-list');
  const leaderboardGame = menu.querySelector('.lw-lb-game');
  const periodButtons = [...menu.querySelectorAll('[data-period]')];
  const modeButtons = [...menu.querySelectorAll('[data-game]')];
  const hudMode = hud.querySelector('.lw-hud-mode');
  const hudRole = hud.querySelector('.lw-hud-role');
  const hudTimer = hud.querySelector('.lw-hud-timer');
  const hudScore = hud.querySelector('.lw-hud-score');
  const hudProgress = hud.querySelector('.lw-hud-progress span');
  const scoreboardList = scoreboard.querySelector('ol');
  const coopTitle = coopQuest.querySelector('.lw-coop-title');
  const coopBar = coopQuest.querySelector('.lw-coop-progress span');
  const coopTasks = coopQuest.querySelector('.lw-coop-tasks');
  const quizProgress = quiz.querySelector('.lw-quiz-progress');
  const quizTimer = quiz.querySelector('.lw-quiz-timer');
  const quizQuestion = quiz.querySelector('.lw-quiz-question');
  const quizOptions = quiz.querySelector('.lw-quiz-options');
  const quizFeedback = quiz.querySelector('.lw-quiz-feedback');
  const endTitle = end.querySelector('#lw-game-end-title');
  const endWinner = end.querySelector('.lw-game-winner');
  const endList = end.querySelector('.lw-game-end-list');
  const againButton = end.querySelector('.lw-game-again');
  const closeEndButton = end.querySelector('.lw-game-close-end');

  function selfName() {
    return self?.name || 'du';
  }

  function myRole() {
    return game?.roles?.[self?.id] || 'spectator';
  }

  function showToast(text, duration = 2800) {
    if (!text) return;
    toast.textContent = text;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, duration);
  }

  function openMenu() {
    menu.hidden = false;
    if (document.pointerLockElement) document.exitPointerLock();
    renderMenu();
    requestLeaderboard();
  }

  function closeMenu() {
    menu.hidden = true;
  }

  function toggleEmoteWheel(force) {
    const next = force === undefined ? emoteWheel.hidden : force;
    emoteWheel.hidden = !next;
    if (next && document.pointerLockElement) document.exitPointerLock();
  }

  function requestLeaderboard() {
    if (!connected) return;
    send({ type: 'leaderboard:get', game: selectedLeaderboardGame, period: leaderboardPeriod });
  }

  function renderPlayers() {
    playerList.replaceChildren();
    const all = [...players];
    if (self && !all.some((player) => player.id === self.id)) all.unshift(self);
    all.forEach((player) => {
      const item = element('li', 'lw-game-player');
      const name = element('span', 'lw-game-player-name', player.name);
      if (player.id === hostId) name.append(element('small', '', ' · Gastgeber'));
      if (player.id === self?.id) name.append(element('small', '', ' · Du'));
      const status = element('span', 'lw-game-player-status');
      status.textContent = player.ready ? 'Bereit' : 'Nicht bereit';
      status.classList.toggle('is-ready', Boolean(player.ready));
      if (player.score) status.textContent += ` · ${player.score} P.`;
      item.append(name, status);
      playerList.appendChild(item);
    });
    if (!all.length) playerList.append(element('li', 'lw-empty', 'Noch niemand hier.'));
  }

  function renderMenu() {
    const isHost = self?.id === hostId;
    const running = Boolean(game && game.phase !== 'ended');
    modeButtons.forEach((button) => {
      const mode = button.dataset.game;
      button.disabled = !isHost || running;
      button.title = !isHost ? 'Nur der Gastgeber kann ein Spiel starten.' : running ? 'Es läuft bereits ein Spiel.' : '';
    });
    readyButton.textContent = self?.ready ? 'Nicht mehr bereit' : 'Bereit';
    readyButton.classList.toggle('is-ready', Boolean(self?.ready));
    readyButton.disabled = !self;
    leaveButton.disabled = !running;
    hint.hidden = isHost;
    hint.textContent = 'Nur der Gastgeber kann ein Spiel starten.';
    worldPresets.querySelectorAll('button').forEach((button) => {
      button.disabled = !isHost;
    });
    weatherSelect.disabled = !isHost;
    if (world) {
      weatherSelect.value = world.weather || 'clear';
    }
    renderPlayers();
  }

  function renderHud() {
    if (!game || game.phase === 'ended') {
      hud.hidden = true;
      scoreboard.hidden = true;
      return;
    }
    hud.hidden = false;
    scoreboard.hidden = false;
    hudMode.textContent = MODE_LABELS[game.game] || 'Spiel';
    hudRole.textContent = ROLE_LABELS[myRole()] || 'Spieler';
    hudRole.className = `lw-hud-role is-${myRole()}`;
    const own = game.scoreboard?.find((entry) => entry.id === self?.id);
    hudScore.textContent = `${own?.score || 0} Punkte`;
    const endsAt = ['countdown', 'hiding', 'question', 'reveal'].includes(game.phase)
      ? game.phaseEndsAt
      : game.endsAt;
    hudTimer.textContent = endsAt ? formatTime(endsAt - Date.now()) : '';
    if (game.game === 'hunt' && game.hunt) {
      const found = game.hunt.total - game.hunt.remaining;
      hudProgress.style.width = `${Math.round(found / Math.max(1, game.hunt.total) * 100)}%`;
      hudMode.textContent = `Schnitzeljagd · ${found}/${game.hunt.total}`;
    } else if (game.game === 'quiz' && game.quiz) {
      hudProgress.style.width = `${Math.round((game.quiz.answeredCount || 0) / Math.max(1, game.quiz.totalQuestions) * 100)}%`;
      hudMode.textContent = `Quizrennen · Frage ${(game.quiz.questionIndex || 0) + 1}/${game.quiz.totalQuestions}`;
    } else if (game.tag) {
      const isHunter = game.game === 'tag' ? game.tag.itId === self?.id : game.tag.seekerId === self?.id;
      const count = game.game === 'tag'
        ? (isHunter ? 'Du bist der Fänger!' : 'Laufe weg!')
        : (isHunter ? 'Du suchst!' : 'Verstecke dich!');
      hudMode.textContent = `${MODE_LABELS[game.game]} · ${count}${isHunter ? ' · T zum Fangen' : ''}`;
      hudProgress.style.width = `${Math.round((game.tag.foundIds?.length || 0) / Math.max(1, game.participants.length - 1) * 100)}%`;
    } else {
      hudProgress.style.width = '0%';
    }
    renderScoreboard();
  }

  function renderScoreboard() {
    scoreboardList.replaceChildren();
    const board = game?.scoreboard || [];
    if (!board.length) {
      scoreboardList.append(element('li', 'lw-empty', 'Noch keine Punkte.'));
      return;
    }
    board.forEach((entry, index) => {
      const item = element('li');
      item.dataset.role = entry.role || 'spieler';
      const rank = element('span', 'lw-score-rank', String(index + 1));
      const name = element('span', 'lw-score-name', entry.name);
      const points = element('b', 'lw-score-points', String(entry.score));
      item.append(rank, name, points);
      scoreboardList.appendChild(item);
    });
  }

  function renderQuest() {
    if (!quest) {
      coopQuest.hidden = true;
      return;
    }
    coopQuest.hidden = false;
    coopTitle.textContent = quest.title || 'Gemeinsame Aufgabe';
    const done = quest.tasks.filter((task) => task.completed).length;
    coopBar.style.width = `${Math.round(done / Math.max(1, quest.tasks.length) * 100)}%`;
    coopTasks.replaceChildren();
    quest.tasks.forEach((task) => {
      const item = element('li', task.completed ? 'is-done' : '');
      item.append(element('span', 'lw-coop-check', task.completed ? '✓' : '○'));
      item.append(element('span', 'lw-coop-word', task.de));
      if (task.completed && task.by) item.append(element('small', '', `· ${task.by}`));
      coopTasks.appendChild(item);
    });
    if (quest.completedAt) {
      coopQuest.classList.add('is-complete');
    } else {
      coopQuest.classList.remove('is-complete');
    }
  }

  function renderQuiz() {
    const quizState = game?.game === 'quiz' ? game.quiz : null;
    if (!quizState || !quizState.question || game.phase === 'ended') {
      quiz.hidden = true;
      return;
    }
    if (quiz.hidden && document.pointerLockElement) document.exitPointerLock();
    quiz.hidden = false;
    quizProgress.textContent = `Frage ${(quizState.questionIndex || 0) + 1} von ${quizState.totalQuestions}`;
    quizTimer.textContent = formatTime((game.phaseEndsAt || game.endsAt) - Date.now());
    quizQuestion.textContent = quizState.question.prompt;
    quizOptions.replaceChildren();
    quizState.question.options.forEach((option, index) => {
      const button = element('button', 'lw-quiz-option');
      button.type = 'button';
      button.dataset.index = String(index);
      button.append(element('kbd', '', String(index + 1)));
      button.append(element('span', '', option));
      if (selectedQuizOption === index) button.classList.add('is-selected');
      if (quizResult && quizResult.questionIndex === quizState.questionIndex) {
        if (index === quizResult.correctIndex) button.classList.add('is-correct');
        else if (selectedQuizOption === index) button.classList.add('is-wrong');
      }
      button.addEventListener('click', () => answerQuiz(index));
      quizOptions.appendChild(button);
    });
    if (quizResult && quizResult.questionIndex === quizState.questionIndex) {
      quizFeedback.textContent = `Richtig: ${quizResult.correctAnswer}`;
      quizFeedback.className = 'lw-quiz-feedback is-correct';
    } else {
      quizFeedback.textContent = '';
      quizFeedback.className = 'lw-quiz-feedback';
    }
  }

  function answerQuiz(index) {
    if (!game || game.game !== 'quiz' || game.phase !== 'question') return;
    if (selectedQuizOption !== null) return;
    selectedQuizOption = index;
    send({ type: 'quiz:answer', questionIndex: game.quiz?.questionIndex, optionIndex: index });
    renderQuiz();
  }

  function renderEnd(message = null) {
    const ended = message || game;
    if (!ended) return;
    const board = ended.scores || game?.scoreboard || [];
    const winnerIds = ended.winnerIds || [];
    const winners = board.filter((entry) => winnerIds.includes(entry.id));
    endTitle.textContent = MODE_LABELS[ended.game || game?.game] || 'Ergebnis';
    endWinner.textContent = winners.length
      ? `Sieger: ${winners.map((entry) => entry.name).join(', ')}`
      : 'Diese Runde endete ohne Sieger.';
    endList.replaceChildren();
    board.forEach((entry, index) => {
      const item = element('li');
      item.append(element('span', 'lw-score-rank', String(index + 1)));
      item.append(element('span', 'lw-score-name', entry.name));
      item.append(element('b', '', `${entry.score} P.`));
      if (winnerIds.includes(entry.id)) item.classList.add('is-winner');
      endList.appendChild(item);
    });
    againButton.hidden = self?.id !== (game?.hostId || hostId);
    againButton.dataset.game = ended.game || game?.game || 'hunt';
    end.hidden = false;
    if (document.pointerLockElement) document.exitPointerLock();
    awardRoundRewards(ended, board, winnerIds);
  }

  function awardRoundRewards(ended, board, winnerIds) {
    const mode = ended.game || game?.game;
    const round = game?.roundId || 'round';
    if (winnerIds.includes(self?.id)) {
      const points = mode === 'quiz' ? 150 : mode === 'hunt' ? 50 : 25;
      awardOnce(`winner:${round}`, points, `${MODE_LABELS[mode] || 'Spiel'} gewonnen`);
    }
    if (mode === 'quiz') {
      const rank = board.findIndex((entry) => entry.id === self?.id);
      if (rank === 1) awardOnce(`quiz-2:${round}`, 100, 'Quizrennen: 2. Platz');
      if (rank === 2) awardOnce(`quiz-3:${round}`, 50, 'Quizrennen: 3. Platz');
    }
  }

  launcher.addEventListener('click', openMenu);
  menuClose.addEventListener('click', closeMenu);
  menu.addEventListener('click', (event) => {
    if (event.target === menu) closeMenu();
  });
  readyButton.addEventListener('click', () => {
    send({ type: 'ready', ready: !self?.ready });
  });
  leaveButton.addEventListener('click', () => {
    send({ type: 'game:leave' });
    closeMenu();
  });
  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      send({ type: 'game:start', game: button.dataset.game });
    });
  });
  WORLD_PRESETS.forEach((preset) => {
    const button = element('button', '', preset.label);
    button.type = 'button';
    button.dataset.minute = String(preset.minute);
    button.addEventListener('click', () => {
      send({ type: 'world:set', minuteOfDay: preset.minute });
      showToast(`Weltzeit: ${preset.label}`);
    });
    worldPresets.appendChild(button);
  });
  weatherSelect.addEventListener('change', () => {
    send({ type: 'world:set', weather: weatherSelect.value });
    showToast(`Wetter: ${WEATHER_LABELS[weatherSelect.value] || weatherSelect.value}`);
  });
  leaderboardGame.addEventListener('change', () => {
    selectedLeaderboardGame = leaderboardGame.value;
    requestLeaderboard();
  });
  periodButtons.forEach((button) => {
    button.addEventListener('click', () => {
      leaderboardPeriod = button.dataset.period;
      periodButtons.forEach((entry) => entry.classList.toggle('is-active', entry === button));
      requestLeaderboard();
    });
  });
  againButton.addEventListener('click', () => {
    send({ type: 'game:start', game: againButton.dataset.game || 'hunt' });
    end.hidden = true;
  });
  closeEndButton.addEventListener('click', () => {
    end.hidden = true;
  });

  window.addEventListener('keydown', (event) => {
    const target = event.target;
    if (target && (target.matches?.('input, textarea, select, [contenteditable="true"]'))) return;
    if (event.key === 'Escape') {
      closeMenu();
      toggleEmoteWheel(false);
      end.hidden = true;
      return;
    }
    if (event.key.toLowerCase() === 'e' && !event.repeat && menu.hidden && quiz.hidden) {
      event.preventDefault();
      toggleEmoteWheel();
      return;
    }
    if (!emoteWheel.hidden && /^[1-6]$/.test(event.key)) {
      const emote = EMOTES[Number(event.key) - 1];
      if (emote) {
        onEmote(emote.id);
        send({ type: 'emote', emote: emote.id });
        toggleEmoteWheel(false);
      }
      return;
    }
    if (!quiz.hidden && game?.phase === 'question' && /^[1-4]$/.test(event.key)) {
      event.preventDefault();
      answerQuiz(Number(event.key) - 1);
    }
  });

  timer = window.setInterval(() => {
    if (game) {
      renderHud();
      if (game.game === 'quiz' && !quiz.hidden) renderQuiz();
    }
  }, 500);

  function handleMessage(message) {
    if (!message || typeof message.type !== 'string') return;
    if (message.type === 'welcome') {
      self = message.self || null;
      players = Array.isArray(message.players) ? message.players : [];
      hostId = message.hostId || '';
      game = message.game || null;
      quest = message.quest || null;
      world = message.world || null;
      onGameState(game);
      if (world) onWorldState(world);
      onQuestState(quest);
      renderMenu();
      renderHud();
      renderQuest();
      renderQuiz();
      return;
    }
    if (message.type === 'room:state') {
      hostId = message.hostId || hostId;
      renderMenu();
      return;
    }
    if (message.type === 'player-updated') {
      if (message.player) {
        const index = players.findIndex((player) => player.id === message.player.id);
        if (index >= 0) players[index] = message.player;
        else players.push(message.player);
        if (message.player.id === self?.id) self = { ...self, ...message.player };
        renderPlayers();
      }
      return;
    }
    if (message.type === 'game:state') {
      const previous = game;
      game = message.state || null;
      const sameQuizQuestion = game?.game === 'quiz'
        && previous?.game === 'quiz'
        && previous?.quiz?.questionIndex === game?.quiz?.questionIndex;
      if (!sameQuizQuestion) {
        quizResult = null;
        selectedQuizOption = null;
      }
      onGameState(game);
      renderHud();
      renderMenu();
      renderQuiz();
      if (!game) {
        quiz.hidden = true;
        end.hidden = true;
      }
      return;
    }
    if (message.type === 'game:started') {
      closeMenu();
      showToast(`${MODE_LABELS[message.game] || 'Spiel'} startet …`);
      return;
    }
    if (message.type === 'game:event') {
      if (message.event === 'hunt:collect') {
        showToast(`${message.playerName} hat ${message.de} gefunden!`);
        onHuntCollect(message);
      } else if (message.event === 'tag:tagged') {
        showToast(`${message.targetName} ist jetzt der Fänger!`);
      } else if (message.event === 'hide:found') {
        showToast(`${message.targetName} wurde gefunden!`);
      } else if (message.event === 'player:left') {
        showToast(`${message.playerName} hat das Spiel verlassen.`);
      }
      return;
    }
    if (message.type === 'game:ended') {
      quiz.hidden = true;
      renderEnd(message);
      showToast('Die Runde ist beendet.');
      return;
    }
    if (message.type === 'quiz:result') {
      quizResult = message;
      renderQuiz();
      return;
    }
    if (message.type === 'quiz:ack') {
      return;
    }
    if (message.type === 'quest:state') {
      quest = message.quest || null;
      onQuestState(quest);
      renderQuest();
      return;
    }
    if (message.type === 'quest:completed') {
      showToast(`Gemeinsame Aufgabe erledigt: ${message.title}`, 4200);
      awardOnce(`quest:${message.questId}`, message.rewardXP || 150, `Gemeinsame Aufgabe: ${message.title}`);
      return;
    }
    if (message.type === 'world:state') {
      world = message.world || world;
      if (world) onWorldState(world);
      renderMenu();
      return;
    }
    if (message.type === 'leaderboard:data') {
      leaderboardList.replaceChildren();
      const entries = Array.isArray(message.entries) ? message.entries : [];
      if (!entries.length) {
        leaderboardList.append(element('li', 'lw-empty', 'Noch keine Einträge.'));
      }
      entries.forEach((entry) => {
        const item = element('li');
        item.append(element('span', 'lw-score-rank', String(entry.rank)));
        item.append(element('span', 'lw-score-name', entry.name));
        item.append(element('b', '', `${entry.score} P.`));
        leaderboardList.appendChild(item);
      });
      return;
    }
    if (message.type === 'game:error' || message.type === 'error') {
      showToast(message.message || 'Das Spiel konnte nicht gestartet werden.', 4200);
    }
  }

  function setSelf(player) {
    if (!player) return;
    self = player;
    renderMenu();
    renderHud();
  }

  function setPlayers(list) {
    players = Array.isArray(list) ? list.filter(Boolean) : [];
    renderMenu();
    renderHud();
  }

  function setHostId(id) {
    hostId = id || '';
    renderMenu();
  }

  function setConnection(text, online = false) {
    connected = Boolean(online);
    connection.textContent = text;
    connection.classList.toggle('is-online', connected);
  }

  function destroy() {
    clearInterval(timer);
    clearTimeout(toastTimer);
    root.remove();
  }

  return {
    root,
    handleMessage,
    setSelf,
    setPlayers,
    setHostId,
    setConnection,
    openMenu,
    destroy,
    showToast
  };
}

export { MODE_LABELS, ROLE_LABELS, EMOTES };

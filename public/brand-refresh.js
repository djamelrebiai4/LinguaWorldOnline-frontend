(function () {
  'use strict';

  const brandName = 'LinguaWorld';
  const logoPath = '/Images/LinguaWorld.svg';

  function applyBrand() {
    const storedLanguage = localStorage.getItem('lw_support_language');
    const language = storedLanguage === 'ar' || storedLanguage === 'en' ? storedLanguage : 'de';
    const pageTitle = `${brandName} | Deutsch lernen`;
    const descriptions = {
      de: 'Lerne Deutsch in interaktiven Welten mit Wortschatz, Aussprache und Spielen. Übersetze nur bei Bedarf.',
      en: 'Learn German through interactive worlds, vocabulary, pronunciation, and games. Use German first and translate only when needed.',
      ar: 'تعلّم الألمانية عبر عوالم تفاعلية ومفردات ونطق وألعاب. استخدم الألمانية أولاً ثم اختر الترجمة عند الحاجة.'
    };
    const headlines = {
      de: 'Lerne Deutsch spielerisch.',
      en: 'Learn German through play.',
      ar: 'تعلّم الألمانية من خلال اللعب.'
    };
    const description = descriptions[language];
    const homeHeadline = headlines[language];

    if (document.title !== pageTitle) document.title = pageTitle;

    document.querySelectorAll('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]').forEach((meta) => {
      if (meta.content !== description) meta.content = description;
    });

    document.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]').forEach((meta) => {
      if (meta.content !== pageTitle) meta.content = pageTitle;
    });

    document.querySelectorAll('.ls-logo').forEach((logo) => {
      if (logo.getAttribute('src') !== logoPath) logo.setAttribute('src', logoPath);
      if (logo.alt !== `${brandName} language learning`) {
        logo.alt = `${brandName} language learning`;
      }
      logo.width = 240;
      logo.height = 64;
    });

    const headline = document.querySelector('.ls-title');
    if (headline && headline.textContent !== homeHeadline) {
      headline.textContent = homeHeadline;
    }
    if (headline) {
      headline.lang = language;
      headline.dir = language === 'ar' ? 'rtl' : 'ltr';
    }

    document.querySelectorAll('link[rel~="icon"]').forEach((icon) => {
      if (icon.getAttribute('href') !== logoPath) icon.setAttribute('href', logoPath);
      icon.type = 'image/svg+xml';
    });

    const siteName = document.querySelector('meta[property="og:site_name"]');
    if (siteName && siteName.content !== brandName) siteName.content = brandName;

    const structuredData = document.querySelector('script[type="application/ld+json"]');
    if (structuredData) {
      try {
        const data = JSON.parse(structuredData.textContent);
        if (
          data.name !== brandName ||
          data.description !== description ||
          !Array.isArray(data.inLanguage) ||
          data.inLanguage.join(',') !== 'de,ar,en'
        ) {
          data.name = brandName;
          data.description = description;
          data.inLanguage = ['de', 'ar', 'en'];
          structuredData.textContent = JSON.stringify(data);
        }
      } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
        console.error('Could not update LinguaWorld structured data.', error);
      }
    }

    const root = document.getElementById('root');
    if (root && root.childElementCount === 0 && root.textContent.includes('Lexi Explorer')) {
      root.textContent = language === 'de'
        ? 'Lerne Deutsch in interaktiven Welten und mit spielerischen Übungen von LinguaWorld.'
        : language === 'en'
          ? 'Learn German through interactive worlds and playful practice with LinguaWorld.'
          : 'تعلّم الألمانية عبر عوالم تفاعلية وتدريبات ممتعة مع LinguaWorld.';
    }
  }

  applyBrand();
  window.addEventListener('linguaworld:language-change', applyBrand);
  new MutationObserver(applyBrand).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();

/* In-game HUD-only behavior; gameplay state and existing button handlers stay owned by their current modules. */
(function () {
  'use strict';

  function syncButtonLabel(button) {
    if (!button) return;
    const label = button.getAttribute('title') || button.getAttribute('aria-label');
    if (label && !button.hasAttribute('title')) button.title = label;
    if (label && button.getAttribute('aria-label') !== label) {
      button.setAttribute('aria-label', label);
    }
  }

  function updateXpProgress() {
    const value = document.getElementById('de-hud-xp-val');
    const fill = document.querySelector('.de-hud-xp-track i');
    if (!value || !fill) return;
    const xp = Number((value.textContent.match(/[\d,]+/) || ['0'])[0].replace(/,/g, '')) || 0;
    const thresholds = [0, 200, 500, 1000];
    const start = xp >= 1000 ? 1000 : xp >= 500 ? 500 : xp >= 200 ? 200 : 0;
    const end = xp >= 1000 ? 1000 : thresholds[thresholds.indexOf(start) + 1];
    const progress = xp >= 1000 ? 100 : Math.max(0, Math.min(100, ((xp - start) / (end - start)) * 100));
    const nextWidth = `${progress}%`;
    if (fill.style.width !== nextWidth) {
      fill.style.width = nextWidth;
      window.dispatchEvent(new Event('lw-hud-important'));
    }
  }

  let hudRoot = null;
  let hudLayoutReady = false;
  let idleTimer = null;
  let focusHintTimer = null;
  let unreadCount = 0;
  let unreadListenerReady = false;
  let lastQuestProgress = null;
  let lastHudToast = null;
  let hudObserver = null;
  let titleObserver = null;
  let syncScheduled = false;

  const HUD_ICONS = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1Z"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9a2.5 2.5 0 1 1 4.2 1.8c-1.1 1-1.8 1.3-1.8 2.7M12 17h.01"/>',
    sound: '<path d="M4 10v4h3l4 3V7l-4 3Z"/><path d="M15 9a5 5 0 0 1 0 6m2-8a8 8 0 0 1 0 10"/>',
    soundOff: '<path d="M4 10v4h3l4 3V7l-4 3Z"/><path d="m16 9 5 6m0-6-5 6"/>',
    pause: '<path d="M8 5h3v14H8zM15 5h3v14h-3z"/>',
    play: '<path d="m7 4 13 8-13 8z"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15m6-12v15"/>',
    chat: '<path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 2 1.5-4A7.5 7.5 0 1 1 20 11.5Z"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    profile: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.8-.7a7.7 7.7 0 0 1-1.5.9l-.3 1.9h-2.8l-.3-1.9a7.7 7.7 0 0 1-1.5-.9l-1.8.7-1.4-2.4 1.4-1.1a7.3 7.3 0 0 1 0-1.8l-1.4-1.1 1.4-2.4 1.8.7a7.7 7.7 0 0 1 1.5-.9l.3-1.9h2.8l.3 1.9a7.7 7.7 0 0 1 1.5.9l1.8-.7 1.4 2.4-1.4 1.1a7.3 7.3 0 0 1 0 1.8Z" transform="translate(-1 -1)"/>',
    energy: '<path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z"/>',
    interact: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0m-7 7v5m-4 0h8"/>'
  };

  function makeHudIcon(name) {
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = HUD_ICONS[name] || HUD_ICONS.settings;
    return icon;
  }

  function makeMenuButton(label, iconName, action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lw-menu-action';
    button.dir = 'ltr';
    button.setAttribute('aria-label', label);
    button.title = label;
    button.append(makeHudIcon(iconName));
    const text = document.createElement('span');
    text.lang = 'de';
    text.dir = 'ltr';
    text.textContent = label;
    button.append(text);
    button.addEventListener('click', () => {
      closeMenu();
      action();
    });
    return button;
  }

  function ensureHudRoot() {
    if (hudRoot?.isConnected) return hudRoot;
    hudRoot = document.createElement('div');
    hudRoot.className = 'lw-hud-root';
    hudRoot.setAttribute('aria-label', 'Spielmenü');
    document.body.classList.add('lw-game-hud');

    const status = document.createElement('div');
    status.className = 'lw-hud-status';
    status.append(makeMenuButton('Startseite', 'home', () => document.querySelector('.home-button')?.click()));

    const topRight = document.createElement('div');
    topRight.className = 'lw-hud-top-right';
    const chips = document.createElement('div');
    chips.className = 'lw-hud-chips';
    topRight.append(chips);

    const lowEnergy = document.createElement('div');
    lowEnergy.className = 'lw-energy-warning';
    lowEnergy.setAttribute('role', 'status');
    lowEnergy.append(makeHudIcon('energy'));
    const energyValue = document.createElement('span');
    energyValue.className = 'lw-energy-warning-value';
    lowEnergy.append(energyValue);
    topRight.append(lowEnergy);

    const dock = document.createElement('nav');
    dock.className = 'lw-hud-dock';
    dock.setAttribute('aria-label', 'Spielaktionen');
    const chatButton = document.createElement('button');
    chatButton.type = 'button';
    chatButton.className = 'lw-dock-chat';
    chatButton.setAttribute('aria-label', 'Chat öffnen');
    chatButton.setAttribute('aria-expanded', 'false');
    chatButton.title = 'Chat öffnen';
    chatButton.dir = 'ltr';
    chatButton.append(makeHudIcon('chat'));
    const chatText = document.createElement('span');
    chatText.textContent = 'Chat';
    chatText.lang = 'de';
    chatText.dir = 'ltr';
    chatButton.append(chatText);
    const badge = document.createElement('span');
    badge.className = 'lw-chat-unread';
    badge.hidden = true;
    chatButton.append(badge);
    chatButton.addEventListener('click', () => {
      const panel = document.querySelector('.lw-multiplayer-panel');
      if (!panel) return;
      const opening = panel.hidden;
      closeMenu();
      setPublicChatOpen(panel, opening);
      window.dispatchEvent(new Event('lw-hud-important'));
      if (opening) {
        unreadCount = 0;
        badge.hidden = true;
        badge.textContent = '';
        panel.querySelector('.lw-multiplayer-compose input')?.focus();
      }
    });
    dock.append(chatButton);

    const hint = document.createElement('div');
    hint.className = 'lw-hud-focus-hint';
    hint.lang = 'en';
    hint.dir = 'ltr';
    hint.textContent = 'Press Tab to show HUD';
    hint.hidden = true;

    hudRoot.append(status, topRight, dock, hint);
    document.body.append(hudRoot);
    return hudRoot;
  }

  function ensureMenuSections(settings) {
    const popover = settings?.querySelector('.lw-settings-popover');
    if (!popover) return;
    const existingActions = popover.querySelector('.lw-menu-actions');
    // Keep the mobile center-screen action available without exposing its oversized button.
    const addInteractAction = (actions) => {
      const source = document.querySelector('.switch-button');
      if (!source || actions.querySelector('.lw-menu-interact')) return;
      hideOriginalControl(source);
      const action = makeMenuButton('Interagieren', 'interact', () => {
        document.querySelector('.switch-button')?.dispatchEvent(new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          pointerId: 1,
          pointerType: 'touch',
          isPrimary: true,
          button: 0,
          buttons: 1
        }));
      });
      action.classList.add('lw-menu-interact');
      actions.append(action);
    };
    if (existingActions) {
      addInteractAction(existingActions);
      return;
    }
    const oldLanguage = popover.querySelector('.lw-settings-language-slot');
    const oldMobileStats = popover.querySelector('.lw-settings-mobile-stats');
    const lifeButton = popover.querySelector('#de-open-life-btn');

    const actions = document.createElement('div');
    actions.className = 'lw-menu-actions';
    actions.append(
      makeMenuButton('Startseite', 'home', () => document.querySelector('.home-button')?.click()),
      makeMenuButton('Hilfe', 'help', () => document.querySelector('.tutorial-toggle-btn')?.click()),
      makeMenuButton('Ton', 'sound', () => document.querySelector('.mute-button')?.click()),
      makeMenuButton('Pause', 'pause', () => document.querySelector('.pause-btn')?.click()),
      makeMenuButton('Stadtkarte', 'map', () => document.querySelector('.lw-city-map-toggle')?.click())
    );
    addInteractAction(actions);

    const profile = document.createElement('details');
    profile.className = 'lw-menu-section lw-menu-profile';
    const profileSummary = document.createElement('summary');
    profileSummary.append(makeHudIcon('profile'));
    profileSummary.append(document.createTextNode('Profil'));
    const profileContent = document.createElement('div');
    profileContent.className = 'lw-menu-section-content lw-profile-slot';
    if (oldLanguage) profileContent.append(oldLanguage);
    profile.append(profileSummary, profileContent);

    const settingsSection = document.createElement('details');
    settingsSection.className = 'lw-menu-section lw-menu-settings';
    const settingsSummary = document.createElement('summary');
    settingsSummary.append(makeHudIcon('settings'));
    settingsSummary.append(document.createTextNode('Einstellungen'));
    const settingsContent = document.createElement('div');
    settingsContent.className = 'lw-menu-section-content lw-settings-slot';
    if (oldMobileStats) settingsContent.append(oldMobileStats);
    if (lifeButton) settingsContent.append(lifeButton);
    settingsSection.append(settingsSummary, settingsContent);

    const energy = document.createElement('div');
    energy.className = 'lw-menu-energy';
    energy.lang = 'de';
    energy.dir = 'ltr';
    const energyTitle = document.createElement('span');
    energyTitle.textContent = 'Energie';
    energyTitle.lang = 'de';
    energyTitle.dir = 'ltr';
    energy.append(energyTitle);
    const energyValue = document.createElement('span');
    energyValue.className = 'lw-menu-energy-value';
    energy.append(energyValue);

    const npcSlot = document.createElement('div');
    npcSlot.className = 'lw-menu-npc-slot';
    const dialogueButton = document.getElementById('de-world-dialogue-btn');
    if (dialogueButton) {
      npcSlot.append(dialogueButton);
      if (!dialogueButton.dataset.hudMenuClose) {
        dialogueButton.dataset.hudMenuClose = 'true';
        dialogueButton.addEventListener('click', closeMenu);
      }
    }

    const nearbySlot = document.createElement('div');
    nearbySlot.className = 'lw-menu-nearby-slot';
    const beacon = document.getElementById('de-npc-world-beacon');
    if (beacon) {
      nearbySlot.append(beacon);
      if (!beacon.dataset.hudMenuClose) {
        beacon.dataset.hudMenuClose = 'true';
        beacon.addEventListener('click', closeMenu);
      }
    }

    popover.replaceChildren(actions, profile, settingsSection, energy, npcSlot, nearbySlot);
  }

  function hideOriginalControl(control) {
    if (!control || control.classList.contains('lw-hud-source')) return;
    control.classList.add('lw-hud-source');
    control.setAttribute('aria-hidden', 'true');
    control.tabIndex = -1;
  }

  function syncUtilityButtons(topRight, controls) {
    const settings = topRight.querySelector('.lw-hud-settings');
    controls.forEach(({ key, label, icon, selector }) => {
      let button = topRight.querySelector(`[data-hud-proxy="${key}"]`);
      if (!button) {
        button = document.createElement('button');
        button.type = 'button';
        button.className = 'lw-hud-utility-button';
        button.dataset.hudProxy = key;
        button.append(makeHudIcon(icon));
        button.addEventListener('click', () => document.querySelector(selector)?.click());
      }
      const source = document.querySelector(selector);
      const currentLabel = source?.title || label;
      const currentIcon = key === 'pause' && /weiter|resume/i.test(currentLabel)
        ? 'play'
        : key === 'sound' && /unmute|einschalten/i.test(currentLabel)
          ? 'soundOff'
          : icon;
      if (button.title !== currentLabel) button.title = currentLabel;
      if (button.getAttribute('aria-label') !== currentLabel) {
        button.setAttribute('aria-label', currentLabel);
      }
      if (source?.id) button.setAttribute('aria-controls', source.id);
      else button.removeAttribute('aria-controls');
      button.setAttribute('aria-pressed', String(currentIcon === 'play' || currentIcon === 'soundOff'));
      const iconElement = button.querySelector('svg');
      if (iconElement) iconElement.innerHTML = HUD_ICONS[currentIcon];
      if (button.parentElement !== topRight) topRight.insertBefore(button, settings || null);
    });
  }

  function prepareChatPanel(panel) {
    if (!panel || panel.dataset.hudPrepared === 'true') return;
    panel.dataset.hudPrepared = 'true';
    panel.hidden = true;
    const name = panel.querySelector('.lw-multiplayer-name-row');
    const character = panel.querySelector('.lw-multiplayer-character-row');
    const profile = document.querySelector('.lw-profile-slot');
    if (profile && name) profile.append(name);
    if (profile && character) profile.append(character);
    const serverSettings = panel.querySelector('.lw-multiplayer-settings');
    const settingsSlot = document.querySelector('.lw-settings-slot');
    if (settingsSlot && serverSettings) settingsSlot.append(serverSettings);

    const header = panel.querySelector('.lw-multiplayer-header');
    const heading = header?.querySelector('span:first-child');
    if (heading) {
      heading.textContent = 'Öffentlicher Chat';
      heading.lang = 'de';
      heading.dir = 'ltr';
    }
    if (header && !header.querySelector('.lw-chat-close')) {
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'lw-chat-close';
      close.setAttribute('aria-label', 'Chat schließen');
      close.title = 'Chat schließen';
      close.append(makeHudIcon('close'));
      close.addEventListener('click', () => {
        setPublicChatOpen(panel, false);
      });
      header.append(close);
    }

    const mic = panel.querySelector('.lw-voice-toggle');
    if (mic) mic.replaceChildren(makeHudIcon('mic'));
    const nameLabel = name?.querySelector('span');
    if (nameLabel) {
      nameLabel.lang = 'de';
      nameLabel.dir = 'ltr';
    }
    const characterLabel = character?.querySelector('span');
    if (characterLabel) {
      characterLabel.lang = 'ar';
      characterLabel.dir = 'rtl';
    }
    if (character) {
      character.lang = 'ar';
      character.dir = 'rtl';
      const characterSelect = character.querySelector('select');
      if (characterSelect) {
        characterSelect.lang = 'ar';
        characterSelect.dir = 'rtl';
      }
    }
    const tabs = panel.querySelectorAll('.lw-chat-tabs button');
    if (tabs.length >= 2) {
      tabs[0].textContent = 'Alle';
      tabs[0].lang = 'de';
      tabs[0].dir = 'ltr';
      tabs[1].textContent = 'In der Nähe';
      tabs[1].lang = 'de';
      tabs[1].dir = 'ltr';
    }
    panel.dir = 'ltr';
    panel.lang = 'de';
    panel.querySelectorAll('.lw-multiplayer-name-row,.lw-multiplayer-compose,.lw-multiplayer-settings').forEach((element) => {
      element.dir = 'ltr';
    });
    const composeInput = panel.querySelector('.lw-multiplayer-compose input');
    if (composeInput) {
      composeInput.lang = 'de';
      composeInput.dir = 'ltr';
    }
  }

  function prepareMapPanel(panel) {
    if (!panel) return;
    panel.classList.add('lw-hud-map');
    const toggle = panel.querySelector('.lw-city-map-toggle');
    if (!panel.dataset.hudCollapsedByDefault) {
      panel.classList.add('is-collapsed');
      panel.querySelector('.lw-city-map-body')?.setAttribute('hidden', '');
      toggle?.setAttribute('aria-expanded', 'false');
      panel.dataset.hudCollapsedByDefault = 'true';
    }
    if (toggle && !toggle.dataset.hudProxy) {
      toggle.dataset.hudProxy = 'true';
      toggle.textContent = '';
      toggle.append(makeHudIcon('map'));
      toggle.addEventListener('click', () => {
        if (!panel.classList.contains('is-collapsed')) closeMenu();
      });
    }
  }

  function syncHudLayout() {
    if (!document.getElementById('de-top-hud') || !document.querySelector('.lw-hud-settings')) return;
    const root = ensureHudRoot();
    const status = root.querySelector('.lw-hud-status');
    const topRight = root.querySelector('.lw-hud-top-right');
    const chips = root.querySelector('.lw-hud-chips');
    const dock = root.querySelector('.lw-hud-dock');
    const hud = document.getElementById('de-top-hud');
    const stats = hud.querySelector('.de-hud-stats');
    const lifeHud = document.getElementById('de-life-top-hud');
    const lifeStats = lifeHud?.querySelector('.de-life-stats');
    const settings = document.querySelector('.lw-hud-settings');
    ensureMenuSections(settings);
    if (settings.parentElement !== topRight) topRight.append(settings);

    const home = document.querySelector('.home-button');
    const tutorial = document.querySelector('.tutorial-toggle-btn');
    const mute = document.querySelector('.mute-button');
    const pause = document.querySelector('.pause-btn');
    [home, tutorial, mute, pause].forEach(hideOriginalControl);
    syncUtilityButtons(topRight, [
      { key: 'help', label: 'Hilfe', icon: 'help', selector: '.tutorial-toggle-btn' },
      { key: 'sound', label: 'Ton', icon: 'sound', selector: '.mute-button' },
      { key: 'pause', label: 'Pause', icon: 'pause', selector: '.pause-btn' }
    ]);
    if (stats && stats.parentElement !== status) status.append(stats);
    if (lifeStats) {
      const statsTarget = window.matchMedia('(max-width: 720px)').matches
        ? settings.querySelector('.lw-settings-mobile-stats')
        : chips;
      if (statsTarget && lifeStats.parentElement !== statsTarget) statsTarget.append(lifeStats);
      lifeStats.hidden = false;
      lifeStats.querySelector('.de-life-stat.energy')?.classList.add('lw-energy-original');
    }
    if (lifeHud && lifeHud.parentElement !== root) root.append(lifeHud);
    if (hud) {
      const actions = hud.querySelector('.de-hud-actions');
      actions?.querySelectorAll('.de-hud-btn').forEach((button) => {
        if (button.parentElement !== dock) dock.insertBefore(button, root.querySelector('.lw-dock-chat'));
      });
      hud.hidden = true;
    }
    const menuButton = settings.querySelector('.lw-settings-toggle');
    if (menuButton) {
      if (menuButton.title !== 'Menü öffnen') menuButton.title = 'Menü öffnen';
      menuButton.setAttribute('aria-label', 'Menü öffnen');
      menuButton.setAttribute('aria-haspopup', 'true');
      if (!menuButton.dataset.hudMenuState) {
        menuButton.dataset.hudMenuState = 'true';
        menuButton.addEventListener('click', () => {
          document.body.classList.toggle('hud-menu-open', menuButton.getAttribute('aria-expanded') === 'true');
        });
      }
    }
    if (settings.parentElement !== topRight) topRight.append(settings);

    const energyValue = root.querySelector('.lw-energy-warning-value');
    const value = document.getElementById('de-life-energy-val')?.textContent || '';
    if (energyValue && energyValue.textContent !== value) energyValue.textContent = value;
    const menuEnergyValue = root.querySelector('.lw-menu-energy-value');
    if (menuEnergyValue && menuEnergyValue.textContent !== value) menuEnergyValue.textContent = value;
    const energyPercent = Number.parseFloat(value);
    root.classList.toggle('has-low-energy', Number.isFinite(energyPercent) && energyPercent < 30);

    const quest = document.getElementById('de-quest-hud');
    if (quest && quest.parentElement !== root) root.append(quest);
    const questProgress = quest?.dataset.completedCount || null;
    if (questProgress && lastQuestProgress !== null && questProgress !== lastQuestProgress) {
      window.dispatchEvent(new Event('lw-hud-important'));
    }
    lastQuestProgress = questProgress;
    const dialogue = document.getElementById('de-world-dialogue-btn');
    const dialogueSlot = document.querySelector('.lw-menu-npc-slot');
    if (dialogue && dialogueSlot && dialogue.parentElement !== dialogueSlot) dialogueSlot.append(dialogue);
    const beacon = document.getElementById('de-npc-world-beacon');
    const nearbySlot = document.querySelector('.lw-menu-nearby-slot');
    if (beacon && nearbySlot && beacon.parentElement !== nearbySlot) nearbySlot.append(beacon);
    const map = document.querySelector('.lw-city-map');
    if (map && map.parentElement !== root) root.append(map);
    prepareMapPanel(map);
    const chat = document.querySelector('.lw-multiplayer-panel');
    if (chat && chat.parentElement !== root) root.append(chat);
    prepareChatPanel(chat);

    if (!hudLayoutReady) {
      hudLayoutReady = true;
      root.classList.add('is-ready');
      setupIdleFade();
      setupFocusMode();
      setupUnreadTracking(chat);
    }
  }

  function closeMenu() {
    const settings = document.querySelector('.lw-hud-settings');
    const popover = settings?.querySelector('.lw-settings-popover');
    const toggle = settings?.querySelector('.lw-settings-toggle');
    if (!settings || !popover) return;
    if (popover.hidden) {
      document.body.classList.remove('hud-menu-open');
      return;
    }
    popover.hidden = true;
    settings.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('hud-menu-open');
  }

  // Keep the dock affordance in sync without changing transcript or network state.
  function setPublicChatOpen(panel, open) {
    panel.hidden = !open;
    document.body.classList.toggle('lw-public-chat-open', open);
    const button = hudRoot?.querySelector('.lw-dock-chat');
    if (button) {
      button.classList.toggle('is-active', open);
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Chat schließen' : 'Chat öffnen');
      button.title = open ? 'Chat schließen' : 'Chat öffnen';
    }
  }

  function setupIdleFade() {
    const reset = () => {
      hudRoot?.classList.remove('is-idle');
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => hudRoot?.classList.add('is-idle'), 5000);
    };
    ['pointermove', 'keydown'].forEach((type) => window.addEventListener(type, reset, { passive: true }));
    window.addEventListener('lw-hud-important', reset);
    reset();
  }

  function setupFocusMode() {
    window.addEventListener('keydown', (event) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key !== 'Tab' && event.key.toLowerCase() !== 'z') return;
      event.preventDefault();
      document.body.classList.toggle('hud-focus');
      const hint = hudRoot?.querySelector('.lw-hud-focus-hint');
      if (hint) {
        hint.hidden = false;
        window.clearTimeout(focusHintTimer);
        focusHintTimer = window.setTimeout(() => { hint.hidden = true; }, 2000);
      }
    });
  }

  function setupUnreadTracking(panel) {
    if (!panel || unreadListenerReady) return;
    unreadListenerReady = true;
    window.addEventListener('lw-chat-message', () => {
      if (!document.querySelector('.lw-multiplayer-panel')?.hidden) return;
      unreadCount += 1;
      const badge = hudRoot?.querySelector('.lw-chat-unread');
      if (badge) {
        badge.hidden = false;
        badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
      }
      window.dispatchEvent(new Event('lw-hud-important'));
    });
  }

  function syncHud() {
    hudObserver?.disconnect();
    titleObserver?.disconnect();
    syncHudBody();
    hudObserver?.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-completed-count']
    });
    titleObserver?.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ['title']
    });
  }

  function syncHudBody() {
    const controls = [
      document.querySelector('.home-button'),
      document.querySelector('.pause-btn'),
      document.querySelector('.mute-button'),
      document.querySelector('.tutorial-toggle-btn'),
      document.querySelector('.switch-button'),
      document.querySelector('.de-world-npc-beacon'),
      ...document.querySelectorAll('.de-hud-btn'),
      ...document.querySelectorAll('.lw-settings-toggle, .lw-city-map-action, .lw-city-map-toggle')
    ];
    controls.forEach(syncButtonLabel);

    const interact = document.querySelector('.switch-button');
    if (interact && !interact.hasAttribute('title')) {
      interact.title = 'Interact';
      interact.setAttribute('aria-label', 'Interact');
    }

    const dialogue = document.getElementById('de-world-dialogue-btn');
    if (dialogue && !dialogue.hasAttribute('title')) dialogue.title = dialogue.getAttribute('aria-label') || 'Talk with an NPC';
    const toast = document.querySelector('.de-toast, .de-object-word-toast');
    if (toast && toast !== lastHudToast) {
      lastHudToast = toast;
      window.dispatchEvent(new Event('lw-hud-important'));
    } else if (!toast) {
      lastHudToast = null;
    }
    updateXpProgress();
    syncHudLayout();
    setupUnreadTracking(document.querySelector('.lw-multiplayer-panel'));
  }

  function closeHudPopovers() {
    const settings = document.querySelector('.lw-hud-settings');
    const popover = settings?.querySelector('.lw-settings-popover');
    const toggle = settings?.querySelector('.lw-settings-toggle');
    if (popover) popover.hidden = true;
    settings?.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('hud-menu-open');

    const chat = document.querySelector('.lw-multiplayer-panel');
    if (chat && !chat.hidden) {
      setPublicChatOpen(chat, false);
    }

    const map = document.querySelector('.lw-city-map.is-enlarged');
    if (map) {
      map.classList.remove('is-enlarged');
      document.body.classList.remove('map-overlay-open');
      map.querySelector('.lw-city-map-enlarge-toggle')?.setAttribute('aria-pressed', 'false');
    }
    const openMap = document.querySelector('.lw-city-map:not(.is-collapsed)');
    openMap?.querySelector('.lw-city-map-toggle')?.click();
  }

  window.addEventListener('keydown', (event) => {
    if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (event.key === 'Escape') {
      closeHudPopovers();
      return;
    }
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    if (document.body.classList.contains('npc-dialog-open')) return;

    const key = event.key.toLowerCase();
    const targets = {
      h: '.lw-menu-actions [aria-label="Hilfe"]',
      m: '.lw-menu-actions [aria-label="Stadtkarte"]',
      p: '.lw-menu-actions [aria-label="Pause"]',
      t: '.lw-dock-chat'
    };
    const target = targets[key] && document.querySelector(targets[key]);
    if (!target) return;
    event.preventDefault();
    target.click();
  });

  document.addEventListener('click', (event) => {
    const settings = document.querySelector('.lw-hud-settings');
    const popover = settings?.querySelector('.lw-settings-popover');
    if (popover && !popover.hidden && !settings.contains(event.target)) closeMenu();
  });

  window.addEventListener('german-npc-chat-state', (event) => {
    document.body.classList.toggle('npc-dialog-open', Boolean(event.detail && event.detail.open));
    window.dispatchEvent(new Event('lw-hud-important'));
  });

  const scheduleSync = () => {
    if (syncScheduled) return;
    syncScheduled = true;
    window.requestAnimationFrame(() => {
      syncScheduled = false;
      syncHud();
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleSync, { once: true });
  } else {
    scheduleSync();
  }

  hudObserver = new MutationObserver(scheduleSync);
  hudObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-completed-count']
  });
  titleObserver = new MutationObserver(scheduleSync);
  titleObserver.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['title'] });
})();

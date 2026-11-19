(function () {
  'use strict';

  const UI_TEXT = new Map(Object.entries({
    'Games': 'Spiele',
    'Go Back': 'Zurück',
    'Mute Sound': 'Ton stumm schalten',
    'Choose Your Game': 'Wähle ein Spiel',
    'Pick a game and start practicing': 'Wähle ein Spiel und starte deine Übung.',
    'Where Is It?': 'Wo ist es?',
    'Search the 3D worlds and click on the object matching the target word.': 'Erkunde 3D-Welten und finde den Gegenstand zum deutschen Wort.',
    'Run Forrest Run': 'Lauf, Forrest, lauf!',
    'Word Builder': 'Wortbau',
    'Sentence Maker': 'Satzbau',
    'Arrange words in the correct syntax and construct perfect sentences.': 'Ordne die Wörter und bilde korrekte Sätze.',
    'Falling Words': 'Wörterregen',
    'Hear & Match': 'Hören und Zuordnen',
    'Listen to spoken words and match them to the correct picture.': 'Höre das Wort und ordne es dem passenden Bild zu.',
    'Balloon Pop': 'Ballons platzen lassen',
    '3D Scavenger Hunt': '3D-Schnitzeljagd',
    'Pick a place to explore and find the target objects': 'Wähle einen Ort und finde die gesuchten Gegenstände.',
    'City': 'Stadt',
    'House': 'Haus',
    'Classroom': 'Klassenzimmer',
    'Restaurant': 'Restaurant',
    'Supermarket': 'Supermarkt',
    'Streets, vehicles & buildings': 'Straßen, Fahrzeuge und Gebäude',
    'House Rooms, appliances & furniture': 'Räume, Geräte und Möbel',
    'Desks, stationery & school items': 'Tische, Schreibwaren und Schulsachen',
    'Food, drinks & dining areas': 'Speisen, Getränke und Sitzbereiche',
    'Groceries, snacks & items': 'Lebensmittel, Snacks und Produkte',
    'Start Search →': 'Suche starten →',
    'Find Object (': 'Finde das Objekt (',
    'Tap the matching 3D object': 'Finde den passenden Gegenstand in der 3D-Welt.',
    'Click the matching 3D object': 'Finde den passenden Gegenstand in der 3D-Welt.',
    'Need a hint?': 'Bedeutung anzeigen',
    'Correct! Now find the object in 3D.': 'Richtig! Finde jetzt den Gegenstand in der 3D-Welt.',
    'Not this one. Try another option!': 'Das ist es nicht. Versuch es noch einmal!',
    'Select the correct English translation.': 'Wähle die passende Übersetzung.',
    'Word Hint': 'Wort-Hilfe',
    'What is the English meaning?': 'Was bedeutet dieses Wort?',
    'Completed!': 'Geschafft!',
    'Play Again': 'Noch einmal spielen',
    'Choose Another Level': 'Anderen Ort wählen',
    'Exit to Level Select': 'Zur Ortsauswahl',
    'Pause': 'Pause',
    'Resume': 'Weiter spielen',
    'How to Play': 'Spielanleitung',
    'Close': 'Schließen',
    'Home': 'Startseite',
    'Use': 'Benutze',
    'to move,': 'zum Bewegen,',
    'to run': 'zum Rennen',
    'Left-click': 'Linksklick',
    'on the screen to lock and control the camera': 'auf den Bildschirm, um die Kamera zu aktivieren',
    'Move mouse': 'Bewege die Maus',
    'to look around': 'um dich umzusehen',
    'While the camera is locked,': 'Bei aktivierter Kamera',
    'on objects to learn their names': 'auf Objekte, um ihre Namen zu lernen',
    'Press': 'Drücke',
    'to free the cursor': 'um den Mauszeiger freizugeben',
    'Interact': 'Interagieren',
    'Talk': 'Sprechen',
    'Enter': 'Betreten',
    'Settings': 'Einstellungen',
    'Beginner': 'Anfänger',
    'Explain in': 'Erklären auf',
    'Review words': 'Wörter wiederholen',
    'German learning activities': 'Deutsch lernen',
    'أنشطة تعلم الألمانية': 'Deutsch lernen',
    'مبتدئ': 'Anfänger',
    'بدء محادثة ألمانية تفاعلية': 'Deutsches Gespräch starten',
    'تحدي أدوات التعريف': 'Artikel-Quiz',
    'راجع المفردات': 'Wörter wiederholen',
    'تحدث مع ماكس بيكر': 'Sprich mit Max Becker',
    'Speak with Max Becker': 'Sprich mit Max Becker'
  }));

  const WORLD_NAMES = {
    city: 'Stadt',
    house: 'Haus',
    classroom: 'Klassenzimmer',
    restaurant: 'Restaurant',
    supermarket: 'Supermarkt'
  };

  function getSupportLanguage() {
    return window.GermanEngine?.getSupportLanguage?.() ||
      (['ar', 'en'].includes(localStorage.getItem('lw_support_language'))
        ? localStorage.getItem('lw_support_language')
        : 'de');
  }

  function getGermanWord(english) {
    const vocab = window.GermanEngine?.GERMAN_VOCAB || {};
    const key = String(english || '').toLowerCase().trim();
    return vocab[key]?.de || english;
  }

  const EXACT_TEXT = new Map(Object.entries({
    '0/10 words discovered.': '0/10 Wörter entdeckt.',
    'Explore levels and learn at least 10 words to unlock this.': 'Erkunde Orte und lerne mindestens 10 Wörter, um dieses Spiel freizuschalten.',
    '1/10 words discovered.': '1/10 Wörter entdeckt.',
    '2/10 words discovered.': '2/10 Wörter entdeckt.',
    '3/10 words discovered.': '3/10 Wörter entdeckt.',
    '4/10 words discovered.': '4/10 Wörter entdeckt.',
    '5/10 words discovered.': '5/10 Wörter entdeckt.',
    '6/10 words discovered.': '6/10 Wörter entdeckt.',
    '7/10 words discovered.': '7/10 Wörter entdeckt.',
    '8/10 words discovered.': '8/10 Wörter entdeckt.',
    '9/10 words discovered.': '9/10 Wörter entdeckt.',
    '10/10 words discovered.': '10/10 Wörter entdeckt.'
  }));

  function localizeText(value) {
    const text = value.trim();
    if (UI_TEXT.has(text)) return UI_TEXT.get(text);
    if (EXACT_TEXT.has(text)) return EXACT_TEXT.get(text);

    let match = text.match(/^Find Object \((.*)$/);
    if (match) return `Finde das Objekt (${match[1]}`;

    match = text.match(/^Correct! Found "(.+)"$/);
    if (match) return `Richtig! Gefunden: ${getGermanWord(match[1])}`;

    match = text.match(/^That's "(.+)"\. Try again!?$/);
    if (match) return `Das ist ${getGermanWord(match[1])}. Versuch es erneut!`;

    match = text.match(/^You found all 10 objects in (.+)\.$/);
    if (match) {
      const world = WORLD_NAMES[match[1].toLowerCase()] || match[1];
      return `Du hast alle 10 Gegenstände in ${world} gefunden.`;
    }

    match = text.match(/^(\d+\/10) words discovered\.$/);
    if (match) return `${match[1]} Wörter entdeckt.`;

    match = text.match(/^Explore levels and learn at least 10 words to unlock this\.$/);
    if (match) return 'Erkunde Orte und lerne mindestens 10 Wörter, um dieses Spiel freizuschalten.';

    if (text === 'Correct! Found all objects!') return 'Richtig! Alle Gegenstände gefunden!';
    if (text === 'Not quite! Try again.') return 'Noch nicht. Versuch es erneut!';
    return null;
  }

  function translateTextNode(node) {
    const parent = node.parentElement;
    if (!parent || parent.closest('script, style, #game-translation-dialog, select, .lw-game-layer, [data-lw-no-translate]')) return;
    const original = node.nodeValue;
    const translated = localizeText(original);
    if (translated) {
      node.nodeValue = original.replace(original.trim(), translated);
      return;
    }

    let replaced = original;
    Object.entries(DOM_REPLACEMENTS).forEach(([from, to]) => {
      replaced = replaced.split(from).join(to);
    });
    if (replaced !== original) node.nodeValue = replaced;
  }

  function translateAttributes(root) {
    const nodes = [root, ...root.querySelectorAll('[title], [aria-label], [alt]')];
    nodes.forEach((element) => {
      if (element.closest?.('.lw-game-layer, [data-lw-no-translate]')) return;
      ['title', 'aria-label', 'alt'].forEach((attribute) => {
        const value = element.getAttribute?.(attribute);
        const translated = value && localizeText(value);
        if (translated) element.setAttribute(attribute, translated);
      });
    });
  }

  const DOM_REPLACEMENTS = {
    'Play now': 'Jetzt spielen',
    'Play now →': 'Jetzt spielen →',
    '3D Hunt': '3D-Schnitzeljagd',
    'Reflexes': 'Reaktionsspiel',
    'Spelling': 'Wortbau',
    'Syntax': 'Syntax',
    'Listening': 'Hören und Zuordnen',
    'Speed': 'Geschwindigkeit',
    'Go Back': 'Zurück',
    'Mute Sound': 'Ton stumm schalten'
  };

  let translationObserver = null;

  function translatePage() {
    if (!window.location.pathname.startsWith('/games') && !window.location.pathname.startsWith('/levels/')) return;
    translationObserver?.disconnect();
    document.documentElement.lang = 'de';

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) translateTextNode(node);

    translateAttributes(document.body);
    installWordTranslationButton();
    translatePageTitle();
    translationObserver?.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function translatePageTitle() {
    const route = window.location.pathname;
    if (route.includes('/games/whereisit/play/')) {
      const level = route.split('/').pop();
      document.title = `Wo ist es? - ${WORLD_NAMES[level] || 'Spielwelt'} | LinguaWorld`;
    } else if (route.includes('/games/whereisit')) {
      document.title = 'Wo ist es? | LinguaWorld';
    }

    const rootTitle = document.querySelector('title');
    if (rootTitle && rootTitle.textContent && /Learn German|Learn Languages/.test(rootTitle.textContent)) {
      rootTitle.textContent = 'LinguaWorld | Deutsch lernen';
    }
  }

  function getTargetWord() {
    const counter = [...document.querySelectorAll('.app-container span')]
      .find((element) => /^(Finde das Objekt|Find Object) \(/.test(element.textContent.trim()));
    const row = counter?.parentElement?.children[1];
    return row?.querySelector(':scope > div')?.textContent.trim() || '';
  }

  function lookupWord(germanWord) {
    const vocab = Object.values(window.GermanEngine?.GERMAN_VOCAB || {});
    const normalized = germanWord.toLowerCase().trim();
    return vocab.find((item) => item.de?.toLowerCase().trim() === normalized);
  }

  function closeTranslationDialog() {
    document.getElementById('game-translation-dialog')?.remove();
  }

  function openTranslationDialog() {
    closeTranslationDialog();
    const word = getTargetWord();
    const item = lookupWord(word);
    const overlay = document.createElement('div');
    overlay.id = 'game-translation-dialog';
    overlay.className = 'game-translation-overlay';
    overlay.innerHTML = `
      <section class="game-translation-panel" role="dialog" aria-modal="true" aria-labelledby="game-translation-title">
        <button class="game-translation-close" type="button" aria-label="Schließen">×</button>
        <p class="game-translation-eyebrow">Wort-Hilfe</p>
        <h2 id="game-translation-title"></h2>
        <label for="game-translation-language">Übersetzen nach</label>
        <select id="game-translation-language">
          <option value="de">Deutsch (keine Übersetzung)</option>
          <option value="ar">العربية</option>
          <option value="en">English</option>
        </select>
        <p class="game-translation-result" aria-live="polite"></p>
      </section>`;

    const wordHeading = overlay.querySelector('#game-translation-title');
    const result = overlay.querySelector('.game-translation-result');
    const languageSelect = overlay.querySelector('#game-translation-language');
    wordHeading.textContent = word || 'Wort';
    languageSelect.value = getSupportLanguage();

    const updateTranslation = () => {
      const language = languageSelect.value;
      result.lang = language;
      result.dir = language === 'ar' ? 'rtl' : 'ltr';
      result.textContent = language === 'de'
        ? 'Wähle Arabisch oder Englisch, wenn du eine Übersetzung brauchst.'
        : item?.[language] || 'Für dieses Wort ist noch keine Übersetzung verfügbar.';
      window.GermanEngine?.setSupportLanguage?.(language);
    };

    languageSelect.addEventListener('change', updateTranslation);
    overlay.querySelector('.game-translation-close').addEventListener('click', closeTranslationDialog);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeTranslationDialog();
    });
    document.addEventListener('keydown', onEscape, { once: true });
    function onEscape(event) {
      if (event.key === 'Escape') closeTranslationDialog();
    }

    updateTranslation();
    document.body.append(overlay);
    overlay.querySelector('.game-translation-close').focus();
  }

  function installWordTranslationButton() {
    const word = getTargetWord();
    if (!word) return;
    const row = [...document.querySelectorAll('.app-container span')]
      .find((element) => /^(Finde das Objekt|Find Object) \(/.test(element.textContent.trim()))
      ?.parentElement?.children[1];
    if (!row || row.querySelector('.game-translation-button')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'game-translation-button';
    button.textContent = 'Übersetzen';
    button.title = 'Bedeutung des deutschen Wortes anzeigen';
    button.setAttribute('aria-label', button.title);
    button.addEventListener('pointerdown', (event) => event.stopPropagation());
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      openTranslationDialog();
    });
    row.append(button);
  }

  function interceptLegacyHint(event) {
    const hint = event.target.closest?.('.wit-hint-btn');
    if (!hint) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openTranslationDialog();
  }

  function init() {
    if (!window.location.pathname.startsWith('/games') && !window.location.pathname.startsWith('/levels/')) return;
    document.addEventListener('click', interceptLegacyHint, true);

    let retryCount = 0;
    const retryLocalization = () => {
      translatePage();
      retryCount += 1;
      if (retryCount < 12) {
        setTimeout(retryLocalization, 500);
      }
    };

    retryLocalization();
    translationObserver = new MutationObserver((records) => {
      const hasPageChanges = records.some(({ target }) => {
        const element = target instanceof Element ? target : target.parentElement;
        return !element?.closest('.lw-city-map, .lw-game-layer, [data-lw-no-translate]');
      });
      if (hasPageChanges) translatePage();
    });
    translationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
    window.addEventListener('popstate', translatePage);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
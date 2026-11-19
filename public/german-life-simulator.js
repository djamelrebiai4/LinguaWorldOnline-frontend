/**
 * ============================================================
 * German Life Simulator (Deutsches Lebens-Simulations-System)
 * NPCs, Personalities, Friendships, Jobs, Real Estate & Daily Life
 * ============================================================
 */

(function () {
  'use strict';

  // 1. Life State & Persistence
  const LifeState = {
    money: parseInt(localStorage.getItem('de_life_money') || '350', 10),
    energy: parseInt(localStorage.getItem('de_life_energy') || '100', 10),
    timeOfDay: 'Nachmittag',
    properties: JSON.parse(localStorage.getItem('de_life_properties') || '[]'),
    inventory: JSON.parse(localStorage.getItem('de_life_inventory') || '["Kaffee ☕", "Buch 📖"]'),
    activeNpcKey: null,

    save() {
      localStorage.setItem('de_life_money', this.money.toString());
      localStorage.setItem('de_life_energy', this.energy.toString());
      localStorage.setItem('de_life_time', this.timeOfDay);
      localStorage.setItem('de_life_properties', JSON.stringify(this.properties));
      localStorage.setItem('de_life_inventory', JSON.stringify(this.inventory));
      this.updateHUD();
    },

    addMoney(amount, reason) {
      this.money += amount;
      this.save();
      if (window.GermanEngine && window.GermanEngine.State) {
        window.GermanEngine.State.addXP(Math.round(amount / 2), reason);
      }
      playSFX('Correct');
      showToast(`💶 +${amount} €: ${reason}`);
    },

    spendMoney(amount, reason) {
      if (this.money < amount) {
        showToast(`⚠️ Dein Guthaben reicht nicht. Du brauchst ${amount} €.`);
        playSFX('Wrong');
        return false;
      }
      this.money -= amount;
      this.save();
      showToast(`💸 ${amount} € bezahlt: ${reason}`);
      playSFX('DoorOpen');
      return true;
    },

    useEnergy(amount) {
      this.energy = Math.max(0, this.energy - amount);
      this.save();
    },

    restoreEnergy() {
      this.energy = 100;
      this.save();
      playSFX('LessonComplete');
      showToast('⚡ Deine Energie ist nach der Ruhepause wieder vollständig hergestellt!');
    },

    updateHUD() {
      const moneyEl = document.getElementById('de-life-money-val');
      if (moneyEl) moneyEl.textContent = `${this.money} €`;
      const energyEl = document.getElementById('de-life-energy-val');
      if (energyEl) energyEl.textContent = `${this.energy}%`;
      const timeEl = document.getElementById('de-life-time-val');
      if (timeEl) timeEl.textContent = this.timeOfDay;
    }
  };

  function syncTownClock(event) {
    const clock = event.detail || {};
    if (!Number.isFinite(clock.minute_of_day)) return;
    const hour = Math.floor(clock.minute_of_day / 60) % 24;
    const period = hour < 5 ? 'Nacht' : hour < 11 ? 'Morgen' : hour < 14 ? 'Mittag' : hour < 18 ? 'Nachmittag' : hour < 22 ? 'Abend' : 'Nacht';
    LifeState.timeOfDay = `${period} · ${clock.time || `${String(hour).padStart(2, '0')}:${String(clock.minute_of_day % 60).padStart(2, '0')}`}`;
    LifeState.updateHUD();
  }

  window.addEventListener('living-town-ready', syncTownClock);
  window.addEventListener('living-town-clock', syncTownClock);

  // 2. Sound Effects
  function playSFX(name) {
    try {
      const audio = new Audio(`/Sounds/${name}.mp3`);
      audio.volume = 0.45;
      audio.play().catch(() => {});
    } catch(e) {}
  }

  // 3. Toast notifications
  function showToast(message) {
    const old = document.querySelector('.de-toast');
    if (old) old.remove();
    const toast = document.createElement('div');
    toast.className = 'de-toast';
    toast.innerHTML = `<span>🇩🇪</span><span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // 4. Speech Helper
  function speak(text) {
    if (window.GermanEngine && window.GermanEngine.speakGerman) {
      window.GermanEngine.speakGerman(text);
    } else if ('speechSynthesis' in window) {
      const spokenText = String(text ?? '').replace(/\s+/g, ' ').trim();
      if (!spokenText) return;

      const speech = window.speechSynthesis;
      const u = new SpeechSynthesisUtterance(spokenText);
      u.lang = 'de-DE';
      u.rate = 0.9;
      u.pitch = 1;
      u.volume = 0.9;

      const voices = speech.getVoices();
      const germanVoice = voices.find((voice) => voice.lang.toLowerCase() === 'de-de')
        || voices.find((voice) => /^de(?:-|$)/i.test(voice.lang));
      if (germanVoice) u.voice = germanVoice;
      u.onerror = (event) => {
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          console.error('German speech synthesis failed:', event.error);
        }
      };

      speech.cancel();
      speech.speak(u);
    }
  }

  // 5. NPCs with Mentality, Personality, Mood & Friendships
  const NPCS = {
    sophie: {
      id: 'sophie',
      name: 'Sophie Müller',
      role: 'Barista und Studentin',
      world: 'Restaurant',
      avatar: '☕',
      personality: 'Lebensfroh, herzlich und kunstbegeistert',
      mood: 'Glücklich 😊',
      friendship: parseInt(localStorage.getItem('de_npc_sophie_fr') || '30', 10),
      topics: ['Reisen & Kultur', 'Kaffee & Rezepte', 'Literatur'],
      dialogue: {
        greeting: 'Hallo! Schön dich zu sehen! Wie war dein Tag bis jetzt?',
        greeting_ar: 'مرحباً! يسعدني جداً لقاؤك! كيف كان يومك حتى الآن؟',
        responses: [
          {
            de: 'Sehr schön, danke! Ich lerne gerade fleißig Deutsch.',
            ar: 'جميل جداً، شكراً لكِ! أنا أتعلم الألمانية بجد الآن.',
            friendshipBonus: 15,
            reply: 'Das ist wunderbar! Übung macht den Meister! 🌟',
            reply_ar: 'هذا رائع! بالممارسة يولد المعلم المتقن!'
          },
          {
            de: 'Etwas anstrengend, aber ein guter Kaffee bei dir hilft immer!',
            ar: 'مرهق قليلاً، لكن فنجان قهوة جيد من صنعك يساعد دائماً!',
            friendshipBonus: 20,
            reply: 'Aww, vielen Dank! Für dich mache ich den besten Cappuccino der Stadt! ☕',
            reply_ar: 'شكراً جزيلاً! سأعد لك أفضل كابتشينو في المدينة بأسرها!'
          }
        ]
      }
    },
    lukas: {
      id: 'lukas',
      name: 'Lukas Wagner',
      role: 'Architekturstudent',
      world: 'Classroom',
      avatar: '📐',
      personality: 'Ehrgeizig, technikbegeistert und neugierig',
      mood: 'Konzentriert & Begeistert 🤩',
      friendship: parseInt(localStorage.getItem('de_npc_lukas_fr') || '20', 10),
      topics: ['Moderne Architektur', 'Tech & Gaming', 'Zukunftspläne'],
      dialogue: {
        greeting: 'Hey! Schau mal, ich zeichne gerade den Entwurf für ein nachhaltiges Gebäude.',
        greeting_ar: 'مرحباً! انظر، أنا أرسم الآن مخططاً لمبنى صديق للبيئة ومستدام.',
        responses: [
          {
            de: 'Das sieht beeindruckend aus! Wie lange arbeitest du schon daran?',
            ar: 'يبدو تصميماً مبهراً حقاً! كم لك تعمل عليه؟',
            friendshipBonus: 20,
            reply: 'Seit zwei Wochen Tag und Nacht! Dein Lob motiviert mich sehr! 🏛️',
            reply_ar: 'منذ أسبوعين ليلاً ونهاراً! مديحك يحفزني كثيراً!'
          },
          {
            de: 'Gute Architektur macht eine Stadt lebenswert.',
            ar: 'الهندسة المعمارية الجيدة تجعل المدينة مكاناً يستحق العيش فيه.',
            friendshipBonus: 15,
            reply: 'Exakt meine Philosophie! Du verstehst mich wirklich gut.',
            reply_ar: 'هذه فلسفتي بالضبط! أنت تفهمني جيداً حقاً.'
          }
        ]
      }
    },
    herr_weber: {
      id: 'herr_weber',
      name: 'Herr Heinrich Weber',
      role: 'Nachbar und Rentner',
      world: 'House',
      avatar: '👴',
      personality: 'Pünktlich und traditionsbewusst, aber herzlich',
      mood: 'Nachdenklich 🤔',
      friendship: parseInt(localStorage.getItem('de_npc_weber_fr') || '10', 10),
      topics: ['Pünktlichkeit & Ordnung', 'Gartenpflege', 'Geschichte'],
      dialogue: {
        greeting: 'Guten Tag, junger Nachbar. Ist bei Ihnen im Haus alles in bester Ordnung?',
        greeting_ar: 'طاب يومك يا جاري العزيز. هل كل شيء في منزلك على أفضل ما يرام؟',
        responses: [
          {
            de: 'Guten Tag, Herr Weber! Ja, alles ruhig und sauber, vielen Dank der Nachfrage.',
            ar: 'طاب يومك سيد فيبر! نعم، كل شيء هادئ ونظيف، شكراً جزيلاً لسؤالك.',
            friendshipBonus: 25,
            reply: 'Sehr vorbildlich! Ein ruhiger Nachbar ist heutzutage Gold wert. 🤝',
            reply_ar: 'مثالي للغاية! الجار الهادئ هذه الأيام كنز من ذهب.'
          },
          {
            de: 'Ihr Garten sieht heute wieder wunderschön gepflegt aus!',
            ar: 'حديقتك تبدو اليوم معتنى بها وجميلة كالعادة!',
            friendshipBonus: 20,
            reply: 'Oh, bemerken Sie das? Fleiß und Geduld zahlen sich eben aus!',
            reply_ar: 'أوه، هل لاحظت ذلك؟ الاجتهاد والصبر يؤتيان ثمارهما دوماً!'
          }
        ]
      }
    },
    hanna: {
      id: 'hanna',
      name: 'Hanna Schneider',
      role: 'Filialleiterin',
      world: 'Supermarket',
      avatar: '💼',
      personality: 'Strukturiert, effizient und begeistert von frischer Küche',
      mood: 'Etwas gestresst 😤',
      friendship: parseInt(localStorage.getItem('de_npc_hanna_fr') || '15', 10),
      topics: ['Gesunde Ernährung', 'Qualitätsprodukte', 'Business & Logistik'],
      dialogue: {
        greeting: 'Hallo! Wir haben heute frische Bio-Lieferungen bekommen. Suchen Sie etwas Bestimmtes?',
        greeting_ar: 'مرحباً! لقد وصلتنا اليوم شحنات عضوية طازجة. هل تبحث عن شيء معين؟',
        responses: [
          {
            de: 'Ja, ich koche heute Abend und suche frisches Gemüse und Obst.',
            ar: 'نعم، سأطبخ الليلة وأبحث عن خضروات وفواكه طازجة.',
            friendshipBonus: 20,
            reply: 'Hervorragend! Die Bio-Äpfel und der Spinat sind heute erstklassig! 🍎',
            reply_ar: 'ممتاز! التفاح العضوي والسبانخ اليوم من الدرجة الأولى!'
          },
          {
            de: 'Lassen Sie sich nicht zu sehr stressen! Sie machen hier tolle Arbeit.',
            ar: 'لا ترهقي نفسك كثيراً! أنتِ تقومين بعمل رائع هنا.',
            friendshipBonus: 25,
            reply: 'Danke... Das tat wirklich gut zu hören nach so einem langen Arbeitstag. 😊',
            reply_ar: 'شكراً لك... كان سماع ذلك جميلاً ومريحاً حقاً بعد يوم عمل طويل.'
          }
        ]
      }
    },
    max: {
      id: 'max',
      name: 'Max Becker',
      role: 'Fitnesstrainer',
      world: 'City',
      avatar: '🏃',
      personality: 'Sportlich, enthusiastisch und motivierend',
      mood: 'Voller Energie ⚡',
      friendship: parseInt(localStorage.getItem('de_npc_max_fr') || '25', 10),
      topics: ['Fitness & Ausdauer', 'Ernährung', 'Motivation'],
      dialogue: {
        greeting: 'Servus! Bist du heute schon deine zehn Kilometer gelaufen oder mit dem Rad gefahren?',
        greeting_ar: 'مرحباً! هل ركضت اليوم كيلومتراتك العشرة أو قدت دراجتك الهوائية؟',
        responses: [
          {
            de: 'Ich bin die ganze Stadt zu Fuß abgelaufen, um Deutsch zu lernen!',
            ar: 'لقد مشيت في المدينة بأكملها وأنا أتعلم الألمانية!',
            friendshipBonus: 20,
            reply: 'Stark! Geistiges und körperliches Training kombiniert – beste Methode! 💪',
            reply_ar: 'رائع جداً! جمعت بين تدريب العقل والجسد – أفضل طريقة على الإطلاق!'
          },
          {
            de: 'Gleich nachher! Ein gesunder Geist wohnt in einem gesunden Körper.',
            ar: 'سأفعل ذلك بعد قليل! العقل السليم في الجسم السليم.',
            friendshipBonus: 25,
            reply: 'Mens sana in corpore sano! Auf dich ist Verlass, Kumpel!',
            reply_ar: 'العقل السليم في الجسم السليم! يُعتمد عليك يا صديقي!'
          }
        ]
      }
    }
  };

  function getFriendshipStatus(points) {
    if (points >= 90) return 'Bester Freund 💖';
    if (points >= 60) return 'Guter Freund 🤝';
    if (points >= 35) return 'Kumpel ☕';
    if (points >= 15) return 'Bekannter 👤';
    return 'Fremder ⚪';
  }

  // 6. Job Center System
  const JOBS = [
    {
      id: 'job_waiter',
      title: 'Kellner im Restaurant',
      world: 'Restaurant',
      icon: '🍽️',
      desc: 'Bediene Gäste, nimm Bestellungen auf Deutsch auf und erstelle die Rechnung.',
      wage: 80,
      energyCost: 25,
      tasks: [
        'Gast: "Ich hätte gerne ein Schnitzel mit Pommes und eine Cola."',
        'Du antwortest höflich: "Sehr gerne, kommt sofort!"',
        'Rechnung erstellen und Trinkgeld kassieren.'
      ],
      miniGame: [
        {
          customerSays: 'Kann ich bitte die Speisekarte haben?',
          customerSays_ar: 'هل يمكنني الحصول على قائمة الطعام من فضلك؟',
          correct: { de: 'Natürlich! Einen Moment, bitte.', ar: 'بالطبع! لحظة من فضلك.' },
          wrong: { de: 'Nein, das geht nicht.', ar: 'لا، هذا غير ممكن.' }
        },
        {
          customerSays: 'Ich hätte gerne ein Schnitzel mit Pommes, bitte.',
          customerSays_ar: 'أرغب في شنيتزل مع البطاطس المقلية من فضلك.',
          correct: { de: 'Sehr gerne! Kommt sofort.', ar: 'بكل سرور! سيأتي فوراً.' },
          wrong: { de: 'Das haben wir leider nicht.', ar: 'للأسف ليس لدينا هذا.' }
        },
        {
          customerSays: 'Darf ich bitte die Rechnung haben?',
          customerSays_ar: 'هل يمكنني الحصول على الفاتورة من فضلك؟',
          correct: { de: 'Natürlich, einen Moment bitte. Das macht 18 Euro.', ar: 'بالطبع، لحظة من فضلك. المجموع 18 يورو.' },
          wrong: { de: 'Wir machen jetzt Feierabend.', ar: 'انتهى وقت عملنا الآن.' }
        }
      ]
    },
    {
      id: 'job_cashier',
      title: 'Kassierer im Supermarkt',
      world: 'Supermarket',
      icon: '🛒',
      desc: 'Scanne Waren, prüfe Kundenkarten und kassiere auf Deutsch.',
      wage: 75,
      energyCost: 20,
      tasks: [
        'Kunde: "Kann ich mit Karte zahlen?"',
        'Du: "Ja, natürlich. Bitte die Karte auflegen."',
        'Kassenbon aushändigen: "Einen schönen Tag noch!"'
      ],
      miniGame: [
        {
          customerSays: 'Haben Sie eine Kundenkarte?',
          customerSays_ar: 'هل لديك بطاقة ولاء العملاء؟',
          correct: { de: 'Ja, haben Sie eine Kundenkarte dabei?', ar: 'نعم، هل تحمل بطاقة العملاء معك؟' },
          wrong: { de: 'Das ist mir egal.', ar: 'هذا لا يعنيني.' }
        },
        {
          customerSays: 'Kann ich mit Karte zahlen?',
          customerSays_ar: 'هل يمكنني الدفع ببطاقة الائتمان؟',
          correct: { de: 'Ja, natürlich. Bitte die Karte auflegen.', ar: 'نعم، بالطبع. ضع البطاقة على القارئ من فضلك.' },
          wrong: { de: 'Nein, nur Bargeld.', ar: 'لا، نقداً فقط.' }
        },
        {
          customerSays: 'Kann ich bitte eine Tüte haben?',
          customerSays_ar: 'هل يمكنني الحصول على كيس من فضلك؟',
          correct: { de: 'Ja, das kostet 20 Cent. Hier ist Ihre Tüte.', ar: 'نعم، تكلف 20 سنت. هذه كيستك.' },
          wrong: { de: 'Wir haben keine Tüten mehr.', ar: 'لم يتبق لدينا أكياس.' }
        }
      ]
    },
    {
      id: 'job_guide',
      title: 'Stadtführer in der Altstadt',
      world: 'City',
      icon: '🏛️',
      desc: 'Führe eine Reisegruppe und erkläre die Sehenswürdigkeiten auf Deutsch.',
      wage: 110,
      energyCost: 35,
      tasks: [
        'Erkläre den Weg zum Brandenburger Tor und zur Kathedrale.',
        'Beantworte Fragen der Touristen auf Deutsch.',
        'Sorge für gute Stimmung in der Gruppe.'
      ],
      miniGame: [
        {
          customerSays: 'Wie weit ist es zum Brandenburger Tor?',
          customerSays_ar: 'كم المسافة إلى بوابة براندنبورغ؟',
          correct: { de: 'Es sind nur etwa fünf Gehminuten von hier.', ar: 'حوالي خمس دقائق سيراً على الأقدام من هنا.' },
          wrong: { de: 'Das weiß ich auch nicht.', ar: 'لا أعرف أيضاً.' }
        },
        {
          customerSays: 'Wann wurde dieser Platz erbaut?',
          customerSays_ar: 'متى تم بناء هذه الساحة؟',
          correct: { de: 'Diese Sehenswürdigkeit wurde im 18. Jahrhundert erbaut.', ar: 'بني هذا المعلم في القرن الثامن عشر.' },
          wrong: { de: 'Keine Ahnung, ich bin neu hier.', ar: 'لا أعرف، أنا جديد هنا.' }
        },
        {
          customerSays: 'Dürfen wir hier Fotos machen?',
          customerSays_ar: 'هل يُسمح لنا بالتصوير هنا؟',
          correct: { de: 'Ja, natürlich! Das ist ein wunderschönes Fotomotiv.', ar: 'نعم، بالطبع! هذا موضوع تصوير رائع.' },
          wrong: { de: 'Nein, das ist streng verboten.', ar: 'لا، هذا محظور تماماً.' }
        }
      ]
    }
  ];

  // 7. Real Estate & Housing System
  const PROPERTIES = [
    {
      id: 'prop_wg',
      title: 'Zimmer in einer Studenten-WG',
      price: 250,
      icon: '🛏️',
      desc: 'Ein möbliertes Zimmer in einer Wohngemeinschaft in der Nähe der Universität.',
      perks: 'Ein ruhiger Ort zum Ausruhen und Energie tanken.'
    },
    {
      id: 'prop_apartment',
      title: 'Moderne 2-Zimmer-Wohnung',
      price: 950,
      icon: '🏢',
      desc: 'Eine moderne Wohnung mit Balkon und voll ausgestatteter Küche.',
      perks: 'Ein ruhiger Ort, an dem du Freunde zum Kaffee einladen kannst.'
    },
    {
      id: 'prop_house',
      title: 'Einfamilienhaus mit Garten',
      price: 2800,
      icon: '🏡',
      desc: 'Ein geräumiges Haus mit Garten, Grillplatz und mehreren Zimmern.',
      perks: 'Werde Hauseigentümer und veranstalte einen Grillabend mit Freunden.'
    }
  ];

  // 8. Render Life HUD Top/Side Bar
  function renderLifeHUD() {
    if (document.getElementById('de-life-top-hud')) return;

    const hud = document.createElement('div');
    hud.id = 'de-life-top-hud';
    hud.className = 'de-life-hud';
    hud.innerHTML = `
      <div class="de-life-stats">
        <div class="de-life-stat money" title="Kontostand in Euro">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5c-.7-.7-1.6-1-2.8-1-1.5 0-2.5.8-2.5 2s.9 1.8 2.5 2.2 2.5 1 2.5 2.2-1 2.1-2.8 2.1c-1.2 0-2.2-.4-3-1.2M12 5.5v13"/></svg>
          <span id="de-life-money-val">${LifeState.money} €</span>
        </div>
        <div class="de-life-stat energy" title="Energielevel">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z"/></svg>
          <span id="de-life-energy-val">${LifeState.energy}%</span>
        </div>
        <div class="de-life-stat time" title="Tageszeit">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>
          <span id="de-life-time-val">${String(LifeState.timeOfDay).replace(/[☀️🌙]/gu, '').trim()}</span>
        </div>
      </div>
    `;
    document.body.appendChild(hud);

    const settings = document.createElement('div');
    settings.className = 'lw-hud-settings';
    settings.innerHTML = `
      <button class="lw-settings-toggle" type="button" title="Einstellungen" aria-label="Einstellungen" aria-expanded="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.8-.7a7.7 7.7 0 0 1-1.5.9l-.3 1.9h-2.8l-.3-1.9a7.7 7.7 0 0 1-1.5-.9l-1.8.7-1.4-2.4 1.4-1.1a7.3 7.3 0 0 1 0-1.8l-1.4-1.1 1.4-2.4 1.8.7a7.7 7.7 0 0 1 1.5-.9l.3-1.9h2.8l.3 1.9a7.7 7.7 0 0 1 1.5.9l1.8-.7 1.4 2.4-1.4 1.1a7.3 7.3 0 0 1 0 1.8Z" transform="translate(-1 -1)"/></svg>
      </button>
      <section class="lw-settings-popover" aria-label="Einstellungen" hidden>
        <div class="lw-settings-language-slot"></div>
        <div class="lw-settings-mobile-stats"></div>
        <button class="de-life-btn" id="de-open-life-btn" type="button" title="Soziales Leben und Arbeit öffnen">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20h18M5 20V9l7-5 7 5v11M9 20v-6h6v6M8 10h.01M16 10h.01"/></svg>
          <span>Meine Welt</span>
        </button>
      </section>
    `;
    document.body.appendChild(settings);

    const settingsToggle = settings.querySelector('.lw-settings-toggle');
    const settingsPopover = settings.querySelector('.lw-settings-popover');
    const closeSettings = () => {
      settingsPopover.hidden = true;
      settings.classList.remove('is-open');
      settingsToggle.setAttribute('aria-expanded', 'false');
    };
    settingsToggle.addEventListener('click', () => {
      const open = settingsPopover.hidden;
      settingsPopover.hidden = !open;
      settings.classList.toggle('is-open', open);
      settingsToggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (event) => {
      if (!settings.contains(event.target)) closeSettings();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeSettings();
    });

    const languageControl = document.querySelector('.de-language-control');
    if (languageControl) settings.querySelector('.lw-settings-language-slot').appendChild(languageControl);
    const statGroup = hud.querySelector('.de-life-stats');
    const mobileStats = settings.querySelector('.lw-settings-mobile-stats');
    const moneyStat = statGroup.querySelector('.de-life-stat.money');
    const energyStat = statGroup.querySelector('.de-life-stat.energy');
    const timeStat = statGroup.querySelector('.de-life-stat.time');
    const syncMobileStats = () => {
      if (window.matchMedia('(max-width: 720px)').matches) {
        mobileStats.append(moneyStat, energyStat, timeStat);
      } else {
        statGroup.append(moneyStat, energyStat, timeStat);
      }
    };
    syncMobileStats();
    window.addEventListener('resize', syncMobileStats, { passive: true });

    document.getElementById('de-open-life-btn').addEventListener('click', () => {
      openLifeModal('friends');
    });
  }

  // 9. Floating NPC In-World Beacon
  function renderWorldNPCBeacon() {
    const world = (window.location.pathname.toLowerCase().match(/(supermarket|restaurant|city|house|classroom)/) || [])[1];
    if (!world) return;
    if (document.getElementById('de-npc-world-beacon')) return;

    // Find matching NPC for this world
    const worldKey = world.charAt(0).toUpperCase() + world.slice(1);
    const npcKey = Object.keys(NPCS).find(k => NPCS[k].world.toLowerCase() === world.toLowerCase());
    if (!npcKey) return;

    const npc = NPCS[npcKey];
    const supportLanguage = window.GermanEngine && window.GermanEngine.getSupportLanguage
      ? window.GermanEngine.getSupportLanguage()
      : 'de';
    const btn = document.createElement('button');
    btn.id = 'de-npc-world-beacon';
    btn.className = 'de-world-npc-beacon';
    btn.dir = supportLanguage === 'ar' ? 'rtl' : 'ltr';
    btn.setAttribute('aria-label', supportLanguage === 'ar' ? 'فتح محادثة مع الشخصية' : supportLanguage === 'en' ? 'Talk with NPC' : 'Mit einer Person sprechen');
    btn.innerHTML = `
      <span class="de-world-npc-avatar" aria-hidden="true"></span>
      <span>${supportLanguage === 'ar' ? 'تحدث مع' : supportLanguage === 'en' ? 'Talk with' : 'Sprich mit'}</span>
      <bdi lang="en" dir="ltr">${npc.name.split(' ')[0]}</bdi>
    `;
    btn.addEventListener('click', () => {
      if (document.pointerLockElement) document.exitPointerLock();
      openNPCConversation(npcKey);
    });
    document.body.appendChild(btn);
  }

  // 10. Open Life Simulation Modal (Tabs: Friends, Work, Real Estate)
  function openLifeModal(defaultTab = 'friends') {
    const old = document.querySelector('.de-life-modal-overlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.className = 'de-life-modal-overlay';
    overlay.innerHTML = `
      <div class="de-life-modal">
        <div class="de-life-header">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:28px;">🏙️</span>
            <div>
              <div style="font-size:20px; font-weight:900;">Das Leben in Deutschland</div>
              <div style="font-size:13px; color:#94a3b8; font-weight:600;">Freundschaften, Arbeit, Wohnen und Alltag</div>
            </div>
          </div>
          <button class="de-modal-close" style="color:white; background:rgba(255,255,255,0.15);" id="de-life-close-btn">&times;</button>
        </div>

        <div class="de-life-tabs">
          <button class="de-life-tab ${defaultTab === 'friends' ? 'active' : ''}" data-tab="friends">
            <span>👥</span> <span>Freunde & Kontakte</span>
          </button>
          <button class="de-life-tab ${defaultTab === 'work' ? 'active' : ''}" data-tab="work">
            <span>💼</span> <span>Arbeit & Einkommen</span>
          </button>
          <button class="de-life-tab ${defaultTab === 'housing' ? 'active' : ''}" data-tab="housing">
            <span>🏡</span> <span>Wohnen</span>
          </button>
          <button class="de-life-tab ${defaultTab === 'routine' ? 'active' : ''}" data-tab="routine">
            <span>🛌</span> <span>Tagesablauf</span>
          </button>
          <button class="de-life-tab ${defaultTab === 'tagesaufgabe' ? 'active' : ''}" data-tab="tagesaufgabe">
            <span>📅</span> <span>Tagesaufgaben</span>
          </button>
        </div>

        <div class="de-life-content" id="de-life-tab-content">
          <!-- Populated by JS -->
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('de-life-close-btn').addEventListener('click', () => overlay.remove());

    overlay.querySelectorAll('.de-life-tab').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        overlay.querySelectorAll('.de-life-tab').forEach(b => b.classList.remove('active'));
        tabBtn.classList.add('active');
        renderTabContent(tabBtn.getAttribute('data-tab'));
      });
    });

    renderTabContent(defaultTab);
  }

  function renderTabContent(tab) {
    const container = document.getElementById('de-life-tab-content');
    if (!container) return;

    if (tab === 'friends') {
      container.innerHTML = `
        <div style="margin-bottom:16px;">
          <h3 style="margin:0 0 4px; font-size:18px; font-weight:900; color:#0f172a;">Dein Freundeskreis in Deutschland</h3>
          <p style="margin:0; font-size:13px; color:#64748b;">Jede Person hat eine eigene Persönlichkeit und Interessen. Sprich mit ihnen und schließe Freundschaften.</p>
        </div>
        <div class="de-npc-grid">
          ${Object.keys(NPCS).map(key => {
            const npc = NPCS[key];
            const frStatus = getFriendshipStatus(npc.friendship);
            return `
              <div class="de-npc-card">
                <div class="de-npc-card-header">
                  <div class="de-npc-avatar-wrap">
                    <div class="de-npc-avatar">${npc.avatar}</div>
                    <div>
                      <div class="de-npc-name">${npc.name}</div>
                      <div class="de-npc-role">${npc.role}</div>
                    </div>
                  </div>
                  <span class="de-npc-mood-badge">${npc.mood}</span>
                </div>
                <div class="de-npc-personality">💡 <b>Persönlichkeit:</b> ${npc.personality}</div>
                <div>
                  <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; color:#475569;">
                    <span>Freundschaft:</span>
                    <span>${frStatus} (${npc.friendship}/100)</span>
                  </div>
                  <div class="de-npc-friendship-bar">
                    <div class="de-npc-friendship-fill" style="width:${Math.min(100, npc.friendship)}%;"></div>
                  </div>
                </div>
                <button class="de-npc-action-btn" data-npckey="${key}">
                  <span>💬</span> <span>Gespräch beginnen</span>
                </button>
              </div>
            `;
          }).join('')}
        </div>
      `;

      container.querySelectorAll('.de-npc-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-npckey');
          openNPCConversation(key);
        });
      });

    } else if (tab === 'work') {
      container.innerHTML = `
        <div style="margin-bottom:18px;">
          <h3 style="margin:0 0 4px; font-size:18px; font-weight:900; color:#0f172a;">Arbeitsamt und Berufswelt</h3>
          <p style="margin:0; font-size:13px; color:#64748b;">Arbeite, verdiene Euro 💶 und übe Deutsch im Berufsalltag.</p>
        </div>
        <div>
          ${JOBS.map(job => `
            <div class="de-job-card">
              <div style="font-size:36px; padding:10px; background:#f1f5f9; border-radius:18px;">${job.icon}</div>
              <div class="de-job-info" style="flex:1;">
                <h4>${job.title}</h4>
                <p>${job.desc}</p>
                <div style="display:flex; gap:10px; align-items:center;">
                  <span class="de-job-wage">💶 +${job.wage} € / Schicht</span>
                  <span style="font-size:12px; color:#d97706; font-weight:700;">⚡ ${job.energyCost}% Energieverbrauch</span>
                </div>
              </div>
              <button class="de-job-work-btn" data-jobid="${job.id}">
                <span>💼</span> <span>Jetzt arbeiten</span>
              </button>
            </div>
          `).join('')}
        </div>
      `;

      container.querySelectorAll('.de-job-work-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const jobId = btn.getAttribute('data-jobid');
          performJob(jobId);
        });
      });

    } else if (tab === 'housing') {
      container.innerHTML = `
        <div style="margin-bottom:18px;">
          <h3 style="margin:0 0 4px; font-size:18px; font-weight:900; color:#0f172a;">Immobilienmarkt</h3>
          <p style="margin:0; font-size:13px; color:#64748b;">Finde ein Zuhause und richte deine Räume ein.</p>
        </div>
        <div>
          ${PROPERTIES.map(prop => {
            const isOwned = LifeState.properties.includes(prop.id);
            return `
              <div class="de-property-card">
                <div style="font-size:40px; padding:12px; background:#f1f5f9; border-radius:20px;">${prop.icon}</div>
                <div style="flex:1;">
                  <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                    <h4 style="margin:0; font-size:17px; font-weight:900; color:#0f172a;">${prop.title}</h4>
                    ${isOwned ? '<span class="de-property-owned-badge">✓ Dein Zuhause</span>' : ''}
                  </div>
                  <p style="margin:0 0 6px; font-size:13px; color:#64748b;">${prop.desc}</p>
                  <div style="font-size:12px; color:#2563eb; font-weight:700;">✨ ${prop.perks}</div>
                </div>
                <div>
                  ${isOwned ? `
                    <button class="de-life-btn" style="padding:10px 18px; font-weight:800;" disabled>
                      🏡 Dein Zuhause
                    </button>
                  ` : `
                    <button class="de-buy-btn" data-propid="${prop.id}">
                      <span>💶</span> <span>Kaufen (${prop.price} €)</span>
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      container.querySelectorAll('.de-buy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const propId = btn.getAttribute('data-propid');
          buyProperty(propId);
        });
      });

    } else if (tab === 'routine') {
      container.innerHTML = `
        <div style="margin-bottom:18px;">
          <h3 style="margin:0 0 4px; font-size:18px; font-weight:900; color:#0f172a;">Tagesablauf und Erholung</h3>
          <p style="margin:0; font-size:13px; color:#64748b;">Mit Schlaf und Ruhe füllst du deine Energie wieder vollständig auf.</p>
        </div>
        <div style="background:#f8fafc; border-radius:22px; padding:24px; border:1.5px solid #e2e8f0; text-align:center;">
          <div style="font-size:52px; margin-bottom:12px;">🛌</div>
          <h4 style="margin:0 0 8px; font-size:20px; font-weight:900; color:#0f172a;">Schlafen und Ausruhen</h4>
          <p style="font-size:14px; color:#64748b; max-width:400px; margin:0 auto 20px;">
            Bist du nach einem langen Tag müde? Gönn dir eine Pause und tanke neue Energie.
          </p>
          <button class="de-action-btn de-btn-speak" style="margin:0 auto; max-width:260px;" id="de-rest-btn">
            <span>✨</span> <span>Schlafen und Energie vollständig auffüllen</span>
          </button>
        </div>
      `;

      document.getElementById('de-rest-btn').addEventListener('click', () => {
        LifeState.restoreEnergy();
        renderTabContent('routine');
      });
    } else if (tab === 'tagesaufgabe') {
      const today = new Date().toDateString();
      let dailyData = JSON.parse(localStorage.getItem('de_daily_challenge') || '{}');
      if (dailyData.date !== today) {
        dailyData = { date: today, completed: [false, false, false], bonusGiven: false };
        localStorage.setItem('de_daily_challenge', JSON.stringify(dailyData));
      }

      const challenges = [
        { icon: '📚', title: 'Lerne heute 5 neue Wörter', desc: 'Entdecke fünf deutsche Vokabeln.' },
        { icon: '💬', title: 'Führe ein Gespräch', desc: 'Schließe ein vollständiges Gespräch mit einer Person ab.' },
        { icon: '💼', title: 'Arbeite heute', desc: 'Erledige eine Schicht und verdiene Geld.' }
      ];

      const allDone = dailyData.completed.every(Boolean);
      container.innerHTML = `
        <div style="margin-bottom:18px;">
          <h3 style="margin:0 0 4px; font-size:18px; font-weight:900; color:#0f172a;">Tagesaufgaben</h3>
          <p style="margin:0; font-size:13px; color:#64748b;">Schließe alle drei Aufgaben ab und erhalte 200 XP extra!</p>
        </div>
        <div style="background:#fffbeb; border:1.5px solid #fde68a; border-radius:16px; padding:14px 18px; margin-bottom:16px; font-size:13px; font-weight:700; color:#92400e;">
          📅 Heutige Herausforderung: <b>${today}</b>
        </div>
        ${challenges.map((ch, i) => `
          <div class="de-daily-challenge-card">
            <div class="de-challenge-check ${dailyData.completed[i] ? 'done' : ''}" data-idx="${i}" id="de-challenge-check-${i}">
              ${dailyData.completed[i] ? '✓' : ''}
            </div>
            <div style="font-size:28px;">${ch.icon}</div>
            <div style="flex:1;">
              <div style="font-weight:900; font-size:15px; color:#0f172a;">${ch.title}</div>
              <div style="font-size:12px; color:#64748b; font-weight:600;">${ch.desc}</div>
            </div>
            ${dailyData.completed[i] ? '<span style="font-size:11px;font-weight:800;color:#059669;background:#dcfce7;padding:3px 8px;border-radius:10px;">✓ Erledigt</span>' : ''}
          </div>
        `).join('')}
        ${allDone ? `
          <div style="text-align:center; padding:20px; background:linear-gradient(135deg,#f0fdf4,#dcfce7); border-radius:18px; margin-top:12px;">
            <div style="font-size:40px; margin-bottom:8px;">🏆</div>
            <div style="font-weight:900; font-size:16px; color:#059669;">Glückwunsch! Alle Tagesaufgaben erledigt!</div>
            <div style="font-size:13px; color:#15803d; font-weight:700;">+200 XP Tagesbonus</div>
          </div>
        ` : ''}
      `;

      container.querySelectorAll('.de-challenge-check:not(.done)').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          dailyData.completed[idx] = true;
          localStorage.setItem('de_daily_challenge', JSON.stringify(dailyData));
          playSFX('Correct');
          showToast(`✅ Gut gemacht! Aufgabe erledigt: ${challenges[idx].title}`);
          if (dailyData.completed.every(Boolean) && !dailyData.bonusGiven) {
            dailyData.bonusGiven = true;
            localStorage.setItem('de_daily_challenge', JSON.stringify(dailyData));
            if (window.GermanEngine && window.GermanEngine.State) {
              window.GermanEngine.State.addXP(200, 'Alle Tagesaufgaben abgeschlossen');
            }
            showToast('🏆 +200 XP Tagesbonus!');
          }
          renderTabContent('tagesaufgabe');
        });
      });
    }
  }

  // 11. NPC Social Chat Window
  function openNPCConversation(npcKey) {
    const npc = NPCS[npcKey];
    if (!npc) return;

    const old = document.querySelector('.de-dialogue-overlay');
    if (old) {
      if (typeof old.closeNpcConversation === 'function') old.closeNpcConversation();
      else old.remove();
    }

    const language = window.GermanEngine && window.GermanEngine.getSupportLanguage
      ? window.GermanEngine.getSupportLanguage()
      : 'de';
    const copy = language === 'en'
      ? {
        close: 'Close conversation',
        you: 'You',
        listen: 'Listen',
        online: 'Here to chat',
        practiceLabel: 'German practice',
        friendship: 'Friendship',
        hideTranslations: 'Hide translations',
        showTranslations: 'Show translations',
        placeholder: 'Write in German, Arabic, or English…',
        send: 'Send',
        micComingSoon: 'Voice input coming soon',
        enterKey: 'Enter',
        sendHint: 'to send',
        shiftEnterKey: 'Shift+Enter',
        newlineHint: 'for a new line',
        suggestions: 'You could start with',
        privacyBefore: 'Your messages are sent to',
        privacyAfter: 'to generate replies. Do not share personal or confidential information.',
        typing: 'is typing…',
        connectionError: 'Could not reach the AI. Check your connection and try again.',
        serviceBusy: 'The AI service is busy. Please try again shortly.',
        replyTimeout: 'The reply took too long. Try one of the suggestions or send again.',
        notConfigured: 'AI chat has not been configured on the server yet.',
        turnLimit: 'You reached the message limit for this conversation.'
      }
      : language === 'ar'
      ? {
        close: 'إغلاق المحادثة',
        you: 'أنت',
        listen: 'استمع',
        online: 'موجود للدردشة',
        practiceLabel: 'محادثة تدريبية بالألمانية',
        friendship: 'مستوى الصداقة',
        hideTranslations: 'إخفاء الترجمات',
        showTranslations: 'إظهار الترجمات',
        placeholder: 'اكتب بالألمانية أو العربية أو الإنجليزية…',
        send: 'إرسال',
        micComingSoon: 'الإدخال الصوتي قريباً',
        enterKey: 'Enter',
        sendHint: 'للإرسال',
        shiftEnterKey: 'Shift+Enter',
        newlineHint: 'لسطر جديد',
        suggestions: 'يمكنك أن تبدأ بقول',
        privacyBefore: 'تُرسل رسائلك إلى',
        privacyAfter: 'لإنشاء الردود. لا تكتب معلومات شخصية أو سرية.',
        typing: 'يكتب الآن…',
        connectionError: 'تعذر الاتصال بالذكاء الاصطناعي. تحقق من اتصالك وحاول مجددًا.',
        serviceBusy: 'الخدمة مشغولة الآن. حاول مجددًا بعد قليل.',
        replyTimeout: 'تأخر الرد. اختر أحد الاقتراحات أو أعد الإرسال.',
        notConfigured: 'لم تُضبط خدمة الذكاء الاصطناعي على الخادم بعد.',
        turnLimit: 'وصلت إلى الحد الأقصى لعدد الرسائل في هذه المحادثة.'
      }
      : {
        close: 'Gespräch schließen',
        you: 'Du',
        listen: 'Anhören',
        online: 'Für ein Gespräch verfügbar',
        practiceLabel: 'Deutsch üben',
        friendship: 'Freundschaft',
        hideTranslations: 'Übersetzung ausblenden',
        showTranslations: 'Übersetzung anzeigen',
        placeholder: 'Schreibe auf Deutsch …',
        send: 'Senden',
        micComingSoon: 'Spracheingabe folgt bald',
        enterKey: 'Enter',
        sendHint: 'zum Senden',
        shiftEnterKey: 'Shift+Enter',
        newlineHint: 'für einen Zeilenumbruch',
        suggestions: 'Du könntest so anfangen',
        privacyBefore: 'Deine Nachrichten werden an',
        privacyAfter: 'gesendet, um Antworten zu erstellen. Teile keine persönlichen oder vertraulichen Informationen.',
        typing: 'schreibt …',
        connectionError: 'Der KI-Dienst ist nicht erreichbar. Prüfe deine Verbindung und versuche es erneut.',
        serviceBusy: 'Der KI-Dienst ist gerade ausgelastet. Versuch es gleich noch einmal.',
        replyTimeout: 'Die Antwort dauert zu lange. Wähle einen Vorschlag oder sende die Nachricht erneut.',
        notConfigured: 'Der KI-Chat wurde auf dem Server noch nicht eingerichtet.',
        turnLimit: 'Du hast das Nachrichtenlimit für dieses Gespräch erreicht.'
      };

    const showTranslations = language !== 'de' && localStorage.getItem('lw_npc_translations') === 'true';
    const friendshipLabel = getFriendshipStatus(npc.friendship).split(' (')[0];
    const moodTone = /gestresst|nachdenklich/i.test(npc.mood) ? 'is-warm' : 'is-positive';
    let suggestedResponses = [...npc.dialogue.responses];
    if (suggestedResponses.length < 3) {
      suggestedResponses.push({
        de: 'Kannst du mir ein neues deutsches Wort beibringen?',
        ar: 'هل يمكنك تعليمي كلمة ألمانية جديدة؟',
        friendshipBonus: 10
      });
    }
    const overlay = document.createElement('div');
    overlay.className = 'de-dialogue-overlay de-npc-chat-overlay';
    overlay.classList.toggle('translations-hidden', !showTranslations);
    overlay.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    overlay.innerHTML = `
      <div class="de-dialogue-box" role="dialog" aria-modal="false" aria-labelledby="de-npc-chat-title">
        <div class="de-dialogue-top de-ai-dialogue-top">
          <div class="de-dialogue-title-wrap">
            <div class="de-dialogue-avatar de-ai-dialogue-avatar">${npc.avatar}</div>
            <div class="de-ai-character-heading">
              <bdi class="de-dialogue-speaker-name" id="de-npc-chat-title" lang="de" dir="auto">${npc.name}</bdi>
              <div class="de-ai-character-meta">
                <bdi class="de-ai-character-role" lang="de" dir="ltr">${npc.role.split('(')[0].trim()}</bdi>
                <span class="de-ai-mood ${moodTone}" title="${npc.mood}" aria-label="${npc.mood}">
                  <i class="de-ai-mood-dot" aria-hidden="true"></i>
                  <bdi lang="de" dir="ltr">${npc.mood}</bdi>
                </span>
              </div>
            </div>
          </div>
          <div class="de-ai-header-actions">
            <button class="de-ai-translation-toggle" id="de-ai-translation-toggle" type="button" ${language === 'de' ? 'disabled' : ''}
              aria-pressed="${showTranslations}" aria-label="${showTranslations ? copy.hideTranslations : copy.showTranslations}"
              title="${showTranslations ? copy.hideTranslations : copy.showTranslations}">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M3.5 19 8 5l4.5 14M5.2 13h5.6M14 6h7M17.5 3.5V6M13.5 10c1.4 3.2 3.7 5.5 7.5 7M20.5 10c-1.6 3.5-4.1 6-7.5 8M13 20c2.4-1.1 5.2-2.7 8-5.2"></path>
              </svg>
              <span>${showTranslations ? copy.hideTranslations : copy.showTranslations}</span>
            </button>
            <details class="de-ai-privacy-info">
              <summary aria-label="${copy.privacyBefore} Groq" title="${copy.privacyBefore} Groq">i</summary>
              <div class="de-ai-privacy-note" dir="auto">
                <span>${copy.privacyBefore}</span> <bdi dir="ltr">Groq</bdi> <span>${copy.privacyAfter}</span>
              </div>
            </details>
            <button class="de-modal-close" id="de-npc-chat-close"
              aria-label="${copy.close}" title="${copy.close}">&times;</button>
          </div>
          <div class="de-ai-friendship" id="de-ai-friendship"
            title="${friendshipLabel} · ${npc.friendship}/100"
            aria-label="${friendshipLabel} · ${npc.friendship}/100">
            <div class="de-ai-friendship-label">
              <span>${copy.friendship}</span>
              <bdi id="de-ai-friendship-status" lang="de" dir="ltr">${friendshipLabel}</bdi>
              <span class="de-ai-friendship-points" id="de-ai-friendship-points">${npc.friendship}/100</span>
            </div>
            <div class="de-ai-friendship-track" role="progressbar"
              aria-label="${copy.friendship}" aria-valuemin="0" aria-valuemax="100"
              aria-valuenow="${npc.friendship}">
              <span class="de-ai-friendship-fill" id="de-ai-friendship-fill"
                style="width:${Math.max(0, Math.min(100, npc.friendship))}%"></span>
            </div>
          </div>
        </div>
        <div class="de-dialogue-body" id="de-npc-chat-body">
          <div class="de-ai-chat-history" id="de-ai-chat-history" role="log" aria-live="polite"></div>
          <div class="de-ai-chat-footer">
            <div class="de-ai-chat-status" id="de-ai-chat-status" role="status" aria-live="polite"></div>
            <div class="de-ai-suggestions" id="de-ai-suggestions">
              <div class="de-ai-suggestions-title">${copy.suggestions}</div>
              ${suggestedResponses.slice(0, 3).map((response, index) => `
                <button class="de-ai-suggestion" type="button" data-response-index="${index}">
                  <span class="de-ai-suggestion-de" lang="de" dir="ltr"><bdi>${response.de}</bdi></span>
                  <span class="de-ai-suggestion-translation" lang="ar" dir="rtl">
                    <bdi>${response.ar}</bdi>
                  </span>
                  <span class="de-ai-suggestion-shortcut" aria-hidden="true">${index + 1}</span>
                </button>
              `).join('')}
            </div>
            <form class="de-ai-chat-form" id="de-ai-chat-form" dir="${language === 'ar' ? 'rtl' : 'ltr'}">
              <div class="de-ai-composer">
                <textarea id="de-ai-chat-input" maxlength="500" rows="1" required dir="auto" lang="${language}"
                  placeholder="${copy.placeholder}" aria-label="${copy.placeholder}"></textarea>
                <button class="de-ai-mic-button" type="button" disabled
                  aria-label="${copy.micComingSoon}" title="${copy.micComingSoon}">
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <rect x="9" y="3" width="6" height="12" rx="3"></rect>
                    <path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8"></path>
                  </svg>
                </button>
                <button class="de-ai-send-button" id="de-ai-send-button" type="submit"
                  aria-label="${copy.send}" title="${copy.send}">
                  <span aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path d="m3 11 18-8-7 18-3-7-8-3Z"></path>
                      <path d="m11 14 5-5"></path>
                    </svg>
                  </span>
                  <span>${copy.send}</span>
                </button>
              </div>
              <div class="de-ai-composer-meta">
                <span id="de-ai-character-count" hidden>0/500</span>
                <span class="de-ai-keyboard-hint">
                  <bdi dir="ltr"><kbd>${copy.enterKey}</kbd></bdi>
                  <span dir="auto">${copy.sendHint}</span>
                  <span aria-hidden="true">·</span>
                  <bdi dir="ltr"><kbd>${copy.shiftEnterKey}</kbd></bdi>
                  <span dir="auto">${copy.newlineHint}</span>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.classList.add('npc-chat-open');
    document.body.classList.add('chat-open');
    window.dispatchEvent(new CustomEvent('german-npc-chat-state', {
      detail: { open: true, npcKey }
    }));

    const historyElement = overlay.querySelector('#de-ai-chat-history');
    const statusElement = overlay.querySelector('#de-ai-chat-status');
    const suggestionsElement = overlay.querySelector('#de-ai-suggestions');
    const form = overlay.querySelector('#de-ai-chat-form');
    const input = overlay.querySelector('#de-ai-chat-input');
    const sendButton = overlay.querySelector('#de-ai-send-button');
    const friendshipElement = overlay.querySelector('#de-ai-friendship');
    const friendshipProgress = overlay.querySelector('.de-ai-friendship-track');
    const friendshipFill = overlay.querySelector('#de-ai-friendship-fill');
    const friendshipStatusElement = overlay.querySelector('#de-ai-friendship-status');
    const friendshipPoints = overlay.querySelector('#de-ai-friendship-points');
    const translationToggle = overlay.querySelector('#de-ai-translation-toggle');
    const characterCount = overlay.querySelector('#de-ai-character-count');
    const npcShortName = npcKey === 'herr_weber' ? 'Herr Weber' : npc.name.split(' ')[0];
    const localFallbackOptions = [
      { de: 'Erzähl mir mehr.', ar: 'أخبرني المزيد.' },
      { de: 'Ich verstehe nicht.', ar: 'أنا لا أفهم.' },
      { de: 'Tschüss!', ar: 'وداعًا!' }
    ];
    const messages = [];
    let turns = 0;
    let isBusy = false;
    let rewardGranted = false;
    let requestController = null;
    let activeTypewriter = null;
    let activeListenButton = null;
    let audioIndicatorTimer = null;
    let lastMessageRole = null;

    function shouldStickToBottom() {
      return historyElement.scrollHeight - historyElement.scrollTop - historyElement.clientHeight < 72;
    }

    function scrollToBottomIfPinned(wasPinned) {
      if (wasPinned) {
        historyElement.scrollTo({ top: historyElement.scrollHeight, behavior: 'smooth' });
      }
    }

    function appendMessage(role, germanText, translation, suggestedTranslation = '', options = {}) {
      const wasPinned = shouldStickToBottom();
      const row = document.createElement('div');
      row.className = `de-ai-message-row ${role}`;
      if (lastMessageRole === role) row.classList.add('continued');
      lastMessageRole = role;

      const message = document.createElement('article');
      message.className = `de-ai-message ${role}`;

      const meta = document.createElement('div');
      meta.className = 'de-ai-message-meta';
      const speaker = document.createElement('span');
      speaker.className = 'de-ai-message-speaker';
      const speakerName = document.createElement('bdi');
      speakerName.lang = role === 'assistant' ? 'de' : language;
      speakerName.dir = 'auto';
      speakerName.textContent = role === 'assistant' ? npcShortName : copy.you;
      speaker.appendChild(speakerName);
      const time = document.createElement('time');
      time.className = 'de-ai-message-time';
      const timestamp = new Date();
      time.dateTime = timestamp.toISOString();
      time.dir = 'ltr';
      time.textContent = timestamp.toLocaleTimeString(language === 'ar' ? 'ar' : 'en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      });
      if (role === 'assistant') {
        const avatar = document.createElement('div');
        avatar.className = 'de-ai-message-avatar assistant';
        avatar.setAttribute('aria-hidden', 'true');
        avatar.textContent = npc.avatar;
        meta.append(avatar);
      }
      meta.append(speaker, time);
      message.appendChild(meta);

      const german = document.createElement('div');
      german.className = 'de-ai-message-german';
      german.lang = role === 'assistant' || suggestedTranslation ? 'de' : language;
      german.dir = role === 'assistant' || suggestedTranslation ? 'ltr' : 'auto';
      const germanContent = document.createElement('bdi');
      germanContent.dir = german.dir;
      germanContent.textContent = options.typewriter ? '' : germanText;
      german.appendChild(germanContent);
      message.appendChild(german);

      const translatedText = translation || suggestedTranslation;
      if (translatedText) {
        const translated = document.createElement('div');
        translated.className = 'de-ai-message-translation';
        translated.lang = options.translationLanguage || language;
        translated.dir = translated.lang === 'ar' ? 'rtl' : 'ltr';
        const translatedContent = document.createElement('bdi');
        translatedContent.dir = translated.dir;
        translatedContent.textContent = translatedText;
        translated.appendChild(translatedContent);
        message.appendChild(translated);
      }

      let listenButton = null;
      if (role === 'assistant') {
        listenButton = document.createElement('button');
        listenButton.className = 'de-ai-listen-button';
        listenButton.type = 'button';
        listenButton.setAttribute('aria-label', copy.listen);
        listenButton.title = copy.listen;
        listenButton.textContent = '🔊';
        listenButton.addEventListener('click', () => speakMessage(germanText, listenButton));
        meta.appendChild(listenButton);
        window.dispatchEvent(new CustomEvent('german-npc-speech', {
          detail: { npcKey, text: germanText }
        }));
      }

      row.appendChild(message);
      historyElement.appendChild(row);
      scrollToBottomIfPinned(wasPinned);
      return { row, germanContent, german };
    }

    function renderSuggestionSkeletons() {
      const title = document.createElement('div');
      title.className = 'de-ai-suggestions-title';
      title.textContent = copy.suggestions;
      suggestionsElement.replaceChildren(title);
      for (let index = 0; index < 3; index += 1) {
        const row = document.createElement('div');
        row.className = 'de-ai-suggestion-skeleton';
        row.setAttribute('aria-hidden', 'true');
        row.innerHTML = '<span class="skeleton-german"></span><span class="skeleton-arabic"></span><span class="skeleton-key"></span>';
        suggestionsElement.appendChild(row);
      }
      suggestionsElement.hidden = false;
    }

    function renderSuggestions(options) {
      const validOptions = Array.isArray(options)
        ? options.filter((option) => (
          option
          && typeof option.de === 'string'
          && typeof option.ar === 'string'
          && option.de.trim()
          && option.ar.trim()
          && option.de.trim().split(/\s+/).length <= 12
        )).slice(0, 3)
        : [];
      suggestedResponses = [...validOptions];
      for (const fallbackOption of localFallbackOptions) {
        if (suggestedResponses.length >= 3) break;
        suggestedResponses.push(fallbackOption);
      }

      const title = document.createElement('div');
      title.className = 'de-ai-suggestions-title';
      title.textContent = copy.suggestions;
      suggestionsElement.replaceChildren(title);
      suggestedResponses.slice(0, 3).forEach((response, index) => {
        const button = document.createElement('button');
        button.className = 'de-ai-suggestion';
        button.type = 'button';
        button.dataset.responseIndex = index.toString();

        const german = document.createElement('span');
        german.className = 'de-ai-suggestion-de';
        german.lang = 'de';
        german.dir = 'ltr';
        german.textContent = response.de;

        const arabic = document.createElement('span');
        arabic.className = 'de-ai-suggestion-translation';
        arabic.lang = 'ar';
        arabic.dir = 'rtl';
        arabic.textContent = response.ar;

        const shortcut = document.createElement('span');
        shortcut.className = 'de-ai-suggestion-shortcut';
        shortcut.setAttribute('aria-hidden', 'true');
        shortcut.textContent = (index + 1).toString();
        button.append(german, arabic, shortcut);
        suggestionsElement.appendChild(button);
      });
      suggestionsElement.hidden = false;
    }

    function appendTypingIndicator() {
      const wasPinned = shouldStickToBottom();
      const row = document.createElement('div');
      row.className = 'de-ai-message-row assistant de-ai-typing';
      row.setAttribute('role', 'status');
      row.setAttribute('aria-label', copy.typing);

      const avatar = document.createElement('div');
      avatar.className = 'de-ai-message-avatar assistant';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = npc.avatar;

      const bubble = document.createElement('div');
      bubble.className = 'de-ai-message assistant de-ai-typing-bubble';
      const label = document.createElement('span');
      label.className = 'de-ai-typing-label';
      const speakerName = document.createElement('bdi');
      speakerName.dir = 'auto';
      speakerName.textContent = npcShortName;
      const typingText = document.createElement('span');
      typingText.dir = 'auto';
      typingText.textContent = copy.typing;
      label.append(avatar, speakerName, document.createTextNode(' '), typingText);
      const dots = document.createElement('span');
      dots.className = 'de-ai-typing-dots';
      dots.setAttribute('aria-hidden', 'true');
      dots.append(document.createElement('i'), document.createElement('i'), document.createElement('i'));
      bubble.append(label, dots);
      row.appendChild(bubble);
      historyElement.appendChild(row);
      scrollToBottomIfPinned(wasPinned);
      return row;
    }

    function typewriteMessage(message, text) {
      const characters = Array.from(text);
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        message.germanContent.textContent = text;
        return;
      }

      const controller = {
        row: message.row,
        content: message.germanContent,
        text,
        index: 0,
        timer: null,
        skipClick: null,
        finish: null,
        previousLiveMode: historyElement.getAttribute('aria-live') || 'polite'
      };
      const reservedText = document.createElement('span');
      reservedText.className = 'de-ai-typewriter-reserve';
      reservedText.setAttribute('aria-hidden', 'true');
      reservedText.dir = message.germanContent.dir;
      reservedText.lang = message.germanContent.lang;
      reservedText.textContent = text;
      message.german.appendChild(reservedText);
      controller.finish = () => {
        if (activeTypewriter !== controller) return;
        window.clearInterval(controller.timer);
        controller.content.textContent = controller.text;
        reservedText.remove();
        controller.row.classList.remove('is-typewriting');
        controller.row.removeEventListener('click', controller.skipClick);
        historyElement.setAttribute('aria-live', controller.previousLiveMode);
        activeTypewriter = null;
      };
      controller.skipClick = (event) => {
        if (!event.target.closest?.('button')) controller.finish();
      };
      activeTypewriter = controller;
      historyElement.setAttribute('aria-live', 'off');
      controller.row.classList.add('is-typewriting');
      controller.row.addEventListener('click', controller.skipClick);
      controller.timer = window.setInterval(() => {
        controller.index += 1;
        controller.content.textContent = characters.slice(0, controller.index).join('');
        if (shouldStickToBottom()) historyElement.scrollTop = historyElement.scrollHeight;
        if (controller.index >= characters.length) controller.finish();
      }, 24);
    }

    function speakMessage(text, button) {
      if (activeListenButton) activeListenButton.classList.remove('is-playing');
      if (audioIndicatorTimer) window.clearInterval(audioIndicatorTimer);
      activeListenButton = null;
      speak(text);
      if (!('speechSynthesis' in window)) return;

      const speech = window.speechSynthesis;
      const startedAt = Date.now();
      activeListenButton = button;
      button.classList.add('is-playing');
      audioIndicatorTimer = window.setInterval(() => {
        if (Date.now() - startedAt > 400 && !speech.speaking && !speech.pending) {
          button.classList.remove('is-playing');
          activeListenButton = null;
          window.clearInterval(audioIndicatorTimer);
          audioIndicatorTimer = null;
        }
      }, 120);
    }

    function updateFriendshipDisplay() {
      const status = getFriendshipStatus(npc.friendship).split(' (')[0];
      friendshipStatusElement.textContent = status;
      friendshipPoints.textContent = `${npc.friendship}/100`;
      friendshipProgress.setAttribute('aria-valuenow', npc.friendship.toString());
      friendshipFill.style.width = `${Math.max(0, Math.min(100, npc.friendship))}%`;
      friendshipElement.title = `${status} · ${npc.friendship}/100`;
      friendshipElement.setAttribute('aria-label', friendshipElement.title);
    }

    function showXpReward(amount) {
      const reward = document.createElement('span');
      reward.className = 'de-ai-xp-float';
      reward.textContent = `+${amount} XP`;
      friendshipElement.appendChild(reward);
      friendshipElement.classList.add('is-increased');
      window.setTimeout(() => {
        reward.remove();
        friendshipElement.classList.remove('is-increased');
      }, 1450);
    }

    function updateComposer() {
      characterCount.textContent = `${input.value.length}/500`;
      characterCount.hidden = input.value.length <= 400;
      input.style.height = 'auto';
      input.style.height = `${Math.min(input.scrollHeight, 84)}px`;
    }

    function closeConversation() {
      if (!overlay.isConnected || overlay.classList.contains('is-closing')) return;
      if (requestController) requestController.abort();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (activeTypewriter) activeTypewriter.finish();
      if (audioIndicatorTimer) window.clearInterval(audioIndicatorTimer);
      audioIndicatorTimer = null;
      if (activeListenButton) activeListenButton.classList.remove('is-playing');
      activeListenButton = null;
      overlay.classList.add('is-closing');
      window.dispatchEvent(new CustomEvent('german-npc-chat-state', {
        detail: { open: false, npcKey }
      }));
      window.removeEventListener('keydown', onGlobalKeyDown);
      window.setTimeout(() => {
        overlay.remove();
        if (!document.querySelector('.de-dialogue-overlay')) {
          document.body.classList.remove('npc-chat-open');
          document.body.classList.remove('chat-open');
        }
      }, 220);
    }
    overlay.closeNpcConversation = closeConversation;
    overlay.querySelector('#de-npc-chat-close').addEventListener('click', closeConversation);

    async function sendMessage(text, suggestedTranslation = '', friendshipBonus = 10) {
      if (isBusy || (text && turns >= 10)) {
        if (turns >= 10) {
          statusElement.textContent = copy.turnLimit;
          statusElement.classList.add('is-error');
        }
        return;
      }

      const userText = text ? text.trim() : '';
      if (text && !userText) return;
      if (activeTypewriter) activeTypewriter.finish();
      const userMessage = userText
        ? appendMessage('user', userText, '', suggestedTranslation)
        : null;
      if (userText) {
        playSFX('Click');
        messages.push({ role: 'user', content: userText });
        turns += 1;
        suggestionsElement.hidden = true;
      }

      isBusy = true;
      statusElement.textContent = '';
      statusElement.classList.remove('is-error');
      input.disabled = true;
      sendButton.disabled = true;
      renderSuggestionSkeletons();
      const typingIndicator = appendTypingIndicator();
      requestController = new AbortController();
      let timedOut = false;
      const requestTimeout = window.setTimeout(() => {
        timedOut = true;
        requestController?.abort();
      }, 6_000);

      try {
        const response = await fetch('/api/german-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            npcKey,
            language,
            messages,
            gameLocation: window.GermanWorldLocation || null
          }),
          signal: requestController.signal
        });
        const result = await response.json();
        if (!response.ok) {
          const errorMessage = response.status === 503
            ? copy.notConfigured
            : response.status === 429
              ? copy.serviceBusy
              : response.status === 504
                ? copy.replyTimeout
              : copy.connectionError;
          throw new Error(errorMessage);
        }
        const reply = typeof result?.reply === 'string'
          ? { de: result.reply, ar: '', options: [] }
          : result?.reply;
        if (!reply || typeof reply.de !== 'string' || !reply.de.trim()) {
          throw new Error(copy.connectionError);
        }
        const germanReply = reply.de.trim();
        const arabicReply = typeof reply.ar === 'string' ? reply.ar.trim() : '';

        if (userText || messages.length === 0) {
          messages.push({ role: 'assistant', content: germanReply });
        }
        typingIndicator.remove();
        const assistantMessage = appendMessage(
          'assistant',
          germanReply,
          arabicReply,
          '',
          { typewriter: true, translationLanguage: 'ar' }
        );
        typewriteMessage(assistantMessage, germanReply);
        renderSuggestions(reply.options);
        statusElement.textContent = '';
        statusElement.classList.remove('is-error');
        if (input.value.trim() === userText) {
          input.value = '';
          updateComposer();
        }

        if (userText && !rewardGranted) {
          rewardGranted = true;
          npc.friendship = Math.min(100, npc.friendship + friendshipBonus);
          localStorage.setItem(`de_npc_${npcKey}_fr`, npc.friendship.toString());
          updateFriendshipDisplay();
          showXpReward(40);
          playSFX('Correct');
          if (window.GermanEngine && window.GermanEngine.State) {
            window.GermanEngine.State.addXP(40, `Gespräch mit ${npcShortName}`);
          }
        }
      } catch (error) {
        typingIndicator.remove();
        if (error.name !== 'AbortError' || timedOut) {
          if (userMessage) {
            userMessage.row.remove();
            messages.pop();
            turns -= 1;
            lastMessageRole = messages.length ? messages[messages.length - 1].role : null;
          }
          if (overlay.isConnected && !overlay.classList.contains('is-closing')) {
            renderSuggestions(localFallbackOptions);
            statusElement.textContent = timedOut
              ? copy.replyTimeout
              : error.message || copy.connectionError;
            statusElement.classList.add('is-error');
          }
        }
      } finally {
        window.clearTimeout(requestTimeout);
        typingIndicator.remove();
        isBusy = false;
        requestController = null;
        if (overlay.isConnected) {
          input.disabled = false;
          sendButton.disabled = false;
        }
      }
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const userText = input.value.trim();
      if (userText) sendMessage(userText);
    });

    input.addEventListener('input', updateComposer);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        if (input.value.trim()) form.requestSubmit();
      }
    });

    translationToggle.addEventListener('click', () => {
      const show = overlay.classList.contains('translations-hidden');
      overlay.classList.toggle('translations-hidden', !show);
      localStorage.setItem('lw_npc_translations', show ? 'true' : 'false');
      const label = show ? copy.hideTranslations : copy.showTranslations;
      translationToggle.setAttribute('aria-pressed', show.toString());
      translationToggle.setAttribute('aria-label', label);
      translationToggle.title = label;
      translationToggle.lastElementChild.textContent = label;
    });

    suggestionsElement.addEventListener('click', (event) => {
      const button = event.target.closest('.de-ai-suggestion');
      if (!button || !suggestionsElement.contains(button)) return;
      const index = Number(button.getAttribute('data-response-index'));
      const response = suggestedResponses[index];
      if (response) {
        sendMessage(response.de, language === 'ar' ? response.ar : '', response.friendshipBonus);
      }
    });

    function onGlobalKeyDown(event) {
      if (!overlay.isConnected || overlay.classList.contains('is-closing')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeConversation();
        return;
      }

      const isInteractiveTarget = event.target instanceof Element
        && event.target.closest('input, textarea, select, button, [contenteditable="true"]');
      if (event.code === 'Space' && activeTypewriter && !isInteractiveTarget) {
        event.preventDefault();
        activeTypewriter.finish();
        return;
      }

      if (/^[1-3]$/.test(event.key) && !isInteractiveTarget && !isBusy) {
        const button = overlay.querySelector(
          `.de-ai-suggestion[data-response-index="${Number(event.key) - 1}"]`
        );
        if (button && !button.disabled) {
          event.preventDefault();
          button.click();
        }
      }
    }

    window.addEventListener('keydown', onGlobalKeyDown);
    sendMessage('');
  }

  // 12. Perform Job
  function performJob(jobId) {
    const job = JOBS.find(j => j.id === jobId);
    if (!job) return;

    if (LifeState.energy < job.energyCost) {
      showToast(`⚠️ طاقتك منخفضة جداً (${LifeState.energy}%)! خذ قسطاً من الراحة أولاً.`);
      playSFX('Wrong');
      return;
    }

    LifeState.useEnergy(job.energyCost);
    LifeState.addMoney(job.wage, `راتب العمل كـ ${job.title.split(' ')[0]}`);
    playSFX('LessonComplete');

    alert(`🎉 أحسنت صنعاً في عملك كـ (${job.title})!\n\nأنجزت مهام العمل بنجاح وكسبت +${job.wage} € واستهلكت ${job.energyCost}% من طاقتك.`);
    renderTabContent('work');
  }

  // 13. Buy Real Estate Property
  function buyProperty(propId) {
    const prop = PROPERTIES.find(p => p.id === propId);
    if (!prop) return;

    if (LifeState.properties.includes(propId)) {
      showToast('أنت تملك هذا العقار بالفعل!');
      return;
    }

    const ok = LifeState.spendMoney(prop.price, `شراء ${prop.title.split(' ')[0]}`);
    if (ok) {
      LifeState.properties.push(propId);
      LifeState.save();
      if (window.GermanEngine && window.GermanEngine.State) {
        window.GermanEngine.State.addXP(300, `شراء عقار: ${prop.title}`);
      }
      playSFX('LessonComplete');
      alert(`🎉 مبروك! أصبحت الآن مالكاً رسمياً لـ: ${prop.title}!\n\nتمت إضافة العقار إلى أملاكك بنجاح.`);
      renderTabContent('housing');
    }
  }

  // 14. Initialize
  function init() {
    renderLifeHUD();
    renderWorldNPCBeacon();
    console.log('✅ German Life Simulator (Deutsches Lebens-System) active!');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.GermanLife = {
    LifeState,
    NPCS,
    JOBS,
    PROPERTIES,
    openLifeModal,
    openNPCConversation
  };

})();

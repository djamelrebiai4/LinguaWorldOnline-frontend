/**
 * ============================================================
 * German Learning Engine (Deutsche Lern-Engine)
 * Interactive 3D Language Learning Extension for LexiExplorer
 * ============================================================
 */

(function () {
  'use strict';
  let recentWorldObjectClick = null;
  let worldObjectToastTimer = null;

  // Hook localStorage.setItem to immediately detect newly clicked 3D objects
  const origSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function(key, val) {
    origSetItem(key, val);
    if (key === 'unlockedWords') {
      try {
        const arr = JSON.parse(val);
        if (Array.isArray(arr) && arr.length > 0) {
          const last = arr[arr.length - 1];
          const rawKey = (last.english || '').toLowerCase().trim();
          const wasWorldClick = recentWorldObjectClick &&
            recentWorldObjectClick.key === rawKey &&
            recentWorldObjectClick.expiresAt > Date.now();
          if (wasWorldClick) {
            recentWorldObjectClick = null;
          } else if (window.GermanEngine && rawKey &&
            window.GermanEngine.handleItemInteraction) {
            window.GermanEngine.handleItemInteraction(rawKey);
          }
        }
      } catch(e) {}
    }
  };

  // Intercept HTMLAudioElement to provide flawless German TTS whenever audio fails or is requested
  const origAudioPlay = HTMLAudioElement.prototype.play;
  HTMLAudioElement.prototype.play = function() {
    const src = this.src || '';
    if (src.includes('/audio/words/de/') || src.includes('/audio/speak/de/') || src.includes('/audio/sentences/')) {
      try {
        const parts = src.split('/');
        const filename = decodeURIComponent(parts[parts.length - 1]).replace('.mp3', '').replace(/_/g, ' ');
        if (filename && !/^[0-9a-f]{6,}_[0-9]+$/i.test(filename)) {
          speakGerman(filename);
          return Promise.resolve();
        }
      } catch(e) {}
    }
    return origAudioPlay.apply(this, arguments).catch((err) => {
      if (src.includes('/de/') || src.includes('/audio/')) {
        try {
          const parts = src.split('/');
          const filename = decodeURIComponent(parts[parts.length - 1]).replace('.mp3', '').replace(/_/g, ' ');
          if (filename) speakGerman(filename);
        } catch(e) {}
      }
    });
  };


  // 1. Force German as active language
  if (localStorage.getItem('currentLanguage') !== 'de') {
    localStorage.setItem('currentLanguage', 'de');
  }

  // 2. Vocabulary Database with Genders, Arabic Translations & Examples
  const GERMAN_VOCAB = {"ambulance": {"key": "ambulance", "world": "City", "de": "der Krankenwagen", "article": "der", "gender": "maskulin", "en": "ambulance", "ar": "سيارة إسعاف", "example_de": "Der Krankenwagen fährt schnell zum Krankenhaus.", "example_ar": "سيارة الإسعاف تسير بسرعة نحو المستشفى."}, "auto repair": {"key": "auto repair", "world": "City", "de": "die Autowerkstatt", "article": "die", "gender": "feminin", "en": "auto repair", "ar": "ورشة تصليح سيارات", "example_de": "Die Autowerkstatt repariert mein Auto.", "example_ar": "ورشة التصليح تصلح سيارتي."}, "bank": {"key": "bank", "world": "City", "de": "die Bank", "article": "die", "gender": "feminin", "en": "bank", "ar": "بنك / مصرف", "example_de": "Die Bank öffnet um 9 Uhr.", "example_ar": "البنك يفتح في الساعة التاسعة."}, "bench": {"key": "bench", "world": "City", "de": "die Bank", "article": "die", "gender": "feminin", "en": "bench", "ar": "مقعد حديقة", "example_de": "Ich sitze auf der Bank im Park.", "example_ar": "أنا جالس على المقعد في الحديقة."}, "bicycle": {"key": "bicycle", "world": "City", "de": "das Fahrrad", "article": "das", "gender": "neutrum", "en": "bicycle", "ar": "دراجة هوائية", "example_de": "Ich fahre gerne mit dem Fahrrad.", "example_ar": "أحب ركوب الدراجة الهوائية."}, "bookstore": {"key": "bookstore", "world": "City", "de": "die Buchhandlung", "article": "die", "gender": "feminin", "en": "bookstore", "ar": "مكتبة لبيع الكتب", "example_de": "Die Buchhandlung hat viele interessante Bücher.", "example_ar": "مكتبة الكتب تحتوي على العديد من الكتب الشيقة."}, "boundary": {"key": "boundary", "world": "City", "de": "die Grenze", "article": "die", "gender": "feminin", "en": "boundary", "ar": "حدود", "example_de": "Die Grenze ist gut gesichert.", "example_ar": "الحدود مؤمنة جيداً."}, "bridge": {"key": "bridge", "world": "City", "de": "die Brücke", "article": "die", "gender": "feminin", "en": "bridge", "ar": "جسر", "example_de": "Die Brücke führt über den großen Fluss.", "example_ar": "الجسر يمر فوق النهر الكبير."}, "building": {"key": "building", "world": "City", "de": "das Gebäude", "article": "das", "gender": "neutrum", "en": "building", "ar": "مبنى / عمارة", "example_de": "Das Gebäude ist sehr modern und hoch.", "example_ar": "المبنى حديث جداً وعالٍ."}, "bus": {"key": "bus", "world": "City", "de": "der Bus", "article": "der", "gender": "maskulin", "en": "bus", "ar": "حافلة / باص", "example_de": "Der Bus kommt pünktlich an der Haltestelle an.", "example_ar": "الحافلة تصل في موعدها إلى المحطة."}, "bus stop": {"key": "bus stop", "world": "City", "de": "die Bushaltestelle", "article": "die", "gender": "feminin", "en": "bus stop", "ar": "محطة حافلات", "example_de": "Ich warte an der Bushaltestelle auf den Bus.", "example_ar": "أنا أنتظر الحافلة في محطة الحافلات."}, "canal": {"key": "canal", "world": "City", "de": "der Kanal", "article": "der", "gender": "maskulin", "en": "canal", "ar": "قناة مائية", "example_de": "Der Kanal fließt ruhig durch die Stadt.", "example_ar": "القناة تجري بهدوء عبر المدينة."}, "car": {"key": "car", "world": "City", "de": "das Auto", "article": "das", "gender": "neutrum", "en": "car", "ar": "سيارة", "example_de": "Das Auto parkt vor dem Haus.", "example_ar": "السيارة متوقفة أمام المنزل."}, "church": {"key": "church", "world": "City", "de": "die Kirche", "article": "die", "gender": "feminin", "en": "church", "ar": "كنيسة", "example_de": "Die Kirche steht im Zentrum der Stadt.", "example_ar": "الكنيسة تقع في وسط المدينة."}, "cinema": {"key": "cinema", "world": "City", "de": "das Kino", "article": "das", "gender": "neutrum", "en": "cinema", "ar": "سينما", "example_de": "Wir gehen am Wochenende ins Kino.", "example_ar": "نحن نذهب في نهاية الأسبوع إلى السينما."}, "cliff": {"key": "cliff", "world": "City", "de": "die Klippe", "article": "die", "gender": "feminin", "en": "cliff", "ar": "جرف صخري", "example_de": "Die Klippe ist sehr steil und gefährlich.", "example_ar": "الجرف شديد الانحدار وخطير."}, "clothing store": {"key": "clothing store", "world": "City", "de": "das Bekleidungsgeschäft", "article": "das", "gender": "neutrum", "en": "clothing store", "ar": "متجر ملابس", "example_de": "Das Modegeschäft verkauft moderne Kleidung.", "example_ar": "متجر الملابس يبيع ملابس عصرية."}, "coffee shop": {"key": "coffee shop", "world": "City", "de": "das Café", "article": "das", "gender": "neutrum", "en": "coffee shop", "ar": "مقهى", "example_de": "Wir trinken einen Kaffee im Café.", "example_ar": "نحن نشرب القهوة في المقهى."}, "drug store": {"key": "drug store", "world": "City", "de": "die Apotheke", "article": "die", "gender": "feminin", "en": "drug store", "ar": "صيدلية", "example_de": "Ich kaufe Medizin in der Apotheke.", "example_ar": "أشتري الدواء من الصيدلية."}, "dustbin": {"key": "dustbin", "world": "City", "de": "der Mülleimer", "article": "der", "gender": "maskulin", "en": "dustbin", "ar": "سلة مهملات", "example_de": "Wirf den Müll bitte in den Mülleimer.", "example_ar": "ارمِ القمامة في سلة المهملات من فضلك."}, "factory": {"key": "factory", "world": "City", "de": "die Fabrik", "article": "die", "gender": "feminin", "en": "factory", "ar": "la fábrica", "example_de": "Das ist die Fabrik.", "example_ar": "هذا هو die Fabrik."}, "fire station": {"key": "fire station", "world": "City", "de": "die Feuerwache", "article": "die", "gender": "feminin", "en": "fire station", "ar": "محطة إطفاء", "example_de": "Die Feuerwehr hilft bei Unfällen und Bränden.", "example_ar": "فرقة الإطفاء تساعد في الحوادث والحرائق."}, "fire truck": {"key": "fire truck", "world": "City", "de": "das Feuerwehrauto", "article": "das", "gender": "neutrum", "en": "fire truck", "ar": "el camión de bomberos", "example_de": "Das ist das Feuerwehrauto.", "example_ar": "هذا هو das Feuerwehrauto."}, "fishing boat": {"key": "fishing boat", "world": "City", "de": "das Fischerboot", "article": "das", "gender": "neutrum", "en": "fishing boat", "ar": "el barco de pesca", "example_de": "Das ist das Fischerboot.", "example_ar": "هذا هو das Fischerboot."}, "football field": {"key": "football field", "world": "City", "de": "der Fußballplatz", "article": "der", "gender": "maskulin", "en": "football field", "ar": "el campo de fútbol", "example_de": "Das ist der Fußballplatz.", "example_ar": "هذا هو der Fußballplatz."}, "fountain": {"key": "fountain", "world": "City", "de": "der Brunnen", "article": "der", "gender": "maskulin", "en": "fountain", "ar": "نافورة", "example_de": "Der Brunnen sprudelt mitten auf dem Marktplatz.", "example_ar": "النافورة تتدفق في وسط ساحة السوق."}, "gas station": {"key": "gas station", "world": "City", "de": "die Tankstelle", "article": "die", "gender": "feminin", "en": "gas station", "ar": "محطة وقود / بنزين", "example_de": "Wir tanken das Auto an der Tankstelle.", "example_ar": "نزوّد السيارة بالوقود في المحطة."}, "grocery store": {"key": "grocery store", "world": "City", "de": "das Lebensmittelgeschäft", "article": "das", "gender": "neutrum", "en": "grocery store", "ar": "la tienda de comestibles", "example_de": "Das ist das Lebensmittelgeschäft.", "example_ar": "هذا هو das Lebensmittelgeschäft."}, "ground": {"key": "ground", "world": "City", "de": "der Boden", "article": "der", "gender": "maskulin", "en": "ground", "ar": "el suelo", "example_de": "Das ist der Boden.", "example_ar": "هذا هو der Boden."}, "gym": {"key": "gym", "world": "City", "de": "das Fitnessstudio", "article": "das", "gender": "neutrum", "en": "gym", "ar": "el gimnasio", "example_de": "Das ist das Fitnessstudio.", "example_ar": "هذا هو das Fitnessstudio."}, "hospital": {"key": "hospital", "world": "City", "de": "das Krankenhaus", "article": "das", "gender": "neutrum", "en": "hospital", "ar": "مستشفى", "example_de": "Der Arzt arbeitet im Krankenhaus.", "example_ar": "الطبيب يعمل في المستشفى."}, "hotel": {"key": "hotel", "world": "City", "de": "das Hotel", "article": "das", "gender": "neutrum", "en": "hotel", "ar": "فندق", "example_de": "Das Hotel bietet komfortable Zimmer für Gäste.", "example_ar": "الفندق يوفر غرفاً مريحة للضيوف."}, "house": {"key": "house", "world": "City", "de": "das Haus", "article": "das", "gender": "neutrum", "en": "house", "ar": "la casa", "example_de": "Das ist das Haus.", "example_ar": "هذا هو das Haus."}, "museum": {"key": "museum", "world": "City", "de": "das Museum", "article": "das", "gender": "neutrum", "en": "museum", "ar": "متحف", "example_de": "Das Museum zeigt alte Kunstwerke und Statuen.", "example_ar": "المتحف يعرض أعمالاً فنية وتماثيل قديمة."}, "office": {"key": "office", "world": "City", "de": "das Büro", "article": "das", "gender": "neutrum", "en": "office", "ar": "la oficina", "example_de": "Das ist das Büro.", "example_ar": "هذا هو das Büro."}, "park": {"key": "park", "world": "City", "de": "der Park", "article": "der", "gender": "maskulin", "en": "park", "ar": "حديقة عامة / منتزه", "example_de": "Kinder spielen gerne im grünen Park.", "example_ar": "الأطفال يحبون اللعب في المنتزه الأخضر."}, "pine tree": {"key": "pine tree", "world": "City", "de": "die Kiefer", "article": "die", "gender": "feminin", "en": "pine tree", "ar": "el pino", "example_de": "Das ist die Kiefer.", "example_ar": "هذا هو die Kiefer."}, "police car": {"key": "police car", "world": "City", "de": "das Polizeiauto", "article": "das", "gender": "neutrum", "en": "police car", "ar": "سيارة شرطة", "example_de": "Das Polizeiauto fährt mit Blaulicht vorbei.", "example_ar": "سيارة الشرطة تمر بالضوء الأزرق."}, "police station": {"key": "police station", "world": "City", "de": "die Polizeiwache", "article": "die", "gender": "feminin", "en": "police station", "ar": "مركز شرطة", "example_de": "Die Polizeistation sorgt für Sicherheit in der Stadt.", "example_ar": "مركز الشرطة يسهر على أمن المدينة."}, "railway station": {"key": "railway station", "world": "City", "de": "der Bahnhof", "article": "der", "gender": "maskulin", "en": "railway station", "ar": "la estación de tren", "example_de": "Das ist der Bahnhof.", "example_ar": "هذا هو der Bahnhof."}, "restaurant": {"key": "restaurant", "world": "City", "de": "das Restaurant", "article": "das", "gender": "neutrum", "en": "restaurant", "ar": "el restaurante", "example_de": "Das ist das Restaurant.", "example_ar": "هذا هو das Restaurant."}, "school": {"key": "school", "world": "City", "de": "die Schule", "article": "die", "gender": "feminin", "en": "school", "ar": "مدرسة", "example_de": "Die Schule beginnt jeden Tag um acht Uhr.", "example_ar": "المدرسة تبدأ كل يوم في الساعة الثامنة."}, "sea": {"key": "sea", "world": "City", "de": "das Meer", "article": "das", "gender": "neutrum", "en": "sea", "ar": "el mar", "example_de": "Das ist das Meer.", "example_ar": "هذا هو das Meer."}, "speed boat": {"key": "speed boat", "world": "City", "de": "das Schnellboot", "article": "das", "gender": "neutrum", "en": "speed boat", "ar": "la lancha rápida", "example_de": "Das ist das Schnellboot.", "example_ar": "هذا هو das Schnellboot."}, "street": {"key": "street", "world": "City", "de": "die Straße", "article": "die", "gender": "feminin", "en": "street", "ar": "la calle", "example_de": "Das ist die Straße.", "example_ar": "هذا هو die Straße."}, "street light": {"key": "street light", "world": "City", "de": "die Straßenlaterne", "article": "die", "gender": "feminin", "en": "street light", "ar": "la farola", "example_de": "Das ist die Straßenlaterne.", "example_ar": "هذا هو die Straßenlaterne."}, "supermarket": {"key": "supermarket", "world": "City", "de": "der Supermarkt", "article": "der", "gender": "maskulin", "en": "supermarket", "ar": "سوبرماركت", "example_de": "Im Supermarkt kaufen wir frische Lebensmittel.", "example_ar": "في السوبرماركت نشتري أغذية طازجة."}, "swimming pool": {"key": "swimming pool", "world": "City", "de": "das Schwimmbad", "article": "das", "gender": "neutrum", "en": "swimming pool", "ar": "la piscina", "example_de": "Das ist das Schwimmbad.", "example_ar": "هذا هو das Schwimmbad."}, "taxi": {"key": "taxi", "world": "City", "de": "das Taxi", "article": "das", "gender": "neutrum", "en": "taxi", "ar": "سيارة أجرة / تاكسي", "example_de": "Ich nehme ein Taxi zum Flughafen.", "example_ar": "آخذ سيارة أجرة إلى المطار."}, "tower": {"key": "tower", "world": "City", "de": "der Turm", "article": "der", "gender": "maskulin", "en": "tower", "ar": "la torre", "example_de": "Das ist der Turm.", "example_ar": "هذا هو der Turm."}, "traffic light": {"key": "traffic light", "world": "City", "de": "die Ampel", "article": "die", "gender": "feminin", "en": "traffic light", "ar": "إشارة مرور", "example_de": "Die Ampel schaltet auf Grün.", "example_ar": "إشارة المرور تتحول إلى اللون الأخضر."}, "tree": {"key": "tree", "world": "City", "de": "der Baum", "article": "der", "gender": "maskulin", "en": "tree", "ar": "شجرة", "example_de": "Unter dem Baum gibt es angenehmen Schatten.", "example_ar": "تحت الشجرة يوجد ظل مريح."}, "truck": {"key": "truck", "world": "City", "de": "der Lastwagen", "article": "der", "gender": "maskulin", "en": "truck", "ar": "شاحنة", "example_de": "Der LKW transportiert schwere Waren.", "example_ar": "الشاحنة تنقل بضائع ثقيلة."}, "university": {"key": "university", "world": "City", "de": "die Universität", "article": "die", "gender": "feminin", "en": "university", "ar": "la universidad", "example_de": "Das ist die Universität.", "example_ar": "هذا هو die Universität."}, "water tower": {"key": "water tower", "world": "City", "de": "der Wasserturm", "article": "der", "gender": "maskulin", "en": "water tower", "ar": "la torre de agua", "example_de": "Das ist der Wasserturm.", "example_ar": "هذا هو der Wasserturm."}, "basin": {"key": "basin", "world": "House", "de": "das Waschbecken", "article": "das", "gender": "neutrum", "en": "basin", "ar": "حوض غسيل", "example_de": "Das Waschbecken im Bad ist sauber.", "example_ar": "حوض الغسيل في الحمام نظيف."}, "bathroom": {"key": "bathroom", "world": "House", "de": "das Badezimmer", "article": "das", "gender": "neutrum", "en": "bathroom", "ar": "حمام", "example_de": "Das Badezimmer hat eine moderne Dusche.", "example_ar": "الحمام يحتوي على دش حديث."}, "bed": {"key": "bed", "world": "House", "de": "das Bett", "article": "das", "gender": "neutrum", "en": "bed", "ar": "سرير", "example_de": "Ich gehe früh ins Bett, um gut zu schlafen.", "example_ar": "أذهب مبكراً إلى السرير لأنام جيداً."}, "bedroom": {"key": "bedroom", "world": "House", "de": "das Schlafzimmer", "article": "das", "gender": "neutrum", "en": "bedroom", "ar": "غرفة نوم", "example_de": "Mein Schlafzimmer ist ruhig und hell.", "example_ar": "غرفة نومي هادئة ومضاءة."}, "bedside table": {"key": "bedside table", "world": "House", "de": "der Nachttisch", "article": "der", "gender": "maskulin", "en": "bedside table", "ar": "la mesita de noche", "example_de": "Das ist der Nachttisch.", "example_ar": "هذا هو der Nachttisch."}, "book": {"key": "book", "world": "House", "de": "das Buch", "article": "das", "gender": "neutrum", "en": "book", "ar": "كتاب", "example_de": "Ich lese ein deutsches Buch.", "example_ar": "أنا أقرأ كتاباً ألمانياً."}, "ceiling": {"key": "ceiling", "world": "House", "de": "die Decke", "article": "die", "gender": "feminin", "en": "ceiling", "ar": "el techo", "example_de": "Das ist die Decke.", "example_ar": "هذا هو die Decke."}, "ceiling fan": {"key": "ceiling fan", "world": "House", "de": "der Deckenventilator", "article": "der", "gender": "maskulin", "en": "ceiling fan", "ar": "el ventilador de techo", "example_de": "Das ist der Deckenventilator.", "example_ar": "هذا هو der Deckenventilator."}, "chair": {"key": "chair", "world": "House", "de": "der Stuhl", "article": "der", "gender": "maskulin", "en": "chair", "ar": "كرسي", "example_de": "Bitte nimm auf dem Stuhl Platz.", "example_ar": "تفضل بالجلوس على الكرسي من فضلك."}, "chimney": {"key": "chimney", "world": "House", "de": "der Schornstein", "article": "der", "gender": "maskulin", "en": "chimney", "ar": "la chimenea", "example_de": "Das ist der Schornstein.", "example_ar": "هذا هو der Schornstein."}, "closet": {"key": "closet", "world": "House", "de": "der Schrank", "article": "der", "gender": "maskulin", "en": "closet", "ar": "خزانة ملابس", "example_de": "Meine Jacke hängt im Kleiderschrank.", "example_ar": "سترتي معلقة في خزانة الملابس."}, "dining table": {"key": "dining table", "world": "House", "de": "der Esstisch", "article": "der", "gender": "maskulin", "en": "dining table", "ar": "la mesa de comedor", "example_de": "Das ist der Esstisch.", "example_ar": "هذا هو der Esstisch."}, "door": {"key": "door", "world": "House", "de": "die Tür", "article": "die", "gender": "feminin", "en": "door", "ar": "باب", "example_de": "Bitte schließe die Tür leise.", "example_ar": "أغلق الباب بهدوء من فضلك."}, "floor": {"key": "floor", "world": "House", "de": "der Boden", "article": "der", "gender": "maskulin", "en": "floor", "ar": "أرضية / طابق", "example_de": "Der Fußboden ist aus echtem Holz gemacht.", "example_ar": "الأرضية مصنوعة من الخشب الحقيقي."}, "floor lamp": {"key": "floor lamp", "world": "House", "de": "die Stehlampe", "article": "die", "gender": "feminin", "en": "floor lamp", "ar": "la lámpara de pie", "example_de": "Das ist die Stehlampe.", "example_ar": "هذا هو die Stehlampe."}, "flower plant": {"key": "flower plant", "world": "House", "de": "die Blumenpflanze", "article": "die", "gender": "feminin", "en": "flower plant", "ar": "la planta con flores", "example_de": "Das ist die Blumenpflanze.", "example_ar": "هذا هو die Blumenpflanze."}, "fridge": {"key": "fridge", "world": "House", "de": "der Kühlschrank", "article": "der", "gender": "maskulin", "en": "fridge", "ar": "ثلاجة", "example_de": "Die Milch steht im Kühlschrank.", "example_ar": "الحليب موضوع في الثلاجة."}, "guest room": {"key": "guest room", "world": "House", "de": "das Gästezimmer", "article": "das", "gender": "neutrum", "en": "guest room", "ar": "la habitación de invitados", "example_de": "Das ist das Gästezimmer.", "example_ar": "هذا هو das Gästezimmer."}, "kitchen": {"key": "kitchen", "world": "House", "de": "die Küche", "article": "die", "gender": "feminin", "en": "kitchen", "ar": "مطبخ", "example_de": "Wir kochen zusammen in der Küche.", "example_ar": "نحن نطبخ معاً في المطبخ."}, "kitchen cabinet": {"key": "kitchen cabinet", "world": "House", "de": "der Küchenschrank", "article": "der", "gender": "maskulin", "en": "kitchen cabinet", "ar": "el armario de cocina", "example_de": "Das ist der Küchenschrank.", "example_ar": "هذا هو der Küchenschrank."}, "kitchen counter": {"key": "kitchen counter", "world": "House", "de": "die Küchenarbeitsplatte", "article": "die", "gender": "feminin", "en": "kitchen counter", "ar": "la encimera de cocina", "example_de": "Das ist die Küchenarbeitsplatte.", "example_ar": "هذا هو die Küchenarbeitsplatte."}, "kitchen sink": {"key": "kitchen sink", "world": "House", "de": "die Küchenspüle", "article": "die", "gender": "feminin", "en": "kitchen sink", "ar": "el fregadero", "example_de": "Das ist die Küchenspüle.", "example_ar": "هذا هو die Küchenspüle."}, "mattress": {"key": "mattress", "world": "House", "de": "die Matratze", "article": "die", "gender": "feminin", "en": "mattress", "ar": "el colchón", "example_de": "Das ist die Matratze.", "example_ar": "هذا هو die Matratze."}, "microwave": {"key": "microwave", "world": "House", "de": "die Mikrowelle", "article": "die", "gender": "feminin", "en": "microwave", "ar": "مايكروويف", "example_de": "Ich wärme das Essen in der Mikrowelle auf.", "example_ar": "أسخن الطعام في المايكروويف."}, "pen": {"key": "pen", "world": "House", "de": "der Stift", "article": "der", "gender": "maskulin", "en": "pen", "ar": "قلم حبر", "example_de": "Der Kugelschreiber schreibt sehr flüssig.", "example_ar": "قلم الحبر يكتب بسلاسة كبيرة."}, "pillow": {"key": "pillow", "world": "House", "de": "das Kissen", "article": "das", "gender": "neutrum", "en": "pillow", "ar": "وسادة / مخدة", "example_de": "Das Kissen ist sehr weich und gemütlich.", "example_ar": "الوسادة ناعمة ومريحة للغاية."}, "plate": {"key": "plate", "world": "House", "de": "der Teller", "article": "der", "gender": "maskulin", "en": "plate", "ar": "صحن / طبق", "example_de": "Das Essen wird auf einem warmen Teller serviert.", "example_ar": "يتم تقديم الطعام في طبق دافئ."}, "reading table": {"key": "reading table", "world": "House", "de": "der Lesetisch", "article": "der", "gender": "maskulin", "en": "reading table", "ar": "la mesa de lectura", "example_de": "Das ist der Lesetisch.", "example_ar": "هذا هو der Lesetisch."}, "shower": {"key": "shower", "world": "House", "de": "die Dusche", "article": "die", "gender": "feminin", "en": "shower", "ar": "دش / مروش", "example_de": "Ich nehme jeden Morgen eine heiße Dusche.", "example_ar": "آخذ دُشاً ساخناً كل صباح."}, "sofa": {"key": "sofa", "world": "House", "de": "das Sofa", "article": "das", "gender": "neutrum", "en": "sofa", "ar": "أريكة / كنب", "example_de": "Die ganze Familie sitzt gemütlich auf dem Sofa.", "example_ar": "العائلة بأكملها تجلس بارتياح على الأريكة."}, "stove": {"key": "stove", "world": "House", "de": "der Herd", "article": "der", "gender": "maskulin", "en": "stove", "ar": "la estufa", "example_de": "Das ist der Herd.", "example_ar": "هذا هو der Herd."}, "table": {"key": "table", "world": "House", "de": "der Tisch", "article": "der", "gender": "maskulin", "en": "table", "ar": "طاولة / مائدة", "example_de": "Der Tisch am Fenster ist für uns reserviert.", "example_ar": "الطاولة بجانب النافذة محجوزة لنا."}, "television": {"key": "television", "world": "House", "de": "der Fernseher", "article": "der", "gender": "maskulin", "en": "television", "ar": "تلفاز", "example_de": "Der Fernseher zeigt ein spannendes Fußballspiel.", "example_ar": "التلفاز يعرض مباراة كرة قدم مشوقة."}, "toilet": {"key": "toilet", "world": "House", "de": "die Toilette", "article": "die", "gender": "feminin", "en": "toilet", "ar": "مرحاض", "example_de": "Die Toilette befindet sich neben dem Bad.", "example_ar": "المرحاض يقع بجانب الحمام."}, "vase": {"key": "vase", "world": "House", "de": "die Vase", "article": "die", "gender": "feminin", "en": "vase", "ar": "el jarrón", "example_de": "Das ist die Vase.", "example_ar": "هذا هو die Vase."}, "wall clock": {"key": "wall clock", "world": "House", "de": "die Wanduhr", "article": "die", "gender": "feminin", "en": "wall clock", "ar": "el reloj de pared", "example_de": "Das ist die Wanduhr.", "example_ar": "هذا هو die Wanduhr."}, "wall": {"key": "wall", "world": "House", "de": "die Wand", "article": "die", "gender": "feminin", "en": "wall", "ar": "la pared", "example_de": "Das ist die Wand.", "example_ar": "هذا هو die Wand."}, "washing machine": {"key": "washing machine", "world": "House", "de": "die Waschmaschine", "article": "die", "gender": "feminin", "en": "washing machine", "ar": "غسالة ملابس", "example_de": "Die Waschmaschine wäscht die weiße Wäsche.", "example_ar": "الغسالة تغسل الملابس البيضاء."}, "water filter": {"key": "water filter", "world": "House", "de": "der Wasserfilter", "article": "der", "gender": "maskulin", "en": "water filter", "ar": "el filtro de agua", "example_de": "Das ist der Wasserfilter.", "example_ar": "هذا هو der Wasserfilter."}, "water tap": {"key": "water tap", "world": "House", "de": "der Wasserhahn", "article": "der", "gender": "maskulin", "en": "water tap", "ar": "el grifo", "example_de": "Das ist der Wasserhahn.", "example_ar": "هذا هو der Wasserhahn."}, "window": {"key": "window", "world": "House", "de": "das Fenster", "article": "das", "gender": "neutrum", "en": "window", "ar": "نافذة / شباك", "example_de": "Ich öffne das Fenster für frische Luft.", "example_ar": "أفتح النافذة لدخول الهواء النقي."}, "mirror": {"key": "mirror", "world": "House", "de": "der Spiegel", "article": "der", "gender": "maskulin", "en": "mirror", "ar": "مرآة", "example_de": "Ich schaue morgens in den Spiegel.", "example_ar": "أنظر صباحاً في المرآة."}, "bookshelf": {"key": "bookshelf", "world": "House", "de": "das Bücherregal", "article": "das", "gender": "neutrum", "en": "bookshelf", "ar": "رف كتب", "example_de": "Im Bücherregal stehen viele Romane.", "example_ar": "على رف الكتب توجد روايات كثيرة."}, "soap": {"key": "soap", "world": "House", "de": "die Seife", "article": "die", "gender": "feminin", "en": "soap", "ar": "el jabón", "example_de": "Das ist die Seife.", "example_ar": "هذا هو die Seife."}, "soap case": {"key": "soap case", "world": "House", "de": "die Seifenschale", "article": "die", "gender": "feminin", "en": "soap case", "ar": "el jabonero", "example_de": "Das ist die Seifenschale.", "example_ar": "هذا هو die Seifenschale."}, "bathtub": {"key": "bathtub", "world": "House", "de": "die Badewanne", "article": "die", "gender": "feminin", "en": "bathtub", "ar": "la bañera", "example_de": "Das ist die Badewanne.", "example_ar": "هذا هو die Badewanne."}, "glass": {"key": "glass", "world": "House", "de": "das Glas", "article": "das", "gender": "neutrum", "en": "glass", "ar": "كأس / كوب زجاجي", "example_de": "Ein Glas frisches Wasser bitte!", "example_ar": "كأس من الماء العذب من فضلك!"}, "pan": {"key": "pan", "world": "House", "de": "die Pfanne", "article": "die", "gender": "feminin", "en": "pan", "ar": "la sartén", "example_de": "Das ist die Pfanne.", "example_ar": "هذا هو die Pfanne."}, "knife": {"key": "knife", "world": "House", "de": "das Messer", "article": "das", "gender": "neutrum", "en": "knife", "ar": "سكين", "example_de": "Das Messer schneidet das Fleisch mühelos.", "example_ar": "السكين يقطع اللحم بسهولة."}, "spoon": {"key": "spoon", "world": "House", "de": "der Löffel", "article": "der", "gender": "maskulin", "en": "spoon", "ar": "ملعقة", "example_de": "Ich esse die warme Suppe mit einem Löffel.", "example_ar": "آكل الحساء الساخن بالملعقة."}, "fork": {"key": "fork", "world": "House", "de": "die Gabel", "article": "die", "gender": "feminin", "en": "fork", "ar": "شوكة", "example_de": "Die Gabel liegt links neben dem Teller.", "example_ar": "الشوكة موضوعة على يسار الصحن."}, "pot": {"key": "pot", "world": "House", "de": "der Topf", "article": "der", "gender": "maskulin", "en": "pot", "ar": "la olla", "example_de": "Das ist der Topf.", "example_ar": "هذا هو der Topf."}, "switch board": {"key": "switch board", "world": "House", "de": "die Schalttafel", "article": "die", "gender": "feminin", "en": "switch board", "ar": "el tablero de interruptores", "example_de": "Das ist die Schalttafel.", "example_ar": "هذا هو die Schalttafel."}, "black board": {"key": "black board", "world": "Classroom", "de": "die Tafel", "article": "die", "gender": "feminin", "en": "black board", "ar": "سبورة", "example_de": "Der Lehrer schreibt Wörter an die Tafel.", "example_ar": "المعلم يكتب كلمات على السبورة."}, "chalk": {"key": "chalk", "world": "Classroom", "de": "die Kreide", "article": "die", "gender": "feminin", "en": "chalk", "ar": "طبشور", "example_de": "Die Kreide liegt neben dem Schwamm.", "example_ar": "الطبشور موضوع بجانب الإسفنجة."}, "computer": {"key": "computer", "world": "Classroom", "de": "der Computer", "article": "der", "gender": "maskulin", "en": "computer", "ar": "حاسوب / كمبيوتر", "example_de": "Der Student lernt am Computer.", "example_ar": "الطالب يتعلم على الحاسوب."}, "computer mouse": {"key": "computer mouse", "world": "Classroom", "de": "die Computermaus", "article": "die", "gender": "feminin", "en": "computer mouse", "ar": "فأرة حاسوب", "example_de": "Ich klicke mit der Computermaus auf den Link.", "example_ar": "أنقر بالفأرة على الرابط."}, "computer table": {"key": "computer table", "world": "Classroom", "de": "der Computertisch", "article": "der", "gender": "maskulin", "en": "computer table", "ar": "la mesa de computadora", "example_de": "Das ist der Computertisch.", "example_ar": "هذا هو der Computertisch."}, "duster": {"key": "duster", "world": "Classroom", "de": "der Schwamm", "article": "der", "gender": "maskulin", "en": "duster", "ar": "el borrador", "example_de": "Das ist der Schwamm.", "example_ar": "هذا هو der Schwamm."}, "eight": {"key": "eight", "world": "Classroom", "de": "acht", "article": "", "gender": "other", "en": "eight", "ar": "ocho", "example_de": "Das ist acht.", "example_ar": "هذا هو acht."}, "eraser": {"key": "eraser", "world": "Classroom", "de": "der Radiergummi", "article": "der", "gender": "maskulin", "en": "eraser", "ar": "ممحاة", "example_de": "Der Radiergummi löscht den Bleistiftstrich.", "example_ar": "الممحاة تمسح خط قلم الرصاص."}, "five": {"key": "five", "world": "Classroom", "de": "fünf", "article": "", "gender": "other", "en": "five", "ar": "cinco", "example_de": "Das ist fünf.", "example_ar": "هذا هو fünf."}, "four": {"key": "four", "world": "Classroom", "de": "vier", "article": "", "gender": "other", "en": "four", "ar": "cuatro", "example_de": "Das ist vier.", "example_ar": "هذا هو vier."}, "keyboard": {"key": "keyboard", "world": "Classroom", "de": "die Tastatur", "article": "die", "gender": "feminin", "en": "keyboard", "ar": "el teclado", "example_de": "Das ist die Tastatur.", "example_ar": "هذا هو die Tastatur."}, "lockers": {"key": "lockers", "world": "Classroom", "de": "die Schließfächer", "article": "die", "gender": "feminin", "en": "lockers", "ar": "los casilleros", "example_de": "Das ist die Schließfächer.", "example_ar": "هذا هو die Schließfächer."}, "map": {"key": "map", "world": "Classroom", "de": "die Karte", "article": "die", "gender": "feminin", "en": "map", "ar": "el mapa", "example_de": "Das ist die Karte.", "example_ar": "هذا هو die Karte."}, "monitor": {"key": "monitor", "world": "Classroom", "de": "der Monitor", "article": "der", "gender": "maskulin", "en": "monitor", "ar": "el monitor", "example_de": "Das ist der Monitor.", "example_ar": "هذا هو der Monitor."}, "nine": {"key": "nine", "world": "Classroom", "de": "neun", "article": "", "gender": "other", "en": "nine", "ar": "nueve", "example_de": "Das ist neun.", "example_ar": "هذا هو neun."}, "notice board": {"key": "notice board", "world": "Classroom", "de": "das schwarze Brett", "article": "das", "gender": "neutrum", "en": "notice board", "ar": "el tablón de anuncios", "example_de": "Das ist das schwarze Brett.", "example_ar": "هذا هو das schwarze Brett."}, "one": {"key": "one", "world": "Classroom", "de": "eins", "article": "", "gender": "other", "en": "one", "ar": "uno", "example_de": "Das ist eins.", "example_ar": "هذا هو eins."}, "paper": {"key": "paper", "world": "Classroom", "de": "das Papier", "article": "das", "gender": "neutrum", "en": "paper", "ar": "el papel", "example_de": "Das ist das Papier.", "example_ar": "هذا هو das Papier."}, "pencil": {"key": "pencil", "world": "Classroom", "de": "der Bleistift", "article": "der", "gender": "maskulin", "en": "pencil", "ar": "قلم رصاص", "example_de": "Ich zeichne mit einem spitzen Bleistift.", "example_ar": "أرسم بقلم رصاص مبري."}, "platform": {"key": "platform", "world": "Classroom", "de": "das Podest", "article": "das", "gender": "neutrum", "en": "platform", "ar": "la plataforma", "example_de": "Das ist das Podest.", "example_ar": "هذا هو das Podest."}, "projector": {"key": "projector", "world": "Classroom", "de": "der Projektor", "article": "der", "gender": "maskulin", "en": "projector", "ar": "el proyector", "example_de": "Das ist der Projektor.", "example_ar": "هذا هو der Projektor."}, "seven": {"key": "seven", "world": "Classroom", "de": "sieben", "article": "", "gender": "other", "en": "seven", "ar": "siete", "example_de": "Das ist sieben.", "example_ar": "هذا هو sieben."}, "six": {"key": "six", "world": "Classroom", "de": "sechs", "article": "", "gender": "other", "en": "six", "ar": "seis", "example_de": "Das ist sechs.", "example_ar": "هذا هو sechs."}, "speaker": {"key": "speaker", "world": "Classroom", "de": "der Lautsprecher", "article": "der", "gender": "maskulin", "en": "speaker", "ar": "el altavoz", "example_de": "Das ist der Lautsprecher.", "example_ar": "هذا هو der Lautsprecher."}, "stair": {"key": "stair", "world": "Classroom", "de": "die Treppe", "article": "die", "gender": "feminin", "en": "stair", "ar": "la escalera", "example_de": "Das ist die Treppe.", "example_ar": "هذا هو die Treppe."}, "student chair": {"key": "student chair", "world": "Classroom", "de": "der Schülerstuhl", "article": "der", "gender": "maskulin", "en": "student chair", "ar": "la silla de estudiante", "example_de": "Das ist der Schülerstuhl.", "example_ar": "هذا هو der Schülerstuhl."}, "student desk": {"key": "student desk", "world": "Classroom", "de": "der Schreibtisch", "article": "der", "gender": "maskulin", "en": "student desk", "ar": "el escritorio de estudiante", "example_de": "Das ist der Schreibtisch.", "example_ar": "هذا هو der Schreibtisch."}, "teacher's podium": {"key": "teacher's podium", "world": "Classroom", "de": "das Lehrerpult", "article": "das", "gender": "neutrum", "en": "teacher's podium", "ar": "el podio del profesor", "example_de": "Das ist das Lehrerpult.", "example_ar": "هذا هو das Lehrerpult."}, "three": {"key": "three", "world": "Classroom", "de": "drei", "article": "", "gender": "other", "en": "three", "ar": "tres", "example_de": "Das ist drei.", "example_ar": "هذا هو drei."}, "trash bin": {"key": "trash bin", "world": "Classroom", "de": "der Mülleimer", "article": "der", "gender": "maskulin", "en": "trash bin", "ar": "el cubo de basura", "example_de": "Das ist der Mülleimer.", "example_ar": "هذا هو der Mülleimer."}, "two": {"key": "two", "world": "Classroom", "de": "zwei", "article": "", "gender": "other", "en": "two", "ar": "dos", "example_de": "Das ist zwei.", "example_ar": "هذا هو zwei."}, "zero": {"key": "zero", "world": "Classroom", "de": "null", "article": "", "gender": "other", "en": "zero", "ar": "cero", "example_de": "Das ist null.", "example_ar": "هذا هو null."}, "air conditioner": {"key": "air conditioner", "world": "Restaurant", "de": "die Klimaanlage", "article": "die", "gender": "feminin", "en": "air conditioner", "ar": "مكيف هواء", "example_de": "Die Klimaanlage kühlt den Speisesaal angenehm.", "example_ar": "مكيف الهواء يبرد قاعة الطعام بلطف."}, "avocado": {"key": "avocado", "world": "Restaurant", "de": "die Avocado", "article": "die", "gender": "feminin", "en": "avocado", "ar": "أفوكادو", "example_de": "Die frische Avocado schmeckt im Salat hervorragend.", "example_ar": "الأفوكادو الطازج مذاقه رائع في السلطة."}, "bar": {"key": "bar", "world": "Restaurant", "de": "die Bar", "article": "die", "gender": "feminin", "en": "bar", "ar": "بار / ركن المشروبات", "example_de": "Gäste sitzen abends an der gemütlichen Bar.", "example_ar": "الضيوف يجلسون مساءً عند ركن المشروبات الهادئ."}, "bar counter": {"key": "bar counter", "world": "Restaurant", "de": "die Theke", "article": "die", "gender": "feminin", "en": "bar counter", "ar": "منضدة البار / الكاونتر", "example_de": "Der Kellner stellt die Getränke auf die Theke.", "example_ar": "النادل يضع المشروبات على المنضدة."}, "bottle": {"key": "bottle", "world": "Restaurant", "de": "die Flasche", "article": "die", "gender": "feminin", "en": "bottle", "ar": "la botella", "example_de": "Das ist die Flasche.", "example_ar": "هذا هو die Flasche."}, "bowl of soup": {"key": "bowl of soup", "world": "Restaurant", "de": "die Schüssel Suppe", "article": "die", "gender": "feminin", "en": "bowl of soup", "ar": "el tazón de sopa", "example_de": "Das ist die Schüssel Suppe.", "example_ar": "هذا هو die Schüssel Suppe."}, "carrot": {"key": "carrot", "world": "Restaurant", "de": "die Karotte", "article": "die", "gender": "feminin", "en": "carrot", "ar": "جزر", "example_de": "Die Karotte enthält viele gesunde Vitamine.", "example_ar": "الجزرة تحتوي على فيتامينات صحية كثيرة."}, "chicken": {"key": "chicken", "world": "Restaurant", "de": "das Hähnchen", "article": "das", "gender": "neutrum", "en": "chicken", "ar": "el pollo", "example_de": "Das ist das Hähnchen.", "example_ar": "هذا هو das Hähnchen."}, "chopper board": {"key": "chopper board", "world": "Restaurant", "de": "das Schneidebrett", "article": "das", "gender": "neutrum", "en": "chopper board", "ar": "la tabla de cortar", "example_de": "Das ist das Schneidebrett.", "example_ar": "هذا هو das Schneidebrett."}, "female": {"key": "female", "world": "Restaurant", "de": "die Frau", "article": "die", "gender": "feminin", "en": "female", "ar": "la mujer", "example_de": "Das ist die Frau.", "example_ar": "هذا هو die Frau."}, "fish": {"key": "fish", "world": "Restaurant", "de": "der Fisch", "article": "der", "gender": "maskulin", "en": "fish", "ar": "سمك", "example_de": "Der frische Fisch wird gebraten.", "example_ar": "السمك الطازج يُقلى."}, "glass of beer": {"key": "glass of beer", "world": "Restaurant", "de": "das Glas Bier", "article": "das", "gender": "neutrum", "en": "glass of beer", "ar": "el vaso de cerveza", "example_de": "Das ist das Glas Bier.", "example_ar": "هذا هو das Glas Bier."}, "glass of wine": {"key": "glass of wine", "world": "Restaurant", "de": "das Glas Wein", "article": "das", "gender": "neutrum", "en": "glass of wine", "ar": "la copa de vino", "example_de": "Das ist das Glas Wein.", "example_ar": "هذا هو das Glas Wein."}, "male": {"key": "male", "world": "Restaurant", "de": "der Mann", "article": "der", "gender": "maskulin", "en": "male", "ar": "el hombre", "example_de": "Das ist der Mann.", "example_ar": "هذا هو der Mann."}, "meat": {"key": "meat", "world": "Restaurant", "de": "das Fleisch", "article": "das", "gender": "neutrum", "en": "meat", "ar": "لحم", "example_de": "Das zarte Fleisch brät in der Pfanne.", "example_ar": "اللحم الطري ينضج في المقلاة."}, "momos": {"key": "momos", "world": "Restaurant", "de": "die Momos", "article": "die", "gender": "feminin", "en": "momos", "ar": "los momos", "example_de": "Das ist die Momos.", "example_ar": "هذا هو die Momos."}, "pizza": {"key": "pizza", "world": "Restaurant", "de": "die Pizza", "article": "die", "gender": "feminin", "en": "pizza", "ar": "la pizza", "example_de": "Das ist die Pizza.", "example_ar": "هذا هو die Pizza."}, "reception": {"key": "reception", "world": "Restaurant", "de": "der Empfang", "article": "der", "gender": "maskulin", "en": "reception", "ar": "la recepción", "example_de": "Das ist der Empfang.", "example_ar": "هذا هو der Empfang."}, "reception desk": {"key": "reception desk", "world": "Restaurant", "de": "die Rezeption", "article": "die", "gender": "feminin", "en": "reception desk", "ar": "el escritorio de recepción", "example_de": "Das ist die Rezeption.", "example_ar": "هذا هو die Rezeption."}, "reservation book": {"key": "reservation book", "world": "Restaurant", "de": "das Reservierungsbuch", "article": "das", "gender": "neutrum", "en": "reservation book", "ar": "el libro de reservas", "example_de": "Das ist das Reservierungsbuch.", "example_ar": "هذا هو das Reservierungsbuch."}, "stool": {"key": "stool", "world": "Restaurant", "de": "der Hocker", "article": "der", "gender": "maskulin", "en": "stool", "ar": "el taburete", "example_de": "Das ist der Hocker.", "example_ar": "هذا هو der Hocker."}, "washroom": {"key": "washroom", "world": "Restaurant", "de": "der Waschraum", "article": "der", "gender": "maskulin", "en": "washroom", "ar": "el baño", "example_de": "Das ist der Waschraum.", "example_ar": "هذا هو der Waschraum."}, "apple": {"key": "apple", "world": "Supermarket", "de": "der Apfel", "article": "der", "gender": "maskulin", "en": "apple", "ar": "تفاحة", "example_de": "Der grüne Apfel ist knackig und gesund.", "example_ar": "التفاحة الخضراء مقرمشة وصحية."}, "apple juice": {"key": "apple juice", "world": "Supermarket", "de": "der Apfelsaft", "article": "der", "gender": "maskulin", "en": "apple juice", "ar": "عصير تفاح", "example_de": "Apfelsaftschorle ist in Deutschland sehr beliebt.", "example_ar": "عصير التفاح الفوار محبوب جداً في ألمانيا."}, "barcode scanner": {"key": "barcode scanner", "world": "Supermarket", "de": "der Barcode-Scanner", "article": "der", "gender": "maskulin", "en": "barcode scanner", "ar": "el escáner de código de barras", "example_de": "Das ist der Barcode-Scanner.", "example_ar": "هذا هو der Barcode-Scanner."}, "biscuit": {"key": "biscuit", "world": "Supermarket", "de": "der Keks", "article": "der", "gender": "maskulin", "en": "biscuit", "ar": "بسكويت / كعك محلى", "example_de": "Zum Kaffee esse ich gerne einen süßen Keks.", "example_ar": "مع القهوة أحب تناول بسكويت حلو."}, "blueberry jam": {"key": "blueberry jam", "world": "Supermarket", "de": "die Blaubeermarmelade", "article": "die", "gender": "feminin", "en": "blueberry jam", "ar": "la mermelada de arándanos", "example_de": "Das ist die Blaubeermarmelade.", "example_ar": "هذا هو die Blaubeermarmelade."}, "brown bread": {"key": "brown bread", "world": "Supermarket", "de": "das Schwarzbrot", "article": "das", "gender": "neutrum", "en": "brown bread", "ar": "el pan integral", "example_de": "Das ist das Schwarzbrot.", "example_ar": "هذا هو das Schwarzbrot."}, "candy": {"key": "candy", "world": "Supermarket", "de": "die Süßigkeit", "article": "die", "gender": "feminin", "en": "candy", "ar": "el dulce", "example_de": "Das ist die Süßigkeit.", "example_ar": "هذا هو die Süßigkeit."}, "canned beans": {"key": "canned beans", "world": "Supermarket", "de": "die Dosenbohnen", "article": "die", "gender": "feminin", "en": "canned beans", "ar": "los frijoles enlatados", "example_de": "Das ist die Dosenbohnen.", "example_ar": "هذا هو die Dosenbohnen."}, "canned corn": {"key": "canned corn", "world": "Supermarket", "de": "der Dosenmais", "article": "der", "gender": "maskulin", "en": "canned corn", "ar": "el maíz enlatado", "example_de": "Das ist der Dosenmais.", "example_ar": "هذا هو der Dosenmais."}, "canned tuna": {"key": "canned tuna", "world": "Supermarket", "de": "der Dosenthunfisch", "article": "der", "gender": "maskulin", "en": "canned tuna", "ar": "el atún enlatado", "example_de": "Das ist der Dosenthunfisch.", "example_ar": "هذا هو der Dosenthunfisch."}, "card reader": {"key": "card reader", "world": "Supermarket", "de": "das Kartenlesegerät", "article": "das", "gender": "neutrum", "en": "card reader", "ar": "el lector de tarjetas", "example_de": "Das ist das Kartenlesegerät.", "example_ar": "هذا هو das Kartenlesegerät."}, "cereal": {"key": "cereal", "world": "Supermarket", "de": "das Müsli", "article": "das", "gender": "neutrum", "en": "cereal", "ar": "el cereal", "example_de": "Das ist das Müsli.", "example_ar": "هذا هو das Müsli."}, "cheese": {"key": "cheese", "world": "Supermarket", "de": "der Käse", "article": "der", "gender": "maskulin", "en": "cheese", "ar": "جبن", "example_de": "Der würzige Käse schmeckt ausgezeichnet.", "example_ar": "الجبن المتبل مذاقه ممتاز."}, "chocolate": {"key": "chocolate", "world": "Supermarket", "de": "die Schokolade", "article": "die", "gender": "feminin", "en": "chocolate", "ar": "شوكولاتة", "example_de": "Dunkle Schokolade ist meine Lieblingssüßigkeit.", "example_ar": "الشوكولاتة الداكنة هي حلواي المفضلة."}, "cookies": {"key": "cookies", "world": "Supermarket", "de": "die Plätzchen", "article": "die", "gender": "feminin", "en": "cookies", "ar": "las galletas", "example_de": "Das ist die Plätzchen.", "example_ar": "هذا هو die Plätzchen."}, "cooking oil": {"key": "cooking oil", "world": "Supermarket", "de": "das Speiseöl", "article": "das", "gender": "neutrum", "en": "cooking oil", "ar": "el aceite de cocina", "example_de": "Das ist das Speiseöl.", "example_ar": "هذا هو das Speiseöl."}, "crate": {"key": "crate", "world": "Supermarket", "de": "die Kiste", "article": "die", "gender": "feminin", "en": "crate", "ar": "el cajón", "example_de": "Das ist die Kiste.", "example_ar": "هذا هو die Kiste."}, "dishwashing liquid": {"key": "dishwashing liquid", "world": "Supermarket", "de": "das Spülmittel", "article": "das", "gender": "neutrum", "en": "dishwashing liquid", "ar": "el líquido lavavajillas", "example_de": "Das ist das Spülmittel.", "example_ar": "هذا هو das Spülmittel."}, "facewash": {"key": "facewash", "world": "Supermarket", "de": "das Gesichtswasser", "article": "das", "gender": "neutrum", "en": "facewash", "ar": "el limpiador facial", "example_de": "Das ist das Gesichtswasser.", "example_ar": "هذا هو das Gesichtswasser."}, "freezer": {"key": "freezer", "world": "Supermarket", "de": "der Gefrierschrank", "article": "der", "gender": "maskulin", "en": "freezer", "ar": "el congelador", "example_de": "Das ist der Gefrierschrank.", "example_ar": "هذا هو der Gefrierschrank."}, "glass cleaner": {"key": "glass cleaner", "world": "Supermarket", "de": "der Glasreiniger", "article": "der", "gender": "maskulin", "en": "glass cleaner", "ar": "el limpiador de vidrios", "example_de": "Das ist der Glasreiniger.", "example_ar": "هذا هو der Glasreiniger."}, "hair conditioner": {"key": "hair conditioner", "world": "Supermarket", "de": "die Haarspülung", "article": "die", "gender": "feminin", "en": "hair conditioner", "ar": "el acondicionador de cabello", "example_de": "Das ist die Haarspülung.", "example_ar": "هذا هو die Haarspülung."}, "hand wash": {"key": "hand wash", "world": "Supermarket", "de": "die Handseife", "article": "die", "gender": "feminin", "en": "hand wash", "ar": "el jabón de manos", "example_de": "Das ist die Handseife.", "example_ar": "هذا هو die Handseife."}, "hanger": {"key": "hanger", "world": "Supermarket", "de": "der Kleiderbügel", "article": "der", "gender": "maskulin", "en": "hanger", "ar": "el gancho", "example_de": "Das ist der Kleiderbügel.", "example_ar": "هذا هو der Kleiderbügel."}, "honey": {"key": "honey", "world": "Supermarket", "de": "der Honig", "article": "der", "gender": "maskulin", "en": "honey", "ar": "la miel", "example_de": "Das ist der Honig.", "example_ar": "هذا هو der Honig."}, "mayonnaise": {"key": "mayonnaise", "world": "Supermarket", "de": "die Mayonnaise", "article": "die", "gender": "feminin", "en": "mayonnaise", "ar": "la mayonesa", "example_de": "Das ist die Mayonnaise.", "example_ar": "هذا هو die Mayonnaise."}, "milk carton": {"key": "milk carton", "world": "Supermarket", "de": "der Milchkarton", "article": "der", "gender": "maskulin", "en": "milk carton", "ar": "el cartón de leche", "example_de": "Das ist der Milchkarton.", "example_ar": "هذا هو der Milchkarton."}, "noodles": {"key": "noodles", "world": "Supermarket", "de": "die Nudeln", "article": "die", "gender": "feminin", "en": "noodles", "ar": "los fideos", "example_de": "Das ist die Nudeln.", "example_ar": "هذا هو die Nudeln."}, "orange": {"key": "orange", "world": "Supermarket", "de": "die Orange", "article": "die", "gender": "feminin", "en": "orange", "ar": "la naranja", "example_de": "Das ist die Orange.", "example_ar": "هذا هو die Orange."}, "orange jam": {"key": "orange jam", "world": "Supermarket", "de": "die Orangenmarmelade", "article": "die", "gender": "feminin", "en": "orange jam", "ar": "la mermelada de naranja", "example_de": "Das ist die Orangenmarmelade.", "example_ar": "هذا هو die Orangenmarmelade."}, "orange juice": {"key": "orange juice", "world": "Supermarket", "de": "der Orangensaft", "article": "der", "gender": "maskulin", "en": "orange juice", "ar": "el jugo de naranja", "example_de": "Das ist der Orangensaft.", "example_ar": "هذا هو der Orangensaft."}, "pant": {"key": "pant", "world": "Supermarket", "de": "die Hose", "article": "die", "gender": "feminin", "en": "pant", "ar": "el pantalón", "example_de": "Das ist die Hose.", "example_ar": "هذا هو die Hose."}, "pasta": {"key": "pasta", "world": "Supermarket", "de": "die Pasta", "article": "die", "gender": "feminin", "en": "pasta", "ar": "la pasta", "example_de": "Das ist die Pasta.", "example_ar": "هذا هو die Pasta."}, "peanut butter": {"key": "peanut butter", "world": "Supermarket", "de": "die Erdnussbutter", "article": "die", "gender": "feminin", "en": "peanut butter", "ar": "la mantequilla de maní", "example_de": "Das ist die Erdnussbutter.", "example_ar": "هذا هو die Erdnussbutter."}, "rack": {"key": "rack", "world": "Supermarket", "de": "das Regal", "article": "das", "gender": "neutrum", "en": "rack", "ar": "el estante", "example_de": "Das ist das Regal.", "example_ar": "هذا هو das Regal."}, "rice": {"key": "rice", "world": "Supermarket", "de": "der Reis", "article": "der", "gender": "maskulin", "en": "rice", "ar": "أرز", "example_de": "Wir essen Hähnchen mit gekochtem Reis.", "example_ar": "نحن نأكل الدجاج مع الأرز المطبوخ."}, "shampoo": {"key": "shampoo", "world": "Supermarket", "de": "das Shampoo", "article": "das", "gender": "neutrum", "en": "shampoo", "ar": "el champú", "example_de": "Das ist das Shampoo.", "example_ar": "هذا هو das Shampoo."}, "shirt": {"key": "shirt", "world": "Supermarket", "de": "das Hemd", "article": "das", "gender": "neutrum", "en": "shirt", "ar": "la camisa", "example_de": "Das ist das Hemd.", "example_ar": "هذا هو das Hemd."}, "shopping cart": {"key": "shopping cart", "world": "Supermarket", "de": "der Einkaufswagen", "article": "der", "gender": "maskulin", "en": "shopping cart", "ar": "عربة تسوق", "example_de": "Ich lege alle Einkäufe in den Einkaufswagen.", "example_ar": "أضع كل المشتريات في عربة التسوق."}, "soda can": {"key": "soda can", "world": "Supermarket", "de": "die Getränkedose", "article": "die", "gender": "feminin", "en": "soda can", "ar": "la lata de refresco", "example_de": "Das ist die Getränkedose.", "example_ar": "هذا هو die Getränkedose."}, "soya sauce": {"key": "soya sauce", "world": "Supermarket", "de": "die Sojasauce", "article": "die", "gender": "feminin", "en": "soya sauce", "ar": "la salsa de soya", "example_de": "Das ist die Sojasauce.", "example_ar": "هذا هو die Sojasauce."}, "strawberry jam": {"key": "strawberry jam", "world": "Supermarket", "de": "die Erdbeermarmelade", "article": "die", "gender": "feminin", "en": "strawberry jam", "ar": "la mermelada de fresa", "example_de": "Das ist die Erdbeermarmelade.", "example_ar": "هذا هو die Erdbeermarmelade."}, "toilet cleaner": {"key": "toilet cleaner", "world": "Supermarket", "de": "der WC-Reiniger", "article": "der", "gender": "maskulin", "en": "toilet cleaner", "ar": "el limpiador de inodoro", "example_de": "Das ist der WC-Reiniger.", "example_ar": "هذا هو der WC-Reiniger."}, "tomato sauce": {"key": "tomato sauce", "world": "Supermarket", "de": "die Tomatensoße", "article": "die", "gender": "feminin", "en": "tomato sauce", "ar": "la salsa de tomate", "example_de": "Das ist die Tomatensoße.", "example_ar": "هذا هو die Tomatensoße."}, "toothpaste": {"key": "toothpaste", "world": "Supermarket", "de": "die Zahnpasta", "article": "die", "gender": "feminin", "en": "toothpaste", "ar": "la pasta de dientes", "example_de": "Das ist die Zahnpasta.", "example_ar": "هذا هو die Zahnpasta."}, "tshirt": {"key": "tshirt", "world": "Supermarket", "de": "das T-Shirt", "article": "das", "gender": "neutrum", "en": "tshirt", "ar": "la camiseta", "example_de": "Das ist das T-Shirt.", "example_ar": "هذا هو das T-Shirt."}, "washing powder": {"key": "washing powder", "world": "Supermarket", "de": "das Waschpulver", "article": "das", "gender": "neutrum", "en": "washing powder", "ar": "el detergente en polvo", "example_de": "Das ist das Waschpulver.", "example_ar": "هذا هو das Waschpulver."}, "water bottle": {"key": "water bottle", "world": "Supermarket", "de": "die Wasserflasche", "article": "die", "gender": "feminin", "en": "water bottle", "ar": "la botella de agua", "example_de": "Das ist die Wasserflasche.", "example_ar": "هذا هو die Wasserflasche."}, "watermelon": {"key": "watermelon", "world": "Supermarket", "de": "die Wassermelone", "article": "die", "gender": "feminin", "en": "watermelon", "ar": "la sandía", "example_de": "Das ist die Wassermelone.", "example_ar": "هذا هو die Wassermelone."}, "wheat": {"key": "wheat", "world": "Supermarket", "de": "der Weizen", "article": "der", "gender": "maskulin", "en": "wheat", "ar": "el trigo", "example_de": "Das ist der Weizen.", "example_ar": "هذا هو der Weizen."}, "white bread": {"key": "white bread", "world": "Supermarket", "de": "das Weißbrot", "article": "das", "gender": "neutrum", "en": "white bread", "ar": "el pan blanco", "example_de": "Das ist das Weißbrot.", "example_ar": "هذا هو das Weißbrot."}};

  const SUPPORT_LANGUAGE_KEY = 'lw_support_language';
  const COPY = {
    de: {
      supportLanguage: 'Erklärungssprache',
      homeHeading: 'Deutsch lernen',
      homeNote: 'Deutsch ist die Lernsprache. Arabische oder englische Hilfe kannst du bei Bedarf auswählen.',
      beginner: 'Anfänger',
      explorer: 'Entdecker',
      advanced: 'Fortgeschritten',
      germanMaster: 'Deutsch-Profi',
      example: 'Beispiel',
      translationExample: 'Übersetzung',
      close: 'Schließen',
      reviewVocabulary: 'Wörter wiederholen',
      chooseWordToReview: 'Wähle ein Wort, um Artikel und Aussprache zu wiederholen.',
      plural: 'Plural / Ausdruck',
      tip: (article) => `Lerne jedes Nomen mit seinem Artikel (${article}) und seiner Farbe.`,
      listen: 'Aussprache anhören',
      practice: 'Sprechen üben',
      listening: 'Ich höre zu … Sprich jetzt!',
      excellent: 'Ausgezeichnete Aussprache!',
      heard: 'Erkannt',
      tryAgain: 'Versuche es noch einmal.',
      speechUnavailable: 'Spracherkennung ist in diesem Browser nicht verfügbar.',
      speechError: 'Ich konnte dich nicht hören. Versuch es noch einmal.',
      questCompleted: (title) => `Aufgabe „${title}“ abgeschlossen! 🎉`,
      found: (word) => `${word} gefunden!`,
      pronounced: (word) => `${word} richtig ausgesprochen!`,
      correct: (word) => `Richtige Antwort: ${word}`,
      challenge: 'Artikel-Quiz',
      chooseArticle: 'Wähle den richtigen Artikel: der, die oder das.',
      loading: 'Wird geladen …',
      time: 'Zeit',
      streak: 'Serie',
      score: 'Punkte',
      masculine: 'maskulin',
      feminine: 'feminin',
      neuter: 'neutrum',
      timeUp: (score) => `Zeit abgelaufen! Dein Punktestand: ${score} XP`,
      wrong: (word) => `Noch nicht. Der richtige Artikel ist ${word}.`
    },
    en: {
      supportLanguage: 'Explain in',
      homeHeading: 'Learn German',
      homeNote: 'German is your learning language. Choose Arabic or English for explanations.',
      beginner: 'Beginner',
      explorer: 'Explorer',
      advanced: 'Advanced',
      germanMaster: 'German master',
      example: 'Example',
      translationExample: 'Translation',
      close: 'Close',
      reviewVocabulary: 'Review words',
      chooseWordToReview: 'Choose a word to review its article and pronunciation.',
      plural: 'plural / expression',
      tip: (article) => `Learn each noun with its article (${article}) and color.`,
      listen: 'Listen to pronunciation',
      practice: 'Practice speaking',
      listening: 'Listening… speak now!',
      excellent: 'Great pronunciation!',
      heard: 'We heard',
      tryAgain: 'Try again.',
      speechUnavailable: 'Speech recognition is not available in this browser.',
      speechError: 'Could not hear you. Please try again.',
      questCompleted: (title) => `You completed "${title}"! 🎉`,
      found: (word) => `Found ${word}!`,
      pronounced: (word) => `Pronounced ${word} successfully!`,
      correct: (word) => `Correct answer: ${word}`,
      challenge: 'Article challenge',
      chooseArticle: 'Choose the correct article: Der, Die, or Das',
      loading: 'Loading...',
      time: 'Time',
      streak: 'Streak',
      score: 'Score',
      masculine: 'masculine',
      feminine: 'feminine',
      neuter: 'neuter',
      timeUp: (score) => `Time is up! Your score: ${score} XP`,
      wrong: (word) => `Not quite. The correct answer is ${word}.`
    },
    ar: {
      supportLanguage: 'لغة الشرح',
      homeHeading: 'تعلّم الألمانية',
      homeNote: 'لغة التعلّم هي الألمانية. اختر العربية أو الإنجليزية للشرح.',
      beginner: 'مبتدئ',
      explorer: 'مستكشف',
      advanced: 'متقدم',
      germanMaster: 'خبير الألمانية',
      example: 'مثال',
      translationExample: 'الترجمة',
      close: 'إغلاق',
      reviewVocabulary: 'راجع المفردات',
      chooseWordToReview: 'اختر كلمة لمراجعة أداة التعريف والنطق.',
      plural: 'جمع / تعبير',
      tip: (article) => `احفظ كل اسم مع أداة التعريف (${article}) ولونها.`,
      listen: 'استمع إلى النطق',
      practice: 'تدرّب على النطق',
      listening: 'جارٍ الاستماع... تكلّم الآن!',
      excellent: 'نطق ممتاز!',
      heard: 'سمعنا',
      tryAgain: 'حاول مرة أخرى.',
      speechUnavailable: 'التعرّف على الصوت غير متاح في هذا المتصفح.',
      speechError: 'لم يتم التقاط الصوت. حاول مرة أخرى.',
      questCompleted: (title) => `أكملت مهمة "${title}" بنجاح! 🎉`,
      found: (word) => `وجدت ${word}!`,
      pronounced: (word) => `نطقت ${word} بنجاح!`,
      correct: (word) => `إجابة صحيحة (${word})`,
      challenge: 'تحدي أدوات التعريف',
      chooseArticle: 'اختر أداة التعريف الصحيحة: Der أو Die أو Das',
      loading: 'جارٍ التحميل...',
      time: 'الوقت',
      streak: 'المتتالية',
      score: 'النقاط',
      masculine: 'مذكر',
      feminine: 'مؤنث',
      neuter: 'محايد',
      timeUp: (score) => `انتهى الوقت! مجموع نقاطك: ${score} XP`,
      wrong: (word) => `إجابة غير صحيحة. الأداة الصحيحة هي ${word}.`
    }
  };

  function getSupportLanguage() {
    const language = localStorage.getItem(SUPPORT_LANGUAGE_KEY);
    return language === 'ar' || language === 'en' ? language : 'de';
  }

  function copy(key, ...values) {
    const value = (COPY[getSupportLanguage()] || COPY.de)[key];
    return typeof value === 'function' ? value(...values) : value;
  }

  function getItemTranslation(item) {
    const language = getSupportLanguage();
    return language === 'en' ? item.en : language === 'ar' ? item.ar : '';
  }

  function getTaskTranslation(task) {
    const language = getSupportLanguage();
    if (language === 'ar') return task.ar;
    if (language === 'en') return task.en || GERMAN_VOCAB[task.key]?.en || task.key;
    return '';
  }

  // 3. World Quests
  const QUESTS = {
    Supermarket: {
      id: 'supermarket_quest',
      title: 'Einkauf für das Abendessen',
      title_ar: 'مهمة: تسوق لتحضير العشاء في السوبرماركت',
      title_en: 'Shopping for dinner',
      world: 'Supermarket',
      rewardXP: 150,
      tasks: [
        { key: 'apple', de: 'der Apfel', ar: 'تفاحة', gender: 'maskulin', completed: false },
        { key: 'bread', de: 'das Brot', ar: 'خبز', gender: 'neutrum', completed: false },
        { key: 'milk', de: 'die Milch', ar: 'حليب', gender: 'feminin', completed: false },
        { key: 'cheese', de: 'der Käse', ar: 'جبن', gender: 'maskulin', completed: false }
      ]
    },
    Restaurant: {
      id: 'restaurant_quest',
      title: 'Im Restaurant & Café',
      title_ar: 'مهمة: في المطعم والمقهى وتناول وجبة',
      title_en: 'At the restaurant and café',
      world: 'Restaurant',
      rewardXP: 150,
      tasks: [
        { key: 'table', de: 'der Tisch', ar: 'طاولة', gender: 'maskulin', completed: false },
        { key: 'menu', de: 'die Speisekarte', ar: 'قائمة طعام', gender: 'feminin', completed: false },
        { key: 'glass', de: 'das Glas', ar: 'كأس', gender: 'neutrum', completed: false },
        { key: 'cup', de: 'die Tasse', ar: 'فنجان', gender: 'feminin', completed: false }
      ]
    },
    City: {
      id: 'city_quest',
      title: 'Orientierung in der Stadt',
      title_ar: 'مهمة: جولة في شوارع المدينة ووسائل النقل',
      title_en: 'Finding your way around town',
      world: 'City',
      rewardXP: 150,
      tasks: [
        { key: 'bus', de: 'der Bus', ar: 'حافلة', gender: 'maskulin', completed: false },
        { key: 'bicycle', de: 'das Fahrrad', ar: 'دراجة هوائية', gender: 'neutrum', completed: false },
        { key: 'drug store', de: 'die Apotheke', ar: 'صيدلية', gender: 'feminin', completed: false },
        { key: 'car', de: 'das Auto', ar: 'سيارة', gender: 'neutrum', completed: false }
      ]
    },
    House: {
      id: 'house_quest',
      title: 'Mein gemütliches Zuhause',
      title_ar: 'مهمة: استكشاف أثاث وغرف المنزل',
      title_en: 'My cozy home',
      world: 'House',
      rewardXP: 150,
      tasks: [
        { key: 'bed', de: 'das Bett', ar: 'سرير', gender: 'neutrum', completed: false },
        { key: 'fridge', de: 'der Kühlschrank', ar: 'ثلاجة', gender: 'maskulin', completed: false },
        { key: 'lamp', de: 'die Lampe', ar: 'مصباح', gender: 'feminin', completed: false },
        { key: 'sofa', de: 'das Sofa', ar: 'أريكة', gender: 'neutrum', completed: false }
      ]
    },
    Classroom: {
      id: 'classroom_quest',
      title: 'Erster Tag in der Schule',
      title_ar: 'مهمة: اليوم الدراسي الأول في الفصل',
      title_en: 'First day at school',
      world: 'Classroom',
      rewardXP: 150,
      tasks: [
        { key: 'black board', de: 'die Tafel', ar: 'سبورة', gender: 'feminin', completed: false },
        { key: 'book', de: 'das Buch', ar: 'كتاب', gender: 'neutrum', completed: false },
        { key: 'computer', de: 'der Computer', ar: 'حاسوب', gender: 'maskulin', completed: false },
        { key: 'pen', de: 'der Kugelschreiber', ar: 'قلم حبر', gender: 'maskulin', completed: false }
      ]
    }
  };

  // 4. State Management
  const State = {
    xp: parseInt(localStorage.getItem('de_xp') || '0', 10),
    level: 1,
    currentWorld: null,
    activeQuest: null,
    completedQuests: JSON.parse(localStorage.getItem('de_completed_quests') || '[]'),

    addXP(points, reason) {
      const prevXP = this.xp;
      this.xp += points;
      localStorage.setItem('de_xp', this.xp.toString());
      this.calcLevel();
      this.updateHUD();
      showToast(`+${points} XP: ${reason}`);
      playSFX('Correct');

      // XP Milestone Achievement Popups
      const milestones = [
        { xp: 100,  name: 'Sprachanfänger',  badge: '🌟' },
        { xp: 250,  name: 'Sprachentdecker', badge: '🔥' },
        { xp: 500,  name: 'Sprachtalent',    badge: '🏅' },
        { xp: 1000, name: 'Sprachprofi',     badge: '🏆' },
        { xp: 2000, name: 'Deutsch-Meister', badge: '🎖️' }
      ];
      for (const m of milestones) {
        if (prevXP < m.xp && this.xp >= m.xp) {
          setTimeout(() => showAchievementModal(m), 600);
          break;
        }
      }
    },

    calcLevel() {
      if (this.xp >= 1000) this.level = 4;
      else if (this.xp >= 500) this.level = 3;
      else if (this.xp >= 200) this.level = 2;
      else this.level = 1;
    },

    getLevelName() {
      const names = {
        1: copy('beginner'),
        2: copy('explorer'),
        3: copy('advanced'),
        4: copy('germanMaster')
      };
      return names[this.level] || names[1];
    },

    updateHUD() {
      const xpEl = document.getElementById('de-hud-xp-val');
      if (xpEl) xpEl.textContent = `${this.xp} XP`;
      const lvlEl = document.getElementById('de-hud-lvl-val');
      if (lvlEl) lvlEl.textContent = this.getLevelName();
    }
  };
  State.calcLevel();

  // 5. Native German Speech Synthesis (TTS)
  function speakGerman(text) {
    if (!('speechSynthesis' in window)) return;
    const spokenText = String(text ?? '').replace(/\s+/g, ' ').trim();
    if (!spokenText) return;

    const speech = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = 'de-DE';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;

    const voices = speech.getVoices();
    const germanVoice = voices.find((voice) => voice.lang.toLowerCase() === 'de-de')
      || voices.find((voice) => /^de(?:-|$)/i.test(voice.lang));
    if (germanVoice) utterance.voice = germanVoice;

    utterance.onerror = (event) => {
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        console.error('German speech synthesis failed:', event.error);
      }
    };

    speech.cancel();
    speech.speak(utterance);
  }

  // Pre-load voices
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }

  // 6. Sound Effects Helper
  let deAudioContext = null;

  function ensureAudioContext() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!deAudioContext) {
      deAudioContext = new AudioCtx();
    }
    if (deAudioContext.state === 'suspended') {
      deAudioContext.resume().catch(() => {});
    }
    return deAudioContext;
  }

  function playTone({ frequency = 440, duration = 0.12, type = 'sine', volume = 0.05, sweep = 0 }) {
    const ctx = ensureAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    if (sweep) {
      oscillator.frequency.linearRampToValueAtTime(frequency + sweep, ctx.currentTime + duration);
    }

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  }

  function playSFX(name) {
    const toneMap = {
      Correct: [
        { frequency: 660, duration: 0.08, type: 'triangle', volume: 0.045, sweep: 140 },
        { frequency: 880, duration: 0.15, type: 'triangle', volume: 0.05, sweep: 180 }
      ],
      Wrong: [
        { frequency: 220, duration: 0.12, type: 'sawtooth', volume: 0.04, sweep: -120 },
        { frequency: 150, duration: 0.18, type: 'square', volume: 0.03, sweep: -60 }
      ],
      LessonComplete: [
        { frequency: 440, duration: 0.1, type: 'triangle', volume: 0.05, sweep: 120 },
        { frequency: 587, duration: 0.12, type: 'triangle', volume: 0.05, sweep: 120 },
        { frequency: 784, duration: 0.18, type: 'triangle', volume: 0.05, sweep: 180 }
      ]
    };

    const tones = toneMap[name] || [
      { frequency: 523.25, duration: 0.08, type: 'sine', volume: 0.035, sweep: 80 }
    ];

    tones.forEach((tone, index) => {
      setTimeout(() => playTone(tone), index * 60);
    });
  }

  // 7. Toast Notification
  function showToast(message) {
    const oldToast = document.querySelector('.de-toast');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    const isSuccess = /\+\d+ XP|correct|excellent|completed|success|great|congrats|geschafft|richtig/i.test(message);
    const isError = /wrong|not quite|try again|falsch|fehler|incorrect/i.test(message);
    toast.className = `de-toast ${isSuccess ? 'de-toast-success' : isError ? 'de-toast-error' : ''}`.trim();
    toast.dir = getSupportLanguage() === 'ar' ? 'rtl' : 'ltr';
    toast.lang = getSupportLanguage();
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = isSuccess
      ? '<path d="M5 12l5 5L20 2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />'
      : isError
        ? '<path d="M12 8v5m0 5h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />'
        : '<path d="M12 3v18M5 7h14M5 17h14" />';
    const content = document.createElement('span');
    content.textContent = message;
    toast.append(icon, content);
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2200);
  }

  // 8. Detect Current World
  function detectWorld() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('supermarket')) return 'Supermarket';
    if (path.includes('restaurant')) return 'Restaurant';
    if (path.includes('city')) return 'City';
    if (path.includes('house')) return 'House';
    if (path.includes('classroom')) return 'Classroom';
    return null;
  }

  // 9. Render Top HUD Bar
  function renderHUD() {
    if (document.getElementById('de-top-hud')) return;

    const activityGroupLabel = getSupportLanguage() === 'de'
      ? 'Deutsch-Lernaktivitäten'
      : getSupportLanguage() === 'en' ? 'German learning activities' : 'أنشطة تعلم الألمانية';
    const hud = document.createElement('div');
    hud.id = 'de-top-hud';
    hud.className = 'de-hud-bar';
    hud.innerHTML = `
      <div class="de-hud-stats">
        <div class="de-hud-lang">
          <span class="de-flag" aria-hidden="true"><i></i><i></i><i></i></span> <span>Deutsch</span>
        </div>
        <div class="de-hud-level">
          <span id="de-hud-lvl-val">${State.getLevelName()}</span>
        </div>
        <div class="de-hud-xp">
          <span id="de-hud-xp-val">${State.xp} XP</span>
          <span class="de-hud-xp-track" aria-hidden="true"><i></i></span>
        </div>
        <label class="de-language-control">
          <span id="de-support-language-label">${copy('supportLanguage')}</span>
          <select id="de-support-language" aria-label="${copy('supportLanguage')}">
            <option value="de">Deutsch (keine Übersetzung)</option>
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>
      <div class="de-hud-actions" role="group" aria-label="${activityGroupLabel}">
        <button class="de-hud-btn quest-btn" id="de-launch-dialogue-btn" title="بدء محادثة ألمانية تفاعلية" aria-label="Dialoge">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 2 1.5-4A7.5 7.5 0 1 1 20 11.5Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/></svg><span>Dialoge</span>
        </button>
        <button class="de-hud-btn" id="de-launch-game-btn" title="${copy('challenge')}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8h10a4 4 0 0 1 3.8 5.2l-1 3A2.5 2.5 0 0 1 16 17l-2-2H10l-2 2a2.5 2.5 0 0 1-3.8-.8l-1-3A4 4 0 0 1 7 8Z"/><path d="M7 11v4M5 13h4M16 12h.01M18 14h.01"/></svg><span>Der Die Das</span>
        </button>
        <button class="de-hud-btn de-review-btn" id="de-review-vocab-btn" title="${copy('reviewVocabulary')}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z"/><path d="M4 6h13M8 8h7M8 12h7"/></svg><span>${copy('reviewVocabulary')}</span>
        </button>
      </div>
    `;
    document.body.appendChild(hud);
    hud.querySelector('#de-support-language').value = getSupportLanguage();

    document.getElementById('de-launch-dialogue-btn').addEventListener('click', () => {
      const w = detectWorld() || 'Supermarket';
      openDialogue(w);
    });
    document.getElementById('de-review-vocab-btn').addEventListener('click', openVocabularyReview);
    document.getElementById('de-launch-game-btn').addEventListener('click', () => {
      openDerDieDasGame();
    });
    document.getElementById('de-support-language').addEventListener('change', (event) => {
      setSupportLanguage(event.target.value);
    });
  }

  let germanSelectionRequested = false;

  function enforceGermanOnlyHome() {
    const section = document.querySelector('.ls-language-section');
    const grid = section?.querySelector('.ls-language-grid');
    if (!section || !grid) return;
    section.dir = getSupportLanguage() === 'ar' ? 'rtl' : 'ltr';
    section.lang = getSupportLanguage();

    const buttons = [...grid.querySelectorAll('.ls-lang-btn')];
    const germanButton = buttons.find((button) => {
      const label = button.querySelector('.ls-lang-text')?.textContent.trim().toLowerCase();
      return label === 'german' || label === 'deutsch';
    });
    if (!germanButton) return;

    if (!germanSelectionRequested && !germanButton.classList.contains('active')) {
      germanSelectionRequested = true;
      germanButton.click();
    }

    buttons.forEach((button) => {
      const isGerman = button === germanButton;
      button.hidden = !isGerman;
      button.setAttribute('aria-hidden', String(!isGerman));
      if (!isGerman) button.tabIndex = -1;
    });

    const heading = section.querySelector('.ls-subtitle');
    if (heading && heading.textContent !== copy('homeHeading')) {
      heading.textContent = copy('homeHeading');
    }

    let note = section.querySelector('.lw-language-note');
    if (!note) {
      note = document.createElement('p');
      note.className = 'lw-language-note';
      grid.insertAdjacentElement('afterend', note);
    }
    const language = getSupportLanguage();
    const noteText = copy('homeNote');
    if (note.textContent !== noteText) note.textContent = noteText;
    if (note.lang !== language) note.lang = language;
    const direction = language === 'ar' ? 'rtl' : 'ltr';
    if (note.dir !== direction) note.dir = direction;
  }

  function setupGermanOnlyHome() {
    document.addEventListener('click', (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const button = target?.closest('.ls-lang-btn');
      if (!button) return;
      const label = button.querySelector('.ls-lang-text')?.textContent.trim().toLowerCase();
      if (label !== 'german' && label !== 'deutsch') {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);

    const observer = new MutationObserver(enforceGermanOnlyHome);
    observer.observe(document.body, { childList: true, subtree: true });
    enforceGermanOnlyHome();
  }

  // 10. Render Quest HUD in 3D Levels
  function renderQuestWidget() {
    const world = detectWorld();
    if (!world || !QUESTS[world]) return;
    if (document.getElementById('de-quest-hud')) return;

    const quest = QUESTS[world];
    State.currentWorld = world;
    State.activeQuest = quest;

    const completedCount = quest.tasks.filter(t => t.completed).length;
    const progressPercent = Math.round((completedCount / quest.tasks.length) * 100);

    const widget = document.createElement('section');
    widget.id = 'de-quest-hud';
    widget.className = 'de-quest-widget collapsed';
    widget.dir = getSupportLanguage() === 'ar' ? 'rtl' : 'ltr';
    widget.lang = getSupportLanguage();
    let expanded = false;
    try {
      expanded = localStorage.getItem('lw_hud_quest_expanded') === 'true';
    } catch (error) {}
    if (expanded) widget.classList.remove('collapsed');
    document.body.classList.toggle('quest-expanded', expanded);
    widget.innerHTML = `
      <button class="de-quest-header" type="button" aria-expanded="${expanded}">
        <span class="de-quest-title"><span>${quest.title}</span></span>
        <span class="de-quest-summary">
          <span class="de-quest-count">${completedCount}/${quest.tasks.length} ${getSupportLanguage() === 'ar' ? 'كلمات' : getSupportLanguage() === 'en' ? 'words' : 'Wörter'}</span>
          <span class="de-quest-reward">+${quest.rewardXP} XP</span>
        </span>
      </button>
      <div class="de-quest-progress-bar">
        <div class="de-quest-progress-fill" id="de-quest-bar" style="width: ${progressPercent}%;"></div>
      </div>
      <div class="de-quest-ar" id="de-quest-subtitle" ${expanded ? '' : 'hidden'}>${getQuestTranslation(quest)}</div>
      <div class="de-quest-list" id="de-quest-tasks" ${expanded ? '' : 'hidden'}>
        ${quest.tasks.map(t => `
          <div class="de-quest-item ${t.completed ? 'completed' : ''}" data-key="${t.key}">
            <span class="de-quest-word"><bdi lang="de" dir="ltr">${t.de}</bdi><span lang="${getSupportLanguage()}" dir="${getSupportLanguage() === 'ar' ? 'rtl' : 'ltr'}">${getTaskTranslation(t)}</span></span>
            <span class="de-badge-${t.gender === 'maskulin' ? 'der' : t.gender === 'feminin' ? 'die' : 'das'}">
              ${t.gender === 'maskulin' ? 'der' : t.gender === 'feminin' ? 'die' : 'das'}
            </span>
          </div>
        `).join('')}
      </div>
    `;
    widget.dataset.completedCount = String(completedCount);
    document.body.appendChild(widget);
    const header = widget.querySelector('.de-quest-header');
    header.addEventListener('click', () => {
      const nextExpanded = widget.classList.contains('collapsed');
      widget.classList.toggle('collapsed', !nextExpanded);
      document.body.classList.toggle('quest-expanded', nextExpanded);
      header.setAttribute('aria-expanded', String(nextExpanded));
      widget.querySelector('#de-quest-subtitle').hidden = !nextExpanded;
      widget.querySelector('#de-quest-tasks').hidden = !nextExpanded;
      try {
        localStorage.setItem('lw_hud_quest_expanded', String(nextExpanded));
      } catch (error) {}
    });
  }

  function getQuestTranslation(quest) {
    const language = getSupportLanguage();
    return language === 'ar' ? quest.title_ar : language === 'en' ? quest.title_en : quest.title;
  }

  function showWorldObjectWord(key) {
    const item = GERMAN_VOCAB[key];
    if (!item) return;

    recentWorldObjectClick = { key, expiresAt: Date.now() + 1800 };
    document.querySelector('.de-object-word-toast')?.remove();
    if (worldObjectToastTimer) window.clearTimeout(worldObjectToastTimer);

    const language = getSupportLanguage();
    const toast = document.createElement('div');
    toast.className = 'de-object-word-toast';
    toast.dir = language === 'ar' ? 'rtl' : 'ltr';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    const germanWord = document.createElement('bdi');
    germanWord.className = 'de-object-word-german';
    germanWord.lang = 'de';
    germanWord.dir = 'ltr';
    germanWord.textContent = item.de;

    const translation = document.createElement('span');
    translation.className = 'de-object-word-translation';
    translation.lang = language;
    translation.dir = language === 'ar' ? 'rtl' : 'ltr';
    translation.textContent = getItemTranslation(item);

    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = '<path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 2 1.5-4A7.5 7.5 0 1 1 20 11.5Z" />';

    toast.append(icon, translation, germanWord);
    document.body.appendChild(toast);
    worldObjectToastTimer = window.setTimeout(() => {
      toast.classList.add('is-leaving');
      worldObjectToastTimer = window.setTimeout(() => {
        toast.remove();
        worldObjectToastTimer = null;
      }, 180);
    }, 2320);
    speakGerman(item.de);
  }

  // 11. Handle 3D Item Interaction
  function handleItemInteraction(key) {
    const item = GERMAN_VOCAB[key];
    if (!item) return;

    // Check if this fulfills an active quest task
    if (State.activeQuest) {
      const task = State.activeQuest.tasks.find(t => t.key.toLowerCase() === key.toLowerCase());
      if (task && !task.completed) {
        task.completed = true;
        State.addXP(30, copy('found', task.de));
        updateQuestDisplay();

        // Check if all completed
        const allDone = State.activeQuest.tasks.every(t => t.completed);
        if (allDone && !State.completedQuests.includes(State.activeQuest.id)) {
          State.completedQuests.push(State.activeQuest.id);
          localStorage.setItem('de_completed_quests', JSON.stringify(State.completedQuests));
          State.addXP(State.activeQuest.rewardXP, copy('questCompleted', getQuestTranslation(State.activeQuest)));
          playSFX('LessonComplete');
        }
      }
    }

    // Open Enhanced Learning Modal
    openEnhancedWordModal(item);
  }

  function updateQuestDisplay() {
    const quest = State.activeQuest;
    if (!quest) return;
    const tasksEl = document.getElementById('de-quest-tasks');
    const barEl = document.getElementById('de-quest-bar');
    if (!tasksEl || !barEl) return;

    const widget = document.getElementById('de-quest-hud');
    if (widget) {
      widget.dir = getSupportLanguage() === 'ar' ? 'rtl' : 'ltr';
      widget.lang = getSupportLanguage();
    }
    const subtitleEl = document.getElementById('de-quest-subtitle');
    if (subtitleEl) subtitleEl.textContent = getQuestTranslation(quest);

    const completedCount = quest.tasks.filter(t => t.completed).length;
    const progressPercent = Math.round((completedCount / quest.tasks.length) * 100);
    barEl.style.width = `${progressPercent}%`;

    tasksEl.innerHTML = quest.tasks.map(t => `
      <div class="de-quest-item ${t.completed ? 'completed' : ''}" data-key="${t.key}">
        <span class="de-quest-word"><bdi lang="de" dir="ltr">${t.de}</bdi><span lang="${getSupportLanguage()}" dir="${getSupportLanguage() === 'ar' ? 'rtl' : 'ltr'}">${getTaskTranslation(t)}</span></span>
        <span class="de-badge-${t.gender === 'maskulin' ? 'der' : t.gender === 'feminin' ? 'die' : 'das'}">
          ${t.gender === 'maskulin' ? 'der' : t.gender === 'feminin' ? 'die' : 'das'}
        </span>
      </div>
    `).join('');
    const count = widget.querySelector('.de-quest-count');
    if (count) count.textContent = `${completedCount}/${quest.tasks.length} ${getSupportLanguage() === 'ar' ? 'كلمات' : getSupportLanguage() === 'en' ? 'words' : 'Wörter'}`;
    const previousCount = Number(widget.dataset.completedCount || 0);
    if (completedCount !== previousCount) {
      widget.classList.remove('progress-pulse');
      void widget.offsetWidth;
      widget.classList.add('progress-pulse');
    }
    widget.dataset.completedCount = String(completedCount);
  }

  function openVocabularyReview() {
    const previous = document.querySelector('.de-vocab-review-overlay');
    if (previous) previous.remove();

    const overlay = document.createElement('div');
    overlay.className = 'de-game-overlay de-vocab-review-overlay';
    overlay.dir = getSupportLanguage() === 'ar' ? 'rtl' : 'ltr';
    overlay.lang = getSupportLanguage();
    overlay.innerHTML = `
      <section class="de-game-container de-vocab-review-container" role="dialog" aria-modal="true" aria-labelledby="de-vocab-review-title">
        <button class="de-modal-close" id="de-vocab-review-close" aria-label="${copy('close')}">&times;</button>
        <h2 id="de-vocab-review-title">${copy('reviewVocabulary')}</h2>
        <p id="de-vocab-review-instruction">${copy('chooseWordToReview')}</p>
        <div class="de-vocab-review-list" id="de-vocab-review-list"></div>
      </section>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#de-vocab-review-close').addEventListener('click', () => overlay.remove());
    renderVocabularyReviewList(overlay);
  }

  function renderVocabularyReviewList(overlay) {
    const list = overlay.querySelector('#de-vocab-review-list');
    if (!list) return;
    list.replaceChildren();

    Object.values(GERMAN_VOCAB)
      .sort((first, second) => first.de.localeCompare(second.de, 'de'))
      .forEach((item) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'de-vocab-review-item';
        const german = document.createElement('span');
        german.textContent = item.de;
        const translation = document.createElement('span');
        translation.textContent = getItemTranslation(item);
        button.append(german, translation);
        button.addEventListener('click', () => {
          overlay.remove();
          openEnhancedWordModal(item);
        });
        list.append(button);
      });
  }

  function setSupportLanguage(language) {
    const selectedLanguage = language === 'ar' || language === 'en' ? language : 'de';
    localStorage.setItem(SUPPORT_LANGUAGE_KEY, selectedLanguage);

    const selector = document.getElementById('de-support-language');
    if (selector) selector.value = selectedLanguage;
    const label = document.getElementById('de-support-language-label');
    if (label) label.textContent = copy('supportLanguage');
    const gameButton = document.getElementById('de-launch-game-btn');
    if (gameButton) gameButton.title = copy('challenge');
    const reviewButton = document.getElementById('de-review-vocab-btn');
    if (reviewButton) {
      reviewButton.title = copy('reviewVocabulary');
      reviewButton.querySelector('span').textContent = copy('reviewVocabulary');
    }

    State.updateHUD();
    enforceGermanOnlyHome();
    updateQuestDisplay();
    const reviewOverlay = document.querySelector('.de-vocab-review-overlay');
    if (reviewOverlay) {
      reviewOverlay.dir = selectedLanguage === 'ar' ? 'rtl' : 'ltr';
      reviewOverlay.lang = selectedLanguage;
      document.getElementById('de-vocab-review-title').textContent = copy('reviewVocabulary');
      document.getElementById('de-vocab-review-instruction').textContent = copy('chooseWordToReview');
      document.getElementById('de-vocab-review-close').setAttribute('aria-label', copy('close'));
      renderVocabularyReviewList(reviewOverlay);
    }
    updateOpenGameLanguage();
    if (State.currentItem && document.querySelector('.de-learning-modal')) {
      openEnhancedWordModal(State.currentItem, false);
    }

    window.dispatchEvent(new CustomEvent('linguaworld:language-change', {
      detail: { language: selectedLanguage }
    }));
  }

  function updateOpenGameLanguage() {
    const overlay = document.querySelector('.de-game-overlay');
    if (!overlay) return;
    overlay.dir = getSupportLanguage() === 'ar' ? 'rtl' : 'ltr';
    overlay.lang = getSupportLanguage();

    const labels = {
      'de-game-title': `🎮 ${copy('challenge')}`,
      'de-game-instruction': copy('chooseArticle'),
      'de-game-time-label': `⏳ ${copy('time')}:`,
      'de-game-streak-label': `🔥 ${copy('streak')}:`,
      'de-game-score-label': `⭐ ${copy('score')}:`,
      'de-game-der-label': copy('masculine'),
      'de-game-die-label': copy('feminine'),
      'de-game-das-label': copy('neuter')
    };
    Object.entries(labels).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element && element.textContent !== value) element.textContent = value;
    });

    const closeButton = document.getElementById('de-game-close');
    if (closeButton) closeButton.setAttribute('aria-label', copy('close'));
    if (State.currentGameItem) {
      const hint = document.getElementById('de-game-ar-display');
      if (hint) hint.textContent = getItemTranslation(State.currentGameItem);
    }
  }

  // 12. Enhanced Word Learning Modal
  function openEnhancedWordModal(item, shouldSpeak = true) {
    State.currentItem = item;
    const oldModal = document.querySelector('.de-learning-modal');
    if (oldModal) oldModal.remove();

    const language = getSupportLanguage();
    const genderClass = item.gender === 'maskulin' ? 'de-gender-maskulin'
                      : item.gender === 'feminin' ? 'de-gender-feminin'
                      : item.gender === 'neutrum' ? 'de-gender-neutrum' : 'de-gender-other';

    const genderLabel = item.gender === 'maskulin' ? `🔵 DER (${copy('masculine')})`
                      : item.gender === 'feminin' ? `🔴 DIE (${copy('feminine')})`
                      : item.gender === 'neutrum' ? `🟢 DAS (${copy('neuter')})` : `🟡 ${copy('plural')}`;
    const exampleTranslation = language === 'ar' ? item.example_ar : language === 'en' ? item.example_en : '';

    const modal = document.createElement('div');
    modal.className = 'de-learning-modal';
    modal.dir = language === 'ar' ? 'rtl' : 'ltr';
    modal.lang = language;
    modal.innerHTML = `
      <div class="de-modal-header">
        <span class="de-gender-pill ${genderClass}">${genderLabel}</span>
        <button class="de-modal-close" id="de-modal-close-btn" aria-label="${copy('close')}">&times;</button>
      </div>
      <div class="de-word-title">${item.de}</div>
      <div class="de-word-ar">${getItemTranslation(item)}</div>

      <div class="de-example-box">
        <div style="font-size:11px; text-transform:uppercase; color:#2563eb; font-weight:800; margin-bottom:4px;">${copy('example')} (Beispielsatz):</div>
        <div class="de-example-de">${item.example_de}</div>
        ${exampleTranslation ? `<div class="de-example-ar">${exampleTranslation}</div>` : ''}
      </div>

      <div class="de-phonetics-tip">
        <span>💡</span> <span>${copy('tip', item.article || 'der/die/das')}</span>
      </div>

      <div class="de-modal-actions">
        <button class="de-action-btn de-btn-listen" id="de-listen-btn">
          <span>🔊</span> <span>${copy('listen')}</span>
        </button>
        <button class="de-action-btn de-btn-speak" id="de-speak-btn">
          <span>🎤</span> <span>${copy('practice')}</span>
        </button>
      </div>
    `;
    document.body.appendChild(modal);

    // Speak automatically upon opening
    if (shouldSpeak) speakGerman(item.de);

    // Events
    document.getElementById('de-modal-close-btn').addEventListener('click', () => {
      modal.remove();
    });

    document.getElementById('de-listen-btn').addEventListener('click', () => {
      speakGerman(item.de);
    });

    const speakBtn = document.getElementById('de-speak-btn');
    speakBtn.addEventListener('click', () => {
      practiceSpeaking(item.de, speakBtn);
    });
  }

  function setButtonMessage(button, icon, message) {
    const iconElement = document.createElement('span');
    iconElement.textContent = icon;
    const messageElement = document.createElement('span');
    messageElement.textContent = message;
    button.replaceChildren(iconElement, messageElement);
  }

  // 13. Speech Recognition Practice
  function practiceSpeaking(targetText, btnEl) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast(copy('speechUnavailable'));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    btnEl.classList.add('listening');
    setButtonMessage(btnEl, '🔴', copy('listening'));

    recognition.onresult = (event) => {
      btnEl.classList.remove('listening');
      const spoken = event.results[0][0].transcript.toLowerCase().trim();
      const target = targetText.toLowerCase().replace(/^(der|die|das)\s+/i, '').trim();

      if (spoken.includes(target) || target.includes(spoken)) {
        setButtonMessage(btnEl, '🎉', `${copy('excellent')} (+50 XP)`);
        btnEl.style.background = '#10b981';
        State.addXP(50, copy('pronounced', targetText));
      } else {
        setButtonMessage(btnEl, '🔄', `${copy('heard')}: "${spoken}" — ${copy('tryAgain')}`);
        btnEl.style.background = '#f59e0b';
        setTimeout(() => {
          setButtonMessage(btnEl, '🎤', copy('practice'));
          btnEl.style.background = '';
        }, 3500);
      }
    };

    recognition.onerror = () => {
      btnEl.classList.remove('listening');
      setButtonMessage(btnEl, '⚠️', copy('speechError'));
      setTimeout(() => {
        setButtonMessage(btnEl, '🎤', copy('practice'));
      }, 2500);
    };

    recognition.start();
  }

  let activeGame = null;

  function closeActiveGame(game) {
    if (!game) return;
    clearInterval(game.timerInterval);
    if (game.keyHandler) window.removeEventListener('keydown', game.keyHandler);
    game.overlay.remove();
    if (activeGame === game) {
      activeGame = null;
      State.currentGameItem = null;
    }
  }

  // 14. Der-Die-Das Arcade Mini-Game
  function openDerDieDasGame() {
    closeActiveGame(activeGame);

    // Filter items that have der/die/das
    const candidateKeys = Object.keys(GERMAN_VOCAB).filter(k => {
      const g = GERMAN_VOCAB[k].gender;
      return g === 'maskulin' || g === 'feminin' || g === 'neutrum';
    });

    let currentItem = null;
    let score = 0;
    let streak = 0;
    let timeLeft = 60;
    let difficulty = 1;

    function updateDifficultyUI() {
      difficulty = Math.min(5, Math.floor(streak / 2) + 1);
      const levelEl = document.getElementById('de-game-difficulty');
      const rewardEl = document.getElementById('de-game-reward');
      if (levelEl) levelEl.textContent = `Lvl ${difficulty}`;
      if (rewardEl) rewardEl.textContent = `+${Math.round(12 * (1 + (difficulty - 1) * 0.45))} XP`;
    }

    function getNextQuestion() {
      const sorted = candidateKeys
        .slice()
        .sort(() => Math.random() - 0.5)
        .sort((a, b) => {
          const aScore = GERMAN_VOCAB[a].de.length + (GERMAN_VOCAB[a].example_de?.length || 0);
          const bScore = GERMAN_VOCAB[b].de.length + (GERMAN_VOCAB[b].example_de?.length || 0);
          return Math.random() > 0.5 ? aScore - bScore : bScore - aScore;
        });
      const randKey = sorted[Math.min(sorted.length - 1, Math.floor(Math.random() * Math.max(4, difficulty + 1)))];
      currentItem = GERMAN_VOCAB[randKey];
      State.currentGameItem = currentItem;
      const nounOnly = currentItem.de.replace(/^(der|die|das)\s+/i, '');

      const nounEl = document.getElementById('de-game-noun-display');
      const arEl = document.getElementById('de-game-ar-display');
      if (nounEl && arEl) {
        nounEl.textContent = nounOnly;
        arEl.textContent = getItemTranslation(currentItem);
      }
      updateDifficultyUI();
      speakGerman(currentItem.de);
    }

    const overlay = document.createElement('div');
    overlay.className = 'de-game-overlay';
    overlay.dir = getSupportLanguage() === 'ar' ? 'rtl' : 'ltr';
    overlay.lang = getSupportLanguage();
    overlay.innerHTML = `
      <div class="de-game-container">
        <button class="de-modal-close" style="position:absolute; top:20px; right:20px;" id="de-game-close" aria-label="${copy('close')}">&times;</button>
        <div id="de-game-title" style="font-size:22px; font-weight:900; color:#1e293b; margin-bottom:4px;">🎮 ${copy('challenge')}</div>
        <div id="de-game-instruction" style="font-size:13px; color:#64748b; font-weight:700; margin-bottom:18px;">${copy('chooseArticle')}</div>

        <div class="de-game-score-row">
          <div><span id="de-game-time-label">⏳ ${copy('time')}:</span> <span id="de-game-timer">60</span>s</div>
          <div><span id="de-game-streak-label">🔥 ${copy('streak')}:</span> <span id="de-game-streak">0</span>x</div>
          <div><span id="de-game-score-label">⭐ ${copy('score')}:</span> <span id="de-game-score">0</span></div>
          <div class="de-game-badge"><span id="de-game-difficulty">Lvl 1</span> <span id="de-game-reward">+12 XP</span></div>
        </div>

        <div class="de-game-word-card">
          <div class="de-game-noun" id="de-game-noun-display">${copy('loading')}</div>
          <div class="de-game-ar-hint" id="de-game-ar-display">...</div>
        </div>

        <div class="de-game-buttons">
          <button class="de-choice-btn de-choice-der" data-gender="maskulin">
            DER ♂<br><span style="font-size:11px; font-weight:600;">(<span id="de-game-der-label">${copy('masculine')}</span>)</span>
          </button>
          <button class="de-choice-btn de-choice-die" data-gender="feminin">
            DIE ♀<br><span style="font-size:11px; font-weight:600;">(<span id="de-game-die-label">${copy('feminine')}</span>)</span>
          </button>
          <button class="de-choice-btn de-choice-das" data-gender="neutrum">
            DAS ⚲<br><span style="font-size:11px; font-weight:600;">(<span id="de-game-das-label">${copy('neuter')}</span>)</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    const game = { overlay, timerInterval: null, keyHandler: null };
    activeGame = game;

    function handleChoice(chosenGender) {
      if (!currentItem) return;
      const isCorrect = currentItem.gender === chosenGender;

      if (isCorrect) {
        playSFX('Correct');
        streak++;
        const difficultyBoost = 1 + (difficulty - 1) * 0.45;
        const comboBoost = 1 + Math.min(1.5, streak * 0.12);
        const addedXP = Math.round(12 * difficultyBoost * comboBoost);
        score += addedXP;
        State.addXP(addedXP, copy('correct', currentItem.de));
        timeLeft = Math.min(60, timeLeft + 1);
      } else {
        playSFX('Wrong');
        streak = 0;
        timeLeft = Math.max(20, timeLeft - 5);
        showToast(copy('wrong', currentItem.de));
      }

      document.getElementById('de-game-score').textContent = score;
      document.getElementById('de-game-streak').textContent = streak;
      getNextQuestion();
    }

    // Timer
    game.timerInterval = setInterval(() => {
      timeLeft--;
      const timerEl = document.getElementById('de-game-timer');
      if (timerEl) timerEl.textContent = timeLeft;

      if (timeLeft <= 0) {
        playSFX('LessonComplete');
        alert(copy('timeUp', score));
        closeActiveGame(game);
      }
    }, 1000);

    // Bind Buttons
    overlay.querySelectorAll('.de-choice-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const gender = btn.getAttribute('data-gender');
        handleChoice(gender);
      });
    });

    document.getElementById('de-game-close').addEventListener('click', () => closeActiveGame(game));

    // Keyboard support: 1, 2, 3
    game.keyHandler = (e) => {
      if (activeGame !== game) return;
      if (e.key === '1') handleChoice('maskulin');
      if (e.key === '2') handleChoice('feminin');
      if (e.key === '3') handleChoice('neutrum');
    };
    window.addEventListener('keydown', game.keyHandler);

    getNextQuestion();
  }

  // 15. Intercept Click Events to Open Enhanced German Modals
  function setupObjectListeners() {
    // Listen for custom dispatch or DOM mutations
    const observer = new MutationObserver(() => {
      // Look for the native modal if it appeared
      const nativeModal = document.querySelector('.ps-modal-overlay, [class*="ps-modal"], .fc-root');
      if (nativeModal && !nativeModal.hasAttribute('data-de-augmented')) {
        nativeModal.setAttribute('data-de-augmented', 'true');
        // Extract word from native modal if possible
        const titleEl = nativeModal.querySelector('h1, h2, [class*="title"], [class*="word"]');
        if (titleEl) {
          const wordText = titleEl.textContent.trim().toLowerCase();
          const matchKey = Object.keys(GERMAN_VOCAB).find(k => {
            const v = GERMAN_VOCAB[k];
            return v.de.toLowerCase().includes(wordText) || v.en.toLowerCase() === wordText;
          });
          if (matchKey) {
            handleItemInteraction(matchKey);
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const onWorldObjectClick = (event) => {
      const key = event.detail && event.detail.key;
      if (typeof key === 'string') showWorldObjectWord(key);
    };
    window.addEventListener('german-world-object-click', onWorldObjectClick);
  }


  // ============================================================
  // 17. Interactive German Dialogue Simulator (Dialog-Simulator)
  // ============================================================
  const DIALOGUES = {
    Supermarket: {
      id: 'supermarket_dialogue',
      title: 'An der Kasse (عند الكاشير في السوبرماركت)',
      world: 'Supermarket',
      speaker: 'Kassiererin (الكاشير)',
      avatar: '🛒',
      rewardXP: 100,
      steps: [
        {
          npc: 'Guten Tag! Haben Sie alles gefunden? Haben Sie eine Kundenkarte?',
          npc_ar: 'طاب يومك! هل وجدت كل شيء؟ وهل لديك بطاقة عميل؟',
          grammar: {
            badge: 'Akkusativ',
            text: 'eine Kundenkarte (مفعول به مؤنث)',
            sub: 'في حالة الـ Akkusativ مع المؤنث، تبقى الأداة (eine) كما هي دون تغيير.'
          },
          choices: [
            {
              de: 'Nein, ich habe keine Kundenkarte. Ich möchte bitte zahlen.',
              ar: 'لا، ليس لدي بطاقة عميل. أود أن أدفع الحساب من فضلك.',
              xp: 20
            },
            {
              de: 'Ja, hier ist meine Karte. Vielen Dank!',
              ar: 'نعم، تفضل بطاقتي. شكراً جزيلاً!',
              xp: 20
            }
          ]
        },
        {
          npc: 'Das macht zusammen 18 Euro und 40 Cent. Wie möchten Sie bezahlen?',
          npc_ar: 'المجموع 18 يورو و40 سنتاً. كيف ترغب في الدفع؟',
          grammar: {
            badge: 'Dativ',
            text: 'mit der Karte (حرف جر + مجرور)',
            sub: 'حرف الجر (mit) يأتي دائماً بعده Dativ، فتتحول die Karte إلى der Karte.'
          },
          choices: [
            {
              de: 'Ich bezahle mit der Karte, bitte.',
              ar: 'سأدفع بالبطاقة المصرفية، من فضلك.',
              xp: 25
            },
            {
              de: 'Ich bezahle bar. Hier sind zwanzig Euro.',
              ar: 'سأدفع نقداً. ها هي عشرون يورو.',
              xp: 25
            }
          ]
        },
        {
          npc: 'Vielen Dank! Und hier ist Ihr Wechselgeld. Brauchen Sie den Kassenbon?',
          npc_ar: 'شكراً جزيلاً! وتفضل باقي الحساب. هل تحتاج إلى إيصال الشراء (الفاتورة)؟',
          grammar: {
            badge: 'Akkusativ',
            text: 'den Kassenbon (مفعول به مذكر)',
            sub: 'هنا تحول der Kassenbon إلى den Kassenbon لأنه مفعول به مباشر لفعل brauchen.'
          },
          choices: [
            {
              de: 'Ja bitte, geben Sie mir den Bon.',
              ar: 'نعم من فضلك، أعطني الإيصال.',
              xp: 25
            },
            {
              de: 'Nein danke, ich brauche ihn nicht. Einen schönen Tag noch!',
              ar: 'لا شكراً، لا أحتاجه. أتمنى لك يوماً جميلاً!',
              xp: 25
            }
          ]
        }
      ],
      outro: 'Danke gleichfalls! Auf Wiedersehen und bis zum nächsten Mal! 🎉'
    },
    Restaurant: {
      id: 'restaurant_dialogue',
      title: 'Bestellen beim Kellner (الطلب من النادل في المطعم)',
      world: 'Restaurant',
      speaker: 'Kellner (النادل)',
      avatar: '🍽️',
      rewardXP: 100,
      steps: [
        {
          npc: 'Guten Abend! Willkommen im Restaurant. Haben Sie einen Tisch reserviert?',
          npc_ar: 'مساء الخير! أهلاً بكم في المطعم. هل حجزتم طاولة مسبقاً؟',
          grammar: {
            badge: 'Akkusativ',
            text: 'einen Tisch (مفعول به مذكر)',
            sub: 'أصل الكلمة der Tisch، وتتحول مع فعل haben إلى einen Tisch (Akkusativ).'
          },
          choices: [
            {
              de: 'Guten Abend! Nein, haben Sie einen freien Tisch für zwei Personen?',
              ar: 'مساء الخير! لا، هل لديكم طاولة شاغرة لشخصين؟',
              xp: 20
            },
            {
              de: 'Ja, wir haben einen Tisch auf den Namen Müller reserviert.',
              ar: 'نعم، لقد حجزنا طاولة باسم عائلة مولر.',
              xp: 20
            }
          ]
        },
        {
          npc: 'Sehr gerne, folgen Sie mir bitte! Hier ist die Speisekarte. Was möchten Sie trinken?',
          npc_ar: 'بكل سرور، تفضلوا معي! ها هي قائمة الطعام. ماذا تودون أن تشربوا؟',
          grammar: {
            badge: 'Akkusativ',
            text: 'einen Kaffee / ein Glas Wasser',
            sub: 'استخدم دائماً صيغة الأدب: Ich hätte gerne... (أود الحصول على...).'
          },
          choices: [
            {
              de: 'Ich hätte gerne ein Glas Mineralwasser und einen Apfelsaft, bitte.',
              ar: 'أود الحصول على كأس ماء معدني وعصير تفاح، من فضلك.',
              xp: 25
            },
            {
              de: 'Für mich bitte eine Tasse Kaffee mit Milch und Zucker.',
              ar: 'بالنسبة لي فنجان قهوة مع الحليب والسكر من فضلك.',
              xp: 25
            }
          ]
        },
        {
          npc: 'Sehr wohl! Hat es Ihnen geschmeckt? Möchten Sie die Rechnung haben?',
          npc_ar: 'على الرحب والسعة! هل أعجبكم الطعام؟ هل تودون الحصول على الفاتورة؟',
          grammar: {
            badge: 'Akkusativ',
            text: 'die Rechnung (مفعول به مؤنث)',
            sub: 'طلب الفاتورة بأدب: Könnten wir bitte die Rechnung haben?'
          },
          choices: [
            {
              de: 'Ja, es war ausgezeichnet! Könnten wir bitte die Rechnung haben?',
              ar: 'نعم، كان الطعام ممتازاً! هل يمكننا الحصول على الفاتورة من فضلك؟',
              xp: 25
            },
            {
              de: 'Wir möchten bitte zahlen. Zusammen, bitte!',
              ar: 'نود أن ندفع الحساب. معاً من فضلك!',
              xp: 25
            }
          ]
        }
      ],
      outro: 'Vielen Dank für Ihren Besuch! Beehren Sie uns bald wieder! Auf Wiedersehen! 🌟'
    },
    City: {
      id: 'city_dialogue',
      title: 'Nach dem Weg fragen (السؤال عن الطريق في المدينة)',
      world: 'City',
      speaker: 'Passant (أحد المارة)',
      avatar: '🗺️',
      rewardXP: 100,
      steps: [
        {
          npc: 'Hallo! Kann ich Ihnen weiterhelfen? Suchen Sie etwas?',
          npc_ar: 'مرحباً! هل يمكنني مساعدتك؟ هل تبحث عن شيء؟',
          grammar: {
            badge: 'Dativ',
            text: 'zum Hauptbahnhof (zu + dem)',
            sub: 'حرف الجر zu يتطلب دائماً Dativ: zu + dem Bahnhof = zum Bahnhof.'
          },
          choices: [
            {
              de: 'Entschuldigung, wie komme ich bitte zum Hauptbahnhof?',
              ar: 'معذرة، كيف أصل إلى محطة القطار المركزية من فضلك؟',
              xp: 20
            },
            {
              de: 'Gibt es hier in der Nähe eine Apotheke oder ein Krankenhaus?',
              ar: 'هل توجد هنا صيدلية قريبة أو مستشفى؟',
              xp: 20
            }
          ]
        },
        {
          npc: 'Gehen Sie geradeaus bis zur Ampel, dann biegen Sie nach links in die Schillerstraße ein.',
          npc_ar: 'امشِ إلى الأمام مباشرة حتى إشارة المرور، ثم انعطف يساراً إلى شارع شيلر.',
          grammar: {
            badge: 'Dativ',
            text: 'bis zur Ampel (zu + der)',
            sub: 'الاسم المؤنث die Ampel يصبح zur Ampel (zu + der) في حالة المجرور Dativ.'
          },
          choices: [
            {
              de: 'Ist es weit von hier? Kann ich zu Fuß dorthin gehen?',
              ar: 'هل المكان بعيد من هنا؟ هل يمكنني الذهاب إلى هناك مشياً؟',
              xp: 25
            },
            {
              de: 'Muss ich danach noch die Straße überqueren?',
              ar: 'هل يجب عليّ بعد ذلك عبور الشارع أيضاً؟',
              xp: 25
            }
          ]
        },
        {
          npc: 'Nein, es sind nur etwa fünf Gehminuten. Sie können das Gebäude direkt sehen!',
          npc_ar: 'لا، المسافة حوالي خمس دقائق مشياً فقط. يمكنك رؤية المبنى مباشرة!',
          grammar: {
            badge: 'Akkusativ',
            text: 'das Gebäude sehen',
            sub: 'المحايد das يبقى كما هو في الـ Akkusativ.'
          },
          choices: [
            {
              de: 'Vielen herzlichen Dank für Ihre Hilfe! Auf Wiedersehen!',
              ar: 'شكراً جزيلاً من القلب على مساعدتك! إلى اللقاء!',
              xp: 25
            },
            {
              de: 'Das ist wunderbar, danke schön und einen schönen Tag!',
              ar: 'هذا رائع، شكراً جزيلاً وأتمنى لك يوماً جميلاً!',
              xp: 25
            }
          ]
        }
      ],
      outro: 'Gern geschehen! Gute Reise und viel Erfolg! 👋'
    }
  };

  // Launch Dialogue Flow
  function openDialogue(worldName) {
    const dialogue = DIALOGUES[worldName] || DIALOGUES.Supermarket;
    let currentStepIndex = 0;

    const overlay = document.createElement('div');
    overlay.className = 'de-dialogue-overlay';
    overlay.id = 'de-active-dialogue-modal';

    function renderStep() {
      const step = dialogue.steps[currentStepIndex];
      if (!step) {
        // Outro / Finish
        overlay.innerHTML = `
          <div class="de-dialogue-box">
            <div class="de-dialogue-top">
              <div class="de-dialogue-title-wrap">
                <div class="de-dialogue-avatar">${dialogue.avatar}</div>
                <div>
                  <div class="de-dialogue-speaker-name">${dialogue.speaker}</div>
                  <div class="de-dialogue-sub">${dialogue.title}</div>
                </div>
              </div>
              <button class="de-modal-close" style="color:white; background:rgba(255,255,255,0.2);" id="de-dlg-close">&times;</button>
            </div>
            <div class="de-dialogue-body" style="text-align:center; padding:36px 24px;">
              <div style="font-size:48px; margin-bottom:12px;">🎉</div>
              <div style="font-size:24px; font-weight:900; color:#0f172a; margin-bottom:6px;">Wunderbar! المحادثة اكتملت!</div>
              <div style="font-size:16px; font-weight:700; color:#10b981; margin-bottom:18px;">+${dialogue.rewardXP} XP مكتسبة</div>
              <div class="de-npc-speech-bubble" style="text-align:center; margin-bottom:24px;">
                <div class="de-speech-text-de">${dialogue.outro}</div>
              </div>
              <button class="de-action-btn de-btn-speak" style="margin:0 auto; max-width:240px;" id="de-dlg-finish-btn">
                <span>✓</span> <span>إنهاء والعودة للعالم</span>
              </button>
            </div>
          </div>
    `;
        speakGerman(dialogue.outro);
        State.addXP(dialogue.rewardXP, `أتممت محادثة ${dialogue.title}!`);
        playSFX('LessonComplete');

        document.getElementById('de-dlg-close').addEventListener('click', () => overlay.remove());
        document.getElementById('de-dlg-finish-btn').addEventListener('click', () => overlay.remove());
        return;
      }

      overlay.innerHTML = `
        <div class="de-dialogue-box">
          <div class="de-dialogue-top">
            <div class="de-dialogue-title-wrap">
              <div class="de-dialogue-avatar">${dialogue.avatar}</div>
              <div>
                <div class="de-dialogue-speaker-name">${dialogue.speaker}</div>
                <div class="de-dialogue-sub">${dialogue.title} - خطوة ${currentStepIndex + 1}/${dialogue.steps.length}</div>
              </div>
            </div>
            <button class="de-modal-close" style="color:white; background:rgba(255,255,255,0.2);" id="de-dlg-close">&times;</button>
          </div>
          <div class="de-dialogue-body">
            <div class="de-npc-speech-bubble">
              <div class="de-speech-text-de">${step.npc}</div>
              <div class="de-speech-text-ar">${step.npc_ar}</div>
              <button class="de-speech-listen-btn" id="de-npc-listen-btn">
                <span>🔊</span> <span>استمع مرة أخرى</span>
              </button>
            </div>

            <div class="de-grammar-callout">
              <span class="de-grammar-badge ${step.grammar.badge === 'Akkusativ' ? 'badge-akkusativ' : 'badge-dativ'}">
                ${step.grammar.badge}
              </span>
              <div>
                <div class="de-grammar-text">${step.grammar.text}</div>
                <div class="de-grammar-sub">${step.grammar.sub}</div>
              </div>
            </div>

            <div>
              <div class="de-choices-header">اختر ردك باللغة الألمانية (أو انطق به):</div>
              <div style="display:flex; flex-direction:column; gap:10px;">
                ${step.choices.map((c, idx) => `
                  <div class="de-choice-option" data-idx="${idx}">
                    <div style="text-align:left;">
                      <div class="de-choice-de">${c.de}</div>
                      <div class="de-choice-ar">${c.ar}</div>
                    </div>
                    <div class="de-choice-speak-icon" title="انطق هذا الرد أو اضغط عليه">
                      🗣️
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
    `;

      // Speak NPC line
      speakGerman(step.npc);

      // Listen again button
      document.getElementById('de-npc-listen-btn').addEventListener('click', () => {
        speakGerman(step.npc);
      });

      // Close button
      document.getElementById('de-dlg-close').addEventListener('click', () => {
        overlay.remove();
      });

      // Option click handlers
      overlay.querySelectorAll('.de-choice-option').forEach(optEl => {
        optEl.addEventListener('click', () => {
          const idx = parseInt(optEl.getAttribute('data-idx'), 10);
          const chosen = step.choices[idx];
          playSFX('Correct');
          speakGerman(chosen.de);
          State.addXP(chosen.xp, 'رد ألماني صحيح');
          currentStepIndex++;
          setTimeout(renderStep, 1100);
        });
      });
    }

    document.body.appendChild(overlay);
    renderStep();
  }

  // 18. World Dialogue Trigger in 3D Scenes
  function renderWorldDialogueTrigger() {
    const world = detectWorld();
    if (!world) return;
    if (document.getElementById('de-world-dialogue-btn')) return;

    const trigger = document.createElement('button');
    trigger.id = 'de-world-dialogue-btn';
    trigger.className = 'de-world-dialogue-trigger';
    trigger.type = 'button';
    const supportLanguage = window.GermanEngine && window.GermanEngine.getSupportLanguage
      ? window.GermanEngine.getSupportLanguage()
      : 'de';
    trigger.dir = supportLanguage === 'ar' ? 'rtl' : 'ltr';
    trigger.setAttribute(
      'aria-label',
      supportLanguage === 'ar' ? 'تحدث مع شخصية' : supportLanguage === 'en' ? 'Talk with an NPC' : 'Mit einer Person sprechen'
    );
    trigger.title = supportLanguage === 'ar' ? 'تحدث مع شخصية' : supportLanguage === 'en' ? 'Talk with an NPC' : 'Mit einer Person sprechen';
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = '<path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 2 1.5-4A7.5 7.5 0 1 1 20 11.5Z" />';
    const label = document.createElement('span');
    label.textContent = trigger.title;
    trigger.append(icon, label);
    trigger.addEventListener('click', () => {
      const life = window.GermanLife;
      const npcKey = life && life.NPCS
        ? Object.keys(life.NPCS).find((key) =>
          String(life.NPCS[key].world || '').toLowerCase() === world.toLowerCase())
        : null;
      if (!life || typeof life.openNPCConversation !== 'function' || !npcKey) {
        console.error(`NPC conversation is unavailable for world "${world}".`);
        return;
      }
      life.openNPCConversation(npcKey);
    });
    document.body.appendChild(trigger);
  }


  // 19. Render 3D Crosshair
  function renderCrosshair() {
    if (detectWorld() && !document.getElementById('de-3d-crosshair')) {
      const ch = document.createElement('div');
      ch.id = 'de-3d-crosshair';
      ch.className = 'de-crosshair';
      document.body.appendChild(ch);
    }
  }

  // 16. Initialize everything on load
  function init() {
    renderHUD();
    renderQuestWidget();
    setupGermanOnlyHome();
    renderCrosshair();
    renderWorldDialogueTrigger();
    setupObjectListeners();
    console.log('✅ German Learning Engine (Deutsche Lern-Engine) active!');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose to window for testing or direct triggering
  window.GermanEngine = {
    State,
    GERMAN_VOCAB,
    QUESTS,
    speakGerman,
    openEnhancedWordModal,
    openDerDieDasGame,
    openVocabularyReview,
    openDialogue,
    DIALOGUES,
    handleItemInteraction,
    setSupportLanguage,
    getSupportLanguage
  };

})();

// =====================================
// RIGO AI
// LANGUAGE SYSTEM
// ENTERPRISE ULTRA FINAL
// =====================================



// =====================================
// LANGUAGE CONFIG
// =====================================

const LANGUAGE_CONFIG =
deepFreeze({

  DEFAULT_LANGUAGE:
  "en",

  STORAGE_KEY:
  "rigo_language",

  SUPPORTED_LANGUAGES:[

    "en",

    "ar",

    "fr",

    "tr",

    "es",

    "de"

  ],

  RTL_LANGUAGES:[

    "ar"

  ]

});



// =====================================
// TRANSLATIONS
// =====================================

const TRANSLATIONS =
deepFreeze({



  // ===================================
  // ENGLISH
  // ===================================

  en:{

    appName:
    "RIGO AI",

    typing:
    "RIGO AI is typing...",

    send:
    "Send",

    placeholder:
    "Type your message...",

    newChat:
    "New Chat",

    error:
    "Something went wrong",

    upload:
    "Upload File"

  },



  // ===================================
  // ARABIC
  // ===================================

  ar:{

    appName:
    "ريغو AI",

    typing:
    "ريغو AI يكتب...",

    send:
    "إرسال",

    placeholder:
    "اكتب رسالتك...",

    newChat:
    "محادثة جديدة",

    error:
    "حدث خطأ ما",

    upload:
    "رفع ملف"

  },



  // ===================================
  // FRENCH
  // ===================================

  fr:{

    appName:
    "RIGO AI",

    typing:
    "RIGO AI écrit...",

    send:
    "Envoyer",

    placeholder:
    "Tapez votre message...",

    newChat:
    "Nouvelle discussion",

    error:
    "Une erreur est survenue",

    upload:
    "Téléverser un fichier"

  },



  // ===================================
  // TURKISH
  // ===================================

  tr:{

    appName:
    "RIGO AI",

    typing:
    "RIGO AI yazıyor...",

    send:
    "Gönder",

    placeholder:
    "Mesajınızı yazın...",

    newChat:
    "Yeni Sohbet",

    error:
    "Bir hata oluştu",

    upload:
    "Dosya Yükle"

  },



  // ===================================
  // SPANISH
  // ===================================

  es:{

    appName:
    "RIGO AI",

    typing:
    "RIGO AI está escribiendo...",

    send:
    "Enviar",

    placeholder:
    "Escribe tu mensaje...",

    newChat:
    "Nuevo Chat",

    error:
    "Algo salió mal",

    upload:
    "Subir Archivo"

  },



  // ===================================
  // GERMAN
  // ===================================

  de:{

    appName:
    "RIGO AI",

    typing:
    "RIGO AI schreibt...",

    send:
    "Senden",

    placeholder:
    "Schreiben Sie Ihre Nachricht...",

    newChat:
    "Neuer Chat",

    error:
    "Etwas ist schiefgelaufen",

    upload:
    "Datei Hochladen"

  }

});



// =====================================
// LANGUAGE STATE
// =====================================

const languageState =
Object.seal({

  initialized:false,

  currentLanguage:
  LANGUAGE_CONFIG
  .DEFAULT_LANGUAGE,

  lastUpdatedAt:null

});



// =====================================
// STORAGE AVAILABILITY
// =====================================

function isLanguageStorageAvailable(){

  try{

    if(
      typeof localStorage ===
      "undefined"
    ){

      return false;

    }

    const testKey =
    "__rigo_language_test__";

    localStorage.setItem(
      testKey,
      "1"
    );

    localStorage.removeItem(
      testKey
    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// VALIDATE LANGUAGE
// =====================================

function validateLanguage(
  language
){

  return (

    typeof language ===
    "string" &&

    LANGUAGE_CONFIG
    .SUPPORTED_LANGUAGES
    .includes(
      language
      .trim()
      .toLowerCase()
    )

  );

}



// =====================================
// NORMALIZE LANGUAGE
// =====================================

function normalizeLanguage(
  language
){

  if(
    typeof language !==
    "string"
  ){

    return LANGUAGE_CONFIG
    .DEFAULT_LANGUAGE;

  }

  return language
  .trim()
  .toLowerCase();

}



// =====================================
// IS RTL LANGUAGE
// =====================================

function isRTLLanguage(
  language
){

  const normalizedLanguage =
  normalizeLanguage(
    language
  );

  return (
    LANGUAGE_CONFIG
    .RTL_LANGUAGES
    .includes(
      normalizedLanguage
    )
  );

}



// =====================================
// SAVE LANGUAGE
// =====================================

function saveLanguage(
  language
){

  try{

    if(
      !isLanguageStorageAvailable()
    ){

      return false;

    }

    const normalizedLanguage =
    normalizeLanguage(
      language
    );

    const validLanguage =
    validateLanguage(
      normalizedLanguage
    );

    if(!validLanguage){

      return false;

    }

    localStorage.setItem(

      LANGUAGE_CONFIG
      .STORAGE_KEY,

      normalizedLanguage

    );

    return true;

  }

  catch(error){

    console.error(
      "SAVE LANGUAGE ERROR:",
      error
    );

    return false;

  }

}



// =====================================
// LOAD LANGUAGE
// =====================================

function loadLanguage(){

  try{

    if(
      !isLanguageStorageAvailable()
    ){

      return LANGUAGE_CONFIG
      .DEFAULT_LANGUAGE;
    }

    const savedLanguage =

      localStorage.getItem(

        LANGUAGE_CONFIG
        .STORAGE_KEY

      );

    const validLanguage =
    validateLanguage(
      savedLanguage
    );

    if(!validLanguage){

      return LANGUAGE_CONFIG
      .DEFAULT_LANGUAGE;

    }

    return normalizeLanguage(
      savedLanguage
    );

  }

  catch(error){

    console.error(
      "LOAD LANGUAGE ERROR:",
      error
    );

    return LANGUAGE_CONFIG
    .DEFAULT_LANGUAGE;

  }

}



// =====================================
// APPLY DOCUMENT LANGUAGE
// =====================================

function applyDocumentLanguage(
  language
){

  if(
    typeof document ===
    "undefined" ||

    !document.documentElement
  ){

    return false;

  }

  const normalizedLanguage =
  normalizeLanguage(
    language
  );

  const direction =

    isRTLLanguage(
      normalizedLanguage
    )

    ? "rtl"

    : "ltr";

  document.documentElement
  .lang =
  normalizedLanguage;

  document.documentElement
  .dir =
  direction;

  document.documentElement
  .setAttribute(
    "lang",
    normalizedLanguage
  );

  document.documentElement
  .setAttribute(
    "dir",
    direction
  );

  return true;

}



// =====================================
// GET TRANSLATION
// =====================================

function getTranslation(
  key
){

  const language =
  languageState
  .currentLanguage;

  const languagePack =

    TRANSLATIONS[
      language
    ] ||

    TRANSLATIONS[
      LANGUAGE_CONFIG
      .DEFAULT_LANGUAGE
    ];

  if(

    !key ||

    typeof key !==
    "string"

  ){

    return "";

  }

  const translation =

    languagePack[key] ||

    TRANSLATIONS[
      LANGUAGE_CONFIG
      .DEFAULT_LANGUAGE
    ][key];

  if(
    !translation
  ){

    console.warn(
      "MISSING TRANSLATION:",
      key
    );

    return key;

  }

  return translation;

}



// =====================================
// APPLY ELEMENT TRANSLATION
// =====================================

function applyElementTranslation(
  element,
  translation
){

  if(
    !element
  ){

    return false;

  }

  const hasInputSupport =

    typeof HTMLInputElement !==
    "undefined";

  const hasTextAreaSupport =

    typeof HTMLTextAreaElement !==
    "undefined";

  const isInputElement =

    hasInputSupport &&

    element instanceof
    HTMLInputElement;

  const isTextAreaElement =

    hasTextAreaSupport &&

    element instanceof
    HTMLTextAreaElement;

  if(

    isInputElement ||

    isTextAreaElement

  ){

    const inputType =

      String(
        element.type || ""
      )
      .toLowerCase();

    const useValue =

      inputType ===
      "button" ||

      inputType ===
      "submit" ||

      inputType ===
      "reset";

    if(useValue){

      element.value =
      translation;

      return true;

    }

  }

  element.textContent =
  translation;

  return true;

}



// =====================================
// UPDATE DOM TRANSLATIONS
// =====================================

function updateDOMTranslations(){

  if(
    typeof document ===
    "undefined"
  ){

    return false;

  }

  const translationElements =

    document.querySelectorAll(
      "[data-translate]"
    );

  translationElements
  .forEach((element) => {

    const key =
    element.dataset
    .translate;

    const translation =
    getTranslation(
      key
    );

    applyElementTranslation(
      element,
      translation
    );

  });

  const placeholderElements =

    document.querySelectorAll(
      "[data-translate-placeholder]"
    );

  placeholderElements
  .forEach((element) => {

    const key =
    element.dataset
    .translatePlaceholder;

    const translation =
    getTranslation(
      key
    );

    element.setAttribute(

      "placeholder",

      translation

    );

  });

  const titleElements =

    document.querySelectorAll(
      "[data-translate-title]"
    );

  titleElements
  .forEach((element) => {

    const key =
    element.dataset
    .translateTitle;

    const translation =
    getTranslation(
      key
    );

    element.setAttribute(
      "title",
      translation
    );

  });

  const ariaElements =

    document.querySelectorAll(
      "[data-translate-aria]"
    );

  ariaElements
  .forEach((element) => {

    const key =
    element.dataset
    .translateAria;

    const translation =
    getTranslation(
      key
    );

    element.setAttribute(
      "aria-label",
      translation
    );

  });

  return true;

}



// =====================================
// SET LANGUAGE
// =====================================

function setLanguage(
  language
){

  const normalizedLanguage =
  normalizeLanguage(
    language
  );

  const validLanguage =
  validateLanguage(
    normalizedLanguage
  );

  if(!validLanguage){

    return false;

  }

  languageState
  .currentLanguage =
  normalizedLanguage;

  languageState
  .lastUpdatedAt =
  Date.now();

  if(
    isLanguageStorageAvailable()
  ){

    saveLanguage(
      normalizedLanguage
    );

  }

  applyDocumentLanguage(
    normalizedLanguage
  );

  updateDOMTranslations();

  return true;

}



// =====================================
// GET CURRENT LANGUAGE
// =====================================

function getCurrentLanguage(){

  return languageState
  .currentLanguage;

}



// =====================================
// INITIALIZE LANGUAGE
// =====================================

function initializeLanguage(){

  if(
    languageState
    .initialized
  ){

    return true;

  }

  const savedLanguage =
  loadLanguage();

  const initialized =
  setLanguage(
    savedLanguage
  );

  if(!initialized){

    return false;

  }

  languageState
  .initialized = true;

  return true;

}

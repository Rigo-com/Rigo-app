// =====================================
// RIGO AI
// LANGUAGE RUNTIME SYSTEM
// ENTERPRISE LOCALIZATION ENGINE FINAL
// =====================================



// =====================================
// CONFIG
// =====================================

const LANGUAGE_CONFIG =
deepFreeze({

  DEFAULT_LANGUAGE:
  "en",

  STORAGE_KEY:
  "rigo_language",

  CACHE_ENABLED:true,

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
// EVENTS
// =====================================

const LANGUAGE_RUNTIME_EVENTS =
Object.freeze({

  INITIALIZED:
  "language.initialized",

  LANGUAGE_CHANGED:
  "language.changed",

  TRANSLATIONS_UPDATED:
  "language.translations.updated"

});



// =====================================
// TRANSLATIONS
// =====================================

const TRANSLATIONS =
Object.seal({

  en:{

    app:{

      name:
      "RIGO AI"

    },

    chat:{

      typing:
      "RIGO AI is typing...",

      send:
      "Send",

      placeholder:
      "Type your message...",

      newChat:
      "New Chat"

    },

    errors:{

      generic:
      "Something went wrong"

    },

    file:{

      upload:
      "Upload File"

    }

  },



  ar:{

    app:{

      name:
      "ريغو AI"

    },

    chat:{

      typing:
      "ريغو AI يكتب...",

      send:
      "إرسال",

      placeholder:
      "اكتب رسالتك...",

      newChat:
      "محادثة جديدة"

    },

    errors:{

      generic:
      "حدث خطأ ما"

    },

    file:{

      upload:
      "رفع ملف"

    }

  }

});



// =====================================
// STATE
// =====================================

const languageRuntimeState =
Object.seal({

  initialized:false,

  currentLanguage:
  LANGUAGE_CONFIG
  .DEFAULT_LANGUAGE,

  translationCache:
  new Map(),

  lastUpdatedAt:null

});



// =====================================
// DIAGNOSTICS
// =====================================

async function trackLanguageRuntimeError(
  message,
  metadata = null
){

  if(
    typeof DiagnosticsRuntime !==
    "undefined"
  ){

    try{

      await DiagnosticsRuntime
      .error(
        message,
        metadata
      );

    }

    catch(error){}

  }

}



// =====================================
// EVENTS
// =====================================

async function emitLanguageRuntimeEvent(
  eventName,
  payload = {}
){

  if(
    typeof emitSystemEvent !==
    "function"
  ){

    return false;

  }

  try{

    await emitSystemEvent(

      eventName,

      {

        source:
        "language-runtime",

        ...payload

      }

    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// STORAGE
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
// VALIDATION
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
// NORMALIZE
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
// RTL
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
// SAVE
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

    localStorage.setItem(

      LANGUAGE_CONFIG
      .STORAGE_KEY,

      normalizeLanguage(
        language
      )

    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// LOAD
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

    if(
      !validateLanguage(
        savedLanguage
      )
    ){

      return LANGUAGE_CONFIG
      .DEFAULT_LANGUAGE;

    }

    return normalizeLanguage(
      savedLanguage
    );

  }

  catch(error){

    return LANGUAGE_CONFIG
    .DEFAULT_LANGUAGE;

  }

}



// =====================================
// APPLY DOCUMENT
// =====================================

function applyDocumentLanguage(
  language
){

  if(
    typeof document ===
    "undefined"
  ){

    return false;

  }

  const direction =

    isRTLLanguage(
      language
    )

    ?

    "rtl"

    :

    "ltr";

  document.documentElement
  .lang =
  language;

  document.documentElement
  .dir =
  direction;

  return true;

}



// =====================================
// NESTED VALUE
// =====================================

function resolveTranslationKey(
  object,
  path
){

  return String(path)
  .split(".")
  .reduce((current,key) => {

    return current?.[key];

  },object);

}



// =====================================
// INTERPOLATION
// =====================================

function interpolateTranslation(
  translation,
  values = {}
){

  if(
    typeof translation !==
    "string"
  ){

    return "";
  }

  return translation.replace(

    /\{(.*?)\}/g,

    (match,key) => {

      return values[key] ??
      match;

    }

  );

}



// =====================================
// GET TRANSLATION
// =====================================

function getTranslation(
  key,
  values = {}
){

  const cacheKey =

    JSON.stringify({

      language:

        languageRuntimeState
        .currentLanguage,

      key,

      values

    });

  if(

    LANGUAGE_CONFIG
    .CACHE_ENABLED &&

    languageRuntimeState
    .translationCache
    .has(cacheKey)

  ){

    return languageRuntimeState
    .translationCache
    .get(cacheKey);

  }

  const languagePack =

    TRANSLATIONS[
      languageRuntimeState
      .currentLanguage
    ]

    ||

    TRANSLATIONS[
      LANGUAGE_CONFIG
      .DEFAULT_LANGUAGE
    ];

  const fallbackPack =

    TRANSLATIONS[
      LANGUAGE_CONFIG
      .DEFAULT_LANGUAGE
    ];

  const translation =

    resolveTranslationKey(
      languagePack,
      key
    )

    ||

    resolveTranslationKey(
      fallbackPack,
      key
    )

    ||

    key;

  const interpolated =
  interpolateTranslation(

    translation,

    values

  );

  if(
    LANGUAGE_CONFIG
    .CACHE_ENABLED
  ){

    languageRuntimeState
    .translationCache
    .set(

      cacheKey,

      interpolated

    );

  }

  return interpolated;

}



// =====================================
// FORMATTERS
// =====================================

function formatNumber(
  value
){

  try{

    return new Intl.NumberFormat(

      languageRuntimeState
      .currentLanguage

    )
    .format(value);

  }

  catch(error){

    return String(value);

  }

}



function formatDate(
  value
){

  try{

    return new Intl.DateTimeFormat(

      languageRuntimeState
      .currentLanguage

    )
    .format(new Date(value));

  }

  catch(error){

    return String(value);

  }

}



// =====================================
// APPLY ELEMENT
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

  const isInput =

    element instanceof
    HTMLInputElement;

  const isTextArea =

    element instanceof
    HTMLTextAreaElement;

  if(
    isInput ||
    isTextArea
  ){

    const inputType =

      String(
        element.type || ""
      )
      .toLowerCase();

    if(

      inputType ===
      "button"

      ||

      inputType ===
      "submit"

    ){

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
// DOM TRANSLATIONS
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

    applyElementTranslation(

      element,

      getTranslation(key)

    );

  });

  return true;

}



// =====================================
// REGISTER TRANSLATIONS
// =====================================

async function registerTranslations(
  language,
  translations
){

  const normalizedLanguage =
  normalizeLanguage(
    language
  );

  if(
    !validateLanguage(
      normalizedLanguage
    )
  ){

    return false;

  }

  TRANSLATIONS[
    normalizedLanguage
  ] = Object.freeze({

    ...TRANSLATIONS[
      normalizedLanguage
    ],

    ...translations

  });

  languageRuntimeState
  .translationCache
  .clear();

  await emitLanguageRuntimeEvent(

    LANGUAGE_RUNTIME_EVENTS
    .TRANSLATIONS_UPDATED,

    {

      language:
      normalizedLanguage

    }

  );

  return true;

}



// =====================================
// SET LANGUAGE
// =====================================

async function setLanguage(
  language
){

  const normalizedLanguage =
  normalizeLanguage(
    language
  );

  if(
    !validateLanguage(
      normalizedLanguage
    )
  ){

    await trackLanguageRuntimeError(
      "INVALID LANGUAGE",
      { language }
    );

    return false;

  }

  languageRuntimeState
  .currentLanguage =
  normalizedLanguage;

  languageRuntimeState
  .lastUpdatedAt =
  Date.now();

  languageRuntimeState
  .translationCache
  .clear();

  saveLanguage(
    normalizedLanguage
  );

  applyDocumentLanguage(
    normalizedLanguage
  );

  updateDOMTranslations();

  await emitLanguageRuntimeEvent(

    LANGUAGE_RUNTIME_EVENTS
    .LANGUAGE_CHANGED,

    {

      language:
      normalizedLanguage

    }

  );

  return true;

}



// =====================================
// CURRENT LANGUAGE
// =====================================

function getCurrentLanguage(){

  return languageRuntimeState
  .currentLanguage;

}



// =====================================
// SNAPSHOT
// =====================================

function createLanguageRuntimeSnapshot(){

  return Object.freeze({

    timestamp:
    Date.now(),

    initialized:

      languageRuntimeState
      .initialized,

    currentLanguage:

      languageRuntimeState
      .currentLanguage,

    cacheSize:

      languageRuntimeState
      .translationCache
      .size

  });

}



// =====================================
// DIAGNOSTICS
// =====================================

function getLanguageRuntimeDiagnostics(){

  return Object.freeze({

    initialized:
    languageRuntimeState
    .initialized,

    currentLanguage:

      languageRuntimeState
      .currentLanguage,

    cacheSize:

      languageRuntimeState
      .translationCache
      .size,

    supportedLanguages:[

      ...LANGUAGE_CONFIG
      .SUPPORTED_LANGUAGES

    ],

    lastUpdatedAt:

      languageRuntimeState
      .lastUpdatedAt

  });

}



// =====================================
// INITIALIZE
// =====================================

async function initializeLanguageRuntime(){

  if(
    languageRuntimeState
    .initialized
  ){

    return true;

  }

  const savedLanguage =
  loadLanguage();

  const initialized =
  await setLanguage(
    savedLanguage
  );

  if(!initialized){

    return false;

  }

  languageRuntimeState
  .initialized =
  true;

  await emitLanguageRuntimeEvent(

    LANGUAGE_RUNTIME_EVENTS
    .INITIALIZED

  );

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const LanguageRuntime =
Object.freeze({

  initialize:
  initializeLanguageRuntime,

  set:
  setLanguage,

  get:
  getCurrentLanguage,

  translate:
  getTranslation,

  register:
  registerTranslations,

  isRTL:
  isRTLLanguage,

  formatNumber,

  formatDate,

  snapshot:
  createLanguageRuntimeSnapshot,

  diagnostics:
  getLanguageRuntimeDiagnostics

});

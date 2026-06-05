// =====================================
// RIGO AI
// LANGUAGE RUNTIME SYSTEM
// =====================================



// =====================================
// CONFIG
// =====================================

const LANGUAGE_CONFIG =
Object.freeze({

  DEFAULT_LANGUAGE:
  "en",

  STORAGE_KEY:
  "rigo_language",

  MAX_CACHE_SIZE:
  100,

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

const TRANSLATIONS = {

  en:{

    app:{
      name:"RIGO AI"
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
      name:"ريغو AI"
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

};



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

        timestamp:
        Date.now(),

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
// LANGUAGE HELPERS
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



function validateLanguage(
  language
){

  return (

    LANGUAGE_CONFIG
    .SUPPORTED_LANGUAGES
    .includes(

      normalizeLanguage(
        language
      )

    )

  );

}



function resolveSupportedLanguage(
  language
){

  const normalizedLanguage =
  normalizeLanguage(
    language
  );

  if(
    validateLanguage(
      normalizedLanguage
    )
  ){

    return normalizedLanguage;

  }

  return LANGUAGE_CONFIG
  .DEFAULT_LANGUAGE;

}



function isRTLLanguage(
  language
){

  return (

    LANGUAGE_CONFIG
    .RTL_LANGUAGES
    .includes(

      normalizeLanguage(
        language
      )

    )

  );

}



// =====================================
// STORAGE
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

      resolveSupportedLanguage(
        language
      )

    );

    return true;

  }

  catch(error){

    return false;

  }

}



function loadLanguage(){

  try{

    if(
      !isLanguageStorageAvailable()
    ){

      return LANGUAGE_CONFIG
      .DEFAULT_LANGUAGE;

    }

    return resolveSupportedLanguage(

      localStorage.getItem(

        LANGUAGE_CONFIG
        .STORAGE_KEY

      )

    );

  }

  catch(error){

    return LANGUAGE_CONFIG
    .DEFAULT_LANGUAGE;

  }

}



// =====================================
// DOCUMENT
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

  const normalizedLanguage =
  resolveSupportedLanguage(
    language
  );

  document.documentElement
  .lang =
  normalizedLanguage;

  document.documentElement
  .dir =

    isRTLLanguage(
      normalizedLanguage
    )

    ?

    "rtl"

    :

    "ltr";

  return true;

}



// =====================================
// TRANSLATION HELPERS
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

      return values[key]
      ?? match;

    }

  );

}



function clearTranslationCache(){

  languageRuntimeState
  .translationCache
  .clear();

}



function setTranslationCache(
  key,
  value
){

  if(

    languageRuntimeState
    .translationCache
    .size >=

    LANGUAGE_CONFIG
    .MAX_CACHE_SIZE

  ){

    const firstKey =

      languageRuntimeState
      .translationCache
      .keys()
      .next()
      .value;

    languageRuntimeState
    .translationCache
    .delete(firstKey);

  }

  languageRuntimeState
  .translationCache
  .set(key,value);

}



// =====================================
// TRANSLATIONS
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

    languageRuntimeState
    .translationCache
    .has(cacheKey)

  ){

    return languageRuntimeState
    .translationCache
    .get(cacheKey);

  }

  const currentPack =

    TRANSLATIONS[
      languageRuntimeState
      .currentLanguage
    ]

    ||

    {};

  const fallbackPack =

    TRANSLATIONS[
      LANGUAGE_CONFIG
      .DEFAULT_LANGUAGE
    ]

    ||

    {};

  const translation =

    resolveTranslationKey(
      currentPack,
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

  setTranslationCache(
    cacheKey,
    interpolated
  );

  return interpolated;

}



// =====================================
// FORMATTERS
// =====================================

function getSafeLocale(){

  return resolveSupportedLanguage(

    languageRuntimeState
    .currentLanguage

  );

}



function formatNumber(
  value
){

  try{

    return new Intl.NumberFormat(

      getSafeLocale()

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

      getSafeLocale()

    )
    .format(new Date(value));

  }

  catch(error){

    return String(value);

  }

}



// =====================================
// DOM
// =====================================

function applyElementTranslation(
  element,
  translation
){

  if(!element){

    return false;

  }

  const isInput =

    element instanceof
    HTMLInputElement;

  const isTextArea =

    element instanceof
    HTMLTextAreaElement;

  const isPlaceholder =

    element.hasAttribute(
      "data-translate-placeholder"
    );

  if(
    isPlaceholder
  ){

    element.placeholder =
    translation;

    return true;

  }

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



function updateDOMTranslations(){

  if(
    typeof document ===
    "undefined"
  ){

    return false;

  }

  if(
    typeof getTranslation !==
    "function"
  ){

    return false;

  }

  const elements =

    document.querySelectorAll(
      "[data-translate]"
    );

  elements.forEach((element) => {

    const key =
    String(

      element.dataset
      .translate || ""

    ).trim();

    if(!key){

      return;

    }

    applyElementTranslation(

      element,

      getTranslation(key)

    );

  });

  return true;

}



// =====================================
// REGISTER
// =====================================

async function registerTranslations(
  language,
  translations
){

  const normalizedLanguage =
  resolveSupportedLanguage(
    language
  );

  if(

    !translations ||

    typeof translations !==
    "object"

  ){

    return false;

  }

  if(
  !TRANSLATIONS[
    normalizedLanguage
  ]
){

  TRANSLATIONS[
    normalizedLanguage
  ] = {};

}
  
  TRANSLATIONS[
    normalizedLanguage
  ] = {

    ...TRANSLATIONS[
      normalizedLanguage
    ],

    ...translations

  };

  clearTranslationCache();

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
  resolveSupportedLanguage(
    language
  );

  languageRuntimeState
  .currentLanguage =
  normalizedLanguage;

  languageRuntimeState
  .lastUpdatedAt =
  Date.now();

  clearTranslationCache();

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
// RESET
// =====================================

async function resetLanguageRuntime(){

  clearTranslationCache();

  languageRuntimeState
  .initialized =
  false;

  languageRuntimeState
  .currentLanguage =
  LANGUAGE_CONFIG
  .DEFAULT_LANGUAGE;

  languageRuntimeState
  .lastUpdatedAt =
  null;

  return true;

}



// =====================================
// GETTERS
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
      .lastUpdatedAt,

    timestamp:
    Date.now()

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

  await setLanguage(
    savedLanguage
  );

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

  reset:
  resetLanguageRuntime,

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

  updateDOM:
  updateDOMTranslations,

  formatNumber,

  formatDate,

  snapshot:
  createLanguageRuntimeSnapshot,

  diagnostics:
  getLanguageRuntimeDiagnostics

});



// =====================================
// EXPORTS
// =====================================

export {
  LanguageRuntime
};

export default
LanguageRuntime;

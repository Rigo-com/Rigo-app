// =====================================
// RIGO AI
// LANGUAGE RUNTIME SYSTEM
// =====================================

import {ServiceManager} from "../../services/service-manager.js";

const LANGUAGE_CONFIG = Object.freeze({
  DEFAULT_LANGUAGE:"en",
  STORAGE_KEY:"rigo_language",
  MAX_CACHE_SIZE:100,
  SUPPORTED_LANGUAGES:["en","ar"],
  RTL_LANGUAGES:["ar"]
});

const LANGUAGE_RUNTIME_EVENTS = Object.freeze({
  INITIALIZED:"language.initialized",
  LANGUAGE_CHANGED:"language.changed",
  TRANSLATIONS_UPDATED:"language.translations.updated"
});

const TRANSLATIONS = {
  en:{
    app:{name:"RIGO AI"},
    chat:{
      typing:"RIGO AI is typing...",
      send:"Send",
      placeholder:"Type your message...",
      newChat:"New Chat"
    },
    errors:{generic:"Something went wrong"},
    file:{upload:"Upload File"}
  },
  ar:{
    app:{name:"ريغو AI"},
    chat:{
      typing:"ريغو AI يكتب...",
      send:"إرسال",
      placeholder:"اكتب رسالتك...",
      newChat:"محادثة جديدة"
    },
    errors:{generic:"حدث خطأ ما"},
    file:{upload:"رفع ملف"}
  }
};

const languageRuntimeState = Object.seal({
  initialized:false,
  currentLanguage:LANGUAGE_CONFIG.DEFAULT_LANGUAGE,
  translationCache:new Map(),
  lastUpdatedAt:null
});

async function emitLanguageRuntimeEvent(eventName,payload={}){
  try{
    const events = await ServiceManager.resolve("events");
    if(!events || typeof events.emit !== "function") return false;
    return await events.emit(eventName,{
      source:"language-runtime",
      timestamp:Date.now(),
      ...payload
    });
  }
  catch{
    return false;
  }
}

function isLanguageStorageAvailable(){
  try{
    if(typeof localStorage === "undefined") return false;
    const testKey = "__rigo_language_test__";
    localStorage.setItem(testKey,"1");
    localStorage.removeItem(testKey);
    return true;
  }
  catch{
    return false;
  }
}

function normalizeLanguage(language){
  if(typeof language !== "string") return LANGUAGE_CONFIG.DEFAULT_LANGUAGE;
  return language.trim().toLowerCase();
}

function validateLanguage(language){
  return LANGUAGE_CONFIG.SUPPORTED_LANGUAGES.includes(normalizeLanguage(language));
}

function resolveSupportedLanguage(language){
  const normalizedLanguage = normalizeLanguage(language);
  return validateLanguage(normalizedLanguage)
    ? normalizedLanguage
    : LANGUAGE_CONFIG.DEFAULT_LANGUAGE;
}

function isRTLLanguage(language){
  return LANGUAGE_CONFIG.RTL_LANGUAGES.includes(normalizeLanguage(language));
}

function saveLanguage(language){
  try{
    if(!isLanguageStorageAvailable()) return false;
    localStorage.setItem(
      LANGUAGE_CONFIG.STORAGE_KEY,
      resolveSupportedLanguage(language)
    );
    return true;
  }
  catch{
    return false;
  }
}

function loadLanguage(){
  try{
    if(!isLanguageStorageAvailable()) return LANGUAGE_CONFIG.DEFAULT_LANGUAGE;
    return resolveSupportedLanguage(
      localStorage.getItem(LANGUAGE_CONFIG.STORAGE_KEY)
    );
  }
  catch{
    return LANGUAGE_CONFIG.DEFAULT_LANGUAGE;
  }
}

function applyDocumentLanguage(language){
  if(typeof document === "undefined") return false;

  const normalizedLanguage = resolveSupportedLanguage(language);
  document.documentElement.lang = normalizedLanguage;
  document.documentElement.dir = isRTLLanguage(normalizedLanguage) ? "rtl" : "ltr";
  return true;
}

function resolveTranslationKey(object,path){
  return String(path).split(".").reduce(
    (current,key) => current?.[key],
    object
  );
}

function interpolateTranslation(translation,values={}){
  if(typeof translation !== "string") return "";

  return translation.replace(
    /\{(.*?)\}/g,
    (match,key) => values[key] ?? match
  );
}

function clearTranslationCache(){
  languageRuntimeState.translationCache.clear();
}

function setTranslationCache(key,value){
  if(languageRuntimeState.translationCache.size >= LANGUAGE_CONFIG.MAX_CACHE_SIZE){
    const firstKey = languageRuntimeState.translationCache.keys().next().value;
    languageRuntimeState.translationCache.delete(firstKey);
  }
  languageRuntimeState.translationCache.set(key,value);
}

function getTranslation(key,values={}){
  const cacheKey = JSON.stringify({
    language:languageRuntimeState.currentLanguage,
    key,
    values
  });

  if(languageRuntimeState.translationCache.has(cacheKey)){
    return languageRuntimeState.translationCache.get(cacheKey);
  }

  const currentPack = TRANSLATIONS[languageRuntimeState.currentLanguage] || {};
  const fallbackPack = TRANSLATIONS[LANGUAGE_CONFIG.DEFAULT_LANGUAGE] || {};

  const translation =
    resolveTranslationKey(currentPack,key) ??
    resolveTranslationKey(fallbackPack,key) ??
    key;

  const interpolated = interpolateTranslation(translation,values);
  setTranslationCache(cacheKey,interpolated);
  return interpolated;
}

function getSafeLocale(){
  return resolveSupportedLanguage(languageRuntimeState.currentLanguage);
}

function formatNumber(value){
  try{
    return new Intl.NumberFormat(getSafeLocale()).format(value);
  }
  catch{
    return String(value);
  }
}

function formatDate(value){
  try{
    return new Intl.DateTimeFormat(getSafeLocale()).format(new Date(value));
  }
  catch{
    return String(value);
  }
}

function applyElementTranslation(element,translation){
  if(!element) return false;

  const isInput =
    typeof HTMLInputElement !== "undefined" &&
    element instanceof HTMLInputElement;

  const isTextArea =
    typeof HTMLTextAreaElement !== "undefined" &&
    element instanceof HTMLTextAreaElement;

  if(element.hasAttribute("data-translate-placeholder")){
    element.placeholder = translation;
    return true;
  }

  if(isInput || isTextArea){
    const inputType = String(element.type || "").toLowerCase();
    if(inputType === "button" || inputType === "submit"){
      element.value = translation;
      return true;
    }
  }

  element.textContent = translation;
  return true;
}

function updateDOMTranslations(){
  if(typeof document === "undefined") return false;

  document.querySelectorAll("[data-translate]").forEach(element => {
    const key = String(element.dataset.translate || "").trim();
    if(key) applyElementTranslation(element,getTranslation(key));
  });

  return true;
}

async function registerTranslations(language,translations){
  const normalizedLanguage = resolveSupportedLanguage(language);
  if(!translations || typeof translations !== "object") return false;

  TRANSLATIONS[normalizedLanguage] = {
    ...(TRANSLATIONS[normalizedLanguage] || {}),
    ...translations
  };

  clearTranslationCache();

  await emitLanguageRuntimeEvent(
    LANGUAGE_RUNTIME_EVENTS.TRANSLATIONS_UPDATED,
    {language:normalizedLanguage}
  );

  return true;
}

async function setLanguage(language){
  const normalizedLanguage = resolveSupportedLanguage(language);

  languageRuntimeState.currentLanguage = normalizedLanguage;
  languageRuntimeState.lastUpdatedAt = Date.now();

  clearTranslationCache();
  saveLanguage(normalizedLanguage);
  applyDocumentLanguage(normalizedLanguage);
  updateDOMTranslations();

  await emitLanguageRuntimeEvent(
    LANGUAGE_RUNTIME_EVENTS.LANGUAGE_CHANGED,
    {language:normalizedLanguage}
  );

  return true;
}

async function resetLanguageRuntime(){
  clearTranslationCache();
  languageRuntimeState.initialized = false;
  languageRuntimeState.currentLanguage = LANGUAGE_CONFIG.DEFAULT_LANGUAGE;
  languageRuntimeState.lastUpdatedAt = null;
  return true;
}

function getCurrentLanguage(){
  return languageRuntimeState.currentLanguage;
}

function createLanguageRuntimeSnapshot(){
  return Object.freeze({
    timestamp:Date.now(),
    initialized:languageRuntimeState.initialized,
    currentLanguage:languageRuntimeState.currentLanguage,
    cacheSize:languageRuntimeState.translationCache.size
  });
}

async function initializeLanguageRuntime(){
  if(languageRuntimeState.initialized) return true;

  await setLanguage(loadLanguage());
  languageRuntimeState.initialized = true;

  await emitLanguageRuntimeEvent(
    LANGUAGE_RUNTIME_EVENTS.INITIALIZED
  );

  return true;
}

const LanguageRuntime = Object.freeze({
  initialize:initializeLanguageRuntime,
  reset:resetLanguageRuntime,
  set:setLanguage,
  get:getCurrentLanguage,
  translate:getTranslation,
  register:registerTranslations,
  isRTL:isRTLLanguage,
  updateDOM:updateDOMTranslations,
  formatNumber,
  formatDate,
  snapshot:createLanguageRuntimeSnapshot
});

export {LanguageRuntime};
export default LanguageRuntime;

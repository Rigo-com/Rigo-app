// =====================================
// RIGO AI
// AI SERVICE
// ENTERPRISE INFINITY SINGULARITY FINAL
// =====================================



// =====================================
// DEEP FREEZE
// =====================================

function deepFreeze(
  object,
  visited = new WeakSet()
){

  if(

    !object ||

    typeof object !==
    "object"

  ){

    return object;

  }

  if(
    visited.has(
      object
    )
  ){

    return object;

  }

  visited.add(
    object
  );

  Object
  .getOwnPropertyNames(
    object
  )
  .forEach((key) => {

    const value =
    object[key];

    if(
      value &&
      typeof value ===
      "object"
    ){

      deepFreeze(
        value,
        visited
      );

    }

  });

  return Object.freeze(
    object
  );

}



// =====================================
// AI STATE
// =====================================

let activeAIRequestController =
null;

let activeAIRequestId =
0;

let aiServiceInitialized =
false;

let isGenerating =
false;



// =====================================
// AI CONFIG
// =====================================

const AI_CONFIG =
deepFreeze({

  DEFAULT_PROVIDER:
  "simulated",

  DEFAULT_MODEL:
  "gpt-4.1-mini",

  MAX_CONTEXT_MESSAGES:
  20,

  MAX_CONTEXT_LENGTH:
  12000,

  MAX_RETRIES:
  2,

  RETRY_DELAY:
  1200,

  REQUEST_TIMEOUT:
  30000,

  TEMPERATURE:
  0.7,

  MAX_RESPONSE_LENGTH:
  4000,

  ENABLE_SYSTEM_PROMPT:
  true,

  SYSTEM_PROMPT:

  "You are RIGO AI. " +

  "Be helpful, concise, " +

  "accurate and safe."

});



// =====================================
// PROVIDERS
// =====================================

const AI_PROVIDERS =
deepFreeze([

  "simulated",

  "openai",

  "gemini",

  "claude"

]);



// =====================================
// VALIDATE PROVIDER
// =====================================

function validateAIProvider(
  provider
){

  return AI_PROVIDERS
  .includes(
    provider
  );

}



// =====================================
// SAFE DELAY
// =====================================

function delay(
  ms
){

  return new Promise((resolve) => {

    setTimeout(
      resolve,
      ms
    );

  });

}



// =====================================
// SAFE QUEUE PROCESS
// =====================================

async function safelyProcessAIQueue(){

  try{

    if(

      typeof processAIQueue ===
      "function"

    ){

      await processAIQueue();

    }

  }

  catch(error){

    logError(error);

  }

}



// =====================================
// INITIALIZE AI SERVICE
// =====================================

function initializeAIService(){

  if(aiServiceInitialized){

    return true;

  }

  const missingDependencies = [];



  // ===================================
  // REQUIRED DEPENDENCIES
  // ===================================

  if(

    typeof buildFullAIContext !==
    "function"

  ){

    missingDependencies.push(
      "buildFullAIContext"
    );

  }

  if(

    typeof addMessage !==
    "function"

  ){

    missingDependencies.push(
      "addMessage"
    );

  }

  if(

    typeof createMessageId !==
    "function"

  ){

    missingDependencies.push(
      "createMessageId"
    );

  }

  if(
    missingDependencies.length > 0
  ){

    logError(

      "AI SERVICE MISSING DEPENDENCIES",

      missingDependencies

    );

    return false;

  }

  if(

    !validateAIProvider(
      AI_CONFIG
      .DEFAULT_PROVIDER
    )

  ){

    logError(
      "INVALID AI PROVIDER"
    );

    return false;

  }

  aiServiceInitialized =
  true;

  logInfo(
    "AI SERVICE READY"
  );

  return true;

}



// =====================================
// RTL DETECTION
// =====================================

function isRTLLayout(){

  try{

    return (

      typeof document !==
      "undefined"

      &&

      document?.body?.dir ===
      "rtl"

    );

  }

  catch(error){

    return false;

  }

}



// =====================================
// SAFE TRUNCATE
// =====================================

function safeContextTruncate(
  text,
  maxLength
){

  if(
    typeof text !==
    "string"
  ){

    return "";
  }

  const characters =
  Array.from(text);

  if(
    characters.length <=
    maxLength
  ){

    return text;
  }

  return characters
  .slice(0,maxLength)
  .join("");

}



// =====================================
// GENERATE AI RESPONSE
// =====================================

async function generateAIResponse(
  requestMessageId
){

  if(isGenerating){

    return false;

  }

  isGenerating = true;

  clearTypingIndicator();

  const typingShown =
  showTypingIndicator();

  if(!typingShown){

    isGenerating = false;

    return false;

  }

  const requestId =
  ++activeAIRequestId;

  try{

    const response =
    await generateAIText(
      requestMessageId
    );

    if(
      requestId !==
      activeAIRequestId
    ){

      abortActiveAIRequest();

      return false;

    }

    const aiMessage = {

      id:createMessageId(),

      role:"assistant",

      content:response,

      timestamp:Date.now()

    };

    const inserted =
    addMessage(
      aiMessage
    );

    if(!inserted){

      logError(
        "AI MESSAGE INSERT FAILED"
      );

      return false;

    }

    return true;

  }

  catch(error){

    if(
      error?.name ===
      "AbortError"
    ){

      return false;

    }

    logError(
      error?.message ||
      error
    );

    const fallbackMessage = {

      id:createMessageId(),

      role:"assistant",

      content:
      getAIErrorMessage(),

      timestamp:Date.now()

    };

    const fallbackInserted =
    addMessage(
      fallbackMessage
    );

    if(!fallbackInserted){

      logError(
        "FALLBACK MESSAGE INSERT FAILED"
      );

    }

    return false;

  }

  finally{

    removeTypingIndicator();

    isGenerating = false;

    safelyProcessAIQueue();

  }

}



// =====================================
// GENERATE AI TEXT
// =====================================

async function generateAIText(){

  const messages =
  currentChat?.messages || [];

  const latestMessage =

    messages[
      messages.length - 1
    ]

    ||

    null;

  const context =
  buildFullAIContext(

    latestMessage?.content || "",

    messages

  );

  const truncatedContext =
  safeContextTruncate(

    context,

    AI_CONFIG
    .MAX_CONTEXT_LENGTH

  );

  const response =
  await executeAIRequestWithRetry(
    truncatedContext
  );

  return sanitizeAIResponse(
    response
  );

}



// =====================================
// SHOULD RETRY
// =====================================

function shouldRetry(error){

  if(!error){

    return false;

  }

  const errorName =
  String(
    error?.name || ""
  );

  if(
    errorName ===
    "AbortError"
  ){

    return false;

  }

  const retryableErrors = [

    "TypeError",

    "NetworkError",

    "FetchError",

    "TimeoutError"

  ];

  return (

    error instanceof
    TypeError ||

    retryableErrors
    .includes(
      errorName
    )

  );

}



// =====================================
// RETRY DELAY
// =====================================

function getRetryDelay(
  attempt
){

  const baseDelay =

  AI_CONFIG
  .RETRY_DELAY;

  const exponentialDelay =

  baseDelay *

  Math.pow(
    2,
    attempt
  );

  const jitter =

  Math.floor(
    Math.random() * 300
  );

  return (
    exponentialDelay +
    jitter
  );

}



// =====================================
// EXECUTE AI REQUEST WITH RETRY
// =====================================

async function executeAIRequestWithRetry(
  context
){

  let lastError =
  null;

  for(

    let attempt = 0;

    attempt <=
    AI_CONFIG
    .MAX_RETRIES;

    attempt++

  ){

    try{

      return await executeAIRequest(
        context
      );

    }

    catch(error){

      lastError =
      error;

      const retryAllowed =
      shouldRetry(
        error
      );

      const isLastAttempt =

      attempt ===
      AI_CONFIG
      .MAX_RETRIES;

      if(
        !retryAllowed ||
        isLastAttempt
      ){

        break;

      }

      if(

        activeAIRequestController
        ?.signal
        ?.aborted

      ){

        break;

      }

      await delay(
        getRetryDelay(
          attempt
        )
      );

    }

  }

  throw lastError;

}



// =====================================
// PROVIDER EXECUTION
// =====================================

async function executeAIRequest(
  context
){

  abortActiveAIRequest();

  const controller =
  new AbortController();

  activeAIRequestController =
  controller;

  const signal =
  controller.signal;

  let timeoutId =
  null;

  try{

    timeoutId =
    setTimeout(() => {

      if(
        !signal.aborted
      ){

        controller.abort();

      }

    },

    AI_CONFIG
    .REQUEST_TIMEOUT);

    const provider =
    AI_CONFIG
    .DEFAULT_PROVIDER;

    switch(provider){

      case "openai":

        return executeOpenAIRequest(
          context,
          signal
        );

      case "gemini":

        return executeGeminiRequest(
          context,
          signal
        );

      case "claude":

        return executeClaudeRequest(
          context,
          signal
        );

      case "simulated":

        return simulateAIRequest(
          context,
          signal
        );

      default:

        logError(
          "UNKNOWN AI PROVIDER",
          provider
        );

        return getAIErrorMessage();

    }

  }

  finally{

    if(timeoutId){

      clearTimeout(
        timeoutId
      );

    }

    if(
      activeAIRequestController ===
      controller
    ){

      activeAIRequestController =
      null;

    }

  }

}



// =====================================
// OPENAI PROVIDER
// =====================================

async function executeOpenAIRequest(
  context,
  signal
){

  return simulateAIRequest(
    context,
    signal
  );

}



// =====================================
// GEMINI PROVIDER
// =====================================

async function executeGeminiRequest(
  context,
  signal
){

  return simulateAIRequest(
    context,
    signal
  );

}



// =====================================
// CLAUDE PROVIDER
// =====================================

async function executeClaudeRequest(
  context,
  signal
){

  return simulateAIRequest(
    context,
    signal
  );

}



// =====================================
// SIMULATED PROVIDER
// =====================================

async function simulateAIRequest(
  context,
  signal
){

  await abortableWait(
    1000,
    signal
  );

  if(
    signal?.aborted
  ){

    throw new DOMException(
      "Request aborted",
      "AbortError"
    );

  }

  if(!context){

    return getAIErrorMessage();

  }

  if(
    isRTLLayout()
  ){

    return (
      "تمت معالجة الرسالة بنجاح"
    );

  }

  return (
    "Message processed successfully"
  );

}



// =====================================
// ABORTABLE WAIT
// =====================================

function abortableWait(
  ms,
  signal
){

  return new Promise(
    (resolve,reject) => {

      if(
        signal?.aborted
      ){

        reject(

          new DOMException(
            "Request aborted",
            "AbortError"
          )

        );

        return;

      }

      const timeoutId =
      setTimeout(() => {

        cleanup();

        resolve();

      },ms);

      function onAbort(){

        cleanup();

        reject(

          new DOMException(
            "Request aborted",
            "AbortError"
          )

        );

      }

      function cleanup(){

        clearTimeout(
          timeoutId
        );

        if(signal){

          signal.removeEventListener(
            "abort",
            onAbort
          );

        }

      }

      if(signal){

        signal.addEventListener(
          "abort",
          onAbort,
          { once:true }
        );

      }

    }
  );

}



// =====================================
// SANITIZE RESPONSE
// =====================================

function sanitizeAIResponse(
  response
){

  if(
    typeof response !==
    "string"
  ){

    return getAIErrorMessage();

  }

  const truncatedResponse =
  safeContextTruncate(

    response,

    AI_CONFIG
    .MAX_RESPONSE_LENGTH

  );

  let normalized =
  truncatedResponse;

  if(
    typeof truncatedResponse
    .normalize ===
    "function"
  ){

    normalized =
    truncatedResponse
    .normalize();

  }

  const cleaned =

  normalized

  .replace(
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
    ""
  )

  .trim();

  if(!cleaned){

    return getAIErrorMessage();

  }

  return cleaned;

}



// =====================================
// ABORT ACTIVE REQUEST
// =====================================

function abortActiveAIRequest(){

  if(
    !activeAIRequestController
  ){

    return;
  }

  try{

    if(

      !activeAIRequestController
      .signal
      .aborted

    ){

      activeAIRequestController
      .abort();

    }

  }

  catch(error){

    logError(error);

  }

  finally{

    activeAIRequestController =
    null;

  }

}



// =====================================
// AI ERROR MESSAGE
// =====================================

function getAIErrorMessage(){

  if(
    isRTLLayout()
  ){

    return (
      "حدث خطأ أثناء " +
      "معالجة الطلب"
    );

  }

  return (
    "An error occurred " +
    "while processing your request"
  );

}



// =====================================
// RESET AI SERVICE
// =====================================

function resetAIService(){

  activeAIRequestId++;

  abortActiveAIRequest();

  isGenerating = false;

  logInfo(
    "AI SERVICE RESET"
  );

  return true;

}

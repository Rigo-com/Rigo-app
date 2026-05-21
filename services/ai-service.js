// =====================================
// RIGO AI
// AI SERVICE
// PRODUCTION FINAL
// =====================================



// =====================================
// DEEP FREEZE
// =====================================

function deepFreeze(object){

  if(
    !object ||
    typeof object !==
    "object"
  ){

    return object;

  }

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
        value
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



// =====================================
// AI CONFIG
// =====================================

const AI_CONFIG =
deepFreeze({

  DEFAULT_MODEL:
  "gpt-4.1-mini",

  MAX_CONTEXT_MESSAGES:
  20,

  MAX_RETRIES:
  2,

  RETRY_DELAY:
  1200,

  REQUEST_TIMEOUT:
  Math.max(
    5000,
    30000
  ),

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
// INITIALIZE AI SERVICE
// =====================================

function initializeAIService(){

  if(aiServiceInitialized){

    return true;

  }

  aiServiceInitialized =
  true;

  logInfo(
    "AI SERVICE READY"
  );

  return true;

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

  const requestId =
  ++activeRequestId;

  clearTypingIndicator();

  const typingShown =
  showTypingIndicator();

  if(!typingShown){

    isGenerating = false;

    return false;

  }

  try{

    const response =
    await generateAIText(
      requestMessageId
    );

    if(
      requestId !==
      activeRequestId
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

    processAIQueue()
    .catch(logError);

  }

}



// =====================================
// GENERATE AI TEXT
// =====================================

async function generateAIText(){

  const context =
  buildConversationContext();

  const response =
  await executeAIRequestWithRetry(
    context
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

      await wait(
        getRetryDelay(
          attempt
        )
      );

    }

  }

  throw lastError;

}



// =====================================
// EXECUTE AI REQUEST
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

  const requestId =
  ++activeAIRequestId;

  let timeoutId =
  null;

  try{

    timeoutId =
    setTimeout(() => {

      if(
        activeAIRequestId ===
        requestId
      ){

        controller.abort();

      }

    },

    AI_CONFIG
    .REQUEST_TIMEOUT);

    const simulatedResponse =
    await simulateAIRequest(
      context,
      signal
    );

    return simulatedResponse;

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
// SIMULATE AI REQUEST
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

  const lastMessage =
  context[
    context.length - 1
  ];

  if(!lastMessage){

    return getAIErrorMessage();

  }

  if(
    document.body.dir ===
    "rtl"
  ){

    return (

      "تمت معالجة رسالتك:\n\n" +

      lastMessage.content

    );

  }

  return (

    "Your message was processed:\n\n" +

    lastMessage.content

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
// BUILD CONTEXT
// =====================================

function buildConversationContext(){

  const context = [];

  if(
    AI_CONFIG
    .ENABLE_SYSTEM_PROMPT
  ){

    context.push({

      role:"system",

      content:
      AI_CONFIG
      .SYSTEM_PROMPT

    });

  }

  if(
    !currentChat ||

    !Array.isArray(
      currentChat.messages
    )
  ){

    return context;

  }

  const messages =

  currentChat.messages

  .slice(
    -AI_CONFIG
    .MAX_CONTEXT_MESSAGES
  )

  .filter((message) => {

    return validateMessage(
      message
    );

  })

  .map((message) => {

    return {

      role:
      message.role,

      content:
      String(
        message.content
      ).trim()

    };

  })

  .filter((message) => {

    return Boolean(
      message.content
    );

  });

  return [

    ...context,

    ...messages

  ];

}



// =====================================
// UNICODE SAFE TRUNCATE
// =====================================

function unicodeSafeTruncate(
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

  let normalized =
  response;

  if(
    typeof response
    .normalize ===
    "function"
  ){

    normalized =
    response.normalize();

  }

  const cleaned =

  normalized

  .replace(
    /\u0000/g,
    ""
  )

  .trim();

  if(!cleaned){

    return getAIErrorMessage();

  }

  return unicodeSafeTruncate(

    cleaned,

    AI_CONFIG
    .MAX_RESPONSE_LENGTH

  );

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

    activeAIRequestController
    .abort();

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
    document.body.dir ===
    "rtl"
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

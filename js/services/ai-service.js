// =====================================
// RIGO AI
// AI SERVICE
// ENTERPRISE AI ORCHESTRATOR
// FINAL STABLE EDITION
// =====================================



// =====================================
// AI STATE
// =====================================

const aiServiceState =
Object.seal({

  initialized:false,

  generating:false,

  activeRequestId:0,

  activeController:null,

  totalRequests:0,

  successfulRequests:0,

  failedRequests:0,

  abortedRequests:0,

  lastGeneratedAt:null,

  lastError:null

});



// =====================================
// SERVICE ACCESS
// =====================================

function getAIService(
  serviceName
){

  try{

    if(
      typeof ServiceRegistry ===
      "undefined"
    ){

      return null;

    }

    if(
      typeof ServiceRegistry.get !==
      "function"
    ){

      return null;

    }

    return ServiceRegistry.get(
      serviceName
    );

  }

  catch(error){

    return null;

  }

}



// =====================================
// SAFE LOGGER
// =====================================

function safeLogError(
  ...args
){

  try{

    const diagnostics =
    getAIService(
      "diagnostics"
    );

    if(
      diagnostics &&
      typeof diagnostics.error ===
      "function"
    ){

      diagnostics.error(
        ...args
      );

      return;

    }

    console.error(...args);

  }

  catch(error){

    console.error(error);

  }

}



function safeLogInfo(
  ...args
){

  try{

    const diagnostics =
    getAIService(
      "diagnostics"
    );

    if(
      diagnostics &&
      typeof diagnostics.info ===
      "function"
    ){

      diagnostics.info(
        ...args
      );

      return;

    }

    console.info(...args);

  }

  catch(error){

    console.error(error);

  }

}



// =====================================
// IS GENERATING
// =====================================

function isAIGenerating(){

  return (
    aiServiceState
    .generating === true
  );

}



// =====================================
// ABORT ACTIVE REQUEST
// =====================================

function abortActiveAIRequest(){

  try{

    if(
      aiServiceState
      .activeController
    ){

      aiServiceState
      .activeController
      .abort();

      aiServiceState
      .abortedRequests++;

    }

  }

  catch(error){

    safeLogError(error);

  }

  finally{

    aiServiceState
    .activeController =
    null;

    aiServiceState
    .generating =
    false;

  }

  return true;

}



// =====================================
// SAFE QUEUE
// =====================================

async function safelyProcessAIQueue(){

  try{

    const queue =
    getAIService(
      "queue"
    );

    if(
      queue &&
      typeof queue.process ===
      "function"
    ){

      await queue.process();

    }

  }

  catch(error){

    safeLogError(error);

  }

}



// =====================================
// CREATE AI MESSAGE
// =====================================

function createAIMessage(
  content
){

  const messageUtils =
  getAIService(
    "message-utils"
  );

  const createMessageId =
  messageUtils
  ?.createMessageId;

  return {

    id:

      typeof createMessageId ===
      "function"

      ?

      createMessageId()

      :

      Date.now(),

    role:"assistant",

    content,

    timestamp:
    Date.now()

  };

}



// =====================================
// INSERT AI MESSAGE
// =====================================

function insertAIMessage(
  content
){

  const chatService =
  getAIService(
    "chat"
  );

  if(
    !chatService ||
    typeof chatService
    .addMessage !==
    "function"
  ){

    return false;

  }

  return chatService
  .addMessage(

    createAIMessage(
      content
    )

  );

}



// =====================================
// GENERATE AI RESPONSE
// =====================================

async function generateAIResponse(){

  if(
    aiServiceState
    .generating
  ){

    return false;

  }

  aiServiceState
  .generating = true;

  aiServiceState
  .totalRequests++;

  const ui =
  getAIService(
    "ui"
  );

  ui
  ?.clearTypingIndicator
  ?.();

  const typingShown =
  ui
  ?.showTypingIndicator
  ?.();

  if(!typingShown){

    aiServiceState
    .generating =
    false;

    return false;

  }

  const requestId =

    ++aiServiceState
    .activeRequestId;

  const startedAt =
  Date.now();

  try{

    const response =
    await generateAIText();

    if(

      requestId !==

      aiServiceState
      .activeRequestId

    ){

      abortActiveAIRequest();

      return false;

    }

    const inserted =
    insertAIMessage(
      response
    );

    if(!inserted){

      safeLogError(
        "AI MESSAGE INSERT FAILED"
      );

      return false;

    }

    aiServiceState
    .successfulRequests++;

    aiServiceState
    .lastGeneratedAt =
    Date.now();

    safeLogInfo(

      "AI RESPONSE GENERATED",

      {

        requestId,

        duration:

          Date.now() -
          startedAt

      }

    );

    return true;

  }

  catch(error){

    aiServiceState
    .failedRequests++;

    aiServiceState
    .lastError =
    error;

    const diagnostics =
    getAIService(
      "diagnostics"
    );

    await diagnostics
    ?.error?.(

      "AI RESPONSE FAILED",

      {

        error:
        String(error)

      }

    );

    if(
      error?.name ===
      "AbortError"
    ){

      return false;

    }

    safeLogError(

      error?.message ||

      error

    );

    const inserted =
    insertAIMessage(

      getAIErrorMessage()

    );

    if(!inserted){

      safeLogError(

        "FALLBACK MESSAGE INSERT FAILED"

      );

    }

    return false;

  }

  finally{

    ui
    ?.removeTypingIndicator
    ?.();

    aiServiceState
    .generating =
    false;

    await safelyProcessAIQueue();

  }

}



// =====================================
// GENERATE AI TEXT
// =====================================

async function generateAIText(){

  const config =
  getAIService(
    "config"
  );

  const aiConfig =
  config
  ?.AI_CONFIG;

  const chatService =
  getAIService(
    "chat"
  );

  const currentChat =
  chatService
  ?.currentChat;

  const messages =

    Array.isArray(
      currentChat?.messages
    )

    ?

    currentChat
    .messages

    :

    [];

  const limitedMessages =
  messages.slice(

    -(aiConfig
    ?.MAX_CONTEXT_MESSAGES

    ?? 20)

  );

  const latestMessage =

    limitedMessages[
      limitedMessages.length - 1
    ]

    ||

    null;

  const contextBuilder =
  getAIService(
    "context-builder"
  );

  const context =

    contextBuilder
    ?.buildFullAIContext?.(

      latestMessage
      ?.content || "",

      limitedMessages

    )

    ||

    latestMessage
    ?.content

    ||

    "";

  const safeContext =
  getAIService(
    "safe-context"
  );

  const truncatedContext =

    safeContext
    ?.truncate?.(

      context,

      aiConfig
      ?.MAX_CONTEXT_LENGTH

      ?? 12000

    )

    ||

    context;

  const response =
  await executeAIRequestWithRetry(
    truncatedContext
  );

  return sanitizeAIResponse(
    response
  );

}



// =====================================
// EXECUTE WITH RETRY
// =====================================

async function executeAIRequestWithRetry(
  context
){

  const config =
  getAIService(
    "config"
  );

  const aiConfig =
  config
  ?.AI_CONFIG;

  let lastError =
  null;

  for(

    let attempt = 0;

    attempt <=
    (aiConfig
    ?.MAX_RETRIES

    ?? 3);

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

      const isLastAttempt =

        attempt ===
        (aiConfig
        ?.MAX_RETRIES

        ?? 3);

      if(
        isLastAttempt
      ){

        break;

      }

      await new Promise(
        (resolve) => {

          setTimeout(

            resolve,

            aiConfig
            ?.RETRY_DELAY

            ?? 1000

          );

        }
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

  const config =
  getAIService(
    "config"
  );

  const aiConfig =
  config
  ?.AI_CONFIG;

  const providers =
  getAIService(
    "ai-providers"
  );

  abortActiveAIRequest();

  const controller =
  new AbortController();

  aiServiceState
  .activeController =
  controller;

  const signal =
  controller.signal;

  let timeoutId =
  null;

  let timedOut =
  false;

  try{

    timeoutId =
    setTimeout(() => {

      if(
        !signal.aborted
      ){

        timedOut = true;

        controller.abort();

      }

    },

    aiConfig
    ?.REQUEST_TIMEOUT

    ?? 30000);

    const provider =

      aiConfig
      ?.DEFAULT_PROVIDER

      ?? "simulated";

    switch(provider){

      case "openai":

        return await providers
        ?.openai
        ?.execute?.(
          context,
          signal
        );

      case "gemini":

        return await providers
        ?.gemini
        ?.execute?.(
          context,
          signal
        );

      case "claude":

        return await providers
        ?.claude
        ?.execute?.(
          context,
          signal
        );

      case "simulated":

        return await providers
        ?.simulated
        ?.execute?.(
          context,
          signal
        );

      default:

        safeLogError(
          "UNKNOWN AI PROVIDER",
          provider
        );

        return getAIErrorMessage();

    }

  }

  catch(error){

    if(
      timedOut
    ){

      throw new DOMException(

        "Request timeout",

        "TimeoutError"

      );

    }

    throw error;

  }

  finally{

    if(timeoutId){

      clearTimeout(
        timeoutId
      );

    }

    if(

      aiServiceState
      .activeController ===
      controller

    ){

      aiServiceState
      .activeController =
      null;

    }

  }

}



// =====================================
// SANITIZE RESPONSE
// =====================================

function sanitizeAIResponse(
  response
){

  const config =
  getAIService(
    "config"
  );

  const aiConfig =
  config
  ?.AI_CONFIG;

  if(
    typeof response !==
    "string"
  ){

    return getAIErrorMessage();

  }

  const safeContext =
  getAIService(
    "safe-context"
  );

  const truncatedResponse =

    safeContext
    ?.truncate?.(

      response,

      aiConfig
      ?.MAX_RESPONSE_LENGTH

      ?? 4000

    )

    ||

    response;

  let normalized =
  truncatedResponse;

  if(
    typeof normalized
    .normalize ===
    "function"
  ){

    normalized =
    normalized.normalize(
      "NFKC"
    );

  }

  const cleaned =

    normalized

    .replace(
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
      ""
    )

    .replace(
      /[\u202A-\u202E\u2066-\u2069]/g,
      ""
    )

    .trim();

  if(!cleaned){

    return getAIErrorMessage();

  }

  return cleaned;

}



// =====================================
// RESET AI SERVICE
// =====================================

function resetAIService(){

  aiServiceState
  .activeRequestId++;

  abortActiveAIRequest();

  aiServiceState
  .generating =
  false;

  aiServiceState
  .lastError =
  null;

  safeLogInfo(
    "AI SERVICE RESET"
  );

  return true;

}



// =====================================
// AI DIAGNOSTICS
// =====================================

function getAIDiagnostics(){

  return Object.freeze({

    initialized:
    aiServiceState
    .initialized,

    generating:
    aiServiceState
    .generating,

    totalRequests:
    aiServiceState
    .totalRequests,

    successfulRequests:
    aiServiceState
    .successfulRequests,

    failedRequests:
    aiServiceState
    .failedRequests,

    abortedRequests:
    aiServiceState
    .abortedRequests,

    lastGeneratedAt:
    aiServiceState
    .lastGeneratedAt,

    activeRequestId:
    aiServiceState
    .activeRequestId,

    hasActiveController:

      Boolean(
        aiServiceState
        .activeController
      ),

    lastError:

      aiServiceState
      .lastError

      ?

      String(
        aiServiceState
        .lastError
      )

      :

      null

  });

}



// =====================================
// INITIALIZE AI SERVICE
// =====================================

function initializeAIService(){

  if(
    aiServiceState
    .initialized
  ){

    return true;

  }

  if(
    typeof ServiceRegistry ===
    "undefined"
  ){

    return false;

  }

  if(

    typeof ServiceRegistry.has ===
    "function"

    &&

    ServiceRegistry.has(
      "ai"
    )

  ){

    aiServiceState
    .initialized =
    true;

    return true;

  }

  ServiceRegistry.register(

    "ai",

    AIService,

    {

      immutable:true,

      version:"1.0.0"

    }

  );

  ServiceRegistry.activate(
    "ai"
  );

  aiServiceState
  .initialized =
  true;

  safeLogInfo(
    "AI SERVICE READY"
  );

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const AIService =
Object.freeze({

  initialize:
  initializeAIService,

  generate:
  generateAIResponse,

  generateText:
  generateAIText,

  reset:
  resetAIService,

  abort:
  abortActiveAIRequest,

  diagnostics:
  getAIDiagnostics,

  snapshot:
  getAIDiagnostics,

  isGenerating:
  isAIGenerating

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "AIService",

    {

      value:
      AIService,

      writable:false,

      configurable:false

    }

  );

}

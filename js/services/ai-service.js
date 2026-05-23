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
// SAFE LOGGER
// =====================================

function safeLogError(
  ...args
){

  try{

    if(
      typeof logError ===
      "function"
    ){

      logError(...args);

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

    if(
      typeof logInfo ===
      "function"
    ){

      logInfo(...args);

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

  }

  return true;

}



// =====================================
// SAFE QUEUE
// =====================================

function safelyProcessAIQueue(){

  try{

    if(
      typeof processAIQueue ===
      "function"
    ){

      processAIQueue();

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

  return {

    id:createMessageId(),

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

  return addMessage(

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

  clearTypingIndicator();

  const typingShown =
  showTypingIndicator();

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

    await DiagnosticsRuntime
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

    removeTypingIndicator();

    aiServiceState
    .generating =
    false;

    safelyProcessAIQueue();

  }

}



// =====================================
// GENERATE AI TEXT
// =====================================

async function generateAIText(){

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

    -AI_CONFIG
    .MAX_CONTEXT_MESSAGES

  );

  const latestMessage =

    limitedMessages[
      limitedMessages.length - 1
    ]

    ||

    null;

  const context =
  buildFullAIContext(

    latestMessage
    ?.content || "",

    limitedMessages

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
// EXECUTE WITH RETRY
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

      const isLastAttempt =

        attempt ===
        AI_CONFIG
        .MAX_RETRIES;

      if(
        isLastAttempt
      ){

        break;

      }

      await new Promise(
        (resolve) => {

          setTimeout(

            resolve,

            AI_CONFIG
            .RETRY_DELAY

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

  registerService(
    "ai",
    AIService
  );

  activateService(
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

  isGenerating:
  isAIGenerating

});

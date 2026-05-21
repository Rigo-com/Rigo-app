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
// GENERATE AI RESPONSE
// =====================================

async function generateAIResponse(){

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

  const startedAt =
  Date.now();

  try{

    const response =
    await generateAIText();

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

      safeLogError(
        "AI MESSAGE INSERT FAILED"
      );

      return false;

    }

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

      safeLogError(

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
  Array.isArray(
    currentChat?.messages
  )

  ?

  currentChat.messages

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

    latestMessage?.content || "",

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
      activeAIRequestController ===
      controller
    ){

      activeAIRequestController =
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
    typeof truncatedResponse
    .normalize ===
    "function"
  ){

    normalized =
    truncatedResponse
    .normalize(
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

  activeAIRequestId++;

  abortActiveAIRequest();

  isGenerating = false;

  safeLogInfo(
    "AI SERVICE RESET"
  );

  return true;

}

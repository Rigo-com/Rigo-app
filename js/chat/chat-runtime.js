// =====================================
// RIGO AI
// CHAT RUNTIME SYSTEM
// ENTERPRISE CONVERSATION ENGINE FINAL
// =====================================



// =====================================
// CHAT CONFIG
// =====================================

const CHAT_RUNTIME_CONFIG =
Object.freeze({

  MAX_QUEUE_SIZE:
  100,

  MAX_RETRIES:
  3,

  RETRY_DELAY:
  1000,

  SAVE_DEBOUNCE:
  300,

  ENABLE_EVENTS:true,

  ENABLE_DIAGNOSTICS:true,

  ENABLE_GENERATION_TRACKING:true,

  ENABLE_RUNTIME_SYNC:true

});



// =====================================
// CHAT EVENTS
// =====================================

const CHAT_RUNTIME_EVENTS =
Object.freeze({

  MESSAGE_CREATED:
  "chat.message.created",

  MESSAGE_SENT:
  "chat.message.sent",

  MESSAGE_FAILED:
  "chat.message.failed",

  MESSAGE_RETRY:
  "chat.message.retry",

  GENERATION_STARTED:
  "chat.generation.started",

  GENERATION_COMPLETED:
  "chat.generation.completed",

  GENERATION_ABORTED:
  "chat.generation.aborted",

  CHAT_RESET:
  "chat.reset"

});



// =====================================
// CHAT RUNTIME STATE
// =====================================

const chatRuntimeState =
Object.seal({

  generating:false,

  streaming:false,

  syncing:false,

  initialized:false,

  processing:false,

  queue:[],

  activeMessageId:null,

  generationController:null,

  diagnostics:{

    messages:0,

    successful:0,

    failed:0,

    retries:0,

    resets:0

  }

});



// =====================================
// HELPERS
// =====================================

async function emitChatRuntimeEvent(
  eventName,
  payload = {}
){

  if(

    !CHAT_RUNTIME_CONFIG
    .ENABLE_EVENTS

  ){

    return false;

  }

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
        "chat-runtime",

        ...payload

      }

    );

    return true;

  }

  catch(error){

    return false;

  }

}



function safeClone(
  value
){

  try{

    if(
      typeof deepClone ===
      "function"
    ){

      return deepClone(
        value
      );

    }

    if(
      typeof structuredClone ===
      "function"
    ){

      return structuredClone(
        value
      );

    }

    return JSON.parse(
      JSON.stringify(
        value
      )
    );

  }

  catch(error){

    return null;

  }

}



function wait(
  duration = 0
){

  return new Promise((resolve) => {

    setTimeout(
      resolve,
      duration
    );

  });

}



function freezeChatObject(
  value,
  visited = new WeakSet()
){

  if(

    !value ||

    typeof value !==
    "object"

  ){

    return value;

  }

  if(
    visited.has(value)
  ){

    return value;

  }

  visited.add(
    value
  );

  Object.freeze(
    value
  );

  Object.values(value)
  .forEach((nestedValue) => {

    if(

      nestedValue &&

      typeof nestedValue ===
      "object"

    ){

      freezeChatObject(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



function continueQueueProcessing(){

  if(
    chatRuntimeState.processing
  ){

    return;
  }

  if(
    chatRuntimeState.generating
  ){

    return;
  }

  if(

    chatRuntimeState.queue
    .length <= 0

  ){

    return;
  }

  Promise.resolve()
  .then(() => {

    return processAIQueue();

  })
  .catch((error) => {

    safeLogError?.(

      "QUEUE CONTINUE ERROR:",

      error

    );

  });

}



// =====================================
// CREATE QUEUE ITEM
// =====================================

function createQueueItem(
  messageId
){

  return {

    id:
    String(messageId),

    createdAt:
    Date.now(),

    retries:0

  };

}



// =====================================
// SEND MESSAGE
// =====================================

async function sendMessage(){

  if(!messageInput){

    return false;

  }

  const text =
  String(
    messageInput.value || ""
  )
  .trim();

  if(!text){

    return false;

  }

  if(

    text.length >

    APP_CONFIG
    ?.CHAT
    ?.MAX_MESSAGE_LENGTH

  ){

    safeLogError?.(
      "MESSAGE TOO LONG"
    );

    return false;

  }

  if(

    chatRuntimeState
    .queue
    .length >=

    CHAT_RUNTIME_CONFIG
    .MAX_QUEUE_SIZE

  ){

    safeLogError?.(
      "QUEUE LIMIT REACHED"
    );

    return false;

  }

  if(
    currentChat?.title === ""
  ){

    currentChat.title =
    generateChatTitle(
      text
    );

  }

  const userMessage =
  freezeChatObject({

    id:createMessageId(),

    role:"user",

    content:text,

    timestamp:Date.now(),

    metadata:{

      retries:0,

      latency:null,

      generationTime:null

    }

  });

  const added =
  addMessage(
    userMessage
  );

  if(!added){

    return false;

  }

  messageInput.value =
  "";

  try{

    messageInput.focus();

  }

  catch(error){

    safeLogError?.(

      "INPUT FOCUS ERROR:",

      error

    );

  }

  const duplicateQueueItem =

    chatRuntimeState
    .queue
    .some((item) => {

      return (
        item.id ===
        userMessage.id
      );

    });

  if(
    duplicateQueueItem
  ){

    return false;

  }

  const queueItem =
  createQueueItem(
    userMessage.id
  );

  chatRuntimeState
  .queue
  .push(
    queueItem
  );

  chatRuntimeState
  .diagnostics
  .messages++;

  await emitChatRuntimeEvent(

    CHAT_RUNTIME_EVENTS
    .MESSAGE_CREATED,

    {

      messageId:
      userMessage.id

    }

  );

  continueQueueProcessing();

  return true;

}



// =====================================
// PROCESS AI QUEUE
// =====================================

async function processAIQueue(){

  if(

    typeof generateAIResponse !==
    "function"

  ){

    safeLogError?.(
      "AI SERVICE NOT AVAILABLE"
    );

    return false;

  }

  if(
    chatRuntimeState.processing
  ){

    return false;

  }

  if(
    chatRuntimeState.generating
  ){

    return false;

  }

  if(
    chatRuntimeState.queue
    .length <= 0
  ){

    return false;

  }

  chatRuntimeState
  .processing =
  true;

  const queueItem =

    chatRuntimeState
    .queue[0];

  if(!queueItem){

    chatRuntimeState
    .processing =
    false;

    return false;

  }

  const startedAt =
  Date.now();

  chatRuntimeState
  .generating =
  true;

  chatRuntimeState
  .streaming =
  true;

  chatRuntimeState
  .activeMessageId =
  queueItem.id;

  chatRuntimeState
  .generationController =
  new AbortController();

  await emitChatRuntimeEvent(

    CHAT_RUNTIME_EVENTS
    .GENERATION_STARTED,

    {

      messageId:
      queueItem.id

    }

  );

  let generated =
  false;

  try{

    if(

      chatRuntimeState
      .generationController
      .signal
      .aborted

    ){

      throw new DOMException(
        "Aborted",
        "AbortError"
      );

    }

    generated =
    await generateAIResponse(

      queueItem.id,

      {

        signal:

          chatRuntimeState
          .generationController
          .signal

      }

    );

    if(!generated){

      throw new Error(
        "GENERATION_FAILED"
      );

    }

    chatRuntimeState
    .diagnostics
    .successful++;

    await emitChatRuntimeEvent(

      CHAT_RUNTIME_EVENTS
      .GENERATION_COMPLETED,

      {

        messageId:
        queueItem.id,

        duration:

          Date.now() -
          startedAt

      }

    );

  }

  catch(error){

    const aborted =

      error?.name ===
      "AbortError";

    if(aborted){

      await emitChatRuntimeEvent(

        CHAT_RUNTIME_EVENTS
        .GENERATION_ABORTED,

        {

          messageId:
          queueItem.id

        }

      );

    }

    else{

      chatRuntimeState
      .diagnostics
      .failed++;

      if(

        queueItem.retries <

        CHAT_RUNTIME_CONFIG
        .MAX_RETRIES

      ){

        queueItem.retries++;

        chatRuntimeState
        .diagnostics
        .retries++;

        await emitChatRuntimeEvent(

          CHAT_RUNTIME_EVENTS
          .MESSAGE_RETRY,

          {

            messageId:
            queueItem.id,

            retries:
            queueItem.retries

          }

        );

        await wait(

          CHAT_RUNTIME_CONFIG
          .RETRY_DELAY

        );

        return false;

      }

      safeLogError?.(

        "QUEUE PROCESS ERROR:",

        error

      );

      await emitChatRuntimeEvent(

        CHAT_RUNTIME_EVENTS
        .MESSAGE_FAILED,

        {

          messageId:
          queueItem.id,

          error:
          String(error)

        }

      );

    }

  }

  finally{

    if(

      chatRuntimeState
      .queue[0]?.id ===
      queueItem.id

    ){

      chatRuntimeState
      .queue.shift();

    }

    chatRuntimeState
    .generating =
    false;

    chatRuntimeState
    .streaming =
    false;

    chatRuntimeState
    .processing =
    false;

    chatRuntimeState
    .activeMessageId =
    null;

    chatRuntimeState
    .generationController =
    null;

    continueQueueProcessing();

  }

  return generated;

}



// =====================================
// ABORT GENERATION
// =====================================

async function abortMessageGeneration(){

  const controller =

    chatRuntimeState
    .generationController;

  if(!controller){

    return false;

  }

  try{

    if(
      !controller.signal.aborted
    ){

      controller.abort();

    }

  }

  catch(error){

    safeLogError?.(

      "ABORT ERROR:",

      error

    );

  }

  chatRuntimeState
  .generating =
  false;

  chatRuntimeState
  .streaming =
  false;

  return true;

}



// =====================================
// ADD MESSAGE
// =====================================

function addMessage(
  messageData
){

  if(
    !chatContainer
  ){

    return false;

  }

  if(
    !currentChat
  ){

    return false;

  }

  const validMessage =
  validateMessage?.(
    messageData
  );

  if(!validMessage){

    return false;

  }

  const duplicate =
  currentChat.messages.some(
    (message) => {

      return (
        message?.id ===
        messageData?.id
      );

    }
  );

  if(
    duplicate
  ){

    return false;

  }

  try{

    const safeMessage =
    safeClone(
      messageData
    );

    if(!safeMessage){

      return false;

    }

    const messageElement =
    createMessageElement(
      safeMessage
    );

    if(!messageElement){

      return false;

    }

    chatContainer.appendChild(
      messageElement
    );

    currentChat.messages.push(
      safeMessage
    );

    currentChat.updatedAt =
    Date.now();

    currentChat.lastMessageAt =
    safeMessage.timestamp;

    currentChat.messageCount =
    currentChat.messages.length;

    debouncedSaveCurrentChat();

    scrollToBottom?.();

    return true;

  }

  catch(error){

    safeLogError?.(

      "ADD MESSAGE ERROR:",

      error

    );

    return false;

  }

}



// =====================================
// SHOW TYPING
// =====================================

function showTypingIndicator(){

  if(!chatContainer){

    return false;

  }

  if(!typingIndicatorElement){

    typingIndicatorElement =
    createTypingIndicatorElement?.();

  }

  if(!typingIndicatorElement){

    return false;

  }

  removeTypingIndicator?.(
    false
  );

  typingIndicatorElement
  .textContent =

    typeof isRTLLayout ===
    "function"

    &&

    isRTLLayout()

    ?

    "RIGO AI يكتب..."

    :

    "RIGO AI is typing...";

  if(

    !typingIndicatorElement
    .isConnected

  ){

    chatContainer.appendChild(
      typingIndicatorElement
    );

  }

  scrollToBottom?.();

  return true;

}



// =====================================
// RESET CHAT
// =====================================

async function resetCurrentChat(){

  await abortMessageGeneration();

  chatRuntimeState
  .queue = [];

  clearTimeout(
    saveTimeout
  );

  saveTimeout =
  null;

  if(scrollAnimationFrame){

    cancelAnimationFrame(
      scrollAnimationFrame
    );

    scrollAnimationFrame =
    null;

  }

  if(
    saveVersion >=
    Number.MAX_SAFE_INTEGER
  ){

    saveVersion = 0;

  }

  else{

    saveVersion++;

  }

  removeTypingIndicator?.();

  if(chatContainer){

    chatContainer
    .replaceChildren();
  }

  if(

    typeof resetAIService ===
    "function"

  ){

    resetAIService();

  }

  currentChat =
  createNewChatObject();

  chatRuntimeState
  .diagnostics
  .resets++;

  await emitChatRuntimeEvent(

    CHAT_RUNTIME_EVENTS
    .CHAT_RESET

  );

  scrollToBottom?.();

  return true;

}



// =====================================
// SAVE DEBOUNCE
// =====================================

function debouncedSaveCurrentChat(){

  if(

    typeof saveCurrentChat !==
    "function"

  ){

    return;
  }

  clearTimeout(
    saveTimeout
  );

  if(
    saveVersion >=
    Number.MAX_SAFE_INTEGER
  ){

    saveVersion = 0;

  }

  const currentVersion =
  ++saveVersion;

  saveTimeout =
  setTimeout(() => {

    if(
      currentVersion !==
      saveVersion
    ){

      return;

    }

    Promise.resolve(
      saveCurrentChat()
    )
    .catch((error) => {

      safeLogError?.(

        "CHAT SAVE ERROR:",

        error

      );

    })
    .finally(() => {

      saveTimeout =
      null;

    });

  },

  CHAT_RUNTIME_CONFIG
  .SAVE_DEBOUNCE);

}



// =====================================
// INITIALIZE
// =====================================

function initializeChatRuntime(){

  if(
    chatRuntimeState
    .initialized
  ){

    return true;

  }

  chatRuntimeState
  .initialized =
  true;

  return true;

}



// =====================================
// GET STATUS
// =====================================

function getChatRuntimeStatus(){

  return freezeChatObject({

    initialized:

      chatRuntimeState
      .initialized,

    generating:

      chatRuntimeState
      .generating,

    streaming:

      chatRuntimeState
      .streaming,

    syncing:

      chatRuntimeState
      .syncing,

    processing:

      chatRuntimeState
      .processing,

    queueSize:

      chatRuntimeState
      .queue
      .length,

    activeMessageId:

      chatRuntimeState
      .activeMessageId,

    diagnostics:

      safeClone(

        chatRuntimeState
        .diagnostics

      )

  });

}



// =====================================
// RESET RUNTIME
// =====================================

async function resetChatRuntime(){

  await abortMessageGeneration();

  chatRuntimeState
  .initialized =
  false;

  chatRuntimeState
  .generating =
  false;

  chatRuntimeState
  .streaming =
  false;

  chatRuntimeState
  .syncing =
  false;

  chatRuntimeState
  .processing =
  false;

  chatRuntimeState
  .queue = [];

  chatRuntimeState
  .activeMessageId =
  null;

  chatRuntimeState
  .generationController =
  null;

  chatRuntimeState
  .diagnostics = {

    messages:0,

    successful:0,

    failed:0,

    retries:0,

    resets:0

  };

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const ChatRuntime =
Object.freeze({

  initialize:
  initializeChatRuntime,

  send:
  sendMessage,

  process:
  processAIQueue,

  add:
  addMessage,

  reset:
  resetCurrentChat,

  abort:
  abortMessageGeneration,

  status:
  getChatRuntimeStatus,

  resetRuntime:
  resetChatRuntime

});

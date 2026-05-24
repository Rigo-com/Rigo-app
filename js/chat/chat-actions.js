// =====================================
// RIGO AI
// CHAT ACTIONS
// ENTERPRISE CHAT ACTION SYSTEM
// =====================================



// =====================================
// SEND MESSAGE
// =====================================

async function sendMessage(){

  const messageInput =
  ChatElements.getInput();

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

  ChatElements
  .focusInput();

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

  const chatContainer =
  ChatElements.getContainer();

  if(!chatContainer){

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

  const messages =

    Array.isArray(
      currentChat.messages
    )

    ?

    currentChat.messages

    :

    [];

  const duplicate =
  messages.some(
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

    ChatElements.append(
      messageElement
    );

    if(
      !Array.isArray(
        currentChat.messages
      )
    ){

      currentChat.messages =
      [];

    }

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

  resetStreamingMessageState?.();

  ChatElements.clear();

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

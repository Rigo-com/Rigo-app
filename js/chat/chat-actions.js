// =====================================
// RIGO AI
// CHAT ACTIONS
// ENTERPRISE CHAT ACTION SYSTEM
// FINAL STABLE EDITION
// =====================================



// =====================================
// SAFE CHAT LOGGER
// =====================================

function safeChatActionError(
  ...args
){

  try{

    if(
      typeof safeLogError ===
      "function"
    ){

      safeLogError(
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



// =====================================
// SAFE MESSAGE INPUT
// =====================================

function getSafeMessageInput(){

  return ChatElements
  ?.getInput
  ?.()

  ||

  null;

}



// =====================================
// VALIDATE MESSAGE
// =====================================

function validateOutgoingMessage(
  text
){

  if(
    typeof text !==
    "string"
  ){

    return false;

  }

  const trimmed =
  text.trim();

  if(
    trimmed.length <= 0
  ){

    return false;

  }

  const maxLength =

    APP_CONFIG
    ?.CHAT
    ?.MAX_MESSAGE_LENGTH

    ||

    4000;

  return (
    trimmed.length <=
    maxLength
  );

}



// =====================================
// ENSURE CHAT QUEUE
// =====================================

function ensureChatQueue(){

  if(

    !Array.isArray(
      chatRuntimeState
      ?.queue
    )

  ){

    chatRuntimeState.queue =
    [];

  }

  return chatRuntimeState
  .queue;

}



// =====================================
// SEND MESSAGE
// =====================================

async function sendMessage(){

  try{

    if(
      chatRuntimeState
      ?.destroyed
    ){

      return false;

    }

    if(
      chatRuntimeState
      ?.generating
    ){

      return false;

    }

    const messageInput =
    getSafeMessageInput();

    if(!messageInput){

      safeChatActionError(
        "MESSAGE_INPUT_NOT_FOUND"
      );

      return false;

    }

    const text =
    String(
      messageInput.value || ""
    )
    .trim();

    if(
      !validateOutgoingMessage(
        text
      )
    ){

      return false;

    }

    const queue =
    ensureChatQueue();

    const maxQueue =

      CHAT_RUNTIME_CONFIG
      ?.MAX_QUEUE_SIZE

      ||

      10;

    if(
      queue.length >=
      maxQueue
    ){

      safeChatActionError(
        "QUEUE_LIMIT"
      );

      return false;

    }

    const messageId =

      typeof createMessageId ===
      "function"

      ?

      createMessageId()

      :

      String(Date.now());

    const userMessage =
    freezeChatObject({

      id:
      messageId,

      role:"user",

      content:text,

      timestamp:
      Date.now()

    });



    // =========================
    // STORE MESSAGE
    // =========================

    const added =
    addMessage(
      userMessage
    );

    if(!added){

      return false;

    }



    // =========================
    // CREATE QUEUE ITEM
    // =========================

    const queueItem =

      typeof createQueueItem ===
      "function"

      ?

      createQueueItem(
        messageId
      )

      :

      {

        id:
        messageId,

        retries:0,

        createdAt:
        Date.now()

      };

    if(!queueItem){

      return false;

    }

    queue.push(
      queueItem
    );



    // =========================
    // CLEAR INPUT
    // =========================

    messageInput.value =
    "";



    // =========================
    // RESET HEIGHT
    // =========================

    if(
      messageInput.style
    ){

      messageInput.style.height =
      "58px";
    }



    // =========================
    // FOCUS INPUT
    // =========================

    try{

      messageInput.focus();

    }

    catch(error){}



    // =========================
    // DIAGNOSTICS
    // =========================

    chatRuntimeState
    .diagnostics
    .messages++;



    // =========================
    // PROCESS QUEUE
    // =========================

    continueQueueProcessing?.();

    return true;

  }

  catch(error){

    safeChatActionError(

      "SEND_MESSAGE_ERROR:",

      error

    );

    chatRuntimeState.generating =
    false;

    return false;

  }

}



// =====================================
// ABORT GENERATION
// =====================================

async function abortMessageGeneration(){

  const controller =

    chatRuntimeState
    ?.generationController;

  try{

    if(
      controller &&
      !controller.signal.aborted
    ){

      controller.abort();

    }

  }

  catch(error){

    safeChatActionError(
      "ABORT ERROR:",
      error
    );

  }

  try{

    ChatStreamManager
    ?.abort?.();

  }

  catch(error){

    safeChatActionError(error);

  }

  try{

    abortStreamingMessage?.();

  }

  catch(error){

    safeChatActionError(error);

  }

  chatRuntimeState.generating =
  false;

  chatRuntimeState.streaming =
  false;

  chatRuntimeState.processing =
  false;

  chatRuntimeState.activeMessageId =
  null;

  chatRuntimeState.generationController =
  null;

  return true;

}



// =====================================
// ADD MESSAGE
// =====================================

function addMessage(
  messageData
){

  try{

    if(
      !messageData
    ){

      return false;

    }

    const chatContainer =
    ChatElements
    ?.getContainer?.();

    if(!chatContainer){

      return false;

    }

    if(
      !currentChat
    ){

      return false;

    }

    if(

      !Array.isArray(
        currentChat.messages
      )
    ){

      currentChat.messages =
      [];

    }



    // =========================
    // DUPLICATE CHECK
    // =========================

    const duplicate =

      currentChat.messages
      .some((message) => {

        return (
          message?.id ===
          messageData?.id
        );

      });

    if(duplicate){

      return false;

    }



    // =========================
    // CREATE ELEMENT
    // =========================

    const messageElement =

      typeof createMessageElement ===
      "function"

      ?

      createMessageElement(
        messageData
      )

      :

      null;

    if(!messageElement){

      return false;

    }



    // =========================
    // STORE
    // =========================

    currentChat.messages
    .push(

      freezeChatObject(
        messageData
      )

    );

    currentChat.updatedAt =
    Date.now();

    currentChat.lastMessageAt =
    Date.now();

    currentChat.messageCount =
    currentChat.messages.length;



    // =========================
    // RENDER
    // =========================

    const appended =
    ChatElements.append(
      messageElement
    );

    if(!appended){

      return false;

    }



    // =========================
    // AUTO SCROLL
    // =========================

    if(

      typeof requestAnimationFrame ===
      "function"

    ){

      requestAnimationFrame(() => {

        scrollToBottom?.();

      });

    }

    else{

      scrollToBottom?.();

    }

    debouncedSaveCurrentChat?.();

    return true;

  }

  catch(error){

    safeChatActionError(

      "ADD_MESSAGE_ERROR:",

      error

    );

    return false;

  }

}



// =====================================
// RESET CHAT
// =====================================

async function resetCurrentChat(){

  try{

    await abortMessageGeneration();

    if(chatRuntimeState){

      chatRuntimeState.queue =
      [];

      chatRuntimeState.renderQueue =
      [];

      chatRuntimeState.processing =
      false;

      chatRuntimeState.generating =
      false;

      chatRuntimeState.streaming =
      false;
    }

    if(
      typeof resetStreamingMessageState ===
      "function"
    ){

      resetStreamingMessageState();

    }

    ChatStreamManager
    ?.destroy?.();

    ChatElements
    ?.clear?.();

    if(
      currentChat
    ){

      currentChat.messages =
      [];

      currentChat.updatedAt =
      Date.now();

      currentChat.lastMessageAt =
      null;

      currentChat.messageCount =
      0;
    }

    chatRuntimeState
    .diagnostics
    .resets++;

    await emitChatRuntimeEvent?.(

      CHAT_RUNTIME_EVENTS
      ?.CHAT_RESET,

      {

        timestamp:
        Date.now()

      }

    );

    return true;

  }

  catch(error){

    safeChatActionError(

      "RESET_CHAT_ERROR:",

      error

    );

    return false;

  }

}



// =====================================
// SAVE DEBOUNCE
// =====================================

function debouncedSaveCurrentChat(){

  return true;

}

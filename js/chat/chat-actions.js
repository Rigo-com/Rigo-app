// =====================================
// RIGO AI
// CHAT ACTIONS
// ENTERPRISE CHAT ACTION SYSTEM
// =====================================



// =====================================
// SEND MESSAGE
// =====================================

async function sendMessage(){

  try{

    if(
      chatRuntimeState?.generating
    ){

      return false;

    }

    const messageInput =
    ChatElements?.getInput?.();

    if(!messageInput){

      console.error(
        "MESSAGE_INPUT_NOT_FOUND"
      );

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

    const maxLength =

      APP_CONFIG
      ?.CHAT
      ?.MAX_MESSAGE_LENGTH

      ||

      4000;

    if(
      text.length > maxLength
    ){

      console.error(
        "MESSAGE_TOO_LONG"
      );

      return false;

    }

    if(
      !Array.isArray(
        chatRuntimeState.queue
      )
    ){

      chatRuntimeState.queue =
      [];

    }

    const maxQueue =

      CHAT_RUNTIME_CONFIG
      ?.MAX_QUEUE_SIZE

      ||

      10;

    if(
      chatRuntimeState.queue.length >=
      maxQueue
    ){

      console.error(
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

      timestamp:Date.now()

    });



    // =========================
    // STORE MESSAGE
    // =========================

    addMessage(
      userMessage
    );



    // =========================
    // CLEAR INPUT
    // =========================

    messageInput.value = "";



    // =========================
    // RESET TEXTAREA HEIGHT
    // =========================

    if(
      typeof messageInput.style !==
      "undefined"
    ){

      messageInput.style.height =
      "58px";

    }



    // =========================
    // FOCUS INPUT
    // =========================

    messageInput.focus();



    // =========================
    // GENERATION STATE
    // =========================

    chatRuntimeState.generating =
    true;

    continueQueueProcessing?.();

    return true;

  }

  catch(error){

    console.error(
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

    console.error(
      "ABORT ERROR:",
      error
    );

  }

  try{

    ChatStreamManager
    ?.abort?.();

  }

  catch(error){

    console.error(error);

  }

  try{

    abortStreamingMessage?.();

  }

  catch(error){

    console.error(error);

  }

  chatRuntimeState.generating =
  false;

  chatRuntimeState.streaming =
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

      !Array.isArray(
        currentChat?.messages
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

    ChatElements.append(
      messageElement
    );



    // =========================
    // DIAGNOSTICS
    // =========================

    chatRuntimeState
    .diagnostics
    .messages++;



    // =========================
    // AUTO SCROLL
    // =========================

    requestAnimationFrame(() => {

      scrollToBottom?.();

    });

    debouncedSaveCurrentChat?.();

    return true;

  }

  catch(error){

    console.error(
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

    const container =
    ChatElements
    ?.getContainer?.();

    if(container){

      container.replaceChildren();

    }

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

    return true;

  }

  catch(error){

    console.error(
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

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
      !chatRuntimeState.queue
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

    const userMessage = {

      id:

        typeof createMessageId ===
        "function"

        ?

        createMessageId()

        :

        String(Date.now()),

      role:"user",

      content:text,

      timestamp:Date.now()

    };



    // =========================
    // STORE MESSAGE
    // =========================

    if(
      typeof addMessage ===
      "function"
    ){

      try{

        addMessage(
          userMessage
        );

      }

      catch(error){

        console.error(error);

      }

    }



    // =========================
    // CLEAR INPUT
    // =========================

    messageInput.value = "";

    messageInput.focus();



    // =========================
    // TEMP AI RESPONSE
    // =========================

    setTimeout(() => {

      addMessage({

        id:
        "ai_" + Date.now(),

        role:"assistant",

        content:
        "RIGO AI RESPONSE",

        timestamp:
        Date.now()

      });

    },500);

    return true;

  }

  catch(error){

    console.error(
      "SEND_MESSAGE_ERROR:",
      error
    );

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

    console.error(
      "ABORT ERROR:",
      error
    );

  }

  chatRuntimeState.generating =
  false;

  chatRuntimeState.streaming =
  false;

  return true;

}



// =====================================
// ADD MESSAGE
// =====================================

function addMessage(
  messageData
){

  try{

    const chatContainer =
    ChatElements
    ?.getContainer?.();

    if(!chatContainer){

      return false;

    }

    if(!messageData){

      return false;

    }



    // =========================
    // WRAPPER
    // =========================

    const messageElement =
    document.createElement("div");

    messageElement.className =

      messageData.role === "user"

      ?

      "message user-message"

      :

      "message ai-message";



    // =========================
    // CONTENT
    // =========================

    const content =
    document.createElement("div");

    content.className =
    "message-content";

    content.textContent =
    messageData.content || "";



    // =========================
    // APPEND
    // =========================

    messageElement.appendChild(
      content
    );

    chatContainer.appendChild(
      messageElement
    );

    chatContainer.scrollTop =
    chatContainer.scrollHeight;

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

    }

    const container =
    ChatElements
    ?.getContainer?.();

    if(container){

      container.innerHTML = "";

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

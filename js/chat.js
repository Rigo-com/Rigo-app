// =====================================
// SAFE CLONE
// =====================================

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

    return structuredClone(
      value
    );

  }

  catch(error){

    try{

      return JSON.parse(
        JSON.stringify(
          value
        )
      );

    }

    catch(cloneError){

      return null;

    }

  }

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
    .CHAT
    .MAX_MESSAGE_LENGTH

  ){

    safeLogError(
      "MESSAGE TOO LONG"
    );

    return false;

  }

  if(

    pendingMessages.length >=

    APP_CONFIG
    .CHAT
    .MAX_PENDING_MESSAGES

  ){

    safeLogError(
      "QUEUE LIMIT REACHED"
    );

    return false;

  }

  if(
    currentChat.title === ""
  ){

    currentChat.title =
    generateChatTitle(
      text
    );

  }

  const userMessage = {

    id:createMessageId(),

    role:"user",

    content:text,

    timestamp:Date.now()

  };

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

    safeLogError(

      "INPUT FOCUS ERROR:",

      error

    );

  }

  if(

    !pendingMessages.includes(
      userMessage.id
    )

  ){

    pendingMessages.push(
      userMessage.id
    );

  }

  processAIQueue()
  .catch(safeLogError);

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

    safeLogError(
      "AI SERVICE NOT AVAILABLE"
    );

    return false;

  }

  if(

    typeof isAIResponseGenerating ===
    "function"

    &&

    isAIResponseGenerating()

  ){

    return false;

  }

  if(
    pendingMessages.length <= 0
  ){

    return false;

  }

  const nextMessageId =
  pendingMessages[0];

  let generated =
  false;

  try{

    generated =
    await generateAIResponse(
      nextMessageId
    );

  }

  catch(error){

    safeLogError(

      "QUEUE PROCESS ERROR:",

      error

    );

  }

  finally{

    if(

      pendingMessages[0] ===
      nextMessageId

    ){

      pendingMessages.shift();

    }

  }

  return generated;

}



// =====================================
// ADD MESSAGE
// =====================================

function addMessage(
  messageData
){

  if(!chatContainer){

    return false;

  }

  const validMessage =
  validateMessage(
    messageData
  );

  if(!validMessage){

    return false;

  }

  const duplicateMessage =
  currentChat.messages.some(
    (message) => {

      return (
        message?.id ===
        messageData?.id
      );

    }
  );

  if(
    duplicateMessage
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

    scrollToBottom();

    return true;

  }

  catch(error){

    safeLogError(

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
    createTypingIndicatorElement();

  }

  removeTypingIndicator(
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

  chatContainer.appendChild(
    typingIndicatorElement
  );

  scrollToBottom();

  return true;

}



// =====================================
// RESET CHAT
// =====================================

function resetCurrentChat(){

  pendingMessages.length =
  0;

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

  removeTypingIndicator();

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

  scrollToBottom();

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
    .then((saveResult) => {

      if(!saveResult){

        safeLogError(
          "CHAT SAVE FAILED"
        );

      }

    })
    .catch((error) => {

      safeLogError(

        "CHAT SAVE ERROR:",

        error

      );

    })
    .finally(() => {

      saveTimeout =
      null;

    });

  },300);

}

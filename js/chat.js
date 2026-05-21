// =====================================
// RIGO AI
// CHAT SYSTEM
// ENTERPRISE OMEGA FINAL
// =====================================



// =====================================
// CHAT STATE
// =====================================

let saveTimeout =
null;

let saveVersion =
0;

const pendingMessages =
[];

let currentChat =
createNewChatObject();

let typingIndicatorElement =
null;

let scrollAnimationFrame =
null;



// =====================================
// CREATE CHAT OBJECT
// =====================================

function createNewChatObject(){

  const timestamp =
  Date.now();

  return {

    id:createChatId(),

    title:"",

    createdAt:timestamp,

    updatedAt:timestamp,

    lastMessageAt:null,

    messageCount:0,

    messages:[]

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
    .CHAT
    .MAX_MESSAGE_LENGTH

  ){

    console.error(
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

    console.error(
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

    console.error(
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
  .catch(console.error);

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

    console.error(
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

    console.error(

      "QUEUE PROCESS ERROR:",

      error

    );

  }

  if(

    generated &&

    pendingMessages[0] ===
    nextMessageId

  ){

    pendingMessages.shift();

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

  try{

    const safeMessage =
    deepClone(
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

    console.error(

      "ADD MESSAGE ERROR:",

      error

    );

    return false;

  }

}



// =====================================
// VALIDATE MESSAGE
// =====================================

function validateMessage(
  messageData
){

  if(

    !messageData ||

    typeof messageData !==
    "object"

  ){

    return false;

  }

  if(
    typeof messageData.id !==
    "string"
  ){

    return false;

  }

  if(
    messageData.content ==
    null
  ){

    return false;

  }

  if(

    !APP_CONFIG
    .CHAT
    .VALID_ROLES
    .includes(
      messageData.role
    )

  ){

    return false;

  }

  const content =
  String(
    messageData.content
  );

  if(
    !content.trim()
  ){

    return false;

  }

  if(

    content.length >

    APP_CONFIG
    .CHAT
    .MAX_MESSAGE_LENGTH

  ){

    return false;

  }

  if(

    !Number.isFinite(
      messageData.timestamp
    )

  ){

    return false;

  }

  const currentTime =
  Date.now();

  const minimumTimestamp =
  0;

  const maximumTimestamp =

    currentTime +

    1000 * 60 * 60 * 24;

  if(

    messageData.timestamp <
    minimumTimestamp

    ||

    messageData.timestamp >
    maximumTimestamp

  ){

    return false;

  }

  return true;

}



// =====================================
// CREATE MESSAGE ELEMENT
// =====================================

function createMessageElement(
  messageData
){

  const normalizedRole =
  String(
    messageData.role
  )
  .trim()
  .toLowerCase();

  const normalizedId =
  String(
    messageData.id
  )
  .trim();

  const message =
  document.createElement(
    "div"
  );

  message.classList.add(
    "message"
  );

  message.dataset.id =
  normalizedId;

  message.dataset.role =
  normalizedRole;

  message.setAttribute(

    "aria-label",

    normalizedRole +
    " message"

  );

  if(
    normalizedRole ===
    "user"
  ){

    message.classList.add(
      "user-message"
    );

  }

  else{

    message.classList.add(
      "ai-message"
    );

  }

  message.textContent =
  String(
    messageData.content
  );

  return message;

}



// =====================================
// CHAT TITLE
// =====================================

function generateChatTitle(
  text
){

  const cleanText =
  String(
    text || ""
  )
  .replace(/\s+/g," ")
  .trim();

  if(

    cleanText.length <=

    APP_CONFIG
    .CHAT
    .TITLE_LIMIT

  ){

    return cleanText;

  }

  return (

    cleanText.substring(

      0,

      APP_CONFIG
      .CHAT
      .TITLE_LIMIT

    ) +

    "..."

  );

}



// =====================================
// TYPING ELEMENT
// =====================================

function createTypingIndicatorElement(){

  const typing =
  document.createElement(
    "div"
  );

  typing.classList.add(

    "message",

    "ai-message",

    "typing-indicator"

  );

  typing.id =
  "typingIndicator";

  typing.setAttribute(

    "aria-label",

    "AI typing indicator"

  );

  return typing;

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

    document.body?.dir ===
    "rtl"

    ? "RIGO AI يكتب..."

    : "RIGO AI is typing...";

  chatContainer.appendChild(
    typingIndicatorElement
  );

  scrollToBottom();

  return true;

}



// =====================================
// REMOVE TYPING
// =====================================

function removeTypingIndicator(
  resetReference = true
){

  if(

    typingIndicatorElement &&

    typingIndicatorElement
    .parentNode

  ){

    typingIndicatorElement
    .remove();

  }

  if(resetReference){

    typingIndicatorElement =
    null;

  }

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
// SCROLL
// =====================================

function scrollToBottom(){

  if(!chatContainer){

    return false;

  }

  if(scrollAnimationFrame){

    cancelAnimationFrame(
      scrollAnimationFrame
    );

  }

  scrollAnimationFrame =
  requestAnimationFrame(() => {

    scrollAnimationFrame =
    null;

    if(!chatContainer){

      return;

    }

    chatContainer.scrollTop =
    chatContainer.scrollHeight;

  });

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

    let settled =
    false;

    Promise.resolve(
      saveCurrentChat()
    )
    .then((saveResult) => {

      settled = true;

      if(!saveResult){

        console.error(
          "CHAT SAVE FAILED"
        );

      }

    })
    .catch((error) => {

      settled = true;

      console.error(

        "CHAT SAVE ERROR:",

        error

      );

    })
    .finally(() => {

      if(settled){

        saveTimeout =
        null;

      }

    });

  },300);

}

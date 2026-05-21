// =====================================
// RIGO AI
// CHAT SYSTEM
// =====================================



// =====================================
// DOM SAFETY
// =====================================

if(

  typeof messageInput ===
  "undefined" ||

  !messageInput

){

  console.error(
    "messageInput not found"
  );

}



if(

  typeof chatContainer ===
  "undefined" ||

  !chatContainer

){

  console.error(
    "chatContainer not found"
  );

}



// =====================================
// CHAT STATE
// =====================================

let isGenerating = false;

let activeRequestId = 0;

let saveTimeout = null;

let saveVersion = 0;

let pendingMessages = [];

let currentChat =
createNewChatObject();

let typingIndicatorElement =
null;



// =====================================
// CREATE CHAT OBJECT
// =====================================

function createNewChatObject(){

  return {

    id:createChatId(),

    title:"",

    createdAt:Date.now(),

    updatedAt:Date.now(),

    messages:[]

  };

}



// =====================================
// SEND MESSAGE
// =====================================

async function sendMessage(){

  if(

    typeof messageInput ===
    "undefined" ||

    !messageInput

  ){

    return false;

  }

  const text =
  messageInput.value.trim();

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

  messageInput.value = "";

  messageInput.focus();

  pendingMessages.push(
    userMessage.id
  );

  processAIQueue()
  .catch(console.error);

  return true;

}



// =====================================
// PROCESS AI QUEUE
// =====================================

async function processAIQueue(){

  if(isGenerating){

    return false;

  }

  if(
    pendingMessages.length <= 0
  ){

    return false;

  }

  pendingMessages.shift();

  return generateAIResponse();

}



// =====================================
// ADD MESSAGE
// =====================================

function addMessage(messageData){

  if(

    typeof chatContainer ===
    "undefined" ||

    !chatContainer

  ){

    return false;

  }

  if(
    !validateMessage(
      messageData
    )
  ){

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

  if(!messageData){

    return false;

  }

  if(
    typeof messageData.id !==
    "string"
  ){

    return false;

  }

  if(
    typeof messageData.content ===
    "undefined"
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

  return true;

}



// =====================================
// CREATE MESSAGE ELEMENT
// =====================================

function createMessageElement(
  messageData
){

  const message =
  document.createElement(
    "div"
  );

  message.classList.add(
    "message"
  );

  message.dataset.id =
  messageData.id;

  message.dataset.role =
  messageData.role;

  message.setAttribute(
    "aria-label",
    messageData.role + " message"
  );

  if(
    messageData.role ===
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
// AI RESPONSE
// =====================================

async function generateAIResponse(){

  if(isGenerating){

    return false;

  }

  isGenerating = true;

  const requestId =
  ++activeRequestId;

  clearTypingIndicator();

  const typingShown =
  showTypingIndicator();

  if(!typingShown){

    removeTypingIndicator();

    isGenerating = false;

    return false;

  }

  try{

    await wait(
      APP_CONFIG
      .CHAT
      .AI_DELAY
    );

    if(
      requestId !==
      activeRequestId
    ){

      return false;

    }

    removeTypingIndicator();

    const aiMessage = {

      id:createMessageId(),

      role:"assistant",

      content:
      getMockAIResponse(),

      timestamp:Date.now()

    };

    return addMessage(
      aiMessage
    );

  }

  catch(error){

    console.error(
      "AI RESPONSE ERROR:",
      error
    );

    return false;

  }

  finally{

    removeTypingIndicator();

    isGenerating = false;

    processAIQueue()
    .catch(console.error);

  }

}



// =====================================
// MOCK RESPONSE
// =====================================

function getMockAIResponse(){

  if(
    document.body.dir ===
    "rtl"
  ){

    return "أنا جاهز لمساعدتك 🚀";

  }

  return "I am ready to help you 🚀";

}



// =====================================
// CHAT TITLE
// =====================================

function generateChatTitle(
  text
){

  const cleanText =
  text.trim();

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
    ) + "..."
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

  if(

    typeof chatContainer ===
    "undefined" ||

    !chatContainer

  ){

    return false;

  }

  removeTypingIndicator();

  if(!typingIndicatorElement){

    typingIndicatorElement =
    createTypingIndicatorElement();

  }

  typingIndicatorElement
  .textContent =

  document.body.dir ===
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

function removeTypingIndicator(){

  if(
    typingIndicatorElement &&
    typingIndicatorElement.parentNode
  ){

    typingIndicatorElement.remove();

  }

}



// =====================================
// CLEAR TYPING
// =====================================

function clearTypingIndicator(){

  removeTypingIndicator();

}



// =====================================
// RESET CHAT
// =====================================

function resetCurrentChat(){

  activeRequestId++;

  isGenerating = false;

  pendingMessages = [];

  clearTimeout(
    saveTimeout
  );

  saveTimeout = null;

  saveVersion++;

  clearTypingIndicator();

  if(

    typeof chatContainer !==
    "undefined" &&

    chatContainer

  ){

    chatContainer.innerHTML =
    "";

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

  if(

    typeof chatContainer ===
    "undefined" ||

    !chatContainer

  ){

    return false;

  }

  requestAnimationFrame(() => {

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

    const saveResult =
    saveCurrentChat();

    saveTimeout = null;

    if(!saveResult){

      console.error(
        "CHAT SAVE FAILED"
      );

    }

  },300);

}

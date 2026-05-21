// =====================================
// RIGO AI
// CHAT SYSTEM
// ULTIMATE PRODUCTION FINAL
// =====================================



// =====================================
// CHAT STATE
// =====================================

let isGenerating = false;

let activeRequestId = 0;

let saveTimeout = null;

let saveVersion = 0;

const pendingMessages = [];

let currentChat =
createNewChatObject();

let typingIndicatorElement =
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

  const nextMessageId =
  pendingMessages[0];

  const generated =
  await generateAIResponse();

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

function addMessage(messageData){

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
// AI RESPONSE
// =====================================

async function generateAIResponse(){

  if(isGenerating){

    return false;

  }

  isGenerating = true;

  const requestId =
  ++activeRequestId;

  const typingShown =
  showTypingIndicator();

  if(!typingShown){

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

    const aiMessage = {

      id:createMessageId(),

      role:"assistant",

      content:
      getMockAIResponse(),

      timestamp:Date.now()

    };

    removeTypingIndicator();

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
    document.body?.dir ===
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

  removeTypingIndicator();

  if(!typingIndicatorElement){

    typingIndicatorElement =
    createTypingIndicatorElement();

  }

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

function removeTypingIndicator(){

  if(

    typingIndicatorElement &&

    typingIndicatorElement
    .parentNode

  ){

    typingIndicatorElement
    .remove();

  }

}



// =====================================
// RESET CHAT
// =====================================

function resetCurrentChat(){

  activeRequestId++;

  isGenerating = false;

  pendingMessages.length =
  0;

  clearTimeout(
    saveTimeout
  );

  saveTimeout = null;

  saveVersion++;

  removeTypingIndicator();

  if(chatContainer){

    chatContainer
    .replaceChildren();

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

  requestAnimationFrame(() => {

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

        console.error(
          "CHAT SAVE FAILED"
        );

      }

    })
    .catch((error) => {

      console.error(
        "CHAT SAVE ERROR:",
        error
      );

    })
    .finally(() => {

      saveTimeout = null;

    });

  },300);

}

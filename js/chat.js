// =====================================
// RIGO AI
// CHAT SYSTEM
// =====================================



// =====================================
// CONFIG
// =====================================

const CHAT_CONFIG =
Object.freeze({

  TITLE_LIMIT:30,

  AI_DELAY:1200,

  VALID_ROLES:[
    "user",
    "assistant"
  ]

});



// =====================================
// CHAT STATE
// =====================================

let isGenerating = false;

let currentChat =
createNewChatObject();



// =====================================
// CREATE CHAT OBJECT
// =====================================

function createNewChatObject(){

  return {

    id:createChatId(),

    title:"",

    createdAt:Date.now(),

    messages:[]

  };

}



// =====================================
// SEND MESSAGE
// =====================================

function sendMessage(){

  if(isGenerating){

    return;

  }

  const text =
  messageInput.value.trim();

  if(!text){

    return;

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

  addMessage(
    userMessage
  );

  messageInput.value = "";

  messageInput.focus();

  scrollToBottom();

  generateAIResponse();

}



// =====================================
// ADD MESSAGE
// =====================================

function addMessage(messageData){

  if(
    !validateMessage(
      messageData
    )
  ){

    return;

  }

  currentChat.messages.push(
    messageData
  );

  const messageElement =
  createMessageElement(
    messageData
  );

  chatContainer.appendChild(
    messageElement
  );

  scrollToBottom();

}



// =====================================
// VALIDATE MESSAGE
// =====================================

function validateMessage(
  messageData
){

  if(
    !messageData
  ){

    return false;

  }

  if(
    !messageData.role
  ){

    return false;

  }

  if(
    !CHAT_CONFIG
    .VALID_ROLES
    .includes(
      messageData.role
    )
  ){

    return false;

  }

  if(
    !messageData.content
  ){

    return false;

  }

  if(
    !messageData.content
    .trim()
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

  if(
    messageData.role === "user"
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
  messageData.content;

  return message;

}



// =====================================
// AI RESPONSE
// =====================================

async function generateAIResponse(){

  if(isGenerating){

    return;

  }

  isGenerating = true;

  clearTypingIndicator();

  showTypingIndicator();

  try{

    await wait(
      CHAT_CONFIG
      .AI_DELAY
    );

    removeTypingIndicator();

    const aiMessage = {

      id:createMessageId(),

      role:"assistant",

      content:
      getMockAIResponse(),

      timestamp:Date.now()

    };

    addMessage(
      aiMessage
    );

  }

  catch(error){

    console.error(
      "AI RESPONSE ERROR:",
      error
    );

    removeTypingIndicator();

  }

  finally{

    isGenerating = false;

  }

}



// =====================================
// MOCK RESPONSE
// =====================================

function getMockAIResponse(){

  if(
    document.body.dir === "rtl"
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
    CHAT_CONFIG
    .TITLE_LIMIT
  ){

    return cleanText;

  }

  return (
    cleanText.substring(
      0,
      CHAT_CONFIG
      .TITLE_LIMIT
    ) + "..."
  );

}



// =====================================
// TYPING INDICATOR
// =====================================

function showTypingIndicator(){

  removeTypingIndicator();

  const typing =
  document.createElement(
    "div"
  );

  typing.classList.add(
    "message"
  );

  typing.classList.add(
    "ai-message"
  );

  typing.classList.add(
    "typing-indicator"
  );

  typing.id =
  "typingIndicator";

  if(
    document.body.dir === "rtl"
  ){

    typing.textContent =
    "RIGO AI يكتب...";

  }

  else{

    typing.textContent =
    "RIGO AI is typing...";

  }

  chatContainer.appendChild(
    typing
  );

  scrollToBottom();

}



// =====================================
// REMOVE TYPING
// =====================================

function removeTypingIndicator(){

  const typing =
  document.getElementById(
    "typingIndicator"
  );

  if(typing){

    typing.remove();

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

  clearTypingIndicator();

  currentChat =
  createNewChatObject();

}



// =====================================
// SCROLL
// =====================================

function scrollToBottom(){

  requestAnimationFrame(() => {

    chatContainer.scrollTop =
    chatContainer.scrollHeight;

  });

}



// =====================================
// WAIT
// =====================================

function wait(ms){

  return new Promise(
    (resolve) => {

      setTimeout(
        resolve,
        ms
      );

    }
  );

}



// =====================================
// MESSAGE ID
// =====================================

function createMessageId(){

  return (

    "msg_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .substring(2,9)

  );

}



// =====================================
// CHAT ID
// =====================================

function createChatId(){

  return (

    "chat_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .substring(2,9)

  );

}

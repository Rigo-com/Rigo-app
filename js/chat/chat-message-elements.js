// =====================================
// RIGO AI
// CHAT MESSAGE ELEMENTS
// =====================================



// =====================================
// MESSAGE ROLE CLASS
// =====================================

function getMessageRoleClass(
  role
){

  const normalizedRole =
  String(
    role || ""
  )
  .trim()
  .toLowerCase();

  switch(normalizedRole){

    case "assistant":
      return "ai-message";

    case "system":
      return "system-message";

    case "user":
    default:
      return "user-message";

  }

}



// =====================================
// SAFE CONTENT
// =====================================

function getSafeMessageContent(
  message
){

  return String(
    message?.content || ""
  );

}



// =====================================
// FORMAT TIMESTAMP
// =====================================

function formatMessageTimestamp(
  timestamp
){

  const parsedTimestamp =
  Number(timestamp);

  if(
    !Number.isFinite(
      parsedTimestamp
    )
  ){
    return "";
  }

  try{

    return new Date(
      parsedTimestamp
    )
    .toLocaleTimeString();

  }

  catch{

    return "";

  }

}



// =====================================
// CREATE CONTENT ELEMENT
// =====================================

function createMessageContentElement(
  message
){

  if(
    typeof document ===
    "undefined"
  ){
    return null;
  }

  const content =
  document.createElement(
    "div"
  );

  content.classList.add(
    "message-content"
  );

  const messageContent =
  getSafeMessageContent(
    message
  );

  try{

    if(

      typeof ChatMarkdownRenderer !==
      "undefined"

      &&

      typeof ChatMarkdownRenderer
      .render ===
      "function"

    ){

      ChatMarkdownRenderer.render(
        content,
        messageContent
      );

    }

    else{

      content.textContent =
      messageContent;

    }

  }

  catch(error){

    content.textContent =
    messageContent;

  }

  return content;

}



// =====================================
// CREATE META ELEMENT
// =====================================

function createMessageMetaElement(
  message
){

  if(
    typeof document ===
    "undefined"
  ){
    return null;
  }

  const meta =
  document.createElement(
    "div"
  );

  meta.classList.add(
    "message-meta"
  );

  meta.textContent =
  formatMessageTimestamp(
    message?.timestamp
  );

  return meta;

}



// =====================================
// CREATE MESSAGE ELEMENT
// =====================================

function createMessageElement(
  message
){

  if(
    !message
  ){
    return null;
  }

  if(
    typeof document ===
    "undefined"
  ){
    return null;
  }

  const wrapper =
  document.createElement(
    "div"
  );

  wrapper.classList.add(
    "message"
  );

  wrapper.classList.add(

    getMessageRoleClass(
      message.role
    )

  );

  wrapper.dataset.messageId =
  String(
    message.id || ""
  );

  wrapper.dataset.role =
  String(
    message.role || ""
  );

  const content =
  createMessageContentElement(
    message
  );

  if(!content){
    return null;
  }

  wrapper.appendChild(
    content
  );

  const meta =
  createMessageMetaElement(
    message
  );

  if(meta){

    wrapper.appendChild(
      meta
    );

  }

  return wrapper;

}



// =====================================
// UPDATE MESSAGE ELEMENT
// =====================================

function updateMessageElement(
  element,
  message
){

  if(
    !element ||
    !message
  ){
    return false;
  }

  const content =

    element.querySelector(
      ".message-content"
    );

  if(!content){
    return false;
  }

  const messageContent =
  getSafeMessageContent(
    message
  );

  try{

    if(

      typeof ChatMarkdownRenderer !==
      "undefined"

      &&

      typeof ChatMarkdownRenderer
      .render ===
      "function"

    ){

      ChatMarkdownRenderer.render(
        content,
        messageContent
      );

    }

    else{

      content.textContent =
      messageContent;

    }

  }

  catch(error){

    content.textContent =
    messageContent;

  }

  const meta =

    element.querySelector(
      ".message-meta"
    );

  if(meta){

    meta.textContent =
    formatMessageTimestamp(
      message?.timestamp
    );

  }

  element.dataset.messageId =
  String(
    message.id || ""
  );

  element.dataset.role =
  String(
    message.role || ""
  );

  return true;

}



// =====================================
// REMOVE MESSAGE ELEMENT
// =====================================

function removeMessageElement(
  element
){

  if(
    !element
  ){
    return false;
  }

  try{

    element.remove();

    return true;

  }

  catch{

    return false;

  }

}



// =====================================
// DIAGNOSTICS
// =====================================

function getChatMessageElementDiagnostics(){

  return Object.freeze({

    markdownAvailable:

      typeof ChatMarkdownRenderer !==
      "undefined",

    documentAvailable:

      typeof document !==
      "undefined"

  });

}



// =====================================
// PUBLIC API
// =====================================

const ChatMessageElements =
Object.freeze({

  create:
  createMessageElement,

  update:
  updateMessageElement,

  remove:
  removeMessageElement,

  diagnostics:
  getChatMessageElementDiagnostics,

  snapshot:
  getChatMessageElementDiagnostics

});



// =====================================
// EXPORTS
// =====================================

export {

  ChatMessageElements,

  createMessageElement,

  updateMessageElement,

  removeMessageElement,

  getChatMessageElementDiagnostics

};

export default
ChatMessageElements;

// =====================================
// RIGO AI
// CHAT MESSAGE ELEMENTS
// ENTERPRISE MESSAGE ELEMENT SYSTEM
// FINAL STABLE EDITION
// =====================================



// =====================================
// SERVICE ACCESS
// =====================================

function getChatMessageService(
  serviceName
){

  try{

    if(
      typeof ServiceRegistry ===
      "undefined"
    ){

      return null;

    }

    if(
      typeof ServiceRegistry.get !==
      "function"
    ){

      return null;

    }

    return ServiceRegistry.get(
      serviceName
    );

  }

  catch(error){

    return null;

  }

}



// =====================================
// SAFE LOGGER
// =====================================

function safeMessageLogError(
  ...args
){

  try{

    const diagnostics =
    getChatMessageService(
      "diagnostics"
    );

    if(
      diagnostics &&
      typeof diagnostics.error ===
      "function"
    ){

      diagnostics.error(
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
// SAFE MESSAGE CONTENT
// =====================================

function getSafeMessageContent(
  message
){

  return String(
    message?.content || ""
  );

}



// =====================================
// FORMAT MESSAGE TIMESTAMP
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

  catch(error){

    return "";

  }

}



// =====================================
// CREATE MESSAGE CONTENT
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

    const markdownRenderer =
    getChatMessageService(
      "markdown-renderer"
    );

    if(
      markdownRenderer &&
      typeof markdownRenderer
      .render ===
      "function"
    ){

      markdownRenderer.render(
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

    safeMessageLogError(
      "MESSAGE CONTENT ERROR:",
      error
    );

    content.textContent =
    messageContent;

  }

  return content;

}



// =====================================
// MESSAGE META
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



  // ===================================
  // CONTENT
  // ===================================

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



  // ===================================
  // META
  // ===================================

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

  if(
    !element.isConnected
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

    const markdownRenderer =
    getChatMessageService(
      "markdown-renderer"
    );

    if(
      markdownRenderer &&
      typeof markdownRenderer
      .render ===
      "function"
    ){

      markdownRenderer.render(
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

    safeMessageLogError(
      "MESSAGE UPDATE ERROR:",
      error
    );

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

    if(
      typeof element.remove ===
      "function"
    ){

      element.remove();

      return true;

    }

    if(
      element.parentNode
    ){

      element.parentNode
      .removeChild(
        element
      );

      return true;

    }

  }

  catch(error){

    safeMessageLogError(
      "REMOVE MESSAGE ERROR:",
      error
    );

  }

  return false;

}



// =====================================
// MESSAGE DIAGNOSTICS
// =====================================

function getChatMessageElementDiagnostics(){

  return Object.freeze({

    rendererAvailable:

      !!getChatMessageService(
        "markdown-renderer"
      ),

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
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "ChatMessageElements",

    {

      value:
      ChatMessageElements,

      writable:false,

      configurable:false

    }

  );

}

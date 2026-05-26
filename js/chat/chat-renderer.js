// =====================================
// RIGO AI
// CHAT RENDERER
// ENTERPRISE CHAT RENDER SYSTEM
// FINAL STABLE EDITION
// =====================================



// =====================================
// STREAMING MESSAGE STATE
// =====================================

const streamingMessageState =
Object.seal({

  activeMessageId:null,

  activeElement:null,

  activeContentElement:null,

  accumulatedContent:""

});



// =====================================
// SERVICE ACCESS
// =====================================

function getChatRendererService(
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

function safeRendererLogError(
  ...args
){

  try{

    const diagnostics =
    getChatRendererService(
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
// MARKDOWN RENDER
// =====================================

function renderMarkdownContent(
  element,
  content
){

  if(
    !element
  ){

    return false;

  }

  const safeContent =
  String(content || "");

  try{

    const markdownRenderer =
    getChatRendererService(
      "markdown-renderer"
    );

    if(
      markdownRenderer &&
      typeof markdownRenderer
      .render ===
      "function"
    ){

      markdownRenderer.render(
        element,
        safeContent
      );

    }

    else{

      element.textContent =
      safeContent;

    }

    return true;

  }

  catch(error){

    safeRendererLogError(
      "MARKDOWN RENDER ERROR:",
      error
    );

    element.textContent =
    safeContent;

    return false;

  }

}



// =====================================
// CREATE STREAM MESSAGE
// =====================================

function createStreamingMessageElement(){

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
    "message",
    "ai-message",
    "streaming-message"
  );

  const content =
  document.createElement(
    "div"
  );

  content.classList.add(
    "message-content"
  );

  wrapper.appendChild(
    content
  );

  return {

    wrapper,
    content

  };

}



// =====================================
// RESET STREAM MESSAGE
// =====================================

function resetStreamingMessageState(){

  streamingMessageState
  .activeMessageId =
  null;

  streamingMessageState
  .activeElement =
  null;

  streamingMessageState
  .activeContentElement =
  null;

  streamingMessageState
  .accumulatedContent =
  "";

  return true;

}



// =====================================
// SHOW TYPING
// =====================================

function showTypingIndicator(){

  const chatElements =
  window.ChatElements;

  if(
    !chatElements
  ){

    return false;

  }

  const chatContainer =
  chatElements.getContainer();

  if(!chatContainer){

    return false;

  }

  let typingIndicator =

    chatElements
    .getTypingIndicator();

  if(!typingIndicator){

    if(
      typeof createTypingIndicatorElement !==
      "function"
    ){

      return false;

    }

    typingIndicator =
    createTypingIndicatorElement();

    if(!typingIndicator){

      return false;

    }

    chatElements
    .setTypingIndicator(
      typingIndicator
    );

  }

  if(
    typeof removeTypingIndicator ===
    "function"
  ){

    removeTypingIndicator(
      false
    );

  }

  typingIndicator
  .textContent =

    typeof isRTLLayout ===
    "function"

    &&

    isRTLLayout()

    ?

    "RIGO AI يكتب..."

    :

    "RIGO AI is typing...";

  if(
    !typingIndicator
    .isConnected
  ){

    const appended =
    chatElements.append(
      typingIndicator
    );

    if(!appended){

      return false;

    }

  }

  if(
    typeof scrollToBottom ===
    "function"
  ){

    scrollToBottom();

  }

  return true;

}



// =====================================
// STREAM RENDER
// =====================================

function renderStreamingMessage(
  chunk
){

  if(
    typeof chunk !==
    "string"
  ){

    return false;

  }

  if(
    chunk.length <= 0
  ){

    return false;

  }

  const chatElements =
  window.ChatElements;

  if(
    !chatElements
  ){

    return false;

  }

  const chatContainer =
  chatElements.getContainer();

  if(!chatContainer){

    return false;

  }

  if(
    typeof removeTypingIndicator ===
    "function"
  ){

    removeTypingIndicator();

  }

  let messageElement =

    streamingMessageState
    .activeElement;

  let contentElement =

    streamingMessageState
    .activeContentElement;

  if(
    messageElement &&
    !messageElement.isConnected
  ){

    resetStreamingMessageState();

    messageElement =
    null;

    contentElement =
    null;

  }

  if(

    !messageElement

    ||

    !contentElement

  ){

    const created =
    createStreamingMessageElement();

    if(!created){

      return false;

    }

    messageElement =
    created.wrapper;

    contentElement =
    created.content;

    streamingMessageState
    .activeElement =
    messageElement;

    streamingMessageState
    .activeContentElement =
    contentElement;

    if(
      typeof createMessageId ===
      "function"
    ){

      streamingMessageState
      .activeMessageId =
      createMessageId();

    }

    else{

      streamingMessageState
      .activeMessageId =
      String(Date.now());

    }

    const appended =
    chatElements.append(
      messageElement
    );

    if(!appended){

      resetStreamingMessageState();

      return false;

    }

  }

  streamingMessageState
  .accumulatedContent +=
  chunk;

  renderMarkdownContent(

    contentElement,

    streamingMessageState
    .accumulatedContent

  );

  messageElement.dataset
  .streaming =
  "true";

  if(
    typeof scrollToBottom ===
    "function"
  ){

    scrollToBottom();

  }

  return true;

}



// =====================================
// COMPLETE STREAM MESSAGE
// =====================================

function finalizeStreamingMessage(){

  const element =

    streamingMessageState
    .activeElement;

  const contentElement =

    streamingMessageState
    .activeContentElement;

  if(
    !element ||
    !contentElement
  ){

    return false;

  }

  const finalContent =

    String(

      streamingMessageState
      .accumulatedContent || ""

    )
    .trim();

  if(!finalContent){

    abortStreamingMessage();

    return false;

  }

  element.classList.remove(
    "streaming-message"
  );

  element.dataset
  .streaming =
  "false";

  renderMarkdownContent(
    contentElement,
    finalContent
  );

  const finalMessage =

    typeof freezeChatObject ===
    "function"

    ?

    freezeChatObject({

      id:

        streamingMessageState
        .activeMessageId

        ||

        String(Date.now()),

      role:"assistant",

      content:
      finalContent,

      timestamp:
      Date.now(),

      metadata:{

        streaming:true,

        completed:true

      }

    })

    :

    {

      id:
      String(Date.now()),

      role:"assistant",

      content:
      finalContent,

      timestamp:
      Date.now()

    };

  if(

    typeof currentChat !==
    "undefined"

    &&

    currentChat

    &&

    Array.isArray(
      currentChat.messages
    )

  ){

    currentChat.messages
    .push(
      finalMessage
    );

    currentChat.updatedAt =
    Date.now();

    currentChat.lastMessageAt =
    finalMessage.timestamp;

    currentChat.messageCount =
    currentChat.messages.length;

  }

  if(
    typeof debouncedSaveCurrentChat ===
    "function"
  ){

    debouncedSaveCurrentChat();

  }

  resetStreamingMessageState();

  return true;

}



// =====================================
// ABORT STREAM MESSAGE
// =====================================

function abortStreamingMessage(){

  const element =

    streamingMessageState
    .activeElement;

  if(element){

    element.classList.remove(
      "streaming-message"
    );

    element.classList.add(
      "stream-aborted"
    );

    element.dataset
    .streaming =
    "aborted";
  }

  resetStreamingMessageState();

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getChatRendererDiagnostics(){

  return Object.freeze({

    activeMessageId:

      streamingMessageState
      .activeMessageId,

    streaming:

      !!streamingMessageState
      .activeElement,

    accumulatedLength:

      streamingMessageState
      .accumulatedContent
      .length

  });

}



// =====================================
// PUBLIC API
// =====================================

const ChatRenderer =
Object.freeze({

  showTyping:
  showTypingIndicator,

  renderStream:
  renderStreamingMessage,

  finalizeStream:
  finalizeStreamingMessage,

  abortStream:
  abortStreamingMessage,

  resetStream:
  resetStreamingMessageState,

  diagnostics:
  getChatRendererDiagnostics,

  snapshot:
  getChatRendererDiagnostics

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

    "ChatRenderer",

    {

      value:
      ChatRenderer,

      writable:false,

      configurable:false

    }

  );

}

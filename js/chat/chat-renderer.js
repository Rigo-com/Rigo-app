// =====================================
// RIGO AI
// CHAT RENDERER
// ENTERPRISE CHAT RENDER SYSTEM
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
// CREATE STREAM MESSAGE
// =====================================

function createStreamingMessageElement(){

  const wrapper =
  document.createElement(
    "div"
  );

  wrapper.classList.add(
    "message",
    "assistant-message",
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

  const chatContainer =
  ChatElements.getContainer();

  if(!chatContainer){

    return false;

  }

  let typingIndicator =

    ChatElements
    .getTypingIndicator();

  if(!typingIndicator){

    typingIndicator =
    createTypingIndicatorElement?.();

    if(!typingIndicator){

      return false;

    }

    ChatElements
    .setTypingIndicator(
      typingIndicator
    );

  }

  removeTypingIndicator?.(
    false
  );

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

    ChatElements.append(
      typingIndicator
    );

  }

  scrollToBottom?.();

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

  const chatContainer =
  ChatElements.getContainer();

  if(!chatContainer){

    return false;

  }

  removeTypingIndicator?.();

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

    streamingMessageState
    .activeMessageId =
    createMessageId();

    ChatElements.append(
      messageElement
    );

  }

  streamingMessageState
  .accumulatedContent +=
  chunk;

  const content =

    streamingMessageState
    .accumulatedContent;

  try{

    if(
      typeof ChatMarkdownRenderer !==
      "undefined"
    ){

      ChatMarkdownRenderer
      .render(
        contentElement,
        content
      );

    }

    else{

      contentElement
      .textContent =
      content;

    }

  }

  catch(error){

    safeLogError?.(
      "STREAM RENDER ERROR:",
      error
    );

    contentElement
    .textContent =
    content;

  }

  messageElement.dataset
  .streaming =
  "true";

  scrollToBottom?.();

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

  try{

    if(
      typeof ChatMarkdownRenderer !==
      "undefined"
    ){

      ChatMarkdownRenderer
      .render(
        contentElement,
        finalContent
      );

    }

  }

  catch(error){

    safeLogError?.(
      "FINAL STREAM RENDER ERROR:",
      error
    );

    contentElement
    .textContent =
    finalContent;

  }

  const finalMessage =
  freezeChatObject({

    id:

      streamingMessageState
      .activeMessageId

      ||

      createMessageId(),

    role:"assistant",

    content:
    finalContent,

    timestamp:
    Date.now(),

    metadata:{

      streaming:true,

      completed:true

    }

  });

  if(
    Array.isArray(
      currentChat?.messages
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

  debouncedSaveCurrentChat?.();

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

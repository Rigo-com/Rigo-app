// =====================================
// RIGO AI
// CHAT RENDERER
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

  element.textContent =
  String(
    content || ""
  );

  return true;

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

  if(
    typeof ChatElements ===
    "undefined"
  ){
    return false;
  }

  const container =
  ChatElements
  .getContainer();

  if(
    !container
  ){
    return false;
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
    !messageElement ||
    !contentElement
  ){

    const created =
    createStreamingMessageElement();

    if(
      !created
    ){
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
    String(
      Date.now()
    );

    const appended =
    ChatElements
    .append(
      messageElement
    );

    if(
      !appended
    ){

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

  return true;

}



// =====================================
// FINALIZE STREAM
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

  if(
    !finalContent
  ){

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

  resetStreamingMessageState();

  return true;

}



// =====================================
// ABORT STREAM
// =====================================

function abortStreamingMessage(){

  const element =

    streamingMessageState
    .activeElement;

  if(
    element
  ){

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
// EXPORTS
// =====================================

export {

  ChatRenderer,

  renderStreamingMessage,

  finalizeStreamingMessage,

  abortStreamingMessage,

  resetStreamingMessageState,

  getChatRendererDiagnostics

};

export default
ChatRenderer;

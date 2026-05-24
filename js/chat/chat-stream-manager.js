// =====================================
// RIGO AI
// CHAT STREAM MANAGER
// ENTERPRISE STREAMING ENGINE
// =====================================



// =====================================
// CREATE STREAM ID
// =====================================

function createStreamId(){

  return [

    "stream",

    Date.now(),

    Math.random()
    .toString(36)
    .slice(2,10)

  ].join("_");

}



// =====================================
// INITIALIZE STREAM
// =====================================

function initializeChatStream(){

  if(
    chatStreamState
    .initialized
  ){

    return true;

  }

  chatStreamState
  .initialized =
  true;

  return true;

}



// =====================================
// START STREAM
// =====================================

function startChatStream(
  messageId
){

  if(
    !messageId
  ){

    return false;

  }

  if(
    chatStreamState.active
  ){

    abortChatStream();

  }

  const streamId =
  createStreamId();

  chatStreamState
  .active =
  true;

  chatStreamState
  .paused =
  false;

  chatStreamState
  .aborted =
  false;

  chatStreamState
  .flushing =
  false;

  chatStreamState
  .rendering =
  false;

  chatStreamState
  .status =
  CHAT_STREAM_STATUS
  .STARTING;

  chatStreamState
  .activeStreamId =
  streamId;

  chatStreamState
  .activeMessageId =
  messageId;

  chatStreamState
  .activeController =
  new AbortController();

  chatStreamState
  .currentChunk =
  "";

  chatStreamState
  .partialContent =
  "";

  chatStreamState
  .bufferedContent =
  "";

  chatStreamState
  .streamStartAt =
  Date.now();

  chatStreamState
  .streamEndAt =
  null;

  chatStreamState
  .lastChunkAt =
  null;

  chatStreamState
  .lastFlushAt =
  null;

  chatStreamState
  .chunkQueue =
  [];

  chatStreamState
  .renderQueue =
  [];

  chatStreamState
  .chunkBuffer =
  [];

  chatStreamState
  .diagnostics
  .streams++;

  chatStreamState
  .status =
  CHAT_STREAM_STATUS
  .STREAMING;

  return streamId;

}



// =====================================
// PUSH CHUNK
// =====================================

function pushStreamChunk(
  chunk
){

  if(
    !chatStreamState.active
  ){

    return false;

  }

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

    chatStreamState
    .chunkQueue
    .length >=

    CHAT_STREAM_CONFIG
    .MAX_CHUNK_QUEUE

  ){

    chatStreamState
    .diagnostics
    .droppedChunks++;

    return false;

  }

  chatStreamState
  .currentChunk =
  chunk;

  chatStreamState
  .lastChunkAt =
  Date.now();

  chatStreamState
  .chunkQueue
  .push(
    chunk
  );

  chatStreamState
  .chunkBuffer
  .push(
    chunk
  );

  chatStreamState
  .bufferedContent +=
  chunk;

  chatStreamState
  .partialContent +=
  chunk;

  chatStreamState
  .diagnostics
  .chunks++;

  scheduleStreamFlush();

  return true;

}



// =====================================
// SCHEDULE FLUSH
// =====================================

function scheduleStreamFlush(){

  if(
    chatStreamState
    .flushing
  ){

    return false;

  }

  chatStreamState
  .flushing =
  true;

  if(
    chatStreamState
    .flushTimer
  ){

    clearTimeout(

      chatStreamState
      .flushTimer

    );

  }

  chatStreamState
  .flushTimer =
  setTimeout(() => {

    chatStreamState
    .flushTimer =
    null;

    flushStreamChunks();

  },

  CHAT_STREAM_CONFIG
  .FLUSH_INTERVAL);

  return true;

}



// =====================================
// FLUSH CHUNKS
// =====================================

function flushStreamChunks(){

  if(
    !chatStreamState.active
  ){

    chatStreamState
    .flushing =
    false;

    return false;

  }

  if(

    chatStreamState
    .chunkQueue
    .length <= 0

  ){

    chatStreamState
    .flushing =
    false;

    return false;

  }

  const chunks =

    chatStreamState
    .chunkQueue
    .splice(0);

  const combined =
  chunks.join("");

  chatStreamState
  .renderQueue
  .push(
    combined
  );

  chatStreamState
  .lastFlushAt =
  Date.now();

  chatStreamState
  .diagnostics
  .flushes++;

  processRenderQueue();

  chatStreamState
  .flushing =
  false;

  return true;

}



// =====================================
// PROCESS RENDER QUEUE
// =====================================

function processRenderQueue(){

  if(
    chatStreamState
    .rendering
  ){

    return false;

  }

  if(

    chatStreamState
    .renderQueue
    .length <= 0

  ){

    return false;

  }

  chatStreamState
  .rendering =
  true;

  const renderTask = () => {

    try{

      while(

        chatStreamState
        .renderQueue
        .length > 0

      ){

        if(
          !chatStreamState.active
          &&
          chatStreamState.status !==
          CHAT_STREAM_STATUS.COMPLETED
        ){

          break;

        }

        chatStreamState
        .renderQueue
        .shift();

        try{

          if(
            typeof renderStreamingMessage ===
            "function"
          ){

            renderStreamingMessage(

              chatStreamState
              .partialContent

            );

          }

        }

        catch(error){

          safeLogError?.(
            "STREAM RENDER TASK ERROR",
            error
          );

        }

        chatStreamState
        .diagnostics
        .renders++;

      }

    }

    finally{

      chatStreamState
      .rendering =
      false;

    }

  };

  if(

    typeof requestAnimationFrame ===
    "function"

  ){

    chatStreamState
    .flushFrame =
    requestAnimationFrame(
      renderTask
    );

  }

  else{

    renderTask();

  }

  return true;

}



// =====================================
// COMPLETE STREAM
// =====================================

function completeChatStream(){

  if(
    !chatStreamState.active
  ){

    return false;

  }

  flushStreamChunks();

  chatStreamState
  .status =
  CHAT_STREAM_STATUS
  .COMPLETED;

  chatStreamState
  .streamEndAt =
  Date.now();

  chatStreamState
  .partialContent =

    chatStreamState
    .partialContent
    .trim();

  chatStreamState
  .diagnostics
  .completed++;

  chatStreamState
  .streamHistory
  .push({

    id:

      chatStreamState
      .activeStreamId,

    messageId:

      chatStreamState
      .activeMessageId,

    startedAt:

      chatStreamState
      .streamStartAt,

    endedAt:

      chatStreamState
      .streamEndAt,

    chunks:

      chatStreamState
      .diagnostics
      .chunks

  });

  if(

    chatStreamState
    .streamHistory
    .length >

    CHAT_STREAM_CONFIG
    .MAX_STREAM_HISTORY

  ){

    chatStreamState
    .streamHistory
    .shift();

  }

  chatStreamState
  .active =
  false;

  chatStreamState
  .activeController =
  null;

  return true;

}



// =====================================
// ABORT STREAM
// =====================================

function abortChatStream(){

  const controller =

    chatStreamState
    .activeController;

  if(
    controller
  ){

    try{

      if(
        !controller.signal.aborted
      ){

        controller.abort();

      }

    }

    catch(error){

      safeLogError?.(
        "STREAM ABORT ERROR",
        error
      );

    }

  }

  chatStreamState
  .active =
  false;

  chatStreamState
  .aborted =
  true;

  chatStreamState
  .status =
  CHAT_STREAM_STATUS
  .ABORTED;

  chatStreamState
  .streamEndAt =
  Date.now();

  chatStreamState
  .chunkQueue =
  [];

  chatStreamState
  .renderQueue =
  [];

  chatStreamState
  .activeController =
  null;

  chatStreamState
  .diagnostics
  .aborted++;

  return true;

}



// =====================================
// FAIL STREAM
// =====================================

function failChatStream(
  error = null
){

  chatStreamState
  .active =
  false;

  chatStreamState
  .status =
  CHAT_STREAM_STATUS
  .FAILED;

  chatStreamState
  .streamEndAt =
  Date.now();

  chatStreamState
  .chunkQueue =
  [];

  chatStreamState
  .renderQueue =
  [];

  chatStreamState
  .activeController =
  null;

  chatStreamState
  .diagnostics
  .failed++;

  if(error){

    safeLogError?.(
      "STREAM FAILURE",
      error
    );

  }

  return true;

}



// =====================================
// DESTROY STREAM
// =====================================

function destroyChatStream(){

  abortChatStream();

  resetChatStreamState();

  return true;

}



// =====================================
// STREAM DIAGNOSTICS
// =====================================

function getStreamDiagnostics(){

  return getChatStreamStatus();

}



// =====================================
// PUBLIC API
// =====================================

const ChatStreamManager =
Object.freeze({

  initialize:
  initializeChatStream,

  start:
  startChatStream,

  push:
  pushStreamChunk,

  flush:
  flushStreamChunks,

  complete:
  completeChatStream,

  abort:
  abortChatStream,

  fail:
  failChatStream,

  destroy:
  destroyChatStream,

  status:
  getChatStreamStatus,

  diagnostics:
  getStreamDiagnostics

});

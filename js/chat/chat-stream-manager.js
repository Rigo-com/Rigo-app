// =====================================
// RIGO AI
// CHAT STREAM MANAGER
// ENTERPRISE STREAMING ENGINE
// FINAL STABLE EDITION
// =====================================



import {
  createStreamId
}
from "./chat-utils.js";

import {
  CHAT_STREAM_STATUS,
  CHAT_STREAM_CONFIG,
  chatStreamState,
  clearStreamTimers,
  trimStreamHistory,
  resetChatStreamState,
  getChatStreamStatus
}
from "./chat-stream-state.js";



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

function startChatStreamTimers(
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

  resetStreamingMessageState?.();

  clearStreamTimers();

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
  .locked =
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
  String(messageId);

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
    chatStreamState.aborted
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

  const normalizedChunk =
  String(chunk);

  chatStreamState
  .currentChunk =
  normalizedChunk;

  chatStreamState
  .lastChunkAt =
  Date.now();

  chatStreamState
  .chunkQueue
  .push(
    normalizedChunk
  );

  chatStreamState
  .chunkBuffer
  .push(
    normalizedChunk
  );

  chatStreamState
  .bufferedContent +=
  normalizedChunk;

  chatStreamState
  .partialContent +=
  normalizedChunk;

  if(

    chatStreamState
    .bufferedContent
    .length >

    CHAT_STREAM_CONFIG
    .MAX_BUFFER_SIZE

  ){

    chatStreamState
    .bufferedContent =

      chatStreamState
      .bufferedContent
      .slice(

        -CHAT_STREAM_CONFIG
        .MAX_BUFFER_SIZE

      );

  }

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
    !chatStreamState.active
  ){

    return false;

  }

  if(
    chatStreamState
    .flushing
  ){

    return false;

  }

  chatStreamState
  .flushing =
  true;

  clearStreamTimers();

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

    !Array.isArray(
      chatStreamState
      .chunkQueue
    )

    ||

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

  if(
    combined.length <= 0
  ){

    chatStreamState
    .flushing =
    false;

    return false;

  }

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

    !Array.isArray(
      chatStreamState
      .renderQueue
    )

    ||

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

        const chunk =

          chatStreamState
          .renderQueue
          .shift();

        if(
          typeof chunk !==
          "string"
        ){

          continue;

        }

        try{

          if(
            typeof renderStreamingMessage ===
            "function"
          ){

            renderStreamingMessage(
              chunk
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

      chatStreamState
      .flushFrame =
      null;

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

  finalizeStreamingMessage?.();

  chatStreamState
  .status =
  CHAT_STREAM_STATUS
  .COMPLETED;

  chatStreamState
  .streamEndAt =
  Date.now();

  chatStreamState
  .partialContent =

    String(

      chatStreamState
      .partialContent || ""

    )
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

  trimStreamHistory();

  clearStreamTimers();

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

  clearStreamTimers();

  abortStreamingMessage?.();

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
  .chunkBuffer =
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

  clearStreamTimers();

  abortStreamingMessage?.();

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
  .chunkBuffer =
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
  getStreamDiagnostics,

  snapshot:
  getChatStreamStatus

});



// =====================================
// EXPORTS
// =====================================

export {

  ChatStreamManager,

  initializeChatStream,

  startChatStream,

  pushStreamChunk,

  flushStreamChunks,

  completeChatStream,

  abortChatStream,

  failChatStream,

  destroyChatStream,

  getStreamDiagnostics

};

export default
ChatStreamManager;

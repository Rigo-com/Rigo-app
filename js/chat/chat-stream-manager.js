// =====================================
// RIGO AI
// CHAT STREAM MANAGER
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
    chatStreamState.initialized
  ){
    return true;
  }

  chatStreamState.initialized =
  true;

  chatStreamState.status =
  CHAT_STREAM_STATUS.IDLE;

  return true;

}



// =====================================
// START STREAM
// =====================================

function startChatStream(
  messageId
){

  if(
    messageId === null ||
    messageId === undefined
  ){
    return false;
  }

  if(
    chatStreamState.active
  ){
    abortChatStream();
  }

  clearStreamTimers();

  const streamId =
  createStreamId();

  chatStreamState.active =
  true;

  chatStreamState.paused =
  false;

  chatStreamState.aborted =
  false;

  chatStreamState.flushing =
  false;

  chatStreamState.rendering =
  false;

  chatStreamState.locked =
  false;

  chatStreamState.status =
  CHAT_STREAM_STATUS.STREAMING;

  chatStreamState.activeStreamId =
  streamId;

  chatStreamState.activeMessageId =
  String(messageId);

  chatStreamState.activeController =
  new AbortController();

  chatStreamState.currentChunk =
  "";

  chatStreamState.partialContent =
  "";

  chatStreamState.bufferedContent =
  "";

  chatStreamState.streamStartAt =
  Date.now();

  chatStreamState.streamEndAt =
  null;

  chatStreamState.lastChunkAt =
  null;

  chatStreamState.lastFlushAt =
  null;

  chatStreamState.chunkQueue =
  [];

  chatStreamState.renderQueue =
  [];

  chatStreamState.chunkBuffer =
  [];

  chatStreamState.diagnostics.streams++;

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
    chatStreamState.chunkQueue.length >=
    CHAT_STREAM_CONFIG.MAX_CHUNK_QUEUE
  ){

    chatStreamState
    .diagnostics
    .droppedChunks++;

    return false;
  }

  chatStreamState.currentChunk =
  chunk;

  chatStreamState.lastChunkAt =
  Date.now();

  chatStreamState.chunkQueue.push(
    chunk
  );

  chatStreamState.chunkBuffer.push(
    chunk
  );

  chatStreamState.partialContent +=
  chunk;

  chatStreamState.bufferedContent +=
  chunk;

  if(
    chatStreamState.bufferedContent
    .length >
    CHAT_STREAM_CONFIG
    .MAX_BUFFER_SIZE
  ){

    chatStreamState.bufferedContent =

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

  return true;

}



// =====================================
// FLUSH STREAM
// =====================================

function flushStreamChunks(){

  if(
    !chatStreamState.active
  ){
    return false;
  }

  if(
    chatStreamState.chunkQueue
    .length <= 0
  ){
    return false;
  }

  const chunks =

    chatStreamState
    .chunkQueue
    .splice(0);

  chatStreamState.lastFlushAt =
  Date.now();

  chatStreamState
  .diagnostics
  .flushes++;

  return chunks.join("");

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

  chatStreamState.status =
  CHAT_STREAM_STATUS.COMPLETED;

  chatStreamState.streamEndAt =
  Date.now();

  chatStreamState.partialContent =

    String(
      chatStreamState.partialContent
      || ""
    ).trim();

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

  chatStreamState.active =
  false;

  chatStreamState.activeController =
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

    catch(error){}

  }

  clearStreamTimers();

  chatStreamState.active =
  false;

  chatStreamState.aborted =
  true;

  chatStreamState.status =
  CHAT_STREAM_STATUS.ABORTED;

  chatStreamState.streamEndAt =
  Date.now();

  chatStreamState.chunkQueue =
  [];

  chatStreamState.chunkBuffer =
  [];

  chatStreamState.renderQueue =
  [];

  chatStreamState.activeController =
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

  chatStreamState.active =
  false;

  chatStreamState.status =
  CHAT_STREAM_STATUS.FAILED;

  chatStreamState.streamEndAt =
  Date.now();

  chatStreamState.chunkQueue =
  [];

  chatStreamState.chunkBuffer =
  [];

  chatStreamState.renderQueue =
  [];

  chatStreamState.activeController =
  null;

  chatStreamState
  .diagnostics
  .failed++;

  void error;

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

// =====================================
// RIGO AI
// CHAT STREAM SERVICE
// =====================================

import {

  CHAT_STREAM_STATUS,

  getStreamStatus,

  getActiveStreamId,
  getActiveMessageId,

  getPartialContent,
  getBufferedContent,

  isStreamActive,
  isStreamPaused,

  setStreamInitialized,
  setStreamActive,
  setStreamPaused,
  setStreamAborted,
  setStreamRendering,

  setStreamStatus,

  setActiveStreamId,
  setActiveMessageId,

  setCurrentChunk,
  setPartialContent,
  setBufferedContent,

  setStreamStartAt,
  setStreamEndAt,

  setLastChunkAt,
  setLastFlushAt,

  addStreamHistory,

  incrementStreams,
  incrementCompleted,
  incrementAborted,
  incrementFailed,
  incrementChunks,
  incrementFlushes,

  getChatStreamSnapshot,

  resetChatStreamState

}
from "../chat-state/chat-stream-state.js";

import {
  CHAT_EVENTS
}
from "../chat-config.js";

import {
  emit
}
from "../chat-events/chat-events.js";



// =====================================
// SERVICE STATE
// =====================================

const serviceState =
Object.seal({

  initialized:false

});



// =====================================
// STREAM RUNTIME
// =====================================

const streamRuntime =
Object.seal({

  controller:null,

  flushTimer:null,

  chunkBuffer:[],

  flushCount:0,

  chunkCount:0

});



let streamCounter = 0;



// =====================================
// HELPERS
// =====================================

function createStreamId(){

  streamCounter++;

  return (
    "stream_" +
    Date.now() +
    "_" +
    streamCounter
  );

}



function clearFlushTimer(){

  if(
    streamRuntime
    .flushTimer
  ){

    clearTimeout(

      streamRuntime
      .flushTimer

    );

  }

  streamRuntime
  .flushTimer =
  null;

}



function resetRuntime(){

  clearFlushTimer();

  streamRuntime
  .controller =
  null;

  streamRuntime
  .chunkBuffer =
  [];

  streamRuntime
  .flushCount =
  0;

  streamRuntime
  .chunkCount =
  0;

}



// =====================================
// INITIALIZE
// =====================================

function initialize(){

  if(
    serviceState.initialized
  ){
    return true;
  }

  setStreamInitialized(
    true
  );

  serviceState.initialized =
  true;

  return true;

}



// =====================================
// DESTROY
// =====================================

function destroy(){

  abort();

  reset();

  serviceState.initialized =
  false;

  return true;

}



// =====================================
// RESET
// =====================================

function reset(){

  streamCounter = 0;

  resetRuntime();

  resetChatStreamState();

  return true;

}



// =====================================
// START STREAM
// =====================================

function start(
  messageId
){

  if(
    !messageId
  ){
    return null;
  }

  if(
    isStreamActive()
  ){
    abort();
  }

  const streamId =
  createStreamId();

  resetRuntime();

  streamRuntime
  .controller =
  new AbortController();

  setStreamActive(
    true
  );

  setStreamPaused(
    false
  );

  setStreamAborted(
    false
  );

  setStreamStatus(
    CHAT_STREAM_STATUS
    .STREAMING
  );

  setActiveStreamId(
    streamId
  );

  setActiveMessageId(
    messageId
  );

  setCurrentChunk(
    ""
  );

  setPartialContent(
    ""
  );

  setBufferedContent(
    ""
  );

  setStreamStartAt(
    Date.now()
  );

  setStreamEndAt(
    null
  );

  incrementStreams();

  emit(

    CHAT_EVENTS
    .STREAM_STARTED,

    {

      streamId,

      messageId

    }

  );

  return streamId;

}



// =====================================
// PUSH CHUNK
// =====================================

function pushChunk(
  chunk
){

  if(
    !isStreamActive()
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

  streamRuntime
  .chunkBuffer
  .push(
    chunk
  );

  streamRuntime
  .chunkCount++;

  incrementChunks();

  setCurrentChunk(
    chunk
  );

  setLastChunkAt(
    Date.now()
  );

  return true;

}



// =====================================
// FLUSH
// =====================================

function flush(){

  if(
    !isStreamActive()
  ){
    return "";
  }

  if(
    streamRuntime
    .chunkBuffer
    .length <= 0
  ){
    return "";
  }

  const chunk =

    streamRuntime
    .chunkBuffer
    .join("");

  streamRuntime
  .chunkBuffer =
  [];

  streamRuntime
  .flushCount++;

  incrementFlushes();

  setLastFlushAt(
    Date.now()
  );

  const partial =

    getPartialContent()
    + chunk;

  const buffered =

    getBufferedContent()
    + chunk;

  setPartialContent(
    partial
  );

  setBufferedContent(
    buffered
  );

  emit(

    CHAT_EVENTS
    .STREAM_UPDATED,

    {

      streamId:
      getActiveStreamId(),

      messageId:
      getActiveMessageId(),

      content:
      partial

    }

  );

  return chunk;

}



// =====================================
// COMPLETE
// =====================================

function complete(){

  if(
    !isStreamActive()
  ){
    return false;
  }

  flush();

  const record = {

    streamId:
    getActiveStreamId(),

    messageId:
    getActiveMessageId(),

    startedAt:
    getChatStreamSnapshot()
    .streamStartAt,

    endedAt:
    Date.now(),

    chunks:
    streamRuntime
    .chunkCount,

    flushes:
    streamRuntime
    .flushCount

  };

  addStreamHistory(
    record
  );

  setStreamEndAt(
    record.endedAt
  );

  setStreamStatus(
    CHAT_STREAM_STATUS
    .COMPLETED
  );

  setStreamActive(
    false
  );

  incrementCompleted();

  emit(

    CHAT_EVENTS
    .STREAM_COMPLETED,

    structuredClone(
      record
    )

  );

  resetRuntime();

  return true;

}



// =====================================
// ABORT
// =====================================

function abort(){

  if(
    !getActiveStreamId()
  ){
    return false;
  }

  const controller =
  streamRuntime
  .controller;

  if(
    controller
  ){

    try{

      controller.abort();

    }

    catch(error){}

  }

  setStreamAborted(
    true
  );

  setStreamActive(
    false
  );

  setStreamStatus(
    CHAT_STREAM_STATUS
    .ABORTED
  );

  setStreamEndAt(
    Date.now()
  );

  incrementAborted();

  emit(

    CHAT_EVENTS
    .STREAM_ABORTED,

    {

      streamId:
      getActiveStreamId(),

      messageId:
      getActiveMessageId()

    }

  );

  resetRuntime();

  return true;

}



// =====================================
// FAIL
// =====================================

function fail(
  error = null
){

  setStreamActive(
    false
  );

  setStreamStatus(
    CHAT_STREAM_STATUS
    .FAILED
  );

  setStreamEndAt(
    Date.now()
  );

  incrementFailed();

  emit(

    CHAT_EVENTS
    .STREAM_FAILED,

    {

      streamId:
      getActiveStreamId(),

      messageId:
      getActiveMessageId(),

      error

    }

  );

  resetRuntime();

  return true;

}



// =====================================
// STATUS
// =====================================

function getStatus(){

  return Object.freeze({

    initialized:
    serviceState
    .initialized,

    active:
    isStreamActive(),

    paused:
    isStreamPaused(),

    status:
    getStreamStatus(),

    streamId:
    getActiveStreamId(),

    messageId:
    getActiveMessageId()

  });

}



// =====================================
// SNAPSHOT
// =====================================

function getSnapshot(){

  return getChatStreamSnapshot();

}



// =====================================
// PUBLIC API
// =====================================

const ChatStreamService =
Object.freeze({

  initialize,

  destroy,

  reset,

  status:
  getStatus,

  snapshot:
  getSnapshot,

  start,

  pushChunk,

  flush,

  complete,

  abort,

  fail

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  destroy,

  reset,

  start,

  pushChunk,

  flush,

  complete,

  abort,

  fail,

  getStatus,

  getSnapshot,

  ChatStreamService

};

export default
ChatStreamService;

// =====================================
// RIGO AI
// CHAT STREAM STATE
// FOUNDATION STATE LAYER
// =====================================

import {
  CHAT_LIMITS
}
from "../chat-config.js";



// =====================================
// STREAM STATUS
// =====================================

const CHAT_STREAM_STATUS =
Object.freeze({

  IDLE:
  "idle",

  STARTING:
  "starting",

  STREAMING:
  "streaming",

  COMPLETED:
  "completed",

  ABORTED:
  "aborted",

  FAILED:
  "failed"

});



// =====================================
// STREAM STATE
// =====================================

const chatStreamState =
Object.seal({

  initialized:false,

  active:false,

  paused:false,

  aborted:false,

  rendering:false,

  status:
  CHAT_STREAM_STATUS.IDLE,

  activeStreamId:null,

  activeMessageId:null,

  currentChunk:"",

  partialContent:"",

  bufferedContent:"",

  streamStartAt:null,

  streamEndAt:null,

  lastChunkAt:null,

  lastFlushAt:null,

  streamHistory:[],

  diagnostics:
  Object.seal({

    streams:0,

    completed:0,

    aborted:0,

    failed:0,

    chunks:0,

    flushes:0,

    renders:0,

    droppedChunks:0

  })

});



// =====================================
// HELPERS
// =====================================

function trimStreamHistory(){

  while(

    chatStreamState
    .streamHistory
    .length >

    CHAT_LIMITS
    .MAX_STREAM_HISTORY

  ){

    chatStreamState
    .streamHistory
    .shift();

  }

}



// =====================================
// STATE API
// =====================================

function setStreamInitialized(
  value
){

  chatStreamState.initialized =
  Boolean(value);

}



function setStreamActive(
  value
){

  chatStreamState.active =
  Boolean(value);

}



function setStreamPaused(
  value
){

  chatStreamState.paused =
  Boolean(value);

}



function setStreamAborted(
  value
){

  chatStreamState.aborted =
  Boolean(value);

}



function setStreamRendering(
  value
){

  chatStreamState.rendering =
  Boolean(value);

}



function setStreamStatus(
  status
){

  chatStreamState.status =
  status;

}



function setActiveStreamId(
  streamId
){

  chatStreamState.activeStreamId =
  streamId ?? null;

}



function setActiveMessageId(
  messageId
){

  chatStreamState.activeMessageId =
  messageId ?? null;

}



function setCurrentChunk(
  chunk
){

  chatStreamState.currentChunk =
  String(
    chunk || ""
  );

}



function setPartialContent(
  content
){

  chatStreamState.partialContent =
  String(
    content || ""
  );

}



function setBufferedContent(
  content
){

  chatStreamState.bufferedContent =
  String(
    content || ""
  );

}



function setStreamStartAt(
  timestamp
){

  chatStreamState.streamStartAt =
  timestamp ?? null;

}



function setStreamEndAt(
  timestamp
){

  chatStreamState.streamEndAt =
  timestamp ?? null;

}



function setLastChunkAt(
  timestamp
){

  chatStreamState.lastChunkAt =
  timestamp ?? null;

}



function setLastFlushAt(
  timestamp
){

  chatStreamState.lastFlushAt =
  timestamp ?? null;

}



// =====================================
// HISTORY API
// =====================================

function addStreamHistory(
  record
){

  if(
    !record
  ){
    return false;
  }

  chatStreamState
  .streamHistory
  .push(
    record
  );

  trimStreamHistory();

  return true;

}



// =====================================
// DIAGNOSTICS API
// =====================================

function incrementStreams(){

  chatStreamState
  .diagnostics
  .streams++;

}



function incrementCompleted(){

  chatStreamState
  .diagnostics
  .completed++;

}



function incrementAborted(){

  chatStreamState
  .diagnostics
  .aborted++;

}



function incrementFailed(){

  chatStreamState
  .diagnostics
  .failed++;

}



function incrementChunks(){

  chatStreamState
  .diagnostics
  .chunks++;

}



function incrementFlushes(){

  chatStreamState
  .diagnostics
  .flushes++;

}



function incrementRenders(){

  chatStreamState
  .diagnostics
  .renders++;

}



function incrementDroppedChunks(){

  chatStreamState
  .diagnostics
  .droppedChunks++;

}



// =====================================
// SNAPSHOT
// =====================================

function getChatStreamSnapshot(){

  trimStreamHistory();

  return Object.freeze(

    structuredClone(
      chatStreamState
    )

  );

}



// =====================================
// RESET DIAGNOSTICS
// =====================================

function resetStreamDiagnostics(){

  chatStreamState
  .diagnostics
  .streams = 0;

  chatStreamState
  .diagnostics
  .completed = 0;

  chatStreamState
  .diagnostics
  .aborted = 0;

  chatStreamState
  .diagnostics
  .failed = 0;

  chatStreamState
  .diagnostics
  .chunks = 0;

  chatStreamState
  .diagnostics
  .flushes = 0;

  chatStreamState
  .diagnostics
  .renders = 0;

  chatStreamState
  .diagnostics
  .droppedChunks = 0;

  return true;

}



// =====================================
// RESET
// =====================================

function resetChatStreamState(){

  chatStreamState.initialized = false;
  chatStreamState.active = false;
  chatStreamState.paused = false;
  chatStreamState.aborted = false;
  chatStreamState.rendering = false;

  chatStreamState.status =
  CHAT_STREAM_STATUS.IDLE;

  chatStreamState.activeStreamId = null;
  chatStreamState.activeMessageId = null;

  chatStreamState.currentChunk = "";
  chatStreamState.partialContent = "";
  chatStreamState.bufferedContent = "";

  chatStreamState.streamStartAt = null;
  chatStreamState.streamEndAt = null;

  chatStreamState.lastChunkAt = null;
  chatStreamState.lastFlushAt = null;

  chatStreamState.streamHistory = [];

  resetStreamDiagnostics();

  return true;

}



// =====================================
// READ API
// =====================================

function getStreamStatus(){

  return chatStreamState
  .status;

}



function getActiveStreamId(){

  return chatStreamState
  .activeStreamId;

}



function getActiveMessageId(){

  return chatStreamState
  .activeMessageId;

}



function getCurrentChunk(){

  return chatStreamState
  .currentChunk;

}



function getPartialContent(){

  return chatStreamState
  .partialContent;

}



function getBufferedContent(){

  return chatStreamState
  .bufferedContent;

}



function getStreamHistory(){

  return structuredClone(

    chatStreamState
    .streamHistory

  );

}

function isStreamActive(){

  return (

    chatStreamState.active ===
    true

    &&

    chatStreamState.status ===
    CHAT_STREAM_STATUS
    .STREAMING

  );

}


function isStreamPaused(){

  return (

    chatStreamState
    .paused ===
    true

  );

}



// =====================================
// PUBLIC API
// =====================================

const ChatStreamState =
Object.freeze({

  getStreamStatus,

  getActiveStreamId,
  getActiveMessageId,

  getCurrentChunk,

  getPartialContent,
  getBufferedContent,

  getStreamHistory,

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
  incrementRenders,
  incrementDroppedChunks,

  snapshot:
  getChatStreamSnapshot,

  reset:
  resetChatStreamState,

  resetDiagnostics:
  resetStreamDiagnostics

});



// =====================================
// EXPORTS
// =====================================

export {

  CHAT_STREAM_STATUS,

  getStreamStatus,

  getActiveStreamId,
  getActiveMessageId,

  getCurrentChunk,

  getPartialContent,
  getBufferedContent,

  getStreamHistory,

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
  incrementRenders,
  incrementDroppedChunks,

  getChatStreamSnapshot,

  resetChatStreamState,
  resetStreamDiagnostics,

  ChatStreamState

};

export default
ChatStreamState;

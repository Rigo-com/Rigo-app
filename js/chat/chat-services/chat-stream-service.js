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
  setStreamStatus,
  setActiveStreamId,
  setActiveMessageId,
  setCurrentChunk,
  setPartialContent,
  setBufferedContent,
  getStreamStartAt,
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
  incrementDroppedChunks,
  getChatStreamSnapshot,
  resetChatStreamState
}
from "../chat-state/chat-stream-state.js";

import {
  CHAT_EVENTS,
  CHAT_LIMITS,
  CHAT_TIMERS
}
from "../chat-config.js";

import { emit }
from "../chat-events/chat-events.js";

const serviceState = Object.seal({ initialized:false });

const streamRuntime = Object.seal({
  controller:null,
  timeoutTimer:null,
  chunkBuffer:[],
  bufferedLength:0,
  flushCount:0,
  chunkCount:0
});

let streamCounter = 0;

function createStreamId(){
  streamCounter++;
  return "stream_" + Date.now() + "_" + streamCounter;
}

function clearTimeoutTimer(){
  if(streamRuntime.timeoutTimer) clearTimeout(streamRuntime.timeoutTimer);
  streamRuntime.timeoutTimer = null;
}

function armTimeout(){
  clearTimeoutTimer();
  streamRuntime.timeoutTimer = setTimeout(() => {
    if(isStreamActive()) fail("CHAT_STREAM_TIMEOUT");
  },CHAT_TIMERS.STREAM_TIMEOUT);
}

function resetRuntime(){
  clearTimeoutTimer();
  streamRuntime.controller = null;
  streamRuntime.chunkBuffer = [];
  streamRuntime.bufferedLength = 0;
  streamRuntime.flushCount = 0;
  streamRuntime.chunkCount = 0;
}

function initialize(){
  if(serviceState.initialized) return true;
  setStreamInitialized(true);
  serviceState.initialized = true;
  return true;
}

function destroy(){
  if(getActiveStreamId()) abort();
  reset();
  serviceState.initialized = false;
  return true;
}

function reset(){
  streamCounter = 0;
  resetRuntime();
  resetChatStreamState();
  return true;
}

function start(messageId){
  if(!messageId) return null;
  if(isStreamActive()) abort();

  const streamId = createStreamId();
  resetRuntime();
  streamRuntime.controller = new AbortController();

  setStreamActive(true);
  setStreamPaused(false);
  setStreamAborted(false);
  setStreamStatus(CHAT_STREAM_STATUS.STREAMING);
  setActiveStreamId(streamId);
  setActiveMessageId(messageId);
  setCurrentChunk("");
  setPartialContent("");
  setBufferedContent("");
  setStreamStartAt(Date.now());
  setStreamEndAt(null);
  incrementStreams();
  armTimeout();

  emit(CHAT_EVENTS.STREAM_STARTED,{streamId,messageId});
  return streamId;
}

function pushChunk(chunk){
  if(!isStreamActive() || typeof chunk !== "string" || chunk.length <= 0) return false;

  const projectedBuffer = streamRuntime.bufferedLength + chunk.length;
  if(projectedBuffer > CHAT_LIMITS.MAX_STREAM_BUFFER_SIZE){
    incrementDroppedChunks();
    return false;
  }

  streamRuntime.chunkBuffer.push(chunk);
  streamRuntime.bufferedLength = projectedBuffer;
  streamRuntime.chunkCount++;
  incrementChunks();
  setCurrentChunk(chunk);
  setLastChunkAt(Date.now());
  armTimeout();
  return true;
}

function flush(){
  if(!isStreamActive()) return "";
  if(streamRuntime.chunkBuffer.length <= 0) return "";

  const chunk = streamRuntime.chunkBuffer.join("");
  streamRuntime.chunkBuffer = [];
  streamRuntime.bufferedLength = 0;
  streamRuntime.flushCount++;
  incrementFlushes();
  setLastFlushAt(Date.now());

  const partial = getPartialContent() + chunk;
  const buffered = getBufferedContent() + chunk;
  setPartialContent(partial);
  setBufferedContent(buffered);

  emit(CHAT_EVENTS.STREAM_UPDATED,{
    streamId:getActiveStreamId(),
    messageId:getActiveMessageId(),
    content:partial
  });

  armTimeout();
  return chunk;
}

function complete(){
  if(!isStreamActive()) return false;
  flush();
  clearTimeoutTimer();

  const record = {
    streamId:getActiveStreamId(),
    messageId:getActiveMessageId(),
    startedAt:getStreamStartAt(),
    endedAt:Date.now(),
    chunks:streamRuntime.chunkCount,
    flushes:streamRuntime.flushCount
  };

  addStreamHistory(record);
  setStreamEndAt(record.endedAt);
  setStreamStatus(CHAT_STREAM_STATUS.COMPLETED);
  setStreamActive(false);
  incrementCompleted();
  emit(CHAT_EVENTS.STREAM_COMPLETED,structuredClone(record));
  resetRuntime();
  return true;
}

function abort(){
  if(!getActiveStreamId()) return false;
  clearTimeoutTimer();
  try{ streamRuntime.controller?.abort(); }catch{}
  setStreamAborted(true);
  setStreamActive(false);
  setStreamStatus(CHAT_STREAM_STATUS.ABORTED);
  setStreamEndAt(Date.now());
  incrementAborted();
  emit(CHAT_EVENTS.STREAM_ABORTED,{
    streamId:getActiveStreamId(),
    messageId:getActiveMessageId()
  });
  resetRuntime();
  return true;
}

function fail(error = null){
  if(!getActiveStreamId()) return false;
  clearTimeoutTimer();
  setStreamActive(false);
  setStreamStatus(CHAT_STREAM_STATUS.FAILED);
  setStreamEndAt(Date.now());
  incrementFailed();
  emit(CHAT_EVENTS.STREAM_FAILED,{
    streamId:getActiveStreamId(),
    messageId:getActiveMessageId(),
    error
  });
  resetRuntime();
  return true;
}

function getStatus(){
  return Object.freeze({
    initialized:serviceState.initialized,
    active:isStreamActive(),
    paused:isStreamPaused(),
    status:getStreamStatus(),
    streamId:getActiveStreamId(),
    messageId:getActiveMessageId(),
    bufferedLength:streamRuntime.bufferedLength,
    bufferLimit:CHAT_LIMITS.MAX_STREAM_BUFFER_SIZE,
    timeout:CHAT_TIMERS.STREAM_TIMEOUT
  });
}

function getSnapshot(){
  return Object.freeze({
    ...getChatStreamSnapshot(),
    runtime:{
      bufferedLength:streamRuntime.bufferedLength,
      chunkCount:streamRuntime.chunkCount,
      flushCount:streamRuntime.flushCount
    },
    limits:{
      buffer:CHAT_LIMITS.MAX_STREAM_BUFFER_SIZE,
      history:CHAT_LIMITS.MAX_STREAM_HISTORY,
      timeout:CHAT_TIMERS.STREAM_TIMEOUT
    }
  });
}

const ChatStreamService = Object.freeze({
  initialize,
  destroy,
  reset,
  status:getStatus,
  snapshot:getSnapshot,
  start,
  pushChunk,
  flush,
  complete,
  abort,
  fail
});

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

export default ChatStreamService;

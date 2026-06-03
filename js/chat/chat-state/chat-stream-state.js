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

  diagnostics:Object.seal({

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
// INTERNAL HELPERS
// =====================================

function createSnapshot(){

  return structuredClone(
    chatStreamState
  );

}



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
// GET STATE
// =====================================

function getChatStreamState(){

  return chatStreamState;

}



// =====================================
// GET SNAPSHOT
// =====================================

function getChatStreamSnapshot(){

  trimStreamHistory();

  return Object.freeze(
    createSnapshot()
  );

}



// =====================================
// UPDATE STATE
// =====================================

function updateChatStreamState(
  updates = {}
){

  if(
    !updates ||
    typeof updates !==
    "object"
  ){
    return false;
  }

  Object.assign(
    chatStreamState,
    updates
  );

  return true;

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
// RESET STREAM STATE
// =====================================

function resetChatStreamState(){

  chatStreamState
  .initialized =
  false;

  chatStreamState
  .active =
  false;

  chatStreamState
  .paused =
  false;

  chatStreamState
  .aborted =
  false;

  chatStreamState
  .rendering =
  false;

  chatStreamState
  .status =
  CHAT_STREAM_STATUS
  .IDLE;

  chatStreamState
  .activeStreamId =
  null;

  chatStreamState
  .activeMessageId =
  null;

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
  null;

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
  .streamHistory =
  [];

  resetStreamDiagnostics();

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const ChatStreamState =
Object.freeze({

  get:
  getChatStreamState,

  snapshot:
  getChatStreamSnapshot,

  update:
  updateChatStreamState,

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

  chatStreamState,

  getChatStreamState,

  getChatStreamSnapshot,

  updateChatStreamState,

  resetChatStreamState,

  resetStreamDiagnostics,

  ChatStreamState

};

export default
ChatStreamState;

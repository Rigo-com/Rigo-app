// =====================================
// RIGO AI
// CHAT STREAM STATE
// ENTERPRISE STREAMING STATE SYSTEM
// =====================================



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
// STREAM CONFIG
// =====================================

const CHAT_STREAM_CONFIG =
Object.freeze({

  MAX_BUFFER_SIZE:
  5000,

  MAX_CHUNK_QUEUE:
  1000,

  MAX_STREAM_HISTORY:
  100,

  STREAM_TIMEOUT:
  60000,

  FLUSH_INTERVAL:
  16,

  ENABLE_BATCHING:true,

  ENABLE_PARTIAL_RENDER:true,

  ENABLE_STREAM_DIAGNOSTICS:true

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

  flushing:false,

  rendering:false,

  locked:false,

  status:
  CHAT_STREAM_STATUS
  .IDLE,

  activeStreamId:null,

  activeMessageId:null,

  activeController:null,

  currentChunk:"",

  partialContent:"",

  bufferedContent:"",

  streamStartAt:null,

  streamEndAt:null,

  lastChunkAt:null,

  lastFlushAt:null,

  flushTimer:null,

  flushFrame:null,

  chunkQueue:[],

  renderQueue:[],

  streamHistory:[],

  chunkBuffer:[],

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
// RESET STREAM DIAGNOSTICS
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
  .IDLE;

  chatStreamState
  .activeStreamId =
  null;

  chatStreamState
  .activeMessageId =
  null;

  chatStreamState
  .activeController =
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

  if(
    chatStreamState
    .flushTimer
  ){

    clearTimeout(

      chatStreamState
      .flushTimer

    );

  }

  if(

    typeof cancelAnimationFrame ===
    "function"

    &&

    chatStreamState
    .flushFrame

  ){

    cancelAnimationFrame(

      chatStreamState
      .flushFrame

    );

  }

  chatStreamState
  .flushTimer =
  null;

  chatStreamState
  .flushFrame =
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

  resetStreamDiagnostics();

  return true;

}



// =====================================
// STREAM READY
// =====================================

function isStreamReady(){

  return (

    chatStreamState
    .initialized ===
    true

    &&

    chatStreamState
    .locked !==
    true

  );

}



// =====================================
// STREAM ACTIVE
// =====================================

function isStreamActive(){

  return (

    chatStreamState
    .active ===
    true

    &&

    chatStreamState
    .status ===

    CHAT_STREAM_STATUS
    .STREAMING

  );

}



// =====================================
// STREAM STATUS SNAPSHOT
// =====================================

function getChatStreamStatus(){

  return freezeChatObject({

    initialized:

      chatStreamState
      .initialized,

    active:

      chatStreamState
      .active,

    paused:

      chatStreamState
      .paused,

    aborted:

      chatStreamState
      .aborted,

    flushing:

      chatStreamState
      .flushing,

    rendering:

      chatStreamState
      .rendering,

    locked:

      chatStreamState
      .locked,

    status:
    chatStreamState
    .status,

    activeStreamId:

      chatStreamState
      .activeStreamId,

    activeMessageId:

      chatStreamState
      .activeMessageId,

    partialLength:

      String(
        chatStreamState
        .partialContent || ""
      )
      .length,

    bufferedLength:

      String(
        chatStreamState
        .bufferedContent || ""
      )
      .length,

    queuedChunks:

      Array.isArray(
        chatStreamState
        .chunkQueue
      )

      ?

      chatStreamState
      .chunkQueue
      .length

      :

      0,

    bufferedChunks:

      Array.isArray(
        chatStreamState
        .chunkBuffer
      )

      ?

      chatStreamState
      .chunkBuffer
      .length

      :

      0,

    queuedRenders:

      Array.isArray(
        chatStreamState
        .renderQueue
      )

      ?

      chatStreamState
      .renderQueue
      .length

      :

      0,

    diagnostics:

      deepClone(

        chatStreamState
        .diagnostics

      )

  });

}

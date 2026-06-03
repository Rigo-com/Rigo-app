// =====================================
// RIGO AI
// CHAT MESSAGE STATE
// FOUNDATION STATE LAYER
// =====================================



// =====================================
// MESSAGE STATE
// =====================================

const chatMessageState =
Object.seal({

  activeMessageId:null,

  lastMessageId:null,

  messageOrder:[],

  messages:
  new Map(),

  diagnostics:
  Object.seal({

    created:0,

    updated:0,

    deleted:0,

    cleared:0

  })

});



// =====================================
// INTERNAL HELPERS
// =====================================

function createMessageSnapshot(){

  return {

    activeMessageId:
    chatMessageState
    .activeMessageId,

    lastMessageId:
    chatMessageState
    .lastMessageId,

    messageOrder:[
      ...chatMessageState
      .messageOrder
    ],

    messages:
    Array.from(
      chatMessageState
      .messages
      .entries()
    ),

    diagnostics:
    structuredClone(
      chatMessageState
      .diagnostics
    )

  };

}



// =====================================
// GET STATE
// =====================================

function getChatMessageState(){

  return chatMessageState;

}



// =====================================
// GET SNAPSHOT
// =====================================

function getChatMessageSnapshot(){

  return Object.freeze(
    createMessageSnapshot()
  );

}



// =====================================
// UPDATE STATE
// =====================================

function updateChatMessageState(
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
    chatMessageState,
    updates
  );

  return true;

}



// =====================================
// RESET DIAGNOSTICS
// =====================================

function resetMessageDiagnostics(){

  chatMessageState
  .diagnostics
  .created = 0;

  chatMessageState
  .diagnostics
  .updated = 0;

  chatMessageState
  .diagnostics
  .deleted = 0;

  chatMessageState
  .diagnostics
  .cleared = 0;

  return true;

}



// =====================================
// RESET STATE
// =====================================

function resetChatMessageState(){

  chatMessageState
  .activeMessageId =
  null;

  chatMessageState
  .lastMessageId =
  null;

  chatMessageState
  .messageOrder
  .length = 0;

  chatMessageState
  .messages
  .clear();

  resetMessageDiagnostics();

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const ChatMessageState =
Object.freeze({

  get:
  getChatMessageState,

  snapshot:
  getChatMessageSnapshot,

  update:
  updateChatMessageState,

  reset:
  resetChatMessageState,

  resetDiagnostics:
  resetMessageDiagnostics

});



// =====================================
// EXPORTS
// =====================================

export {

  getChatMessageState,

  getChatMessageSnapshot,

  updateChatMessageState,

  resetChatMessageState,

  resetMessageDiagnostics,

  ChatMessageState

};

export default
ChatMessageState;

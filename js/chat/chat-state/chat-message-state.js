// =====================================
// RIGO AI
// CHAT MESSAGE STATE
// =====================================



// =====================================
// STATE
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
// READ API
// =====================================

function getMessage(
  messageId
){

  return (
    chatMessageState
    .messages
    .get(messageId)
    ?? null
  );

}



function getMessages(){

  return Array.from(

    chatMessageState
    .messages
    .values()

  );

}



function hasMessage(
  messageId
){

  return chatMessageState
  .messages
  .has(messageId);

}



function getMessageCount(){

  return chatMessageState
  .messages
  .size;

}



// =====================================
// WRITE API
// =====================================

function addMessage(
  message
){

  if(
    !message ||
    !message.id
  ){
    return false;
  }

  chatMessageState
  .messages
  .set(
    message.id,
    message
  );

  chatMessageState
  .messageOrder
  .push(
    message.id
  );

  chatMessageState
  .activeMessageId =
  message.id;

  chatMessageState
  .lastMessageId =
  message.id;

  return true;

}



function updateMessageRecord(
  messageId,
  updates = {}
){

  const message =

    chatMessageState
    .messages
    .get(messageId);

  if(
    !message
  ){
    return false;
  }

  Object.assign(
    message,
    updates
  );

  return true;

}



function removeMessage(
  messageId
){

  if(
    !hasMessage(
      messageId
    )
  ){
    return false;
  }

  chatMessageState
  .messages
  .delete(
    messageId
  );

  const index =

    chatMessageState
    .messageOrder
    .indexOf(
      messageId
    );

  if(
    index >= 0
  ){

    chatMessageState
    .messageOrder
    .splice(
      index,
      1
    );

  }

  return true;

}



function clearMessages(){

  chatMessageState
  .messages
  .clear();

  chatMessageState
  .messageOrder
  .length = 0;

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function incrementCreated(){

  chatMessageState
  .diagnostics
  .created++;

}



function incrementUpdated(){

  chatMessageState
  .diagnostics
  .updated++;

}



function incrementDeleted(){

  chatMessageState
  .diagnostics
  .deleted++;

}



function incrementCleared(){

  chatMessageState
  .diagnostics
  .cleared++;

}



// =====================================
// SNAPSHOT
// =====================================

function getChatMessageSnapshot(){

  return Object.freeze({

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
      .values()
    ).map(
      message =>
      structuredClone(
        message
      )
    ),

    diagnostics:
    structuredClone(
      chatMessageState
      .diagnostics
    )

  });

}



// =====================================
// RESET
// =====================================

function resetChatMessageState(){

  chatMessageState
  .activeMessageId =
  null;

  chatMessageState
  .lastMessageId =
  null;

  clearMessages();

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
// PUBLIC API
// =====================================

const ChatMessageState =
Object.freeze({

  getMessage,

  getMessages,

  hasMessage,

  getMessageCount,

  addMessage,

  updateMessageRecord,

  removeMessage,

  clearMessages,

  incrementCreated,

  incrementUpdated,

  incrementDeleted,

  incrementCleared,

  snapshot:
  getChatMessageSnapshot,

  reset:
  resetChatMessageState

});



// =====================================
// EXPORTS
// =====================================

export {

  getMessage,
  getMessages,
  hasMessage,
  getMessageCount,

  addMessage,
  updateMessageRecord,
  removeMessage,
  clearMessages,

  incrementCreated,
  incrementUpdated,
  incrementDeleted,
  incrementCleared,

  getChatMessageSnapshot,
  resetChatMessageState,

  ChatMessageState

};

export default
ChatMessageState;

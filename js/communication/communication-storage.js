// =====================================
// RIGO AI
// COMMUNICATION STORAGE
// =====================================



// =====================================
// STORAGE KEY
// =====================================

const COMMUNICATION_STORAGE_KEY =
"rigo_communication_state";



// =====================================
// STORAGE AVAILABLE
// =====================================

function isCommunicationStorageAvailable(){

  try{

    return (
      typeof localStorage !==
      "undefined"
    );

  }

  catch(error){

    return false;

  }

}



// =====================================
// PERSIST STATE
// =====================================

function persistCommunicationState(){

  if(

    !COMMUNICATION_RUNTIME_CONFIG
    .ENABLE_PERSISTENCE

  ){

    return false;

  }

  if(
    !isCommunicationStorageAvailable()
  ){

    return false;

  }

  try{

    const safeQueue =
    communicationRuntimeState
    .messageQueue
    .map((item) => {

      return {

        id:
        item?.id ||
        createCommunicationId(
          "message"
        ),

        content:
        item?.content ||
        "",

        metadata:
        item?.metadata ||
        null,

        createdAt:

          item?.createdAt ||

          Date.now()

      };

    });

    const safeConversations =

      [...communicationRuntimeState
      .conversations
      .entries()]

      .map(([key,value]) => {

        return [

          key,

          {

            payload:
            safeCommunicationClone(
              value?.payload
            ),

            response:
            safeCommunicationClone(
              value?.response
            ),

            createdAt:
            value?.createdAt ||
            Date.now()

          }

        ];

      });

    localStorage.setItem(

      COMMUNICATION_STORAGE_KEY,

      JSON.stringify({

        queue:
        safeQueue,

        conversations:
        safeConversations,

        lastMessageAt:

          communicationRuntimeState
          .lastMessageAt

      })

    );

    return true;

  }

  catch(error){

    if(
      COMMUNICATION_RUNTIME_CONFIG
      .DEBUG
    ){

      console.error(
        "PERSIST_COMMUNICATION_ERROR:",
        error
      );

    }

    return false;

  }

}



// =====================================
// RESTORE STATE
// =====================================

function restoreCommunicationState(){

  if(
    !isCommunicationStorageAvailable()
  ){

    return false;

  }

  try{

    const raw =
    localStorage.getItem(
      COMMUNICATION_STORAGE_KEY
    );

    if(!raw){

      return false;

    }

    const parsed =
    JSON.parse(raw);

    if(

      Array.isArray(
        parsed.queue
      )

      &&

      parsed.queue.length >

      COMMUNICATION_RUNTIME_CONFIG
      .MAX_QUEUE_SIZE

    ){

      parsed.queue =
      parsed.queue.slice(

        0,

        COMMUNICATION_RUNTIME_CONFIG
        .MAX_QUEUE_SIZE

      );

    }

    if(
      !parsed ||
      typeof parsed !==
      "object"
    ){

      return false;

    }

    if(
      Array.isArray(
        parsed.queue
      )
    ){

      communicationRuntimeState
      .messageQueue =

      parsed.queue
      .filter((item) => {

        return validateCommunicationMessage(
          item
        );

      });

    }

    if(
      Array.isArray(
        parsed.conversations
      )
    ){

      const safeConversations =
      parsed.conversations
      .filter((entry) => {

        return (

          Array.isArray(entry)

          &&

          entry.length === 2

          &&

          typeof entry[0] ===
          "string"

          &&

          typeof entry[1] ===
          "object"

        );

      });

      communicationRuntimeState
      .conversations =
      new Map(
        safeConversations
      );

      trimConversationHistory();

    }

    if(

      Number.isFinite(
        parsed.lastMessageAt
      )

    ){

      communicationRuntimeState
      .lastMessageAt =
      parsed.lastMessageAt;

    }

    communicationRuntimeState
    .diagnostics
    .recoveredQueues++;

    return true;

  }

  catch(error){

    if(
      COMMUNICATION_RUNTIME_CONFIG
      .DEBUG
    ){

      console.error(
        "RESTORE_COMMUNICATION_ERROR:",
        error
      );

    }

    clearCommunicationStorage();

    return false;

  }

}



// =====================================
// CLEAR STORAGE
// =====================================

function clearCommunicationStorage(){

  if(
    !isCommunicationStorageAvailable()
  ){

    return false;

  }

  try{

    localStorage.removeItem(
      COMMUNICATION_STORAGE_KEY
    );

    return true;

  }

  catch(error){

    if(
      COMMUNICATION_RUNTIME_CONFIG
      .DEBUG
    ){

      console.error(
        "CLEAR_COMMUNICATION_STORAGE_ERROR:",
        error
      );

    }

    return false;

  }

}


// =====================================
// PUBLIC API
// =====================================

const CommunicationStorage =
Object.freeze({

  available:
  isCommunicationStorageAvailable,

  persist:
  persistCommunicationState,

  restore:
  restoreCommunicationState,

  clear:
  clearCommunicationStorage

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window
  .CommunicationStorage =
  CommunicationStorage;

}



if(
  typeof globalThis !==
  "undefined"
){

  globalThis
  .CommunicationStorage =
  CommunicationStorage;

}

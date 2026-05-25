// =====================================
// RIGO AI
// COMMUNICATION STORAGE
// =====================================



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

  try{

    const safeQueue =
    communicationRuntimeState
    .messageQueue
    .map((item) => {

      return {

        id:item.id,

        content:item.content,

        metadata:item.metadata,

        createdAt:item.createdAt

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
            value?.payload,

            response:
            value?.response,

            createdAt:
            value?.createdAt

          }

        ];

      });

    localStorage.setItem(

      "rigo_communication_state",

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

  try{

    const raw =
    localStorage.getItem(
      "rigo_communication_state"
    );

    if(!raw){

      return false;

    }

    const parsed =
    JSON.parse(raw);

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

      communicationRuntimeState
      .conversations =
      new Map(

        parsed.conversations
      );

      trimConversationHistory();

    }

    if(
      parsed.lastMessageAt
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

    return false;

  }

}



// =====================================
// CLEAR STORAGE
// =====================================

function clearCommunicationStorage(){

  try{

    localStorage.removeItem(
      "rigo_communication_state"
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

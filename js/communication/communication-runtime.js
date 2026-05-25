// =====================================
// STORAGE
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

    localStorage.setItem(

      "rigo_communication_state",

      JSON.stringify({

        queue:safeQueue

      })

    );

    return true;

  }

  catch(error){

    return false;

  }

}



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

    communicationRuntimeState
    .diagnostics
    .recoveredQueues++;

    return true;

  }

  catch(error){

    return false;

  }

}

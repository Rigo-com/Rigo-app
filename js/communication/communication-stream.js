// =====================================
// RIGO AI
// COMMUNICATION STREAM
// NETWORK STREAM LAYER
// =====================================

import {
  COMMUNICATION_EVENTS
}
from "./communication-config.js";

import {
  emit
}
from "../chat-events/chat-events.js";

import ChatStreamService
from "../chat/chat-services/chat-stream-service.js";



// =====================================
// STREAM READER
// =====================================

async function processStream(
  response
){

  if(
    !response
  ){
    return false;
  }

  if(
    !response.body
  ){
    return false;
  }

  const reader =
  response.body.getReader();

  const decoder =
  new TextDecoder();

  emit(
    COMMUNICATION_EVENTS
    .STREAM_STARTED
  );

  try{

    while(true){

      const {

        done,

        value

      } = await reader.read();

      if(
        done
      ){
        break;
      }

      const chunk =

        decoder.decode(
          value,
          {
            stream:true
          }
        );

      if(
        chunk
      ){

        ChatStreamService
        .pushChunk(
          chunk
        );

        emit(

          COMMUNICATION_EVENTS
          .STREAM_UPDATED,

          {
            chunk
          }

        );

      }

    }

    ChatStreamService
    .complete();

    emit(
      COMMUNICATION_EVENTS
      .STREAM_COMPLETED
    );

    return true;

  }

  catch(error){

    ChatStreamService
    .fail(
      error
    );

    emit(

      COMMUNICATION_EVENTS
      .STREAM_ABORTED,

      {
        error
      }

    );

    return false;

  }

}



// =====================================
// CANCEL STREAM
// =====================================

async function cancelStream(
  reader
){

  if(
    !reader
  ){
    return false;
  }

  try{

    await reader.cancel();

    return true;

  }

  catch{

    return false;

  }

}



// =====================================
// PUBLIC API
// =====================================

const CommunicationStream =
Object.freeze({

  processStream,

  cancelStream

});



// =====================================
// EXPORTS
// =====================================

export {

  processStream,

  cancelStream,

  CommunicationStream

};

export default
CommunicationStream;

// =====================================
// RIGO AI
// FILE READER
// FILE READING LAYER
// =====================================

import {

  FILE_CONFIG

}
from "./file-config.js";

import {

  FILE_EVENTS

}
from "./file-events.js";

import {

  validateFile

}
from "./file-validator.js";

import {

  fileState

}
from "./file-state.js";



// =====================================
// EVENT EMITTER
// =====================================

async function emitFileEvent(
  eventName,
  payload = {}
){

  if(
    typeof emitSystemEvent !==
    "function"
  ){

    return false;

  }

  try{

    await emitSystemEvent(

      eventName,

      {

        source:
        "file-reader",

        timestamp:
        Date.now(),

        ...payload

      }

    );

    return true;

  }

  catch{

    return false;

  }

}



// =====================================
// READ TEXT
// =====================================

async function readFileAsText(
  file
){

  return new Promise(

    (resolve,reject) => {

      if(
        !validateFile(
          file
        )
      ){

        reject(

          new Error(

            fileState
            .lastError

          )

        );

        return;

      }

      const readableType =

        FILE_CONFIG
        .TEXT_READABLE_TYPES
        .includes(
          file.type
        );

      if(
        !readableType
      ){

        reject(

          new Error(
            "FILE TYPE NOT READABLE"
          )

        );

        return;

      }

      const reader =
      new FileReader();

      reader.onload =
      async () => {

        await emitFileEvent(

          FILE_EVENTS
          .FILE_READ

        );

        resolve(

          String(

            reader.result ??
            ""

          )

        );

      };

      reader.onerror =
      () => {

        reject(

          new Error(
            "FILE READ FAILED"
          )

        );

      };

      reader.readAsText(
        file
      );

    }

  );

}



// =====================================
// EXPORTS
// =====================================

export {

  readFileAsText

};

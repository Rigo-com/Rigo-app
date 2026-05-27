// =====================================
// RIGO AI
// VOICE INDEX
// =====================================

import "./voice.js";



// =====================================
// VOICE API
// =====================================

const Voice =
Object.freeze({

  runtime:

    typeof VoiceRuntime !==
    "undefined"

    ?

    VoiceRuntime

    :

    null

});



// =====================================
// EXPORTS
// =====================================

export {

  Voice

};



// =====================================
// DEFAULT EXPORT
// =====================================

export default Voice;



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  globalThis.Voice =
  Voice;

}

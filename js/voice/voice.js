// =====================================
// RIGO AI
// VOICE RUNTIME SYSTEM
// ENTERPRISE VOICE ORCHESTRATION FINAL
// =====================================



// =====================================
// VOICE CONFIG
// =====================================

const VOICE_RUNTIME_CONFIG =
Object.freeze({

  ENABLE_EVENTS:true,

  ENABLE_DIAGNOSTICS:true,

  ENABLE_AUTO_RECOVERY:true,

  ENABLE_PERMISSION_MONITORING:true,

  ENABLE_CONTINUOUS_LISTENING:false,

  ENABLE_INTERIM_RESULTS:true,

  ENABLE_NOISE_PROTECTION:true,

  ENABLE_MOBILE_OPTIMIZATION:true,

  ENABLE_AUTO_STOP:true,

  AUTO_STOP_TIMEOUT:
  10000,

  MAX_RETRIES:
  3,

  DEFAULT_LANGUAGE:
  "en-US"

});



// =====================================
// VOICE EVENTS
// =====================================

const VOICE_RUNTIME_EVENTS =
Object.freeze({

  INITIALIZED:
  "voice.initialized",

  STARTED:
  "voice.started",

  STOPPED:
  "voice.stopped",

  ABORTED:
  "voice.aborted",

  RESULT:
  "voice.result",

  INTERIM_RESULT:
  "voice.interim.result",

  ERROR:
  "voice.error",

  PERMISSION_GRANTED:
  "voice.permission.granted",

  PERMISSION_DENIED:
  "voice.permission.denied",

  RECOVERED:
  "voice.recovered"

});



// =====================================
// VOICE STATES
// =====================================

const VOICE_RUNTIME_STATES =
Object.freeze({

  IDLE:"idle",

  INITIALIZING:"initializing",

  READY:"ready",

  LISTENING:"listening",

  PROCESSING:"processing",

  FAILED:"failed",

  DESTROYED:"destroyed"

});



// =====================================
// VOICE STATE
// =====================================

const voiceRuntimeState =
Object.seal({

  initialized:false,

  supported:false,

  listening:false,

  processing:false,

  destroyed:false,

  permissionGranted:false,

  recovering:false,

  retryCount:0,

  recognition:null,

  stream:null,

  silenceTimer:null,

  activeLanguage:

    VOICE_RUNTIME_CONFIG
    .DEFAULT_LANGUAGE,

  state:

    VOICE_RUNTIME_STATES
    .IDLE,

  transcript:"",

  interimTranscript:"",

  diagnostics:Object.seal({

    starts:0,

    stops:0,

    aborts:0,

    errors:0,

    recoveries:0,

    permissionRequests:0,

    permissionDenials:0,

    transcripts:0

  })

});



// =====================================
// HELPERS
// =====================================

function getSpeechRecognitionAPI(){

  if(
    typeof window ===
    "undefined"
  ){

    return null;

  }

  return (

    window.SpeechRecognition ||

    window.webkitSpeechRecognition ||

    null

  );

}



function cleanupRecognitionInstance(){

  const recognition =

    voiceRuntimeState
    .recognition;

  if(!recognition){

    return true;

  }

  try{

    recognition.onstart =
    null;

    recognition.onend =
    null;

    recognition.onerror =
    null;

    recognition.onresult =
    null;

    recognition.abort?.();

  }

  catch(error){

    safeLogError?.(
      "VOICE CLEANUP ERROR:",
      error
    );

  }

  voiceRuntimeState
  .recognition =
  null;

  return true;

}



function stopVoiceStream(){

  const stream =
  voiceRuntimeState
  .stream;

  if(!stream){

    return true;

  }

  try{

    stream
    .getTracks()
    .forEach((track) => {

      track.stop();

    });

  }

  catch(error){

    safeLogError?.(
      "VOICE STREAM STOP ERROR:",
      error
    );

  }

  voiceRuntimeState
  .stream =
  null;

  return true;

}



async function emitVoiceEvent(
  eventName,
  payload = {}
){

  if(

    !VOICE_RUNTIME_CONFIG
    .ENABLE_EVENTS

  ){

    return false;

  }

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

        source:"voice-runtime",

        ...payload

      }

    );

    return true;

  }

  catch(error){

    safeLogError?.(
      "VOICE EVENT ERROR:",
      error
    );

    return false;

  }

}



function setVoiceState(
  state
){

  voiceRuntimeState
  .state =
  state;

  return true;

}



function resetSilenceTimer(){

  clearTimeout(
    voiceRuntimeState
    .silenceTimer
  );

  voiceRuntimeState
  .silenceTimer =
  null;

  if(

    !VOICE_RUNTIME_CONFIG
    .ENABLE_AUTO_STOP

  ){

    return true;

  }

  voiceRuntimeState
  .silenceTimer =
  setTimeout(() => {

    stopVoiceRecognition();

  },

  VOICE_RUNTIME_CONFIG
  .AUTO_STOP_TIMEOUT);

  return true;

}



// =====================================
// SUPPORT CHECK
// =====================================

function checkVoiceSupport(){

  const SpeechRecognition =
  getSpeechRecognitionAPI();

  voiceRuntimeState
  .supported =

    typeof SpeechRecognition ===
    "function";

  return (
    voiceRuntimeState
    .supported
  );

}



// =====================================
// PERMISSION
// =====================================

async function requestMicrophonePermission(){

  if(
    typeof navigator ===
    "undefined"
  ){

    return false;

  }

  if(
    !navigator.mediaDevices
  ){

    return false;

  }

  if(
    !navigator.mediaDevices
    .getUserMedia
  ){

    return false;

  }

  voiceRuntimeState
  .diagnostics
  .permissionRequests++;

  try{

    stopVoiceStream();

    const stream =
    await navigator
    .mediaDevices
    .getUserMedia({

      audio:true

    });

    voiceRuntimeState
    .stream =
    stream;

    voiceRuntimeState
    .permissionGranted =
    true;

    await emitVoiceEvent(

      VOICE_RUNTIME_EVENTS
      .PERMISSION_GRANTED

    );

    return true;

  }

  catch(error){

    voiceRuntimeState
    .permissionGranted =
    false;

    voiceRuntimeState
    .diagnostics
    .permissionDenials++;

    await emitVoiceEvent(

      VOICE_RUNTIME_EVENTS
      .PERMISSION_DENIED,

      {

        error:
        String(error)

      }

    );

    return false;

  }

}



// =====================================
// CREATE RECOGNITION
// =====================================

function createVoiceRecognition(){

  const SpeechRecognition =
  getSpeechRecognitionAPI();

  if(!SpeechRecognition){

    return null;

  }

  const recognition =
  new SpeechRecognition();

  recognition.lang =
  voiceRuntimeState
  .activeLanguage;

  recognition.continuous =

    VOICE_RUNTIME_CONFIG
    .ENABLE_CONTINUOUS_LISTENING;

  recognition.interimResults =

    VOICE_RUNTIME_CONFIG
    .ENABLE_INTERIM_RESULTS;

  recognition.maxAlternatives =
  1;

  recognition.onstart =
  handleRecognitionStart;

  recognition.onend =
  handleRecognitionEnd;

  recognition.onerror =
  handleRecognitionError;

  recognition.onresult =
  handleRecognitionResult;

  return recognition;

}



// =====================================
// START HANDLER
// =====================================

async function handleRecognitionStart(){

  voiceRuntimeState
  .retryCount =
  0;

  voiceRuntimeState
  .listening =
  true;

  setVoiceState(

    VOICE_RUNTIME_STATES
    .LISTENING

  );

  voiceRuntimeState
  .diagnostics
  .starts++;

  resetSilenceTimer();

  await emitVoiceEvent(

    VOICE_RUNTIME_EVENTS
    .STARTED

  );

}



// =====================================
// END HANDLER
// =====================================

async function handleRecognitionEnd(){

  clearTimeout(

    voiceRuntimeState
    .silenceTimer

  );

  voiceRuntimeState
  .silenceTimer =
  null;

  voiceRuntimeState
  .listening =
  false;

  if(

    voiceRuntimeState
    .destroyed

  ){

    return;
  }

  setVoiceState(

    VOICE_RUNTIME_STATES
    .READY

  );

  voiceRuntimeState
  .diagnostics
  .stops++;

  await emitVoiceEvent(

    VOICE_RUNTIME_EVENTS
    .STOPPED

  );

}



// =====================================
// ERROR HANDLER
// =====================================

async function handleRecognitionError(
  event
){

  voiceRuntimeState
  .diagnostics
  .errors++;

  voiceRuntimeState
  .listening =
  false;

  setVoiceState(

    VOICE_RUNTIME_STATES
    .FAILED

  );

  const errorCode =

    event?.error ||

    "UNKNOWN";

  await emitVoiceEvent(

    VOICE_RUNTIME_EVENTS
    .ERROR,

    {

      error:errorCode

    }

  );

  if(
    errorCode ===
    "not-allowed"
  ){

    voiceRuntimeState
    .permissionGranted =
    false;

    return false;

  }

  if(

    VOICE_RUNTIME_CONFIG
    .ENABLE_AUTO_RECOVERY

    &&

    voiceRuntimeState
    .retryCount <

    VOICE_RUNTIME_CONFIG
    .MAX_RETRIES

  ){

    await recoverVoiceRuntime();

  }

}



// =====================================
// RESULT HANDLER
// =====================================

async function handleRecognitionResult(
  event
){

  if(!event){

    return false;

  }

  resetSilenceTimer();

  let finalTranscript =
  "";

  let interimTranscript =
  "";

  for(

    let index =
    event.resultIndex;

    index <
    event.results.length;

    index++

  ){

    const result =
    event.results[index];

    const transcript =

      result?.[0]
      ?.transcript ||

      "";

    if(
      result.isFinal
    ){

      finalTranscript +=
      transcript;

    }

    else{

      interimTranscript +=
      transcript;

    }

  }

  voiceRuntimeState
  .transcript =
  finalTranscript.trim();

  voiceRuntimeState
  .interimTranscript =
  interimTranscript.trim();

  if(interimTranscript){

    await emitVoiceEvent(

      VOICE_RUNTIME_EVENTS
      .INTERIM_RESULT,

      {

        transcript:
        interimTranscript

      }

    );

  }

  if(finalTranscript){

    voiceRuntimeState
    .diagnostics
    .transcripts++;

    await emitVoiceEvent(

      VOICE_RUNTIME_EVENTS
      .RESULT,

      {

        transcript:
        finalTranscript

      }

    );

    const input =

      typeof ChatElements !==
      "undefined"

      ?

      ChatElements
      .getInput?.()

      :

      null;

    if(input){

      input.value =
      finalTranscript.trim();
    }

  }

  return true;

}



// =====================================
// START VOICE
// =====================================

async function startVoiceRecognition(){

  if(
    voiceRuntimeState
    .destroyed
  ){

    return false;

  }

  if(
    voiceRuntimeState
    .listening
  ){

    return true;

  }

  const supported =
  checkVoiceSupport();

  if(!supported){

    return false;

  }

  setVoiceState(

    VOICE_RUNTIME_STATES
    .INITIALIZING

  );

  const granted =
  await requestMicrophonePermission();

  if(!granted){

    setVoiceState(

      VOICE_RUNTIME_STATES
      .FAILED

    );

    return false;

  }

  try{

    cleanupRecognitionInstance();

    voiceRuntimeState
    .recognition =
    createVoiceRecognition();

    if(

      !voiceRuntimeState
      .recognition

    ){

      return false;

    }

    voiceRuntimeState
    .recognition
    .start();

    return true;

  }

  catch(error){

    voiceRuntimeState
    .diagnostics
    .errors++;

    setVoiceState(

      VOICE_RUNTIME_STATES
      .FAILED

    );

    await emitVoiceEvent(

      VOICE_RUNTIME_EVENTS
      .ERROR,

      {

        error:
        String(error)

      }

    );

    return false;

  }

}



// =====================================
// STOP VOICE
// =====================================

async function stopVoiceRecognition(){

  clearTimeout(

    voiceRuntimeState
    .silenceTimer

  );

  voiceRuntimeState
  .silenceTimer =
  null;

  const recognition =

    voiceRuntimeState
    .recognition;

  if(recognition){

    try{

      recognition.stop();

    }

    catch(error){

      safeLogError?.(
        error
      );

    }

  }

  voiceRuntimeState
  .listening =
  false;

  setVoiceState(

    VOICE_RUNTIME_STATES
    .READY

  );

  return true;

}



// =====================================
// ABORT VOICE
// =====================================

async function abortVoiceRecognition(){

  clearTimeout(

    voiceRuntimeState
    .silenceTimer

  );

  voiceRuntimeState
  .silenceTimer =
  null;

  cleanupRecognitionInstance();

  voiceRuntimeState
  .listening =
  false;

  voiceRuntimeState
  .diagnostics
  .aborts++;

  await emitVoiceEvent(

    VOICE_RUNTIME_EVENTS
    .ABORTED

  );

  setVoiceState(

    VOICE_RUNTIME_STATES
    .READY

  );

  return true;

}



// =====================================
// RECOVERY
// =====================================

async function recoverVoiceRuntime(){

  if(
    voiceRuntimeState
    .recovering
  ){

    return false;

  }

  if(
    !voiceRuntimeState
    .permissionGranted
  ){

    return false;

  }

  voiceRuntimeState
  .recovering =
  true;

  voiceRuntimeState
  .retryCount++;

  voiceRuntimeState
  .diagnostics
  .recoveries++;

  try{

    await abortVoiceRecognition();

    const recovered =
    await startVoiceRecognition();

    if(!recovered){

      return false;

    }

    await emitVoiceEvent(

      VOICE_RUNTIME_EVENTS
      .RECOVERED

    );

    return true;

  }

  catch(error){

    safeLogError?.(
      "VOICE RECOVERY ERROR:",
      error
    );

    return false;

  }

  finally{

    voiceRuntimeState
    .recovering =
    false;

  }

}



// =====================================
// CHANGE LANGUAGE
// =====================================

function setVoiceLanguage(
  language
){

  if(
    typeof language !==
    "string"
  ){

    return false;

  }

  voiceRuntimeState
  .activeLanguage =
  language;

  if(

    voiceRuntimeState
    .recognition

  ){

    voiceRuntimeState
    .recognition
    .lang =
    language;

  }

  return true;

}



// =====================================
// RESET DIAGNOSTICS
// =====================================

function resetVoiceDiagnostics(){

  voiceRuntimeState
  .diagnostics
  .starts = 0;

  voiceRuntimeState
  .diagnostics
  .stops = 0;

  voiceRuntimeState
  .diagnostics
  .aborts = 0;

  voiceRuntimeState
  .diagnostics
  .errors = 0;

  voiceRuntimeState
  .diagnostics
  .recoveries = 0;

  voiceRuntimeState
  .diagnostics
  .permissionRequests = 0;

  voiceRuntimeState
  .diagnostics
  .permissionDenials = 0;

  voiceRuntimeState
  .diagnostics
  .transcripts = 0;

  return true;

}



// =====================================
// RESET VOICE
// =====================================

async function resetVoiceRuntime(){

  await abortVoiceRecognition();

  stopVoiceStream();

  voiceRuntimeState
  .listening =
  false;

  voiceRuntimeState
  .processing =
  false;

  voiceRuntimeState
  .recovering =
  false;

  voiceRuntimeState
  .retryCount =
  0;

  voiceRuntimeState
  .transcript =
  "";

  voiceRuntimeState
  .interimTranscript =
  "";

  resetVoiceDiagnostics();

  setVoiceState(

    VOICE_RUNTIME_STATES
    .READY

  );

  return true;

}



// =====================================
// DESTROY VOICE
// =====================================

async function destroyVoiceRuntime(){

  await abortVoiceRecognition();

  clearTimeout(

    voiceRuntimeState
    .silenceTimer

  );

  voiceRuntimeState
  .silenceTimer =
  null;

  stopVoiceStream();

  cleanupRecognitionInstance();

  voiceRuntimeState
  .transcript =
  "";

  voiceRuntimeState
  .interimTranscript =
  "";

  voiceRuntimeState
  .recognition =
  null;

  voiceRuntimeState
  .stream =
  null;

  voiceRuntimeState
  .destroyed =
  true;

  voiceRuntimeState
  .initialized =
  false;

  setVoiceState(

    VOICE_RUNTIME_STATES
    .DESTROYED

  );

  return true;

}



// =====================================
// STATUS
// =====================================

function getVoiceRuntimeStatus(){

  const diagnostics =

    typeof deepClone ===
    "function"

    ?

    deepClone(

      voiceRuntimeState
      .diagnostics

    )

    :

    {

      ...voiceRuntimeState
      .diagnostics

    };

  return Object.freeze({

    initialized:

      voiceRuntimeState
      .initialized,

    supported:

      voiceRuntimeState
      .supported,

    listening:

      voiceRuntimeState
      .listening,

    processing:

      voiceRuntimeState
      .processing,

    permissionGranted:

      voiceRuntimeState
      .permissionGranted,

    state:

      voiceRuntimeState
      .state,

    language:

      voiceRuntimeState
      .activeLanguage,

    transcript:

      voiceRuntimeState
      .transcript,

    interimTranscript:

      voiceRuntimeState
      .interimTranscript,

    diagnostics:
    diagnostics

  });

}



// =====================================
// INITIALIZE
// =====================================

async function initializeVoiceRuntime(){

  if(
    voiceRuntimeState
    .initialized
  ){

    return true;

  }

  const supported =
  checkVoiceSupport();

  if(!supported){

    setVoiceState(

      VOICE_RUNTIME_STATES
      .FAILED

    );

    return false;

  }

  cleanupRecognitionInstance();

  voiceRuntimeState
  .recognition =
  createVoiceRecognition();

  if(

    !voiceRuntimeState
    .recognition

  ){

    return false;

  }

  voiceRuntimeState
  .initialized =
  true;

  voiceRuntimeState
  .destroyed =
  false;

  setVoiceState(

    VOICE_RUNTIME_STATES
    .READY

  );

  await emitVoiceEvent(

    VOICE_RUNTIME_EVENTS
    .INITIALIZED

  );

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const VoiceRuntime =
Object.freeze({

  initialize:
  initializeVoiceRuntime,

  start:
  startVoiceRecognition,

  stop:
  stopVoiceRecognition,

  abort:
  abortVoiceRecognition,

  recover:
  recoverVoiceRuntime,

  reset:
  resetVoiceRuntime,

  destroy:
  destroyVoiceRuntime,

  setLanguage:
  setVoiceLanguage,

  status:
  getVoiceRuntimeStatus

});

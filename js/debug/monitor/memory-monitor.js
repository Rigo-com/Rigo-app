// =====================================
// RIGO AI
// MEMORY MONITOR
// =====================================

const memoryMonitorState =
Object.seal({

  active:
  false,

  intervalId:
  null,

  samples:[],

  maxSamples:
  500,

  lastSample:
  null

});



// =====================================
// COLLECT
// =====================================

function collectMemorySample(){

  const memory =

    performance
    ?.memory;

  if(
    !memory
  ){

    return null;

  }

  const sample = {

    usedJSHeapSize:
    memory.usedJSHeapSize,

    totalJSHeapSize:
    memory.totalJSHeapSize,

    jsHeapSizeLimit:
    memory.jsHeapSizeLimit,

    timestamp:
    Date.now()

  };

  memoryMonitorState
  .samples
  .push(sample);

  if(

    memoryMonitorState
    .samples
    .length >

    memoryMonitorState
    .maxSamples

  ){

    memoryMonitorState
    .samples
    .shift();

  }

  memoryMonitorState
  .lastSample =
  sample;

  return sample;

}



// =====================================
// START
// =====================================

function startMemoryMonitor(

  interval = 5000

){

  if(
    memoryMonitorState
    .active
  ){

    return true;

  }

  memoryMonitorState
  .intervalId =

  setInterval(

    collectMemorySample,

    interval

  );

  memoryMonitorState
  .active =
  true;

  collectMemorySample();

  return true;

}



// =====================================
// STOP
// =====================================

function stopMemoryMonitor(){

  clearInterval(

    memoryMonitorState
    .intervalId

  );

  memoryMonitorState
  .active =
  false;

  memoryMonitorState
  .intervalId =
  null;

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return Object.freeze({

    active:
    memoryMonitorState
    .active,

    samples:

    memoryMonitorState
    .samples
    .length,

    lastSample:
    memoryMonitorState
    .lastSample

  });

}



// =====================================
// API
// =====================================

export const MemoryMonitor =
Object.freeze({

  start:
  startMemoryMonitor,

  stop:
  stopMemoryMonitor,

  sample:
  collectMemorySample,

  snapshot

});



export default
MemoryMonitor;

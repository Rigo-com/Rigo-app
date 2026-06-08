// =====================================
// RIGO AI
// PERFORMANCE MONITOR
// =====================================

const performanceMonitorState =
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

function collectPerformanceSample(){

  const sample = {

    timestamp:
    Date.now(),

    navigation:

    performance
    .timing
    ? {

      loadTime:

      performance.timing
      .loadEventEnd -

      performance.timing
      .navigationStart

    }
    : null

  };

  performanceMonitorState
  .samples
  .push(sample);

  if(

    performanceMonitorState
    .samples
    .length >

    performanceMonitorState
    .maxSamples

  ){

    performanceMonitorState
    .samples
    .shift();

  }

  performanceMonitorState
  .lastSample =
  sample;

  return sample;

}



// =====================================
// START
// =====================================

function startPerformanceMonitor(

  interval = 5000

){

  if(
    performanceMonitorState
    .active
  ){

    return true;

  }

  performanceMonitorState
  .intervalId =

  setInterval(

    collectPerformanceSample,

    interval

  );

  performanceMonitorState
  .active =
   true;

  collectPerformanceSample();

  return true;

}



// =====================================
// STOP
// =====================================

function stopPerformanceMonitor(){

  clearInterval(

    performanceMonitorState
    .intervalId

  );

  performanceMonitorState
  .active =
  false;

  performanceMonitorState
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
    performanceMonitorState
    .active,

    samples:

    performanceMonitorState
    .samples
    .length,

    lastSample:
    performanceMonitorState
    .lastSample

    maxSamples:
    performanceMonitorState
    .maxSamples,
    
  });

}



// =====================================
// API
// =====================================

export const PerformanceMonitor =
Object.freeze({

  start:
  startPerformanceMonitor,

  stop:
  stopPerformanceMonitor,

  sample:
  collectPerformanceSample,

  snapshot

});



export default
PerformanceMonitor;

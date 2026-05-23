// =====================================
// RIGO AI
// DIAGNOSTICS RUNTIME SYSTEM
// ENTERPRISE OBSERVABILITY ENGINE FINAL
// =====================================



// =====================================
// CONFIG
// =====================================

const DIAGNOSTICS_CONFIG =
Object.freeze({

  MAX_LOG_ENTRIES:1000,

  MAX_ERROR_ENTRIES:300,

  MAX_PERFORMANCE_ENTRIES:500,

  MAX_SNAPSHOT_ENTRIES:100,

  MAX_QUEUE_SIZE:2000,

  MAX_BATCH_SIZE:50,

  MAX_RETENTION_AGE:
  1000 * 60 * 60,

  HEALTH_MONITOR_INTERVAL:
  60000,

  SNAPSHOT_INTERVAL:
  30000,

  BATCH_FLUSH_INTERVAL:
  1000,

  ENABLE_CONSOLE_LOGGING:true,

  ENABLE_PERFORMANCE_TRACKING:true,

  ENABLE_HEALTH_SCORING:true,

  ENABLE_RUNTIME_MONITORING:true,

  ENABLE_BATCHING:true,

  ENABLE_EVENT_BRIDGE:true,

  ENABLE_AUTO_SNAPSHOTS:true,

  ENABLE_LOG_SAMPLING:true,

  ENABLE_RETENTION_CLEANUP:true,

  ENABLE_EVENTS:true,

  LOG_SAMPLING_RATE:1

});



// =====================================
// EVENTS
// =====================================

const DIAGNOSTICS_EVENTS =
Object.freeze({

  INITIALIZED:
  "diagnostics.initialized",

  ERROR:
  "diagnostics.error",

  CRITICAL:
  "diagnostics.critical",

  WARNING:
  "diagnostics.warning",

  INFO:
  "diagnostics.info",

  SNAPSHOT_CREATED:
  "diagnostics.snapshot.created",

  HEALTH_DEGRADED:
  "diagnostics.health.degraded",

  HEALTH_RECOVERED:
  "diagnostics.health.recovered"

});



// =====================================
// STATE
// =====================================

const diagnosticsState =
Object.seal({

  initialized:false,

  globalHandlersRegistered:false,

  processingQueue:false,

  monitoringTimer:null,

  flushTimer:null,

  snapshotTimer:null,

  startedAt:Date.now(),

  lastHealthCheckAt:null,

  runtimeHealthy:true,

  globalHealthScore:100,

  logs:[],

  errors:[],

  warnings:[],

  performance:[],

  snapshots:[],

  queue:[],

  counters:{

    logs:0,

    warnings:0,

    errors:0,

    crashes:0,

    healthChecks:0,

    batches:0,

    queueProcessed:0

  },

  performanceMetrics:
  new Map()

});



// =====================================
// LEVELS
// =====================================

const DIAGNOSTIC_LEVELS =
Object.freeze({

  INFO:"info",

  WARN:"warn",

  ERROR:"error",

  CRITICAL:"critical"

});



// =====================================
// EVENT EMITTER
// =====================================

async function emitDiagnosticsEvent(
  eventName,
  payload = {}
){

  if(

    !DIAGNOSTICS_CONFIG
    .ENABLE_EVENT_BRIDGE

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

        source:
        "diagnostics-runtime",

        ...payload

      }

    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// INTERNAL ID
// =====================================

function createDiagnosticsId(){

  return (

    "diag_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



// =====================================
// SAFE FREEZE
// =====================================

function deepFreezeDiagnostics(
  object,
  visited = new WeakSet()
){

  if(
    !object ||
    typeof object !==
    "object"
  ){

    return object;

  }

  if(
    visited.has(object)
  ){

    return object;

  }

  visited.add(
    object
  );

  Object.freeze(
    object
  );

  Object.values(object)
  .forEach((value) => {

    if(
      value &&
      typeof value ===
      "object"
    ){

      deepFreezeDiagnostics(
        value,
        visited
      );

    }

  });

  return object;

}



// =====================================
// SAFE CLONE
// =====================================

function safeMetadataClone(
  metadata
){

  if(
    metadata == null
  ){

    return null;

  }

  try{

    return JSON.parse(
      JSON.stringify(
        metadata
      )
    );

  }

  catch(error){

    return {

      serializationError:true,

      message:
      "METADATA SERIALIZATION FAILED"

    };

  }

}



// =====================================
// PERFORMANCE NOW
// =====================================

function getPerformanceNow(){

  try{

    if(

      typeof performance !==
      "undefined" &&

      typeof performance.now ===
      "function"

    ){

      return performance.now();

    }

  }

  catch(error){}

  return Date.now();

}



// =====================================
// TIMESTAMP
// =====================================

function createDiagnosticTimestamp(){

  return Date.now();

}



// =====================================
// LOG SAMPLING
// =====================================

function shouldSampleLog(){

  if(

    !DIAGNOSTICS_CONFIG
    .ENABLE_LOG_SAMPLING

  ){

    return true;

  }

  return (

    Math.random() <=

    DIAGNOSTICS_CONFIG
    .LOG_SAMPLING_RATE

  );

}



// =====================================
// ENTRY
// =====================================

function createDiagnosticEntry(
  level,
  message,
  metadata = null
){

  return deepFreezeDiagnostics({

    id:
    createDiagnosticsId(),

    level:
    String(level),

    message:
    String(message),

    metadata:
    safeMetadataClone(
      metadata
    ),

    timestamp:
    createDiagnosticTimestamp()

  });

}



// =====================================
// ARRAY PUSH
// =====================================

function pushDiagnosticEntry(
  targetArray,
  entry,
  maxSize
){

  targetArray.push(
    entry
  );

  if(
    targetArray.length >
    maxSize
  ){

    targetArray.shift();

  }

  return true;

}



// =====================================
// QUEUE
// =====================================

function enqueueDiagnosticEntry(
  target,
  entry,
  maxSize
){

  if(
    !shouldSampleLog()
  ){

    return false;

  }

  if(

    diagnosticsState
    .queue
    .length >=

    DIAGNOSTICS_CONFIG
    .MAX_QUEUE_SIZE

  ){

    diagnosticsState
    .queue
    .shift();

  }

  diagnosticsState
  .queue
  .push({

    target,

    entry,

    maxSize

  });

  return true;

}



// =====================================
// PROCESS QUEUE
// =====================================

async function processDiagnosticsQueue(){

  if(
    diagnosticsState
    .processingQueue
  ){

    return false;

  }

  diagnosticsState
  .processingQueue =
  true;

  try{

    while(

      diagnosticsState
      .queue
      .length > 0

    ){

      const batch =

        diagnosticsState
        .queue
        .splice(

          0,

          DIAGNOSTICS_CONFIG
          .MAX_BATCH_SIZE

        );

      batch.forEach((item) => {

        pushDiagnosticEntry(

          item.target,

          item.entry,

          item.maxSize

        );

      });

      diagnosticsState
      .counters
      .batches++;

      diagnosticsState
      .counters
      .queueProcessed +=

        batch.length;

    }

    return true;

  }

  finally{

    diagnosticsState
    .processingQueue =
    false;

  }

}



// =====================================
// START QUEUE
// =====================================

function startDiagnosticsQueueProcessor(){

  if(
    diagnosticsState
    .flushTimer
  ){

    clearInterval(

      diagnosticsState
      .flushTimer

    );

  }

  diagnosticsState
  .flushTimer =
  setInterval(() => {

    processDiagnosticsQueue();

  },

  DIAGNOSTICS_CONFIG
  .BATCH_FLUSH_INTERVAL);

  return true;

}



// =====================================
// STOP QUEUE PROCESSOR
// =====================================

function stopDiagnosticsQueueProcessor(){

  if(
    diagnosticsState
    .flushTimer
  ){

    clearInterval(

      diagnosticsState
      .flushTimer

    );

    diagnosticsState
    .flushTimer =
    null;

  }

  return true;

}



// =====================================
// RETENTION CLEANUP
// =====================================

function cleanupDiagnosticsRetention(){

  if(

    !DIAGNOSTICS_CONFIG
    .ENABLE_RETENTION_CLEANUP

  ){

    return false;

  }

  const minimumTimestamp =

    Date.now() -

    DIAGNOSTICS_CONFIG
    .MAX_RETENTION_AGE;

  const cleanupArray =
  (array) => {

    return array.filter((entry) => {

      return (
        entry.timestamp >=
        minimumTimestamp
      );

    });

  };

  diagnosticsState.logs =
  cleanupArray(
    diagnosticsState.logs
  );

  diagnosticsState.errors =
  cleanupArray(
    diagnosticsState.errors
  );

  diagnosticsState.warnings =
  cleanupArray(
    diagnosticsState.warnings
  );

  diagnosticsState.performance =
  cleanupArray(
    diagnosticsState.performance
  );

  diagnosticsState.snapshots =
  cleanupArray(
    diagnosticsState.snapshots
  );

  return true;

}



// =====================================
// CONSOLE LOGGER
// =====================================

function writeConsoleLog(
  method,
  prefix,
  message,
  metadata
){

  if(

    !DIAGNOSTICS_CONFIG
    .ENABLE_CONSOLE_LOGGING

  ){

    return false;

  }

  try{

    console[method](
      prefix,
      message,
      metadata || ""
    );

  }

  catch(error){

    return false;

  }

  return true;

}



// =====================================
// INFO
// =====================================

async function logDiagnosticInfo(
  message,
  metadata = null
){

  const entry =
  createDiagnosticEntry(

    DIAGNOSTIC_LEVELS.INFO,

    message,

    metadata

  );

  diagnosticsState
  .counters
  .logs++;

  enqueueDiagnosticEntry(

    diagnosticsState.logs,

    entry,

    DIAGNOSTICS_CONFIG
    .MAX_LOG_ENTRIES

  );

  writeConsoleLog(

    "info",

    "[RIGO INFO]",

    message,

    metadata

  );

  await emitDiagnosticsEvent(

    DIAGNOSTICS_EVENTS
    .INFO,

    {

      message,

      metadata

    }

  );

  return true;

}



// =====================================
// WARNING
// =====================================

async function logDiagnosticWarning(
  message,
  metadata = null
){

  const entry =
  createDiagnosticEntry(

    DIAGNOSTIC_LEVELS.WARN,

    message,

    metadata

  );

  diagnosticsState
  .counters
  .warnings++;

  enqueueDiagnosticEntry(

    diagnosticsState
    .warnings,

    entry,

    DIAGNOSTICS_CONFIG
    .MAX_ERROR_ENTRIES

  );

  writeConsoleLog(

    "warn",

    "[RIGO WARN]",

    message,

    metadata

  );

  await emitDiagnosticsEvent(

    DIAGNOSTICS_EVENTS
    .WARNING,

    {

      message,

      metadata

    }

  );

  return true;

}



// =====================================
// ERROR
// =====================================

async function logDiagnosticError(
  message,
  metadata = null
){

  const entry =
  createDiagnosticEntry(

    DIAGNOSTIC_LEVELS.ERROR,

    message,

    metadata

  );

  diagnosticsState
  .counters
  .errors++;

  enqueueDiagnosticEntry(

    diagnosticsState
    .errors,

    entry,

    DIAGNOSTICS_CONFIG
    .MAX_ERROR_ENTRIES

  );

  writeConsoleLog(

    "error",

    "[RIGO ERROR]",

    message,

    metadata

  );

  await emitDiagnosticsEvent(

    DIAGNOSTICS_EVENTS
    .ERROR,

    {

      message,

      metadata

    }

  );

  return true;

}



// =====================================
// CRITICAL
// =====================================

async function logCriticalError(
  message,
  metadata = null
){

  diagnosticsState
  .counters
  .crashes++;

  diagnosticsState
  .runtimeHealthy =
  false;

  await createRuntimeSnapshot();

  await emitDiagnosticsEvent(

    DIAGNOSTICS_EVENTS
    .CRITICAL,

    {

      message,

      metadata

    }

  );

  return logDiagnosticError(
    message,
    metadata
  );

}



// =====================================
// RECOVER HEALTH
// =====================================

async function recoverRuntimeHealth(){

  diagnosticsState
  .runtimeHealthy =
  true;

  await emitDiagnosticsEvent(

    DIAGNOSTICS_EVENTS
    .HEALTH_RECOVERED

  );

  return true;

}



// =====================================
// NORMALIZE DURATION
// =====================================

function normalizeMetricDuration(
  duration
){

  const normalized =
  Number(duration);

  if(
    !Number.isFinite(
      normalized
    )
  ){

    return 0;

  }

  return Math.max(
    0,
    normalized
  );

}



// =====================================
// PERFORMANCE
// =====================================

function trackPerformanceMetric(
  metricName,
  duration,
  metadata = null
){

  if(

    !DIAGNOSTICS_CONFIG
    .ENABLE_PERFORMANCE_TRACKING

  ){

    return false;

  }

  const normalizedDuration =
  normalizeMetricDuration(
    duration
  );

  const metric =
  deepFreezeDiagnostics({

    id:
    createDiagnosticsId(),

    metric:
    String(metricName),

    duration:
    normalizedDuration,

    metadata:
    safeMetadataClone(
      metadata
    ),

    timestamp:
    createDiagnosticTimestamp()

  });

  enqueueDiagnosticEntry(

    diagnosticsState
    .performance,

    metric,

    DIAGNOSTICS_CONFIG
    .MAX_PERFORMANCE_ENTRIES

  );

  if(

    !diagnosticsState
    .performanceMetrics
    .has(metricName)

  ){

    diagnosticsState
    .performanceMetrics
    .set(metricName,{

      count:0,

      total:0,

      min:Infinity,

      max:0

    });

  }

  const aggregatedMetric =

    diagnosticsState
    .performanceMetrics
    .get(metricName);

  aggregatedMetric.count++;

  aggregatedMetric.total +=
  normalizedDuration;

  aggregatedMetric.min =
  Math.min(

    aggregatedMetric.min,

    normalizedDuration

  );

  aggregatedMetric.max =
  Math.max(

    aggregatedMetric.max,

    normalizedDuration

  );

  return true;

}



// =====================================
// MEASURE PERFORMANCE
// =====================================

async function measureAsyncPerformance(
  metricName,
  callback
){

  const startedAt =
  getPerformanceNow();

  try{

    return await callback();

  }

  finally{

    const duration =

      getPerformanceNow() -
      startedAt;

    trackPerformanceMetric(

      metricName,

      duration

    );

  }

}



// =====================================
// HEALTH SCORE
// =====================================

async function calculateHealthScore(){

  let score = 100;

  score -= Math.min(

    diagnosticsState
    .counters
    .errors * 2,

    40

  );

  score -= Math.min(

    diagnosticsState
    .counters
    .crashes * 10,

    40

  );

  score -= Math.min(

    diagnosticsState
    .counters
    .warnings,

    20

  );

  score = Math.max(
    0,
    score
  );

  diagnosticsState
  .globalHealthScore =
  score;

  diagnosticsState
  .lastHealthCheckAt =
  Date.now();

  diagnosticsState
  .counters
  .healthChecks++;

  if(score < 70){

    await emitDiagnosticsEvent(

      DIAGNOSTICS_EVENTS
      .HEALTH_DEGRADED,

      {

        score

      }

    );

  }

  return score;

}



// =====================================
// MEMORY USAGE
// =====================================

function getSafeMemoryUsage(){

  try{

    if(

      typeof performance ===
      "undefined" ||

      !performance.memory

    ){

      return null;

    }

    return {

      usedJSHeapSize:

        performance.memory
        .usedJSHeapSize,

      totalJSHeapSize:

        performance.memory
        .totalJSHeapSize,

      jsHeapSizeLimit:

        performance.memory
        .jsHeapSizeLimit

    };

  }

  catch(error){

    return null;

  }

}



// =====================================
// SNAPSHOT
// =====================================

async function createRuntimeSnapshot(){

  const snapshot =
  deepFreezeDiagnostics({

    timestamp:
    Date.now(),

    healthScore:
    diagnosticsState
    .globalHealthScore,

    runtimeHealthy:
    diagnosticsState
    .runtimeHealthy,

    counters:{

      ...diagnosticsState
      .counters

    },

    memoryUsage:
    getSafeMemoryUsage()

  });

  enqueueDiagnosticEntry(

    diagnosticsState
    .snapshots,

    snapshot,

    DIAGNOSTICS_CONFIG
    .MAX_SNAPSHOT_ENTRIES

  );

  await emitDiagnosticsEvent(

    DIAGNOSTICS_EVENTS
    .SNAPSHOT_CREATED

  );

  return snapshot;

}



// =====================================
// AUTO SNAPSHOTS
// =====================================

function startAutomaticSnapshots(){

  if(

    !DIAGNOSTICS_CONFIG
    .ENABLE_AUTO_SNAPSHOTS

  ){

    return false;

  }

  if(
    diagnosticsState
    .snapshotTimer
  ){

    clearInterval(

      diagnosticsState
      .snapshotTimer

    );

  }

  diagnosticsState
  .snapshotTimer =
  setInterval(() => {

    createRuntimeSnapshot();

    cleanupDiagnosticsRetention();

  },

  DIAGNOSTICS_CONFIG
  .SNAPSHOT_INTERVAL);

  return true;

}



// =====================================
// STOP SNAPSHOTS
// =====================================

function stopAutomaticSnapshots(){

  if(
    diagnosticsState
    .snapshotTimer
  ){

    clearInterval(

      diagnosticsState
      .snapshotTimer

    );

    diagnosticsState
    .snapshotTimer =
    null;

  }

  return true;

}



// =====================================
// MONITORING
// =====================================

function startDiagnosticsMonitoring(){

  if(
    diagnosticsState
    .monitoringTimer
  ){

    clearInterval(

      diagnosticsState
      .monitoringTimer

    );

  }

  diagnosticsState
  .monitoringTimer =
  setInterval(() => {

    calculateHealthScore();

  },

  DIAGNOSTICS_CONFIG
  .HEALTH_MONITOR_INTERVAL);

  return true;

}



// =====================================
// STOP MONITORING
// =====================================

function stopDiagnosticsMonitoring(){

  if(
    diagnosticsState
    .monitoringTimer
  ){

    clearInterval(

      diagnosticsState
      .monitoringTimer

    );

    diagnosticsState
    .monitoringTimer =
    null;

  }

  return true;

}



// =====================================
// HEALTH REPORT
// =====================================

async function generateHealthReport(){

  const healthScore =
  await calculateHealthScore();

  return deepFreezeDiagnostics({

    healthy:
    healthScore >= 70,

    score:
    healthScore,

    runtimeHealthy:

      diagnosticsState
      .runtimeHealthy,

    uptime:

      Date.now() -

      diagnosticsState
      .startedAt,

    counters:{

      ...diagnosticsState
      .counters

    },

    performanceMetrics:[

      ...diagnosticsState
      .performanceMetrics
      .entries()

    ],

    lastHealthCheckAt:

      diagnosticsState
      .lastHealthCheckAt

  });

}



// =====================================
// GLOBAL ERRORS
// =====================================

function registerGlobalErrorHandlers(){

  if(
    typeof window ===
    "undefined"
  ){

    return false;

  }

  if(

    diagnosticsState
    .globalHandlersRegistered

  ){

    return true;

  }

  window.addEventListener(
    "error",
    (event) => {

      logCriticalError(

        event.message ||

        "UNKNOWN WINDOW ERROR",

        {

          filename:
          event.filename,

          line:
          event.lineno,

          column:
          event.colno

        }

      );

    }
  );

  window.addEventListener(
    "unhandledrejection",
    (event) => {

      logCriticalError(

        "UNHANDLED PROMISE REJECTION",

        {

          reason:
          String(
            event.reason
          )

        }

      );

    }
  );

  diagnosticsState
  .globalHandlersRegistered =
  true;

  return true;

}



// =====================================
// EXPORT
// =====================================

async function exportDiagnosticsBundle(){

  return deepFreezeDiagnostics({

    exportedAt:
    Date.now(),

    health:
    await generateHealthReport(),

    logs:[

      ...diagnosticsState
      .logs

    ],

    warnings:[

      ...diagnosticsState
      .warnings

    ],

    errors:[

      ...diagnosticsState
      .errors

    ],

    performance:[

      ...diagnosticsState
      .performance

    ],

    snapshots:[

      ...diagnosticsState
      .snapshots

    ]

  });

}



// =====================================
// DIAGNOSTICS SNAPSHOT
// =====================================

function getDiagnosticsSnapshot(){

  return deepFreezeDiagnostics({

    initialized:
    diagnosticsState
    .initialized,

    runtimeHealthy:

      diagnosticsState
      .runtimeHealthy,

    healthScore:

      diagnosticsState
      .globalHealthScore,

    logs:

      diagnosticsState
      .logs
      .length,

    warnings:

      diagnosticsState
      .warnings
      .length,

    errors:

      diagnosticsState
      .errors
      .length,

    performance:

      diagnosticsState
      .performance
      .length,

    snapshots:

      diagnosticsState
      .snapshots
      .length,

    queue:

      diagnosticsState
      .queue
      .length,

    startedAt:
    diagnosticsState
    .startedAt,

    lastHealthCheckAt:

      diagnosticsState
      .lastHealthCheckAt

  });

}



// =====================================
// RESET
// =====================================

function resetDiagnosticsSystem(){

  stopDiagnosticsMonitoring();

  stopAutomaticSnapshots();

  stopDiagnosticsQueueProcessor();

  diagnosticsState
  .processingQueue =
  false;

  diagnosticsState.logs =
  [];

  diagnosticsState.errors =
  [];

  diagnosticsState.warnings =
  [];

  diagnosticsState.performance =
  [];

  diagnosticsState.snapshots =
  [];

  diagnosticsState.queue =
  [];

  diagnosticsState.performanceMetrics
  .clear();

  diagnosticsState.runtimeHealthy =
  true;

  diagnosticsState.globalHealthScore =
  100;

  diagnosticsState.lastHealthCheckAt =
  null;

  diagnosticsState.startedAt =
  Date.now();

  diagnosticsState.counters = {

    logs:0,

    warnings:0,

    errors:0,

    crashes:0,

    healthChecks:0,

    batches:0,

    queueProcessed:0

  };

  return true;

}



// =====================================
// INITIALIZE
// =====================================

async function initializeDiagnosticsSystem(){

  if(
    diagnosticsState.initialized
  ){

    return true;

  }

  registerGlobalErrorHandlers();

  startDiagnosticsQueueProcessor();

  startAutomaticSnapshots();

  startDiagnosticsMonitoring();

  diagnosticsState
  .initialized =
  true;

  await logDiagnosticInfo(
    "DIAGNOSTICS SYSTEM READY"
  );

  await emitDiagnosticsEvent(

    DIAGNOSTICS_EVENTS
    .INITIALIZED

  );

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const DiagnosticsRuntime =
Object.freeze({

  initialize:
  initializeDiagnosticsSystem,

  info:
  logDiagnosticInfo,

  warn:
  logDiagnosticWarning,

  error:
  logDiagnosticError,

  critical:
  logCriticalError,

  performance:
  trackPerformanceMetric,

  measure:
  measureAsyncPerformance,

  health:
  generateHealthReport,

  snapshot:
  createRuntimeSnapshot,

  snapshotState:
  getDiagnosticsSnapshot,

  export:
  exportDiagnosticsBundle,

  recover:
  recoverRuntimeHealth,

  stopMonitoring:
  stopDiagnosticsMonitoring,

  stopSnapshots:
  stopAutomaticSnapshots,

  stopQueue:
  stopDiagnosticsQueueProcessor,

  reset:
  resetDiagnosticsSystem

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.DiagnosticsRuntime =
  DiagnosticsRuntime;

  window.initializeDiagnosticsSystem =
  initializeDiagnosticsSystem;

  window.resetDiagnosticsSystem =
  resetDiagnosticsSystem;

  window.logDiagnosticInfo =
  logDiagnosticInfo;

  window.logDiagnosticWarning =
  logDiagnosticWarning;

  window.logDiagnosticError =
  logDiagnosticError;

  window.logCriticalError =
  logCriticalError;

}

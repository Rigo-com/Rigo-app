// =====================================
// RIGO AI
// DIAGNOSTICS SYSTEM
// ENTERPRISE OMEGA FINAL
// =====================================



// =====================================
// DIAGNOSTICS CONFIG
// =====================================

const DIAGNOSTICS_CONFIG =
Object.freeze({

  MAX_LOG_ENTRIES:1000,

  MAX_ERROR_ENTRIES:300,

  MAX_PERFORMANCE_ENTRIES:500,

  MAX_SNAPSHOT_ENTRIES:100,

  ENABLE_CONSOLE_LOGGING:true,

  ENABLE_PERFORMANCE_TRACKING:true,

  ENABLE_HEALTH_SCORING:true,

  ENABLE_RUNTIME_MONITORING:true

});



// =====================================
// DIAGNOSTICS STATE
// =====================================

const diagnosticsState =
Object.seal({

  initialized:false,

  globalHandlersRegistered:false,

  startedAt:Date.now(),

  lastHealthCheckAt:null,

  runtimeHealthy:true,

  globalHealthScore:100,

  logs:[],

  errors:[],

  warnings:[],

  performance:[],

  snapshots:[],

  counters:{

    logs:0,

    warnings:0,

    errors:0,

    crashes:0,

    healthChecks:0

  }

});



// =====================================
// LOG LEVELS
// =====================================

const DIAGNOSTIC_LEVELS =
Object.freeze({

  INFO:"info",

  WARN:"warn",

  ERROR:"error",

  CRITICAL:"critical"

});



// =====================================
// DEEP FREEZE
// =====================================

function deepFreezeDiagnostics(
  object
){

  if(
    !object ||
    typeof object !==
    "object" ||

    Object.isFrozen(
      object
    )
  ){

    return object;

  }

  Object
  .getOwnPropertyNames(
    object
  )
  .forEach((key) => {

    deepFreezeDiagnostics(
      object[key]
    );

  });

  return Object.freeze(
    object
  );

}



// =====================================
// SAFE METADATA
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
// SAFE PERFORMANCE NOW
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

  catch(error){

    console.error(error);

  }

  return Date.now();

}



// =====================================
// INITIALIZE DIAGNOSTICS
// =====================================

function initializeDiagnosticsSystem(){

  if(
    diagnosticsState.initialized
  ){

    return true;

  }

  registerGlobalErrorHandlers();

  diagnosticsState.initialized =
  true;

  logDiagnosticInfo(
    "DIAGNOSTICS SYSTEM READY"
  );

  return true;

}



// =====================================
// TIMESTAMP
// =====================================

function createDiagnosticTimestamp(){

  return Date.now();

}



// =====================================
// LOG ENTRY
// =====================================

function createDiagnosticEntry(
  level,
  message,
  metadata = null
){

  return deepFreezeDiagnostics({

    id:createMemoryId(),

    level:String(level),

    message:String(message),

    metadata:
    safeMetadataClone(
      metadata
    ),

    timestamp:
    createDiagnosticTimestamp()

  });

}



// =====================================
// SAFE ARRAY PUSH
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

function logDiagnosticInfo(
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

  pushDiagnosticEntry(

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

  return true;

}



// =====================================
// WARNING
// =====================================

function logDiagnosticWarning(
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

  pushDiagnosticEntry(

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

  return true;

}



// =====================================
// ERROR
// =====================================

function logDiagnosticError(
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

  pushDiagnosticEntry(

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

  return true;

}



// =====================================
// CRITICAL
// =====================================

function logCriticalError(
  message,
  metadata = null
){

  diagnosticsState
  .counters
  .crashes++;

  diagnosticsState
  .runtimeHealthy =
  false;

  return logDiagnosticError(
    message,
    metadata
  );

}



// =====================================
// RECOVER HEALTH
// =====================================

function recoverRuntimeHealth(){

  diagnosticsState
  .runtimeHealthy =
  true;

  return true;

}



// =====================================
// VALIDATE DURATION
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

  const metric =
  deepFreezeDiagnostics({

    id:createMemoryId(),

    metric:String(
      metricName
    ),

    duration:
    normalizeMetricDuration(
      duration
    ),

    metadata:
    safeMetadataClone(
      metadata
    ),

    timestamp:
    createDiagnosticTimestamp()

  });

  pushDiagnosticEntry(

    diagnosticsState
    .performance,

    metric,

    DIAGNOSTICS_CONFIG
    .MAX_PERFORMANCE_ENTRIES

  );

  return true;

}



// =====================================
// PERFORMANCE WRAPPER
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
// HEALTH SCORING
// =====================================

function calculateHealthScore(){

  if(

    !DIAGNOSTICS_CONFIG
    .ENABLE_HEALTH_SCORING

  ){

    return 100;

  }

  let score = 100;



  // ===================================
  // ERROR PENALTY
  // ===================================

  score -= Math.min(

    diagnosticsState
    .counters
    .errors * 2,

    40

  );



  // ===================================
  // CRITICAL PENALTY
  // ===================================

  score -= Math.min(

    diagnosticsState
    .counters
    .crashes * 10,

    40

  );



  // ===================================
  // WARNING PENALTY
  // ===================================

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
// RUNTIME SNAPSHOT
// =====================================

function createRuntimeSnapshot(){

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

  pushDiagnosticEntry(

    diagnosticsState
    .snapshots,

    snapshot,

    DIAGNOSTICS_CONFIG
    .MAX_SNAPSHOT_ENTRIES

  );

  return snapshot;

}



// =====================================
// HEALTH REPORT
// =====================================

function generateHealthReport(){

  const healthScore =
  calculateHealthScore();

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
// EXPORT DIAGNOSTICS
// =====================================

function exportDiagnosticsBundle(){

  return deepFreezeDiagnostics({

    exportedAt:
    Date.now(),

    health:

      generateHealthReport(),

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
// RESET DIAGNOSTICS
// =====================================

function resetDiagnosticsSystem(){

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

    healthChecks:0

  };

  return true;

}

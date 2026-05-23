// =====================================
// RIGO AI
// MEMORY DEBUG
// ENTERPRISE INFINITY ULTRA FINAL
// =====================================



// =====================================
// DEBUG CONFIG
// =====================================

const MEMORY_DEBUG =
Object.freeze({

  ENABLE_DEBUG:true,

  ENABLE_LOGS:true,

  ENABLE_PROFILING:true,

  ENABLE_TRACING:true,

  ENABLE_HEALTH_MONITOR:true,

  ENABLE_AUTO_REPAIR:true,

  ENABLE_SNAPSHOTS:true,

  ENABLE_BENCHMARKS:true,

  MAX_LOGS:5000,

  MAX_TRACES:2000,

  MAX_SNAPSHOTS:50,

  MAX_BENCHMARKS:1000,

  MAX_REPORT_WARNINGS:100,

  LOG_TRUNCATE_LENGTH:2000,

  SLOW_OPERATION_THRESHOLD:
  100,

  MEMORY_WARNING_THRESHOLD:
  50000

});



// =====================================
// DEBUG STATE
// =====================================

const memoryDebugState =
Object.seal({

  initialized:false,

  logs:[],

  traces:[],

  snapshots:[],

  warnings:[],

  criticalErrors:[],

  benchmarks:[],

  activeProfiles:
  new Map(),

  operationStats:
  new Map(),

  lastHealthReport:null,

  lastRepairAt:null,

  lastSnapshotAt:null,

  totalRepairs:0,

  totalWarnings:0,

  totalCriticalErrors:0

});



// =====================================
// DEBUG HELPERS
// =====================================

function isDebugEnabled(){

  return (
    MEMORY_DEBUG
    .ENABLE_DEBUG === true
  );

}



function createDebugTimestamp(){

  return Date.now();

}



function createDebugId(
  prefix = "debug"
){

  if(
    typeof createMemoryId ===
    "function"
  ){

    return createMemoryId();
  }

  return (

    String(prefix) +

    "_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



function truncateDebugText(
  text
){

  const normalized =
  String(text || "");

  if(

    normalized.length <=

    MEMORY_DEBUG
    .LOG_TRUNCATE_LENGTH

  ){

    return normalized;

  }

  return (

    normalized.slice(

      0,

      MEMORY_DEBUG
      .LOG_TRUNCATE_LENGTH

    )

    +

    "...[TRUNCATED]"

  );

}



// =====================================
// SAFE SERIALIZER
// =====================================

function safeDebugSerialize(
  value
){

  const visited =
  new WeakSet();

  try{

    return JSON.stringify(

      value,

      (key,current) => {

        if(

          typeof current ===
          "object"

          &&

          current !== null

        ){

          if(
            visited.has(
              current
            )
          ){

            return "[Circular]";
          }

          visited.add(
            current
          );

        }

        return current;

      }

    );

  }

  catch(error){

    return "[Unserializable]";

  }

}



// =====================================
// DEBUG LOG
// =====================================

function addMemoryDebugLog(
  level,
  message,
  metadata = {}
){

  if(
    !isDebugEnabled()
  ){

    return false;

  }

  const log = {

    id:createDebugId(
      "log"
    ),

    level:

      typeof normalizeMemoryString ===
      "function"

      ?

      normalizeMemoryString(
        level
      )

      :

      String(level || "")
      .trim()
      .toLowerCase(),

    message:
    truncateDebugText(
      message
    ),

    metadata:
    safeDebugSerialize(
      metadata
    ),

    timestamp:
    createDebugTimestamp()

  };

  memoryDebugState
  .logs
  .push(
    log
  );

  while(

    memoryDebugState
    .logs
    .length >

    MEMORY_DEBUG
    .MAX_LOGS

  ){

    memoryDebugState
    .logs
    .shift();

  }

  return true;

}



// =====================================
// TRACE
// =====================================

function addMemoryTrace(
  operation,
  metadata = {}
){

  if(

    !MEMORY_DEBUG
    .ENABLE_TRACING

  ){

    return false;

  }

  const trace = {

    id:createDebugId(
      "trace"
    ),

    operation:
    String(
      operation || ""
    ),

    metadata:
    safeDebugSerialize(
      metadata
    ),

    timestamp:
    Date.now()

  };

  memoryDebugState
  .traces
  .push(
    trace
  );

  while(

    memoryDebugState
    .traces
    .length >

    MEMORY_DEBUG
    .MAX_TRACES

  ){

    memoryDebugState
    .traces
    .shift();

  }

  return true;

}



// =====================================
// PROFILER
// =====================================

function startMemoryProfile(
  operation
){

  if(
    !MEMORY_DEBUG
    .ENABLE_PROFILING
  ){

    return null;

  }

  const profile = {

    operation:
    String(
      operation || ""
    ),

    startedAt:

      typeof performance !==
      "undefined"

      ?

      performance.now()

      :

      Date.now()

  };

  memoryDebugState
  .activeProfiles
  .set(
    operation,
    profile
  );

  return profile;

}



function endMemoryProfile(
  operation
){

  const profile =

    memoryDebugState
    .activeProfiles
    .get(
      operation
    );

  if(!profile){

    return null;

  }

  const endedAt =

    typeof performance !==
    "undefined"

    ?

    performance.now()

    :

    Date.now();

  const duration =
  endedAt -
  profile.startedAt;

  memoryDebugState
  .activeProfiles
  .delete(
    operation
  );

  if(

    duration >

    MEMORY_DEBUG
    .SLOW_OPERATION_THRESHOLD

  ){

    addMemoryDebugLog(

      "warn",

      `Slow operation: ${operation}`,

      {
        duration
      }

    );

  }

  const stats =

    memoryDebugState
    .operationStats
    .get(operation)

    ||

    {

      count:0,

      totalDuration:0,

      averageDuration:0

    };

  stats.count++;

  stats.totalDuration +=
  duration;

  stats.averageDuration =

    stats.totalDuration /
    stats.count;

  memoryDebugState
  .operationStats
  .set(
    operation,
    stats
  );

  return duration;

}



// =====================================
// MEMORY HEALTH
// =====================================

function analyzeMemoryHealth(){

  const warnings = [];

  const critical = [];

  if(
    typeof memoryState !==
    "object"
  ){

    return {

      score:0,

      warnings:[

        {
          type:"memory-state-missing"
        }

      ],

      critical:[],

      analyzedAt:
      Date.now()

    };

  }



  // ===================================
  // CORRUPTION
  // ===================================

  if(

    memoryState
    ?.tracking
    ?.corruptedIds
    ?.size > 0

  ){

    warnings.push({

      type:"corruption",

      count:

      memoryState
      .tracking
      .corruptedIds
      .size

    });

  }



  // ===================================
  // ORPHAN INDEXES
  // ===================================

  const indexedIds =
  new Set(

    memoryState
    ?.indexes
    ?.byId
    ?.keys?.()

    ||

    []

  );

  indexedIds.forEach((id) => {

    const exists =
    memoryState
    ?.memories
    ?.some?.((memory) => {

      return memory?.id === id;

    });

    if(!exists){

      warnings.push({

        type:"orphan-index",

        id

      });

    }

  });



  // ===================================
  // DUPLICATE IDS
  // ===================================

  const duplicateCheck =
  new Set();

  memoryState
  ?.memories
  ?.forEach?.((memory) => {

    if(!memory?.id){

      return;
    }

    if(
      duplicateCheck.has(
        memory.id
      )
    ){

      critical.push({

        type:"duplicate-id",

        id:memory.id

      });

    }

    duplicateCheck.add(
      memory.id
    );

  });



  // ===================================
  // CACHE PRESSURE
  // ===================================

  if(

    memoryState
    ?.cache
    ?.memories
    ?.size >

    MEMORY_DEBUG
    .MEMORY_WARNING_THRESHOLD

  ){

    warnings.push({

      type:"cache-pressure",

      size:

      memoryState
      .cache
      .memories
      .size

    });

  }

  memoryDebugState
  .warnings = warnings;

  memoryDebugState
  .criticalErrors =
  critical;

  memoryDebugState
  .totalWarnings =
  warnings.length;

  memoryDebugState
  .totalCriticalErrors =
  critical.length;

  const report = {

    score:

      Math.max(

        0,

        100 -

        (
          warnings.length * 5
        )

        -

        (
          critical.length * 20
        )

      ),

    warnings:
    warnings.slice(

      0,

      MEMORY_DEBUG
      .MAX_REPORT_WARNINGS

    ),

    critical:
    critical.slice(

      0,

      MEMORY_DEBUG
      .MAX_REPORT_WARNINGS

    ),

    analyzedAt:
    Date.now()

  };

  memoryDebugState
  .lastHealthReport =
  report;

  return report;

}



// =====================================
// AUTO REPAIR
// =====================================

function attemptMemoryRepair(){

  if(

    !MEMORY_DEBUG
    .ENABLE_AUTO_REPAIR

  ){

    return false;

  }

  try{

    if(
      typeof cleanupOrphanIndexes ===
      "function"
    ){

      cleanupOrphanIndexes();
    }

    if(
      typeof repairMemoryIndexes ===
      "function"
    ){

      repairMemoryIndexes();
    }

    if(
      typeof rebuildDirtySummaries ===
      "function"
    ){

      rebuildDirtySummaries();
    }

    if(
      typeof rebuildMemoryEmbeddings ===
      "function"
    ){

      rebuildMemoryEmbeddings();
    }

    if(
      typeof updateMemoryMetrics ===
      "function"
    ){

      updateMemoryMetrics();
    }

    memoryDebugState
    .lastRepairAt =
    Date.now();

    memoryDebugState
    .totalRepairs++;

    addMemoryDebugLog(

      "info",

      "Memory repair completed"

    );

    return true;

  }

  catch(error){

    addMemoryDebugLog(

      "error",

      "Repair failed",

      {
        error:
        error?.message
      }

    );

    return false;

  }

}



// =====================================
// SNAPSHOT
// =====================================

function createMemorySnapshot(){

  if(

    !MEMORY_DEBUG
    .ENABLE_SNAPSHOTS

  ){

    return null;

  }

  const snapshot = {

    id:createDebugId(
      "snapshot"
    ),

    createdAt:
    Date.now(),

    state:

      typeof cloneMemoryObject ===
      "function"

      ?

      cloneMemoryObject({

        memories:
        memoryState
        ?.memories,

        metrics:
        memoryState
        ?.metrics,

        health:
        memoryState
        ?.health,

        tracking:
        {

          corruptedIds:[

            ...(memoryState
            ?.tracking
            ?.corruptedIds

            ||

            [])

          ]

        }

      })

      :

      null

  };

  memoryDebugState
  .snapshots
  .push(
    snapshot
  );

  while(

    memoryDebugState
    .snapshots
    .length >

    MEMORY_DEBUG
    .MAX_SNAPSHOTS

  ){

    memoryDebugState
    .snapshots
    .shift();

  }

  memoryDebugState
  .lastSnapshotAt =
  Date.now();

  return snapshot;

}



// =====================================
// BENCHMARK
// =====================================

async function benchmarkMemoryOperation(
  operation,
  callback
){

  const startedAt =

    typeof performance !==
    "undefined"

    ?

    performance.now()

    :

    Date.now();

  try{

    const result =
    await Promise.resolve(
      callback()
    );

    const duration =

      (
        typeof performance !==
        "undefined"

        ?

        performance.now()

        :

        Date.now()

      ) -

      startedAt;

    const benchmark = {

      id:createDebugId(
        "benchmark"
      ),

      operation,

      duration,

      success:true,

      timestamp:
      Date.now()

    };

    memoryDebugState
    .benchmarks
    .push(
      benchmark
    );

    while(

      memoryDebugState
      .benchmarks
      .length >

      MEMORY_DEBUG
      .MAX_BENCHMARKS

    ){

      memoryDebugState
      .benchmarks
      .shift();

    }

    return {

      result,

      duration

    };

  }

  catch(error){

    const duration =

      (
        typeof performance !==
        "undefined"

        ?

        performance.now()

        :

        Date.now()

      ) -

      startedAt;

    memoryDebugState
    .benchmarks
    .push({

      id:createDebugId(
        "benchmark"
      ),

      operation,

      duration,

      success:false,

      error:
      error?.message,

      timestamp:
      Date.now()

    });

    throw error;

  }

}



// =====================================
// MEMORY REPORT
// =====================================

function generateMemoryDebugReport(){

  const health =
  analyzeMemoryHealth();

  return {

    generatedAt:
    Date.now(),

    score:
    health.score,

    warnings:
    health.warnings,

    critical:
    health.critical,

    diagnostics:
    {

      memory:

        typeof getMemoryDiagnostics ===
        "function"

        ?

        getMemoryDiagnostics()

        :

        null,

      embeddings:

        typeof getMemoryEmbeddingDiagnostics ===
        "function"

        ?

        getMemoryEmbeddingDiagnostics()

        :

        null,

      summaries:

        typeof getMemorySummaryDiagnostics ===
        "function"

        ?

        getMemorySummaryDiagnostics()

        :

        null,

      sync:

        typeof getMemorySyncDiagnostics ===
        "function"

        ?

        getMemorySyncDiagnostics()

        :

        null,

      export:

        typeof getMemoryExportDiagnostics ===
        "function"

        ?

        getMemoryExportDiagnostics()

        :

        null,

      security:

        typeof getMemorySecurityDiagnostics ===
        "function"

        ?

        getMemorySecurityDiagnostics()

        :

        null,

      events:

        typeof getMemoryEventDiagnostics ===
        "function"

        ?

        getMemoryEventDiagnostics()

        :

        null

    },

    runtime:
    {

      activeOperations:

        memoryState
        ?.runtime
        ?.activeOperations,

      initialized:

        memoryState
        ?.initialized,

      corrupted:

        memoryState
        ?.runtime
        ?.corrupted

    }

  };

}



// =====================================
// DEBUG RESET
// =====================================

function clearMemoryDebugData(){

  memoryDebugState
  .logs = [];

  memoryDebugState
  .traces = [];

  memoryDebugState
  .warnings = [];

  memoryDebugState
  .criticalErrors = [];

  memoryDebugState
  .benchmarks = [];

  memoryDebugState
  .snapshots = [];

  memoryDebugState
  .activeProfiles
  .clear();

  memoryDebugState
  .operationStats
  .clear();

  return true;

}



// =====================================
// DEBUG DIAGNOSTICS
// =====================================

function getMemoryDebugDiagnostics(){

  return Object.freeze({

    initialized:
    memoryDebugState
    .initialized,

    logs:
    memoryDebugState
    .logs
    .length,

    traces:
    memoryDebugState
    .traces
    .length,

    snapshots:
    memoryDebugState
    .snapshots
    .length,

    warnings:
    memoryDebugState
    .warnings
    .length,

    criticalErrors:

      memoryDebugState
      .criticalErrors
      .length,

    benchmarks:
    memoryDebugState
    .benchmarks
    .length,

    activeProfiles:

      memoryDebugState
      .activeProfiles
      .size,

    totalRepairs:
    memoryDebugState
    .totalRepairs,

    totalWarnings:
    memoryDebugState
    .totalWarnings,

    totalCriticalErrors:

      memoryDebugState
      .totalCriticalErrors,

    lastRepairAt:
    memoryDebugState
    .lastRepairAt,

    lastSnapshotAt:
    memoryDebugState
    .lastSnapshotAt

  });

}

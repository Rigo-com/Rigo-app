// =====================================
// RIGO AI
// MEMORY DEBUG
// OPTIMIZED FINAL EDITION
// =====================================



// =====================================
// DEBUG CONFIG
// =====================================

const MEMORY_DEBUG_CONFIG =
Object.freeze({

  ENABLE_DEBUG:true,

  ENABLE_LOGS:true,

  ENABLE_PROFILING:true,

  ENABLE_HEALTH_MONITOR:true,

  ENABLE_AUTO_REPAIR:true,

  ENABLE_SNAPSHOTS:true,

  MAX_ENTRIES:3000,

  MAX_SNAPSHOTS:20,

  MAX_WARNINGS:100,

  LOG_TRUNCATE_LENGTH:1000,

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

  entries:[],

  snapshots:[],

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
// HELPERS
// =====================================

function isDebugEnabled(){

  return (
    MEMORY_DEBUG_CONFIG
    .ENABLE_DEBUG === true
  );

}



function createDebugTimestamp(){

  return Date.now();

}



function createDebugId(
  prefix = "debug"
){

  return (

    typeof createMemoryId ===
    "function"

    ?

    createMemoryId()

    :

    `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2,8)}`

  );

}



function truncateDebugText(
  value
){

  const text =
  String(value ?? "");

  if(

    text.length <=

    MEMORY_DEBUG_CONFIG
    .LOG_TRUNCATE_LENGTH

  ){

    return text;

  }

  return (

    text.slice(

      0,

      MEMORY_DEBUG_CONFIG
      .LOG_TRUNCATE_LENGTH

    ) +

    "...[TRUNCATED]"

  );

}



function pruneDebugEntries(){

  while(

    memoryDebugState
    .entries
    .length >

    MEMORY_DEBUG_CONFIG
    .MAX_ENTRIES

  ){

    memoryDebugState
    .entries
    .shift();

  }

}



// =====================================
// DEBUG ENTRY
// =====================================

function addMemoryDebugEntry(
  type,
  message,
  metadata = {}
){

  if(
    !isDebugEnabled()
  ){

    return false;

  }

  memoryDebugState
  .entries
  .push({

    id:createDebugId(type),

    type:
    normalizeMemoryString?.(
      type
    ) || "log",

    message:
    truncateDebugText(
      message
    ),

    metadata,

    timestamp:
    createDebugTimestamp()

  });

  pruneDebugEntries();

  return true;

}



// =====================================
// DEBUG LOG
// =====================================

function addMemoryDebugLog(
  level,
  message,
  metadata = {}
){

  return addMemoryDebugEntry(

    level,

    message,

    metadata

  );

}



// =====================================
// TRACE
// =====================================

function addMemoryTrace(
  operation,
  metadata = {}
){

  return addMemoryDebugEntry(

    "trace",

    operation,

    metadata

  );

}



// =====================================
// PROFILING
// =====================================

function startMemoryProfile(
  operation
){

  if(

    !MEMORY_DEBUG_CONFIG
    .ENABLE_PROFILING

  ){

    return null;

  }

  const profileId =
  createDebugId(
    "profile"
  );

  memoryDebugState
  .activeProfiles
  .set(profileId,{

    operation:
    String(operation || ""),

    startedAt:

      typeof performance !==
      "undefined"

      ?

      performance.now()

      :

      Date.now()

  });

  return profileId;

}



function endMemoryProfile(
  profileId
){

  const profile =

    memoryDebugState
    .activeProfiles
    .get(profileId);

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
  .delete(profileId);

  const stats =

    memoryDebugState
    .operationStats
    .get(
      profile.operation
    )

    ||

    {

      count:0,

      totalDuration:0

    };

  stats.count++;

  stats.totalDuration +=
  duration;

  memoryDebugState
  .operationStats
  .set(
    profile.operation,
    stats
  );

  if(

    duration >

    MEMORY_DEBUG_CONFIG
    .SLOW_OPERATION_THRESHOLD

  ){

    addMemoryDebugEntry(

      "warn",

      `Slow operation: ${profile.operation}`,

      {
        duration
      }

    );

  }

  return duration;

}



// =====================================
// BENCHMARK
// =====================================

async function benchmarkMemoryOperation(
  operation,
  callback
){

  const profileId =
  startMemoryProfile(
    operation
  );

  try{

    const result =
    await Promise.resolve(
      callback()
    );

    const duration =
    endMemoryProfile(
      profileId
    );

    addMemoryDebugEntry(

      "benchmark",

      operation,

      {
        duration,
        success:true
      }

    );

    return {

      result,
      duration

    };

  }

  catch(error){

    endMemoryProfile(
      profileId
    );

    addMemoryDebugEntry(

      "error",

      operation,

      {
        success:false,
        error:error?.message
      }

    );

    throw error;

  }

}



// =====================================
// HEALTH ANALYSIS
// =====================================

function analyzeMemoryHealth(){

  const warnings = [];

  const critical = [];

  if(
    !memoryState
  ){

    return {

      score:0,

      warnings:[
        {
          type:"missing-state"
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

  const corruptedCount =

    memoryState
    ?.tracking
    ?.corruptedIds
    ?.size || 0;

  if(
    corruptedCount > 0
  ){

    warnings.push({

      type:"corruption",

      count:
      corruptedCount

    });

  }



  // ===================================
  // DUPLICATES
  // ===================================

  const ids =
  new Set();

  safeMemoryArray(
    memoryState?.memories
  )
  .forEach((memory) => {

    if(
      !memory?.id
    ){

      return;
    }

    if(
      ids.has(memory.id)
    ){

      critical.push({

        type:"duplicate-id",

        id:memory.id

      });

    }

    ids.add(memory.id);

  });



  // ===================================
  // CACHE PRESSURE
  // ===================================

  const cacheSize =

    memoryState
    ?.cache
    ?.memories
    ?.size || 0;

  if(

    cacheSize >

    MEMORY_DEBUG_CONFIG
    .MEMORY_WARNING_THRESHOLD

  ){

    warnings.push({

      type:"cache-pressure",

      size:cacheSize

    });

  }

  const report = {

    score:

      Math.max(

        0,

        100 -

        (warnings.length * 5) -

        (critical.length * 20)

      ),

    warnings:
    warnings.slice(

      0,

      MEMORY_DEBUG_CONFIG
      .MAX_WARNINGS

    ),

    critical:
    critical.slice(

      0,

      MEMORY_DEBUG_CONFIG
      .MAX_WARNINGS

    ),

    analyzedAt:
    Date.now()

  };

  memoryDebugState
  .lastHealthReport =
  report;

  memoryDebugState
  .totalWarnings =
  warnings.length;

  memoryDebugState
  .totalCriticalErrors =
  critical.length;

  return report;

}



// =====================================
// AUTO REPAIR
// =====================================

function attemptMemoryRepair(){

  if(

    !MEMORY_DEBUG_CONFIG
    .ENABLE_AUTO_REPAIR

  ){

    return false;

  }

  try{

    repairMemoryIndexes?.();

    rebuildDirtySummaries?.();

    rebuildMemoryEmbeddings?.();

    updateMemoryMetrics?.();

    cleanupOrphanIndexes?.();

    memoryDebugState
    .lastRepairAt =
    Date.now();

    memoryDebugState
    .totalRepairs++;

    addMemoryDebugEntry(

      "info",

      "Memory repair completed"

    );

    return true;

  }

  catch(error){

    addMemoryDebugEntry(

      "error",

      "Repair failed",

      {
        error:error?.message
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

    !MEMORY_DEBUG_CONFIG
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

    metrics:
    cloneMemoryObject?.({

      memoryCount:

        memoryState
        ?.memories
        ?.length || 0,

      corrupted:

        memoryState
        ?.tracking
        ?.corruptedIds
        ?.size || 0,

      cacheSize:

        memoryState
        ?.cache
        ?.memories
        ?.size || 0

    })

  };

  memoryDebugState
  .snapshots
  .push(snapshot);

  while(

    memoryDebugState
    .snapshots
    .length >

    MEMORY_DEBUG_CONFIG
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
// DEBUG REPORT
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
      getMemoryDiagnostics?.(),

      embeddings:
      getMemoryEmbeddingDiagnostics?.(),

      summaries:
      getMemorySummaryDiagnostics?.(),

      export:
      getMemoryExportDiagnostics?.(),

      security:
      getMemorySecurityDiagnostics?.(),

      cleanup:
      getMemoryCleanupDiagnostics?.()

    },

    runtime:
    {

      initialized:
      memoryState
      ?.initialized,

      activeOperations:

        memoryState
        ?.runtime
        ?.activeOperations

    }

  };

}



// =====================================
// RESET
// =====================================

function clearMemoryDebugData(){

  memoryDebugState
  .entries = [];

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
// DIAGNOSTICS
// =====================================

function getMemoryDebugDiagnostics(){

  return Object.freeze({

    initialized:
    memoryDebugState
    .initialized,

    entries:
    memoryDebugState
    .entries
    .length,

    snapshots:
    memoryDebugState
    .snapshots
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

// =====================================
// RIGO AI
// MEMORY CONSTANTS
// ENTERPRISE GOD FINAL
// =====================================



// =====================================
// MEMORY VERSION
// =====================================

const MEMORY_VERSION =
Object.freeze(
  "1.0.0"
);



// =====================================
// NORMALIZE VALUE
// =====================================

function normalizeMemoryValue(
  value
){

  return String(
    value ?? ""
  )
  .trim()
  .toLowerCase();

}



// =====================================
// MEMORY TYPES
// =====================================

const MEMORY_TYPES =
deepFreeze([

  "conversation",

  "summary",

  "project",

  "preference",

  "personality",

  "goal",

  "task",

  "temporary",

  "session",

  "system",

  "knowledge",

  "fact",

  "profile"

]);



const MEMORY_TYPE_SET =
Object.freeze(
  new Set(
    MEMORY_TYPES
  )
);



// =====================================
// MEMORY PRIORITIES
// =====================================

const MEMORY_PRIORITIES =
deepFreeze({

  LOW:
  "low",

  NORMAL:
  "normal",

  HIGH:
  "high",

  CRITICAL:
  "critical"

});



const MEMORY_PRIORITY_SET =
Object.freeze(
  new Set(
    Object.values(
      MEMORY_PRIORITIES
    )
  )
);



// =====================================
// MEMORY PRIORITY WEIGHTS
// =====================================

const MEMORY_PRIORITY_WEIGHTS =
deepFreeze({

  low:
  0.2,

  normal:
  0.4,

  high:
  0.7,

  critical:
  1.0

});



// =====================================
// MEMORY EXPIRATION TYPES
// =====================================

const MEMORY_EXPIRATION =
deepFreeze({

  SESSION:
  "session",

  DAILY:
  "daily",

  WEEKLY:
  "weekly",

  MONTHLY:
  "monthly",

  PERMANENT:
  "permanent"

});



const MEMORY_EXPIRATION_SET =
Object.freeze(
  new Set(
    Object.values(
      MEMORY_EXPIRATION
    )
  )
);



// =====================================
// MEMORY SCORE WEIGHTS
// =====================================

const MEMORY_SCORE_WEIGHTS =
deepFreeze({

  PINNED:
  1.0,

  CRITICAL_PRIORITY:
  0.9,

  HIGH_PRIORITY:
  0.7,

  NORMAL_PRIORITY:
  0.4,

  LOW_PRIORITY:
  0.2,

  RECENT_ACCESS:
  0.5,

  FREQUENT_ACCESS:
  0.4,

  RECENT_UPDATE:
  0.3,

  SUMMARY:
  0.2

});



// =====================================
// MEMORY DEFAULTS
// =====================================

const MEMORY_DEFAULTS =
deepFreeze({

  TYPE:
  "conversation",

  PRIORITY:
  MEMORY_PRIORITIES.NORMAL,

  CATEGORY:
  "chat",

  STATE:
  "active",

  EXPIRATION:
  MEMORY_EXPIRATION.PERMANENT,

  PINNED:
  false,

  ARCHIVED:
  false,

  TAGS:
  [],

  METADATA:
  {}

});



// =====================================
// MEMORY LIMITS
// =====================================

const MEMORY_LIMITS =
deepFreeze({



  // ===================================
  // TOTAL LIMITS
  // ===================================

  MAX_TOTAL_MEMORIES:
  5000,

  MAX_PINNED_MEMORIES:
  100,

  MAX_SESSION_MEMORIES:
  500,



  // ===================================
  // CONTENT
  // ===================================

  MIN_CONTENT_LENGTH:
  1,

  MAX_CONTENT_LENGTH:
  10000,

  MAX_SUMMARY_LENGTH:
  2000,

  MAX_TITLE_LENGTH:
  120,

  MAX_METADATA_SIZE:
  5000,

  MAX_TAGS:
  20,

  MAX_TAG_LENGTH:
  40,



  // ===================================
  // CONTEXT
  // ===================================

  MAX_CONTEXT_MEMORIES:
  50,

  MAX_CONTEXT_CHARACTERS:
  50000,

  MAX_CONTEXT_TOKENS:
  12000,



  // ===================================
  // SEARCH
  // ===================================

  MAX_SEARCH_RESULTS:
  100,



  // ===================================
  // IMPORT / EXPORT
  // ===================================

  MAX_EXPORT_SIZE:
  10 * 1024 * 1024,

  MAX_IMPORT_ITEMS:
  5000,



  // ===================================
  // STORAGE
  // ===================================

  AUTO_SAVE_DELAY:
  300,



  // ===================================
  // CACHE
  // ===================================

  MAX_CACHE_MEMORY_SIZE:
  5 * 1024 * 1024,



  // ===================================
  // CLEANUP
  // ===================================

  CLEANUP_BATCH_SIZE:
  100,

  MAX_MEMORY_AGE_DAYS:
  3650,

  MAX_UNUSED_DAYS:
  365

});



// =====================================
// MEMORY STORAGE
// =====================================

const MEMORY_STORAGE_KEYS =
deepFreeze({

  MEMORIES:
  "rigo_memories",

  INDEX:
  "rigo_memory_index",

  SETTINGS:
  "rigo_memory_settings",

  CACHE:
  "rigo_memory_cache",

  BACKUP:
  "rigo_memory_backup",

  STATS:
  "rigo_memory_stats",

  VERSION:
  "rigo_memory_version"

});



// =====================================
// MEMORY STATES
// =====================================

const MEMORY_STATES =
deepFreeze([

  "active",

  "archived",

  "deleted"

]);



const MEMORY_STATE_SET =
Object.freeze(
  new Set(
    MEMORY_STATES
  )
);



// =====================================
// MEMORY CATEGORIES
// =====================================

const MEMORY_CATEGORIES =
deepFreeze([

  "chat",

  "user",

  "assistant",

  "project",

  "system",

  "settings",

  "context",

  "history",

  "memory",

  "analytics"

]);



const MEMORY_CATEGORY_SET =
Object.freeze(
  new Set(
    MEMORY_CATEGORIES
  )
);



// =====================================
// MEMORY TAGS
// =====================================

const RESERVED_MEMORY_TAGS =
deepFreeze([

  "pinned",

  "favorite",

  "recent",

  "important",

  "system",

  "temporary"

]);



const RESERVED_MEMORY_TAG_SET =
Object.freeze(
  new Set(
    RESERVED_MEMORY_TAGS
  )
);



// =====================================
// MEMORY SORT OPTIONS
// =====================================

const MEMORY_SORT_OPTIONS =
deepFreeze([

  "createdAt",

  "updatedAt",

  "lastAccessedAt",

  "score",

  "priority",

  "accessCount"

]);



const MEMORY_SORT_OPTION_SET =
Object.freeze(
  new Set(
    MEMORY_SORT_OPTIONS
  )
);



// =====================================
// MEMORY SEARCH MODES
// =====================================

const MEMORY_SEARCH_MODES =
deepFreeze([

  "exact",

  "partial",

  "tag",

  "category"

]);



const MEMORY_SEARCH_MODE_SET =
Object.freeze(
  new Set(
    MEMORY_SEARCH_MODES
  )
);



// =====================================
// MEMORY CLEANUP RULES
// =====================================

const MEMORY_CLEANUP_RULES =
deepFreeze({

  REMOVE_EXPIRED:
  true,

  REMOVE_DUPLICATES:
  true,

  REMOVE_EMPTY:
  true,

  REMOVE_UNUSED:
  true,

  COMPRESS_SUMMARIES:
  true

});



// =====================================
// MEMORY DEBUG
// =====================================

const MEMORY_DEBUG =
deepFreeze({

  ENABLE_LOGS:
  false,

  ENABLE_WARNINGS:
  true,

  ENABLE_PERFORMANCE:
  false,

  ENABLE_DEV_TOOLS:
  false,

  ENABLE_MEMORY_TRACE:
  false,

  ENABLE_STRICT_VALIDATION:
  true

});



// =====================================
// MEMORY CACHE
// =====================================

const MEMORY_CACHE =
deepFreeze({

  ENABLED:
  true,

  ENABLE_MEMORY_PRELOAD:
  true,

  ENABLE_CONTEXT_CACHE:
  true,

  MAX_CACHE_ITEMS:
  1000,

  CACHE_TTL:
  5 * 60 * 1000

});



// =====================================
// MEMORY CONTEXT
// =====================================

const MEMORY_CONTEXT =
deepFreeze({

  ENABLE_SMART_SELECTION:
  true,

  ENABLE_PRIORITY_BOOST:
  true,

  ENABLE_RELEVANCE_SCORING:
  true,

  ENABLE_SUMMARIZATION:
  true,

  ENABLE_CONTEXT_CACHE:
  true,

  MIN_RELEVANCE_SCORE:
  0.3

});



// =====================================
// MEMORY EXPORT FORMATS
// =====================================

const MEMORY_EXPORT_FORMATS =
deepFreeze([

  "json",

  "txt"

]);



const MEMORY_EXPORT_FORMAT_SET =
Object.freeze(
  new Set(
    MEMORY_EXPORT_FORMATS
  )
);



// =====================================
// MEMORY LOOKUP HELPERS
// =====================================

function isValidMemoryType(
  type
){

  return MEMORY_TYPE_SET
  .has(
    normalizeMemoryValue(
      type
    )
  );

}



function isValidMemoryPriority(
  priority
){

  return MEMORY_PRIORITY_SET
  .has(
    normalizeMemoryValue(
      priority
    )
  );

}



function isValidMemoryExpiration(
  expiration
){

  return MEMORY_EXPIRATION_SET
  .has(
    normalizeMemoryValue(
      expiration
    )
  );

}



function isValidMemoryState(
  state
){

  return MEMORY_STATE_SET
  .has(
    normalizeMemoryValue(
      state
    )
  );

}



function isValidMemoryCategory(
  category
){

  return MEMORY_CATEGORY_SET
  .has(
    normalizeMemoryValue(
      category
    )
  );

}



function isValidMemorySearchMode(
  mode
){

  return MEMORY_SEARCH_MODE_SET
  .has(
    normalizeMemoryValue(
      mode
    )
  );

}



function isValidMemorySortOption(
  option
){

  return MEMORY_SORT_OPTION_SET
  .has(
    normalizeMemoryValue(
      option
    )
  );

}



function isValidMemoryExportFormat(
  format
){

  return MEMORY_EXPORT_FORMAT_SET
  .has(
    normalizeMemoryValue(
      format
    )
  );

}



// =====================================
// MEMORY MAIN CONFIG
// =====================================

const MEMORY_CONFIG =
deepFreeze({

  VERSION:
  MEMORY_VERSION,

  TYPES:
  [...MEMORY_TYPES],

  PRIORITIES:
  MEMORY_PRIORITIES,

  PRIORITY_WEIGHTS:
  MEMORY_PRIORITY_WEIGHTS,

  EXPIRATION:
  MEMORY_EXPIRATION,

  DEFAULTS:
  MEMORY_DEFAULTS,

  LIMITS:
  MEMORY_LIMITS,

  STORAGE:
  MEMORY_STORAGE_KEYS,

  CACHE:
  MEMORY_CACHE,

  CONTEXT:
  MEMORY_CONTEXT,

  DEBUG:
  MEMORY_DEBUG,

  CLEANUP:
  MEMORY_CLEANUP_RULES,

  STATES:
  [...MEMORY_STATES],

  CATEGORIES:
  [...MEMORY_CATEGORIES],

  SEARCH_MODES:
  [...MEMORY_SEARCH_MODES],

  EXPORT_FORMATS:
  [...MEMORY_EXPORT_FORMATS]

});

// =====================================
// RIGO AI
// MEMORY TYPES
// ENTERPRISE INFINITY ULTRA FINAL
// PATCHED + STABILIZED
// =====================================



// =====================================
// SAFE FREEZE
// =====================================

const freezeMemory =
typeof deepFreeze ===
"function"

? deepFreeze

: Object.freeze;



// =====================================
// TYPES CONFIG
// =====================================

const MEMORY_TYPES_CONFIG =
Object.freeze({

  ENABLE_IMMUTABLE_FREEZE:true,

  ENABLE_DEV_FREEZE:false,

  ENABLE_CHECKSUMS:true,

  ENABLE_SANITIZATION:true,

  ENABLE_SCHEMA_VERSIONING:true,

  MAX_RELATION_DEPTH:10,

  LIGHTWEIGHT_MODE:false,

  SCHEMA_VERSION:"1.0.0"

});



// =====================================
// MEMORY ID
// =====================================

function createMemoryId(){

  if(

    typeof crypto !==
    "undefined"

    &&

    typeof crypto.randomUUID ===
    "function"

  ){

    return (

      "memory_" +

      crypto.randomUUID()

    );

  }

  return (

    "memory_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



// =====================================
// MEMORY TIMESTAMPS
// =====================================

function createMemoryTimestamps(){

  const timestamp =
  Date.now();

  return {

    createdAt:
    timestamp,

    updatedAt:
    timestamp

  };

}



// =====================================
// NORMALIZE STRING
// =====================================

function normalizeMemoryString(
  value,
  fallback = ""
){

  return String(
    value ?? fallback
  )

  .normalize("NFKC")

  .replace(
    /[\u0000-\u001F\u007F]/g,
    " "
  )

  .replace(
    /\s+/g,
    " "
  )

  .trim();

}



// =====================================
// NORMALIZE VALUE
// =====================================

function normalizeMemoryValue(
  value
){

  return normalizeMemoryString(
    value
  )
  .toLowerCase();

}



// =====================================
// NORMALIZE CONTENT
// =====================================

function normalizeMemoryContent(
  content
){

  return normalizeMemoryString(
    content
  );

}



// =====================================
// SAFE DEEP FREEZE
// =====================================

function deepFreezeMemoryObject(
  value,
  visited = new WeakSet()
){

  if(

    !value ||

    typeof value !==
    "object"

  ){

    return value;

  }

  if(
    visited.has(value)
  ){

    return value;

  }

  visited.add(
    value
  );

  Object.freeze(
    value
  );

  Object.values(value)
  .forEach((nestedValue) => {

    if(

      nestedValue &&

      typeof nestedValue ===
      "object"

    ){

      deepFreezeMemoryObject(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



// =====================================
// MEMORY HASH
// =====================================

async function createSafeMemoryHash(
  payload
){

  try{

    if(
      typeof createMemoryHash ===
      "function"
    ){

      return await createMemoryHash(
        payload
      );

    }

    return btoa(
      unescape(
        encodeURIComponent(
          payload
        )
      )
    );

  }

  catch(error){

    return null;

  }

}



// =====================================
// MEMORY FINGERPRINT
// =====================================

async function createMemoryFingerprint(
  memory
){

  try{

    if(

      !MEMORY_TYPES_CONFIG
      .ENABLE_CHECKSUMS

    ){

      return null;

    }

    return await createSafeMemoryHash(

      JSON.stringify({

        id:memory.id,

        title:memory.title,

        content:memory.content,

        updatedAt:
        memory.updatedAt,

        version:
        memory.version

      })

    );

  }

  catch(error){

    return null;

  }

}



// =====================================
// NORMALIZE PRIORITY
// =====================================

function normalizeMemoryPriority(
  priority
){

  const normalizedPriority =

    normalizeMemoryValue(
      priority
    );

  if(

    typeof MEMORY_PRIORITIES ===
    "undefined"

  ){

    return "normal";

  }

  if(
    !Object.values(
      MEMORY_PRIORITIES
    )
    .includes(
      normalizedPriority
    )
  ){

    return MEMORY_DEFAULTS
    ?.PRIORITY ||

    "normal";

  }

  return normalizedPriority;

}



// =====================================
// NORMALIZE CATEGORY
// =====================================

function normalizeMemoryCategory(
  category
){

  const normalizedCategory =

    normalizeMemoryValue(
      category
    );

  if(

    typeof isValidMemoryCategory !==
    "function"

  ){

    return normalizedCategory ||
    "chat";

  }

  if(
    !isValidMemoryCategory(
      normalizedCategory
    )
  ){

    return MEMORY_DEFAULTS
    ?.CATEGORY ||

    "chat";

  }

  return normalizedCategory;

}



// =====================================
// NORMALIZE TYPE
// =====================================

function normalizeMemoryType(
  type
){

  const normalizedType =

    normalizeMemoryValue(
      type
    );

  if(

    typeof isValidMemoryType !==
    "function"

  ){

    return normalizedType ||
    "conversation";

  }

  if(
    !isValidMemoryType(
      normalizedType
    )
  ){

    return MEMORY_DEFAULTS
    ?.TYPE ||

    "conversation";

  }

  return normalizedType;

}



// =====================================
// NORMALIZE STATE
// =====================================

function normalizeMemoryState(
  state
){

  const normalizedState =

    normalizeMemoryValue(
      state
    );

  if(

    typeof isValidMemoryState !==
    "function"

  ){

    return normalizedState ||
    "active";

  }

  if(
    !isValidMemoryState(
      normalizedState
    )
  ){

    return MEMORY_DEFAULTS
    ?.STATE ||

    "active";

  }

  return normalizedState;

}



// =====================================
// NORMALIZE EXPIRATION
// =====================================

function normalizeMemoryExpiration(
  expiration
){

  const normalizedExpiration =

    normalizeMemoryValue(
      expiration
    );

  if(

    typeof MEMORY_EXPIRATION ===
    "undefined"

  ){

    return "permanent";

  }

  if(

    !Object.values(
      MEMORY_EXPIRATION
    )
    .includes(
      normalizedExpiration
    )

  ){

    return MEMORY_DEFAULTS
    ?.EXPIRATION ||

    "permanent";

  }

  return normalizedExpiration;

}



// =====================================
// NORMALIZE EXPIRES AT
// =====================================

function normalizeMemoryExpiresAt(
  expiresAt
){

  if(
    expiresAt == null
  ){

    return null;

  }

  const timestamp =
  Number(expiresAt);

  if(

    !Number.isFinite(
      timestamp
    )

    ||

    timestamp <= 0

  ){

    return null;

  }

  return timestamp;

}



// =====================================
// NORMALIZE TAGS
// =====================================

function normalizeMemoryTags(
  tags
){

  if(
    !Array.isArray(tags)
  ){

    return [];
  }

  const maxTagLength =

    MEMORY_LIMITS
    ?.MAX_TAG_LENGTH ||

    40;

  const maxTags =

    MEMORY_LIMITS
    ?.MAX_TAGS ||

    20;

  const normalizedTags =

    tags
    .map((tag) => {

      return normalizeMemoryValue(
        tag
      );

    })
    .filter((tag) => {

      return (
        tag &&
        tag.length <=
        maxTagLength
      );

    });

  return [

    ...new Set(
      normalizedTags
    )

  ]
  .slice(
    0,
    maxTags
  );

}



// =====================================
// NORMALIZE METADATA
// =====================================

function normalizeMemoryMetadata(
  metadata
){

  if(

    !metadata ||

    typeof metadata !==
    "object" ||

    Array.isArray(metadata)

  ){

    return {};
  }

  try{

    const serialized =
    JSON.stringify(
      metadata
    );

    if(

      serialized.length >

      (
        MEMORY_LIMITS
        ?.MAX_METADATA_SIZE ||

        5000
      )

    ){

      return {};
    }

    return JSON.parse(
      serialized
    );

  }

  catch(error){

    return {};

  }

}



// =====================================
// CREATE MEMORY FLAGS
// =====================================

function createMemoryFlags(
  options = {}
){

  return {

    pinned:
    Boolean(
      options.pinned
    ),

    archived:
    Boolean(
      options.archived
    ),

    favorite:
    Boolean(
      options.favorite
    ),

    temporary:
    Boolean(
      options.temporary
    ),

    system:
    Boolean(
      options.system
    )

  };

}



// =====================================
// CREATE MEMORY STATS
// =====================================

function createMemoryStats(){

  return {

    score:0,

    createdScore:0,

    updatedScore:0,

    accessCount:0,

    usageCount:0,

    relevanceScore:0,

    lastAccessedAt:null

  };

}



// =====================================
// VALIDATE RELATIONS
// =====================================

function validateMemoryRelations(
  relations = {},
  currentMemoryId = null
){

  const visited =
  new Set();

  function validateIds(
    ids = []
  ){

    for(
      const id of ids
    ){

      if(
        !id
      ){

        return false;

      }

      if(
        visited.has(id)
      ){

        return false;

      }

      if(
        id ===
        currentMemoryId
      ){

        return false;

      }

      visited.add(id);

    }

    return true;

  }

  return (

    validateIds(
      relations.childMemoryIds
    )

    &&

    validateIds(
      relations.relatedMemoryIds
    )

  );

}



// =====================================
// CREATE RELATIONS
// =====================================

function createMemoryRelations(
  options = {},
  currentMemoryId = null
){

  const normalizeIds =
  (ids = []) => {

    return [

      ...new Set(

        ids
        .map((id) => {

          return normalizeMemoryString(
            id
          );

        })
        .filter((id) => {

          return (

            id &&

            id !==
            currentMemoryId

          );

        })

      )

    ];

  };

  const relations = {

    parentMemoryId:

      normalizeMemoryString(
        options.parentMemoryId
      ) || null,

    childMemoryIds:
    normalizeIds(
      options.childMemoryIds
    ),

    relatedMemoryIds:
    normalizeIds(
      options.relatedMemoryIds
    )

  };

  if(

    !validateMemoryRelations(

      relations,

      currentMemoryId

    )

  ){

    return {

      parentMemoryId:null,

      childMemoryIds:[],

      relatedMemoryIds:[]

    };

  }

  return relations;

}



// =====================================
// EMBEDDING
// =====================================

function createMemoryEmbedding(){

  return {

    vector:null,

    dimensions:0,

    model:null,

    createdAt:null

  };

}



// =====================================
// METADATA
// =====================================

function createMemoryMetadata(
  metadata = {}
){

  return {

    ...normalizeMemoryMetadata(
      metadata
    )

  };

}



// =====================================
// AUDIT
// =====================================

function createMemoryAudit(
  options = {}
){

  const timestamps =
  createMemoryTimestamps();

  return {

    createdBy:
    normalizeMemoryString(
      options.createdBy
    ),

    updatedBy:
    normalizeMemoryString(
      options.updatedBy
    ),

    source:
    normalizeMemoryString(
      options.source
    ),

    sourceType:
    normalizeMemoryString(
      options.sourceType
    ),

    createdAt:
    timestamps.createdAt,

    updatedAt:
    timestamps.updatedAt

  };

}



// =====================================
// FREEZE MEMORY OBJECT
// =====================================

function freezeMemoryObject(
  memory
){

  if(

    !memory ||

    typeof memory !==
    "object"

  ){

    return memory;

  }

  if(

    !MEMORY_TYPES_CONFIG
    .ENABLE_IMMUTABLE_FREEZE

  ){

    return memory;

  }

  return deepFreezeMemoryObject(
    memory
  );

}



// =====================================
// CREATE MEMORY OBJECT
// =====================================

async function createMemoryObject(
  options = {}
){

  const timestamps =
  createMemoryTimestamps();

  const memoryId =
  createMemoryId();

  const memoryObject = {

    id:
    memoryId,

    version:
    MEMORY_VERSION ||
    "1.0.0",

    schemaVersion:

      MEMORY_TYPES_CONFIG
      .SCHEMA_VERSION,

    type:
    normalizeMemoryType(
      options.type
    ),

    category:
    normalizeMemoryCategory(
      options.category
    ),

    title:

      normalizeMemoryString(
        options.title
      )
      .slice(
        0,
        MEMORY_LIMITS
        ?.MAX_TITLE_LENGTH ||

        120
      ),

    content:

      normalizeMemoryContent(
        options.content
      )
      .slice(
        0,
        MEMORY_LIMITS
        ?.MAX_CONTENT_LENGTH ||

        10000
      ),

    summary:

      normalizeMemoryString(
        options.summary
      )
      .slice(
        0,
        MEMORY_LIMITS
        ?.MAX_SUMMARY_LENGTH ||

        2000
      ),

    tags:
    normalizeMemoryTags(
      options.tags
    ),

    priority:
    normalizeMemoryPriority(
      options.priority
    ),

    expiration:
    normalizeMemoryExpiration(
      options.expiration
    ),

    state:
    normalizeMemoryState(
      options.state
    ),

    flags:
    createMemoryFlags(
      options.flags || {}
    ),

    stats:
    createMemoryStats(),

    relations:
    createMemoryRelations(
      options.relations,
      memoryId
    ),

    metadata:
    createMemoryMetadata(
      options.metadata
    ),

    audit:
    createMemoryAudit(
      options.audit
    ),

    embedding:
    createMemoryEmbedding(),

    fingerprint:null,

    createdAt:
    timestamps.createdAt,

    updatedAt:
    timestamps.updatedAt,

    expiresAt:
    normalizeMemoryExpiresAt(
      options.expiresAt
    )

  };

  memoryObject.fingerprint =
  await createMemoryFingerprint(
    memoryObject
  );

  return freezeMemoryObject(
    memoryObject
  );

}



// =====================================
// SAFE CLONE
// =====================================

function cloneMemoryObject(
  memory
){

  try{

    if(

      typeof structuredClone ===
      "function"

    ){

      return structuredClone(
        memory
      );

    }

    return JSON.parse(
      JSON.stringify(
        memory
      )
    );

  }

  catch(error){

    return null;

  }

}



// =====================================
// PATCH MEMORY
// =====================================

async function patchMemoryObject(
  memory,
  patch = {}
){

  const clonedMemory =
  cloneMemoryObject(
    memory
  );

  if(!clonedMemory){

    return null;

  }

  return createMemoryObject({

    ...clonedMemory,

    ...patch,

    id:
    clonedMemory.id,

    createdAt:
    clonedMemory.createdAt,

    updatedAt:
    Date.now()

  });

}



// =====================================
// UPDATE FIELD
// =====================================

async function updateMemoryField(
  memory,
  field,
  value
){

  return patchMemoryObject(
    memory,
    {
      [field]:value
    }
  );

}



// =====================================
// MERGE METADATA
// =====================================

async function mergeMemoryMetadata(
  memory,
  metadata = {}
){

  return patchMemoryObject(
    memory,
    {
      metadata:{
        ...(memory.metadata || {}),

        ...metadata
      }
    }
  );

}



// =====================================
// SANITIZE
// =====================================

async function sanitizeMemoryObject(
  memory
){

  if(

    !memory ||

    typeof memory !==
    "object"

  ){

    return createMemoryObject();
  }

  return createMemoryObject({

    ...memory

  });

}



// =====================================
// ENSURE DEFAULTS
// =====================================

function ensureMemoryDefaults(
  memory = {}
){

  return {

    ...MEMORY_DEFAULTS,

    ...memory,

    flags:{

      ...(memory.flags || {})

    },

    stats:{

      ...(memory.stats || {})

    },

    relations:{

      ...(memory.relations || {})

    },

    metadata:{

      ...(memory.metadata || {})

    },

    audit:{

      ...(memory.audit || {})

    }

  };

}



// =====================================
// PUBLIC API
// =====================================

const MemoryTypes =
Object.freeze({

  config:
  MEMORY_TYPES_CONFIG,

  createId:
  createMemoryId,

  create:
  createMemoryObject,

  clone:
  cloneMemoryObject,

  freeze:
  freezeMemoryObject,

  sanitize:
  sanitizeMemoryObject,

  patch:
  patchMemoryObject,

  updateField:
  updateMemoryField,

  mergeMetadata:
  mergeMemoryMetadata,

  ensureDefaults:
  ensureMemoryDefaults,

  normalizeString:
  normalizeMemoryString,

  normalizeValue:
  normalizeMemoryValue,

  normalizeContent:
  normalizeMemoryContent,

  normalizeTags:
  normalizeMemoryTags,

  normalizeMetadata:
  normalizeMemoryMetadata,

  createRelations:
  createMemoryRelations,

  validateRelations:
  validateMemoryRelations,

  createConversation:
  createConversationMemory,

  createSummary:
  createSummaryMemory,

  createPreference:
  createPreferenceMemory,

  createProject:
  createProjectMemory,

  createKnowledge:
  createKnowledgeMemory,

  createFact:
  createFactMemory,

  createProfile:
  createProfileMemory,

  createTemporary:
  createTemporaryMemory,

  createSystem:
  createSystemMemory

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.MemoryTypes =
  MemoryTypes;

}



if(
  typeof globalThis !==
  "undefined"
){

  globalThis.MemoryTypes =
  MemoryTypes;

}

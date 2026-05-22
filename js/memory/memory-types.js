// =====================================
// RIGO AI
// MEMORY TYPES
// ENTERPRISE INFINITY FINAL
// =====================================



// =====================================
// MEMORY ID
// =====================================

function createMemoryId(){

  if(

    typeof crypto !==
    "undefined" &&

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

  return deepFreeze({

    createdAt:
    timestamp,

    updatedAt:
    timestamp

  });

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
  .trim();

}



// =====================================
// NORMALIZE CONTENT
// =====================================

function normalizeMemoryContent(
  content
){

  return normalizeMemoryString(
    content
  )
  .replace(/\s+/g," ")
  .trim();

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
    !Object.values(
      MEMORY_PRIORITIES
    )
    .includes(
      normalizedPriority
    )
  ){

    return MEMORY_DEFAULTS
    .PRIORITY;

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
    !isValidMemoryCategory(
      normalizedCategory
    )
  ){

    return MEMORY_DEFAULTS
    .CATEGORY;

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
    !isValidMemoryType(
      normalizedType
    )
  ){

    return MEMORY_DEFAULTS
    .TYPE;

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
    !isValidMemoryState(
      normalizedState
    )
  ){

    return MEMORY_DEFAULTS
    .STATE;

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

    !Object.values(
      MEMORY_EXPIRATION
    )
    .includes(
      normalizedExpiration
    )

  ){

    return MEMORY_DEFAULTS
    .EXPIRATION;

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
    ) ||

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
        MEMORY_LIMITS
        .MAX_TAG_LENGTH
      );

    });

  return [

    ...new Set(
      normalizedTags
    )

  ]
  .slice(
    0,
    MEMORY_LIMITS
    .MAX_TAGS
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
      MEMORY_LIMITS
      .MAX_METADATA_SIZE
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

  return deepFreeze({

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

  });

}



// =====================================
// CREATE MEMORY STATS
// =====================================

function createMemoryStats(){

  return deepFreeze({

    score:0,

    createdScore:0,

    updatedScore:0,

    accessCount:0,

    usageCount:0,

    relevanceScore:0,

    lastAccessedAt:null

  });

}



// =====================================
// CREATE MEMORY RELATIONS
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

  const parentMemoryId =

    normalizeMemoryString(
      options.parentMemoryId
    ) || null;

  return deepFreeze({

    parentMemoryId:

      parentMemoryId ===
      currentMemoryId

      ? null

      : parentMemoryId,

    childMemoryIds:
    normalizeIds(
      options.childMemoryIds
    ),

    relatedMemoryIds:
    normalizeIds(
      options.relatedMemoryIds
    )

  });

}



// =====================================
// CREATE MEMORY EMBEDDING
// =====================================

function createMemoryEmbedding(){

  return deepFreeze({

    vector:null,

    dimensions:0,

    model:null,

    createdAt:null

  });

}



// =====================================
// CREATE MEMORY METADATA
// =====================================

function createMemoryMetadata(
  metadata = {}
){

  const normalizedMetadata =
  normalizeMemoryMetadata(
    metadata
  );

  return deepFreeze({

    ...normalizedMetadata

  });

}



// =====================================
// CREATE MEMORY AUDIT
// =====================================

function createMemoryAudit(
  options = {}
){

  const timestamps =
  createMemoryTimestamps();

  return deepFreeze({

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

  });

}



// =====================================
// CREATE BASE MEMORY OBJECT
// =====================================

function createMemoryObject(
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
    MEMORY_VERSION,

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
        .MAX_TITLE_LENGTH
      ),

    content:

      normalizeMemoryContent(
        options.content
      )
      .slice(
        0,
        MEMORY_LIMITS
        .MAX_CONTENT_LENGTH
      ),

    summary:

      normalizeMemoryString(
        options.summary
      )
      .slice(
        0,
        MEMORY_LIMITS
        .MAX_SUMMARY_LENGTH
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
    createMemoryFlags({

      ...MEMORY_DEFAULTS
      .FLAGS,

      ...(options.flags || {})

    }),

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

    createdAt:
    timestamps.createdAt,

    updatedAt:
    timestamps.updatedAt,

    expiresAt:
    normalizeMemoryExpiresAt(
      options.expiresAt
    )

  };

  return freezeMemoryObject(
    memoryObject
  );

}



// =====================================
// SPECIALIZED MEMORY TYPES
// =====================================

function createConversationMemory(
  options = {}
){

  return createMemoryObject({

    ...options,

    type:"conversation",

    category:"chat"

  });

}



function createSummaryMemory(
  options = {}
){

  return createMemoryObject({

    ...options,

    type:"summary",

    category:"context"

  });

}



function createPreferenceMemory(
  options = {}
){

  return createMemoryObject({

    ...options,

    type:"preference",

    category:"settings"

  });

}



function createProjectMemory(
  options = {}
){

  return createMemoryObject({

    ...options,

    type:"project",

    category:"project"

  });

}



function createKnowledgeMemory(
  options = {}
){

  return createMemoryObject({

    ...options,

    type:"knowledge",

    category:"memory"

  });

}



function createFactMemory(
  options = {}
){

  return createMemoryObject({

    ...options,

    type:"fact",

    category:"memory"

  });

}



function createProfileMemory(
  options = {}
){

  return createMemoryObject({

    ...options,

    type:"profile",

    category:"user"

  });

}



function createTemporaryMemory(
  options = {}
){

  return createMemoryObject({

    ...options,

    type:"temporary",

    expiration:"session",

    flags:{

      ...(options.flags || {}),

      temporary:true

    }

  });

}



function createSystemMemory(
  options = {}
){

  return createMemoryObject({

    ...options,

    type:"system",

    category:"system",

    flags:{

      ...(options.flags || {}),

      system:true

    }

  });

}



// =====================================
// CLONE MEMORY OBJECT
// =====================================

function cloneMemoryObject(
  memory
){

  try{

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

  return deepFreeze(
    memory
  );

}



// =====================================
// SANITIZE MEMORY OBJECT
// =====================================

function sanitizeMemoryObject(
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
// ENSURE MEMORY DEFAULTS
// =====================================

function ensureMemoryDefaults(
  memory = {}
){

  return {

    ...MEMORY_DEFAULTS,

    flags:{

      ...(MEMORY_DEFAULTS.FLAGS || {}),

      ...(memory.flags || {})

    },

    stats:{

      ...(MEMORY_DEFAULTS.STATS || {}),

      ...(memory.stats || {})

    },

    relations:{

      ...(MEMORY_DEFAULTS.RELATIONS || {}),

      ...(memory.relations || {})

    },

    metadata:{

      ...(MEMORY_DEFAULTS.METADATA || {}),

      ...(memory.metadata || {})

    },

    audit:{

      ...(MEMORY_DEFAULTS.AUDIT || {}),

      ...(memory.audit || {})

    },

    ...memory

  };

}

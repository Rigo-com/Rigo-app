// =====================================
// RIGO AI
// MEMORY VALIDATION
// ENTERPRISE INFINITY FINAL
// =====================================



// =====================================
// VALIDATION RESULT
// =====================================

function createValidationResult(){

  return {

    valid:true,

    errors:[],

    warnings:[]

  };

}



// =====================================
// MERGE VALIDATION RESULTS
// =====================================

function mergeValidationResults(
  ...results
){

  const mergedResult =
  createValidationResult();

  results.forEach((result) => {

    if(
      !result ||
      typeof result !==
      "object"
    ){

      return;
    }

    if(
      result.valid === false
    ){

      mergedResult.valid =
      false;

    }

    if(
      Array.isArray(
        result.errors
      )
    ){

      mergedResult.errors
      .push(
        ...result.errors
      );

    }

    if(
      Array.isArray(
        result.warnings
      )
    ){

      mergedResult.warnings
      .push(
        ...result.warnings
      );

    }

  });

  mergedResult.errors = [

    ...new Set(
      mergedResult.errors
    )

  ];

  mergedResult.warnings = [

    ...new Set(
      mergedResult.warnings
    )

  ];

  return mergedResult;

}



// =====================================
// ADD VALIDATION ERROR
// =====================================

function addValidationError(
  result,
  error
){

  result.valid = false;

  result.errors.push(
    normalizeMemoryString(
      error
    )
  );

  result.errors = [

    ...new Set(
      result.errors
    )

  ];

  return result;

}



// =====================================
// ADD VALIDATION WARNING
// =====================================

function addValidationWarning(
  result,
  warning
){

  result.warnings.push(
    normalizeMemoryString(
      warning
    )
  );

  result.warnings = [

    ...new Set(
      result.warnings
    )

  ];

  return result;

}



// =====================================
// VALIDATE MEMORY ID
// =====================================

function validateMemoryId(
  memoryId
){

  const result =
  createValidationResult();

  const normalizedId =
  normalizeMemoryString(
    memoryId
  );

  if(!normalizedId){

    return addValidationError(
      result,
      "Invalid memory id"
    );

  }

  if(
    normalizedId.length > 200
  ){

    return addValidationError(
      result,
      "Memory id exceeds limit"
    );

  }

  return result;

}



// =====================================
// VALIDATE MEMORY TYPE
// =====================================

function validateMemoryType(
  type
){

  const result =
  createValidationResult();

  if(
    !isValidMemoryType(
      type
    )
  ){

    return addValidationError(
      result,
      "Invalid memory type"
    );

  }

  return result;

}



// =====================================
// VALIDATE MEMORY CATEGORY
// =====================================

function validateMemoryCategory(
  category
){

  const result =
  createValidationResult();

  if(
    !isValidMemoryCategory(
      category
    )
  ){

    return addValidationError(
      result,
      "Invalid memory category"
    );

  }

  return result;

}



// =====================================
// VALIDATE MEMORY PRIORITY
// =====================================

function validateMemoryPriority(
  priority
){

  const result =
  createValidationResult();

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

    return addValidationError(
      result,
      "Invalid memory priority"
    );

  }

  return result;

}



// =====================================
// VALIDATE MEMORY STATE
// =====================================

function validateMemoryState(
  state
){

  const result =
  createValidationResult();

  if(
    !isValidMemoryState(
      state
    )
  ){

    return addValidationError(
      result,
      "Invalid memory state"
    );

  }

  return result;

}



// =====================================
// VALIDATE MEMORY EXPIRATION
// =====================================

function validateMemoryExpiration(
  expiration
){

  const result =
  createValidationResult();

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

    return addValidationError(
      result,
      "Invalid memory expiration"
    );

  }

  return result;

}



// =====================================
// VALIDATE MEMORY TITLE
// =====================================

function validateMemoryTitle(
  title
){

  const result =
  createValidationResult();

  const normalizedTitle =
  normalizeMemoryString(
    title
  );

  if(

    normalizedTitle.length >

    MEMORY_LIMITS
    .MAX_TITLE_LENGTH

  ){

    addValidationError(

      result,

      "Memory title exceeds limit"

    );

  }

  return result;

}



// =====================================
// VALIDATE MEMORY CONTENT
// =====================================

function validateMemoryContent(
  content
){

  const result =
  createValidationResult();

  const normalizedContent =
  normalizeMemoryContent(
    content
  );

  if(!normalizedContent){

    addValidationError(

      result,

      "Memory content required"

    );

  }

  if(

    normalizedContent.length <

    MEMORY_LIMITS
    .MIN_CONTENT_LENGTH

  ){

    addValidationError(

      result,

      "Memory content too short"

    );

  }

  if(

    normalizedContent.length >

    MEMORY_LIMITS
    .MAX_CONTENT_LENGTH

  ){

    addValidationError(

      result,

      "Memory content exceeds limit"

    );

  }

  return result;

}



// =====================================
// VALIDATE MEMORY TAGS
// =====================================

function validateMemoryTags(
  tags
){

  const result =
  createValidationResult();

  if(
    !Array.isArray(tags)
  ){

    return addValidationError(
      result,
      "Invalid memory tags"
    );

  }

  if(

    tags.length >

    MEMORY_LIMITS
    .MAX_TAGS

  ){

    addValidationError(

      result,

      "Too many memory tags"

    );

  }

  tags.forEach((tag) => {

    const normalizedTag =

      normalizeMemoryString(
        tag
      );

    if(!normalizedTag){

      addValidationWarning(

        result,

        "Empty tag detected"

      );

    }

    if(

      normalizedTag.length >

      MEMORY_LIMITS
      .MAX_TAG_LENGTH

    ){

      addValidationError(

        result,

        "Memory tag exceeds limit"

      );

    }

  });

  return result;

}



// =====================================
// VALIDATE MEMORY METADATA
// =====================================

function validateMemoryMetadata(
  metadata
){

  const result =
  createValidationResult();

  if(
    metadata == null
  ){

    return result;

  }

  if(

    typeof metadata !==
    "object" ||

    Array.isArray(metadata)

  ){

    return addValidationError(
      result,
      "Invalid memory metadata"
    );

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

      addValidationError(

        result,

        "Memory metadata exceeds limit"

      );

    }

  }

  catch(error){

    addValidationError(

      result,

      "Memory metadata serialization failed"

    );

    addValidationWarning(

      result,

      "Possible circular metadata structure"

    );

  }

  return result;

}



// =====================================
// VALIDATE MEMORY RELATIONS
// =====================================

function validateMemoryRelations(
  relations,
  memoryId = null
){

  const result =
  createValidationResult();

  if(

    !relations ||

    typeof relations !==
    "object"

  ){

    return result;

  }

  const childIds =

    Array.isArray(
      relations.childMemoryIds
    )

    ? relations.childMemoryIds

    : [];

  const relatedIds =

    Array.isArray(
      relations.relatedMemoryIds
    )

    ? relations.relatedMemoryIds

    : [];

  const allIds = [

    ...childIds,

    ...relatedIds

  ];

  if(

    relations.parentMemoryId &&
    relations.parentMemoryId ===
    memoryId

  ){

    addValidationError(

      result,

      "Circular parent relation detected"

    );

  }

  allIds.forEach((id) => {

    const normalizedId =
    normalizeMemoryString(
      id
    );

    if(!normalizedId){

      addValidationWarning(

        result,

        "Invalid relation id"

      );

    }

    if(
      normalizedId ===
      memoryId
    ){

      addValidationError(

        result,

        "Self relation detected"

      );

    }

  });

  return result;

}



// =====================================
// VALIDATE MEMORY FLAGS
// =====================================

function validateMemoryFlags(
  flags
){

  const result =
  createValidationResult();

  if(
    flags == null
  ){

    return result;

  }

  if(

    typeof flags !==
    "object" ||

    Array.isArray(flags)

  ){

    return addValidationError(
      result,
      "Invalid memory flags"
    );

  }

  Object.values(flags)
  .forEach((value) => {

    if(
      typeof value !==
      "boolean"
    ){

      addValidationError(

        result,

        "Invalid memory flag value"

      );

    }

  });

  return result;

}



// =====================================
// VALIDATE MEMORY AUDIT
// =====================================

function validateMemoryAudit(
  audit
){

  const result =
  createValidationResult();

  if(
    audit == null
  ){

    return result;

  }

  if(

    typeof audit !==
    "object" ||

    Array.isArray(audit)

  ){

    return addValidationError(
      result,
      "Invalid memory audit"
    );

  }

  Object.values(audit)
  .forEach((value) => {

    if(
      typeof value ===
      "string" &&
      value.length > 500
    ){

      addValidationError(

        result,

        "Memory audit value exceeds limit"

      );

    }

  });

  return result;

}



// =====================================
// VALIDATE MEMORY STATS
// =====================================

function validateMemoryStats(
  stats
){

  const result =
  createValidationResult();

  if(
    stats == null
  ){

    return result;

  }

  if(

    typeof stats !==
    "object" ||

    Array.isArray(stats)

  ){

    return addValidationError(
      result,
      "Invalid memory stats"
    );

  }

  return result;

}



// =====================================
// VALIDATE MEMORY EMBEDDING
// =====================================

function validateMemoryEmbedding(
  embedding
){

  const result =
  createValidationResult();

  if(
    embedding == null
  ){

    return result;

  }

  if(

    typeof embedding !==
    "object" ||

    Array.isArray(embedding)

  ){

    return addValidationError(
      result,
      "Invalid memory embedding"
    );

  }

  return result;

}



// =====================================
// VALIDATE MEMORY TIMESTAMPS
// =====================================

function validateMemoryTimestamps(
  memory
){

  const result =
  createValidationResult();

  const timestamps = [

    memory.createdAt,
    memory.updatedAt

  ];

  timestamps.forEach((value) => {

    if(
      value == null
    ){

      return;

    }

    if(

      typeof value !==
      "number"

      ||

      !Number.isFinite(
        value
      )

      ||

      value < 0

    ){

      addValidationError(

        result,

        "Invalid memory timestamp"

      );

    }

  });

  return result;

}



// =====================================
// VALIDATE MEMORY OBJECT
// =====================================

function validateMemoryObject(
  memory,
  options = {}
){

  const result =
  createValidationResult();

  if(

    !memory ||

    typeof memory !==
    "object" ||

    Array.isArray(memory)

  ){

    return addValidationError(
      result,
      "Invalid memory object"
    );

  }

  const validationResult =
  mergeValidationResults(

    validateMemoryId(
      memory.id
    ),

    validateMemoryType(
      memory.type
    ),

    validateMemoryCategory(
      memory.category
    ),

    validateMemoryPriority(
      memory.priority
    ),

    validateMemoryState(
      memory.state
    ),

    validateMemoryExpiration(
      memory.expiration
    ),

    validateMemoryTitle(
      memory.title
    ),

    validateMemoryContent(
      memory.content
    ),

    validateMemoryTags(
      memory.tags || []
    ),

    validateMemoryMetadata(
      memory.metadata
    ),

    validateMemoryRelations(
      memory.relations,
      memory.id
    ),

    validateMemoryFlags(
      memory.flags
    ),

    validateMemoryAudit(
      memory.audit
    ),

    validateMemoryStats(
      memory.stats
    ),

    validateMemoryEmbedding(
      memory.embedding
    ),

    validateMemoryTimestamps(
      memory
    )

  );

  result.valid =
  validationResult.valid;

  result.errors =
  validationResult.errors;

  result.warnings =
  validationResult.warnings;

  if(
    options.strict === true
  ){

    if(
      !memory.createdAt
    ){

      addValidationError(

        result,

        "Missing createdAt"

      );

    }

    if(
      !memory.updatedAt
    ){

      addValidationError(

        result,

        "Missing updatedAt"

      );

    }

    if(
      !memory.version
    ){

      addValidationError(

        result,

        "Missing memory version"

      );

    }

  }

  return result;

}



// =====================================
// SHALLOW VALIDATION
// =====================================

function validateMemoryShallow(
  memory
){

  const result =
  createValidationResult();

  if(

    !memory ||

    typeof memory !==
    "object" ||

    Array.isArray(memory)

  ){

    return addValidationError(
      result,
      "Invalid memory object"
    );

  }

  if(
    !memory.id
  ){

    addValidationError(
      result,
      "Missing memory id"
    );

  }

  if(
    !memory.content
  ){

    addValidationError(
      result,
      "Missing memory content"
    );

  }

  return result;

}



// =====================================
// SANITIZE MEMORY CONTENT
// =====================================

function sanitizeMemoryContent(
  content
){

  return normalizeMemoryContent(
    content
  )
  .replace(/\0/g,"")
  .slice(
    0,
    MEMORY_LIMITS
    .MAX_CONTENT_LENGTH
  );

}



// =====================================
// SANITIZE MEMORY METADATA
// =====================================

function sanitizeMemoryMetadata(
  metadata
){

  return normalizeMemoryMetadata(
    metadata
  );

}



// =====================================
// SANITIZE MEMORY INPUT
// =====================================

function sanitizeMemoryInput(
  input
){

  if(

    !input ||

    typeof input !==
    "object"

  ){

    return {};
  }

  return {

    ...(input.id != null
      ? {
          id:
          normalizeMemoryString(
            input.id
          )
        }
      : {}),

    type:
    normalizeMemoryType(
      input.type
    ),

    category:
    normalizeMemoryCategory(
      input.category
    ),

    title:

      String(

        normalizeMemoryString(
          input.title
        ) || ""

      )
      .slice(
        0,
        MEMORY_LIMITS
        .MAX_TITLE_LENGTH
      ),

    content:
    sanitizeMemoryContent(
      input.content
    ),

    summary:

      String(

        normalizeMemoryString(
          input.summary
        ) || ""

      )
      .slice(
        0,
        MEMORY_LIMITS
        .MAX_SUMMARY_LENGTH
      ),

    tags:
    normalizeMemoryTags(
      input.tags
    ),

    metadata:
    sanitizeMemoryMetadata(
      input.metadata
    ),

    priority:
    normalizeMemoryPriority(
      input.priority
    ),

    expiration:
    normalizeMemoryExpiration(
      input.expiration
    ),

    state:
    normalizeMemoryState(
      input.state
    )

  };

}



// =====================================
// DUPLICATE PREP
// =====================================

function createMemoryContentHash(
  content
){

  const normalizedContent =
  normalizeMemoryContent(
    content
  );

  if(
    !normalizedContent
  ){

    return "empty_content_hash";

  }

  let hash = 0;

  for(

    let i = 0;

    i < normalizedContent.length;

    i++

  ){

    hash =

      (
        hash << 5
      ) -

      hash +

      normalizedContent
      .charCodeAt(i);

    hash |= 0;

  }

  return String(hash);

}



// =====================================
// DUPLICATE DETECTION
// =====================================

function isDuplicateMemoryContent(
  contentA,
  contentB
){

  return (

    createMemoryContentHash(
      contentA
    ) ===

    createMemoryContentHash(
      contentB
    )

  );

}

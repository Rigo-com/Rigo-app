// =====================================
// RIGO AI
// MEMORY UTILS
// ENTERPRISE INFINITY ULTRA FINAL
// =====================================



// =====================================
// UTILS CONFIG
// =====================================

const MEMORY_UTILS_CONFIG =
Object.freeze({

  MIN_TOKEN_LENGTH:2,

  MAX_TOKEN_LENGTH:64,

  MAX_TOKENS:1000,

  HASH_LENGTH:64,

  MAX_TEXT_LENGTH:50000,

  MAX_ARRAY_LENGTH:10000,

  MAX_RETRY_COUNT:5,

  DEFAULT_DEBOUNCE:300,

  DEFAULT_THROTTLE:300

});



// =====================================
// STOP WORDS
// =====================================

const MEMORY_STOP_WORDS =
new Set([

  "a","an","and","are","as","at",

  "be","by","for","from","has","he",

  "in","is","it","its","of","on",

  "that","the","to","was","were",

  "will","with","this","these",

  "those","you","your","they",

  "them","their","or","if","then",

  "than","so","but","not"

]);



// =====================================
// SAFE STRING
// =====================================

function safeMemoryString(
  value,
  fallback = ""
){

  try{

    return String(
      value ?? fallback
    );

  }

  catch(error){

    return String(
      fallback
    );

  }

}



// =====================================
// SAFE NUMBER
// =====================================

function safeMemoryNumber(
  value,
  fallback = 0
){

  const number =
  Number(value);

  return Number.isFinite(
    number
  )

  ? number

  : fallback;

}



// =====================================
// SAFE ARRAY
// =====================================

function safeMemoryArray(
  value
){

  if(
    !Array.isArray(value)
  ){

    return [];
  }

  return value.slice(

    0,

    MEMORY_UTILS_CONFIG
    .MAX_ARRAY_LENGTH

  );

}



// =====================================
// SAFE OBJECT
// =====================================

function safeMemoryObject(
  value
){

  if(

    !value ||

    typeof value !==
    "object" ||

    Array.isArray(value)

  ){

    return {};

  }

  return value;

}



// =====================================
// SAFE BOOLEAN
// =====================================

function safeMemoryBoolean(
  value,
  fallback = false
){

  if(
    typeof value ===
    "boolean"
  ){

    return value;

  }

  return fallback;

}



// =====================================
// NORMALIZE TEXT
// =====================================

function normalizeMemoryText(
  text
){

  return safeMemoryString(
    text
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
// LOWERCASE TEXT
// =====================================

function normalizeMemoryTextLower(
  text
){

  return normalizeMemoryText(
    text
  )
  .toLowerCase();

}



// =====================================
// SAFE CONTENT NORMALIZATION
// =====================================

function normalizeMemoryContent(
  text
){

  return normalizeMemoryText(
    text
  )
  .slice(

    0,

    MEMORY_UTILS_CONFIG
    .MAX_TEXT_LENGTH

  );

}



// =====================================
// TOKENIZE TEXT
// =====================================

function tokenizeMemoryText(
  text
){

  const normalizedText =
  normalizeMemoryTextLower(
    text
  );

  if(
    !normalizedText
  ){

    return [];
  }

  const tokens =

    normalizedText

    .split(
      /[^a-z0-9\u0600-\u06FF_]+/giu
    )

    .filter((token) => {

      return (

        token &&

        token.length >=

        MEMORY_UTILS_CONFIG
        .MIN_TOKEN_LENGTH

        &&

        token.length <=

        MEMORY_UTILS_CONFIG
        .MAX_TOKEN_LENGTH

        &&

        !MEMORY_STOP_WORDS
        .has(token)

      );

    });

  return [

    ...new Set(tokens)

  ]
  .slice(

    0,

    MEMORY_UTILS_CONFIG
    .MAX_TOKENS

  );

}



// =====================================
// TOKEN COUNTS
// =====================================

function countMemoryTokens(
  text
){

  return tokenizeMemoryText(
    text
  )
  .length;

}



// =====================================
// CONTENT HASH
// =====================================

function createUtilityMemoryHash(
  value
){

  const normalizedValue =
  normalizeMemoryText(
    value
  );

  let hash1 =
  5381;

  let hash2 =
  52711;

  for(

    let index = 0;

    index <
    normalizedValue.length;

    index++

  ){

    const charCode =

      normalizedValue
      .charCodeAt(index);

    hash1 =

      (
        (hash1 << 5)
        + hash1
      )

      ^

      charCode;

    hash2 =

      (
        (hash2 << 5)
        + hash2
      )

      ^

      charCode;

  }

  const combinedHash =

    (
      hash1 >>> 0
    )
    .toString(16)

    +

    (
      hash2 >>> 0
    )
    .toString(16);

  return combinedHash
  .padStart(

    MEMORY_UTILS_CONFIG
    .HASH_LENGTH,

    "0"

  )
  .slice(

    0,

    MEMORY_UTILS_CONFIG
    .HASH_LENGTH

  );

}



// =====================================
// DATE HELPERS
// =====================================

function getCurrentTimestamp(){

  return Date.now();

}



function isExpiredTimestamp(
  timestamp
){

  const normalizedTimestamp =
  safeMemoryNumber(
    timestamp,
    0
  );

  if(
    normalizedTimestamp <= 0
  ){

    return false;

  }

  return (

    Date.now() >

    normalizedTimestamp

  );

}



function getDaysBetweenDates(
  firstDate,
  secondDate
){

  const first =
  safeMemoryNumber(
    firstDate
  );

  const second =
  safeMemoryNumber(
    secondDate
  );

  return Math.floor(

    Math.abs(
      second - first
    ) /

    86400000

  );

}



// =====================================
// ARRAY DEDUPLICATION
// =====================================

function deduplicateMemoryArray(
  values = []
){

  return [

    ...new Set(

      safeMemoryArray(
        values
      )

    )

  ];

}



// =====================================
// SAFE BATCHING
// =====================================

function chunkMemoryArray(
  values = [],
  chunkSize = 100
){

  const safeValues =
  safeMemoryArray(
    values
  );

  const chunks = [];

  for(

    let index = 0;

    index <
    safeValues.length;

    index += chunkSize

  ){

    chunks.push(

      safeValues.slice(
        index,
        index + chunkSize
      )

    );

  }

  return chunks;

}



// =====================================
// SORT HELPERS
// =====================================

function sortMemoriesByDate(
  memories = [],
  field = "updatedAt",
  direction = "desc"
){

  return [

    ...safeMemoryArray(
      memories
    )

  ]
  .sort((a,b) => {

    const valueA =
    safeMemoryNumber(
      a?.[field]
    );

    const valueB =
    safeMemoryNumber(
      b?.[field]
    );

    if(
      valueA === valueB
    ){

      return String(
        a?.id || ""
      )
      .localeCompare(
        String(
          b?.id || ""
        )
      );

    }

    return direction ===
    "asc"

    ? valueA - valueB

    : valueB - valueA;

  });

}



function sortMemoriesByScore(
  results = []
){

  return [

    ...safeMemoryArray(
      results
    )

  ]
  .sort((a,b) => {

    return (

      safeMemoryNumber(
        b?.score
      )

      -

      safeMemoryNumber(
        a?.score
      )

    );

  });

}



// =====================================
// CLAMP HELPERS
// =====================================

function clampMemoryNumber(
  value,
  min,
  max
){

  const number =
  safeMemoryNumber(
    value,
    min
  );

  return Math.min(

    max,

    Math.max(
      min,
      number
    )

  );

}



// =====================================
// SAFE JSON
// =====================================

function safeJsonParse(
  value,
  fallback = null
){

  try{

    return JSON.parse(
      value
    );

  }

  catch(error){

    return fallback;

  }

}



function safeJsonStringify(
  value,
  fallback = ""
){

  try{

    const visited =
    new WeakSet();

    return JSON.stringify(
      value,
      (key,nestedValue) => {

        if(

          nestedValue &&

          typeof nestedValue ===
          "object"

        ){

          if(
            visited.has(
              nestedValue
            )
          ){

            return "[Circular]";
          }

          visited.add(
            nestedValue
          );

        }

        return nestedValue;

      }
    );

  }

  catch(error){

    return fallback;

  }

}



// =====================================
// DEEP CLONE
// =====================================

function deepClone(
  value
){

  return safeJsonParse(

    safeJsonStringify(
      value,
      "null"
    ),

    null

  );

}



// =====================================
// IMMUTABLE FREEZE
// =====================================

function deepFreeze(
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

  Object.values(
    value
  )
  .forEach((nestedValue) => {

    deepFreeze(
      nestedValue,
      visited
    );

  });

  return value;

}



// =====================================
// MEMORY SIZE
// =====================================

function calculateMemorySize(
  value
){

  const serialized =
  safeJsonStringify(
    value,
    ""
  );

  return serialized.length;

}



// =====================================
// TEXT TRUNCATION
// =====================================

function truncateMemoryText(
  text,
  maxLength = 500
){

  const normalizedText =
  normalizeMemoryText(
    text
  );

  if(
    normalizedText.length <=
    maxLength
  ){

    return normalizedText;

  }

  return (

    normalizedText.slice(

      0,

      maxLength

    )

    +

    "..."

  );

}



// =====================================
// CONTENT COMPRESSION
// =====================================

function compressMemoryText(
  text
){

  return normalizeMemoryText(
    text
  )
  .replace(
    /\s+/g,
    " "
  );

}



// =====================================
// MEMORY RELEVANCE
// =====================================

function calculateMemoryRelevance(
  text,
  query
){

  const normalizedText =
  normalizeMemoryTextLower(
    text
  );

  const normalizedQuery =
  normalizeMemoryTextLower(
    query
  );

  if(

    !normalizedText ||

    !normalizedQuery

  ){

    return 0;

  }

  if(
    normalizedText ===
    normalizedQuery
  ){

    return 1;
  }

  if(

    normalizedText.includes(
      normalizedQuery
    )

  ){

    return 0.85;
  }

  const textTokens =
  tokenizeMemoryText(
    normalizedText
  );

  const queryTokens =
  tokenizeMemoryText(
    normalizedQuery
  );

  if(
    queryTokens.length <= 0
  ){

    return 0;
  }

  let matches = 0;

  queryTokens.forEach((token) => {

    if(
      textTokens.includes(
        token
      )
    ){

      matches++;

    }

  });

  return normalizeMemoryScore(
    matches /
    queryTokens.length
  );

}



// =====================================
// SAFE COMPARE
// =====================================

function areMemoryValuesEqual(
  firstValue,
  secondValue
){

  return (

    safeJsonStringify(
      firstValue
    )

    ===

    safeJsonStringify(
      secondValue
    )

  );

}



// =====================================
// INDEX HELPERS
// =====================================

function addIndexedMemoryId(
  indexMap,
  key,
  memoryId
){

  if(

    !(indexMap instanceof Map)

    ||

    !key

    ||

    !memoryId

  ){

    return false;

  }

  const normalizedKey =
  normalizeMemoryTextLower(
    key
  );

  if(
    !indexMap.has(
      normalizedKey
    )
  ){

    indexMap.set(
      normalizedKey,
      new Set()
    );

  }

  indexMap
  .get(
    normalizedKey
  )
  .add(
    memoryId
  );

  return true;

}



function removeIndexedMemoryId(
  indexMap,
  key,
  memoryId
){

  if(

    !(indexMap instanceof Map)

    ||

    !key

    ||

    !memoryId

  ){

    return false;

  }

  const normalizedKey =
  normalizeMemoryTextLower(
    key
  );

  const values =
  indexMap.get(
    normalizedKey
  );

  if(!values){

    return false;

  }

  values.delete(
    memoryId
  );

  if(
    values.size <= 0
  ){

    indexMap.delete(
      normalizedKey
    );

  }

  return true;

}



function getIndexedMemoryIds(
  indexMap,
  key
){

  if(

    !(indexMap instanceof Map)

    ||

    !key

  ){

    return [];

  }

  const normalizedKey =
  normalizeMemoryTextLower(
    key
  );

  return [

    ...(indexMap.get(
      normalizedKey
    )

    ||

    new Set())

  ];

}



// =====================================
// MEMORY OBJECT VALIDATION
// =====================================

function isValidMemoryObject(
  memory
){

  return (

    memory &&

    typeof memory ===
    "object"

    &&

    typeof memory.id ===
    "string"

    &&

    typeof memory.type ===
    "string"

  );

}



// =====================================
// MEMORY SCORE NORMALIZATION
// =====================================

function normalizeMemoryScore(
  score
){

  return clampMemoryNumber(
    score,
    0,
    1
  );

}



// =====================================
// RETRY HELPER
// =====================================

async function retryMemoryOperation(
  operation,
  retries =
  MEMORY_UTILS_CONFIG
  .MAX_RETRY_COUNT
){

  let lastError = null;

  for(

    let attempt = 0;

    attempt <= retries;

    attempt++

  ){

    try{

      return await operation();

    }

    catch(error){

      lastError = error;

    }

  }

  throw lastError;

}



// =====================================
// DEBOUNCE
// =====================================

function debounceMemoryFunction(
  callback,
  delay =
  MEMORY_UTILS_CONFIG
  .DEFAULT_DEBOUNCE
){

  let timer = null;

  return function(...args){

    clearTimeout(
      timer
    );

    timer = setTimeout(() => {

      callback.apply(
        this,
        args
      );

    },delay);

  };

}



// =====================================
// THROTTLE
// =====================================

function throttleMemoryFunction(
  callback,
  delay =
  MEMORY_UTILS_CONFIG
  .DEFAULT_THROTTLE
){

  let waiting = false;

  return function(...args){

    if(waiting){

      return;
    }

    waiting = true;

    callback.apply(
      this,
      args
    );

    setTimeout(() => {

      waiting = false;

    },delay);

  };

}

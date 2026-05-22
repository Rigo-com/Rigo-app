// =====================================
// RIGO AI
// MEMORY UTILS
// ENTERPRISE INFINITY GOD FINAL
// =====================================



// =====================================
// TOKENIZATION CONFIG
// =====================================

const MEMORY_UTILS_CONFIG =
Object.freeze({

  MIN_TOKEN_LENGTH:2,

  MAX_TOKEN_LENGTH:50,

  MAX_TOKENS:500,

  HASH_LENGTH:32,

  MAX_TEXT_LENGTH:50000,

  MAX_ARRAY_LENGTH:10000

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

    .split(/[^a-z0-9_]+/)

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

function createMemoryHash(
  value
){

  const normalizedValue =
  normalizeMemoryText(
    value
  );

  let hash = 0;

  for(

    let index = 0;

    index <
    normalizedValue.length;

    index++

  ){

    const charCode =

      normalizedValue
      .charCodeAt(index);

    hash =

      (
        hash << 5
      )

      -

      hash +

      charCode;

    hash |= 0;

  }

  return Math.abs(
    hash
  )
  .toString(16)
  .padStart(

    MEMORY_UTILS_CONFIG
    .HASH_LENGTH,

    "0"

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

    return JSON.stringify(
      value
    );

  }

  catch(error){

    return fallback;

  }

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

    return 0.8;
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

  return matches /
  queryTokens.length;

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

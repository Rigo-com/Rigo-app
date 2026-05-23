// =====================================
// SECURITY HELPERS
// =====================================

function normalizeSecurityString(
  value
){

  return normalizeMemoryString(
    value
  )
  .replace(/\0/g,"")
  .trim();

}



function isCryptoAvailable(){

  return (

    typeof crypto !==
    "undefined"

    &&

    typeof crypto.subtle !==
    "undefined"

  );

}



function createSecurityTimestamp(){

  return Date.now();

}



// =====================================
// SECURE STRING COMPARE
// =====================================

function secureCompareStrings(
  valueA,
  valueB
){

  try{

    const normalizedA =
    String(valueA || "");

    const normalizedB =
    String(valueB || "");

    if(
      normalizedA.length !==
      normalizedB.length
    ){

      return false;

    }

    let result = 0;

    for(
      let i = 0;
      i < normalizedA.length;
      i++
    ){

      result |= (

        normalizedA.charCodeAt(i)

        ^

        normalizedB.charCodeAt(i)

      );

    }

    return result === 0;

  }

  catch(error){

    return false;

  }

}



// =====================================
// ENCRYPTION KEY VALIDATION
// =====================================

function isValidEncryptionKey(
  encryptionKey
){

  if(
    !encryptionKey
  ){

    return false;

  }

  if(
    typeof CryptoKey !==
    "undefined"
  ){

    return (
      encryptionKey instanceof
      CryptoKey
    );
  }

  return false;

}



// =====================================
// HASH GENERATION
// =====================================

async function createMemoryHash(
  value
){

  try{

    if(
      !isCryptoAvailable()
    ){

      return null;

    }

    const normalizedValue =
    String(value ?? "");

    const encodedValue =
    getMemoryTextEncoder()
    .encode(
      normalizedValue
    );

    const hashBuffer =
    await crypto.subtle.digest(
      "SHA-256",
      encodedValue
    );

    const hashArray =

      Array.from(
        new Uint8Array(
          hashBuffer
        )
      );

    return hashArray
    .map((byte) => {

      return byte
      .toString(16)
      .padStart(2,"0");

    })
    .join("");

  }

  catch(error){

    storeSecurityError(
      error
    );

    return null;

  }

}



// =====================================
// VERIFY SIGNATURE
// =====================================

async function verifyMemorySignature(
  memory
){

  try{

    if(!memory){

      return false;

    }

    const trustedSignature =

      memorySecurityState
      .trustedSignatures
      .get(
        memory.id
      );

    if(
      !trustedSignature
    ){

      return null;

    }

    const currentSignature =
    await createMemoryHash(
      JSON.stringify({

        id:memory.id,

        content:memory.content,

        updatedAt:
        memory.updatedAt,

        version:
        memory.version

      })
    );

    return secureCompareStrings(
      trustedSignature,
      currentSignature
    );

  }

  catch(error){

    storeSecurityError(
      error
    );

    return false;

  }

}



// =====================================
// TAMPER DETECTION
// =====================================

async function detectMemoryTampering(
  memory
){

  try{

    const trusted =

      await verifyMemorySignature(
        memory
      );

    if(
      trusted === true
    ){

      return false;

    }

    if(
      trusted === null
    ){

      return false;

    }

    memorySecurityState
    .tamperedMemories
    .add(
      memory.id
    );

    memorySecurityState
    .lastTamperDetectedAt =
    Date.now();

    markMemoryCorrupted(
      memory.id
    );

    return true;

  }

  catch(error){

    storeSecurityError(
      error
    );

    return false;

  }

}



// =====================================
// RANDOM IV
// =====================================

function createEncryptionIV(){

  if(
    !isCryptoAvailable()
  ){

    return null;

  }

  return crypto
  .getRandomValues(
    new Uint8Array(12)
  );

}



// =====================================
// ENCRYPT MEMORY CONTENT
// =====================================

async function encryptMemoryContent(
  content,
  encryptionKey
){

  try{

    if(
      !MEMORY_SECURITY_CONFIG
      .ENABLE_ENCRYPTION
    ){

      return null;

    }

    if(
      !isValidEncryptionKey(
        encryptionKey
      )
    ){

      return null;

    }

    const normalizedContent =
    normalizeMemoryContent(
      content
    );

    if(

      normalizedContent.length >

      MEMORY_SECURITY_CONFIG
      .MAX_ENCRYPTION_SIZE

    ){

      return null;

    }

    const iv =
    createEncryptionIV();

    if(!iv){

      return null;

    }

    const encodedContent =
    getMemoryTextEncoder()
    .encode(
      normalizedContent
    );

    const encryptedBuffer =
    await crypto.subtle.encrypt({

      name:"AES-GCM",

      iv

    },

    encryptionKey,

    encodedContent);

    memorySecurityState
    .lastEncryptionAt =
    Date.now();

    memorySecurityState
    .totalEncryptions++;

    return {

      encryptedData:
      arrayBufferToBase64(
        encryptedBuffer
      ),

      iv:
      arrayBufferToBase64(
        iv
      )

    };

  }

  catch(error){

    memorySecurityState
    .failedEncryptions++;

    storeSecurityError(
      error
    );

    return null;

  }

}



// =====================================
// DECRYPT MEMORY CONTENT
// =====================================

async function decryptMemoryContent(
  encryptedPayload,
  encryptionKey
){

  try{

    if(
      !encryptedPayload
    ){

      return null;

    }

    if(

      !encryptedPayload
      .encryptedData ||

      !encryptedPayload
      .iv

    ){

      return null;

    }

    if(
      !isValidEncryptionKey(
        encryptionKey
      )
    ){

      return null;

    }

    const encryptedBytes =
    base64ToUint8Array(
      encryptedPayload
      .encryptedData
    );

    const iv =
    base64ToUint8Array(
      encryptedPayload.iv
    );

    const decryptedBuffer =
    await crypto.subtle.decrypt({

      name:"AES-GCM",

      iv

    },

    encryptionKey,

    encryptedBytes);

    const decryptedContent =
    getMemoryTextDecoder()
    .decode(
      decryptedBuffer
    );

    memorySecurityState
    .totalDecryptions++;

    return decryptedContent;

  }

  catch(error){

    memorySecurityState
    .failedDecryptions++;

    storeSecurityError(
      error
    );

    return null;

  }

}



// =====================================
// SANITIZE SECURE CONTENT
// =====================================

function sanitizeSecureMemoryContent(
  content
){

  if(
    typeof content !==
    "string"
  ){

    return "";
  }

  return content

  .replace(
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    ""
  )

  .replace(
    /javascript:/gi,
    ""
  )

  .replace(
    /onerror=/gi,
    ""
  )

  .replace(
    /onload=/gi,
    ""
  )

  .replace(
    /eval\s*\(/gi,
    ""
  )

  .replace(
    /Function\s*\(/gi,
    ""
  )

  .replace(
    /ignore\s+previous\s+instructions/gi,
    ""
  )

  .replace(
    /system\s*prompt/gi,
    ""
  )

  .replace(
    /data:text\/html/gi,
    ""
  )

  .replace(
    /vbscript:/gi,
    ""
  )

  .trim();

}



// =====================================
// MEMORY INTEGRITY CHECK
// =====================================

async function runMemoryIntegrityCheck(){

  try{

    const memories =

      Array.isArray(
        memoryState.memories
      )

      ? memoryState.memories

      : [];

    let validCount = 0;

    let corruptedCount = 0;

    for(
      const memory
      of memories
    ){

      const valid =
      await verifyMemorySignature(
        memory
      );

      if(
        valid === true
      ){

        validCount++;

      }

      else if(
        valid === false
      ){

        corruptedCount++;

        memorySecurityState
        .tamperedMemories
        .add(
          memory.id
        );

      }

    }

    memorySecurityState
    .lastIntegrityCheckAt =
    Date.now();

    return {

      valid:
      corruptedCount <= 0,

      total:
      memories.length,

      validCount,

      corruptedCount

    };

  }

  catch(error){

    storeSecurityError(
      error
    );

    return {

      valid:false,

      total:0,

      validCount:0,

      corruptedCount:0

    };

  }

}



// =====================================
// SECURE MEMORY EXPORT
// =====================================

async function createSecureMemoryExport(){

  try{

    const memories =
    cloneMemoryObject(
      memoryState.memories
    );

    const serialized =
    JSON.stringify(
      memories
    );

    if(

      serialized.length >

      MEMORY_SECURITY_CONFIG
      .MAX_EXPORT_SIZE

    ){

      return null;

    }

    const frozenMemories =
    deepFreeze(
      cloneMemoryObject(
        memories
      )
    );

    const signatures = [];

    for(
      const memory
      of frozenMemories
    ){

      const signature =
      await createMemorySignature(
        memory
      );

      signatures.push({

        memoryId:
        memory.id,

        signature

      });

    }

    const exportChecksum =
    await createMemoryHash(
      serialized
    );

    return {

      exportId:
      createMemoryId(),

      version:
      MEMORY_SECURITY_CONFIG
      .SECURITY_VERSION,

      exportedAt:
      Date.now(),

      memoryCount:
      memories.length,

      checksum:
      exportChecksum,

      signatures,

      memories

    };

  }

  catch(error){

    storeSecurityError(
      error
    );

    return null;

  }

}



// =====================================
// SESSION SECURITY
// =====================================

function createSecureSession(){

  const session =
  deepFreeze({

    sessionId:
    createMemoryId(),

    createdAt:
    Date.now(),

    trusted:true

  });

  memorySecurityState
  .activeSessions
  .add(session);

  return session;

}



// =====================================
// SECURITY DIAGNOSTICS
// =====================================

function getMemorySecurityDiagnostics(){

  return deepFreeze({

    initialized:
    memorySecurityState
    .initialized,

    encryptionEnabled:
    MEMORY_SECURITY_CONFIG
    .ENABLE_ENCRYPTION,

    integrityEnabled:
    MEMORY_SECURITY_CONFIG
    .ENABLE_INTEGRITY_CHECKS,

    tamperDetectionEnabled:
    MEMORY_SECURITY_CONFIG
    .ENABLE_TAMPER_DETECTION,

    securityVersion:
    MEMORY_SECURITY_CONFIG
    .SECURITY_VERSION,

    totalEncryptions:
    memorySecurityState
    .totalEncryptions,

    totalDecryptions:
    memorySecurityState
    .totalDecryptions,

    failedEncryptions:
    memorySecurityState
    .failedEncryptions,

    failedDecryptions:
    memorySecurityState
    .failedDecryptions,

    trustedSignatures:

      memorySecurityState
      .trustedSignatures
      .size,

    tamperedMemories:

      memorySecurityState
      .tamperedMemories
      .size,

    activeSessions:

      memorySecurityState
      .activeSessions
      .size,

    securityErrors:

      memorySecurityState
      .securityErrors
      .length,

    lastIntegrityCheckAt:

      memorySecurityState
      .lastIntegrityCheckAt,

    lastTamperDetectedAt:

      memorySecurityState
      .lastTamperDetectedAt,

    lastEncryptionAt:

      memorySecurityState
      .lastEncryptionAt

  });

}

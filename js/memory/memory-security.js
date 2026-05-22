// =====================================
// RIGO AI
// MEMORY SECURITY
// ENTERPRISE INFINITY ULTRA FINAL
// =====================================



// =====================================
// SECURITY CONFIG
// =====================================

const MEMORY_SECURITY_CONFIG =
Object.freeze({

  ENABLE_ENCRYPTION:true,

  ENABLE_INTEGRITY_CHECKS:true,

  ENABLE_TAMPER_DETECTION:true,

  ENABLE_SANITIZATION:true,

  ENABLE_SECURE_EXPORTS:true,

  MAX_SECURITY_ERRORS:100,

  HASH_LENGTH:64,

  SIGNATURE_LENGTH:128,

  MAX_ENCRYPTION_SIZE:
  1024 * 1024 * 5,

  SECURITY_VERSION:"1.0.0"

});



// =====================================
// SECURITY STATE
// =====================================

const memorySecurityState =
Object.seal({

  initialized:false,

  securityErrors:[],

  tamperedMemories:
  new Set(),

  trustedSignatures:
  new Map(),

  activeSessions:
  new Set(),

  lastIntegrityCheckAt:null,

  lastTamperDetectedAt:null,

  lastEncryptionAt:null,

  totalEncryptions:0,

  totalDecryptions:0,

  failedEncryptions:0,

  failedDecryptions:0

});



// =====================================
// SAFE TEXT ENCODER
// =====================================

function getMemoryTextEncoder(){

  return new TextEncoder();

}



function getMemoryTextDecoder(){

  return new TextDecoder();

}



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
// SECURITY ERROR
// =====================================

function storeSecurityError(
  error
){

  const safeError = {

    id:createMemoryId(),

    message:
    normalizeSecurityString(
      error?.message ||
      String(error)
    ),

    timestamp:
    createSecurityTimestamp()

  };

  memorySecurityState
  .securityErrors
  .push(
    safeError
  );

  if(

    memorySecurityState
    .securityErrors
    .length >

    MEMORY_SECURITY_CONFIG
    .MAX_SECURITY_ERRORS

  ){

    memorySecurityState
    .securityErrors
    .shift();

  }

  return safeError;

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
    normalizeSecurityString(
      value
    );

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
// MEMORY SIGNATURE
// =====================================

async function createMemorySignature(
  memory
){

  try{

    if(!memory){

      return null;

    }

    const payload =
    JSON.stringify({

      id:memory.id,

      content:memory.content,

      updatedAt:memory.updatedAt,

      version:memory.version

    });

    const hash =
    await createMemoryHash(
      payload
    );

    if(!hash){

      return null;

    }

    memorySecurityState
    .trustedSignatures
    .set(
      memory.id,
      hash
    );

    return hash;

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

      return false;

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

    return (
      trustedSignature ===
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

    if(trusted){

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
// ENCRYPTION KEY
// =====================================

async function createEncryptionKey(){

  try{

    if(
      !isCryptoAvailable()
    ){

      return null;

    }

    return await crypto.subtle
    .generateKey({

      name:"AES-GCM",

      length:256

    },

    true,

    [

      "encrypt",

      "decrypt"

    ]);

  }

  catch(error){

    storeSecurityError(
      error
    );

    return null;

  }

}



// =====================================
// RANDOM IV
// =====================================

function createEncryptionIV(){

  return crypto
  .getRandomValues(
    new Uint8Array(12)
  );

}



// =====================================
// ARRAYBUFFER HELPERS
// =====================================

function arrayBufferToBase64(
  buffer
){

  let binary = "";

  const bytes =
  new Uint8Array(
    buffer
  );

  bytes.forEach((byte) => {

    binary +=
    String.fromCharCode(
      byte
    );

  });

  return btoa(binary);

}



function base64ToUint8Array(
  base64
){

  const binary =
  atob(base64);

  const bytes =
  new Uint8Array(
    binary.length
  );

  for(

    let i = 0;

    i < binary.length;

    i++

  ){

    bytes[i] =
    binary.charCodeAt(i);

  }

  return bytes;

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

      if(valid){

        validCount++;

      }

      else{

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

    const signatures = [];

    for(
      const memory
      of memories
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

  const session = {

    sessionId:
    createMemoryId(),

    createdAt:
    Date.now(),

    trusted:true

  };

  memorySecurityState
  .activeSessions
  .add(
    session.sessionId
  );

  return deepFreeze(
    session
  );

}



function invalidateSecureSession(
  sessionId
){

  return memorySecurityState
  .activeSessions
  .delete(
    normalizeMemoryString(
      sessionId
    )
  );

}



// =====================================
// SECURITY DIAGNOSTICS
// =====================================

function getMemorySecurityDiagnostics(){

  return {

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

  };

}

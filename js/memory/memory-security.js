// =====================================
// RIGO AI
// MEMORY SECURITY
// FINAL OPTIMIZED BUILD
// =====================================



// =====================================
// SECURITY HELPERS
// =====================================

function normalizeSecurityValue(
  value
){

  return String(
    value ?? ""
  )

  .replace(/\0/g,"")
  .trim();

}



function cryptoSupported(){

  return (

    typeof crypto !==
    "undefined"

    &&

    crypto?.subtle

  );

}



// =====================================
// CONSTANT TIME COMPARE
// =====================================

function secureCompareStrings(
  valueA,
  valueB
){

  try{

    const safeA =
    String(valueA ?? "");

    const safeB =
    String(valueB ?? "");

    const maxLength =
    Math.max(
      safeA.length,
      safeB.length
    );

    let result =
    safeA.length ^
    safeB.length;

    for(
      let index = 0;
      index < maxLength;
      index++
    ){

      result |=

        (
          safeA.charCodeAt(index) || 0
        )

        ^

        (
          safeB.charCodeAt(index) || 0
        );

    }

    return result === 0;

  }

  catch{

    return false;

  }

}



// =====================================
// ENCRYPTION KEY
// =====================================

let memoryEncryptionKey =
null;



function isValidEncryptionKey(
  encryptionKey
){

  return (

    typeof CryptoKey !==
    "undefined"

    &&

    encryptionKey instanceof
    CryptoKey

  );

}



async function getOrCreateMemoryEncryptionKey(){

  try{

    if(
      memoryEncryptionKey
    ){

      return memoryEncryptionKey;

    }

    if(
      typeof createEncryptionKey !==
      "function"
    ){

      return null;

    }

    memoryEncryptionKey =
    await createEncryptionKey();

    return memoryEncryptionKey;

  }

  catch(error){

    storeSecurityError?.(
      error
    );

    return null;

  }

}



async function rotateEncryptionKey(){

  try{

    memoryEncryptionKey =
    await createEncryptionKey?.();

    return !!memoryEncryptionKey;

  }

  catch(error){

    storeSecurityError?.(
      error
    );

    return false;

  }

}



// =====================================
// HASHING
// =====================================

async function createMemoryHash(
  value
){

  try{

    if(
      !cryptoSupported()
    ){

      return null;

    }

    const encoder =

      getMemoryTextEncoder?.();

    if(!encoder){

      return null;

    }

    const encoded =
    encoder.encode(
      String(value ?? "")
    );

    const hashBuffer =
    await crypto.subtle.digest(
      "SHA-256",
      encoded
    );

    return Array
    .from(
      new Uint8Array(
        hashBuffer
      )
    )
    .map((byte) => {

      return byte
      .toString(16)
      .padStart(2,"0");

    })
    .join("");

  }

  catch(error){

    storeSecurityError?.(
      error
    );

    return null;

  }

}



// =====================================
// SIGNATURE VERIFICATION
// =====================================

async function verifyMemorySignature(
  memory
){

  try{

    if(
      !memory?.id
    ){

      return false;

    }

    const trustedSignature =

      memorySecurityState
      ?.trustedSignatures
      ?.get?.(
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

        id:
        memory.id,

        content:
        memory.content,

        updatedAt:
        memory.updatedAt,

        version:
        memory.version

      })
    );

    if(
      !currentSignature
    ){

      return false;

    }

    const valid =
    secureCompareStrings(

      trustedSignature,

      currentSignature

    );

    if(
      !valid
    ){

      memorySecurityState
      ?.tamperedMemories
      ?.add?.(
        memory.id
      );

      memorySecurityState
      .lastTamperDetectedAt =
      Date.now();

      markMemoryCorrupted?.(
        memory.id
      );

    }

    return valid;

  }

  catch(error){

    storeSecurityError?.(
      error
    );

    return false;

  }

}



// =====================================
// ENCRYPTION HELPERS
// =====================================

function createEncryptionIV(){

  if(
    !cryptoSupported()
  ){

    return null;

  }

  return crypto
  .getRandomValues(
    new Uint8Array(12)
  );

}



async function encryptMemoryContent(
  content,
  encryptionKey =
  memoryEncryptionKey
){

  try{

    if(

      !MEMORY_SECURITY_CONFIG
      ?.ENABLE_ENCRYPTION

    ){

      return null;

    }

    const encoder =
    getMemoryTextEncoder?.();

    if(
      !encoder
    ){

      return null;

    }

    if(
      !encryptionKey
    ){

      encryptionKey =
      await getOrCreateMemoryEncryptionKey();

    }

    if(
      !isValidEncryptionKey(
        encryptionKey
      )
    ){

      return null;

    }

    const normalizedContent =

      normalizeMemoryContent?.(
        content
      )

      ||

      String(content ?? "");

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

    const encryptedBuffer =
    await crypto.subtle.encrypt({

      name:"AES-GCM",

      iv

    },

    encryptionKey,

    encoder.encode(
      normalizedContent
    ));

    memorySecurityState
    .totalEncryptions++;

    memorySecurityState
    .lastEncryptionAt =
    Date.now();

    return {

      encryptedData:
      arrayBufferToBase64?.(
        encryptedBuffer
      ),

      iv:
      arrayBufferToBase64?.(
        iv
      )

    };

  }

  catch(error){

    memorySecurityState
    .failedEncryptions++;

    storeSecurityError?.(
      error
    );

    return null;

  }

}



async function decryptMemoryContent(
  encryptedPayload,
  encryptionKey =
  memoryEncryptionKey
){

  try{

    if(
      !encryptedPayload
    ){

      return null;

    }

    const decoder =
    getMemoryTextDecoder?.();

    if(
      !decoder
    ){

      return null;

    }

    if(
      !encryptionKey
    ){

      encryptionKey =
      await getOrCreateMemoryEncryptionKey();

    }

    if(
      !isValidEncryptionKey(
        encryptionKey
      )
    ){

      return null;

    }

    const encryptedBytes =
    base64ToUint8Array?.(
      encryptedPayload
      .encryptedData
    );

    const iv =
    base64ToUint8Array?.(
      encryptedPayload.iv
    );

    const decryptedBuffer =
    await crypto.subtle.decrypt({

      name:"AES-GCM",

      iv

    },

    encryptionKey,

    encryptedBytes);

    memorySecurityState
    .totalDecryptions++;

    return decoder.decode(
      decryptedBuffer
    );

  }

  catch(error){

    memorySecurityState
    .failedDecryptions++;

    storeSecurityError?.(
      error
    );

    return null;

  }

}



// =====================================
// CONTENT CLEANER
// =====================================

function stripUnsafeContentPatterns(
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
    /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
    ""
  )

  .replace(
    /javascript:/gi,
    ""
  )

  .replace(
    /vbscript:/gi,
    ""
  )

  .replace(
    /data:text\/html/gi,
    ""
  )

  .replace(
    /\bon\w+=/gi,
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
    /document\.cookie/gi,
    ""
  )

  .replace(
    /localStorage/gi,
    ""
  )

  .replace(
    /sessionStorage/gi,
    ""
  )

  .trim();

}



// =====================================
// INTEGRITY CHECK
// =====================================

async function runMemoryIntegrityCheck(){

  try{

    const memories =

      Array.isArray(
        memoryState?.memories
      )

      ? memoryState.memories

      : [];

    const verificationResults =
    await Promise.allSettled(

      memories.map((memory) => {

        return verifyMemorySignature(
          memory
        );

      })

    );

    let validCount = 0;

    let corruptedCount = 0;

    verificationResults
    .forEach((result) => {

      if(
        result.status !==
        "fulfilled"
      ){

        return;
      }

      if(
        result.value === true
      ){

        validCount++;

      }

      else if(
        result.value === false
      ){

        corruptedCount++;

      }

    });

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

    storeSecurityError?.(
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
// SECURITY EXPORT
// =====================================

async function createSecureMemoryExport(){

  try{

    const memories =
    cloneMemoryObject?.(

      memoryState?.memories || []

    );

    if(
      !Array.isArray(
        memories
      )
    ){

      return null;

    }

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

    const signatures =
    await Promise.all(

      memories.map(async (
        memory
      ) => {

        if(
          !memory?.id
        ){

          return null;

        }

        return {

          memoryId:
          memory.id,

          signature:

            await createMemorySignature?.(
              memory
            )

        };

      })

    );

    return {

      exportId:
      createMemoryId?.(),

      version:
      MEMORY_SECURITY_CONFIG
      ?.SECURITY_VERSION,

      exportedAt:
      Date.now(),

      memoryCount:
      memories.length,

      checksum:
      await createMemoryHash(
        serialized
      ),

      signatures:
      signatures.filter(Boolean),

      memories

    };

  }

  catch(error){

    storeSecurityError?.(
      error
    );

    return null;

  }

}



// =====================================
// SECURITY STATE HELPERS
// =====================================

function clearTamperedMemories(){

  memorySecurityState
  ?.tamperedMemories
  ?.clear?.();

  return true;

}



function cleanupSecurityState(){

  clearTamperedMemories();

  memorySecurityState
  ?.securityErrors
  ?.splice?.(0);

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getMemorySecurityDiagnostics(){

  return {

    initialized:
    memorySecurityState
    ?.initialized,

    encryptionEnabled:
    MEMORY_SECURITY_CONFIG
    ?.ENABLE_ENCRYPTION,

    integrityEnabled:
    MEMORY_SECURITY_CONFIG
    ?.ENABLE_INTEGRITY_CHECKS,

    tamperDetectionEnabled:
    MEMORY_SECURITY_CONFIG
    ?.ENABLE_TAMPER_DETECTION,

    securityVersion:
    MEMORY_SECURITY_CONFIG
    ?.SECURITY_VERSION,

    totalEncryptions:
    memorySecurityState
    ?.totalEncryptions,

    totalDecryptions:
    memorySecurityState
    ?.totalDecryptions,

    failedEncryptions:
    memorySecurityState
    ?.failedEncryptions,

    failedDecryptions:
    memorySecurityState
    ?.failedDecryptions,

    trustedSignatures:

      memorySecurityState
      ?.trustedSignatures
      ?.size,

    tamperedMemories:

      memorySecurityState
      ?.tamperedMemories
      ?.size,

    activeSessions:

      memorySecurityState
      ?.activeSessions
      ?.size,

    securityErrors:

      memorySecurityState
      ?.securityErrors
      ?.length,

    lastIntegrityCheckAt:

      memorySecurityState
      ?.lastIntegrityCheckAt,

    lastTamperDetectedAt:

      memorySecurityState
      ?.lastTamperDetectedAt,

    lastEncryptionAt:

      memorySecurityState
      ?.lastEncryptionAt

  };

}



// =====================================
// PUBLIC API
// =====================================

const MemorySecurity =
Object.freeze({

  createHash:
  createMemoryHash,

  verifySignature:
  verifyMemorySignature,

  encrypt:
  encryptMemoryContent,

  decrypt:
  decryptMemoryContent,

  integrityCheck:
  runMemoryIntegrityCheck,

  secureExport:
  createSecureMemoryExport,

  sanitize:
  stripUnsafeContentPatterns,

  rotateKey:
  rotateEncryptionKey,

  clearTampered:
  clearTamperedMemories,

  cleanup:
  cleanupSecurityState,

  diagnostics:
  getMemorySecurityDiagnostics

});



// =====================================
// EXPORTS
// =====================================

export {

  normalizeSecurityValue,

  secureCompareStrings,

  createMemoryHash,

  verifyMemorySignature,

  encryptMemoryContent,

  decryptMemoryContent,

  stripUnsafeContentPatterns,

  runMemoryIntegrityCheck,

  createSecureMemoryExport,

  rotateEncryptionKey,

  clearTamperedMemories,

  cleanupSecurityState,

  getMemorySecurityDiagnostics,

  MemorySecurity

};



export default
MemorySecurity;

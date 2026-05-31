// =====================================
// RIGO AI
// API CONFIG
// =====================================

const API_CONFIG =
Object.freeze({

  DEFAULT_TIMEOUT:
  30000,

  MAX_RETRIES:
  3,

  RETRY_DELAY:
  1000,

  MAX_CONCURRENT_REQUESTS:
  100,

  UPLOAD_ENDPOINT:
  "/files/upload"

});

export {

  API_CONFIG

};

export default
API_CONFIG;

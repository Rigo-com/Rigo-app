// =====================================
// RIGO AI
// FILE CONFIG
// FILE CONFIGURATION LAYER
// =====================================



// =====================================
// FILE CONFIG
// =====================================

const FILE_CONFIG =
Object.freeze({

  MAX_FILE_SIZE:
  10 * 1024 * 1024,

  MAX_FILES:
  5,

  MAX_QUEUE_SIZE:
  20,

  ALLOWED_TYPES:
  Object.freeze([

    "image/jpeg",

    "image/png",

    "image/webp",

    "text/plain",

    "application/json",

    "application/pdf"

  ]),

  ALLOWED_EXTENSIONS:
  Object.freeze([

    ".jpg",

    ".jpeg",

    ".png",

    ".webp",

    ".txt",

    ".json",

    ".pdf"

  ]),

  TEXT_READABLE_TYPES:
  Object.freeze([

    "text/plain",

    "application/json"

  ])

});



// =====================================
// EXPORTS
// =====================================

export {

  FILE_CONFIG

};

export default
FILE_CONFIG;

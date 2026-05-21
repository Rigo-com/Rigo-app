// =====================================
// RIGO AI
// CONFIG
// =====================================

const APP_CONFIG =
Object.freeze({

  APP:Object.freeze({

    NAME:"RIGO AI",

    VERSION:"1.0.0"

  }),

  CHAT:Object.freeze({

    TITLE_LIMIT:30,

    AI_DELAY:1200,

    MAX_MESSAGE_LENGTH:5000,

    MAX_PENDING_MESSAGES:10,

    VALID_ROLES:Object.freeze([

      "user",

      "assistant"

    ])

  })

});

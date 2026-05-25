// =====================================
// RIGO AI
// EVENTS INDEX
// SAFE EVENT COMPOSITION LAYER
// =====================================



// =====================================
// HELPERS
// =====================================

function getEventDependency(
  dependencyName
){

  try{

    if(
      typeof window ===
      "undefined"
    ){

      return null;

    }

    const dependency =
      window[dependencyName];

    if(
      typeof dependency ===
      "undefined"
    ){

      console.warn(
        `[EventsAPI] Missing dependency: ${dependencyName}`
      );

      return null;

    }

    return dependency;

  }

  catch(error){

    console.warn(
      `[EventsAPI] Failed resolving dependency: ${dependencyName}`,
      error
    );

    return null;

  }

}



function isFunction(value){

  return typeof value ===
  "function";

}



function safeFreeze(
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

  if(

    value instanceof Date ||
    value instanceof RegExp ||
    value instanceof Map ||
    value instanceof Set ||
    value instanceof HTMLElement

  ){

    return value;

  }

  visited.add(value);

  Object.freeze(value);

  Object.values(value).forEach((nestedValue) => {

    if(
      nestedValue &&
      typeof nestedValue ===
      "object"
    ){

      safeFreeze(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



async function safelyExecuteEventOperation(
  label,
  operation,
  fallback = null
){

  try{

    if(
      !isFunction(operation)
    ){

      return fallback;

    }

    return await operation();

  }

  catch(error){

    console.warn(
      `[EventsAPI] ${label} failed`,
      error
    );

    return fallback;

  }

}



// =====================================
// READONLY ACCESS
// =====================================

function getReadonlySystemEvents(){

  return safelyExecuteEventOperation(

    "Readonly system events access",

    async() => {

      const systemEvents =
        getEventDependency(
          "SystemEvents"
        );

      if(!systemEvents){
        return null;
      }

      return safeFreeze({

        diagnostics:

          isFunction(
            systemEvents.diagnostics
          )

          ?

          await systemEvents
          .diagnostics()

          :

          null

      });

    },

    null

  );

}



function getReadonlyAppEvents(){

  return safelyExecuteEventOperation(

    "Readonly app events access",

    async() => {

      const appEvents =
        getEventDependency(
          "AppEvents"
        );

      if(!appEvents){
        return null;
      }

      return safeFreeze({

        diagnostics:

          isFunction(
            appEvents.diagnostics
          )

          ?

          await appEvents
          .diagnostics()

          :

          null

      });

    },

    null

  );

}



// =====================================
// EVENTS API
// =====================================

const EventsAPI =
safeFreeze({



  // ===================================
  // SYSTEM EVENTS
  // ===================================

  system:{

    readonly:
    getReadonlySystemEvents,



    on(...args){

      const systemEvents =
        getEventDependency(
          "SystemEvents"
        );

      if(
        !systemEvents ||
        !isFunction(systemEvents.on)
      ){

        return null;

      }

      return systemEvents.on(
        ...args
      );

    },



    once(...args){

      const systemEvents =
        getEventDependency(
          "SystemEvents"
        );

      if(
        !systemEvents ||
        !isFunction(systemEvents.once)
      ){

        return null;

      }

      return systemEvents.once(
        ...args
      );

    },



    off(...args){

      const systemEvents =
        getEventDependency(
          "SystemEvents"
        );

      if(
        !systemEvents ||
        !isFunction(systemEvents.off)
      ){

        return false;

      }

      return systemEvents.off(
        ...args
      );

    },



    emit:
    async(...args) => {

      return safelyExecuteEventOperation(

        "System event emit",

        async() => {

          const emitter =
            getEventDependency(
              "emitSystemEvent"
            );

          return emitter
            ? await emitter(...args)
            : false;

        },

        false

      );

    },



    use(...args){

      const systemEvents =
        getEventDependency(
          "SystemEvents"
        );

      if(
        !systemEvents ||
        !isFunction(systemEvents.use)
      ){

        return null;

      }

      return systemEvents.use(
        ...args
      );

    },



    diagnostics:
    async() => {

      return safelyExecuteEventOperation(

        "System event diagnostics",

        async() => {

          const systemEvents =
            getEventDependency(
              "SystemEvents"
            );

          if(
            !systemEvents ||
            !isFunction(
              systemEvents.diagnostics
            )
          ){

            return null;

          }

          return safeFreeze(
            await systemEvents
            .diagnostics()
          );

        },

        null

      );

    },



    reset:
    async() => {

      return safelyExecuteEventOperation(

        "Reset system events",

        async() => {

          const systemEvents =
            getEventDependency(
              "SystemEvents"
            );

          if(
            !systemEvents ||
            !isFunction(
              systemEvents.reset
            )
          ){

            return false;

          }

          return await systemEvents
          .reset();

        },

        false

      );

    }

  },



  // ===================================
  // APP EVENTS
  // ===================================

  app:{

    readonly:
    getReadonlyAppEvents,



    on(...args){

      const appEvents =
        getEventDependency(
          "AppEvents"
        );

      if(
        !appEvents ||
        !isFunction(appEvents.on)
      ){

        return null;

      }

      return appEvents.on(
        ...args
      );

    },



    once(...args){

      const appEvents =
        getEventDependency(
          "AppEvents"
        );

      if(
        !appEvents ||
        !isFunction(appEvents.once)
      ){

        return null;

      }

      return appEvents.once(
        ...args
      );

    },



    off(...args){

      const appEvents =
        getEventDependency(
          "AppEvents"
        );

      if(
        !appEvents ||
        !isFunction(appEvents.off)
      ){

        return false;

      }

      return appEvents.off(
        ...args
      );

    },



    emit:
    async(...args) => {

      return safelyExecuteEventOperation(

        "App event emit",

        async() => {

          const emitter =
            getEventDependency(
              "emitAppEvent"
            );

          return emitter
            ? await emitter(...args)
            : false;

        },

        false

      );

    },



    diagnostics:
    async() => {

      return safelyExecuteEventOperation(

        "App event diagnostics",

        async() => {

          const appEvents =
            getEventDependency(
              "AppEvents"
            );

          if(
            !appEvents ||
            !isFunction(
              appEvents.diagnostics
            )
          ){

            return null;

          }

          return safeFreeze(
            await appEvents
            .diagnostics()
          );

        },

        null

      );

    }

  },



  // ===================================
  // INITIALIZATION
  // ===================================

  initialize:
  async() => {

    return safelyExecuteEventOperation(

      "Initialize events system",

      async() => {

        const initializer =
          getEventDependency(
            "initializeSystemEvents"
          );

        if(
          !initializer
        ){

          return false;

        }

        return await initializer();

      },

      false

    );

  },



  // ===================================
  // GLOBAL DIAGNOSTICS
  // ===================================

  diagnostics:
  async() => {

    return safelyExecuteEventOperation(

      "Events diagnostics",

      async() => {

        const system =
          await EventsAPI
          .system
          .diagnostics();

        const app =
          await EventsAPI
          .app
          .diagnostics();

        return safeFreeze({

          system,

          app,

          timestamp:
          Date.now()

        });

      },

      null

    );

  }

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "EventsAPI",

    {

      value:
      EventsAPI,

      writable:
      false,

      configurable:
      false

    }

  );

}

// =====================================
// RIGO AI
// AI KERNEL UTILS
// =====================================

export function freezeKernelObject(
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

    value instanceof Map ||

    value instanceof Set ||

    value instanceof WeakMap ||

    value instanceof WeakSet ||

    value instanceof AbortController ||

    value instanceof AbortSignal

  ){

    return value;

  }

  visited.add(value);

  Object.values(value)
  .forEach((nestedValue) => {

    if(
      nestedValue &&
      typeof nestedValue ===
      "object"
    ){

      freezeKernelObject(
        nestedValue,
        visited
      );

    }

  });

  return Object.freeze(
    value
  );

}



export function cloneKernelObject(
  value
){

  try{

    if(
      typeof structuredClone ===
      "function"
    ){

      return structuredClone(
        value
      );

    }

  }

  catch(error){}

  try{

    if(
      Array.isArray(value)
    ){

      return [
        ...value
      ];

    }

    if(
      value &&
      typeof value ===
      "object"
    ){

      return {
        ...value
      };

    }

    return value;

  }

  catch(error){

    return {};

  }

}



export function createKernelRequestId(){

  try{

    if(

      typeof crypto !==
      "undefined"

      &&

      typeof crypto
      .randomUUID ===
      "function"

    ){

      return (

        "kernel_req_" +

        crypto.randomUUID()

      );

    }

  }

  catch(error){}

  return (

    "kernel_req_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,12)

  );

}



export function createTimeoutPromise(
  timeout,
  callback
){

  return new Promise(

    async (
      resolve,
      reject
    ) => {

      let completed =
      false;

      const timer =
      setTimeout(() => {

        if(completed){

          return;

        }

        completed =
        true;

        reject(
          new Error(
            "REQUEST TIMEOUT"
          )
        );

      },
      timeout);

      try{

        const result =
        await callback();

        if(completed){

          return;

        }

        completed =
        true;

        clearTimeout(
          timer
        );

        resolve(
          result
        );

      }

      catch(error){

        if(completed){

          return;

        }

        completed =
        true;

        clearTimeout(
          timer
        );

        reject(
          error
        );

      }

    }

  );

}

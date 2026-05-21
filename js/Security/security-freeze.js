function deepFreezeSecurity(
  object,
  visited = new WeakMap()
){

  if(
    !object ||
    typeof object !==
    "object"
  ){

    return object;

  }

  if(
    isHostObject(object)
  ){

    return object;

  }

  const cached =
  visited.get(object);

  if(cached){

    if(
      cached.state ===
      FREEZE_STATES.FROZEN
    ){

      return cached.value;

    }

    return cached.clone;

  }

  const clone =

    Array.isArray(object)

    ?

    []

    :

    Object.create(
      Object.getPrototypeOf(
        object
      )
    );

  visited.set(object,{

    clone,

    state:
    FREEZE_STATES.PENDING

  });

  let freezeSucceeded =
  false;

  try{

    Reflect
    .ownKeys(object)
    .forEach((key) => {

      try{

        const descriptor =

          Object
          .getOwnPropertyDescriptor(
            object,
            key
          );

        if(
          !descriptor
        ){

          return;
        }

        if(
          descriptor.get ||
          descriptor.set
        ){

          return;
        }

        descriptor.value =
        deepFreezeSecurity(

          descriptor.value,

          visited

        );

        descriptor.writable =
        false;

        descriptor.configurable =
        false;

        Object.defineProperty(

          clone,

          key,

          descriptor

        );

      }

      catch(error){

        logSecurityEvent(

          "FREEZE_PROPERTY_FAILED"

        );

      }

    });

    return Object.freeze(
      clone
    );

  }

  finally{

    if(!freezeSucceeded){

      visited.delete(
        object
      );

    }

  }

}

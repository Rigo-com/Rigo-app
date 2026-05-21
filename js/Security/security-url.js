function addTrustedOrigin(
  origin
){

  if(
    typeof origin !==
    "string"
  ){

    return false;

  }

  try{

    const parsed =
    new URL(

      safeString(
        origin
      )

    );

    const protocol =
    parsed.protocol
    .toLowerCase();

    if(

      !ALLOWED_URL_PROTOCOLS
      .includes(
        protocol
      )

    ){

      logSecurityEvent(

        "UNTRUSTED PROTOCOL BLOCKED",

        {

          protocol

        }

      );

      return false;

    }

    securityState
    .trustedOrigins
    .add(
      parsed.origin
    );

    return true;

  }

  catch(error){

    return false;

  }

}



function removeTrustedOrigin(
  origin
){

  if(
    typeof origin !==
    "string"
  ){

    return false;

  }

  try{

    const parsed =
    new URL(
      origin
    );

    return securityState
    .trustedOrigins
    .delete(
      parsed.origin
    );

  }

  catch(error){

    return false;

  }

}



function safeURL(
  url
){

  if(
    typeof url !==
    "string"
  ){

    return null;

  }

  const normalized =
  safeString(url);

  if(!normalized){

    return null;

  }

  if(

    normalized.length >

    SECURITY_CONFIG
    .MAX_URL_LENGTH

  ){

    securityState
    .blockedURLs++;

    return null;

  }

  try{

    const baseOrigin =

      typeof window !==
      "undefined"

      ?

      window.location.origin

      :

      "https://localhost";

    const parsed =
    new URL(
      normalized,
      baseOrigin
    );

    const protocol =
    parsed.protocol
    .toLowerCase();

    if(

      !ALLOWED_URL_PROTOCOLS
      .includes(protocol)

    ){

      securityState
      .blockedURLs++;

      return null;

    }

    return parsed.toString();

  }

  catch(error){

    securityState
    .blockedURLs++;

    return null;

  }

}



function validateTrustedURL(
  url
){

  const safe =
  safeURL(url);

  if(!safe){

    return null;

  }

  try{

    const parsed =
    new URL(safe);

    if(

      !securityState
      .trustedOrigins
      .has(
        parsed.origin
      )

    ){

      securityState
      .blockedURLs++;

      return null;

    }

    return parsed.toString();

  }

  catch(error){

    return null;

  }

}

// =====================================
// RIGO AI
// APP ENTRYPOINT
// =====================================

if(
  typeof document !==
  "undefined"
){

  if(
    document.readyState ===
    "loading"
  ){

    document.addEventListener(

      "DOMContentLoaded",

      () => {

        startApp()
        .catch((error) => {

          safeLogError(error);

        });

      },

      { once:true }

    );

  }

  else{

    startApp()
    .catch((error) => {

      safeLogError(error);

    });

  }

}

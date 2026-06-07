import * as RIGO from "./index.js";

document.body.innerHTML = "";

const suspects = [];

for(
  const [moduleName,module]
  of Object.entries(RIGO)
){

  if(
    typeof module !==
    "object"
  ){
    continue;
  }

  for(
    const key
    of Object.keys(module)
  ){

    if(

         key.includes("render")
      || key.includes("Render")
      || key.includes("create")
      || key.includes("Create")
      || key.includes("bootstrap")
      || key.includes("initialize")

    ){

      suspects.push({

        module:
        moduleName,

        function:
        key

      });

    }

  }

}

document.body.innerHTML =
"<pre>" +
JSON.stringify(
  suspects,
  null,
  2
) +
"</pre>";

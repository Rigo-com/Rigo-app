import * as RIGO
from "./index.js";

const matches = [];

for(
  const [moduleName,module]
  of Object.entries(RIGO)
){

  if(
    !module ||
    typeof module !== "object"
  ){
    continue;
  }

  for(
    const key
    of Object.keys(module)
  ){

    const name =
    key.toLowerCase();

    if(

      name.includes("render")
      ||
      name.includes("ui")
      ||
      name.includes("element")
      ||
      name.includes("dom")
      ||
      name.includes("mount")
      ||
      name.includes("create")

    ){

      matches.push({

        module:moduleName,
        function:key

      });

    }

  }

}

document.body.innerHTML =
`<pre>${
JSON.stringify(
  matches,
  null,
  2
)
}</pre>`;

import * as RIGO
from "./index.js";

document.body.innerHTML = "";

function print(
  title,
  value
){

  const pre =
  document.createElement(
    "pre"
  );

  pre.textContent =
  title +
  "\n\n" +
  JSON.stringify(
    value,
    null,
    2
  );

  document.body
  .appendChild(
    pre
  );

}

for(
  const [name,module]
  of Object.entries(
    RIGO
  )
){

  if(
    !module ||
    typeof module !==
    "object"
  ){

    continue;

  }

  const keys =
  Object.keys(
    module
  );

  const interesting =

    keys.filter(
      key =>

        key
        .toLowerCase()
        .includes(
          "init"
        )

        ||

        key
        .toLowerCase()
        .includes(
          "boot"
        )

        ||

        key
        .toLowerCase()
        .includes(
          "start"
        )

        ||

        key
        .toLowerCase()
        .includes(
          "render"
        )

        ||

        key
        .toLowerCase()
        .includes(
          "mount"
        )

        ||

        key
        .toLowerCase()
        .includes(
          "create"
        )
    );

  if(
    interesting.length
  ){

    print(
      name,
      interesting
    );

  }

}

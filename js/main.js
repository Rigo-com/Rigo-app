// =====================================
// RIGO AI
// ROOT SYSTEM SCANNER
// =====================================

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

print(
  "ROOT EXPORTS",
  Object.keys(RIGO)
);

print(
  "UI",
  Object.keys(
    RIGO.UI || {}
  )
);

print(
  "CHAT",
  Object.keys(
    RIGO.Chat || {}
  )
);

print(
  "CORE",
  Object.keys(
    RIGO.Core || {}
  )
);

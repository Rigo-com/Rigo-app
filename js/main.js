import {
  Bootstrap
}
from "./index.js";

document.body.innerHTML =
  "<h1>BEFORE BOOT</h1>";

await Bootstrap.boot();

document.body.innerHTML =
  "<h1>AFTER BOOT</h1>";

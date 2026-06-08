// =====================================
// RIGO AI
// BOOTSTRAP INDEX
// =====================================

import BootstrapManager
from "./bootstrap-manager.js";

import {
  registerBootstrapSystems
}
from "./bootstrap-setup.js";

alert(
  "BOOTSTRAP INDEX LOADED"
);



// =====================================
// SETUP
// =====================================

registerBootstrapSystems();



// =====================================
// EXPORTS
// =====================================

export {

  BootstrapManager

};

export default
BootstrapManager;

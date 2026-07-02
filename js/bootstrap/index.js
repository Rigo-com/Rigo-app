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





// =====================================
// SETUP
// =====================================
alert("BOOTSTRAP SETUP CALL");

registerBootstrapSystems();



// =====================================
// EXPORTS
// =====================================

export {

  BootstrapManager

};

export default
BootstrapManager;

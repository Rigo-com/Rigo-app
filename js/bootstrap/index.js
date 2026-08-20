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

const bootstrapSystemsRegistered =
registerBootstrapSystems();

if(!bootstrapSystemsRegistered){

  throw new Error(
    "BOOTSTRAP_SYSTEM_REGISTRATION_FAILED"
  );

}



// =====================================
// EXPORTS
// =====================================

export {
  BootstrapManager,
  bootstrapSystemsRegistered
};

export default
BootstrapManager;

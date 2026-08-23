// =====================================
// RIGO AI
// CONFIG INDEX
// =====================================

import RIGOConfig
from "./config-manager.js";

import ConfigTypes
from "./config-types.js";

export *
from "./config-manager.js";

export *
from "./config-types.js";

const Config =
Object.freeze({
  ...RIGOConfig,
  types:ConfigTypes
});

export {
  RIGOConfig,
  ConfigTypes,
  Config
};

export default
Config;

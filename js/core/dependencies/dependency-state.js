// =====================================
// DEPENDENCY STATE
// =====================================

const appDependencyRegistry =
Object.seal({

  dependencies:
  new Map(),

  resolved:
  new Set(),

  failed:
  new Set(),

  waiting:
  new Map()

});

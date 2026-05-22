// =====================================
// DEPENDENCY DIAGNOSTICS
// =====================================



// =====================================
// GET DIAGNOSTICS
// =====================================

function getDependencyDiagnostics(){

  return {

    registered:

      appDependencyRegistry
      .dependencies
      .size,

    resolved:[

      ...appDependencyRegistry
      .resolved

    ],

    failed:[

      ...appDependencyRegistry
      .failed

    ],

    waiting:

      appDependencyRegistry
      .waiting
      .size

  };

}

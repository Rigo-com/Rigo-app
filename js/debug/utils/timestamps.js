// =====================================
// RIGO AI
// TIMESTAMPS
// =====================================

function now(){

  return Date.now();

}



function iso(){

  return new Date()
  .toISOString();

}



export const Timestamps =
Object.freeze({

  now,

  iso

});

export default
Timestamps;

// =====================================
// RIGO AI
// MEMORY SUMMARY
// SUMMARY LAYER
// =====================================

import {
  MEMORY_LIMITS,
  MEMORY_EVENTS
}
from "./memory-constants.js";

import {
  emit
}
from "./memory-events.js";

import {
  loadMemories
}
from "./memory-storage.js";

import {
  normalizeText
}
from "./memory-utils.js";

import {
  incrementSummarized
}
from "./memory-state.js";



// =====================================
// TEXT SUMMARY
// =====================================

function summarizeText(
  text = ""
){

  const normalized =

    normalizeText(
      text
    );

  if(
    normalized.length <=

    MEMORY_LIMITS
    .MAX_SUMMARY_LENGTH
  ){

    return normalized;

  }

  return normalized.slice(

    0,

    MEMORY_LIMITS
    .MAX_SUMMARY_LENGTH

  );

}



// =====================================
// MEMORY SUMMARY
// =====================================

function summarizeMemory(
  memory
){

  if(
    !memory
  ){
    return null;
  }

  return {

    id:
    memory.id,

    type:
    memory.type,

    summary:

    summarizeText(

      memory.content

    )

  };

}



// =====================================
// MULTIPLE MEMORIES
// =====================================

function summarizeMemories(
  memories = []
){

  incrementSummarized();

  const summaries =
  memories
  .map(
    summarizeMemory
  )
  .filter(Boolean);

  emit(
    MEMORY_EVENTS.SUMMARIZED,
    {
      memories:memories.length,
      summaries:summaries.length
    }
  );

  return summaries;

}



// =====================================
// STORED MEMORIES
// =====================================

function summarizeStoredMemories(){

  const memories =
  loadMemories();

  return summarizeMemories(
    memories
  );

}



// =====================================
// COMBINED SUMMARY
// =====================================

function createCombinedSummary(
  memories = []
){

  const summaries =

    summarizeMemories(
      memories
    );

  return summaries
  .map(

    item =>

    item.summary

  )
  .join("\n");

}



// =====================================
// GLOBAL SUMMARY
// =====================================

function createGlobalSummary(){

  return createCombinedSummary(

    loadMemories()

  );

}



// =====================================
// SUMMARY STATS
// =====================================

function getSummaryStats(){

  const summaries =

    summarizeStoredMemories();

  return Object.freeze({

    summaries:
    summaries.length

  });

}



// =====================================
// PUBLIC API
// =====================================

const MemorySummary =
Object.freeze({

  summarizeText,

  summarizeMemory,

  summarizeMemories,

  summarizeStoredMemories,

  createCombinedSummary,

  createGlobalSummary,

  getSummaryStats

});



// =====================================
// EXPORTS
// =====================================

export {

  summarizeText,

  summarizeMemory,

  summarizeMemories,

  summarizeStoredMemories,

  createCombinedSummary,

  createGlobalSummary,

  getSummaryStats,

  MemorySummary

};

export default
MemorySummary;

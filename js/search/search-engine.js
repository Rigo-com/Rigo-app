// =====================================
// RIGO AI
// SEARCH ENGINE
// SEARCH EXECUTION LAYER
// =====================================

import {
  startSearch,
  completeSearch,
  failSearch
}
from "./search-core.js";

import {
  getCache,
  setCache,
  addHistory
}
from "./search-storage.js";

import {
  SEARCH_FEATURES
}
from "./search-config.js";

import {
  createCacheKey,
  createSearchResult,
  createSnippet,
  isValidQuery
}
from "./search-helpers.js";

import {
  calculateScore,
  filterResults,
  rankResults
}
from "./search-ranking.js";



// =====================================
// INDEXED SEARCH
// =====================================

function executeIndexedSearch(
  query,
  items = []
){

  const results = [];

  for(
    const item
    of items
  ){

    const score =

      calculateScore(

        item?.content ?? "",

        query

      );

    if(
      score <= 0
    ){
      continue;
    }

    results.push(

      createSearchResult(

        item,

        score,

        {

          source:
          "indexed",

          snippet:
          createSnippet(

            item?.content,

            query

          )

        }

      )

    );

  }

  return results;

}



// =====================================
// SEMANTIC SEARCH
// =====================================

async function executeSemanticSearch(

  query,

  provider = null

){

  if(
    !SEARCH_FEATURES
    .ENABLE_SEMANTIC_SEARCH
  ){
    return [];
  }

  if(
    typeof provider !==
    "function"
  ){
    return [];
  }

  try{

    return await provider(
      query
    );

  }

  catch{

    return [];
  }

}



// =====================================
// FUZZY SEARCH
// =====================================

function executeFuzzySearch(){

  return [];

}



// =====================================
// SEARCH ENGINE
// =====================================

async function executeSearch(

  query,

  options = {}

){

  if(
    !isValidQuery(
      query
    )
  ){

    return [];

  }

  startSearch(
    query
  );

  try{

    const cacheKey =

      createCacheKey(

        query,

        options

      );



    // ================================
    // CACHE
    // ================================

    if(
      SEARCH_FEATURES
      .ENABLE_CACHE
    ){

      const cached =

        getCache(
          cacheKey
        );

      if(
        cached
      ){

        return cached;

      }

    }



    // ================================
    // SOURCES
    // ================================

    let results = [

      ...executeIndexedSearch(

        query,

        options.items ?? []

      ),

      ...await executeSemanticSearch(

        query,

        options.semanticProvider

      ),

      ...executeFuzzySearch()

    ];



    // ================================
    // RANKING
    // ================================

    results =

      filterResults(
        results
      );

    results =

      rankResults(
        results
      );



    // ================================
    // CACHE
    // ================================

    if(
      SEARCH_FEATURES
      .ENABLE_CACHE
    ){

      setCache(

        cacheKey,

        results

      );

    }



    // ================================
    // HISTORY
    // ================================

    addHistory(

      query,

      {

        results:
        results.length

      }

    );



    completeSearch(

      query,

      results

    );

    return results;

  }

  catch(error){

    failSearch(

      query,

      error

    );

    return [];

  }

}



// =====================================
// PUBLIC API
// =====================================

const SearchEngine =
Object.freeze({

  executeIndexedSearch,

  executeSemanticSearch,

  executeFuzzySearch,

  executeSearch

});



// =====================================
// EXPORTS
// =====================================

export {

  executeIndexedSearch,

  executeSemanticSearch,

  executeFuzzySearch,

  executeSearch,

  SearchEngine

};

export default
SearchEngine;

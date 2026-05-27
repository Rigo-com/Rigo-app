// =====================================
// RIGO AI
// SEARCH RANKING
// OPTIMIZED FINAL
// =====================================



// =====================================
// RANKING CONFIG
// =====================================

const SEARCH_RANKING_CONFIG =
Object.freeze({

  EXACT_MATCH_BOOST:3,

  TITLE_BOOST:2,

  TAG_BOOST:1.5,

  SUMMARY_BOOST:1.2,

  CONTENT_BOOST:1,

  PINNED_BOOST:0.5,

  FAVORITE_BOOST:0.35,

  RECENCY_BOOST:1,

  USAGE_BOOST:0.5,

  MAX_RECENCY_DAYS:30,

  MAX_USAGE_COUNT:100

});



// =====================================
// NORMALIZE SEARCH TEXT
// =====================================

function normalizeRankingText(
  value
){

  return normalizeMemoryString?.(
    value
  )
  .toLowerCase();

}



// =====================================
// TOKEN SCORE
// =====================================

function calculateTokenMatchScore(
  text,
  tokens = [],
  weight = 1
){

  if(
    !text ||
    tokens.length <= 0
  ){

    return 0;

  }

  const normalized =
  normalizeRankingText(
    text
  );

  let score = 0;

  tokens.forEach((token) => {

    if(
      normalized.includes(
        token
      )
    ){

      score += weight;

    }

  });

  return score;

}



// =====================================
// RECENCY SCORE
// =====================================

function calculateRecencyScore(
  updatedAt
){

  const daysOld =
  getDaysBetweenDates?.(

    updatedAt,
    Date.now()

  ) || 0;

  return Math.max(

    0,

    SEARCH_RANKING_CONFIG
    .RECENCY_BOOST *

    (
      1 -

      (
        daysOld /

        SEARCH_RANKING_CONFIG
        .MAX_RECENCY_DAYS
      )
    )

  );

}



// =====================================
// USAGE SCORE
// =====================================

function calculateUsageScore(
  usageCount = 0
){

  const normalizedUsage =
  Math.min(

    Number(usageCount) || 0,

    SEARCH_RANKING_CONFIG
    .MAX_USAGE_COUNT

  );

  return (

    normalizedUsage /

    SEARCH_RANKING_CONFIG
    .MAX_USAGE_COUNT

  )

  *

  SEARCH_RANKING_CONFIG
  .USAGE_BOOST;

}



// =====================================
// MAIN RANKING
// =====================================

function calculateSearchRanking(
  memory,
  query
){

  try{

    if(
      !memory
    ){

      return 0;

    }

    const normalizedQuery =
    normalizeRankingText(
      query
    );

    if(
      !normalizedQuery
    ){

      return 0;

    }

    const queryTokens =
    tokenizeSearchContent(
      normalizedQuery
    );



    // ================================
    // NORMALIZED FIELDS
    // ================================

    const title =
    normalizeRankingText(
      memory.title
    );

    const summary =
    normalizeRankingText(
      memory.summary
    );

    const content =
    normalizeRankingText(
      memory.content
    );

    const tags =

      Array.isArray(
        memory.tags
      )

      ? memory.tags

      : [];



    // ================================
    // SCORE
    // ================================

    let score = 0;



    // ================================
    // EXACT MATCH
    // ================================

    if(
      title === normalizedQuery
    ){

      score +=

      SEARCH_RANKING_CONFIG
      .EXACT_MATCH_BOOST;

    }



    // ================================
    // TITLE
    // ================================

    score +=
    calculateTokenMatchScore(

      title,

      queryTokens,

      SEARCH_RANKING_CONFIG
      .TITLE_BOOST

    );



    // ================================
    // SUMMARY
    // ================================

    score +=
    calculateTokenMatchScore(

      summary,

      queryTokens,

      SEARCH_RANKING_CONFIG
      .SUMMARY_BOOST

    );



    // ================================
    // CONTENT
    // ================================

    score +=
    calculateTokenMatchScore(

      content,

      queryTokens,

      SEARCH_RANKING_CONFIG
      .CONTENT_BOOST

    );



    // ================================
    // TAGS
    // ================================

    tags.forEach((tag) => {

      score +=
      calculateTokenMatchScore(

        tag,

        queryTokens,

        SEARCH_RANKING_CONFIG
        .TAG_BOOST

      );

    });



    // ================================
    // PINNED
    // ================================

    if(
      memory.flags?.pinned
    ){

      score +=

      SEARCH_RANKING_CONFIG
      .PINNED_BOOST;

    }



    // ================================
    // FAVORITE
    // ================================

    if(
      memory.flags?.favorite
    ){

      score +=

      SEARCH_RANKING_CONFIG
      .FAVORITE_BOOST;

    }



    // ================================
    // RECENCY
    // ================================

    score +=
    calculateRecencyScore(
      memory.updatedAt
    );



    // ================================
    // USAGE
    // ================================

    score +=
    calculateUsageScore(

      memory.stats
      ?.usageCount

    );

    return normalizeMemoryScore?.(
      score
    ) || score;

  }

  catch(error){

    return 0;

  }

}



// =====================================
// SORT RESULTS
// =====================================

function rankSearchResults(
  results = []
){

  if(
    !Array.isArray(results)
  ){

    return [];
  }

  return [...results]
  .sort((a,b) => {

    return (

      (b?.score || 0) -

      (a?.score || 0)

    );

  });

}



// =====================================
// EXPORTS
// =====================================

export {

  SEARCH_RANKING_CONFIG,

  calculateTokenMatchScore,

  calculateRecencyScore,

  calculateUsageScore,

  calculateSearchRanking,

  rankSearchResults

};

// =====================================
// RIGO AI
// SEARCH FUZZY
// OPTIMIZED FINAL
// =====================================



// =====================================
// FUZZY CONFIG
// =====================================

const SEARCH_FUZZY_CONFIG =
Object.freeze({

  MIN_FUZZY_SCORE:0.7,

  MAX_FUZZY_RESULTS:20,

  MIN_TOKEN_LENGTH:2

});



// =====================================
// NORMALIZE
// =====================================

function normalizeFuzzyText(
  value
){

  return normalizeMemoryString?.(
    value
  )
  .toLowerCase();

}



// =====================================
// LEVENSHTEIN DISTANCE
// =====================================

function calculateLevenshteinDistance(
  first = "",
  second = ""
){

  const source =
  normalizeFuzzyText(
    first
  );

  const target =
  normalizeFuzzyText(
    second
  );

  if(
    source === target
  ){

    return 0;

  }

  if(
    source.length <= 0
  ){

    return target.length;

  }

  if(
    target.length <= 0
  ){

    return source.length;

  }

  const matrix =
  Array.from({

    length:
    target.length + 1

  },(_,index) => {

    return [index];

  });

  for(

    let column = 0;

    column <= source.length;

    column++

  ){

    matrix[0][column] =
    column;

  }

  for(

    let row = 1;

    row <= target.length;

    row++

  ){

    for(

      let column = 1;

      column <= source.length;

      column++

    ){

      const cost =

        target[
          row - 1
        ] ===

        source[
          column - 1
        ]

        ? 0

        : 1;

      matrix[row][column] =
      Math.min(

        matrix[row - 1][column] + 1,

        matrix[row][column - 1] + 1,

        matrix[row - 1][column - 1] + cost

      );

    }

  }

  return matrix
  [target.length]
  [source.length];

}



// =====================================
// FUZZY SCORE
// =====================================

function fuzzyMatchScore(
  first,
  second
){

  const source =
  normalizeFuzzyText(
    first
  );

  const target =
  normalizeFuzzyText(
    second
  );

  if(
    !source ||
    !target
  ){

    return 0;

  }

  if(
    source === target
  ){

    return 1;

  }

  const distance =
  calculateLevenshteinDistance(
    source,
    target
  );

  const maxLength =
  Math.max(

    source.length,

    target.length

  );

  if(
    maxLength <= 0
  ){

    return 0;

  }

  return Math.max(

    0,

    1 - (
      distance /
      maxLength
    )

  );

}



// =====================================
// FIND FUZZY TOKENS
// =====================================

function findFuzzyTokens(
  token
){

  const normalizedToken =
  normalizeFuzzyText(
    token
  );

  if(

    !normalizedToken ||

    normalizedToken.length <

    SEARCH_FUZZY_CONFIG
    .MIN_TOKEN_LENGTH

  ){

    return [];

  }

  const matches = [];

  searchIndexState
  .tokenIndex
  .forEach((_,indexedToken) => {

    const score =
    fuzzyMatchScore(

      normalizedToken,

      indexedToken

    );

    if(

      score <

      SEARCH_FUZZY_CONFIG
      .MIN_FUZZY_SCORE

    ){

      return;

    }

    matches.push({

      token:indexedToken,

      score

    });

  });

  return matches

  .sort((a,b) => {

    return b.score - a.score;

  })

  .slice(

    0,

    SEARCH_FUZZY_CONFIG
    .MAX_FUZZY_RESULTS

  );

}



// =====================================
// EXPORTS
// =====================================

export {

  SEARCH_FUZZY_CONFIG,

  calculateLevenshteinDistance,

  fuzzyMatchScore,

  findFuzzyTokens

};

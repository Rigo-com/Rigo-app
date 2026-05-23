// =====================================
// RIGO AI
// SEARCH FUZZY
// ENTERPRISE FINAL
// =====================================



function calculateLevenshteinDistance(
  first = "",
  second = ""
){

  const matrix = [];

  for(

    let i = 0;

    i <= second.length;

    i++

  ){

    matrix[i] = [i];

  }

  for(

    let j = 0;

    j <= first.length;

    j++

  ){

    matrix[0][j] = j;

  }

  for(

    let i = 1;

    i <= second.length;

    i++

  ){

    for(

      let j = 1;

      j <= first.length;

      j++

    ){

      if(

        second.charAt(i - 1) ===

        first.charAt(j - 1)

      ){

        matrix[i][j] =

        matrix[i - 1][j - 1];

      }

      else{

        matrix[i][j] =
        Math.min(

          matrix[i - 1][j - 1] + 1,

          matrix[i][j - 1] + 1,

          matrix[i - 1][j] + 1

        );

      }

    }

  }

  return matrix
  [second.length]
  [first.length];

}



function fuzzyMatchScore(
  first,
  second
){

  const distance =
  calculateLevenshteinDistance(
    first,
    second
  );

  const maxLength =
  Math.max(

    first.length,

    second.length

  );

  if(
    maxLength <= 0
  ){

    return 0;
  }

  return 1 - (
    distance /
    maxLength
  );

}



function findFuzzyTokens(
  token
){

  const matches = [];

  searchIndexState
  .tokenIndex
  .forEach((_,indexedToken) => {

    const score =
    fuzzyMatchScore(
      token,
      indexedToken
    );

    if(
      score >= 0.7
    ){

      matches.push({

        token:indexedToken,

        score

      });

    }

  });

  return matches
  .sort((a,b) => {

    return b.score - a.score;

  });

}

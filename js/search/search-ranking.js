// =====================================
// RIGO AI
// SEARCH RANKING
// RANKING LAYER
// =====================================



// =====================================
// SCORE
// =====================================

function calculateScore(
  content = "",
  query = ""
){

  const normalizedContent =

    String(content)
    .toLowerCase();

  const normalizedQuery =

    String(query)
    .toLowerCase()
    .trim();

  if(
    !normalizedQuery
  ){
    return 0;
  }

  if(
    normalizedContent ===
    normalizedQuery
  ){
    return 100;
  }

  if(
    normalizedContent.includes(
      normalizedQuery
    )
  ){
    return 50;
  }

  const words =
  normalizedQuery
  .split(/\s+/);

  let score = 0;

  for(
    const word
    of words
  ){

    if(
      normalizedContent
      .includes(word)
    ){

      score += 10;

    }

  }

  return score;

}



// =====================================
// SORT
// =====================================

function sortResults(
  results = []
){

  return [

    ...results

  ]

  .sort(

    (
      a,
      b
    ) =>

      (b.score || 0)

      -

      (a.score || 0)

  );

}



// =====================================
// FILTER
// =====================================

function filterResults(
  results = [],
  minimumScore = 1
){

  return results.filter(

    result =>

      (result?.score || 0)

      >=

      minimumScore

  );

}



// =====================================
// DEDUPLICATION
// =====================================

function deduplicateResults(
  results = []
){

  const seen =
  new Set();

  return results.filter(

    result => {

      const key =

        result?.item?.id

        ??

        JSON.stringify(
          result
        );

      if(
        seen.has(
          key
        )
      ){
        return false;
      }

      seen.add(
        key
      );

      return true;

    }

  );

}



// =====================================
// PIPELINE
// =====================================

function rankResults(
  results = []
){

  return sortResults(

    deduplicateResults(
      results
    )

  );

}



// =====================================
// PUBLIC API
// =====================================

const SearchRanking =
Object.freeze({

  calculateScore,

  sortResults,

  filterResults,

  deduplicateResults,

  rankResults

});



// =====================================
// EXPORTS
// =====================================

export {

  calculateScore,

  sortResults,

  filterResults,

  deduplicateResults,

  rankResults,

  SearchRanking

};

export default
SearchRanking;

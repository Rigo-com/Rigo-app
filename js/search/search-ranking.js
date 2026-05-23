// =====================================
// RIGO AI
// SEARCH RANKING
// ENTERPRISE FINAL
// =====================================



const SEARCH_RANKING_CONFIG =
Object.freeze({

  EXACT_MATCH_BOOST:1,

  TITLE_BOOST:0.8,

  TAG_BOOST:0.5,

  SUMMARY_BOOST:0.4,

  CONTENT_BOOST:0.3,

  PINNED_BOOST:0.2,

  FAVORITE_BOOST:0.15

});



function calculateSearchRanking(
  memory,
  query
){

  if(!memory){

    return 0;
  }

  const normalizedQuery =
  normalizeSearchQuery(
    query
  )
  .toLowerCase();

  let score = 0;

  const title =
  normalizeMemoryString(
    memory.title
  )
  .toLowerCase();

  const summary =
  normalizeMemoryString(
    memory.summary
  )
  .toLowerCase();

  const content =
  normalizeMemoryContent(
    memory.content
  )
  .toLowerCase();

  if(
    title === normalizedQuery
  ){

    score +=

    SEARCH_RANKING_CONFIG
    .EXACT_MATCH_BOOST;

  }

  if(
    title.includes(
      normalizedQuery
    )
  ){

    score +=

    SEARCH_RANKING_CONFIG
    .TITLE_BOOST;

  }

  if(
    summary.includes(
      normalizedQuery
    )
  ){

    score +=

    SEARCH_RANKING_CONFIG
    .SUMMARY_BOOST;

  }

  if(
    content.includes(
      normalizedQuery
    )
  ){

    score +=

    SEARCH_RANKING_CONFIG
    .CONTENT_BOOST;

  }

  if(
    Array.isArray(
      memory.tags
    )
  ){

    memory.tags
    .forEach((tag) => {

      if(

        normalizeMemoryString(
          tag
        )
        .toLowerCase()

        .includes(
          normalizedQuery
        )

      ){

        score +=

        SEARCH_RANKING_CONFIG
        .TAG_BOOST;

      }

    });

  }

  if(
    memory.flags?.pinned
  ){

    score +=

    SEARCH_RANKING_CONFIG
    .PINNED_BOOST;

  }

  if(
    memory.flags?.favorite
  ){

    score +=

    SEARCH_RANKING_CONFIG
    .FAVORITE_BOOST;

  }

  return normalizeMemoryScore(
    score
  );

}

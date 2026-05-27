// =====================================
// RIGO AI
// SEARCH SNIPPETS
// OPTIMIZED FINAL
// =====================================



// =====================================
// CREATE SEARCH SNIPPET
// =====================================

function createSearchSnippet(
  content,
  query,
  radius = 120
){

  const normalizedContent =
  normalizeMemoryContent?.(
    content
  );

  const normalizedQuery =
  normalizeSearchQuery?.(
    query
  );

  if(
    !normalizedContent
  ){

    return "";

  }

  const snippetRadius =
  Math.max(
    40,
    Number(radius) || 120
  );



  // ================================
  // EMPTY QUERY
  // ================================

  if(
    !normalizedQuery
  ){

    return truncateMemoryText?.(

      normalizedContent,

      snippetRadius

    )

    ||

    normalizedContent.slice(
      0,
      snippetRadius
    );

  }



  // ================================
  // FIND MATCH
  // ================================

  const lowerContent =
  normalizedContent
  .toLowerCase();

  const lowerQuery =
  normalizedQuery
  .toLowerCase();

  const index =
  lowerContent.indexOf(
    lowerQuery
  );



  // ================================
  // NO MATCH
  // ================================

  if(
    index < 0
  ){

    return truncateMemoryText?.(

      normalizedContent,

      snippetRadius

    )

    ||

    normalizedContent.slice(
      0,
      snippetRadius
    );

  }



  // ================================
  // RANGE
  // ================================

  const halfRadius =
  Math.floor(
    snippetRadius / 2
  );

  let start =
  Math.max(
    0,
    index - halfRadius
  );

  let end =
  Math.min(

    normalizedContent.length,

    index +

    lowerQuery.length +

    halfRadius

  );



  // ================================
  // WORD BOUNDARIES
  // ================================

  while(

    start > 0

    &&

    normalizedContent[start] !==
    " "

  ){

    start--;

  }

  while(

    end <
    normalizedContent.length

    &&

    normalizedContent[end] !==
    " "

  ){

    end++;

  }



  // ================================
  // BUILD
  // ================================

  const snippet =
  normalizedContent
  .slice(start,end)
  .trim();

  return [

    start > 0
    ? "..."
    : "",

    snippet,

    end <
    normalizedContent.length
    ? "..."
    : ""

  ]
  .join("");

}



// =====================================
// EXPORTS
// =====================================

export {

  createSearchSnippet

};

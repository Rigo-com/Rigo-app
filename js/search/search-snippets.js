// =====================================
// RIGO AI
// SEARCH SNIPPETS
// ENTERPRISE FINAL
// =====================================



function createSearchSnippet(
  content,
  query,
  radius = 120
){

  const normalizedContent =
  normalizeMemoryContent(
    content
  );

  const normalizedQuery =
  normalizeSearchQuery(
    query
  );

  const index =
  normalizedContent
  .toLowerCase()
  .indexOf(

    normalizedQuery
    .toLowerCase()

  );

  if(
    index < 0
  ){

    return truncateMemoryText(
      normalizedContent,
      radius
    );

  }

  const start =
  Math.max(
    0,
    index - radius / 2
  );

  const end =
  Math.min(

    normalizedContent.length,

    index + radius / 2

  );

  return (

    "..." +

    normalizedContent.slice(
      start,
      end
    )

    + "..."

  );

}

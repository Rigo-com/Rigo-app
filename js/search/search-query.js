// =====================================
// RIGO AI
// SEARCH QUERY
// OPTIMIZED FINAL
// =====================================



// =====================================
// FILTER SEARCH RESULTS
// =====================================

function filterSearchResults(
  results = [],
  filters = {}
){

  if(
    !Array.isArray(results)
  ){

    return [];
  }

  const safeFilters =
  safeSearchObject(
    filters
  );

  return results.filter((result) => {

    const memory =
    result?.memory;

    if(!memory){

      return false;
    }



    // ================================
    // TYPE
    // ================================

    if(

      safeFilters.type

      &&

      memory.type !==
      safeFilters.type

    ){

      return false;

    }



    // ================================
    // CATEGORY
    // ================================

    if(

      safeFilters.category

      &&

      memory.category !==
      safeFilters.category

    ){

      return false;

    }



    // ================================
    // STATE
    // ================================

    if(

      safeFilters.state

      &&

      memory.state !==
      safeFilters.state

    ){

      return false;

    }



    // ================================
    // TAGS
    // ================================

    if(

      Array.isArray(
        safeFilters.tags
      )

      &&

      safeFilters.tags.length > 0

    ){

      const memoryTags =

        Array.isArray(
          memory.tags
        )

        ? memory.tags

        : [];

      const matched =
      safeFilters.tags.some((tag) => {

        return memoryTags.includes(
          tag
        );

      });

      if(!matched){

        return false;

      }

    }



    // ================================
    // DATE RANGE
    // ================================

    if(

      safeFilters.createdAfter

      &&

      Number(memory.createdAt) <
      Number(
        safeFilters.createdAfter
      )

    ){

      return false;

    }

    if(

      safeFilters.createdBefore

      &&

      Number(memory.createdAt) >
      Number(
        safeFilters.createdBefore
      )

    ){

      return false;

    }

    return true;

  });

}



// =====================================
// EXPORTS
// =====================================

export {

  filterSearchResults

};

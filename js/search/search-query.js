// =====================================
// RIGO AI
// SEARCH QUERY
// ENTERPRISE FINAL
// =====================================



function filterSearchResults(
  results = [],
  filters = {}
){

  return results.filter((result) => {

    const memory =
    result.memory;

    if(!memory){

      return false;
    }

    if(

      filters.type &&

      memory.type !==
      filters.type

    ){

      return false;
    }

    if(

      filters.category &&

      memory.category !==
      filters.category

    ){

      return false;
    }

    if(

      filters.state &&

      memory.state !==
      filters.state

    ){

      return false;
    }

    return true;

  });

}

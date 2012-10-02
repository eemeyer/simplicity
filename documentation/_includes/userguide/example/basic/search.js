$('body')
  .simplicityState('mergeQueryParams')
  .simplicityHistory()
  .simplicityState('triggerChangeEvent')
  .simplicityPageSnapBack()
  .simplicityDiscoverySearch({
    url: 'http://tutorial.discoverysearchengine.com/search_controller_gsa.php'
  })
  .simplicityDiscoverySearch('search');

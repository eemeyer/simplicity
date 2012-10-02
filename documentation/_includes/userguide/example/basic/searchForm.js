$('#searchForm :input').simplicityInputs();

$('select[name="formats_avail"]').simplicityFacetedSelect({
  optionTemplate: '{option}  ({count})'
});

$('select[name="agency"]').simplicityFacetedSelect({
  maxDepth: 1
});
$('#agencyFancy').simplicityFancySelect({
  select: 'select[name="agency"]'
});

$('#resetButton').click(function () {
  $('body').simplicityState('reset');
})

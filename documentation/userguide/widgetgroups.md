---
layout: default
nav: userguide
nav2: widgetgroups
title: Widget Groups
subhead: Widget Groups
lead: 640K ought to be enough for anybody.
---

{% include userguide/nav.html %}

Widget Groups
=============

The widgets support being placed in multiple indepdent groups on the same page. Typically only one group is used so the default options cater for that scenario.

Groups generally center around the `simplicityState` and `simplicityDiscoverySearch` widgets which we place on the `body` element by default. Other widgets look at the `body` element by default when needing to reference either `simplicityState` or `simplicityDiscoverySearch`.

Here is a single default group of widgets on the page.

{% highlight javascript %}
$('body').simplicityState();
$('#mainSearch :input').simplicityInputs();
$('#mainResults').simplicitySearchResults();
$('body').simplicityDiscoverySearch({
  url: 'http://example.com/search-controller'
});
{% endhighlight %}

We could add a second group of widgets somewhere else on the page by binding them to a different `div` and letting the know where to look for their dependent widgets. In this example we bind the `simplicityState` and `simplicityDiscoverySearch` widgets to `#secondary` and override the `stateElement` and `searchElement` options of the other widgets in this group as appropriate (the default value for these options is `body`).

{% highlight javascript %}
$('#secondary').simplicityState();
$('#secondary :input').simplicityInputs({
    stateElement: '#secondary'
});
$('#secondaryResults').simplicitySearchResults({
    searchElement: '#secondary'
});
$('body').simplicityDiscoverySearch({
  stateElement: '#secondary',
  url: 'http://example.com/search-controller'
});
{% endhighlight %}

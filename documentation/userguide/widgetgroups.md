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

The widgets support being placed in multiple independent groups on the same page. Typically only one group is used so the default options cater for that scenario.

Groups generally center around the `simplicityState` and `simplicityDiscoverySearch` widgets which we place on the `body` element by default.
Other widgets look at the `body` element by default when needing to reference either `simplicityState` or `simplicityDiscoverySearch`.

Here is a single default group of widgets on the page.

{% highlight javascript %}
$('body').simplicityState();
$('#mainSearch :input').simplicityInputs();
$('#mainResults').simplicitySearchResults();
$('body').simplicityDiscoverySearch({
  url: 'http://example.com/search-controller'
});
{% endhighlight %}

To add a second group of widgets to the page, we by create a `simplicityState` widget and a `simplicityDiscoverySearch`
on a different element from the other widget group, and then configure all the widgets in this group to use that state.

In this example we bind the `simplicityState` and `simplicityDiscoverySearch` widgets to `#secondary`,
and override the `stateElement` and `searchElement` options of the other widgets in this group.

{% highlight javascript %}
$('#secondary').simplicityState();
$('#secondary :input').simplicityInputs({
    stateElement: '#secondary'
});
$('#secondaryResults').simplicitySearchResults({
    searchElement: '#secondary'
});
$('#secondary').simplicityDiscoverySearch({
  stateElement: '#secondary',
  url: 'http://example.com/search-controller'
});
{% endhighlight %}

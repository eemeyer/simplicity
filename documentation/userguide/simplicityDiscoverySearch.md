---
layout: default
nav: userguide
nav2: simplicityDiscoverySearch
title: simplicityDiscoverySearch
subhead: simplicityDiscoverySearch
lead: Setting up the search flow.
---

{% include userguide/nav.html %}

simplicityDiscoverySearch
=========================

The `simplicityDiscoverySearch` widget can perform Ajax search requests in a two different ways:
1. directly to the Discovery Search Engine (via CORS), or
1. to a same-origin server-side search controller

You'll typically use direct engine searches for development purposes, and a server side search controller for a production site.

Production
----------

{% highlight javascript %}
$('body').simplicityDiscoverySearch({
    url: '/my_search_controller.php'
});
{% endhighlight %}

Will make GET requests to the my_search_controller.php using the state as query parameters, and expect to receive a JSON document in our standard response format.

Concretely, the state:

{% highlight javascript %}
{
    "text": "this is an example"
}
{% endhighlight %}

Would be mapped to the URL:

    http://example.com/my_search_controller.php?text=this+is+an+example

The server side search controller would build a Discovery Request from the query parameters, dispatch it to the Discovery Search Engine and then return a JSON document that fits this template:

{% highlight javascript %}
{
    "_discovery": {
        "request": { /* original, unmodified Discovery Request */ },
        "response": { /* original, unmodified Discovery Response */ }
    },
    "resultsHtml": "Rendered results go here"
}
{% endhighlight %}

The widgets would then process the response to insert the results directly into the page and update any facets, maps or other dynamic details as appropriate.

Development
-----------

{% highlight javascript %}
var my_search_controller = function (state) {
    var discoveryRequest = {
        criteria: [],
        pageSize: 10
    };
    if (state.text) {
        discoveryRequest.criteria.push({
            dimension: 'text',
            value: state.text
        });
    }
    return discoveryRequest;
};
$('body').simplicityDiscoverySearch({
    url: 'http://example.com:8090/ws/query',
    backend: 'engine',
    controllerCallback: my_search_controller
});
{% endhighlight %}

This makes a direct POST request to the engine and uses the JavaScript function `my_search_controller` to create the Discovery Request from the state.
You'll need a [CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing) compatible browser to avoid any cross-origin sand-boxing issues.

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

The <code>simplicityDiscoverySearch</code> widget performs search by making an Ajax request either directly to the Discovery Search Engine or to a server side search controller.

You'll typically use direct engine searches for development purposes and make use of a server side search controller for a production site.

Production
----------

{% highlight javascript %}
$('body').simplicityDiscoverySearch({
    url: 'my_search_controller.php'
});
{% endhighlight %}

This makes a GET request to the declared URL passing the state as query parameters and expects to receive a JSON document in our standard response format.

Concretely, the state:

{% highlight json %}
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

This makes a direct POST request to the engine and uses the JavaScript function `my_search_controller` to create the Discovery Request from the state. You'll need a [CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing) compatibile browser to avoid any cross-origin sandboxing issues.

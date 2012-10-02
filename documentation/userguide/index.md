---
layout: default
nav: userguide
nav2: home
title: userguide
subhead: Userguide
lead: Learning how to use the widgets.
---

{% include userguide/nav.html %}

Getting started
===============

The Simplicity Widgets follow a simple architecture for communicating with the backend search server, coordinating state between themselves and displaying the results on the page.

They depend upon [jQuery](http://jquery.com/) and [jQuery UI](http://jqueryui.com/) and are designed to be extensible and get out of the way when you need them to.


To get going with the widgets you'll need to install the widgets on the page, configure the page level widget sets and then configure each set of widgets as needed.

Install
-------

Both JavaScript and CSS resources need to be added to an existing page to make use of the widgets.

Add the following block to the `head` of the page.
{% highlight html %}
<link href="//ajax.googleapis.com/ajax/libs/jqueryui/{{site.jQueryUiRelease}}/themes/{{site.jQueryUiTheme}}/jquery-ui.css" rel="stylesheet">
<link href="//cdn.transparensee.com/simplicity/{{site.simplicityRelease}}/simplicity.min.css" rel="stylesheet">
{% endhighlight %}

Note: You can use any of the available [jQuery UI themes](http://jqueryui.com/themeroller/).

Add the following block to the end of the `body` of the page.
{% highlight html %}
<script src="//ajax.googleapis.com/ajax/libs/jquery/{{site.jQueryRelease}}/jquery.min.js"></script>
<script src="//ajax.googleapis.com/ajax/libs/jqueryui/{{site.jQueryUiRelease}}/jquery-ui.min.js"></script>
<script src="//cdn.transparensee.com/simplicity/{{site.simplicityRelease}}/simplicity.min.js"></script>
{% endhighlight %}

Some widgets have extra dependencies.

<dl>
    <dt><a href="http://benalman.com/projects/jquery-bbq-plugin/">jQuery BBQ plugin</a></dt>
    <dd>Used by <code>$.simplicityDiscoverySearch('mergeQueryParams')</code> and <code>$.simplicityHistory</code>.</dd>
    <dt><a href="http://github.com/gbirke/jquery_pagination">jQuery Pagination plugin</a></dt>
    <dd>Used by <code>$.simplicityPagination</code>.</dd>
    <dt><a href="http://brandonaaron.net/code/bgiframe/docs">jQuery bgiframe plugin</a></dt>
    <dd>Recommended for IE6 compatibilty when using <code>$.simplicityFlyout</code>.</dd>
</dl>

HTML
----

We need some placeholder `div`s to place the search results in and some `input` elements to control the search parameters.

Add the search navigation `form` to the left side of the page.

{% highlight html %}
{% include userguide/example/basic/searchForm.html %}
{% endhighlight %}

Add the results and pagination `div`s to the content area of the page.

{% highlight html %}
{% include userguide/example/basic/resultsArea.html %}
{% endhighlight %}

JavaScript
----------

We need to configure ther widgets in a `script` tag at the bottom of the page.

Only one [widget group](/userguide/widgetgroups.html) is needed, so let's create a `simplicityState` widget on the `body` element.
{% highlight javascript %}
{% include userguide/example/basic/state.js %}
{% endhighlight %}

Then configure the request widgets on the `input`s in the search navigation `form`.
{% highlight javascript %}
{% include userguide/example/basic/searchForm.js %}
{% endhighlight %}

The response widgets are created on the `div`s in the content area so we can display the search results and pagination guides.
{% highlight javascript %}
{% include userguide/example/basic/resultsArea.js %}
{% endhighlight %}

Finally, we perform the [page level setup](/userguide/simplicityDiscoverySearch.html) of the `simplicityDiscoverySearch` widget.
{% highlight javascript %}
{% include userguide/example/basic/search.js %}
{% endhighlight %}

Summary
-------

We've shown how to build a basic search page that use an external PHP backed search controller.

<a href="/userguide/example/basic.html" class="btn btn-primary button-large">View Example</a>

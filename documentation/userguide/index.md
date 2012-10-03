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

The Simplicity Widgets are designed to be extensible, and to get out of the way when you need them to.

They follow simple architectural patterns for communicating with a search server, coordinating widget state on the page, and displaying results.

[jQuery](http://jquery.com/) and [jQuery UI](http://jqueryui.com/) are required to use the widgets.

There are three high-level steps to use the widgets on a page:
1. install the widgets on the page
1. configure the page level widget sets, and
1. configure each set of widgets as needed (sometimes you can just use the defaults)

Install
-------

You need to add `link` and `script` tags for the JavaScript and CSS resources for the widgets.

Add the CSS references to the `head` of the page.
{% highlight html %}
<link href="//ajax.googleapis.com/ajax/libs/jqueryui/{{site.jQueryUiRelease}}/themes/{{site.jQueryUiTheme}}/jquery-ui.css" rel="stylesheet">
<link href="//cdn.transparensee.com/simplicity/{{site.simplicityRelease}}/simplicity.min.css" rel="stylesheet">
{% endhighlight %}

Note: You can use any of the available [jQuery UI themes](http://jqueryui.com/themeroller/).

Add these external JavaScript references to the end of the `body` of the page.
{% highlight html %}
<script src="//ajax.googleapis.com/ajax/libs/jquery/{{site.jQueryRelease}}/jquery.min.js"></script>
<script src="//ajax.googleapis.com/ajax/libs/jqueryui/{{site.jQueryUiRelease}}/jquery-ui.min.js"></script>
<script src="//cdn.transparensee.com/simplicity/{{site.simplicityRelease}}/simplicity.min.js"></script>
{% endhighlight %}

Note that some widgets have extra dependencies. You need to add `script` and `link` tags for them too.

<dl>
    <dt><a href="http://benalman.com/projects/jquery-bbq-plugin/">jQuery BBQ plugin</a></dt>
    <dd>Used by <code>$.simplicityDiscoverySearch('mergeQueryParams')</code> and <code>$.simplicityHistory</code>.</dd>
    <dt><a href="http://github.com/gbirke/jquery_pagination">jQuery Pagination plugin</a></dt>
    <dd>Used by <code>$.simplicityPagination</code>.</dd>
    <dt><a href="http://brandonaaron.net/code/bgiframe/docs">jQuery bgiframe plugin</a></dt>
    <dd>Recommended for IE6 compatibilty when using <code>$.simplicityFlyout</code>.</dd>
</dl>

You will add javascript code after the above tags to instantiate and configure the widgets that you want to use. We'll get to that
in a bit.

HTML
----

We create placeholder `div`s to display search results and some `input`s to hold the search parameters.

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

We configure the widgets in a `script` tag below the script tags that loaded simplicity.js and its dependencies.

Only one [widget group](/userguide/widgetgroups.html) is needed, so we create a `simplicityState` widget on the `body` element.
{% highlight javascript %}
{% include userguide/example/basic/state.js %}
{% endhighlight %}

Then we configure request widgets on the `input`s in the search navigation `form`.
{% highlight javascript %}
{% include userguide/example/basic/searchForm.js %}
{% endhighlight %}

The response widgets are created for the `div`s in the content area to display the search results and pagination links.
{% highlight javascript %}
{% include userguide/example/basic/resultsArea.js %}
{% endhighlight %}

Finally, we perform the [page level setup](/userguide/simplicityDiscoverySearch.html) of the `simplicityDiscoverySearch` widget.
{% highlight javascript %}
{% include userguide/example/basic/search.js %}
{% endhighlight %}

For the best user experience, we recommend placing any slow-loading scripts such map vendor scripts below all the Simplicity Widget
JavaScript so that the widgets can be fully functional and displayed before the slow loading scripts are executed.

Summary
-------

We've demonstrated how to build a basic search page that use an external PHP backed search controller accessed via AJAX CORS requests.

<a href="/userguide/example/basic.html" class="btn btn-primary button-large">View Example</a>

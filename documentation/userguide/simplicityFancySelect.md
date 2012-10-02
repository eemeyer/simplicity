---
layout: default
nav: userguide
nav2: simplicityFancySelect
title: simplicityFancySelect
subhead: simplicityFancySelect
lead: Unrolling the options.
---

{% include userguide/nav.html %}

simplicityFancySelect
=====================

To enhance a `<select>` by applying a HTML template to it, first create the select and a target `div`.

{% highlight html %}
<div id="example">
    <select name="example">
        <option value="">Any...</option>
        <option value="1" data-count="3">First</option>
        <option value="2" data-count="11">Second</option>
        <option value="3" data-count="6">Third</option>
    </select>
    <div></div>
</div>
{% endhighlight %}

Then apply the `simplicityFancySelect` widget to it.

{% highlight javascript %}
$('#example div').simplicityFancySelect({
    select: '#example select'
});
{% endhighlight %}

This live example shows how the two are synchronized.

<div id="exampleFancySelect1" class="well" style="width: 16em;">
    <label><span class="badge">1</span> select</label>
    <select name="example">
        <option value="">Any...</option>
        <option value="1" data-count="3">First</option>
        <option value="2" data-count="11">Second</option>
        <option value="3" data-count="6">Third</option>
    </select>
    <label><span class="badge">2</span> fancy select</label>
    <div class="well"> </div>
</div>
<script type="text/javascript">
    $(function () {
        $('#exampleFancySelect1 div').simplicityFancySelect({
          select: '#exampleFancySelect1 select'
        });
    });
</script>

Change the selection in <span class="badge">1</span> and the visible state in <span class="badge">2</span> is updated.

Click on rows in <span class="badge">2</span> and the value in <span class="badge">1</span> is updated.

Templating
==========

The HTML template can be customized in two different ways. You can either set the `template` option to a valid HTML content string or set it to `''` and place the template in the DOM.

Let's configure the widget to use a trimmed down version of the HTML (excluding the facet count data attribute).

First by using the `template` widget option.

HTML
{% highlight html %}
<div id="example">
    <select name="example">
        <option value="">Any...</option>
        <option value="1">First</option>
        <option value="2">Second</option>
        <option value="3">Third</option>
    </select>
    <div></div>
</div>
{% endhighlight %}

JavaScript
{% highlight javascript %}
$('#example div').simplicityFancySelect({
    select: '#example select',
    template: '<ul class="options"><li class="option"><a href="#" class="label"/></li></ul>'
});
{% endhighlight %}

Example
<div id="exampleFancySelect2" class="well" style="width: 16em;">
    <select name="example">
        <option value="">Any...</option>
        <option value="1">First</option>
        <option value="2">Second</option>
        <option value="3">Third</option>
    </select>
    <div class="well"> </div>
</div>
<script type="text/javascript">
    $(function () {
        $('#exampleFancySelect2 div').simplicityFancySelect({
          select: '#exampleFancySelect2 select',
          template: "<ul class='options'><li class='option'><a href='#' class='label'/></li></ul>"
        });
    });
</script>

Second, by using the DOM target to specify the template.

HTML
{% highlight html %}
<div id="example">
    <select name="example">
        <option value="">Any...</option>
        <option value="1">First</option>
        <option value="2">Second</option>
        <option value="3">Third</option>
    </select>
    <div>
        <ul class="options">
            <li class="option"><a href="#" class="label"></a></li>
        </ul>
    </div>
</div>
{% endhighlight %}

JavaScript
{% highlight javascript %}
$('#example div').simplicityFancySelect({
    select: '#example select',
    template: ''
});
{% endhighlight %}

Example
<div id="exampleFancySelect3" class="well" style="width: 16em;">
    <select name="example">
        <option value="">Any...</option>
        <option value="1">First</option>
        <option value="2">Second</option>
        <option value="3">Third</option>
    </select>
    <div class="well">
        <ul class="options">
            <li class="option"><a href="#" class="label"> </a></li>
        </ul>
    </div>
</div>
<script type="text/javascript">
    $(function () {
        $('#exampleFancySelect3 div').simplicityFancySelect({
          select: '#exampleFancySelect3 select',
          template: ''
        });
    });
</script>

Multi Select
============

If the `select` is configured to support multiple selection, then you can select multiple rows in the fancy version.

HTML
{% highlight html %}
<div id="example">
    <select name="example" multiple="multiple">
        <option value="1">First</option>
        <option value="2">Second</option>
        <option value="3">Third</option>
        <option value="4">Fourth</option>
        <option value="5">Fifth</option>
    </select>
    <div>
        <ul class="options">
            <li class="option"><a href="#" class="label"></a></li>
        </ul>
    </div>
</div>
{% endhighlight %}

JavaScript
{% highlight javascript %}
$('#example div').simplicityFancySelect({
    select: '#example select',
    template: ''
});
{% endhighlight %}

Example
<div id="exampleFancySelect4" class="well" style="width: 16em;">
    <label><span class="badge">1</span> select</label>
    <select name="example" multiple="multiple" size="5">
        <option value="1">First</option>
        <option value="2">Second</option>
        <option value="3">Third</option>
        <option value="4">Fourth</option>
        <option value="5">Fifth</option>
    </select>
    <label><span class="badge">2</span> fancy select</label>
    <div class="well">
        <ul class="options">
            <li class="option"><a href="#" class="label"> </a></li>
        </ul>
    </div>
</div>
<script type="text/javascript">
    $(function () {
        $('#exampleFancySelect4 div').simplicityFancySelect({
          select: '#exampleFancySelect4 select',
          template: ''
        });
    });
</script>

Change the selection in <span class="badge">1</span> and the visible state in <span class="badge">2</span> is updated.

Click on rows in <span class="badge">2</span> and the value in <span class="badge">1</span> is updated.

Checkboxes
==========

You can enable support for checkboxes by adding the `option-checkbox` class to them.

HTML
{% highlight html %}
<div id="example">
    <select name="example" multiple="multiple">
        <option value="1">First</option>
        <option value="2">Second</option>
        <option value="3">Third</option>
        <option value="4">Fourth</option>
        <option value="5">Fifth</option>
    </select>
    <div>
        <ul class="options">
            <li class="option">
                <label>
                    <input type="checkbox" name="example" class="option-checkbox" />
                    <span class="label"></span>
                </label>
            </li>
        </ul>
    </div>
</div>
{% endhighlight %}

JavaScript
{% highlight javascript %}
$('#example div').simplicityFancySelect({
    select: '#example select',
    template: ''
});
{% endhighlight %}

Example
<div id="exampleFancySelect5" class="well" style="width: 16em;">
    <select name="example" multiple="multiple" size="5">
        <option value="1">First</option>
        <option value="2">Second</option>
        <option value="3">Third</option>
        <option value="4">Fourth</option>
        <option value="5">Fifth</option>
    </select>
    <div class="well">
        <ul class="options">
            <li class="option">
                <label>
                    <input type="checkbox" name="example" class="option-checkbox" />
                    <span class="label"> </span>
                </label>
            </li>
        </ul>
    </div>
</div>
<script type="text/javascript">
    $(function () {
        $('#exampleFancySelect5 div').simplicityFancySelect({
          select: '#exampleFancySelect5 select',
          template: ''
        });
    });
</script>

Radio Buttons
=============

Radio buttons can also be used by using the `radioStyle` and `checkableInputSelector` options.

HTML
{% highlight html %}
<div id="example">
    <select name="example">
        <option value="">Any...</option>
        <option value="1">First</option>
        <option value="2">Second</option>
        <option value="3">Third</option>
        <option value="4">Fourth</option>
        <option value="5">Fifth</option>
    </select>
    <div>
        <ul class="options">
            <li class="option">
                <label>
                    <input type="radio" name="example" class="option-radio" />
                    <span class="label"></span>
                </label>
            </li>
        </ul>
    </div>
</div>
{% endhighlight %}

JavaScript
{% highlight javascript %}
$('#example div').simplicityFancySelect({
    select: '#example select',
    template: '',
    radioStyle: true,
    checkableInputSelector: ':radio.option-radio'
});
{% endhighlight %}

Example
<div id="exampleFancySelect6" class="well" style="width: 16em;">
    <select name="example">
        <option value="">Any...</option>
        <option value="1">First</option>
        <option value="2">Second</option>
        <option value="3">Third</option>
        <option value="4">Fourth</option>
        <option value="5">Fifth</option>
    </select>
    <div class="well">
        <ul class="options">
            <li class="option">
                <label>
                    <input type="radio" name="example" class="option-radio" />
                    <span class="label"> </span>
                </label>
            </li>
        </ul>
    </div>
</div>
<script type="text/javascript">
    $(function () {
        $('#exampleFancySelect6 div').simplicityFancySelect({
          select: '#exampleFancySelect6 select',
          template: '',
          radioStyle: true,
          checkableInputSelector: ':radio.option-radio'
        });
    });
</script>

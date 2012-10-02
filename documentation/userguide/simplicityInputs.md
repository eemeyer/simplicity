---
layout: default
nav: userguide
nav2: simplicityInputs
title: simplicityInputs
subhead: simplicityInputs
lead: Binding HTML inputs to state.
---

{% include userguide/nav.html %}

simplicityInputs
================

We progressively enhance the standard HTML `input` elements to bind them to the widget state and thus decouple UI features from the backend search specific widgets.

Changes to the `input`s are automatically reflected in the state. Changes to the state are automatically reflected in the `input`s.

Text Input
==========

To bind a single `input` to the state, first create the input.

{% highlight html %}
<input type="text" name="example">
{% endhighlight %}

Then apply the `simplicityInputs` widget to it.

{% highlight javascript %}
$('input').simplicityInputs();
{% endhighlight %}

Changes to the `input` will cause the state to be updated and changes to the state will be reflected in the `input`.

This live example shows how the state propagation works.

<div id="exampleInput" class="well" style="width: 16em;">
    <label><span class="badge">1</span> input</label>
    <input name="example" class="input-large" />
    <label><span class="badge">2</span> state</label>
    <textarea name="state" rows="3" class="input-large">
    </textarea>
</div>
<script type="text/javascript">
    $(function () {
        $('#exampleInput textarea:last').simplicityState();
        $('#exampleInput input').simplicityInputs({
          stateElement: '#exampleInput textarea:last'
        });
        $('#exampleInput textarea:last')
            .simplicityStateExampleEditor()
            .simplicityState('state', {example: 4});
    });
</script>

Change the value in <span class="badge">1</span>, tab out and the state JSON in <span class="badge">2</span> is updated

Alter the JSON in <span class="badge">2</span>, tab out and the value in <span class="badge">1</span> is updated.

Textarea
========

To bind a single `textarea` to the state, first create the input.

{% highlight html %}
<textarea type="text" name="example"> </textarea>
{% endhighlight %}

Then apply the `simplicityInputs` widget to it.

{% highlight javascript %}
$('textarea').simplicityInputs();
{% endhighlight %}

Changes to the `textarea` will cause the state to be updated and changes to the state will be reflected in the `textarea`.

This live example shows how the state propagation works.

<div id="exampleTextarea" class="well" style="width: 16em;">
    <label><span class="badge">1</span> textarea</label>
    <textarea name="example" rows="3" class="input-large">
    </textarea>
    <label><span class="badge">2</span> state</label>
    <textarea name="state" rows="4" class="input-large"> </textarea>
</div>
<script type="text/javascript">
    $(function () {
        $('#exampleTextarea textarea:last').simplicityState();
        $('#exampleTextarea textarea:first').simplicityInputs({
          stateElement: '#exampleTextarea textarea:last'
        });
        $('#exampleTextarea textarea:last')
            .simplicityStateExampleEditor()
            .simplicityState('state', {example: 'example text\ngoes here'});
    });
</script>

Change the value in <span class="badge">1</span>, tab out and the state JSON in <span class="badge">2</span> is updated

Alter the JSON in <span class="badge">2</span>, tab out and the value in <span class="badge">1</span> is updated.

Checkboxes
==========

To bind a set of `<input type="checkbox">` to the state, first create the inputs.

{% highlight html %}
<fieldset>
    <label><input type="checkbox" name="example" value="1" />First</label>
    <label><input type="checkbox" name="example" value="2" />Second</label>
    <label><input type="checkbox" name="example" value="3" />Third</label>
</fieldset>
{% endhighlight %}

Then apply the `simplicityInputs` widget to them.

{% highlight javascript %}
$('input').simplicityInputs();
{% endhighlight %}

Changes to the checkboxes will cause the state to be updated and changes to the state will be reflected in the checkboxes.

This live example shows how the state propagation works.

<div id="exampleCheckboxes" class="well" style="width: 16em;">
    <label><span class="badge">1</span> checkboxes</label>
    <label class="checkbox">
        <input type="checkbox" name="example" value="1" />First
    </label>
    <label class="checkbox">
        <input type="checkbox" name="example" value="2" />Second
    </label>
    <label class="checkbox">
        <input type="checkbox" name="example" value="3" />Third
    </label>
    <label><span class="badge">2</span> state</label>
    <textarea name="state" rows="7" class="input-large"> </textarea>
</div>
<script type="text/javascript">
    $(function () {
        $('#exampleCheckboxes textarea:last').simplicityState();
        $('#exampleCheckboxes input').simplicityInputs({
          stateElement: '#exampleCheckboxes textarea:last'
        });
        $('#exampleCheckboxes textarea:last')
            .simplicityStateExampleEditor()
            .simplicityState('state', {example: '2'});
    });
</script>

Change the value in <span class="badge">1</span>, tab out and the state JSON in <span class="badge">2</span> is updated

Alter the JSON in <span class="badge">2</span>, tab out and the value in <span class="badge">1</span> is updated.

Radio buttons
=============

To bind a set of `<input type="radio">` to the state, first create the inputs.

{% highlight html %}
<fieldset>
    <label><input type="radio" name="example" value="a" />Alpha</label>
    <label><input type="radio" name="example" value="b" />Bravo</label>
    <label><input type="radio" name="example" value="c" />Charlie</label>
</fieldset>
{% endhighlight %}

Then apply the `simplicityInputs` widget to them.

{% highlight javascript %}
$('input').simplicityInputs();
{% endhighlight %}

Changes to the checkboxes will cause the state to be updated and changes to the state will be reflected in the checkboxes.

This live example shows how the state propagation works.

<div id="exampleRadios" class="well" style="width: 16em;">
    <label><span class="badge">1</span> radio buttons</label>
    <label class="radio">
        <input type="radio" name="example" value="a" />Alpha
    </label>
    <label class="radio">
        <input type="radio" name="example" value="b" />Bravo
    </label>
    <label class="radio">
        <input type="radio" name="example" value="c" />Charlie
    </label>
    <label><span class="badge">2</span> state</label>
    <textarea name="state" rows="3" class="input-large"> </textarea>
</div>
<script type="text/javascript">
    $(function () {
        $('#exampleRadios textarea:last').simplicityState();
        $('#exampleRadios input').simplicityInputs({
          stateElement: '#exampleRadios textarea:last'
        });
        $('#exampleRadios textarea:last')
            .simplicityStateExampleEditor()
            .simplicityState('state', {example: 'c'});
    });
</script>

Change the value in <span class="badge">1</span>, tab out and the state JSON in <span class="badge">2</span> is updated

Alter the JSON in <span class="badge">2</span>, tab out and the value in <span class="badge">1</span> is updated.

Select
======

To bind a single `<select>` to the state, first create the select.

{% highlight html %}
<select name="example">
    <option value="">Any...</option>
    <option value="1">First</option>
    <option value="2">Second</option>
    <option value="3">Third</option>
</select>
{% endhighlight %}

Then apply the `simplicityInputs` widget to it.

{% highlight javascript %}
$('select').simplicityInputs();
{% endhighlight %}

Changes to the checkboxes will cause the state to be updated and changes to the state will be reflected in the checkboxes.

This live example shows how the state propagation works.

<div id="exampleSelect" class="well" style="width: 16em;">
    <label><span class="badge">1</span> select</label>
    <select name="example">
        <option value="">Any...</option>
        <option value="1" data-count="11">First</option>
        <option value="2" data-count="3">Second</option>
        <option value="3" data-count="6">Third</option>
    </select>
    <label><span class="badge">2</span> state</label>
    <textarea name="state" rows="3" class="input-large"> </textarea>
</div>
<script type="text/javascript">
    $(function () {
        $('#exampleSelect textarea:last').simplicityState();
        $('#exampleSelect select').simplicityInputs({
          stateElement: '#exampleSelect textarea:last'
        });
        $('#exampleSelect textarea:last')
            .simplicityStateExampleEditor()
            .simplicityState('state', {});
    });
</script>

Change the value in <span class="badge">1</span>, tab out and the state JSON in <span class="badge">2</span> is updated

Alter the JSON in <span class="badge">2</span>, tab out and the value in <span class="badge">1</span> is updated.

Multiple Select
===============

To bind a multiple `<select>` to the state, first create the select.

{% highlight html %}
<select name="example" multiple="multiple">
    <option value="1">First</option>
    <option value="2">Second</option>
    <option value="3">Third</option>
    <option value="4">Fourth</option>
</select>
{% endhighlight %}

Then apply the `simplicityInputs` widget to it.

{% highlight javascript %}
$('select').simplicityInputs();
{% endhighlight %}

Changes to the checkboxes will cause the state to be updated and changes to the state will be reflected in the checkboxes.

This live example shows how the state propagation works.

<div id="exampleMultiSelect" class="well" style="width: 16em;">
    <label><span class="badge">1</span> select</label>
    <select name="example" multiple="multiple">
        <option value="1">First</option>
        <option value="2">Second</option>
        <option value="3">Third</option>
        <option value="4">Fourth</option>
    </select>
    <label><span class="badge">2</span> state</label>
    <textarea name="state" rows="8" class="input-large"> </textarea>
</div>
<script type="text/javascript">
    $(function () {
        $('#exampleMultiSelect textarea:last').simplicityState();
        $('#exampleMultiSelect select').simplicityInputs({
          stateElement: '#exampleMultiSelect textarea:last'
        });
        $('#exampleMultiSelect textarea:last')
            .simplicityStateExampleEditor()
            .simplicityState('state', {});
    });
</script>

Change the value in <span class="badge">1</span>, tab out and the state JSON in <span class="badge">2</span> is updated

Alter the JSON in <span class="badge">2</span>, tab out and the value in <span class="badge">1</span> is updated.

Multiple inputs single-select
=================================

To bind a multiple single-select capable `input`s to the state, first create them.

{% highlight html %}
<input name="example"/>

<label><input type="radio" name="example" value="a" />Alpha</label>
<label><input type="radio" name="example" value="b" />Bravo</label>
<label><input type="radio" name="example" value="c" />Charlie</label>

<select name="example">
    <option value="">Any...</option>
    <option value="a">Alpha</option>
    <option value="b">Bravo</option>
    <option value="c">Charlie</option>
</select>
{% endhighlight %}

Then apply the `simplicityInputs` widget to it.

{% highlight javascript %}
$(':input').simplicityInputs();
{% endhighlight %}

Changes to the checkboxes will cause the state to be updated and changes to the state will be reflected in the checkboxes.

This live example shows how the state propagation works.

<div id="multiInputSingleSelect" class="well" style="width: 16em;">
    <label><span class="badge">1</span> input</label>
    <input name="example" class="input-large" />
    <label><span class="badge">2</span> radio buttons</label>
    <label class="radio"><input type="radio" name="example" value="a" />Alpha</label>
    <label class="radio"><input type="radio" name="example" value="b" />Bravo</label>
    <label class="radio"><input type="radio" name="example" value="c" />Charlie</label>
    <label><span class="badge">3</span> select</label>
    <select name="example">
        <option value="">Any...</option>
        <option value="a">Alpha</option>
        <option value="b">Bravo</option>
        <option value="c">Charlie</option>
    </select>
    <label><span class="badge">4</span> state</label>
    <textarea name="state" rows="3" class="input-large"> </textarea>
</div>
<script type="text/javascript">
    $(function () {
        $('#multiInputSingleSelect textarea:last').simplicityState();
        $('#multiInputSingleSelect input, #multiInputSingleSelect select').simplicityInputs({
          stateElement: '#multiInputSingleSelect textarea:last'
        });
        $('#multiInputSingleSelect textarea:last')
            .simplicityStateExampleEditor()
            .simplicityState('state', {});
    });
</script>

Change the value in <span class="badge">1</span>, <span class="badge">2</span> or <span class="badge">3</span>, tab out and the state JSON in <span class="badge">4</span> is updated

Alter the JSON in <span class="badge">4</span>, tab out and the values in <span class="badge">1</span>, <span class="badge">2</span> and <span class="badge">3</span> are updated.

Multiple inputs multi-select
=================================

To bind a multiple mutli-select capable `input`s to the state, first create them.

{% highlight html %}
<label><input type="checkbox" name="example" value="a" />Alpha</label>
<label><input type="checkbox" name="example" value="b" />Bravo</label>
<label><input type="checkbox" name="example" value="c" />Charlie</label>

<select name="example">
    <option value="a">Alpha</option>
    <option value="b">Bravo</option>
    <option value="c">Charlie</option>
</select>
{% endhighlight %}

Then apply the `simplicityInputs` widget to it.

{% highlight javascript %}
$(':input').simplicityInputs();
{% endhighlight %}

Changes to the checkboxes will cause the state to be updated and changes to the state will be reflected in the checkboxes.

This live example shows how the state propagation works.

<div id="multiInputMultiSelect" class="well" style="width: 16em;">
    <label><span class="badge">1</span> radio buttons</label>
    <label class="checkbox"><input type="checkbox" name="example" value="a" />Alpha</label>
    <label class="checkbox"><input type="checkbox" name="example" value="b" />Bravo</label>
    <label class="checkbox"><input type="checkbox" name="example" value="c" />Charlie</label>
    <label><span class="badge">2</span> select</label>
    <select name="example" multiple="multiple">
        <option value="a">Alpha</option>
        <option value="b">Bravo</option>
        <option value="c">Charlie</option>
    </select>
    <label><span class="badge">3</span> state</label>
    <textarea name="state" rows="7" class="input-large"> </textarea>
</div>
<script type="text/javascript">
    $(function () {
        $('#multiInputMultiSelect textarea:last').simplicityState();
        $('#multiInputMultiSelect input, #multiInputMultiSelect select').simplicityInputs({
          stateElement: '#multiInputMultiSelect textarea:last'
        });
        $('#multiInputMultiSelect textarea:last')
            .simplicityStateExampleEditor()
            .simplicityState('state', {});
    });
</script>

Change the value in <span class="badge">1</span> or <span class="badge">2</span>, tab out and the state JSON in <span class="badge">3</span> is updated

Alter the JSON in <span class="badge">3</span>, tab out and the values in <span class="badge">1</span> and <span class="badge">2</span> are updated.

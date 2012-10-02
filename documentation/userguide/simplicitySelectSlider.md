---
layout: default
nav: userguide
nav2: simplicitySelectSlider
title: simplicitySelectSlider
subhead: simplicitySelectSlider
lead: Handles are a drag.
---

{% include userguide/nav.html %}

simplicitySelectSlider
======================

Create a `select` with the `option`s you wish to allow.

{% highlight html %}
<div id="example">
    <select name="example">
        <option value="a">A</option>
        <option value="b">B</option>
        <option value="c">C</option>
        <option value="d">D</option>
        <option value="e">E<option>
    </select>
    <div></div>
</div>
{% endhighlight %}

Then apply the `simplicitySelectSlider` widget to it.

{% highlight javascript %}
$('#example div').simplicitySelectSlider({
    select: '#example select'
});
{% endhighlight %}

Example
<div id="exampleSlider" class="well" style="width: 16em;">
    <label><span class="badge">1</span> select</label>
    <select name="example">
        <option value="a">A</option>
        <option value="b">B</option>
        <option value="c">C</option>
        <option value="d">D</option>
        <option value="e">E</option>
    </select>
    <label><span class="badge">2</span> slider</label>
    <div style="margin: 4em 0 2em 0;"> </div>
</div>
<script type="text/javascript">
    $(function () {
        $('#exampleSlider div').simplicitySelectSlider({
          select: '#exampleSlider select'
        });
    });
</script>

Options
===========

There are a few different options to control the look and feel of the slider.

<div id="exampleSliderOptions" class="well" style="width: 32em;">
    <div style="margin: 3em 1em 2em 1em;"> </div>
    <label><input name="showTicks" type="checkbox" class="checkbox" /> showTicks</label>
    <label><input name="showLabels" type="checkbox" class="checkbox" /> showLabels</label>
    <label><input name="centerLabels" type="checkbox" class="checkbox" /> centerLabels</label>
    <label><input name="justifyEndLabels" type="checkbox" class="checkbox" /> justifyEndLabels</label>
    <label><input name="showTooltip" type="checkbox" class="checkbox" /> showTooltip</label>
    <label><input name="centerTooltip" type="checkbox" class="checkbox" /> centerTooltip</label>
    <select id="exampleSliderCust" name="example">
        <option value="a">Alpha</option>
        <option value="b">Beta</option>
        <option value="c">Charlie</option>
        <option value="d">Delta</option>
        <option value="e">Echo</option>
    </select>
</div>
<script type="text/javascript">
    $(function () {
        $('#exampleSliderOptions div:first').simplicitySelectSlider({
          select: '#exampleSliderOptions select'
        });
        $('#exampleSliderOptions :checkbox').each(function (idx, elem) {
            elem.checked = $('#exampleSliderOptions div:first').simplicitySelectSlider('option', elem.name);
        });
        $('#exampleSliderOptions :checkbox').click(function (evt) {
            var name = evt.target.name,
                selected = evt.target.checked;
            $('#exampleSliderOptions div:first').simplicitySelectSlider('option', name, selected);
        });
    });
</script>

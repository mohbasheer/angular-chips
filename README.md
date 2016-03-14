# Angular-Chips

[![Join the chat at https://gitter.im/mohbasheer/angular-chips](https://badges.gitter.im/mohbasheer/angular-chips.svg)](https://gitter.im/mohbasheer/angular-chips?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Angular-Chips is the angular based component. You can use it to add dynamic chips or free form tags. check samples directory for more information.

### Install:

`bower install angular-chips --save-dev`

Include after angular.js script tag

`<script type="text/javascript" src="/bower_components/angular/angular.js"></script>`

`<script type="text/javascript" src="/bower_components/angular-chips/dist/angular-chips.min.js"></script>`

Include css file:

`<link rel="stylesheet" type="text/css" href="/bower_components/angular-chips/dist/main.css">`

Include in you application module.

`angular.module('sample',['angular.chips']);`

Basic Markup

```
<chips ng-model="inputdemo.companies">
    <chip-tmpl>
        <div class="default-chip">
            {{chip}}
            <span class="glyphicon glyphicon-remove" remove-chip></span>
        </div>
    </chip-tmpl>
    <input chip-control></input>
</chips>
```

Using Promise Markup

```
<chips defer ng-model="usingPromiseObj.countries">
    <chip-tmpl>
        <div class="default-chip">
            {{chip.defer.name}}
            <span>({{chip.defer.fl}})</span>
            <span class="glyphicon glyphicon-remove" remove-chip></span>
        </div>
    </chip-tmpl>
    <input chip-control></input>
</chips>
```



[![Build Status](https://travis-ci.org/mohbasheer/angular-chips.svg?branch=master)](https://travis-ci.org/mohbasheer/angular-chips)

<a href="http://blog.imaginea.com/angular-chips-documentation/" target="_blank"><h3>Documentation</h3></a>

### Examples:

<a href="http://codepen.io/mohbasheer/pen/RaRQxN" target="_blank"><h3 style="margin:0">Edit</h3></a>
<img src="others/Basic_example.gif" style="border: 1px solid #000000">

<a href="http://codepen.io/mohbasheer/pen/pybLNx" target="_blank"><h3 style="margin:0">Edit</h3></a>
<img src="others/Custom_example.gif" style="border: 1px solid #000000">

<a href="http://codepen.io/mohbasheer/pen/XdKEpL" target="_blank"><h3 style="margin:0">Edit</h3></a>
<img src="others/Using_Promise_string_example.gif" style="border: 1px solid #000000">

<a href="http://codepen.io/mohbasheer/pen/YqWaQN" target="_blank"><h3 style="margin:0">Edit</h3></a>
<img src="others/Using_Promise_obj_example.gif" style="border: 1px solid #000000">

<a href="http://codepen.io/mohbasheer/pen/JXKLyY" target="_blank"> <h3 style="margin:0">Edit</h3> </a>
<img src="others/Using_typeahead_example2.gif" style="border: 1px solid #000000">

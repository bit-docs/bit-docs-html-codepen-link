<style>
    .highlight {background-color: #90FEFB;}
    .expand {height: 20px; background-color: red;}
    .codepen:before {
        content: "Try it in your browser!"
    }
</style>

## ESModule

```html
<my-app></my-app>

<script type="module">
import { Component } from "can";
Component
</script>
```
<div class='codepen'></div>

## Straight JS

```js
import {DefineMap} from "can";
console.log( myCounter.count ) //-> 1
```
<div class='codepen'></div>

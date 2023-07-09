# Idiomorph

Idiomorph is a javascript library for morphing one DOM tree to another.  It is inspired by other libraries that 
pioneered this functionality:

* [morphdom](https://github.com/patrick-steele-idem/morphdom) - the original DOM morphing library
* [nanomorph](https://github.com/choojs/nanomorph) - an updated take on morphdom

Both morphdom and nanomorph use the `id` property of a node to match up elements within a given set of sibling nodes.  When
an id match is found, the existing element is not removed from the DOM, but is instead morphed in place to the new content.
This preserves the node in the DOM, and allows state (such as focus) to be retained. 

However, in both these algorithms, the structure of the _children_ of sibling nodes is not considered when morphing two 
nodes: only the ids of the nodes are considered.  This is due to performance: it is not feasible to recurse through all 
the children of siblings when matching things up. 

## id sets

Idiomorph takes a different approach: before node-matching occurs, both the new content and the old content
are processed to create _id sets_, a mapping of elements to _a set of all ids found within that element_.  That is, the
set of all ids in all children of the element, plus the element's id, if any.

Id sets can be computed relatively efficiently via a query selector + a bottom up algorithm.

Given an id set, you can now adopt a broader sense of "matching" than simply using id matching: if the intersection between
the id sets of element 1 and element 2 is non-empty, they match.  This allows Idiomorph to relatively quickly match elements
based on structural information from children, who contribute to a parent's id set, which allows for better overall matching
when compared with simple id-based matching.

## Usage

Idiomorph is a small (1.7k min/gz'd), dependency free JavaScript library, and can be installed via NPM or your favorite 
dependency management system under the `Idiomorph` dependency name.  You can also include it via a CDN like unpkg to
load it directly in a browser:

```html
<script src="https://unpkg.com/idiomorph"></script>
```

Or you can download the source to your local project.

Idiomorph has a very simple usage:

```js
  Idiomorph.morph(existingNode, newNode);
```

This will morph the existingNode to have the same structure as the newNode.  Note that this is a destructive operation
with respect to both the existingNode and the newNode.

You can also pass string content in:

```js
  Idiomorph.morph(existingNode, "<div>New Content</div>");
```

And it will be parsed and merged into the new content.

If you wish to target the `innerHTML` rather than the `outerHTML` of the content, you can pass in a `morphStyle` 
in a third config argument:

```js
  Idiomorph.morph(existingNode, "<div>New Content</div>", {morphStyle:'innerHTML'});
```

This will replace the _inner_ content of the existing node with the new content.

### Options

Idiomorph supports the following options:

| option         | meaning                                                                                                     | example                                                                 |
|----------------|-------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------|
| `morphstyle`   | The style of morphing to use, either `innerHTML` or `outerHTML`                                             | `Idiomorph.morph(..., {morphStyle:'innerHTML'})`                        |
| `ignoreActive` | If set to `true`, idiomorph will skip the active element                                                    | `Idiomorph.morph(..., {ignoreActive:true})`                             |
| `head`         | Allows you to control how the `head` tag is merged.  See the [head](#the-head-tag) section for more details | `Idiomorph.morph(..., {head:{style:merge}})`                            |
| `callbacks`    | Allows you to insert callbacks when events occur in the morph life cycle, see the callback table below      | `Idiomorph.morph(..., {callbacks:{beforeNodeAdded:function(node){...}})` |

#### Callbacks

| callback          | description                                  |
|-------------------|----------------------------------------------|
| beforeNodeAdded   | Called before a new node is added to the DOM |
| afterNodeAdded    | Called after a new node is added to the DOM  |
| beforeNodeMorphed | Called before a node is morphed in the DOM   |
| afterNodeMorphed  | Called after a node is morphed in the DOM    |
| beforeNodeRemoved | Called before a node is removed from the DOM |
| afterNodeRemoved  | Called after a node is removed from the DOM  |

### The `head` tag

The head tag is treated specially by idiomorph because:

* It typically only has one level of children within it
* Those children often to not have `id` attributes associated with them
* It is important to remove as few elements as possible from the head, in order to minimize network requests for things
  like style sheets
* The order of elements in the head tag is (usually) not meaningful

Because of this, by default, idiomorph adopts a `merge` algorithm between two head tags, `old` and `new`:

* Elements that are in both `old` and `new` are ignored
* Elements that are in `new` but not in `old` are added to the `old`
* Elements that are in `old` but not in `new` are removed from `old`

Thus the content of the two head tags will be the same, but the order of those elements will not be.

#### Attribute Based Fine-Grained Head Control

Sometimes you may want even more fine-grained control over head merging behavior.  For example, you may want a script
tag to re-evaluate, even though it is in both `old` and `new`.  To do this, you can add the attribute `im-re-append='true'`
to the script tag, and idiomorph will re-append the script tag even if it exists in both head tags, forcing re-evaluation
of the script.

Similarly, you may wish to preserve an element even if it is not in `new`.  You can use the attribute `im-preserve='true'`
in this case to retain the element.

#### Additional Configuration

You are also able to override these behaviors, see the `head` config object in the source code.

You can set `head.style` to:

* `merge` - the default algorithm outlined above
* `append` - simply append all content in `new` to `old`
* `morph` - adopt the normal idiomorph morphing algorithm for the head
* `none` - ignore the head tag entirely

For example, if you wanted to merge a whole page using the `morph` algorithm for the head tag, you would do this:

```js
Idiomorph.morph(document.documentElement, newPageSource, {head:{style: 'morph'}})
```

The `head` object also offers callbacks for configuring head merging specifics.

### htmx

Idiomorph was created to integrate with [htmx](https://htmx.org) and can be used as a swapping mechanism by including
the `Idiomorph-ext` file in your HTML:

```html
<script src="https://unpkg.com/idiomorph/dist/idiomorph-ext.min.js"></script>
<div hx-ext="morph">
    
    <button hx-get="/example" hx-swap="morph:innerHTML">
        Morph My Inner HTML
    </button>

    <button hx-get="/example" hx-swap="morph:outerHTML">
        Morph My Outer HTML
    </button>
    
    <button hx-get="/example" hx-swap="morph">
        Morph My Outer HTML
    </button>
    
</div>
```

## Performance

Idiomorph is not designed to be as fast as either morphdom or nanomorph.  Rather, its goals are:

* Better DOM tree matching
* Relatively simple code

Performance is a consideration, but better matching is the reason Idiomorph was created.  Initial tests indicate that
it is approximately equal to 10% slower than morphdom for large DOM morphs, and equal to or faster than morphdom for 
smaller morphs.

## Example Morph

Here is a simple example of some HTML in which Idiomorph does a better job of matching up than morphdom:

*Initial HTML*
```html
<div>
    <div>
        <p id="p1">A</p>
    </div>
    <div>
        <p id="p2">B</p>
    </div>
</div>
```

*Final HTML*

```html
<div>
    <div>
        <p id="p2">B</p>
    </div>
    <div>
        <p id="p1">A</p>
    </div>
</div>
```

Here we have a common situation: a parent div, with children divs and grand-children divs that have ids on them.  This
is a common situation when laying out code in HTML: parent divs often do not have ids on them (rather they have classes,
for layout reasons) and the "leaf" nodes have ids associated with them.

Given this example, morphdom will detach both #p1 and #p2 from the DOM because, when it is considering the order of the
children, it does not see that the #p2 grandchild is now within the first child.

Idiomorph, on the other hand, has an _id set_ for the (id-less) children, which includes the ids of the grandchildren.
Therefore, it is able to detect the fact that the #p2 grandchild is now a child of the first id-less child.  Because of
this information it is able to only move/detach _one_ grandchild node, #p1.  (This is unavoidable, since they changed order)

So, you can see, by computing id sets for nodes, idiomoroph is able to achieve better DOM matching, with fewer node 
detachments.

## Demo

You can see a practical demo of Idiomorph out-performing morphdom (with respect to DOM stability, _not_ performance) 
here:

https://github.com/bigskysoftware/Idiomorph/blob/main/test/demo/video.html

For both algorithms, this HTML:

```html
<div>
    <div>
        <h3>Above...</h3>
    </div>
    <div>
        <iframe id="video" width="422" height="240" src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Rick Astley - Never Gonna Give You Up (Official Music Video)" frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen></iframe>
    </div>
</div>
```

is moprhed into this HTML:

```html 
<div>
    <div>
        <iframe id="video" width="422" height="240" src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Rick Astley - Never Gonna Give You Up (Official Music Video)" frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen></iframe>
    </div>
    <div>
        <h3>Below...</h3>
    </div>
</div>
```

Note that the iframe has an id on it, but the first-level divs do not have ids on them.  This means
that morphdom is unable to tell that the video element has moved up, and the first div should be discarded, rather than morphed into, to preserve the video element.  

Idiomorph, however, has an id-set for the top level divs, which includes the id of the embedded child, and can see that the video has moved to be a child of the first element in the top level children, so it correctly discards the first div and merges the video content with the second node.

You can see visually that idiomoroph is able to keep the video running because of this, whereas morphdom is not:

![Rick Roll Demo](https://github.com/bigskysoftware/Idiomorph/raw/main/test/demo/rickroll-idiomorph.gif)

To keep things stable with morphdom, you would need to add ids to at least one of the top level divs.

Here is a diagram explaining how the two algorithms differ in this case:

![Comparison Diagram](https://github.com/bigskysoftware/Idiomorph/raw/main/img/comparison.png)

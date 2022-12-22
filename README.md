# popup-js

A sleek and highly customizable JavaScript library used to generate full-screen infographic popups with minimal effort.

## Installation

Install `popup-js` with the following script tag:

```html
<script src="https://cdn.jsdelivr.net/npm/@simondmc/popup-js@1.4.0/popup.min.js"></script>
```

## Documentation

A full documentation is available [here](https://popup-js.rtfd.io).

## Usage/Examples

Create a popup by instantiating the Popup class with customization parameters.

```javascript
const myPopup = new Popup({
    id: "my-popup",
    title: "My First Popup",
    content: `
        An example popup.
        Supports multiple lines.`,
});
```

Display the popup by calling the `.show()` method.

```javascript
myPopup.show();
```

Examples of a more complex popup:

```javascript
/* A demo popup showing a lot of the library features. */
const popup = new Popup({
    id: "demo-popup",
    title: "Demo Popup",
    content: `
        This is a demo of the popup library.
        big-margin§This line has a larger top margin.
        This is an example of {a-https://example.com}[a link].
        This is an example of {btn-red-button}[a red button].
        This text is {red}[red] {bold green}[bold green] {blue}[blue]].
        This text has a                lot of spaces.
        big-margin space-out§This line and the next {btn-b1}[Button 1]
        space-out§are left aligned. {btn-b2}[Button 2]
        big-margin§This text {shadow}[has {white}[some] shadow].`,
    titleColor: "#4842f5",
    backgroundColor: "#bff7ff",
    showImmediately: true,
    sideMargin: "15%",
});
```

```javascript
/* A popup from one of my projects showing its usage. */
const infoPopup = new Popup({
    id: "color-info",
    title: "Color Guesser",
    content: `
        You are presented with a color.
        Estimate the hex code of the color.
        Six characters, ranging from 00-FF for 3 channels.
        Values are in {a-https://learn.sparkfun.com/tutorials/hexadecimal/hex-basics}[Base-16].
        big-margin§{bold}[#{red}[E4]{green}[F2]{blue}[DB]]
        big-margin§{black bold}[#000000] is black.                {white bold shadow}[#FFFFFF] is white.
        big-margin§Good luck.`,
    titleColor: "rgb(92, 0, 95)",
    titleMargin: "0",
    backgroundColor: "#ffebfe",
    fixedHeight: true,
    showImmediately: true,
    showOnce: true,
});
```

![Color Guesser Popup Showcase](https://media.discordapp.net/attachments/847794209028833310/999926020817825872/unknown.png)

View the full documentation [here](https://popup-js.rtfd.io).

## License

This project is released under the [MIT license.](https://choosealicense.com/licenses/mit/)

## Contributing

Contributions are always welcome!

If you want a feature which currently doesn't exist, feel free to open a pull request.

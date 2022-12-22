const queuedPopups = [];
let loadPhase = 0;

// download css and apply
const head = document.getElementsByTagName("head")[0];
const link = document.createElement("link");
link.rel = "stylesheet";
link.type = "text/css";
link.href =
    "https://cdn.jsdelivr.net/npm/@simondmc/popup-js@1.4.0/popup.min.css";
//link.href = "../styles/popup.css";
link.media = "all";
head.appendChild(link);

// when css loads add to loadPhase
link.onload = function () {
    loadPhase += 1;
    if (loadPhase === 2) {
        loadPopups();
    }
};

// when doc loads add to loadPhase
window.addEventListener("load", () => {
    loadPhase += 1;
    if (loadPhase === 2) {
        loadPopups();
    }
});

function loadPopups() {
    // initialize all queued popups
    while (queuedPopups.length > 0) {
        queuedPopups.shift().init();
    }
}

class Popup {
    // build popup with parameters
    constructor(params = {}) {
        this.params = params;
        // if css and doc are already loaded, immediately init popup
        if (loadPhase == 2) {
            this.init();
        } else {
            // queue up the popup to be shown when css and doc load
            queuedPopups.push(this);
        }
    }

    init() {
        // assign parameters with default values
        this.id = this.params.id ?? "popup";
        const title = this.params.title ?? "Popup Title";
        let content = this.params.content ?? "Popup Content";
        const titleColor = this.params.titleColor ?? "#000000";
        const backgroundColor = this.params.backgroundColor ?? "#ffffff";
        const closeColor = this.params.closeColor ?? "#000000";
        const textColor = this.params.textColor ?? "#000000";
        const linkColor = this.params.linkColor ?? "#383838";
        const widthMultiplier = this.params.widthMultiplier ?? 1;
        const heightMultiplier = this.params.heightMultiplier ?? 0.66;
        const fontSizeMultiplier = this.params.fontSizeMultiplier ?? 1;
        const borderRadius = this.params.borderRadius ?? "15px";
        const sideMargin = this.params.sideMargin ?? "3%";
        const titleMargin = this.params.titleMargin ?? "2%";
        const lineSpacing = this.params.lineSpacing ?? "auto";
        const showImmediately = this.params.showImmediately ?? false;
        const showOnce = this.params.showOnce ?? false;
        const fixedHeight = this.params.fixedHeight ?? false;
        const allowClose = this.params.allowClose ?? true;
        const underlineLinks = this.params.underlineLinks ?? false;
        const fadeTime = this.params.fadeTime ?? "0.3s";
        const buttonWidth = this.params.buttonWidth ?? "fit-content";
        const borderWidth = this.params.borderWidth ?? "0";
        const borderColor = this.params.borderColor ?? "#000000";
        const disableScroll = this.params.disableScroll ?? true;
        const textShadow = this.params.textShadow ?? "none";
        const hideCloseButton = this.params.hideCloseButton ?? false;
        const hideTitle = this.params.hideTitle ?? false;

        // height and width calculations
        const height =
            "min(" +
            770 * heightMultiplier +
            "px, " +
            90 * heightMultiplier +
            "vw)";
        const width =
            "min(" +
            770 * widthMultiplier +
            "px, " +
            90 * widthMultiplier +
            "vw)";

        // font size calculation
        const fontSize =
            "min(" +
            25 * fontSizeMultiplier +
            "px, " +
            5.5 * fontSizeMultiplier +
            "vw)";

        // create style tag https://stackoverflow.com/a/524721/19271522
        let css = this.params.css ?? "";
        css += `
        .popup.${this.id} {
            transition-duration: ${fadeTime};
            text-shadow: ${textShadow};
            font-family: '${
                this.params.font ?? "Inter"
            }', 'Inter', Helvetica, sans-serif;
        }
        
        .popup.${this.id} .popup-content {
            background-color: ${backgroundColor};
            width:${width}; 
            height:${fixedHeight ? height : "fit-content"};
            border-radius: ${borderRadius};
            border: ${borderWidth} solid ${borderColor};
        }

        .popup.${this.id} .popup-header {
            margin-bottom: ${titleMargin};
        }

        .popup.${this.id} .popup-title {
            color: ${titleColor};
        }

        .popup.${this.id} .popup-close {
            color: ${closeColor};
        }

        .popup.${this.id} .popup-body {
            color: ${textColor};
            margin-left: ${sideMargin};
            margin-right: ${sideMargin};
            line-height: ${lineSpacing};
            font-size: ${fontSize};
        }

        .popup.${this.id} .popup-body button { 
            width: ${buttonWidth}; 
        }

        .popup.${this.id} .popup-body a { 
            color: ${linkColor};
            ${underlineLinks ? "text-decoration: underline;" : ""}
        }`;

        const head = document.head;
        const style = document.createElement("style");
        head.append(style);
        style.appendChild(document.createTextNode(css));

        // process input text
        content = content.split("\n");
        for (let i = 0; i < content.length; i++) {
            let line = content[i].trim();
            if (line === "") continue;
            // add <p>
            if (line.includes("§")) {
                const split = line.split("§");
                line = `<p class="${split[0].trim()}">${split[1].trim()}</p>`;
            } else {
                line = `<p>${line}</p>`;
            }

            // replace two spaces with nbsps
            line = line.replace(/  /g, "&nbsp;&nbsp;");

            /* ------- Reduced element formatting ------- */

            // a
            while (/{a-(.*?)}\[(.*?)]/.test(line))
                line = line.replace(
                    /{a-(.*?)}\[(.*?)]/g,
                    '<a href="$1" target="_blank">$2</a>'
                );

            // button
            while (/{btn-(.*?)}\[(.*?)]/.test(line))
                line = line.replace(
                    /{btn-(.*?)}\[(.*?)]/g,
                    '<button class="$1">$2</button>'
                );

            // reduced style formatting
            line = line
                .replace(/([^\\]?){/g, '$1<span class="')
                .replace(/([^\\]?)}\[/g, '$1">')
                .replace(/([^\\]?)]/g, "$1</span>");

            content[i] = line;
        }
        content = content.join("");

        // create popup
        const popup = document.createElement("div");
        popup.setAttribute("class", "popup " + this.id);
        popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-header">
                ${
                    /* only add title if hideTitle is off */
                    hideTitle ? "" : `<div class="popup-title">${title}</div>`
                }
                ${
                    /* only add close button if allowClose is on and hideCloseButton is off */
                    allowClose && !hideCloseButton
                        ? '<div class="popup-close">&times;</div>'
                        : ""
                }
            </div>
            <div class="popup-body">${content}</div>
        </div>`;
        document.body.appendChild(popup);

        document.querySelectorAll(".popup").forEach((el) =>
            el.addEventListener("click", (e) => {
                if (
                    e.target.className == "popup-close" ||
                    e.target.classList.contains("popup")
                ) {
                    // if allowClose is off, don't close
                    if (!allowClose) return;
                    // close popup
                    el.classList.remove("fade-in");
                    el.classList.add("fade-out");
                    // remember for next time
                    if (localStorage && showOnce) {
                        localStorage.setItem("popup-" + this.id, true);
                    }
                    postHide(this);
                }
            })
        );

        // run load callback if specified
        if (
            this.params.loadCallback &&
            typeof this.params.loadCallback == "function"
        ) {
            this.params.loadCallback();
        }

        // show popup (with no animation) if enabled
        if (showImmediately) {
            // check for local storage (already closed once)
            if (showOnce && localStorage) {
                if (localStorage.getItem("popup-" + this.id)) {
                    return;
                }
            }
            document
                .querySelector(".popup." + this.id)
                .classList.add("fade-in");
            postShow(disableScroll);
        }
    }

    show() {
        const el = document.querySelector(".popup." + this.id);
        el.classList.remove("fade-out");
        el.classList.add("fade-in");
        postShow(this.params.disableScroll ?? true);
    }

    hide() {
        const el = document.querySelector(".popup." + this.id);
        el.classList.remove("fade-in");
        el.classList.add("fade-out");
        postHide(this);
    }
}

function postShow(disableScrollParam) {
    // disable scroll if enabled
    if (disableScrollParam) disableScroll();
}

function postHide(popup) {
    // call hide callback if set
    if (
        popup.params.hideCallback &&
        typeof popup.params.hideCallback == "function"
    ) {
        popup.params.hideCallback();
    }
    enableScroll();
}

function disableScroll() {
    // Get the current page scroll position
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    // if any scroll is attempted, set this to the previous value
    window.onscroll = function () {
        window.scrollTo(scrollLeft, scrollTop);
    };
}

function enableScroll() {
    window.onscroll = function () {};
}

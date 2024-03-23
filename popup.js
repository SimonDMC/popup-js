const queuedPopups = [];
let loadPhase = 0;

// download css and apply
const head = document.getElementsByTagName("head")[0];
const link = document.createElement("link");
link.rel = "stylesheet";
link.type = "text/css";
link.href = "https://cdn.jsdelivr.net/npm/@simondmc/popup-js@1.4.3/popup.min.css";
//link.href = "../popup.css";
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
        this.title = this.params.title ?? "Popup Title";
        this.content = this.params.content ?? "Popup Content";
        this.titleColor = this.params.titleColor ?? "#000000";
        this.backgroundColor = this.params.backgroundColor ?? "#ffffff";
        this.closeColor = this.params.closeColor ?? "#000000";
        this.textColor = this.params.textColor ?? "#000000";
        this.linkColor = this.params.linkColor ?? "#383838";
        this.widthMultiplier = this.params.widthMultiplier ?? 1;
        this.heightMultiplier = this.params.heightMultiplier ?? 0.66;
        this.fontSizeMultiplier = this.params.fontSizeMultiplier ?? 1;
        this.borderRadius = this.params.borderRadius ?? "15px";
        this.sideMargin = this.params.sideMargin ?? "3%";
        this.titleMargin = this.params.titleMargin ?? "2%";
        this.lineSpacing = this.params.lineSpacing ?? "auto";
        this.showImmediately = this.params.showImmediately ?? false;
        this.showOnce = this.params.showOnce ?? false;
        this.fixedHeight = this.params.fixedHeight ?? false;
        this.allowClose = this.params.allowClose ?? true;
        this.underlineLinks = this.params.underlineLinks ?? false;
        this.fadeTime = this.params.fadeTime ?? "0.3s";
        this.buttonWidth = this.params.buttonWidth ?? "fit-content";
        this.borderWidth = this.params.borderWidth ?? "0";
        this.borderColor = this.params.borderColor ?? "#000000";
        this.disableScroll = this.params.disableScroll ?? true;
        this.textShadow = this.params.textShadow ?? "none";
        this.hideCloseButton = this.params.hideCloseButton ?? false;
        this.hideTitle = this.params.hideTitle ?? false;

        // height and width calculations
        this.height = `min(${770 * this.heightMultiplier}px, ${90 * this.heightMultiplier}vw)`;
        this.width = `min(${770 * this.widthMultiplier}px, ${90 * this.widthMultiplier}vw)`;

        // font size calculation
        this.fontSize = `min(${25 * this.fontSizeMultiplier}px, ${4 * this.fontSizeMultiplier}vw)`;

        // create style tag https://stackoverflow.com/a/524721/19271522
        this.css = this.params.css ?? "";
        this.css += `
        .popup.${this.id} {
            transition-duration: ${this.fadeTime};
            text-shadow: ${this.textShadow};
            font-family: '${this.params.font ?? "Inter"}', 'Inter', Helvetica, sans-serif;
        }
        
        .popup.${this.id} .popup-content {
            background-color: ${this.backgroundColor};
            width: ${this.width}; 
            height: ${this.fixedHeight ? this.height : "unset"};
            border-radius: ${this.borderRadius};
            border: ${this.borderWidth} solid ${this.borderColor};
        }

        .popup.${this.id} .popup-header {
            margin-bottom: ${this.titleMargin};
        }

        .popup.${this.id} .popup-title {
            color: ${this.titleColor};
        }

        .popup.${this.id} .popup-close {
            color: ${this.closeColor};
        }

        .popup.${this.id} .popup-body {
            color: ${this.textColor};
            margin-left: ${this.sideMargin};
            margin-right: ${this.sideMargin};
            line-height: ${this.lineSpacing};
            font-size: ${this.fontSize};
        }

        .popup.${this.id} .popup-body button { 
            width: ${this.buttonWidth}; 
        }

        .popup.${this.id} .popup-body a { 
            color: ${this.linkColor};
            ${this.underlineLinks ? "text-decoration: underline;" : ""}
        }`;

        const head = document.head;
        const style = document.createElement("style");
        head.append(style);
        style.appendChild(document.createTextNode(this.css));

        // process input text
        this.content = this.content.split("\n");
        for (let i = 0; i < this.content.length; i++) {
            let line = this.content[i].trim();
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
            while (/{a-(.*?)}\[(.*?)]/.test(line)) line = line.replace(/{a-(.*?)}\[(.*?)]/g, '<a href="$1" target="_blank">$2</a>');

            // button
            while (/{btn-(.*?)}\[(.*?)]/.test(line)) line = line.replace(/{btn-(.*?)}\[(.*?)]/g, '<button class="$1">$2</button>');

            // reduced style formatting
            line = line
                .replace(/([^\\]?){/g, '$1<span class="')
                .replace(/([^\\]?)}\[/g, '$1">')
                .replace(/([^\\]?)]/g, "$1</span>");

            this.content[i] = line;
        }
        this.content = this.content.join("");

        // create popup
        this.popupEl = document.createElement("div");
        this.popupEl.classList.add("popup");
        this.popupEl.classList.add(this.id);
        this.popupEl.innerHTML = `
        <div class="popup-content">
            <div class="popup-header">
                ${
                    /* only add title if hideTitle is off */
                    this.hideTitle ? "" : `<div class="popup-title">${this.title}</div>`
                }
                ${
                    /* only add close button if allowClose is on and hideCloseButton is off */
                    this.allowClose && !this.hideCloseButton ? '<div class="popup-close">&times;</div>' : ""
                }
            </div>
            <div class="popup-body">${this.content}</div>
        </div>`;
        document.body.appendChild(this.popupEl);

        this.popupEl.addEventListener("click", (e) => {
            if (e.target.className == "popup-close" || e.target.classList.contains("popup")) {
                // don't close if not allowed
                if (!this.allowClose) return;
                // close popup
                this.hide();
            }
        });

        // run load callback if specified
        if (this.params.loadCallback && typeof this.params.loadCallback == "function") {
            this.params.loadCallback();
        }

        // show popup (with no animation) if enabled
        if (this.showImmediately) {
            // check for local storage (already closed once)
            if (this.showOnce && localStorage) {
                if (localStorage.getItem("popup-" + this.id)) {
                    return;
                }
            }
            this.popupEl.classList.add("fade-in");
            postShow(disableScroll);
        }

        // hide popup on escape key press
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                // don't close if not allowed
                if (!this.allowClose) return;
                // close popup
                this.hide();
            }
        });
    }

    show() {
        this.popupEl.classList.remove("fade-out");
        this.popupEl.classList.add("fade-in");
        postShow(this.params.disableScroll ?? true);
    }

    hide() {
        this.popupEl.classList.remove("fade-in");
        this.popupEl.classList.add("fade-out");
        // remember for next time
        if (localStorage && this.showOnce) {
            localStorage.setItem("popup-" + this.id, true);
        }
        postHide(this);
    }
}

function postShow(disableScrollParam) {
    // disable scroll if enabled
    if (disableScrollParam) disableScroll();
}

function postHide(popup) {
    // call hide callback if set
    if (popup.params.hideCallback && typeof popup.params.hideCallback == "function") {
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

const queuedPopups = [];
let loaded = false;

// download css and apply
let head = document.getElementsByTagName("head")[0];
let link = document.createElement("link");
link.rel = "stylesheet";
link.type = "text/css";
link.href =
    "https://cdn.jsdelivr.net/npm/@simondmc/popup-js@1.3.1/popup.min.css";
//link.href = "../styles/popup.css";
link.media = "all";
head.appendChild(link);
link.onload = function () {
    loaded = true;
    // if there are any queued popups, initialize them
    if (queuedPopups.length > 0) {
        while (queuedPopups.length > 0) {
            queuedPopups.shift().init();
        }
    }
};

class Popup {
    // build popup with parameters
    constructor(params = {}) {
        this.params = params;
        // if css is already downloaded, immediately load popup
        if (loaded) {
            this.init();
        } else {
            // queue up the popup to be shown when css finishes downloading
            queuedPopups.push(this);
        }
    }

    init() {
        // assign parameters with default values
        this.id = this.params.id ?? "popup";
        let title = this.params.title ?? "Popup Title";
        let content = this.params.content ?? "Popup Content";
        let titleColor = this.params.titleColor ?? "#000000";
        let backgroundColor = this.params.backgroundColor ?? "#ffffff";
        let closeColor = this.params.closeColor ?? "#000000";
        let textColor = this.params.textColor ?? "#000000";
        let linkColor = this.params.linkColor ?? "#383838";
        let widthMultiplier = this.params.widthMultiplier ?? 1;
        let heightMultiplier = this.params.heightMultiplier ?? 0.66;
        let fontSizeMultiplier = this.params.fontSizeMultiplier ?? 1;
        let borderRadius = this.params.borderRadius ?? "15px";
        let sideMargin = this.params.sideMargin ?? "3%";
        let titleMargin = this.params.titleMargin ?? "2%";
        let lineSpacing = this.params.lineSpacing ?? "auto";
        let showImmediately = this.params.showImmediately ?? false;
        let showOnce = this.params.showOnce ?? false;
        let dynamicHeight = this.params.dynamicHeight ?? false;
        let allowClose = this.params.allowClose ?? true;
        let underlineLinks = this.params.underlineLinks ?? false;
        let fadeTime = this.params.fadeTime ?? "0.3s";
        let buttonWidth = this.params.buttonWidth ?? "fit-content";
        let borderWidth = this.params.borderWidth ?? "0";
        let borderColor = this.params.borderColor ?? "#000000";

        // height and width calculations
        let height =
            "min(" +
            770 * heightMultiplier +
            "px, " +
            90 * heightMultiplier +
            "vw)";
        let width =
            "min(" +
            770 * widthMultiplier +
            "px, " +
            90 * widthMultiplier +
            "vw)";

        // font size calculation
        let fontSize =
            "min(" +
            25 * fontSizeMultiplier +
            "px, " +
            5.5 * fontSizeMultiplier +
            "vw)";

        // create style tag https://stackoverflow.com/a/524721/19271522
        const css = `
        .popup.${this.id} {
            transition-duration: ${fadeTime};
        }
        
        .popup.${this.id} .popup-content {
            background-color: ${backgroundColor};
            width:${width}; 
            height:${dynamicHeight ? "fit-content" : height};
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
        let head = document.head;
        let style = document.createElement("style");
        head.append(style);
        style.appendChild(document.createTextNode(css));

        // process input text
        content = content.split("\n");
        for (let i = 0; i < content.length; i++) {
            let line = content[i].trim();
            if (line === "") continue;
            // add <p>
            if (line.includes("§")) {
                let split = line.split("§");
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
        let popup = document.createElement("div");
        popup.setAttribute("class", "popup " + this.id);
        popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-header">
                <div class="popup-title">${title}</div>
                ${
                    /* only add close button if allowClose is on */ allowClose
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
                    // if hide callback is set, call it
                    if (
                        this.params.hideCallback &&
                        typeof this.params.hideCallback == "function"
                    ) {
                        this.params.hideCallback();
                    }
                }
            })
        );

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
        }
    }

    show() {
        let el = document.querySelector(".popup." + this.id);
        el.classList.remove("fade-out");
        el.classList.add("fade-in");
    }

    hide() {
        let el = document.querySelector(".popup." + this.id);
        el.classList.remove("fade-in");
        el.classList.add("fade-out");
        // if hide callback is set, call it
        if (
            this.params.hideCallback &&
            typeof this.params.hideCallback == "function"
        ) {
            this.params.hideCallback();
        }
    }
}

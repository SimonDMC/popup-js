let queuedPopup, loaded = null;

// download css and apply
let head  = document.getElementsByTagName('head')[0];
let link  = document.createElement('link');
link.rel  = 'stylesheet';
link.type = 'text/css';
link.href = './styles/popup.css';
link.media = 'all';
head.appendChild(link);
link.onload = function() {
    loaded = true;
    if (queuedPopup) {
        queuedPopup.init();
        queuedPopup = null;
    }
}

class Popup {

    // build popup with parameters
    constructor(params) {
        this.params = params;
        // if css is already downloaded, immediately load popup
        if (loaded) {
            this.init();
        } else {
            // queue up the popup to be shown when css finishes downloading
            queuedPopup = this;
        }
    }

    init() {
        // assign parameters with default values
        this.id = this.params.id || 'popup';
        let title = this.params.title || 'Popup Title';
        let content = this.params.content || 'Popup Content';
        let titleColor = this.params.titleColor || '#000000';
        let backgroundColor = this.params.backgroundColor || '#ffffff';
        let closeColor = this.params.closeColor || '#000000';
        let textColor = this.params.textColor || '#000000';
        let widthMultiplier = this.params.widthMultiplier || 1;
        let heightMultiplier = this.params.heightMultiplier || 0.66;
        let sideMargin = this.params.sideMargin || '3%';
        let titleMargin = this.params.titleMargin || '2%';
        let lineSpacing = this.params.lineSpacing || 'auto';
        let showImmediately = this.params.showImmediately || false;
        let showOnce = this.params.showOnce || false;
        let dynamicHeight = this.params.dynamicHeight || false;
        let buttonWidth = this.params.buttonWidth || 'fit-content';

        // height and width calculations
        let height = 'min(' + (770 * heightMultiplier) + 'px, ' + (80 * heightMultiplier) + 'vw)';
        let width = 'min(' + (770 * widthMultiplier) + 'px, ' + (80 * widthMultiplier) + 'vw)';

        // create style tag https://stackoverflow.com/a/524721/19271522
        var css = `
        .popup.${this.id} .popup-content {
            background-color: ${backgroundColor};
            width:${width}; 
            height:${dynamicHeight ? 'fit-content' : height};
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
        }

        .popup.${this.id} .popup-body button { 
            width: ${buttonWidth}; 
        }`;
        let head = document.head;
        let style = document.createElement('style');
        head.append(style);
        style.appendChild(document.createTextNode(css));

        // process input text
        content = content.split('\n');
        for (let i = 0; i < content.length; i++) {
            let line = content[i].trim();
            if (line === '') continue;

            // add <p>
            if (line.includes('§')) {
                let split = line.split('§');
                line = `<p class="${split[0].trim()}">${split[1].trim()}</p>`;
            } else {
                line = `<p>${line}</p>`;
            }

            // replace two spaces with nbsps
            line = line.replace(/  /g, '&nbsp;&nbsp;');

            /* ------- Reduced element formatting ------- */

            // a
            line = line.replace(/{a-(.*)}\[(.*)]/g, '<a href="$1" target="_blank">$2</a>');
            // button
            line = line.replace(/{btn-(.*)}\[(.*)]/g, '<button class="$1">$2</button>');

            // reduced style formatting
            line = line.replace(/([^\\]?){/g, '$1<span class="')
                .replace(/([^\\]?)}\[/g, '$1">')
                .replace(/([^\\]?)]/g, '$1</span>');

            content[i] = line;
        }
        content = content.join('');

        // create popup
        let popup = document.createElement('div');
        popup.setAttribute('class', 'popup ' + this.id);
        // immediately hide
        popup.classList.add('hidden');
        popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-header">
                <div class="popup-title">${title}</div>
                <div class="popup-close">&times;</div>
            </div>
            <div class="popup-body">${content}</div>
        </div>`;
        document.body.appendChild(popup);

        document.querySelectorAll('.popup').forEach(el => el.addEventListener('click', e =>{
            if (e.target.className == 'popup-close' || e.target.classList.contains('popup')) {
                // close popup
                el.classList.remove('fade-in');
                el.classList.add('fade-out');
                // remember for next time
                if (localStorage && showOnce) {
                    localStorage.setItem('popup-' + this.id, true);
                }
            }
        }));

        // show popup (with no animation) if enabled
        if (showImmediately) {
            // check for local storage (already closed once)
            if (showOnce && localStorage) {
                if (localStorage.getItem('popup-' + this.id)) {
                    return;
                }
            }
            document.querySelector('.popup.' + this.id).classList.remove('hidden');
        }
    }

    show() {
        let el = document.querySelector('.popup.' + this.id);
        el.classList.remove('hidden');
        el.classList.remove('fade-out');
        el.classList.add('fade-in');
    }
}
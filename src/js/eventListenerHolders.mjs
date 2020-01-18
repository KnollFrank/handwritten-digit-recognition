'use strict';

export class EventListenerHolder {

    constructor(type, htmlElementProvider) {
        this.type = type;
        this.htmlElementProvider = htmlElementProvider;
        this._eventListener = e => this.eventListener(e);
    }

    setEventListener(eventListener) {
        this.getHtmlElement().removeEventListener(this.type, this._eventListener);
        this.eventListener = eventListener;
        this.getHtmlElement().addEventListener(this.type, this._eventListener);
    }

    getHtmlElement() {
        if (!this.htmlElement) {
            this.htmlElement = this.htmlElementProvider();
        }
        return this.htmlElement;
    }
}

export class SubmitEventListenerHolder {

    constructor(htmlElementProvider) {
        this.delegate = new EventListenerHolder('submit', htmlElementProvider);
    }

    setEventListener(eventListener) {
        this.delegate.setEventListener(e => {
            e.preventDefault();
            eventListener(e);
            return false;
        });
    }
}
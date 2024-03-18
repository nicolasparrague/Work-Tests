import { LightningElement, api } from 'lwc';

export default class MainContent extends LightningElement {
    _heading;
    _headingStyle;
    _styleClass = '';

    @api
    get heading() {
        return this._heading;
    }

    set heading(val) {
        this._heading = val;
    }

    @api
    get styleclass() {
        return "mainContent " + this._styleClass;
    }

    set styleclass(val) {
        this._styleClass = val;
    }

    @api
    get headingstyle() {
        return this._headingStyle;
    }

    set headingstyle(val) {
        this._headingStyle = val;
    }

    renderedCallback() {
        let mainContent = this.template.querySelector('.mainContent');
        if(mainContent != null)
            mainContent.setAttribute('id','maincontent');
    }
}
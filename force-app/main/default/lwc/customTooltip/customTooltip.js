import { LightningElement, track, api } from 'lwc';

export default class CustomTooltip extends LightningElement {
    @track _label;
    @track _value;
    @track _helpText;
    @track _labelClass = 'nds-show--inline nds-form-element__label ';
    @track _valueClass = 'field-value ';
    @track _headerText;
    @track _headerClass;
    @track _subheaderText;
    @track _subheaderClass;
    @track _format;
    @track _arrowPosition = 'field-value ';
    @track _showOutputField = false;
    @track _showHeader = true;

    @api
    get label() {
        return this._label;
    }
    set label(val) {
        this._label = val;
    }
    
    @api
    get value() {
        return this._value;
    }
    set value(val) {
        if(isNaN(parseFloat(val)) ){
            this._value = val;
        }
        else{
            this._value = '$' + parseFloat(val).toFixed(2);
        }
    }
    
    @api
    get helptext() {
        return this._helpText;
    }
    set helptext(val) {
        this._helpText = val;
    }
    
    @api
    get labelclass() {
        return this._labelClass;
    }
    set labelclass(val) {
        if(val) {
            this._labelClass += val;
        }
    }
    
    @api
    get valueclass() {
        return this._valueClass;
    }
    set valueclass(val) {
        if(val){
            this._valueClass += val;
        }
    }

    @api
    get headertext() {
        return this._headerText;
    }
    set headertext(val) {
        this._headerText = val;
    }

    @api
    get headerclass() {
        return this._headerClass
    }
    set headerclass(val) {
        this._headerClass = val;
    }

    @api
    get subheadertext() {
        return this._subheaderText;
    }
    set subheadertext(val) {
        this._subheaderText = val;
    }

    @api
    get subheaderclass() {
        return this._subheaderClass
    }
    set subheaderclass(val) {
        this._subheaderClass = val;
    }

    @api
    get format() {
        return this._format;
    }
    set format(val) {
        this._format = val;
    }

    @api
    get arrowposition() {
        return this._arrowPosition;
    }
    set arrowposition(val) {
        this._arrowPosition = val;
    }

    renderedCallback() {
        if (this._format == "outputField") {
            this._showOutputField = true;
            this._showHeader = false;
        } else if (this._format == "header") {
            this._showOutputField = false;
            this._showHeader = true;
        }
    }
}
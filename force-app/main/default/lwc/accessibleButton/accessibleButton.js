import { LightningElement, track, api } from 'lwc';
import { NavigationMixin } from "lightning/navigation";
import { getDataHandler } from "omnistudio/utility";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
export default class AccessibleButton extends NavigationMixin(LightningElement) {
    _targetType;
    _targetName;
    _targetParams;
    _label;
    _name;
    _variant;
    _iconPosition;
    _iconName;
    _encryptedParams;
    _extraclass;
    _extrastyle;
    _icon;
    _hasModal = false;
    _isExternal = false;
    isModalGlobal = false;
    provider = 'Attentis Health';
    @track learnMoreButton;

    get gotVars() {
        let value = !!(this._targetType && this._targetName && this._targetParams && this._label && this._name);// && this._iconPosition && this._iconName);
        return value;
    }

    @api
    get icon() {
        return this._icon;
    }
    set icon(value) {
        this._icon = value;
    }

    @api
    get isexternal() {
        return this._isExternal;
    }
    set isexternal(value) {
        if(value == 'true')
            this._isExternal = true;
        else
            this._isExternal = false;
    }

    @api
    get hasmodal() {
        return this._hasModal;
    }
    set hasmodal(value) {
        if(value == 'true')
            this._hasModal = true;
        else
            this._hasModal = false;
    }

    @api
    get targettype() {
        return this._targetType;
    }
    set targettype(value) {
        this._targetType = value;
    }

    @api
    get targetname() {
        return this._targetName;
    }
    set targetname(value) {
        this._targetName = value;
    }

    @api
    get targetparams() {
        return this._targetParams;
    }
    set targetparams(value) {
        this._targetParams = value;
    }

    @api
    get label() {
        return this._label;
    }
    set label(value) {
        this._label = value;
    }

    @api
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    
    @api
    get variant() {
        return this._variant;
    }
    set variant(value) {
        this._variant = value;
    }

    @api
    get iconposition() {
        return this._iconPosition;
    }
    set iconposition(value) {
        this._iconPosition = value;
    }

    @api
    get iconname() {
        return this._iconName;
    }
    set iconname(value) {
        this._iconName = value;
    }
    
    @api
    get extraclass() {
        if(this._extraclass != null) {
            return 'c-fc-action-icon_right vlocity-btn nds-button nds-button_neutral ' + this._extraclass;
        } else {
            return 'c-fc-action-icon_right vlocity-btn nds-button nds-button_neutral';
        }
    }
    set extraclass(value) {
        this._extraclass = value;
    }
    
    @api
    get extrastyle() {
        if(this._extrastyle != null) {
            return this._extrastyle;
        } else {
            return '';
        }
    }
    set extraclass(value) {
        this._extraclass = value;
    }

    connectedCallback(){
        if(this._name === "Learn More"){
            this.learnMoreButton = true;
        }
        else{
            this.learnMoreButton = false;
        }
    }

    renderedCallback(){
      //Modal Focus - Start
      const  focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), table, thead, tr, th';
      const modal = this.template.querySelector(".modalAccessibility");

      if (modal != undefined){
         const firstFocusableElement = modal.querySelectorAll(focusableElements)[0]; // get first element to be focused inside modal
         const focusableContent = modal.querySelectorAll(focusableElements);
         const lastFocusableElement = focusableContent[focusableContent.length - 1]; // get last element to be focused inside modal         
         
            var me = this;
            window.addEventListener('keydown', function(event) {
            // modal.addEventListener('focus', function(event) {
            let isTabPressed = event.key === 'Tab' || event.keyCode === 9;
          
               if (!isTabPressed) {
                  return;
               }

               if (event.shiftKey) { // if shift key pressed for shift + tab combination
                  if (me.template.activeElement === firstFocusableElement) {
                     lastFocusableElement.focus(); // add focus for the last focusable element
                     event.preventDefault();
               }
               } else { // if tab key is pressed
                  if (me.template.activeElement === lastFocusableElement) { // if focused has reached to last focusable element then focus first focusable element after pressing tab
                     firstFocusableElement.focus(); // add focus for the first focusable element
                     event.preventDefault();
                  }
               }
            });

         firstFocusableElement.focus();

            window.addEventListener('keyup', function(event) {
               if(event.keyCode === 27 || event.key === "Escape"){
                  me.closeModal();
               }
            });
      }//Modal Focus - End      
    }

    encryptData(evt) {
        let inputMap = {
            methodName: 'encrypt',
            unencryptedStringValue: JSON.stringify(JSON.parse(this.targetparams))
        };
        this.callIp('portalEncrypt_Decrypt', inputMap).then(data => {
            this[NavigationMixin.Navigate]({
                type: this._targetType,
                attributes: {
                    pageName: this._targetName
                },
                state: {
                    dataParam: data.IPResult.encryptedString
                }
            });
        });
    }

    callIp(ipMethod, inputMap) {
        let datasourcedef = JSON.stringify({
            "type": "integrationprocedure",
            "value": {
                "ipMethod": ipMethod,
                "inputMap": inputMap,
                "optionsMap": ""
            }
        });

        return getDataHandler(datasourcedef).then(data => {
            return JSON.parse(data);

        }).catch(error => {
            console.error(`failed at getting IP data => ${JSON.stringify(error)}`);
        });
    }

    handleRedirection(evt) {
        this.encryptData(this.targetparams);
    }

    openModal() {
        if(this._hasModal) {
            this.isModalGlobal = true;     
        } else {
            var urlval = this._targetName;
            if(urlval.lastIndexOf('www') > -1 && urlval.lastIndexOf('http') > -1) {
                let type = "";
                let protocol = "";
                const urlString = window.location.href;
                const hostUrl = window.location.host;

                let urlArray = urlString.split("/");

                for (let index = 0; index < urlArray.length; index++) {
                    let element = urlArray[index];
                    if (element == "memberportal") {
                        type = element;
                    }
                    if (element == "https:") {
                        protocol = element;
                    }
                    if (element == "http:") {
                        protocol = element;
                    }
                }
                
                //Build URL for Landing Find Care Page
                let myUrl = protocol + '//' + hostUrl + '/' + type + '/s/' + urlval;
                urlval = myUrl;
            }
            if(this._isExternal) {
                window.open(urlval, '_blank');
            } else {
                window.open(urlval, '_self');
            }
        }  
    }

    closeModal() {
        // to close modal set isModalGlobal track value as false
        this.isModalGlobal = false;
    }

    
    navigateToExternalSite() {
        var urlval = this._targetName;
        if(urlval.lastIndexOf('www') == -1 && urlval.lastIndexOf('http') == -1) {
            let type = "";
            let protocol = "";
            const urlString = window.location.href;
            const hostUrl = window.location.host;

            let urlArray = urlString.split("/");

            for (let index = 0; index < urlArray.length; index++) {
                let element = urlArray[index];
                if (element == "memberportal") {
                    type = element;                    
                }
                if (element == "https:") {
                    protocol = element;
                }
                if (element == "http:") {
                    protocol = element;
                }
            }
            
            //Build URL for Landing Find Care Page
            let myUrl = protocol + '//' + hostUrl + '/' + type + '/s/' + urlval;
            urlval = myUrl;
        }
        if(this._isExternal) {
            window.open(urlval, '_blank');
            this.isModalGlobal = false;
        } else {
            window.open(urlval, '_self');
        }
    }

}
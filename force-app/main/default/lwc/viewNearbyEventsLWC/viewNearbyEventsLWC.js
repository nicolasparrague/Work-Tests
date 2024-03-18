import { LightningElement,api,track } from "lwc";

export default class ViewNearbyEventsLWC extends LightningElement {
    @track loading = true;
    @track _brand;
    @api
    get brand() {
       return this._brand;
    }
    set brand(val) {
       this._brand = val;
    }
    @track _url;
    @api
    get url() {
       return this._url;
    }
    set url(val) {
       this._url = val;
     }
    isModalGlobal = false;

    connectedCallback() {
    }

    goToExternalSite() {
        this.isModalGlobal = true;        
    }

    closeModal() {
        this.isModalGlobal = false;
    }

    renderedCallback() {
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const modal = this.template.querySelector(".modalAccessibility");

        if (modal != undefined) {
            const firstFocusableElement = modal.querySelectorAll(focusableElements)[0]; // get first element to be focused inside modal
            const focusableContent = modal.querySelectorAll(focusableElements);
            const lastFocusableElement = focusableContent[focusableContent.length - 1]; // get last element to be focused inside modal         

            var me = this;
            window.addEventListener('keydown', function (event) {
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

            window.addEventListener('keyup', function (event) {
                if (event.keyCode === 27 || event.key === "Escape") {
                    me.closeModal();
                }
            });
        }
    }

    openLink(){
        if (this._url) {
            window.open(this._url, "_blank");
        }
        this.isModalGlobal = false;   
    }
}
import { LightningElement,track,api } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import { NavigationMixin } from 'lightning/navigation';

export default class HomePageTelemedicineGetStarted extends OmniscriptBaseMixin(NavigationMixin(LightningElement)) {
   isMedicare = false;
   isCommercial = false;
   _productGroup;
   _brand;
    @track
    _url;
  
    @api
    get url() {
       return this._url;
    }
    set url(val) {
       this._url = val;
     }

     @track
    _buttonname;
  
    @api
    get buttonname() {
       return this._buttonname;
    }
    set buttonname(val) {
       this._buttonname = val;
     }

     @api
     get productGroup() {
        return this._productGroup;
     }
     set productGroup(val) {
        this._productGroup = val;
     }
  
     @api
     get brand() {
        return this._brand;
     }
     set brand(val) {
        this._brand = val;
     }
       
    isModalGlobal = false;

    goToExternalSite() {
        this.isModalGlobal = true;        
    }

    closeModal() {
        this.isModalGlobal = false;
    }

    renderedCallback() {
      if (this._productGroup == "Medicare") {
         this.isMedicare = true;
      } else if (this._productGroup == "Commercial") {
         this.isCommercial = true;
      }

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
    
   truvenLoginWithToken() {
      this[NavigationMixin.Navigate]({
        "type": "standard__webPage",
        "attributes": {
          "url": this._url
            }
           });
      this.closeModal();
   }
}
import { LightningElement, api, track } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";

export default class WrappingSelectField extends OmniscriptBaseMixin(LightningElement) {
   @api options = [];
   @api fieldToSave = "selectedComboValue";
   @api defaultValue;
   @api defaultCode;
   @api placeholderText = "Search ....";
   @api readOnly = false;
   @api disabled = false;
   @api required = false;
   @api labelValue = '';
   @track searchValue = "";
   @track selectedItem = "";
   @track selectedItemAccessibility = "";
   @track selectedItemCode = "";
   @track showItemListFlag = false;
   @track isSelection = false;
   @track selectNum = 0;
   filter;

   _passthroughValue = '';
   @api
   get passthroughValue() {
      return this._passthroughValue;
   }
   set passthroughValue(value) {
      this._passthroughValue = value;
      this.selectedItem = this._passthroughValue;
      this.selectedItemAccessibility = "Network Name is " + " " + this.selectedItem;
   }   

   get isDisabled(){
      if(this.disabled == true || this.disabled == 'true') {
         return true;
      }
      if(this.disabled == false || this.disabled == 'false') {
         return false;
      }
   }

   get isRequired(){
      if(this.required == true || this.required == 'true') {
         return true;
      }
      if(this.required == false || this.required == 'false') {
         return false;
      }
   }
 
    handleFocusIn() {
       if (!this.readOnly) {
          this.showItemListFlag = true;
          this.template.querySelector(".item_list").classList.remove("nds-hide");
          this.template.querySelector(".nds-searchIcon").classList.add("nds-hide");
          this.template.querySelector(".nds-icon-utility-down").classList.remove("nds-hide");
          this.template.querySelector(".nds-dropdown-trigger").classList.add("nds-is-open");
          this.template.querySelector(".searchvalue").setAttribute("aria-expanded", true);
       }
    }
 
    handleFocusOut() {
      window.clearTimeout(this.delayTimeout);
      this.template.querySelector(".item_list").classList.add("nds-hide");
      this.template.querySelector(".searchvalue").setAttribute("aria-expanded", false);
    }
 
   
   handleKeyUp(event) {
       // Debouncing this method: do not update the reactive property as
       // long as this function is being called within a delay of 300 ms.
       // This is to avoid filtering a very large number of list.
       window.clearTimeout(this.delayTimeout);
       this.searchValue = event.target.value;
       if(!this.searchValue) {
           this.searchValue = '';
       }
       this.isSelection = false;
       this.delayTimeout = setTimeout(() => {
          this.filter = this.searchValue.toUpperCase();
          this.displayItemList(this.filter);
          if (this.searchValue === "") {
             this.template.querySelector(".item_list").classList.remove("nds-hide");
             this.template.querySelector(".nds-searchIcon").classList.remove("nds-hide");
             this.template.querySelector(".nds-icon-utility-down").classList.add("nds-hide");
          }
          if (this.selectedItem !== this.searchValue) {
             this.updateDataJsonNoSelection();
          }
       }, 300);
    }

    handleKeyDown(event) {
      if(event.code == 'ArrowDown') {
         event.preventDefault();
         let selectedListItem = this.template.querySelector('.item_list li[aria-selected=true]');
         if(selectedListItem != undefined) {
            let nextListItem = selectedListItem.nextElementSibling;
            if(nextListItem != undefined) {
               selectedListItem.setAttribute('aria-selected', false);
               nextListItem.setAttribute('aria-selected', true);
               nextListItem.scrollIntoView(false);
               event.target.setAttribute('aria-activedescendant', nextListItem.getAttribute('id'));
            }
         } else {
            let firstListItem = this.template.querySelector('.item_list li:first-Child');
            if(firstListItem != undefined) {
               firstListItem.setAttribute('aria-selected', true);
               firstListItem.scrollIntoView(false);
               event.target.setAttribute('aria-activedescendant', firstListItem.getAttribute('id'));
            }
         }
      } else if(event.code == 'ArrowUp') {
         event.preventDefault();
         let selectedListItem = this.template.querySelector('.item_list li[aria-selected=true]');
         if(selectedListItem != undefined) {
            let previousListItem = selectedListItem.previousElementSibling;
            if(previousListItem != undefined) {
               selectedListItem.setAttribute('aria-selected', false);
               previousListItem.setAttribute('aria-selected', true);
               previousListItem.scrollIntoView(false);
               event.target.setAttribute('aria-activedescendant', previousListItem.getAttribute('id'));
            }
         } else {
            event.target.removeAttribute('aria-activedescendant');
         }
      } else if(event.code == 'Enter' || event.code == 'Space') {
         event.preventDefault();
         let selectedListItem = this.template.querySelector('.item_list li[aria-selected=true]');
         if(selectedListItem != undefined) {
            selectedListItem.setAttribute('aria-selected', false);
            event.target.removeAttribute('aria-activedescendant');
            this.selectOption(selectedListItem);
         }
      }
   }
 
   handleOptionSelect(event) {
      this.selectOption(event.currentTarget);
   }
 
   selectOption(target) {
      this.selectedItem = target.dataset.name;
      this.selectedItemCode = target.dataset.id;

      if (!this.isSelection) {
         this.isSelection = true;
         this.selectNum++;
      }
      this.updateDataJson();
      this.itemSelectEvent(this.selectedItemCode);
   }
 
    displayItemList(filter) {
       const span = this.template.querySelector(".nds-listbox_vertical").childNodes;
       for (let i = 0; i < span.length; i++) {
          const option = span[i].textContent;
          if (option.toUpperCase().indexOf(filter) > -1) {
             span[i].style.display = "";
          } else {
             span[i].style.display = "none";
          }
       }
    }
 
    itemSelectEvent(code) {
       const evt = new CustomEvent("itemselected", {
          bubbles: true,
          composed: true,
          detail: { itemCode: code },
       });
       this.dispatchEvent(evt);
    }
 
    connectedCallback() {
       //Checking Default Value
       if (this.defaultValue) {
          this.selectedItem = this.defaultValue;
          this.isSelection = true;
          this.selectedItemAccessibilityPN = "Plan Name is" + " " + this.selectedItem;
       }
       if (this.defaultCode) {
          this.selectedItemCode = this.defaultCode;
       } else {
          this.selectedItemCode = this.defaultValue;
       }
       this.updateDataJson();
    }    
 
    renderedCallback() {
      this.template.querySelector(".searchvalue").disabled = this.readOnly;
    }
 
    updateDataJson() {
       var selectedData = { [this.fieldToSave]: this.selectedItem, [this.fieldToSave + "Code"]: this.selectedItemCode, isComboSelectDone: this.isSelection, comboSelectNum: this.selectNum };
       this.omniApplyCallResp(selectedData);
    }
 
    updateDataJsonNoSelection() {
       var selectedData = { [this.fieldToSave]: "", [this.fieldToSave + "Code"]: "", isComboSelectDone: this.isSelection, comboSelectNum: this.selectNum };
       this.omniApplyCallResp(selectedData);
    }   

 }
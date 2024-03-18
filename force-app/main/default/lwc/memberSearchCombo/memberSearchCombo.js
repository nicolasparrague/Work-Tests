import { LightningElement, api, track } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
export default class MemberSearchCombo extends OmniscriptBaseMixin(LightningElement) {
   @api options = [];
   @api fieldToSave = "selectedComboValue";
   @api defaultValue;
   @api defaultCode;
   @api placeholderText = "Search ....";
   @api readOnly = false;
   @api required = false;
   @track searchValue = "";
   @track selectedItem = "";
   @track selectedItemCode = "";
   @track showItemListFlag = false;
   @track isSelection = false;
   @track selectNum = 0;
   filter;

   @track overOnScrollbar = false;

   handleClickArrow() {
      let isHidden = this.template.querySelector(".item_list").classList.contains("nds-hide");
      if (isHidden) {
         this.handleFocusIn();
      } else {
         this.handleFocusOut();
      }
   }

   handleFocusIn() {
      if (!this.readOnly) {               
         this.showItemListFlag = true;
         this.overOnScrollbar = false;
         this.template.querySelector(".item_list").classList.remove("nds-hide");
         this.template.querySelector(".nds-searchIcon").classList.add("nds-hide"); 
         this.template.querySelector(".nds-dropdown-trigger").classList.add("nds-is-open");
         this.template.querySelector(".searchvalue").setAttribute("aria-expanded", true);
      }
   }

   handleFocusOut() {
      this.showSuccess = false;
      this.showError = false;
      this.itemRemoved = false;
      let combobox = this.template.querySelector('.searchvalue');
      combobox.removeAttribute('aria-activedescendant');
      combobox.setAttribute("aria-expanded", false);
      let selectedListItem = this.template.querySelector('.item_list li[aria-selected=true]');
      if(selectedListItem != undefined) {
         selectedListItem.setAttribute('aria-selected', false);
      }
      if (!this.overOnScrollbar) {
         //Hide dropdown except clicking on the scroll bar
         window.clearTimeout(this.delayTimeout);
         this.template.querySelector(".item_list").classList.add("nds-hide");
         this.template.querySelector(".searchvalue").setAttribute("aria-expanded", false);
      }
      this.showItemListFlag = false;
      this.updateDataJson();
   } 
 

   handleKeyUp(event) {
      // Debouncing this method: do not update the reactive property as
      // long as this function is being called within a delay of 300 ms.
      // This is to avoid filtering a very large number of list.
      window.clearTimeout(this.delayTimeout);
      this.searchValue = event.target.value;
      this.isSelection = false;
      this.delayTimeout = setTimeout(() => {
         this.filter = this.searchValue.toUpperCase();
         this.displayItemList(this.filter);
         if (this.searchValue === "") {
            this.template.querySelector(".item_list").classList.remove("nds-hide");
            this.template.querySelector(".nds-searchIcon").classList.remove("nds-hide");
            this.template.querySelector(".nds-icon-utility-down").classList.add("nds-hide");
         }
      }, 300);
   }

   handleKeyDown(event) {
      if(event.code == 'ArrowDown') {
         event.preventDefault();
         let selectedListItem = this.template.querySelector('.item_list li[aria-selected=true]');
         if(selectedListItem != undefined) {
            let nextListItem = this.nextSibling(selectedListItem);
            if(nextListItem != undefined) {
               selectedListItem.setAttribute('aria-selected', false);
               nextListItem.setAttribute('aria-selected', true);
               nextListItem.scrollIntoView(false);
               event.target.setAttribute('aria-activedescendant', nextListItem.getAttribute('id'));
            }
         } else {
            let firstListItem = this.template.querySelector('.item_list li:first-Child');
            if(firstListItem.matches('[style="display: none;"]')) {
               firstListItem = this.nextSibling(firstListItem);
            }
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
            let previousListItem = this.previousSibling(selectedListItem);
            if(previousListItem != undefined) {
               selectedListItem.setAttribute('aria-selected', false);
               previousListItem.setAttribute('aria-selected', true);
               previousListItem.scrollIntoView(false);
               event.target.setAttribute('aria-activedescendant', previousListItem.getAttribute('id'));
            }
         } else {
            event.target.removeAttribute('aria-activedescendant');
         }
      } else if(event.code == 'Enter') {
         let selectedListItem = this.template.querySelector('.item_list li[aria-selected=true]');
         if(selectedListItem != undefined) {
            selectedListItem.setAttribute('aria-selected', false);
            event.target.removeAttribute('aria-activedescendant');
            this.selectOption(selectedListItem);
         }
      }
   }

   nextSibling(currentNode) {
      var sibling = currentNode.nextElementSibling;
      while (sibling) {
         if (!sibling.matches('[style="display: none;"]')) return sibling;
         sibling = sibling.nextElementSibling
      }
      return;
   }

   previousSibling(currentNode) {
      var sibling = currentNode.previousElementSibling;
      while (sibling) {
         if (!sibling.matches('[style="display: none;"]')) return sibling;
         sibling = sibling.previousElementSibling
      }
      return;
   }

   selectOption(target) {
      this.selectedItem = target.dataset.name;
      this.showError = false;
      this.showSuccess = false;

      let selectedCount = 0;
      this.selectedItemArr.forEach((item) => {
         if (item.value == this.selectedItem) {
            selectedCount++;
         }
      });
      if (selectedCount > 0) {
         // Prevent selection if item has already been selected
         this.showError = true;
         return;
      } else {
         this.template.querySelector(`[data-id="${target.dataset.id}"]`).classList.add("list-item-checked");
         this.template.querySelector(`[data-id="${target.dataset.id}"]`).classList.add("disabled-list-item");
         this.selectedItemArr.push({ key: target.dataset.id, value: this.selectedItem });
         this.showSuccess = true;
      }
      // If anything other than 'all' value, remove 'all' from selected list
      if (this.selectedItem != this.allValue && this.allSelected) {
         this.handleRemoveSelection({ currentTarget: { dataset: { selectedname: this.allValue } } });
         this.allSelected = false;
      }
      // If 'All' value is selected, remove all other selected items
      if (this.selectedItem == this.allValue && this.allSelected == false) {
         let removeArr = [...this.selectedItemArr];
         this.selectedItemArr = [];
         removeArr.forEach((item) => {
            this.template.querySelector(`[data-id="${item.key}"]`).classList.remove("list-item-checked");
            this.template.querySelector(`[data-id="${item.key}"]`).classList.remove("disabled-list-item");
         });
         this.template.querySelector(`[data-id="${target.dataset.id}"]`).classList.add("list-item-checked");
         this.template.querySelector(`[data-id="${target.dataset.id}"]`).classList.add("disabled-list-item");
         this.selectedItemArr.push({ key: target.dataset.id, value: this.selectedItem });
         this.allSelected = true;
      }

      this.selectedItemCode = target.dataset.id;

      if (!this.isSelection) {
         this.isSelection = true;
         this.selectNum++;
      }

      this.template.querySelector(".searchvalue").value = this.selectedItemCode;
      this.overOnScrollbar = false;
      this.itemSelectEvent(this.specialtyRequest);
   }

   handleRemoveSelection(event) {
      if (this.defaultNotInOptions == false) {
         this.itemToRemove = event.currentTarget.dataset.selectedname;
         this.itemRemoved = true;
         let indToRemove = null;
         let keyToEnable = "";

         if (this.selectedItemArr.length > 1) {
            for (let i = 0; i < this.selectedItemArr.length; i++) {
               if (this.selectedItemArr[i].value == this.itemToRemove) {
                  indToRemove = i;
                  keyToEnable = this.selectedItemArr[i].key;
               }
            }
            this.selectedItemArr.splice(indToRemove, 1);
            this.template.querySelector(`[data-id="${keyToEnable}"]`).classList.remove("list-item-checked");
            this.template.querySelector(`[data-id="${keyToEnable}"]`).classList.remove("disabled-list-item");
         } else if (this.selectedItemArr.length == 1) {
            this.template.querySelector(`[data-id="${this.selectedItemArr[0].key}"]`).classList.remove("list-item-checked");
            this.template.querySelector(`[data-id="${this.selectedItemArr[0].key}"]`).classList.remove("disabled-list-item");
            this.selectedItemArr = [];
            this.template.querySelector(`[data-id="${this.allValue}"]`).classList.add("list-item-checked");
            this.template.querySelector(`[data-id="${this.allValue}"]`).classList.add("disabled-list-item");
            this.selectedItemArr.push({ key: this.allValue, value: this.allValue });
            this.allSelected = true;
         }
         this.itemSelectEvent(this.specialtyRequest);
         setTimeout(() => {
            this.template.querySelector(".searchvalue").focus();
         }, 100);
      }
   }

   handleOptionSelect(event) {
      this.selectedItem = event.currentTarget.dataset.name;
      this.selectedItemCode = event.currentTarget.dataset.id;

      if (!this.isSelection) {
         this.isSelection = true;
         this.selectNum++;
      }
      this.template.querySelector(".searchvalue").value = this.selectedItem;
      this.template.querySelector(".item_list").classList.add("nds-hide");
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

   detectClickOnScrollbar(event) {
      this.overOnScrollbar = false;
      if (event.target.clientWidth !== 0 && event.target.clientHeight !== 0) {
         if (event.offsetX > event.target.clientWidth || event.offsetY > event.target.clientHeight) {
            this.overOnScrollbar = true;
         }
      }
   }

   mousedownScrollBar(event) {
      this.detectClickOnScrollbar(event);
   }

   mouseupScrollBar() {
      this.overOnScrollbar = false;
      this.template.querySelector(".searchvalue").focus();
   }

   connectedCallback() {
      //Checking Default Value
      if (this.defaultValue) {
         this.selectedItem = this.defaultValue;
         this.isSelection = true;
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

   get isRequired(){
      if(this.required == true || this.required == 'true') {
         return true;
      }
      if(this.required == false || this.required == 'false') {
         return false;
      }
   }
}
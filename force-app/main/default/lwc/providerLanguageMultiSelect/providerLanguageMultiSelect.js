import { LightningElement, track, api } from "lwc";

export default class ProviderLanguageMultiSelect extends LightningElement {
   allValue = "All";
   @api showSuccess = false;
   @api showError = false;
   @api itemRemoved = false;
   @api itemToRemove;
   @api selectedLang;

   allKey = "All";
   @track _options = [{ description: this.allValue, code: this.allKey }];
   @track showItemListFlag = false;
   clickOnScrollbar = false;

   @api
   get options() {
      return this._options;
   }
   set options(val) {
      let tmp = this._options.concat(val);
      this._options = [...tmp];
   }

   @api
   get setValue() {
      return this._setValue;
   }
   set setValue(val) {
      this.setItemValue(val);
   }

   @api
   setDisplayValue(val) {
      this.setItemValue(val);
   }

   @api
   resetToAll() {
      let removeArr = [...this.selectedItemArr];
      this.selectedItemArr = [];
      removeArr.forEach((item) => {
         if (this.template.querySelector(`[data-id="${item.key}"]`)) {
            this.template.querySelector(`[data-id="${item.key}"]`).classList.remove("disabled-list-item");
         }
         if (this.template.querySelector(`[data-id="${item.key}"]`)) {
            this.template.querySelector(`[data-id="${item.key}"]`).classList.remove("list-item-checked");
         }
      });
      if (this.template.querySelector(`[data-id="All"]`)) {
         this.template.querySelector(`[data-id="All"]`).classList.add("disabled-list-item");
      }
      this.selectedItemArr.push({ key: "All", value: "All" });
      this.allSelected = true;
   }
   @api
   closeList() {
      let isOpen = this.template.querySelector(".item_list").classList.contains("nds-hide");
      if (!isOpen) {
         this.template.querySelector(".item_list").classList.add("nds-hide");
      }
   }

   @track selectedItemArr = [];
   allSelected = true;
   placeholderText = "Select language(s)";
   hasRendered = false;

   get selectedItemsNum() {
      let num = this.selectedItemArr.length;
      if (this.allSelected) {
         num = "All";
      }
      return this.showItemListFlag ? "" : `Languages - ${num} Selected`;
   }

   get filterRequest() {
      if (this.selectedItemArr.length == 1) {
         return this.selectedItemArr[0].value;
      } else {
         let request = "";
         for (let i = 0; i < this.selectedItemArr.length; i++) {
            if (i == 0) {
               request = request + `\"${this.selectedItemArr[i].value}\"`;
            } else {
               request = request + ` OR \"${this.selectedItemArr[i].value}\"`;
            }
         }
         return request;
      }
   }

   setItemValue(val) {
      if (val != "") {
         if (val == "All") {
            this._setValue = val;
            let setSelected = { currentTarget: { dataset: { id: val, name: val } } };
            this.handleOptionSelect(setSelected);
         } else {
            let tmpArr = val.split(" OR ");
            tmpArr.forEach((item) => {
               item = item.replace(/"/g, "");
               this.handleOptionSelect({ currentTarget: { dataset: { id: item, name: item } } });
            });
            this.allSelected = false;
         }
      }
   }

   disableItems() {
      this.selectedItemArr.forEach((item) => {
         this.template.querySelector(`[data-id="${item.key}"]`).classList.add("list-item-checked");
         this.template.querySelector(`[data-id="${item.key}"]`).classList.add("disabled-list-item");
      });
   }

   renderedCallback() {
      // Should only fire once
      if (this.options.length > 0 && !this.hasRendered) {
         this.handleOptionSelect({ currentTarget: { dataset: { id: this.allKey, name: this.allValue } } });
         this.allSelected = true;
         this.hasRendered = true;
      }
   }

   handleClickArrow() {
      let isHidden = this.template.querySelector(".item_list").classList.contains("nds-hide");
      if (isHidden) {
         this.handleFocusIn();
      } else {
         this.handleFocusOut();
      }
   }

   handleFocusIn() {
      this.showItemListFlag = true;
      this.clickOnScrollbar = false;
      this.displayItemList("");
      this.template.querySelector(".item_list").classList.remove("nds-hide");
      this.template.querySelector(".nds-searchIcon").classList.add("nds-hide");
      this.template.querySelector(".nds-dropdown-trigger").classList.add("nds-is-open");
      this.template.querySelector(".searchvalue").setAttribute("aria-expanded", true);
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

      if (!this.clickOnScrollbar) {
         //Hide dropdown except clicking on the scroll bar
         window.clearTimeout(this.delayTimeout);
         this.template.querySelector(".item_list").classList.add("nds-hide");
      }
      this.showItemListFlag = false;
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
            if(firstListItem.classList.contains('item-hide')) {
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

   handleKeyUp(event) {
      // Debouncing this method: do not update the reactive property as
      // long as this function is being called within a delay of 300 ms.
      // This is to avoid filtering a very large number of list.
      window.clearTimeout(this.delayTimeout);
      this.searchValue = event.target.value;
      this.isSelection = false;
      this.delayTimeout = setTimeout(() => {
         this.filter = this.searchValue.toUpperCase().substring(0, 3);
         this.displayItemList(this.filter);
         if (this.searchValue === "") {
            this.template.querySelector(".item_list").classList.remove("nds-hide");
            this.template.querySelector(".nds-searchIcon").classList.remove("nds-hide");
         }
      }, 300);
   }

   nextSibling(currentNode) {
      var sibling = currentNode.nextElementSibling;
      while (sibling) {
         if (!sibling.classList.contains('item-hide')) return sibling;
         sibling = sibling.nextElementSibling
      }
      return;
   }

   previousSibling(currentNode) {
      var sibling = currentNode.previousElementSibling;
      while (sibling) {
         if (!sibling.classList.contains('item-hide')) return sibling;
         sibling = sibling.previousElementSibling
      }
      return;
   }

   detectClickOnScrollbar(event) {
      this.clickOnScrollbar = false;
      if (event.target.clientWidth !== 0 && event.target.clientHeight !== 0) {
         if (event.offsetX > event.target.clientWidth || event.offsetY > event.target.clientHeight) {
            // mouse down over scroll bar
            this.clickOnScrollbar = true;
         }
      }
   }

   mousedownScrollBar(event) {
      this.detectClickOnScrollbar(event);
   }

   mouseupScrollBar() {
      this.clickOnScrollbar = false;
      this.template.querySelector(".searchvalue").focus();
   }

   handleOptionSelect(event) {
      this.selectOption(event.currentTarget);
   }
   
   selectOption(target) {
      this.selectedLang = target.dataset.id;
      this.showError = false;
      this.showSuccess = false;

      let selectedCount = 0;
      this.selectedItemArr.forEach((item) => {
         if (item.value == this.selectedLang) {
            selectedCount++;
         }
      });
      if (selectedCount > 0) {
         // Prevent selection if item has already been selected
         this.showError = true;
         return;
      } else {
         if (this.template.querySelector(`[data-id="${target.dataset.id}"]`)) {
            this.template.querySelector(`[data-id="${target.dataset.id}"]`).classList.add("list-item-checked");
         }
         if (this.template.querySelector(`[data-id="${target.dataset.id}"]`)) {
            this.template.querySelector(`[data-id="${target.dataset.id}"]`).classList.add("disabled-list-item");
         }
         this.selectedItemArr.push({ key: target.dataset.id, value: this.selectedLang });
         this.showSuccess = true;
      }
      // If anything other than 'all' value, remove 'all' from selected list
      if (this.selectedLang != "All" && this.allSelected) {
         this.handleRemoveSelection({ currentTarget: { dataset: { selectedname: "All" } } });
         this.allSelected = false;
      }
      // If 'All' value is selected, remove all other selected items
      if (this.selectedLang == "All" && this.allSelected == false) {
         let removeArr = [...this.selectedItemArr];
         this.selectedItemArr = [];
         removeArr.forEach((item) => {
            if (this.template.querySelector(`[data-id="${item.key}"]`)) {
               this.template.querySelector(`[data-id="${item.key}"]`).classList.remove("list-item-checked");
            }
            if (this.template.querySelector(`[data-id="${item.key}"]`)) {
               this.template.querySelector(`[data-id="${item.key}"]`).classList.remove("disabled-list-item");
            }
         });
         if (this.template.querySelector(`[data-id="${target.dataset.id}"]`)) {
            this.template.querySelector(`[data-id="${target.dataset.id}"]`).classList.add("list-item-checked");
         }
         if (this.template.querySelector(`[data-id="${target.dataset.id}"]`)) {
            this.template.querySelector(`[data-id="${target.dataset.id}"]`).classList.add("disabled-list-item");
         }
         this.selectedItemArr.push({ key: target.dataset.id, value: this.selectedLang });
         this.allSelected = true;
      }
      if (this.template.querySelector(".item_list")) {
         this.template.querySelector(".item_list").classList.add("nds-hide");
      }
      this.clickOnScrollbar = false;
      this.sendEvent();
   }

   handleRemoveSelection(evt) {
      this.itemToRemove = evt.currentTarget.dataset.selectedname;
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
         if (this.template.querySelector(`[data-id="${keyToEnable}"]`)) {
            this.template.querySelector(`[data-id="${keyToEnable}"]`).classList.remove("list-item-checked");
            this.template.querySelector(`[data-id="${keyToEnable}"]`).classList.remove("disabled-list-item");
         }
      } else if (this.selectedItemArr.length == 1) {
         if (this.template.querySelector(`[data-id="${this.selectedItemArr[0].key}"]`)) {
            this.template.querySelector(`[data-id="${this.selectedItemArr[0].key}"]`).classList.remove("list-item-checked");
            this.template.querySelector(`[data-id="${this.selectedItemArr[0].key}"]`).classList.remove("disabled-list-item");
         }
         this.selectedItemArr = [];
         if (this.template.querySelector(`[data-id="All"]`)) {
            this.template.querySelector(`[data-id="All"]`).classList.add("list-item-checked");
            this.template.querySelector(`[data-id="All"]`).classList.add("disabled-list-item");
         }
         this.selectedItemArr.push({ key: this.allKey, value: this.allValue });
         this.allSelected = true;
      }
      this.sendEvent();
      setTimeout(() => {
         this.template.querySelector(".searchvalue").focus();
      }, 100);
   }

   displayItemList(filter) {
      if (filter === "") {
         let hidden = this.template.querySelectorAll(".item-hide");
         for (let i = 0; i < hidden.length; i++) {
            hidden[i].classList.remove("item-hide");
         }
      } else {
         const langs = this.template.querySelector(".nds-listbox_vertical").childNodes;
         for (let i = 0; i < langs.length; i++) {
            const lang = langs[i].textContent;
            if (lang.substring(0, 3).toUpperCase().indexOf(filter) > -1) {
               langs[i].classList.remove("item-hide");
            } else {
               langs[i].classList.add("item-hide");
            }
         }
      }
   }

   sendEvent() {
      this.dispatchEvent(new CustomEvent("languageselectionchange", { detail: { request: this.filterRequest } }));
   }
}
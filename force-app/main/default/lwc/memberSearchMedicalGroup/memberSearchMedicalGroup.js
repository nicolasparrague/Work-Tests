import { LightningElement, api, track } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
export default class MemberSearchMedicalGroup extends OmniscriptBaseMixin(LightningElement) {
   @track finaloptions = [];
   @api options = [];
   @api fieldToSave = "selectedComboValue";
   @api defaultValue;
   @api defaultCode;
   @api placeholderText = "";
   @api readOnly = false;
   @track searchValue = "";
   @track selectedItem = "";
   @track selectedItemCode = "";
   @track showItemListFlag = false;
   @track clickOnScrollbar = false;
   @track isSelection = false;
   @track selectNum = 0;
   filter;

   @api
   setDisplayValue(val) {
      this.selectedItem = val;
   }

   @api
   closeList() {
      let isOpen = this.template.querySelector(".item_list").classList.contains("nds-hide");
      if (!isOpen) {
         this.template.querySelector(".item_list").classList.add("nds-hide");
      }
   }
   @api
   resetToAll() {
      this.selectedItem = "";
      this.selectedItemCode = "";
   }

   handleClickArrow() {
      let isHidden = this.template.querySelector(".item_list").classList.contains("nds-hide");
      if (isHidden) {
         this.handleFocusIn();
      } else {
         this.handleFocusOut();
      }
   }

   handleFocusIn(event) {
      this.placeholderText = "Type 2 char to filter";
      if (event.target.value.length >= 2) {
         if (!this.readOnly) {
            this.showItemListFlag = true;
            this.clickOnScrollbar = false;
            this.template.querySelector(".item_list").classList.remove("nds-hide");
         }
      }
   }

   handleFocusOut(event) {
      if (event.target.value == "") {
         this.updateDataJsonNoSelection();
      }
      if (this.template.querySelector(".searchvalue").value == "") {
         this.itemSelectEvent("");
      }
      if (!this.clickOnScrollbar) {
         //Hide dropdown except clicking on the scroll bar
         this.template.querySelector(".item_list").classList.add("nds-hide");
      }
   }

   handleKeyUp(event) {
      // Debouncing this method: do not update the reactive property as
      // long as this function is being called within a delay of 300 ms.
      // This is to avoid filtering a very large number of list.
      window.clearTimeout(this.delayTimeout);
      this.searchValue = event.target.value;
      if (this.searchValue.length < 2) {
         this.template.querySelector(".item_list").classList.add("nds-hide");
      }
      this.isSelection = false;

      if (this.searchValue.length >= 2) {
         this.showItemListFlag = true;
         this.template.querySelector(".item_list").classList.remove("nds-hide");

         this.template.querySelector(".nds-dropdown-trigger").classList.add("nds-is-open");

         this.delayTimeout = setTimeout(() => {
            this.filter = this.searchValue.toUpperCase();

            let testdata = this.options.filter((option) => option.key.toUpperCase().substring(0, this.filter.length) == this.filter);

            this.finaloptions = testdata;

            if (this.searchValue === "" || this.finaloptions.length == 0) {
               this.template.querySelector(".item_list").classList.add("nds-hide");
            }
            if (this.selectedItem !== this.searchValue) {
               this.updateDataJsonNoSelection();
            }
            if (this.selectedItem == "") {
               this.updateDataJsonNoSelection();
            }
         }, 300);
      }
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

   handleOptionSelect(event) {
      this.selectedItem = event.currentTarget.dataset.name;
      this.selectedItemCode = event.currentTarget.dataset.id;

      if (!this.isSelection) {
         this.isSelection = true;
         this.selectNum++;
      }
      console.log(this.isSelection);
      this.template.querySelector(".searchvalue").value = this.selectedItem;
      this.template.querySelector(".item_list").classList.add("nds-hide");
      this.clickOnScrollbar = false;
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
      const evt = new CustomEvent("groupselected", {
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
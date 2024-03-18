import { LightningElement, api, track } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import pubsub from "omnistudio/pubsub";
export default class ClaimsByProviderSearch extends OmniscriptBaseMixin(LightningElement) {
// export default class ClaimsByProviderSearch LightningElement {
   @api options = [];
   @api fieldToSave = "selectedComboValue";
   @api comboInUse;
   @api defaultValue;
   @api defaultCode;
   @api placeholderText = "Search ....";
   @api readOnly = false;
   @track searchValue = "";
   @track selectedItem = "";
   @track selectedItemCode = "";
   @track showItemListFlag = false;
   @track isSelection = false;
   @track selectNum = 0;
   @api defValue;
   @api showCombo;
   @api
   ariaLabel;
   @api 
   ariaLabelCombobox;

   filter;

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
         this.template.querySelector(".item_list").classList.remove("nds-hide");
         this.template.querySelector(".nds-searchIcon").classList.add("nds-hide");
         this.template.querySelector(".nds-icon-utility-down").classList.remove("nds-hide");
         this.template.querySelector(".nds-dropdown-trigger").classList.add("nds-is-open");

         let expandCombo = this.template.querySelector(".expandCombo");
         expandCombo.setAttribute('aria-expanded', 'true');
         //expandCombo.setAttribute('aria-activedescendant', 'true');
      }
   }

   handleFocusOut(event) {
      console.log("in handleFocusOut");
      let expandCombo = this.template.querySelector(".expandCombo");
      expandCombo.setAttribute('aria-expanded', 'false');
      //expandCombo.focus();

      this.template.querySelector(".item_list").classList.add("nds-hide");
      // this.do_resize(event);

   }

   handleKeyUp(event) {
      // Debouncing this method: do not update the reactive property as
      // long as this function is being called within a delay of 300 ms.
      // This is to avoid filtering a very large number of list.
      window.clearTimeout(this.delayTimeout);
      this.searchValue = event.target.value;
      this.isSelection = false;

      // eslint-disable-next-line @lwc/lwc/no-async-operation
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

   handleOptionSelect(event) {
      this.selectedItem = event.currentTarget.dataset.name;
      this.selectedItemCode = event.currentTarget.dataset.id;

      if (!this.isSelection) {
         this.isSelection = true;
         this.selectNum++;
      }
      this.defValue = "No";
      this.template.querySelector(".searchvalue").value = this.selectedItem;
      this.template.querySelector(".item_list").classList.add("nds-hide");
      pubsub.fire("ProviderNameSelection", "providerNameSelectionAction", {
         //memberId: evt.target.value
         providerName: this.selectedItemCode,
         providerLabel: this.selectedItem
      });
      this.updateDataJson();
      this.itemSelectEvent(this.selectedItemCode);
   }

   displayItemList(filter) {
      const span = this.template.querySelector(".nds-listbox_vertical").childNodes;
      for (let i = 0; i < span.length; i++) {
         const option = span[i].textContent;
         if (option.toUpperCase().indexOf(filter) > -1) {
            console.log("option1: ", option);
            span[i].style.display = "";
         } else {
            console.log("option2: ", option);
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
      if (this.showCombo == null) {
         this.showCombo = true;
      }
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

      //console.log("this.ariaLabel: ",this.ariaLabel);
   }

   renderedCallback() {
      //this.template.querySelector(".searchvalue").readOnly = this.readOnly;
      this.template.querySelector(".searchvalue").disabled = this.readOnly;
      
      if(this.defValue === "Yes" || this.defValue == "Yes") {
         this.selectedItem = this.defaultValue;
      }
   }

   updateDataJson() {
      var selectedData = { [this.fieldToSave]: this.selectedItem, [this.fieldToSave + "Code"]: this.selectedItemCode, isComboSelectDone: this.isSelection, comboSelectNum: this.selectNum };
      
      pubsub.fire("combo", "comboAction", {
         obj: this.comboInUse
      });
      //this.omniApplyCallResp(selectedData);
   }

   updateDataJsonNoSelection() {
      var selectedData = { [this.fieldToSave]: "", [this.fieldToSave + "Code"]: "", isComboSelectDone: this.isSelection, comboSelectNum: this.selectNum };
      this.omniApplyCallResp(selectedData);
   }

   do_resize(event) {

      // var maxrows=5; 
      var txt=event.target.value;
      var cols=event.target.cols;
     
      // var arraytxt=txt.split('\n');
      //  var rows=txt.length; 
     
      let rw = Math.ceil(txt.length/cols);
      event.target.rows=rw;
      // if (rw>maxrows) event.target.rows=maxrows;
      //  else 
   }
}
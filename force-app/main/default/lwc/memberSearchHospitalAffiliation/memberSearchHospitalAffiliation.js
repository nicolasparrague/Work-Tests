import { LightningElement, api, track } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";

export default class MemberSearchHospitalAffiliation extends OmniscriptBaseMixin(LightningElement) {
    @track finaloptions = [];
    @track _options = [{ description: "All", code: "All" }];
    @api
    get options() {
        return this._options;
    }
    set options(val) {
        let tmp = this._options.concat(val);
        this._options = [...tmp];
    }

    @api fieldToSave = "selectedComboValue";
    @track _defaultValue = "All";
    @track _defaultCode = "All";
    @api
    get defaultValue() {
        return this._defaultValue;
    }
    set defaultValue(val) {
        if (val == "") {
            this.displayValue = "";
        } else {
            this.displayValue = val;
        }
        this._defaultValue = val;
    }
    @api
    get defaultCode() {
        return this._defaultCode;
    }
    set defaultCode(val) {
        this._defaultCode = val;
    }

    @api
    setDisplayValue(val) {
        this.displayValue = val;
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
        this.searchValue = "";
        this.displayValue = "";
    }

    @track displayValue = "All";
    @api readOnly = false;
    @track searchValue = "";
    @track selectedItem = "";
    @track selectedItemCode = "";
    @track showItemListFlag = false;
    @track isSelection = false;
    clickOnScrollbar = false;
    @track selectNum = 0;
    filter;

    get filteredOptions() {
        if (this.searchValue == "") {
            return this.options;
        } else {
            let filter = this.searchValue.toUpperCase();
            let tmpArr = [...this.options];
            let filteredArr = tmpArr.filter((option) => option.code.toUpperCase().substring(0, filter.length) == filter);
            return filteredArr;
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

    handleFocusIn(event) {
        if (!this.readOnly) {
            this.displayValue = "";
            this.selectedItem = "";
            this.searchValue = "";
            this.showItemListFlag = true;
            this.clickOnScrollbar = false;
            this.template.querySelector(".item_list").classList.remove("nds-hide");
            this.template.querySelector(".searchvalue").setAttribute("aria-expanded", true);
        }
    }

    handleFocusOut(event) {
        if (!this.clickOnScrollbar) {
            //Hide dropdown except clicking on the scroll bar
            window.clearTimeout(this.delayTimeout);
            this.template.querySelector(".item_list").classList.add("nds-hide");
            this.template.querySelector(".searchvalue").setAttribute("aria-expanded", false);
        }
    }

    handleKeyUp(event) {
        // Debouncing this method: do not update the reactive property as
        // long as this function is being called within a delay of 300 ms.
        // This is to avoid filtering a very large number of list.
        window.clearTimeout(this.delayTimeout);
        this.searchValue = event.target.value;
        this.displayValue = event.target.value;
        this.isSelection = false;
        this.showItemListFlag = true;
        this.template.querySelector(".item_list").classList.remove("nds-hide");
        this.template.querySelector(".nds-dropdown-trigger").classList.add("nds-is-open");
        this.delayTimeout = setTimeout(() => {
            this.filter = this.searchValue.substring(0, 5).toUpperCase();
            this.displayItemList(this.filter);
        }, 300);
    }

    handleKeyDown(event) {
        if (event.code == 'ArrowDown') {
            event.preventDefault();
            let selectedListItem = this.template.querySelector('.item_list li[aria-selected=true]');
            if (selectedListItem != undefined) {
                let nextListItem = selectedListItem.nextElementSibling;
                if (nextListItem != undefined) {
                    selectedListItem.setAttribute('aria-selected', false);
                    nextListItem.setAttribute('aria-selected', true);
                    nextListItem.scrollIntoView(false);
                    event.target.setAttribute('aria-activedescendant', nextListItem.getAttribute('id'));
                }
            } else {
                let firstListItem = this.template.querySelector('.item_list li:first-Child');
                if (firstListItem != undefined) {
                    firstListItem.setAttribute('aria-selected', true);
                    firstListItem.scrollIntoView(false);
                    event.target.setAttribute('aria-activedescendant', firstListItem.getAttribute('id'));
                }
            }
        } else if (event.code == 'ArrowUp') {
            event.preventDefault();
            let selectedListItem = this.template.querySelector('.item_list li[aria-selected=true]');
            if (selectedListItem != undefined) {
                let previousListItem = selectedListItem.previousElementSibling;
                if (previousListItem != undefined) {
                    selectedListItem.setAttribute('aria-selected', false);
                    previousListItem.setAttribute('aria-selected', true);
                    previousListItem.scrollIntoView(false);
                    event.target.setAttribute('aria-activedescendant', previousListItem.getAttribute('id'));
                }
            } else {
                event.target.removeAttribute('aria-activedescendant');
            }
        } else if (event.code == 'Enter' || event.code == 'Space') {
            event.preventDefault();
            let selectedListItem = this.template.querySelector('.item_list li[aria-selected=true]');
            if (selectedListItem != undefined) {
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
        this.displayValue = target.dataset.name;
        this.selectedItemCode = target.dataset.id;

        if (!this.isSelection) {
            this.isSelection = true;
            this.selectNum++;
        }
        this.template.querySelector(".searchvalue").value = this.selectedItem;
        this.template.querySelector(".item_list").classList.add("nds-hide");
        this.clickOnScrollbar = false;
        this.itemSelectEvent(this.selectedItemCode);
    }

    detectClickOnScrollbar(event) {
        this.clickOnScrollbar = false;
        if (event.target.clientWidth !== 0 && event.target.clientHeight !== 0) {
            if (event.offsetX > event.target.clientWidth || event.offsetY > event.target.clientHeight) {
                this.clickOnScrollbar = true;
            }
        }
    }

    displayItemList(filter) {
        const span = this.template.querySelector(".nds-listbox_vertical").childNodes;
        for (let i = 0; i < span.length; i++) {
            const option = span[i].textContent;
            if (option.substring(0, 5).toUpperCase().indexOf(filter) > -1) {
                span[i].style.display = "";
            } else {
                span[i].style.display = "none";
            }
        }
    }

    itemSelectEvent(code) {
        const evt = new CustomEvent("itemselected", {
            detail: { itemCode: code },
        });
        this.dispatchEvent(evt);
    }

    connectedCallback() {
        //Checking Default Value
        if (this.defaultValue && this.defaultValue != "") {
            this.selectedItem = this.defaultValue;
            this.displayValue = this.defaultValue;
            this.isSelection = true;
        }
        if (this.defaultCode && this.defaultCode != "") {
            this.selectedItemCode = this.defaultCode;
        } else {
            this.selectedItemCode = this.defaultValue;
        }
        this.itemSelectEvent(this.selectedItemCode);
    }

    renderedCallback() {
        this.template.querySelector(".searchvalue").disabled = this.readOnly;
    }

    updateDataJson() {
        var selectedData = { [this.fieldToSave]: this.selectedItem, [this.fieldToSave + "Code"]: this.selectedItemCode, isComboSelectDone: this.isSelection, comboSelectNum: this.selectNum };
        this.omniApplyCallResp(selectedData);
    }
}
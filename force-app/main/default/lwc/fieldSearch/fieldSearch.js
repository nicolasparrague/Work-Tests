import { LightningElement, api } from "lwc";

export default class FieldSearch extends LightningElement {

  selectedOption;
  _options = [];
  hasNoInput = true;

  @api
  get options() {
    return this.options;
  }
  set options(options) {
    if (options.length) {
      this.selectedOption = options[0].value;
      this._options = options;
    }
  }

  get textInputType() {
    return this.currentOption.type === 'text';
  }

  get dateInputType() {
    return this.currentOption.type === 'date';
  }

  get currentOption() {
    return this._options.find(opt => opt.value === this.selectedOption);
  }

  get displayInput() {
    return this.options?.length;
  }

  handleOptionChange(event) {
    event.preventDefault();
    const newOption = this._options.find(opt => opt.value === event.target.value);
    const previousOption = this.currentOption;
    
    if (previousOption.type !== newOption.type) {
      this.hasNoInput = true;
    }

    this.selectedOption = event.target.value;
  }

  handleSearch() {
    const inputs = [];

    if (this.textInputType) {
      const value = this.template.querySelector('input[data-id="inputText"]')?.value;
      if (value) {
        inputs.push(value);
      }
    } else if (this.dateInputType) {
      const fromDate = this.template.querySelector('lightning-input[data-id="inputDateFrom"]');
      const toDate = this.template.querySelector('lightning-input[data-id="inputDateTo"]');
      fromDate.setCustomValidity('');
      fromDate.reportValidity('');

      const fromDateValue = fromDate?.value ? new Date(fromDate.value) : null;
      const toDateValue = toDate?.value ? new Date(toDate.value) : null;

      if ((fromDateValue && toDateValue) && (fromDateValue.getTime() > toDateValue.getTime())) {
        fromDate.setCustomValidity('Choose a valid range');
        fromDate.reportValidity();
        return;
      }

      if (fromDateValue || toDateValue) {
        inputs.push(fromDateValue);
        inputs.push(toDateValue);
      }
    }

    this.dispatchEvent(
      new CustomEvent("search", {
        detail: {
          selectedOption: {
            value: this.selectedOption,
            type: this.currentOption.type
          },
          inputs
        }
      })
    );
  }

  handleCancel() {

    if (this.textInputType) {
      const input = this.template.querySelector('input[data-id="inputText"]');
      input.value = '';
      this.hasNoInput = true;
    } else if (this.dateInputType) {
      const fromDateInput = this.template.querySelector('lightning-input[data-id="inputDateFrom"]');
      const toDateInput = this.template.querySelector('lightning-input[data-id="inputDateTo"]');
      fromDateInput.value = '';
      toDateInput.value = '';
      this.hasNoInput = true;
    }

    this.dispatchEvent(new CustomEvent("cancel"));
  }

  handleTextInputChange() {
    const value = this.template.querySelector('input[data-id="inputText"]')?.value;
    if (!value) {
      this.hasNoInput = true;
    } else {
      this.hasNoInput = false;
    }
  }

  handleDateChange() {
    const fromDate = this.template.querySelector('lightning-input[data-id="inputDateFrom"]');
    const toDate = this.template.querySelector('lightning-input[data-id="inputDateTo"]');
    if (!fromDate?.value || !toDate?.value) {
      this.hasNoInput = true;
    } else {
      this.hasNoInput = false;
    }
  }
}
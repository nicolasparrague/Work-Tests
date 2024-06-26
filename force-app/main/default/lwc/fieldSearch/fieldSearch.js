import { LightningElement, api } from "lwc";

export default class FieldSearch extends LightningElement {

  selectedOption;
  _options = [];

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

  handleOptionChange(event) {
    event.preventDefault();
    this.selectedOption = event.target.value;
  }

  handleApply() {
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

      if ((fromDateValue && toDateValue) && fromDateValue > toDateValue) {
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
          selectedOption: this.selectedOption,
          inputs
        }
      })
    );
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
}
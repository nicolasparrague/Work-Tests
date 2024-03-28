import { LightningElement, api } from "lwc";
export default class MemberSearchCombo extends LightningElement {
   @api options;
   @api fieldToSave;
   @api defaultValue;
   @api defaultCode;
   @api placeholderText;
   @api readOnly;
   @api required;
}
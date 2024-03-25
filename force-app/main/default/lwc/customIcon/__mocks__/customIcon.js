import { LightningElement, api } from "lwc";

export default class CustomIcon extends LightningElement {
  @api iconName;
  @api size;
  @api variant;
  @api title;
  @api alternativeText;
  @api className;
}
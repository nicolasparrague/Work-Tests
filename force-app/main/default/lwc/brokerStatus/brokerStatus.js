import { LightningElement, api } from "lwc";
import { NavigationMixin } from 'lightning/navigation';
import getMemberCount from "@salesforce/apex/BrokerStatusController.getMemberCount";

const variantStyles = {
  neutral: {
    iconName: "utility:dash",
    text: "neutralText",
    iconClass: 'neutralIcon',
    textMessage: 'new members from last month'
  },
  positive: {
    iconName: "utility:trending",
    text: "positiveText",
    iconClass: 'positiveIcon',
    textMessage: 'new members from last month'
  },
  negative: {
    iconName: "utility:trending",
    text: "negativeText",
    iconClass: 'negativeIcon',
    textMessage: 'less members from last month'
  }
};

export default class BrokerStatus extends NavigationMixin(LightningElement) {

  @api totalLastMonth = getMemberCount.totalLastMonth;
  @api total = getMemberCount.total;

  get difference() {
    return this.total - this.totalLastMonth;
  }

  get differenceAbs() {
    return Math.abs(this.difference);
  }

  get variant() {
    if (this.total > this.totalLastMonth) {
      return "positive";
    } else if (this.total < this.totalLastMonth) {
      return "negative";
    }

    return "neutral";
  }

  get iconName() {
    return variantStyles[this.variant].iconName;
  }

  get iconClass() {
    return variantStyles[this.variant].iconClass;
  }

  get textClass() {
    return variantStyles[this.variant].text;
  }

  get textMessage() {
    return variantStyles[this.variant].textMessage;
  }

  navigateToMembersTab() {
    this[NavigationMixin.Navigate]({
      type: "comm__namedPage",
      attributes: {
        name: "members__c"
      }
    });
  }
}
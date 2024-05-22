import { LightningElement, wire } from "lwc";
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

  totalUntilLastMonth = 0;
  total = 0;

  @wire(getMemberCount)
  wireGetMemberCount({error, data}) {
      if (error) {
        this.total = null;
        this.totalUntilLastMonth = null;
      } else if (data) {
        const { total, totalUntilLastMonth } = JSON.parse(data);
        this.total = total;
        this.totalUntilLastMonth = totalUntilLastMonth;
      }
  }

  get differenceAbs() {
    return Math.abs(this.total - this.totalUntilLastMonth);
  }

  get variant() {
    if (this.total > this.totalUntilLastMonth) {
      return "positive";
    } else if (this.total < this.totalUntilLastMonth) {
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
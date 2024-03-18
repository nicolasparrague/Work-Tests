import { LightningElement, track } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";

export default class MemberFamilyConfirmation extends OmniscriptBaseMixin(LightningElement) {
   @track memberList = [];

   connectedCallback() {
      var jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      console.log("jsonData", jsonData);
      this.PCPResponse = jsonData.PCPResponseInfo;

      this.memberList = this.PCPResponse;
      this.memberList.forEach((member) => {});
   }
}
import { LightningElement, track } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";

export default class MemberFamilyPCPTable extends OmniscriptBaseMixin(LightningElement) {
   @track memberList = [];

   connectedCallback() {
      var jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      this.memberList = jsonData.PCPInfo;
   }

   selectAll(evt) {
      //Check all checkbox
      var checkboxes = this.template.querySelectorAll("lightning-input");
      var i;
      for (i = 0; i < checkboxes.length; i++) {
         checkboxes[i].checked = evt.target.checked;
      }
      //Add isChecked = true to memberList array
      this.memberList.forEach((member) => {
         member.isChecked = evt.target.checked;
      });
      this.updateDataJson();
   }

   selectFamily(evt) {
      //Checkbox for memeber need to be set
      this.memberList.forEach((member) => {
         if (member.memberName === evt.target.name) member.isChecked = evt.target.checked;
      });
      //SelectAll checkbox needs to be reset
      Array.from(this.template.querySelectorAll("lightning-input")).forEach((element) => {
         if (element.name === "Select All") {
            element.checked = false;
         }
      });
      //Update DataJson
      this.updateDataJson();
   }

   renderedCallback() {
      //Check the checkbox if it is selected.
      Array.from(this.template.querySelectorAll("lightning-input")).forEach((element) => {
         this.memberList.forEach((member) => {
            if (member.memberName === element.name && member.isChecked === true) element.checked = true;
         });
      });
   }

   updateDataJson() {
      let memberArray = {};
      memberArray.PCPInfo = this.memberList;
      this.omniApplyCallResp(JSON.parse(JSON.stringify(memberArray)));
   }
}
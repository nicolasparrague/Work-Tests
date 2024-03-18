import { LightningElement, track } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";

export default class MemberFamilyPCPReview extends OmniscriptBaseMixin(LightningElement) {
   effectiveDate;
   reasonOfChange;
   newPCPName;
   pcpTransType;
   @track memberList = [];

   connectedCallback() {
      var jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      var memberAllList = [];
      memberAllList = jsonData.PCPInfo;
      //Filtering only selcted member
      this.memberList = memberAllList.filter(function (member) {
         return member.isChecked === true;
      });

      //To display value in the UI
      this.pcpTransType = jsonData.PCPTransactionType;
      this.newPCPName = jsonData.newPCPName;

      if (this.pcpTransType === "Add") { 
         this.effectiveDate = jsonData.STEP_SelectEffectDateOnly.BLK_PCPAdd.DATE_EffectiveDate_Add;
      } else if (this.pcpTransType === "Update" && jsonData.PlanStatus =="Active") {
         this.reasonOfChange = jsonData.PCPChange.Reason;
         this.effectiveDate = jsonData.STEP_SelectEffectDateAndReason.BLK_PCPUpdate.DATE_EffectiveDate_Update;
      }
      else if (this.pcpTransType === "Update" && jsonData.PlanStatus =="Future Active") {
         this.reasonOfChange = jsonData.PCPChange.Reason;
         this.effectiveDate = jsonData.STEP_SelectEffectDateAndReason.BLK_PCPUpdate.DATE_EffectiveDate_Update2;
      }

      //Adding CommaSeperatedMemberId to dataJSON
      let memberIdArray = [];
      this.memberList.forEach((member) => {
         memberIdArray.push(member.memberId);
      });

      let commaSepMemberId = {
         CommaSeperatedMemberId: memberIdArray.join(),
      };
      this.omniApplyCallResp(commaSepMemberId);
   }

   get isUpdatePCP() {
      return this.pcpTransType === "Update";
   }
}
import { LightningElement, track } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";

export default class MemberPCPModal extends OmniscriptBaseMixin(LightningElement) {
   //Boolean tracked variable to indicate if modal is open or not default value is false as modal is closed when page is loaded
   isModalOpen = false;
   @track memberList = [];
   numOfMember = 0;
   loginMemberType;
   memberInfo;

   connectedCallback() {
      let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));

      this.numOfMember = 0;
      this.memberInfo = jsonData.MemberInfo;
      this.loginMemberType = jsonData.LoginMemberType;
      let loginSubscriberInd = jsonData.MemberInfo.subscriberInd;
      let loginMemberId = jsonData.MemberInfo.memberId;
      let memberAllList = [];

      if (loginSubscriberInd.toUpperCase() === "Y") {
         /******** When login user is Subscriber *********/
         let eligibleMembers = [];
         jsonData.MembersInPlan.forEach((mem) => {
            if ((mem["18+"] !== "Y" && mem.subscriberInd === "N") || mem.disabilityStatus === "Yes" || mem.subscriberInd === "Y") {
               eligibleMembers.push(mem);
            }
         });
         jsonData.PCPInfo.forEach((famMem) => {
            for (let i in eligibleMembers) {
               if (eligibleMembers[i].memberId === famMem.memberId) {
                  memberAllList.push(famMem);
               }
            }
         });
      } else {
         jsonData.PCPInfo.forEach((famMem) => {
            if (loginMemberId === famMem.memberId) {
               memberAllList.push(famMem);
            }
         });
      }


      // Sort by memberId
      memberAllList.sort(function (a, b) {
         var idA = a.memberId.toUpperCase();
         var idB = b.memberId.toUpperCase();
         if (idA < idB) {
            return -1;
         }
         if (idA > idB) {
            return 1;
         }
         // memberId must be equal
         return 0;
      });

      // Setting Member Type
      memberAllList.forEach((member) => {
         let personNum;
         if (member.relationship !== "" && member.relationship !== null) {
            //When there is relationship
            if (member.relationship === "Self" || member.relationship === "Subscriber") {
               member.memberType = "Subscriber";
               member.isChecked = true;
            } else if (member.relationship === "Spouse") {
               member.memberType = "Spouse";
            } else {
               member.memberType = "Dependent";
            }
         } else {
            //When there is no relationship
            if (member.memberId.length > 0) personNum = member.memberId.substring(9);
            if (personNum === "00" || personNum === "01") {
               member.memberType = "Subscriber";
               member.isChecked = true;
            } else if (personNum === "02") {
               member.memberType = "Spouse";
            } else {
               member.memberType = "Dependent";
            }
         }
         member.pcpName = member.pcpName !== "" && member.pcpName === "NA" ? "" : member.pcpName;
      });

      // Filtering member whose status = Active and planType = Medical
      if (this.loginMemberType === "Subscriber") {
         this.memberList = memberAllList.filter(function (member) {
            return member.memberType !== "Spouse";
         });
      } else {
         this.memberList = memberAllList;
      }

      this.numOfMember = this.memberList.length;
      this.updateDataJson();
   }

   openModal() {
      // To open modal set isModalOpen tarck value as true
      var jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      var pcpTransType = jsonData.PCPTransactionType;
      var reasonForChange = "";
      if (pcpTransType === "Add") {
         reasonForChange = "1025";
      } else if (pcpTransType === "Update") {
         reasonForChange = jsonData.STEP_SelectEffectDateAndReason.BLK_PCPUpdate.SEL_ReasonCodeForChange;
      }
      if (pcpTransType === "Add" || (pcpTransType === "Update" && reasonForChange != null)) {
         if (this.loginMemberType !== "Subscriber" || (this.loginMemberType === "Subscriber" && this.numOfMember < 2)) {
            //Make sure all get selected for one person (subscriber or dependent)
            this.memberList.forEach((member) => {
               member.isChecked = true;
            });
            //Update JsonData
            this.updateDataJson();
            //Move to the review page
            this.navigateToFamily("No");
         } else {
            // Open Modal Window
            this.isModalOpen = true;
         }
      }
      // It will validate if you chose the reason for change.
      let btnClicked = { IsPCPButtonClicked: true };
      this.omniApplyCallResp(btnClicked);
   }

   closeModal() {
      // to close modal set isModalOpen tarck value as false
      this.isModalOpen = false;
   }

   nextButton(evt) {
      if (evt) {
         this.omniNextStep();
      }
   }

   prevButton(evt) {
      if (evt) {
         this.omniPrevStep();
      }
   }

   goToPCPConfirm(evt) {
      if (evt) {
         let loginMemberId = this.memberInfo.memberId;
         this.memberList.forEach((member) => {
            if (member.memberId === loginMemberId) {
               member.isChecked = true;
            } else {
               member.isChecked = false;
            }
         });
         //Update JsonData
         this.updateDataJson();
         this.navigateToFamily("No");
      }
   }

   goToPCPFamily(evt) {
      if (evt) {
         this.navigateToFamily("Yes");
      }
   }

   navigateToFamily(ynflag) {
      let pcpFamily = { viewPCPFamily: ynflag };
      this.omniApplyCallResp(pcpFamily);
      this.omniNextStep();
   }

   updateDataJson() {
      let memberArray = {};
      memberArray.PCPInfo = this.memberList;
      this.omniApplyCallResp(JSON.parse(JSON.stringify(memberArray)));
   }
}
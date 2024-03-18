import { LightningElement, api, track } from "lwc";
import template from "./memberClaimsMemberSelect.html";
import { getDataHandler } from "omnistudio/utility";
import pubsub from "omnistudio/pubsub";

export default class MemberClaimsMemberSelect extends LightningElement {
   memberSessionObjStr;
   activePlan;

   @track permGranted = [];
   @track memberIdSignedin;
   @track memberNameAccessibility;

   @track hasRendered = true;
   @track hasRenderedForAll = true;
   @track _userId;
   @track members;
   @track dependents;
   @track signedInMemberName;
   @track signedInMemberId;
   @track memberIsSignedIn;
   @track signedIn;
   @track showPrivacyTooltip = false;
   readonly = false;
   disabled = false;
   loading;
   defaultUId;
   @track _allowAll;
   hideAll;
   @track _selectedmember;

   @track searchmember = "";

   @api
   get allowAll() {
      return this._allowAll;
   }
   set allowAll(val) {
      this._allowAll = val;
   }
   @api
   get userid() {
      return this._userId;
   }
   set userid(val) {
      this._userId = val;
   }

   @api
   get selectedmember() {
      return this._selectedmember;
   }
   set selectedmember(val) {
      this._selectedmember = val;
   }

   connectedCallback() {
      this.loading = true;
      if (this.getQueryParameters().param1 == "1" || this._selectedmember) {
         this.loadConfigurationFromSession();
      }
   }

   renderedCallback() {
      if (this.hasRendered && this._userId) {
         this.loading = true;
         let input = {
            userId: this._userId,
         };

         this.getMembers("Member_ActivePlan", input).then((data) => {
            this.memberIdSignedin = data.IPResult.MemberInfo.memberId;
            let sessionMemberId = this.memberSessionObjStr ? JSON.parse(this.memberSessionObjStr).value : "";
            let sessionMemberName = this.memberSessionObjStr ? JSON.parse(this.memberSessionObjStr).label : "";
            let sessionMemberIsSignedIn = this.memberSessionObjStr ? JSON.parse(this.memberSessionObjStr).selectedMemberIsSignedInUser : "";

            if (sessionMemberId && this.checkIfMemberIdExistOnMembersInPlanList(data.IPResult.MembersInPlan, sessionMemberId)) {
               this.signedInMemberId = sessionMemberId;
               this.signedInMemberName = sessionMemberName;
               this.memberIsSignedIn = sessionMemberIsSignedIn;

            } else {
               this.signedInMemberId = data.IPResult.MemberInfo.memberId;
               this.signedInMemberName = data.IPResult.MemberInfo.memberName;
               this.memberIsSignedIn = "Yes";
               let member = {
                  label: this.signedInMemberName,
                  value: this.signedInMemberId,
                  selectedMemberIsSignedInUser: this.memberIdSignedin
               };
               sessionStorage.setItem("member", JSON.stringify(member));
            }

            let today = new Date()
            let months18ago = new Date(today.setMonth(today.getMonth() - 18));
            let memApprovedTermDates = [];
            data.IPResult.MembersInPlan.forEach((mem) => {
               var memTermDate = new Date(mem['terminationDate']);
               if (months18ago < memTermDate) {
                  memApprovedTermDates.push(mem);

               };
            });

            this.activePlan = this.getMemberActivePlan(data.IPResult.ServiceTypeInfo);
            let input1 = {
               memberId: this.memberIdSignedin,
               mode: "get"
            };

            this.getMembers("Member_ManagePermissions", input1).then((data1) => {
               data1.IPResult.accessGrantedFrom.forEach((memGranted) => {
                  this.permGranted.push(memGranted)
               })
      
               if (data.IPResult.MemberInfo.subscriberInd == "Y" && memApprovedTermDates.length > 0) {
                  this.membersFiltered = memApprovedTermDates.filter(
                     (member) => member["18+"] == "N" || member.memberId == this.memberIdSignedin || member.memberId.substring(9) == "01" || member.relationship == "Self" || this.permGranted.includes(member.memberId)
                  );

                  // Allow All option on Select Member dropdown
                  if (this._allowAll == "true") {
                     let subId;
                     subId = this.membersFiltered[0].memberId;
                     subId = subId.substring(0, subId.length - 2);
                     this.members = this.membersFiltered.unshift({ memberName: "All", memberId: subId });
                     // Remove All option if there is only the Subscriber
                     if (this.membersFiltered.length === 2) {
                        this.membersFiltered.shift();
                     }
                  }
                  this.members = this.membersFiltered.map((item) => {
                     return { key: item.memberId, value: item.memberId, label: item.memberName };
                  });
               }

               else if (data.IPResult.MemberInfo.subscriberInd == "N" && memApprovedTermDates.length > 0) {
                  this.membersFiltered = memApprovedTermDates.filter((member) =>
                     this.permGranted.includes(member.memberId) || member.memberId == this.memberIdSignedin

                  );

                  // Allow All option on Select Member dropdown
                  if (this._allowAll == "true") {
                     let subId;
                     subId = this.membersFiltered[0].memberId;
                     subId = subId.substring(0, subId.length - 2);
                     this.members = this.membersFiltered.unshift({ memberName: "All", memberId: subId });
                     // Remove All option if there is only the Subscriber
                     if (this.membersFiltered.length === 2) {
                        this.membersFiltered.shift();
                     }
                  }
                  this.members = this.membersFiltered.map((item) => {
                     return { key: item.memberId, value: item.memberId, label: item.memberName };
                  });
               }

               else {
                  this.members = [{ key: this.memberIdSignedin, value: this.memberIdSignedin, label: this.signedInMemberName }];
               }
               this.sortMembersById();

               if (this.members && this.members.length === 1) {
                  this.showPrivacyTooltip = false;
                  this.readonly = 'true';
                  this.disabled = 'true';
               } else {
                  this.disabled = false;
                  this.showPrivacyTooltip = true;
               }

               pubsub.fire("ShowPrivacyTooltip", "showPrivacyTooltipAction", {
                  showTooltip: this.showPrivacyTooltip,
               });

               pubsub.fire("MemberSelection", "memberSelectionAction", {
                  memberId: this.signedInMemberId,
                  selectedMemberIsSignedInUser: this.memberIsSignedIn,
                  activePlanNetworkCode: this.activePlan.networkCode,
                  LOBD_MCTR: this.activePlan.LOBD_MCTR,
                  defaultPlan: this.defPlan,
                  productBranding: this.productBranding,
                  lobId: this.lobId
               });
               // }
            });
         });

         this.hasRendered = false;
      }      

      // All option by default
      if (this.hasRenderedForAll && this._allowAll == "true") {
         if (this.members != null && this.members != undefined) {
            if (this.members.length > 0) {
               for (var m = 0; m < this.members.length; m++) {
                  if (this.members[m].label == "All") {
                     this.signedInMemberId = this.members[m].value;
                     this.hasRenderedForAll = false;
                  }
               }
            }
            pubsub.fire("MemberSelection", "memberListAction", {
               memberId: this.signedInMemberId,
               listOfMember: this.members,
            });
         }
      }
   }

   getQueryParameters() {
      var params = {};
      var search = location.search.substring(1);

      if (search) {
         params = JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}', (key, value) => {
            return key === "" ? value : decodeURIComponent(value)
         });
      }
      return params;
   }

   loadConfigurationFromSession() {
      if (sessionStorage.getItem("member")) {
         this.memberSessionObjStr = sessionStorage.getItem("member");
      }
   }

   sortMembersById() {
      // Sort by memberId
      this.members.sort(function (a, b) {
         var memberA = a.key.toUpperCase();
         var memberB = b.key.toUpperCase();
         if (memberA < memberB) {
            return -1;
         }
         if (memberA > memberB) {
            return 1;
         }
         // code must be equal
         return 0;
      });
   }

   getMembers(ipMethod, inputMap) {
      this.loading = true;
      let datasourcedef = JSON.stringify({
         type: "integrationprocedure",
         value: {
            ipMethod: ipMethod,
            inputMap: inputMap,
            optionsMap: "",
         },
      });

      return getDataHandler(datasourcedef)
         .then((data) => {
            this.loading = false;
            return JSON.parse(data);
         })
         .catch((error) => {
            console.error(`failed at getting IP data => ${JSON.stringify(error)}`);
            this.loading = false;
         });
   }

   handleMemberSelect(evt) {
      let member = {
         label: evt.target.label,
         value: evt.target.value,
      };
     
      
      let loggedInUser;
      if (evt.target.value != this.memberIdSignedin) {
         loggedInUser = "No";
      } else {
         loggedInUser = "Yes";
      }
      if (this.allowAll == "true") {
         pubsub.fire("MemberSelection", "memberListAction", {
            memberId: evt.target.value,
         });
      } else {
         pubsub.fire("MemberSelection", "memberSelectionAction", {
            memberId: evt.target.value,
            selectedMemberIsSignedInUser: loggedInUser,
            LOBD_MCTR: this.activePlan.LOBD_MCTR
         });
      }
      member.selectedMemberIsSignedInUser = loggedInUser;
      sessionStorage.setItem("member", JSON.stringify(member));
   }

   handleDefaultMember() {
      pubsub.fire("MemberSelection", "memberSelectionAction", {
         memberId: this.defaultUId,
         
      });
   }

   checkIfMemberIdExistOnMembersInPlanList(membersInPlan, memberId) {
      for (let i = 0; i < membersInPlan.length; i++) {
         if (Object.values(membersInPlan[i]).indexOf(memberId) >= 0) {
            return true;
         }
      }
      return false;
   }

   getMemberActivePlan(serviceTypeInfo) {
      let activePlan;
      for (let i = 0; i < serviceTypeInfo.length; i++) { 
         if (serviceTypeInfo[i].defaultPlan == 'Y') {
            activePlan = serviceTypeInfo[i];
            this.defPlan = serviceTypeInfo[i].defaultPlan;
            this.productBranding = serviceTypeInfo[i].productBrandGrouping;
            this.lobId = serviceTypeInfo[i].lobId;
            break;
         }
      }


      return activePlan;
   }
}
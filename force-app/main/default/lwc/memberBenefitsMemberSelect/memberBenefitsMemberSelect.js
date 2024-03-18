import { LightningElement, api, track } from "lwc";
import template from "./memberBenefitsMemberSelect.html";
import { getDataHandler } from "omnistudio/utility";
import pubsub from "omnistudio/pubsub";

export default class memberBenefitsMemberSelect extends LightningElement {
   memberSessionObjStr;

   @track
   hasRendered = true;
   @track membersArr = [];
   @track
   _userId;
   @track
   _planId;
   @track
   _effectiveDate;
   @track
   _subscriberId;
   @track
   _selectedMemberId;
   @track
   permGranted = [];
   @track
   MemberInfo = [];
   @track
   MembersInPlan = [];

   @track
   members;
   @track
   dependents;
   @track
   signedInMemberName;
   @track
   signedInMemberId;
   @track
   loginMemberId;
   @track
   loginMemberName;
   @track
   subscriberInd;
   @track
   showDependentsTooltip = false;
   @track
   showMemberDiffMsg = false;

   sessionItemName = "benefitmember";
   errorMessage = "Error --> No data returned from IP";
   readonly = false;
   disabled = false;
   loading;
   defaultUId;

   @api
   get userid() {
      return this._userId;
   }
   set userid(val) {
      this._userId = val;
   }

   @api
   get planId() {
      return this._planId;
   }
   set planId(val) {
      this._planId = val;
   }

   @api
   get effectiveDate() {
      return this._effectiveDate;
   }
   set effectiveDate(val) {
      this._effectiveDate = val;
   }

   @api
   get subscriberId() {
      return this._subscriberId;
   }
   set subscriberId(val) {
      this._subscriberId = val;
   }

   @api
   get selectedMemberId() {
      return this._selectedMemberId;
   }
   set selectedMemberId(val) {
      this._selectedMemberId = val;
   }

   get showList() {
      return this._userId || this._planId ? true : false;
   }

   connectedCallback() {
      this.loading = true;

      if (this.getQueryParameters().param1 == "1") {
         this.loadConfigurationFromSession();
      }
      console.log('showList', this.showList);
      console.log("subscriberId", this.subscriberId);
      console.log("selkectedMemberId", this.selectedMemberId);
      console.log("planId", this.planId);
   }

   grantAccess(memberId) {
      let input = {
         memberId: memberId,
         mode: "get",
      };

      this.callAPI("Member_ManagePermissions", input).then((data) => {
         if (data.IPResult?.accessGrantedFrom) {
            data.IPResult.accessGrantedFrom.forEach((memGranted) => {
               this.permGranted.push(memGranted);
            });
         } else {
            console.error(`${this.errorMessage} Member_ManagePermissions`);
         }
      });

      // this.getMembers();
   }

   loadDataFromSession(ipMsgKey) {
      var ipRespMsg;
      if (sessionStorage.getItem(ipMsgKey)) {
         ipRespMsg = JSON.parse(sessionStorage.getItem(ipMsgKey));
      }
      return ipRespMsg;
   }

   setDataToSession(ipMsgKey, ipRespMsg) {
      //USE Key with IP Name
      sessionStorage.setItem(ipMsgKey, JSON.stringify(ipRespMsg));
   }

   setManagePermissions(msg, membersArray) {
      if (msg?.accessGrantedFrom) {
         msg.accessGrantedFrom.forEach((memGranted) => {
            this.permGranted.push(memGranted);
         });

         if (this.subscriberInd == "Y" && membersArray.length > 0) {
            //When user is subscriber and currently it is within 18 month (termination date)
            this.membersFiltered = membersArray.filter(
               (member) => member["18+"] == "N" || member["18+"] == "Y" || member.memberId == this.signedInMemberId || member.memberId.substring(9) == "01" || member.relationship == "Self"
            );

            this.members = this.membersFiltered.map((item) => {
               console.log('item.firstName0: ', item);
               let memberName = item.firstName + " " + item.lastName;
               return { key: item.memberId, value: item.memberId, label: memberName };
            });
            this.showDependentsTooltip = true;
         } else if (this.subscriberInd == "N" && membersArray.length > 0) {
            //When user is dependent and currently it is within 18 month (termination date)
            this.membersFiltered = membersArray.filter((member) => this.permGranted.includes(member.memberId) || member.memberId == this.signedInMemberId);
            this.members = this.membersFiltered.map((item) => {
               console.log('item.firstName1: ', item);
               let memberName = item.firstName + " " + item.lastName;
               return { key: item.memberId, value: item.memberId, label: memberName };
            });
            this.showDependentsTooltip = true;
         } else {
            this.members = [{ key: this.signedInMemberId, value: this.signedInMemberId, label: this.signedInMemberName }];
         }

         console.log('sortMembersId');
         this.sortMembersById();

         //Check length and make readonly
         if (this.members && this.members.length === 1) {
            this.disabled = true;
         }

         //Fire MemberSelection event
         pubsub.fire("MemberSelection", "showtooltipaction", {
            showTooltip: this.showDependentsTooltip,
         });
         console.log('FINISH METHOD');

         this.loading = false;
      }
   }

   processInBenefitDetail(msg, membersArray) {
      if (msg?.accessGrantedFrom) {
         this.setManagePermissions(msg, membersArray);

         //Get numOfFamily from Session
         let familyNumObj = this.loadDataFromSession("numOfFamily");
         let numOfFamily = familyNumObj ? Number(familyNumObj.value) : 0;

         if (numOfFamily !== this.members.length) {
            this.showMemberDiffMsg = true;
         }
         pubsub.fire("MemberSelection", "showMemberInfo", {
            showMemberDiffMsg: this.showMemberDiffMsg,
            numOfMember: this.members.length,
            numOfDependants: membersArray.length,
         });
      }
   }

   processInBenefitMain(msg, membersArray, ipMethod) {
      if (msg?.accessGrantedFrom) {
         this.setManagePermissions(msg, membersArray);

         //Store Number of Family to Session
         let numOfFamily = {
            label: "primary",
            value: this.members.length,
         };
         this.setDataToSession("numOfFamily", numOfFamily);
      } else {
         console.error(`${this.errorMessage} ${ipMethod}`);
      }
   }

   renderedCallback() {
      /************************************************************/
      /****** LWC is getting called from Benefit Landing Page ******/
      /************************************************************/
      // console.log('---this._userId', this._userId);
      if (this.hasRendered && this._userId) {
         console.log('LANDING PAGE');
         this.loading = true;

         //Loading from Session
         let ipMethod = "Member_ActivePlan";
         let ipMsgKey = `${ipMethod}_LoginUser`;
         let activePlanMsg = this.loadDataFromSession(ipMsgKey);

         //Store Login User
         if (activePlanMsg.MemberInfo) {
            this.MemberInfo = activePlanMsg.MemberInfo;
            this.subscriberInd = activePlanMsg.MemberInfo.subscriberInd;
            this.MembersInPlan = activePlanMsg.MembersInPlan;

            let loginMember = this.loadDataFromSession("loginmember");
            this.loginMemberId = loginMember ? loginMember.value : "";
            this.loginMemberName = loginMember ? loginMember.label : "";
            if (!this.loginMemberId) {
               let member = {
                  label: this.MemberInfo.memberName,
                  value: this.MemberInfo.memberId,
               };
               this.setDataToSession("loginmember", member);
            }

            //Check if selected member is stored from Session
            let sessionMember = this.loadDataFromSession("benefitmember");
            let sessionMemberId = sessionMember ? sessionMember.value : "";
            let sessionMemberName = sessionMember ? sessionMember.label : "";

            if (sessionMemberId && this.checkIfMemberIdExistOnMembersInPlanList(this.MembersInPlan, sessionMemberId)) {
               this.signedInMemberId = sessionMemberId;
               this.signedInMemberName = sessionMemberName;
            } else {
               this.signedInMemberId = this.MemberInfo.memberId;
               this.signedInMemberName = this.MemberInfo.memberName;
               let memberMsg = {
                  label: this.signedInMemberName,
                  value: this.signedInMemberId,
               };
               this.setDataToSession("benefitmember", memberMsg);
            }

            pubsub.fire("MemberSelection", "memberSelectionAction", {
               // loggedInId
               memberId: this.signedInMemberId,
               selectedMemberIsSignedInUser: "Yes",
            });

            // MPV-858: checking termination date of members - cannot be more than 18 months terminated
            let today = new Date();
            let months18ago = new Date(today.setMonth(today.getMonth() - 18));

            // checking termination date of members in MemberInPlan - cannot be more than 18 months terminated
            let memApprovedTermDates = [];
            this.MembersInPlan.forEach((mem) => {
               var memTermDate = new Date(mem["terminationDate"]);
               if (memTermDate > months18ago) {
                  memApprovedTermDates.push(mem);
               }
            });

            // MPV-1151
            ipMethod = "Member_ManagePermissions";
            ipMsgKey = `${ipMethod}_LoginUser`;
            let permMsg = this.loadDataFromSession(ipMsgKey);

            if (permMsg && this.loginMemberId == this.signedInMemberId) {
               //Load if Data is in Session with key (Member_ManagePermissions_LoginUser)
               this.processInBenefitMain(permMsg, memApprovedTermDates, ipMethod);
            } else {
               //Call Member_ManagePermissions IP
               let inputParam = {
                  memberId: this.signedInMemberId,
                  mode: "get",
               };

               this.callAPI(ipMethod, inputParam).then((data) => {
                  this.processInBenefitMain(data.IPResult, memApprovedTermDates, ipMethod);
                  //Storing response to Session
                  if (this.loginMemberId == this.signedInMemberId) {
                     this.setDataToSession(ipMsgKey, data.IPResult);
                  }
               });
            }
         }
         this.hasRendered = false;
      }

      /************************************************************/
      /****** LWC is getting called from Benefit Detail Page ******/
      /************************************************************/
      if (this.hasRendered && this._planId) {
         console.log('DETAIL PAGE');
         this.loading = true;
         //Get selected member from Session
         let sessionMember = this.loadDataFromSession("benefitmember");
         let sessionMemberId = sessionMember ? sessionMember.value : "";

         //Publish Selected MemberId from Benefit Summary page
         if (sessionMemberId) {
            this.signedInMemberId = sessionMemberId;
         } else {
            this.signedInMemberId = this._selectedMemberId;
         }

         pubsub.fire("MemberSelection", "memberSelectionAction", {
            memberId: this.signedInMemberId,
            selectedMemberIsSignedInUser: "Yes",
         });

         let loginMember = this.loadDataFromSession("loginmember");
         this.loginMemberId = loginMember ? loginMember.value : "";
         this.loginMemberName = loginMember ? loginMember.label : "";
         this.subscriberInd = this.loginMemberId.substring(9) === "01" ? "Y" : "N";

         let input = {
            planId: this._planId,
            subscriberId: this._subscriberId,
            effectiveDate: this._effectiveDate,
         };
         console.log('The input: ', JSON.stringify(input));

         this.callAPI("Member_MembersByPlan", input).then((data) => {
            if (data.IPResult) {
               if (data.IPResult.length === 0) {
                  console.error(`${this.errorMessage} Member_MembersByPlan`);
               }
               let membersArray = [];
               if (!Array.isArray(data.IPResult)) {
                  membersArray = [data.IPResult];
               } else {
                  membersArray = data.IPResult;
               }
               this.membersArr = membersArray;
               console.log('thismemberarr', this.membersArr);
               // MPV - 853 Set Session Storage is null when you are not comming from Benefit & Spending - Home
               if (!this.loginMemberId) {
                  // Build member node
                  let memberNode = membersArray.filter((member) => member.memberId == this.signedInMemberId);
                  console.log('item.firstName2: ', memberNode);
                  let memberMsg = {
                     label: memberNode[0].firstName + " " + memberNode[0].lastName,
                     value: memberNode[0].memberId,
                  };
                  this.setDataToSession("loginmember", memberMsg);

                  let validateSub = this.signedInMemberId.slice(-2);
                  if (validateSub == "01") {
                     this.subscriberInd = "Y";
                  } else {
                     this.subscriberInd = "N";
                  }

                  let numOfFamily = {
                     label: "primary",
                     value: membersArray.length,
                  };

                  this.setDataToSession("numOfFamily", numOfFamily);
               }

               // MPV-1151
               let ipMethod = "Member_ManagePermissions";
               let ipMsgKey = `${ipMethod}_LoginUser`;
               let permMsg = this.loadDataFromSession(ipMsgKey);

               if (permMsg && this.loginMemberId == this.signedInMemberId) {
                  //Load if Data is in Session with key (Member_ManagePermissions_LoginUser)
                  this.processInBenefitDetail(permMsg, membersArray, ipMethod);
               } else {
                  //Call Member_ManagePermissions IP
                  let inputParam = {
                     memberId: this.signedInMemberId,
                     mode: "get",
                  };
                  this.callAPI(ipMethod, inputParam).then((response) => {
                     this.processInBenefitDetail(response.IPResult, membersArray, ipMethod);
                     //Storing response to Session
                     if (this.loginMemberId == this.signedInMemberId) {
                        this.setDataToSession(ipMsgKey, response.IPResult);
                     }
                  });
               }
            } else {
               console.error(`${this.errorMessage} Member_MembersByPlan`);
            }
         });
         this.hasRendered = false;
         console.log('hasrendered', this.hasRendered);
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

   callAPI(ipMethod, inputMap) {
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

   updateParentFlexcard(mId) {
      let selectedMem = this.membersArr.find((m) => m.memberId === mId);
      pubsub.fire("MemberChange", "memberchangeaction", {
         effectiveDate: selectedMem.eligibilityEffectiveDate,
         terminationDate: selectedMem.eligibilityTerminationDate,
         status: selectedMem.status,
      });
   }

   handleMemberSelect(evt) {
      //---added 11/19
      let mId = evt.target.value;
      if (window.location.href.includes("benefit-details")) {
         this.updateParentFlexcard(mId);
      }

      let selectedMember = this.members.find((m) => m.key === mId);
      let member = {
         label: selectedMember.label,
         value: evt.target.value,
      };

      this.setDataToSession("benefitmember", member);
      pubsub.fire("MemberSelection", "memberSelectionAction", {
         memberId: evt.target.value,
         memberName: selectedMember.label,
      });
   }

   loadConfigurationFromSession() {
      if (sessionStorage.getItem(this.sessionItemName)) {
         this.memberSessionObjStr = sessionStorage.getItem(this.sessionItemName);
      }
   }

   getQueryParameters() {
      var params = {};
      var search = location.search.substring(1);
      if (search) {
         params = JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}', (key, value) => {
            return key === "" ? value : decodeURIComponent(value);
         });
      }
      return params;
   }

   handleDefaultMember() {
      console.info("Member Select Default: ", this.defaultUId);
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
}
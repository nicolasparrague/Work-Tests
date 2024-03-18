import { getDataHandler } from "omnistudio/utility";
import { LightningElement, track, api } from "lwc";
import { isMobile } from "omnistudio/utility";
import { loadCssFromStaticResource } from 'omnistudio/utility';

export default class MemberMdmContent extends LightningElement {
   isPublisherApp = this.checkPublisherApp();
   calledMultiAccountIP = false;
   loading = false;
   @track hasRendered = false;
   @track _userid = "";
   @track multipleIdExist = false;
   @track pageIsFindCare = false;
   @track showDental = false;
   @track hasDentalInOther = false;
   @track hasDentalInCurrent = false;

   @api
   get userid() {
      return this._userid;
   }
   set userid(val) {
      this._userid = val;
      this.userSetCallback();
   }

   connectedCallback() {
      let completeURL = '/assets/styles/vlocity-newport-design-system-scoped.min.css';
      loadCssFromStaticResource(this, 'newportAttentisAlt', completeURL).then(resource => {
         console.log(`Theme loaded successfully`);
      }).catch(error => {
         console.log(`Theme failed to load => ${error}`);
      });
   }

   userSetCallback() {
      let pathName = window.location.pathname;
      if (pathName.includes("/find-care")) {
         this.pageIsFindCare = true;
      }
      if (this._userid && !this.hasRendered && !this.calledMultiAccountIP) {
         this.calledMultiAccountIP = true;
         this.getMdmNotifications();
         this.hasRendered = true;
      }
   }

   callIP(ipMethod, inputMap) {
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

   checkPublisherApp() {
      if (this.isMobile || (window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes("CommunityHybridContainer"))) {
         return true;
      } else {
         return false;
      }
   }

   setUIData(msg) {
      if (msg.memberPlans != undefined) {
         // Parse list of memberPlans
         let accountArray = [];
         if (!Array.isArray(msg.memberPlans)) {
            accountArray = [msg.memberPlans];
         } else {
            accountArray = msg.memberPlans;
         }
         let firstId = "";
         for (let i = 0; i < accountArray.length; i++) {
            let thisLoopItem = accountArray[i];
            if (i === 0) {
               firstId = thisLoopItem.memberId;
            }
            // A new ID is found, user has multiple accounts
            if (thisLoopItem.memberId != firstId) {
               this.multipleIdExist = true;
            }
            
            if (this.pageIsFindCare) {
               if ((thisLoopItem.planType == "M" && thisLoopItem.dentalEmbededInd == "Y") || thisLoopItem.planType == "D") {
                  this.hasDentalInOther = true;
               }
            }
         }
         accountArray = msg.currentActiveMember;
         if (this.pageIsFindCare) {
            if (accountArray?.planType == "M" && accountArray.dentalEmbededInd == "Y") {
               this.hasDentalInCurrent = true;
               this.hasDentalInOther = false;
            } else if (accountArray?.planType == "D") {
               this.hasDentalInCurrent = false;
               this.hasDentalInOther = false;
            }
         }
      }
   }

   getMdmNotifications() {
      let ipMethod = "Member_MultipleAccount";
      let input = {
         userId: this._userid,
      };
      let ipRespMsg = this.loadDataFromSession(ipMethod);
      if (ipRespMsg) {
         //Check if Data is in Session
         this.setUIData(ipRespMsg);
      } else {
         this.callIP(ipMethod, input).then((data) => {
            if (data?.IPResult) {
               this.setUIData(data.IPResult);
               //Storing response to Session
               this.setDataToSession(ipMethod, data.IPResult);
            }
            if (this.hasDentalInCurrent || this.hasDentalInOther) {
               this.showDental = true;
            }
         });
      }
      this.loading = false;
   }

   loadDataFromSession(ipMethod) {
      var ipRespMsg;
      if (sessionStorage.getItem(ipMethod)) {
         ipRespMsg = JSON.parse(sessionStorage.getItem(ipMethod));
      }
      return ipRespMsg;
   }

   setDataToSession(ipMethod, ipRespMsg) {
      sessionStorage.setItem(ipMethod, JSON.stringify(ipRespMsg));
   }
}
import { LightningElement, track, api } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import { NavigationMixin } from "lightning/navigation";
import { getDataHandler } from "omnistudio/utility";
import { isMobile } from "omnistudio/utility";

export default class FindCareQuickAction extends OmniscriptBaseMixin(NavigationMixin(LightningElement)) {
   _isMobile = isMobile();
   _selectedMemberId;
   _brand;
   _productGroup;
   _openurl;
   portalType;
   _normalUser = true;
   _dentalUser = false;
   _pharmacyUser = false;

   isMedicare = false;
   isCommercial = false;
   mentalHealthLink;
   isModalMentalHealthComm = false;
   isModalMentalHealthMed = false;
   isModalMentalHealthOther = false;
   provider = "";
   terminatedMember = false;
   terminatedModal = false;

   @api
   get selectedMemberId() {
      return this._selectedMemberId;
   }
   set selectedMemberId(val) {
      if (val) {
         this._selectedMemberId = val;
         this.callActiveIP();
      }
   }

   @api
   get productGroup() {
      return this._productGroup;
   }
   set productGroup(val) {
      this._productGroup = val;
   }

   @api
   get brand() {
      return this._brand;
   }
   set brand(val) {
      this._brand = val;
   }

   @api
   get pharmacyUser() {
      return this._pharmacyUser ? true : false;
   }
   set pharmacyUser(val) {
      this._pharmacyUser = JSON.parse(val);
   }

   @api
   get dentalUser() {
      return this._dentalUser ? true : false;
   }
   set dentalUser(val) {
      this._dentalUser = JSON.parse(val);
   }

   get normalUser() {
      this._normalUser = this._dentalUser || this._pharmacyUser ? false : true;
      return this._normalUser;
   }

   get pharamClass() {
      let styleClass = "nds-grid nds-gutters card";
      if (this._isMobile) {
         styleClass = styleClass + " nds-p-around_medium";
      } else {
         styleClass = styleClass + " nds-p-vertical_medium nds-p-horizontal_large pull-padding_pharmacy";
      }
      return styleClass;
   }

   get pharamPosClass() {
      let styleClass = "nds-col nds-size_1-of-3";
      if (this._isMobile) {
         styleClass = styleClass + "";
      } else {
         styleClass = styleClass + " nds-p-top_small";
      }
      return styleClass;
   }

   get dentalClass() {
      let styleClass = "nds-grid nds-gutters card";
      if (this._isMobile) {
         styleClass = styleClass + " nds-p-around_medium";
      } else {
         styleClass = styleClass + " nds-p-vertical_medium nds-p-horizontal_large pull-padding_pharmacy";
      }
      return styleClass;
   }

   isModalGlobal = false;
   isModalPharmacy = false;
   expressScriptsMembersLink = "https://www.express-scripts.com/";

   connectedCallback() {
      this._openurl = this._isMobile ? "Y" : "N";
      this.callApexMethod();
   }

   renderedCallback() {
      this._normalUser = this._dentalUser || this._pharmacyUser ? false : true;
      if (this._productGroup == "Medicare") {
         this.isMedicare = true;
      } else if (this._productGroup == "Commercial") {
         this.isCommercial = true;
      }

      //start modal focus
      const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const modal = this.template.querySelector(".modalAccessibility");

      if (modal != undefined) {
         const firstFocusableElement = modal.querySelectorAll(focusableElements)[0]; // get first element to be focused inside modal
         const focusableContent = modal.querySelectorAll(focusableElements);
         const lastFocusableElement = focusableContent[focusableContent.length - 1]; // get last element to be focused inside modal

         var me = this;
         window.addEventListener("keydown", function (event) {
            let isTabPressed = event.key === "Tab" || event.keyCode === 9;

            if (!isTabPressed) {
               return;
            }

            if (event.shiftKey) {
               // if shift key pressed for shift + tab combination
               if (me.template.activeElement === firstFocusableElement) {
                  lastFocusableElement.focus(); // add focus for the last focusable element
                  event.preventDefault();
               }
            } else {
               // if tab key is pressed
               if (me.template.activeElement === lastFocusableElement) {
                  // if focused has reached to last focusable element then focus first focusable element after pressing tab
                  firstFocusableElement.focus(); // add focus for the first focusable element
                  event.preventDefault();
               }
            }
         });

         firstFocusableElement.focus();

         window.addEventListener("keyup", function (event) {
            if (event.keyCode === 27 || event.key === "Escape") {
               me.closeModal();
            }
         });
      }
   }

   goToDentalCare(evt) {
      let serviceType = "Dental";
      if(this.terminatedMember == true){
         this.terminatedModal = true;
      }else{
         this.navigateToFindCare(serviceType);
      }
   }

   goToFindCare(evt) {
      if (this.terminatedMember == true) {
         this.terminatedModal = true;
      } else {
         let serviceType = "PCP";
         this.navigateToFindCare(serviceType);
      }
   }

   goToPharmacyCare(evt) {
      let serviceType = "Pharmacy";
      this.navigateToFindCare(serviceType);
   }

   navigateToFindCare(serviceType) {
      if (this._openurl === "Y") {
         this[NavigationMixin.GenerateUrl]({
            type: "standard__namedPage",
            attributes: {
               pageName: "find-care",
            },
            state: {
               action: "findcarequickaction",
               goToFindCare: true,
               serviceType: serviceType,
            },
         }).then((url) => {
            let completeURL = window.location.origin + url;

            window.open(completeURL);
         });
      } else {
         this[NavigationMixin.Navigate](
            {
               type: "standard__namedPage",
               attributes: {
                  pageName: "find-care",
               },
               state: {
                  action: "findcarequickaction",
                  goToFindCare: true,
                  serviceType: serviceType,
               },
            },
            true // Replaces the current page in your browser history with the URL
         );
      }
   }

   goToFindCareFacility(evt) {
      console.log("Urgent Care");
      if (this.terminatedMember == true) {
         this.terminatedModal = true;
      } else {
         if (this._openurl === "Y") {
            this[NavigationMixin.GenerateUrl]({
               type: "standard__namedPage",
               attributes: {
                  pageName: "find-care",
               },
               state: {
                  action: "facilityquickaction",
                  goToFacility: "Yes",
                  facilityExecution: "Yes",
               },
            }).then((url) => {
               let completeURL = window.location.origin + url;
               window.open(completeURL);
            });
         } else {
            // Navigate to a URL
            this[NavigationMixin.Navigate](
               {
                  type: "standard__namedPage",
                  attributes: {
                     pageName: "find-care",
                  },
                  state: {
                     action: "facilityquickaction",
                     goToFacility: "Yes",
                     facilityExecution: "Yes",
                  },
               },
               true // Replaces the current page in your browser history with the URL
            );
         }
      }
   }

   goToViewOtherServices(evt) {
      if (this._openurl === "Y") {
         this[NavigationMixin.GenerateUrl]({
            type: "standard__namedPage",
            attributes: {
               pageName: "find-care",
            },
         }).then((url) => {
            let completeURL = window.location.origin + url;
            window.open(completeURL);
         });
      } else {
         // Navigate to a URL
         this[NavigationMixin.Navigate](
            {
               type: "standard__namedPage",
               attributes: {
                  pageName: "find-care",
               },
            },
            true // Replaces the current page in your browser history with the URL
         );
      }
   }

   closeModal() {
      this.isModalGlobal = false;
      this.isModalPharmacy = false;
   }

   openModal() {
      if (this.terminatedMember == true) {
         this.terminatedModal = true;
      } else {
         this.isModalGlobal = true;
         this.provider = "Attentis Health";
         this.isModalMentalHealthComm = true;
         if (this._productGroup == "Commercial") {
            this.isModalMentalHealthComm = true;
         } else if (this._productGroup == "Medicare") {
            this.isModalMentalHealthMed = true;
         } else {
            this.isModalMentalHealthOther = true;
         }
      }
   }

   openPharmacyModal() {
      if(this.terminatedMember == true){
         this.terminatedModal = true;
      }else{
         this.isModalPharmacy = true;
      }
   }

   callActiveIP() {
      let input = {
         memberId: this._selectedMemberId,
         "24MonthsTermDate": "Yes",
      };

      // Call Member_ActivePlan IP
      this.callIP("Member_ActivePlan", input)
         .then((data) => {
            if (data.IPResult) {
               let dataIP = data.IPResult;

               if (dataIP.ServiceTypeInfo == undefined || dataIP.ServiceTypeInfo == null || dataIP.ServiceTypeInfo == "") {
               } else {
                  this.mentalHealthLink = dataIP.ServiceTypeInfo[0].MentalHealthSubstanceAbuse;
               }
            } else {
               console.error(`${this.errorMessage} Member_ActivePlan`);
            }
         })
         .catch((error) => {
            console.error("Failed in function that calles Active Plan IP", error);
         });
   }

   callApexMethod() {
      this.terminatedMember = true;
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

   navigateToMentalHealthWebPage() {
      var mentalHealthWebPage = this.mentalHealthLink;
      if (mentalHealthWebPage) {
         window.open(mentalHealthWebPage, "_blank");
         this.closeModal();
      }
   }
   navigateToexpressScriptsWebPage() {
      var expressScriptsWebPage = this.expressScriptsMembersLink;
      if (expressScriptsWebPage) {
         window.open(expressScriptsWebPage, "_blank");
         this.closeModal();
      }
   }

   identifyPortal() {
      var pathName = window.location.pathname;
      if (pathName.includes("memberportal")) {
         this.portalType = "Attentis";
      }
   }

   ssoLink() {
      let inputParam;
      this.identifyPortal();
      if (this.portalType == "Attentis") {
         inputParam = {
            ssoName: "ExpressScripts Attentis",
         };
      }

      this.callIP("Member_SSOURL", inputParam).then((data) => {
         if (data) {
            let url = data.IPResult.ssoURL;
            window.open(url, "_blank");
         }
      });
      this.closeModal();
   }

   closeTerminatedModal() {
      this.terminatedModal = false;
   }
}
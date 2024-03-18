import { LightningElement, track, api } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import { NavigationMixin } from "lightning/navigation";
import { getDataHandler } from "omnistudio/utility";
import { isMobile } from "omnistudio/utility";

export default class FeatureImagewithWelcomenote extends OmniscriptBaseMixin(NavigationMixin(LightningElement)) {
   @track _userId;
   @track memberinfo;
   @track defaultServiceType;
   welcomeNote;
   videoLink = false;
   isdocumentPageButton = false;
   _isMobile = isMobile();
   errorMessage = "Error --> No data returned from IP";
   @track bgclass = "slds-card slds-grid slds-grid_vertical-align-center";
   @track multipleplans;
   //Benefit Video Code - 1
   @track tenantId;
   @track loading = true;
   @track iframeSrc = "";
   iframeW = "100%";
   sessionItemName = "benefitmember";
   isMobilePublisher = false;
   @track memberId;
   @track memberName;
   @track videoLinkHomePage;
   @track benefitMemberVideo = true;
   @track showButton = false;
   @track showModal = false;
   @track showRetry = false;
   @track gridClass = "nds-p-vertical_large nds-p-horizontal_x-large nds-col nds-size_1-of-2 nds-large-size_1-of-3 white-background";
   @track videoClass = "";
   @track FontWt = "";
   @track planId;
   @track status;
   @track startDate;
   @track subscriberId;
   @track planName;
   @track endDate;
   @track brand;
   @track networkCode;
   @track eligibilityEffectiveDate;
   @track eligibilityTerminationDate;
   @track targetparams;
   @track targettype;
   @track targetname;
   @track label;
   @track variant;
   @track extraclass;
   _servicetypeinfo;

   @api
   get userId() {
      return this._userId;
   }

   set userId(val) {
      this._userId = val;
      this.getMemberInfo(this._userId);
   }

   get heading() {
      return this.memberinfo.memberFirstName;
   }

   get memberFirstName() {
      return this.memberinfo.memberFirstName;
   }
   //Benefit Video Code - 2
   get srcLoaded() {
      return this.iframeSrc && this.iframeSrc != "" ? true : false;
   }

   get isDesktop() {
      return this.memberinfo && !this._isMobile ? true : false;
   }

   get isMobile() {
      return this.memberinfo && this._isMobile ? true : false;
   }

   //Benefit Video Code - 3
   renderedCallback() {
      let mainContent = this.template.querySelector(".mainContent");
      if (mainContent != null) mainContent.setAttribute("id", "maincontent");

      if (window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes("CommunityHybridContainer")) {
         // User is in the publisher playground app
         this.isMobilePublisher = true;
      } else {
         this.isMobilePublisher = false;

         //Modal Focus Accessibility
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
               if (event.key === "Escape") {
                  me.closeModal();
               }
            });
         }
      }
   }

   connectedCallback() {
      //Benefit Video Code - 4
      this.loading = false;
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

   async callAsyncIP(ipMethod, inputParam) {
      let response;
      try {
         response = await this.omniRemoteCall(inputParam, true);
         if (!response.result.IPResult) {
            console.error(`${this.errorMessage} ${ipMethod}`);
         }
      } catch (error) {
         console.error(`Error coming from ${ipMethod} IP`, error);
      }
      return response;
   }

   async getMemberInfo(userId) {
      let ipMethod = "Member_ActivePlan";
      let ipMsgKey = `${ipMethod}_LoginUser`;

      let inParams = {
         input: { userId: userId },
         sClassName: "omnistudio.IntegrationProcedureService",
         sMethodName: "Member_ActivePlan",
         options: "{}",
      };
      //Get Data from Session for Member_ActivePlan
      let ipRespMsg = this.loadDataFromSession(ipMsgKey);
      if (!ipRespMsg) {
         //Call Member_ActivePlan IP
         let response = await this.callAsyncIP(ipMethod, inParams);
         console.log("Welcome Note - Member_ActivePlan IP", response);
         if (Object.prototype.hasOwnProperty.call(response.result.IPResult, "MemberInfo")) {
            ipRespMsg = response.result.IPResult;
            this.setDataToSession(ipMsgKey, ipRespMsg);
         }
      } else {
         console.log("Welcome Note - Member_ActivePlan Session", ipRespMsg);
      }

      if (ipRespMsg && ipRespMsg.MemberInfo) {
         let data = ipRespMsg;
         //Ger Member Information
         this.memberinfo = data.MemberInfo;
         this.memberId = data.MemberInfo.memberId;
         this.memberName = data.MemberInfo.memberName;
         this.subscriberId = data.MemberInfo.subscriberId;
         this.brand = data.MemberInfo.brand;
         this._servicetypeinfo = data.ServiceTypeInfo;

         data.ServiceTypeInfo.forEach((sertviceTypeInfo) => {
            if (sertviceTypeInfo.defaultPlan === "Y") {
               this.defaultServiceType = sertviceTypeInfo;

            if (this.defaultServiceType.brand === "Attentis") {
                  this.welcomeNote = "Welcome to Attentis Health. Have questions about your plan, what it covers, or how it works? Review your Plan Documents to learn more.";
                  this.isdocumentPageButton = true;
                  this.FontWt = "font-weight:400";
                  this.bgclass = "slds-card slds-grid slds-grid_vertical-align-center welcome-note-bg";
               }
            }
         });
         const _urlString = window.location.href;
         if (_urlString.includes("/memberportal/")) {
            this.tenantId = "Attentis";
            this.bgclass = "slds-card slds-grid slds-grid_vertical-align-center welcome-note-bg";
         }
         //   console.log("serivetypeingo" + this._servicetypeinfo);
         if (data.ServiceTypeInfo.length == 1) {
            this.multipleplans = false;
            this._servicetypeinfo.forEach((plan) => {
               //    console.log("plan" + plan);
               this.planId = plan.planId;
               this.status = plan.status;
               this.planName = plan.planName;
               this.startDate = plan.eligibilityEffectiveDate;
               this.endDate = plan.eligibilityTerminationDate;
               this.networkCode = plan.networkCode;
            });
            let params = {
               planId: this.planId,
               status: this.status,
               effectiveDate: this.startDate,
               dateText: this.startDate,
               subscriberId: this.subscriberId,
               selectedMemberId: this.memberId,
               planName: this.planName,
               terminationDate: this.endDate,
               portalType: this.brand,
               statusText: this.status,
               networkCode: this.networkCode,
               userid: userId,
            };

            this.targetparams = JSON.stringify(params);
            //   console.log("targetparams" + this.targetparams);
            this.targettype = "standard__namedPage";
            this.targetname = "plan-documents";
            this.label = "My Documents";
            this.variant = "brand";
            this.extraclass = "slds-m-left_x-small nds-button nds-button_neutral nds-m-top_large";
            console.log('TESTING');
         } else if (data.ServiceTypeInfo.length > 1) {
            this.multipleplans = true;
         }

        
      } else {
         console.error(`${this.errorMessage} Member_ActivePlan`);
         this.loading = false;
      }
   }

   handleClick() {
      if (this.isVideoLink) {
         this.navigateToPage("Billing & Payment");
      } else if (this.isdocumentPageButton) {
         this.navigateToPage("Benefits");
      }
   }

   navigateToPage(page) {
      if (page == "Benefits") {
         this[NavigationMixin.Navigate]({
            type: "standard__namedPage",
            attributes: {
               pageName: "benefits",
            },
         });
      } else {
         this[NavigationMixin.Navigate]({
            type: "comm__namedPage",
            attributes: {
               pageName: page,
            },
         });
      }
   }

   //Benefit Video Code - 6
   getVideoLink() {
      let input = {
         memberId: this.memberId,
      };

      // Call Member_BenefitsVideo IP
      this.callIP("Member_BenefitsVideo", input).then((data) => {
         console.info("##################--- 2");
         if (data.IPResult.success == false) {
            this.showRetry = true;
         } else {
            if (data.IPResult.videoLink) {
               this.videoLinkHomePage = data.IPResult.videoLink;
               this.buidURL();
               this.showRetry = false;
            } else if (data.IPResult.success === false) {
               //User has video but there is Access Error
               this.showRetry = true;
            } else {
               //User doesn’t have Video
               this.showRetry = true;
            }
         }
      });
   }

   //Benefit Video Code - 7
   buidURL() {
      let type = "";
      let protocol = "";
      const urlString = window.location.href;
      const hostUrl = window.location.host;

      let urlArray = urlString.split("/");

      for (let index = 0; index < urlArray.length; index++) {
         let element = urlArray[index];
         if (element == "memberportal") {
            type = element;
         }
         if (element == "member") {
            type = element;
         }
         if (element == "https:") {
            protocol = element;
         }
         if (element == "http:") {
            protocol = element;
         }
      }

      //Build URL for SundaySkyResponse
      if (this.isMobilePublisher) {
         this.iframeSrc = `${protocol}//${hostUrl}/${type}/apex/BenefitVideoSundaySky?SundaySkyResponse=${this.videoLinkHomePage}&mobileapp=true&MemberID=${this.memberId}&MemberName=${this.memberName}`;
      } else {
         this.iframeSrc = `${protocol}//${hostUrl}/${type}/apex/BenefitVideoSundaySky?SundaySkyResponse=${this.videoLinkHomePage}&MemberID=${this.memberId}&MemberName=${this.memberName}`;
      }
      // BenefitVideoSundaySkyHomePage

      this.loading = false;
   }

   //Benefit Video Code - 8
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
            console.error(`failed at getting IP data => ${error}`);
            this.loading = false;
         });
   }

   //Benefit Video Code - 9
   retryVideo() {
      this.showModal = false;
      this.getVideoLink();

      setTimeout(() => {
         this.showModal = true;
      });
   }

   openModal() {
      this.showModal = true;
      this.showButton = false;
      this.getVideoLink();
   }

   closeModal() {
      this.showModal = false;
      this.showButton = true;
   }
}
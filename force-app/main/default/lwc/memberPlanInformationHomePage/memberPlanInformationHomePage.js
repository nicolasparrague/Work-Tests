import { LightningElement, api, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { OmniscriptActionCommonUtil } from "omnistudio/omniscriptActionUtils";
import { isMobile } from "omnistudio/utility";
import { getDataHandler } from "omnistudio/utility";

export default class MemberPlanInformationHomePage extends NavigationMixin(LightningElement) {
   enableIPLog = false;
   _subscriberInd;
   _isMobile = isMobile();
   _servicetypeinfo = [];
   _membersinplan = [];
   _pcpinfo = [];
   memberInfo;
   memberId;
   medicalshowPagination = true;
   dentalshowPagination = true;
   visionshowPagination = true;
   pharmacyshowPagination = true;
   medicalpages = [];
   dentalpages = [];
   visionpages = [];
   pharmacypages = [];
   currentPage = 0;
   isLightning = false;
   portal = "member";
   errorMessage = "Error --> No data returned from IP";

   @track PreeffectuatedStatus = false;
   @track MemberActiveStatus = false;
   @track provider;
   @track providerparams;

   @track showBenefitstab = true;
   @track showPCPLink = true;
   @track leavingnetwork;
   @track ispcpvalue;

   @track medicalnumofpages;
   @track medicalarrowvalue = 1;
   @track medicalshowleftarrow = true;
   @track medicalshowrightarrow = true;

   @track disablemedicalshowleftarrow = false;
   @track disablemedicalshowrightarrow = false;
   @track dentalnumofpages;
   @track dentalarrowvalue = 1;
   @track dentalshowleftarrow = true;
   @track dentalshowrightarrow = true;
   @track disabledentalshowleftarrow = false;
   @track disabledentalshowrightarrow = false;

   @track visionnumofpages;
   @track visionarrowvalue = 1;
   @track disablevisionshowleftarrow = false;
   @track disablevisionshowrightarrow = false;

   @track pharmacynumofpages;
   @track pharmacyarrowvalue = 1;
   @track pharmacyshowleftarrow = true;
   @track pharmacyshowrightarrow = true;
   @track disablepharmacyshowleftarrow = false;
   @track disablepharmacyshowrightarrow = false;

   @track recordPerPage;
   @track showVisionOnly = false;
   @track showVisionOnlyAttentis = false;
   @track currentallmembers = [];
   @track hasMedical = false;
   @track hasDental = false;
   @track hasVision = false;
   @track hasPharmacy = false;
   @track isSubscriber = false;
   @track pcpnotEmpty = true;
   @track pcpName;
   @track pcpId;
   @track pcpFiltered;
   @track preferredstatus;
   @track pcpSpecialty;

   @track medicalpcpMessage;
   @track medicalshowPCPMessage = false;
   @track medicalPlanName;
   @track medicalactiveStatus;
   @track medicalPlanId;
   @track medicalEffectiveDate;
   @track dependentMedicalStatus = false;
   @track dependentMedicalEligibilityEffectiveDate;
   @track dependentMedicalEligibilityTerminationDate;

   // members by plan for mobile
   @track medicalMembersMobile;
   @track pharmacyMembersMobile;
   @track visionMembersMobile;
   @track dentalMembersMobile;

   @track dentalpcpMessage;
   @track dentalshowPCPMessage = false;
   @track dentalPlanName;
   @track dentalactiveStatus;
   @track dentalPlanId;
   @track dentalEffectiveDate;
   @track dependentDentalStatus = false;
   @track dependentDentalEligibilityEffectiveDate;
   @track dependentDentalEligibilityTerminationDate;

   @track visionpcpMessage;
   @track visionshowPCPMessage = false;
   @track visionPlanName;
   @track visionactiveStatus;
   @track visionPlanId;
   @track visionEffectiveDate;
   @track dependentVisionStatus = false;
   @track dependentVisionEligibilityEffectiveDate;
   @track dependentVisionEligibilityTerminationDate;

   @track pharmacypcpMessage;
   @track pharmacyshowPCPMessage = false;
   @track pharmacyPlanName;
   @track pharmacyactiveStatus;
   @track pharmacyPlanId;
   @track pharmacyEffectiveDate;
   @track dependentPharmacyStatus = false;
   @track dependentPharmacyEligibilityEffectiveDate;
   @track dependentPharmacyEligibilityTerminationDate;

   @track medicalallmembers;
   @track dentalallmembers;
   @track visionallmembers;
   @track pharmacyallmembers;
   @track isModalGlobal = false;
   @track productBrand;
   @track providerparams;
   @track pharmacyonly = false;

   @api
   get subscriberind() {
      return this._subscriberInd;
   }
   set subscriberind(val) {
      this._subscriberInd = val;
   }

   @api
   get memberinfo() {
      return this.memberInfo;
   }
   set memberinfo(val) {
      this.memberInfo = JSON.parse(JSON.stringify(val));
      this.subscriberId = this.memberInfo.subscriberId;
      this.subscriberInd = this.memberInfo.subscriberInd;
      this.brand = this.memberInfo.brand;
      this.memberId = this.memberInfo.memberId;
   }

   @api
   get memberid() {
      return this.memberId;
   }
   set memberid(val) {
      this.memberId = val;
   }

   @api
   get membersinplan() {
      return this._membersinplan;
   }
   set membersinplan(val) {
      this._membersinplan = JSON.parse(JSON.stringify(val));
   }

   @api
   get pcpinfo() {
      return this._pcpinfo;
   }
   set pcpinfo(val) {
      this._pcpinfo = JSON.parse(JSON.stringify(val));
   }

   @api
   get servicetypeinfo() {
      return this._servicetypeinfo;
   }
   set servicetypeinfo(val) {
      this._servicetypeinfo = JSON.parse(JSON.stringify(val));
      this.getPlanInfo();
   }

   @api
   get openurl() {
      return this._openurl;
   }
   set openurl(value) {
      this._openurl = value;
   }

   connectedCallback() {
      this._actionUtilClass = new OmniscriptActionCommonUtil();
   }

   renderedCallback() {}

   getActiveClass = (isActive) => {
      if (this.isLightning) {
         return isActive === true ? "slds-carousel__indicator-action slds-is-active" : "slds-carousel__indicator-action";
      } else {
         return isActive === true ? "nds-carousel__indicator-action nds-is-active" : "nds-carousel__indicator-action";
      }
   };

   isActivePage = (page) => page.number === this.currentPage;
   paginate = (page_number, lstofMembers) => lstofMembers.slice((page_number - 1) * 2, page_number * 2);
   mobilepaginate = (page_number, lstofMembers) => lstofMembers.slice((page_number - 1) * 1, page_number * 1);
   randomKey = () => Math.random().toString(36).substring(7);

   getNumberPages(plantype) {
      if (plantype == "Medical") {
         const quantity = this.medicalallmembers.length;
         const number = quantity > this.recordPerPage ? Math.ceil(quantity / this.recordPerPage) : 1;
         const range = [];
         this.medicalnumofpages = number;
         for (let i = 1; i <= number; i++) {
            let medicalpage = {
               classes: this.getActiveClass(i === this.currentPage),
               number: i,
               active: i === this.currentPage,
               key: this.randomKey(),
            };
            range.push(medicalpage);
         }
         return range;
      } else if (plantype == "Dental") {
         const quantity = this.dentalallmembers.length;
         const number = quantity > this.recordPerPage ? Math.ceil(quantity / this.recordPerPage) : 1;
         const range = [];
         this.dentalnumofpages = number;
         for (let i = 1; i <= number; i++) {
            let dentalpage = {
               classes: this.getActiveClass(i === this.currentPage),
               number: i,
               active: i === this.currentPage,
               key: this.randomKey(),
            };

            range.push(dentalpage);
         }
         return range;
      } else if (plantype == "Vision") {
         const quantity = this.visionallmembers.length;
         const number = quantity > this.recordPerPage ? Math.ceil(quantity / this.recordPerPage) : 1;
         const range = [];
         this.visionnumofpages = number;
         for (let i = 1; i <= number; i++) {
            let visionpage = {
               classes: this.getActiveClass(i === this.currentPage),
               number: i,
               active: i === this.currentPage,
               key: this.randomKey(),
            };

            range.push(visionpage);
         }
         return range;
      } else if (plantype == "Pharmacy") {
         const quantity = this.pharmacyallmembers.length;
         const number = quantity > this.recordPerPage ? Math.ceil(quantity / this.recordPerPage) : 1;
         const range = [];
         this.pharmacynumofpages = number;
         for (let i = 1; i <= number; i++) {
            let pharmacypage = {
               classes: this.getActiveClass(i === this.currentPage),
               number: i,
               active: i === this.currentPage,
               key: this.randomKey(),
            };

            range.push(pharmacypage);
         }
         return range;
      }
   }

   handlePaginationClick(element) {
      const pageNumber = parseFloat(element.target.getAttribute("data-page-number"));
      const planType = element.target.getAttribute("plan-type");
      if (planType == "Medical") {
         this.medicalarrowvalue = pageNumber;
      } else if (planType == "Dental") {
         this.dentalarrowvalue = pageNumber;
      } else if (planType == "Vision") {
         this.visionarrowvalue = pageNumber;
      } else if (planType == "Pharmacy") {
         this.pharmacyarrowvalue = pageNumber;
      }
      this.navigateTo(pageNumber, planType);
   }
   rightArrowClick(element) {
      const planType = element.currentTarget.value;
      if (planType == "Medical") {
         if (this.medicalarrowvalue == this.medicalnumofpages) {
            this.medicalarrowvalue = this.medicalnumofpages;
         } else {
            ++this.medicalarrowvalue;
            this.navigateTo(this.medicalarrowvalue, planType);
         }
      } else if (planType == "Dental") {
         if (this.dentalarrowvalue == this.dentalnumofpages) {
            this.dentalarrowvalue = this.dentalnumofpages;
         } else {
            ++this.dentalarrowvalue;

            this.navigateTo(this.dentalarrowvalue, planType);
         }
      } else if (planType == "Vision") {
         if (this.visionarrowvalue == this.visionnumofpages) {
            this.visionarrowvalue = this.visionnumofpages;
         } else {
            ++this.visionarrowvalue;

            this.navigateTo(this.visionarrowvalue, planType);
         }
      } else if (planType == "Pharmacy") {
         if (this.pharmacyarrowvalue == this.pharmacynumofpages) {
            this.pharmacyarrowvalue = this.pharmacynumofpages;
         } else {
            ++this.pharmacyarrowvalue;

            this.navigateTo(this.pharmacyarrowvalue, planType);
         }
      }
   }

   leftArrowClick(element) {
      const planType = element.currentTarget.value;
      if (planType == "Medical") {
         if (this.medicalarrowvalue == 1) {
            this.medicalarrowvalue == 1;
         } else {
            --this.medicalarrowvalue;
            const planType = element.currentTarget.value;
            this.navigateTo(this.medicalarrowvalue, planType);
         }
      } else if (planType == "Dental") {
         if (this.dentalarrowvalue == 1) {
            this.dentalarrowvalue == 1;
         } else {
            --this.dentalarrowvalue;
            const planType = element.currentTarget.value;
            this.navigateTo(this.dentalarrowvalue, planType);
         }
      } else if (planType == "Vision") {
         if (this.visionarrowvalue == 1) {
            this.visionarrowvalue == 1;
         } else {
            --this.visionarrowvalue;
            const planType = element.currentTarget.value;
            this.navigateTo(this.visionarrowvalue, planType);
         }
      } else if (planType == "Pharmacy") {
         if (this.pharmacyarrowvalue == 1) {
            this.pharmacyarrowvalue == 1;
         } else {
            --this.pharmacyarrowvalue;
            const planType = element.currentTarget.value;
            this.navigateTo(this.pharmacyarrowvalue, planType);
         }
      }
   }

   navigateTo(pageNumber, plantype) {
      if (plantype == "Medical") {
         this.currentPage = pageNumber;
         this.medicalpages = this.getNumberPages(plantype);

         if (this._isMobile) {
            this.medicalcurrentallmembers = this.mobilepaginate(this.currentPage, this.medicalallmembers);
         } else {
            this.medicalcurrentallmembers = this.paginate(this.currentPage, this.medicalallmembers);
         }
         if (this.medicalcurrentallmembers.length == 1 && !this._isMobile) {
            this.medicalshowrightarrow = false;
         } else {
            this.medicalshowrightarrow = true;
         }
         this.medicalshowrightarrow = false;

         if (this.medicalpages.length === 1) {
            this.medicalshowleftarrow = false;
            this.medicalshowrightarrow = false;
            this.medicalshowPagination = false;
         }
      } else if (plantype == "Dental") {
         this.currentPage = pageNumber;
         this.dentalpages = this.getNumberPages(plantype);

         if (this._isMobile) {
            this.dentalcurrentallmembers = this.mobilepaginate(this.currentPage, this.dentalallmembers);
         } else {
            this.dentalcurrentallmembers = this.paginate(this.currentPage, this.dentalallmembers);
         }
         if (this.dentalcurrentallmembers.length == 1 && !this._isMobile) {
            this.dentalshowrightarrow = false;
         } else {
            this.dentalshowrightarrow = true;
         }
         if (this.dentalpages.length === 1) {
            this.dentalshowleftarrow = false;
            this.dentalshowrightarrow = false;
            this.dentalshowPagination = false;
         }
      }
      if (plantype == "Vision") {
         this.currentPage = pageNumber;
         this.visionpages = this.getNumberPages(plantype);

         if (this._isMobile) {
            this.visioncurrentallmembers = this.mobilepaginate(this.currentPage, this.visionallmembers);
         } else {
            this.visioncurrentallmembers = this.paginate(this.currentPage, this.visionallmembers);
         }
         if (this.visioncurrentallmembers.length == 1 && !this._isMobile) {
            this.visionshowrightarrow = false;
         } else {
            this.visionshowrightarrow = true;
         }
         if (this.visionpages.length === 1) {
            this.visionshowleftarrow = false;
            this.visionshowrightarrow = false;
            this.visionshowPagination = false;
         }
      }
      if (plantype == "Pharmacy") {
         this.currentPage = pageNumber;
         this.pharmacypages = this.getNumberPages(plantype);

         if (this._isMobile) {
            this.pharmacycurrentallmembers = this.mobilepaginate(this.currentPage, this.pharmacyallmembers);
         } else {
            this.pharmacycurrentallmembers = this.paginate(this.currentPage, this.pharmacyallmembers);
         }

         if (this.pharmacycurrentallmembers.length == 1 && !this._isMobile) {
            this.pharmacyshowrightarrow = false;
         } else {
            this.pharmacyshowrightarrow = true;
         }

         if (this.pharmacypages.length === 1) {
            this.pharmacyshowleftarrow = false;
            this.pharmacyshowrightarrow = false;
            this.pharmacyshowPagination = false;
         }
      }
   }

   navigateToBenefits(event) {
      this[NavigationMixin.Navigate]({
         type: "standard__namedPage",
         attributes: {
            pageName: "benefits",
         },
      });
   }

   navigateToFindCare(event) {
      // Navigate to a URL
      if (this._openurl === "Y") {
         /*** OpenURL in New Window ***/
         this[NavigationMixin.GenerateUrl]({
            type: "standard__namedPage",
            attributes: {
               pageName: "find-care",
            },
            state: {
               action: "findcarequickaction",
               goToFindCare: true,
               serviceType: "PCP",
            },
         }).then((url) => {
            let completeURL = window.location.origin + url;

            window.open(completeURL);
         });
      } else {
         /*** Open in Current Window ***/
         this[NavigationMixin.Navigate](
            {
               type: "standard__namedPage",
               attributes: {
                  pageName: "find-care",
               },
               state: {
                  action: "findcarequickaction",
                  goToFindCare: true,
                  serviceType: "PCP",
               },
            },
            true // Replaces the current page in your browser history with the URL
         );
      }
   }

   getPlanInfo() {
      if (this._isMobile) {
         this.recordPerPage = 1;
      } else {
         this.recordPerPage = 2;
      }

      if (this.memberInfo) {
         this.subscriberInd = this.memberInfo.subscriberInd;
      }

      if (this.subscriberInd === "Yes" || this.subscriberInd === "Y") {
         this.isSubscriber = true;
      } else if (this.subscriberInd === "N0" || this.subscriberInd === "N") {
         this.isSubscriber = false;
      }
      this.portal = "memberportal";
      const _urlString = window.location.href;

      let provider = "Attentis";
      this.provider = "Attentis";
      this.productBrand = this._servicetypeinfo[0].productBrandGrouping;

      if (this._pcpinfo && this._pcpinfo.length > 0 && this.memberId) {
         this.pcpFiltered = this._pcpinfo.filter((member) => member.memberId == this.memberid);
         this.pcpId = this.pcpFiltered[0].pcpId;
         let pcpIdAux = this.pcpId.charAt(0);
         if (this.pcpFiltered[0].pcpName == "NA" || pcpIdAux == 2 || pcpIdAux == "2") {
            this.pcpnotEmpty = false;
            this.getMemberInfo();
         } else {
            let servicetypemedical = [];
            servicetypemedical = this._servicetypeinfo.filter((plan) => plan.productCategory == "Medical" && plan.defaultPlan == "Y");

            if (servicetypemedical.length == 1 && servicetypemedical[0].productCategory == "Medical") {
               this.providerparams = {
                  sClassName: "omnistudio.IntegrationProcedureService",
                  sMethodName: "Member_providerDetails",
                  options: "{}",
                  input: {
                     providerId: this.pcpId,
                     tenantId: servicetypemedical[0].brand,
                     planType: servicetypemedical[0].planType,
                     networkId: servicetypemedical[0].networkId,
                  },
               };
            } else {
               this.providerparams = {
                  sClassName: "omnistudio.IntegrationProcedureService",
                  sMethodName: "Member_providerDetails",
                  options: "{}",
                  input: {
                     providerId: this.pcpId,
                  },
               };
            }
            this._actionUtilClass
               .executeAction(this.providerparams, null, this, null, null)
               .then((response) => {
                  if (response.result.IPResult) {
                     this.leavingnetwork = response.result.IPResult.reviewProviderDetails.providerInformation.leavingNetwork;
                     this.ispcpvalue = response.result.IPResult.reviewProviderDetails.providerInformation.isPCP;
                     if (response.result.IPResult.reviewProviderDetails.providerInformation.preferred) {
                        this.preferredstatus = response.result.IPResult.reviewProviderDetails.providerInformation.preferred;
                     } else {
                        this.preferredstatus = "";
                     }

                     if (response.result.IPResult.reviewProviderDetails.providerInformation && response.result.IPResult.reviewProviderDetails.providerInformation.Speciality) {
                        this.pcpSpecialty = response.result.IPResult.reviewProviderDetails.providerInformation.Speciality[0];
                        let name = this.pcpFiltered[0].pcpName.split(",");
                        this.pcpName = name[1].trim() + " " + name[0] + ", " + this.pcpFiltered[0].title + " | " + this.pcpSpecialty;
                     } else if (response.result.IPResult.reviewProviderDetails.providerInformation.Speciality.length >= 2) {
                        this.pcpSpecialty = response.result.IPResult.reviewProviderDetails.providerInformation.Speciality[0];
                        let name = this.pcpFiltered[0].pcpName.split(",");
                        this.pcpName = name[1].trim() + " " + name[0] + ", " + this.pcpFiltered[0].title + " | " + this.pcpSpecialty;
                     } else {
                        let name = this.pcpFiltered[0].pcpName.split(",");
                        this.pcpName = name[1].trim() + " " + name[0] + ", " + this.pcpFiltered[0].title;
                     }

                     this.getMemberInfo();
                  } else {
                     console.error(`${this.errorMessage} Member_providerDetails`);
                  }
               })
               .catch((error) => {
                  console.error(`failed at getting IP data => ${error}`);
               });

               //AFIRE-35 - Call IP in LWC to get Demo Account PCP Details
               let demoAccount = {
                  sClassName: "omnistudio.IntegrationProcedureService",
                  sMethodName: "AMP_DemoPCPHomeChange",
                  options: "{}",
                  input: {
                     providerId: this.pcpId,
                  },
               };
               this._actionUtilClass
                  .executeAction(demoAccount, null, this, null, null)
                  .then((response) => {
                     let resp = response.result.IPResult;
                     this.pcpName = resp.demoAccountName+', MD | '+ resp.demoAccountSpeciality;
               });
         }
      } else {
         this.pcpnotEmpty = false;
         this.getMemberInfo();
      }

      if (this.showVisionOnly == true) {
         this.showBenefitstab = false;
      }
      if (this.pharmacyonly == true) {
         this.showBenefitstab = false;
      }
   }
   closeModal() {
      // to close modal set isModalGlobal track value as false
      this.isModalGlobal = false;
   }
   eyeMed1 = false;
   navigateToEyeMed1() {
      this.isModalGlobal = true;
      this.eyeMed1 = true;
      this.disclaimer =
         "You are leaving the Attentis Health website and going to EyeMed’s website.\n" +
         "Attentis Health does not accept responsibility for the information, accuracy, or completeness of the EyeMed website. " +
         "Please consult your doctor about any medical or treatment information you may find on the EyeMed site. " +
         "This is general information and should not be relied upon without speaking with your doctor about your individual needs." +
         " The opinions and information are not necessarily those of Attentis Health." +
         "The Privacy Statement of EyeMed may be different from ours. Review this statement when you get to their site.";
   }

   disclaimer = "";
   productBrandCommercial = false;
   productBrandMedicare = false;

   navigateToEyeMed2() {
      this.isModalGlobal = true;
      this.eyeMed1 = false;
      if (this.productBrand == "Commercial") {
         this.productBrandCommercial = true;
         this.disclaimer =
            "Commercial: You are leaving the Attentis Health website and going to EyeMed’s website.\n" +
            "Attentis Health does not accept responsibility for the information, accuracy, or completeness of the EyeMed website. " +
            "Please consult your doctor about any medical or treatment information you may find on the EyeMed site. " +
            "This is general information and should not be relied upon without speaking with your doctor about your individual needs." +
            " The opinions and information are not necessarily those of Attentis Health." +
            "The Privacy Statement of EyeMed may be different from ours. Review this statement when you get to their site.";
      }
      if (this.productBrand == "Medicare") {
         this.productBrandMedicare = true;
         this.disclaimer =
            "Medicare: You are leaving the Attentis Health website and going to EyeMed’s website.\n" +
            "We encourage you to read the privacy statement on the EyeMed website. " +
            "Please consult your doctor about any medical advice or treatment information you may find on the EyeMed site.";
      }
      if (this.showVisionOnlyAttentis == true) {
         this.disclaimer =
            "You are leaving the Attentis Health website and going to EyeMed’s website.\n" +
            "Attentis Health does not accept responsibility for the information, accuracy, or completeness of the EyeMed website. " +
            "Please consult your doctor about any medical or treatment information you may find on the EyeMed site. " +
            "This is general information and should not be relied upon without speaking with your doctor about your individual needs." +
            " The opinions and information are not necessarily those of Attentis Health." +
            "The Privacy Statement of EyeMed may be different from ours. Review this statement when you get to their site.";
      }
   }
   navigateToEyeMedURL() {
      if (this.showVisionOnly == true) {
         let input = {
            ssoName: "Eyemed Attentis",
         };
         this.callIPDataHanlder("Member_SSOURL", input).then((data) => {
            if (data) {
               let url = data.IPResult.ssoURL;
               window.open(url, "_blank");
            }
            this.closeModal();
         });
      } else if (this.showVisionOnlyAttentis == true) {
         var visionWebPage = "https://attentisconsulting.com/contact/";
         if (visionWebPage) {
            window.open(visionWebPage, "_blank");
            //this.isModalGlobal = false;//close modal window
            this.closeModal();
         }
      }
   }

   callIPDataHanlder(ipMethod, inputMap) {
      // this.loading = true;
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
            // this.loading = false;
            return JSON.parse(data);
         })
         .catch((error) => {
            console.error(`failed at getting IP data => ${error}`);
            // this.loading = false;
         });
   }

   callIP(ipMethod, inputMap) {
      const logEnabled = this.enableIPLog;
      let params = {
         sClassName: "omnistudio.IntegrationProcedureService",
         sMethodName: ipMethod,
         input: inputMap,
         options: "{}",
      };
      if (logEnabled) {
         console.log(`${ipMethod} Input`, JSON.stringify(inputMap));
      }
      return this._actionUtilClass
         .executeAction(params, null, this, null, null)
         .then((response) => {
            if (logEnabled) {
               console.log(`${ipMethod} Output for ${inputMap.planId}`, JSON.stringify(response));
            }
            return response;
         })
         .catch((error) => {
            console.error(`Failed at getting data from ${ipMethod} => ${JSON.stringify(error)}`);
         });
   }

   findDefaultPlan(planType) {
      let defaultPlan;
      let activePlan = [];
      let terminatedPlan = [];
      let futureActivePlan = [];
      let preEffectivePlan = [];

      let plans = this._servicetypeinfo.filter((plan) => plan.productCategory === planType);
      if (plans.length > 0) {
         activePlan = plans.filter((plan) => plan.status === "Active");
         if (activePlan.length > 0) {
            defaultPlan = activePlan[0];
         } else {
            let currentDate = new Date();
            let date18MonthsAgo = new Date();
            date18MonthsAgo.setMonth(date18MonthsAgo.getMonth() - 18);
            terminatedPlan = plans.filter((plan) => plan.status === "Terminated" && new Date(plan.eligibilityTerminationDate) >= date18MonthsAgo);

            if (terminatedPlan.length > 0) {
               //Terminated Found
               if (terminatedPlan.length > 1) {
                  //Sorting date (DESC)
                  terminatedPlan.sort((a, b) => {
                     let dateA = new Date(a.eligibilityTerminationDate);
                     let dateB = new Date(b.eligibilityTerminationDate);
                     return dateB - dateA;
                  });
               }
               defaultPlan = terminatedPlan[0];
            } else {
               //Look for Future Active
               futureActivePlan = plans.filter((plan) => plan.status === "Future Active");
               if (futureActivePlan.length > 0) {
                  //Future Active Found
                  defaultPlan = futureActivePlan[0];
               } else {
                  //Look for Pre Effective
                  preEffectivePlan = plans.filter((plan) => plan.status === "Pre-Effectuated");
                  if (preEffectivePlan.length > 0) {
                     //Pre Effective Found
                     defaultPlan = preEffectivePlan[0];
                  }
               }
            }
         }
      }
      return defaultPlan;
   }

   setShowPCPLink(status, plan) {
      if (status == "Active" && (plan.LOBD_MCTR == 1002 || plan.LOBD_MCTR == 1003)) {
         this.showPCPLink = false;
      } else if (status == "Future Effective" && (plan.LOBD_MCTR == 1002 || plan.LOBD_MCTR == 1003)) {
         this.showPCPLink = false;
      } else if (status == "Future Active" && (plan.LOBD_MCTR == 1002 || plan.LOBD_MCTR == 1003)) {
         this.showPCPLink = false;
      } else if (status == "Pre-Effectuated" && (plan.LOBD_MCTR == 1002 || plan.LOBD_MCTR == 1003)) {
         this.showPCPLink = false;
      } else if (status == "Terminated") {
         this.showPCPLink = false;
      } else {
         this.showPCPLink = true;
      }
   }

   setPCPVariables(planType, pcpmsg) {
      if (planType == "Medical") {
         this.medicalshowPCPMessage = true;
         this.medicalpcpMessage = pcpmsg;
      } else if (planType == "Dental") {
         this.dentalshowPCPMessage = true;
         this.dentalpcpMessage = pcpmsg;
      } else if (planType == "Vision") {
         this.visionshowPCPMessage = true;
         this.visionpcpMessage = pcpmsg;
      } else if (planType == "Pharmacy") {
         this.pharmacyshowPCPMessage = true;
         this.pharmacypcpMessage = pcpmsg;
      }
   }
   setPCPMessage(networkCode, planType) {
      let pcpmsg;
      if ((networkCode == "2T03" || networkCode == "2T02") && this.preferredstatus == "Yes" && this._pcpinfo.length > 0) {
         pcpmsg = "By selecting a Preferred Provider, you have lowered your Copay option for most professional services";
         this.setPCPVariables(planType, pcpmsg);
      } else if ((networkCode == "2T03" || networkCode == "2T02") && this.preferredstatus.toUpperCase() == "NO") {
         pcpmsg = "Take Advantage of Your Plan's Lower Copay Option. If you choose a Preferred Provider, you’ll have lower copays for most professional services.";
         this.setPCPVariables(planType, pcpmsg);
      } else if ((networkCode == "2T03" || networkCode == "2T02") && (this._pcpinfo.length == 0 || this.preferredstatus === undefined)) {
         pcpmsg = "Take Advantage of Your Plan's Lower Copay Option. If you choose a Preferred Provider, you’ll have lower copays for most professional services.";
         this.setPCPVariables(planType, pcpmsg);
      } else if (networkCode == "HT01" && this.preferredstatus.toUpperCase() == "YES") {
         pcpmsg = "By selecting a Preferred Provider you will have lower copays for most professional services.";
         this.setPCPVariables(planType, pcpmsg);
      } else if (networkCode == "HT01" && this.preferredstatus.toUpperCase() == "NO") {
         pcpmsg = "Take Advantage of your plan's lower copay option. If you choose a Preferred Provider, you will pay less for most professional services.";
         this.setPCPVariables(planType, pcpmsg);
      } else if (networkCode == "HT01" && this._pcpinfo.length == 0) {
         pcpmsg = "Take Advantage of your plan's lower copay option. If you choose a Preferred Provider, you will pay less for most professional services.";
         this.setPCPVariables(planType, pcpmsg);
      } else if (networkCode == "G005") {
         pcpmsg = "Take Advantage of Your Plan's Lower Copay Option. If you choose a Preferred Provider, you’ll have lower copays for most professional services.";
         this.setPCPVariables(planType, pcpmsg);
      }
   }

   getMemberInfo() {
      var planType;
      var ipMethod = "Member_MembersByPlan";
      if (this._servicetypeinfo && Array.isArray(this._servicetypeinfo) === true && this._servicetypeinfo.length > 0) {
         /*************** Check if there is Medical Plan **************/
         planType = "Medical";
         let medicalPlan = this.findDefaultPlan(planType);
         if (medicalPlan) {
            this.hasMedical = true;
            if (medicalPlan.status == "Active") {
               this.medicalactiveStatus = true;
            } else {
               this.medicalactiveStatus = false;
            }

            //MPV-286 Choose as PCP link Permission Check
            this.setShowPCPLink(medicalPlan.status, medicalPlan);

            //MPV-1041 Preferred PCP Message Content
            this.setPCPMessage(medicalPlan.networkCode, planType);

            this.medicalPlanId = medicalPlan.planId;
            this.medicalEffectiveDate = medicalPlan.eligibilityEffectiveDate;
            this.medicalPlanName = medicalPlan.planName;

            let inputParamMedical = { subscriberId: this.subscriberId, planId: this.medicalPlanId, effectiveDate: this.medicalEffectiveDate };
            this.callIP(ipMethod, inputParamMedical)
               .then((response) => {
                  if (response.result.IPResult) {
                     //Making sure it is Array
                     if (!Array.isArray(response.result.IPResult)) {
                        this.medicalMembersMobile = [response.result.IPResult];
                        this.medicalallmembers = [response.result.IPResult];
                     } else {
                        this.medicalMembersMobile = response.result.IPResult;
                        this.medicalallmembers = response.result.IPResult;
                     }

                     this.medicalallmembers.forEach((member) => {
                        let currentmember = [];
                        currentmember = this._membersinplan.filter((member1) => member1.memberId == member.memberId);

                        if (member.status == "Active") {
                           member = Object.assign(member, { ActiveStatus: true });
                        } else {
                           member = Object.assign(member, { ActiveStatus: false });
                        }

                        if (member.status == "Active") {
                           member = Object.assign(member, { MemberActiveStatus: true });
                        } else if (member.status != "Pre-Effectuated") {
                           member = Object.assign(member, { MemberActiveStatus: false });
                        } else if (member.status == "Pre-Effectuated") {
                           member = Object.assign(member, { PreeffectuatedStatus: true });
                        }

                        member = Object.assign(member, { Relationship: currentmember[0].relationship });
                        member = Object.assign(member, { Birthdate: currentmember[0].birthdate });
                     });
                     let loggedinmemidinfo = [];
                     loggedinmemidinfo = this.medicalallmembers.filter((member) => member.memberId == this.memberid);

                     if (loggedinmemidinfo.length) {
                        if (loggedinmemidinfo[0].status == "Active") {
                           this.dependentMedicalStatus = true;
                        } else if (loggedinmemidinfo[0].status == "Pre-Effectuated") {
                           this.PreeffectuatedStatus = true;
                        }
                        this.dependentMedicalEligibilityEffectiveDate = loggedinmemidinfo[0].eligibilityEffectiveDate;
                        this.dependentMedicalEligibilityTerminationDate = loggedinmemidinfo[0].eligibilityTerminationDate;
                     }
                     // this.membersList = this.sortAndSliceData(membersList);
                     this.membersList = this.medicalallmembers;
                     this.membersList.sort((a, b) => a.status.localeCompare(b.status) || new Date(a.Birthdate) - new Date(b.Birthdate));

                     let index = this.membersList.findIndex((i) => i.Relationship === "Subscriber");
                     this.membersList.unshift(this.membersList.splice(index, 1)[0]);

                     this.navigateTo(1, "Medical");
                  } else {
                     console.error(`${this.errorMessage} ${ipMethod} - ${planType}`);
                  }
               })
               .catch((error) => {
                  console.error(`Error in ${ipMethod} - ${planType} : `, error);
               });
         }
         /*************** Check if there is Dental Plan **************/
         planType = "Dental";
         let dentalPlan = this.findDefaultPlan(planType);
         if (dentalPlan) {
            this.hasDental = true;
            if (dentalPlan.status == "Active") {
               this.dentalactiveStatus = true;
            } else {
               this.dentalactiveStatus = false;
            }
            //MPV-1041 Preferred PCP Message Content
            this.setPCPMessage(dentalPlan.networkCode, planType);

            this.dentalPlanId = dentalPlan.planId;
            this.dentalEffectiveDate = dentalPlan.eligibilityEffectiveDate;
            this.dentalPlanName = dentalPlan.planName;

            let inputParamDental = { subscriberId: this.subscriberId, planId: this.dentalPlanId, effectiveDate: this.dentalEffectiveDate };
            this.callIP(ipMethod, inputParamDental)
               .then((response) => {
                  if (response.result.IPResult) {
                     //Making sure it is Array
                     if (!Array.isArray(response.result.IPResult)) {
                        this.dentalMembersMobile = [response.result.IPResult];
                        this.dentalallmembers = [response.result.IPResult];
                     } else {
                        this.dentalMembersMobile = response.result.IPResult;
                        this.dentalallmembers = response.result.IPResult;
                     }

                     this.dentalallmembers.forEach((member) => {
                        let currentmember = [];
                        currentmember = this._membersinplan.filter((member1) => member1.memberId == member.memberId);
                        if (member.status == "Active") {
                           member = Object.assign(member, { ActiveStatus: true });
                        } else {
                           member = Object.assign(member, { ActiveStatus: false });
                        }
                        if (member.status == "Active") {
                           member = Object.assign(member, { MemberActiveStatus: true });
                        } else if (member.status != "Pre-Effectuated") {
                           member = Object.assign(member, { MemberActiveStatus: false });
                        } else if (member.status == "Pre-Effectuated") {
                           member = Object.assign(member, { PreeffectuatedStatus: true });
                        }
                        member = Object.assign(member, { Relationship: currentmember[0].relationship });
                        member = Object.assign(member, { Birthdate: currentmember[0].birthdate });
                     });
                     let loggedinmemidinfo = [];
                     loggedinmemidinfo = this.dentalallmembers.filter((member) => member.memberId == this.memberid);

                     if (loggedinmemidinfo[0].status == "Active") {
                        this.dependentDentalStatus = true;
                     }
                     this.dependentDentalEligibilityEffectiveDate = loggedinmemidinfo[0].eligibilityEffectiveDate;
                     this.dependentDentalEligibilityTerminationDate = loggedinmemidinfo[0].eligibilityTerminationDate;

                     // this.membersList = this.sortAndSliceData(membersList);
                     this.membersList = this.dentalallmembers;

                     this.membersList.sort((a, b) => a.status.localeCompare(b.status) || new Date(a.Birthdate) - new Date(b.Birthdate));

                     let index = this.membersList.findIndex((i) => i.Relationship === "Subscriber");
                     this.membersList.unshift(this.membersList.splice(index, 1)[0]);

                     this.dentalallmembers = this.membersList;

                     this.navigateTo(1, "Dental");
                     // this.allmembers= this.allmembers.slice(0, 2);
                  } else {
                     console.error(`${this.errorMessage} ${ipMethod} - ${planType}`);
                  }
               })
               .catch((error) => {
                  console.error(`Error in ${ipMethod} - ${planType} : `, error);
               });
         }
         /*************** Check if there is Vision Plan **************/
         planType = "Vision";
         let visionPlan = this.findDefaultPlan(planType);
         if (visionPlan) {
            this.hasVision = true;
            if (visionPlan.status == "Active") {
               this.visionactiveStatus = true;
            } else {
               this.visionactiveStatus = false;
            }
            //Vision Only
            if (this._servicetypeinfo.length == 1) {
               this.showVisionOnly = false;
               this.showVisionOnlyAttentis = true;
            }

            this.setPCPMessage(visionPlan.networkCode, planType);
            this.visionPlanId = visionPlan.planId;
            this.visionEffectiveDate = visionPlan.eligibilityEffectiveDate;
            this.visionPlanName = visionPlan.planName;

            let inputParamVision = { subscriberId: this.subscriberId, planId: this.visionPlanId, effectiveDate: this.visionEffectiveDate };
            this.callIP(ipMethod, inputParamVision)
               .then((response) => {
                  if (response.result.IPResult) {
                     //Making sure it is Array
                     if (!Array.isArray(response.result.IPResult)) {
                        this.visionMembersMobile = [response.result.IPResult];
                        this.visionallmembers = [response.result.IPResult];
                     } else {
                        this.visionMembersMobile = response.result.IPResult;
                        this.visionallmembers = response.result.IPResult;
                     }

                     this.visionallmembers.forEach((member) => {
                        let currentmember = [];
                        currentmember = this._membersinplan.filter((member1) => member1.memberId == member.memberId);
                        if (member.status == "Active") {
                           member = Object.assign(member, { ActiveStatus: true });
                        } else {
                           member = Object.assign(member, { ActiveStatus: false });
                        }
                        if (member.status == "Active") {
                           member = Object.assign(member, { MemberActiveStatus: true });
                        } else if (member.status != "Pre-Effectuated") {
                           member = Object.assign(member, { MemberActiveStatus: false });
                        } else if (member.status == "Pre-Effectuated") {
                           member = Object.assign(member, { PreeffectuatedStatus: true });
                        }
                        member = Object.assign(member, { Relationship: currentmember[0].relationship });
                        member = Object.assign(member, { Birthdate: currentmember[0].birthdate });
                     });
                     let loggedinmemidinfo = [];
                     loggedinmemidinfo = this.visionallmembers.filter((member) => member.memberId == this.memberid);

                     if (loggedinmemidinfo[0].status == "Active") {
                        this.dependentVisionStatus = true;
                     }
                     this.dependentVisionEligibilityEffectiveDate = loggedinmemidinfo[0].eligibilityEffectiveDate;
                     this.dependentVisionEligibilityTerminationDate = loggedinmemidinfo[0].eligibilityTerminationDate;

                     // this.membersList = this.sortAndSliceData(membersList);
                     this.membersList = this.visionallmembers;

                     this.membersList.sort((a, b) => a.status.localeCompare(b.status) || new Date(a.Birthdate) - new Date(b.Birthdate));

                     let index = this.membersList.findIndex((i) => i.Relationship === "Subscriber");
                     this.membersList.unshift(this.membersList.splice(index, 1)[0]);

                     this.visionallmembers = this.membersList;
                     this.navigateTo(1, "Vision");
                     // this.allmembers= this.allmembers.slice(0, 2);
                  } else {
                     console.error(`${this.errorMessage} ${ipMethod} - ${planType}`);
                  }
               })
               .catch((error) => {
                  console.error(`Error in ${ipMethod} - ${planType} : `, error);
               });
         }

         /*************** Check if there is Vision Plan **************/
         planType = "Pharmacy";
         let pharmacyPlan = this.findDefaultPlan(planType);
         if (pharmacyPlan) {
            this.hasPharmacy = true;
            if (pharmacyPlan.status == "Active") {
               this.pharmacyactiveStatus = true;
            } else {
               this.pharmacyactiveStatus = false;
            }
            //Pharmacy Only
            if (this._servicetypeinfo.length == 1) {
               this.pharmacyonly = true;
            }
            //MPV-1041 Preferred PCP Message Content
            this.setPCPMessage(pharmacyPlan.networkCode, planType);

            this.pharmacyPlanId = pharmacyPlan.planId;
            this.pharmacyEffectiveDate = pharmacyPlan.eligibilityEffectiveDate;
            this.pharmacyPlanName = pharmacyPlan.planName;

            let inputParamPharmacy = { subscriberId: this.subscriberId, planId: this.pharmacyPlanId, effectiveDate: this.pharmacyEffectiveDate };
            this.callIP(ipMethod, inputParamPharmacy)
               .then((response) => {
                  if (response.result.IPResult) {
                     //Making sure it is Array
                     if (!Array.isArray(response.result.IPResult)) {
                        this.pharmacyMembersMobile = [response.result.IPResult];
                        this.pharmacyallmembers = [response.result.IPResult];
                     } else {
                        this.pharmacyMembersMobile = response.result.IPResult;
                        this.pharmacyallmembers = response.result.IPResult;
                     }

                     this.pharmacyallmembers.forEach((member) => {
                        let currentmember = [];
                        currentmember = this._membersinplan.filter((member1) => member1.memberId == member.memberId);
                        if (member.status == "Active") {
                           member = Object.assign(member, { ActiveStatus: true });
                        } else {
                           member = Object.assign(member, { ActiveStatus: false });
                        }
                        if (member.status == "Active") {
                           member = Object.assign(member, { MemberActiveStatus: true });
                        } else if (member.status != "Pre-Effectuated") {
                           member = Object.assign(member, { MemberActiveStatus: false });
                        } else if (member.status == "Pre-Effectuated") {
                           member = Object.assign(member, { PreeffectuatedStatus: true });
                        }
                        member = Object.assign(member, { Relationship: currentmember[0].relationship });
                        member = Object.assign(member, { Birthdate: currentmember[0].birthdate });
                     });
                     let loggedinmemidinfo = [];
                     loggedinmemidinfo = this.pharmacyallmembers.filter((member) => member.memberId == this.memberid);

                     if (loggedinmemidinfo[0].status == "Active") {
                        this.dependentPharmacyStatus = true;
                     }
                     this.dependentPharmacyEligibilityEffectiveDate = loggedinmemidinfo[0].eligibilityEffectiveDate;
                     this.dependentPharmacyEligibilityTerminationDate = loggedinmemidinfo[0].eligibilityTerminationDate;

                     // this.membersList = this.sortAndSliceData(membersList);
                     this.membersList = this.pharmacyallmembers;

                     this.membersList.sort((a, b) => a.status.localeCompare(b.status) || new Date(a.Birthdate) - new Date(b.Birthdate));

                     let index = this.membersList.findIndex((i) => i.Relationship === "Subscriber");
                     this.membersList.unshift(this.membersList.splice(index, 1)[0]);

                     this.pharmacyallmembers = this.membersList;

                     this.navigateTo(1, "Pharmacy");
                     // this.allmembers= this.allmembers.slice(0, 2);
                  } else {
                     console.error(`${this.errorMessage} ${ipMethod} - ${planType}`);
                  }
               })
               .catch((error) => {
                  console.error(`Error in ${ipMethod} - ${planType} : `, error);
               });
         }
      }
   }

   getMemberInfo_OLD() {
      if (this._servicetypeinfo && Array.isArray(this._servicetypeinfo) === true && this._servicetypeinfo.length > 0) {
         this._servicetypeinfo.forEach((plan) => {
            this.startDate = plan.eligibilityEffectiveDate;
            this.endDate = plan.eligibilityTerminationDate;

            let newdata = [];
            newdata = this._servicetypeinfo.filter((plan) => plan.productCategory == "Medical");

            if (newdata.length > 1 && plan.productCategory == "Medical" && plan.status != "Active") {
            } else {
               //MPV-286 Choose as PCP link Access Control
               if (plan.productCategory == "Medical") {
                  if (plan.status == "Active" && (plan.LOBD_MCTR == 1002 || plan.LOBD_MCTR == 1003)) {
                     this.showPCPLink = false;
                  } else if (plan.status == "Future Effective" && (plan.LOBD_MCTR == 1002 || plan.LOBD_MCTR == 1003)) {
                     this.showPCPLink = false;
                  } else if (plan.status == "Future Active" && (plan.LOBD_MCTR == 1002 || plan.LOBD_MCTR == 1003)) {
                     this.showPCPLink = false;
                  } else if (plan.status == "Pre-Effectuated" && (plan.LOBD_MCTR == 1002 || plan.LOBD_MCTR == 1003)) {
                     this.showPCPLink = false;
                  } else if (plan.status == "Terminated") {
                     this.showPCPLink = false;
                  } else {
                     this.showPCPLink = true;
                  }

                  this.hasMedical = true;
                  if (plan.status == "Active") {
                     this.medicalactiveStatus = true;
                  } else {
                     this.medicalactiveStatus = false;
                  }

                  if ((plan.networkCode == "2T03" || plan.networkCode == "2T02") && this.preferredstatus == "Yes" && this._pcpinfo.length > 0) {
                     this.medicalshowPCPMessage = true;
                     this.medicalpcpMessage = "By selecting a Preferred Provider, you have lowered your Copay option for most professional services";
                  } else if ((plan.networkCode == "2T03" || plan.networkCode == "2T02") && this.preferredstatus == "No") {
                     this.medicalshowPCPMessage = true;
                     this.medicalpcpMessage = "Take Advantage of Your Plan's Lower Copay Option. If you choose a Preferred Provider, you’ll have lower copays for most professional services.";
                  } else if ((plan.networkCode == "2T03" || plan.networkCode == "2T02") && (this._pcpinfo.length == 0 || this.preferredstatus === undefined)) {
                     this.medicalshowPCPMessage = true;
                     this.medicalpcpMessage = "Take Advantage of Your Plan's Lower Copay Option. If you choose a Preferred Provider, you’ll have lower copays for most professional services.";
                  } else if (plan.networkCode == "HT01" && this.preferredstatus == "Yes") {
                     this.medicalshowPCPMessage = true;
                     this.medicalpcpMessage = "By selecting a Preferred Provider, you will have lower copays for most professional services.";
                  } else if (plan.networkCode == "HT01" && this.preferredstatus == "No") {
                     this.medicalshowPCPMessage = true;
                     this.medicalpcpMessage = "Take Advantage of your plan's lower copay option. If you choose a Preferred Provider, you will pay less for most professional services.";
                  } else if (plan.networkCode == "HT01" && this._pcpinfo.length == 0) {
                     this.medicalshowPCPMessage = true;
                     this.medicalpcpMessage = "Take Advantage of your plan's lower copay option. If you choose a Preferred Provider, you will pay less for most professional services.";
                  } else if (plan.networkCode == "G005") {
                     this.medicalshowPCPMessage = true;
                     this.medicalpcpMessage = "Take Advantage of Your Plan's Lower Copay Option. If you choose a Preferred Provider, you’ll have lower copays for most professional services.";
                  }

                  this.medicalPlanId = plan.planId;
                  this.medicalEffectiveDate = plan.eligibilityEffectiveDate;
                  this.medicalPlanName = plan.planName;

                  let params = {
                     sClassName: "omnistudio.IntegrationProcedureService",
                     sMethodName: "Member_MembersByPlan",
                     options: "{}",
                     input: {
                        subscriberId: this.subscriberId,
                        planId: this.medicalPlanId,
                        effectiveDate: this.medicalEffectiveDate,
                     },
                  };
                  this._actionUtilClass
                     .executeAction(params, null, this, null, null)
                     .then((response) => {
                        if (response.result.IPResult) {
                           //Making sure it is Array
                           if (!Array.isArray(response.result.IPResult)) {
                              this.medicalMembersMobile = [response.result.IPResult];
                              this.medicalallmembers = [response.result.IPResult];
                           } else {
                              this.medicalMembersMobile = response.result.IPResult;
                              this.medicalallmembers = response.result.IPResult;
                           }

                           this.medicalallmembers.forEach((member) => {
                              let currentmember = [];
                              currentmember = this._membersinplan.filter((member1) => member1.memberId == member.memberId);

                              if (member.status == "Active") {
                                 member = Object.assign(member, { ActiveStatus: true });
                              } else {
                                 member = Object.assign(member, { ActiveStatus: false });
                              }

                              if (member.status == "Active") {
                                 member = Object.assign(member, { MemberActiveStatus: true });
                              } else if (member.status != "Pre-Effectuated") {
                                 member = Object.assign(member, { MemberActiveStatus: false });
                              } else if (member.status == "Pre-Effectuated") {
                                 member = Object.assign(member, { PreeffectuatedStatus: true });
                              }

                              member = Object.assign(member, { Relationship: currentmember[0].relationship });
                              member = Object.assign(member, { Birthdate: currentmember[0].birthdate });
                           });
                           let loggedinmemidinfo = [];
                           loggedinmemidinfo = this.medicalallmembers.filter((member) => member.memberId == this.memberid);

                           if (loggedinmemidinfo.length) {
                              if (loggedinmemidinfo[0].status == "Active") {
                                 this.dependentMedicalStatus = true;
                              } else if (loggedinmemidinfo[0].status == "Pre-Effectuated") {
                                 this.PreeffectuatedStatus = true;
                              }
                              this.dependentMedicalEligibilityEffectiveDate = loggedinmemidinfo[0].eligibilityEffectiveDate;
                              this.dependentMedicalEligibilityTerminationDate = loggedinmemidinfo[0].eligibilityTerminationDate;
                           }
                           // this.membersList = this.sortAndSliceData(membersList);
                           this.membersList = this.medicalallmembers;
                           this.membersList.sort((a, b) => a.status.localeCompare(b.status) || new Date(a.Birthdate) - new Date(b.Birthdate));

                           let index = this.membersList.findIndex((i) => i.Relationship === "Subscriber");
                           this.membersList.unshift(this.membersList.splice(index, 1)[0]);

                           this.navigateTo(1, "Medical");
                        } else {
                           console.error(`${this.errorMessage} Member_MembersByPlan`);
                        }
                     })
                     .catch((error) => {
                        console.error(`failed at getting IP data => ${error}`);
                     });
               }
            }
            let dentaldata = [];
            dentaldata = this._servicetypeinfo.filter((plan) => plan.productCategory == "Dental");
            if (dentaldata.length > 1 && plan.productCategory == "Dental" && plan.status != "Active") {
            } else {
               if (plan.productCategory == "Dental") {
                  this.hasDental = true;
                  if (plan.status == "Active") {
                     this.dentalactiveStatus = true;
                  } else {
                     this.dentalactiveStatus = false;
                  }

                  if (plan.networkCode == "2T03" || (plan.networkCode == "2T02" && this.preferredstatus == "Yes" && this._pcpinfo.length > 0)) {
                     this.dentalshowPCPMessage = true;
                     this.dentalpcpMessage = "By selecting a Preferred Provider, you have lowered your Copay option for most professional services";
                  } else if (plan.networkCode == "2T03" || (plan.networkCode == "2T02" && this.preferredstatus == "No")) {
                     this.dentalshowPCPMessage = true;
                     this.dentalpcpMessage = "Take Advantage of Your Plan's Lower Copay Option. If you choose a Preferred Provider, you’ll have lower copays for most professional services.";
                  } else if (plan.networkCode == "2T03" || (plan.networkCode == "2T02" && this._pcpinfo.length == 0)) {
                     this.dentalshowPCPMessage = true;
                     this.dentalpcpMessage = "Take Advantage of Your Plan's Lower Copay Option. If you choose a Preferred Provider, you’ll have lower copays for most professional services.";
                  } else if (plan.networkCode == "HT01" && this.preferredstatus == "Yes") {
                     this.dentalshowPCPMessage = true;
                     this.dentalpcpMessage = "By selecting a Preferred Provider, you will have lower copays for most professional services.";
                  } else if (plan.networkCode == "HT01" && this.preferredstatus == "No") {
                     this.dentalshowPCPMessage = true;
                     this.dentalpcpMessage = "Take Advantage of your plan's lower copay option. If you choose a Preferred Provider, you will pay less for most professional services.";
                  } else if (plan.networkCode == "HT01" && this._pcpinfo.length == 0) {
                     this.dentalshowPCPMessage = true;
                     this.dentalpcpMessage = "Take Advantage of your plan's lower copay option. If you choose a Preferred Provider, you will pay less for most professional services.";
                  } else if (plan.networkCode == "G005") {
                     this.dentalshowPCPMessage = true;
                     this.dentalpcpMessage = "Take Advantage of Your Plan's Lower Copay Option. If you choose a Preferred Provider, you’ll have lower copays for most professional services.";
                  }

                  this.dentalPlanId = plan.planId;
                  this.dentalEffectiveDate = plan.eligibilityEffectiveDate;
                  this.dentalPlanName = plan.planName;

                  let params = {
                     sClassName: "omnistudio.IntegrationProcedureService",
                     sMethodName: "Member_MembersByPlan",
                     options: "{}",
                     input: {
                        subscriberId: this.subscriberId,
                        planId: this.dentalPlanId,
                        effectiveDate: this.dentalEffectiveDate,
                     },
                  };
                  this._actionUtilClass.executeAction(params, null, this, null, null).then((response) => {
                     if (response.result.IPResult) {
                        //Making sure it is Array
                        if (!Array.isArray(response.result.IPResult)) {
                           this.dentalMembersMobile = [response.result.IPResult];
                           this.dentalallmembers = [response.result.IPResult];
                        } else {
                           this.dentalMembersMobile = response.result.IPResult;
                           this.dentalallmembers = response.result.IPResult;
                        }

                        this.dentalallmembers.forEach((member) => {
                           let currentmember = [];
                           currentmember = this._membersinplan.filter((member1) => member1.memberId == member.memberId);
                           if (member.status == "Active") {
                              member = Object.assign(member, { ActiveStatus: true });
                           } else {
                              member = Object.assign(member, { ActiveStatus: false });
                           }
                           if (member.status == "Active") {
                              member = Object.assign(member, { MemberActiveStatus: true });
                           } else if (member.status != "Pre-Effectuated") {
                              member = Object.assign(member, { MemberActiveStatus: false });
                           } else if (member.status == "Pre-Effectuated") {
                              member = Object.assign(member, { PreeffectuatedStatus: true });
                           }
                           member = Object.assign(member, { Relationship: currentmember[0].relationship });
                           member = Object.assign(member, { Birthdate: currentmember[0].birthdate });
                        });
                        let loggedinmemidinfo = [];
                        loggedinmemidinfo = this.dentalallmembers.filter((member) => member.memberId == this.memberid);

                        if (loggedinmemidinfo[0].status == "Active") {
                           this.dependentDentalStatus = true;
                        }
                        this.dependentDentalEligibilityEffectiveDate = loggedinmemidinfo[0].eligibilityEffectiveDate;
                        this.dependentDentalEligibilityTerminationDate = loggedinmemidinfo[0].eligibilityTerminationDate;

                        // this.membersList = this.sortAndSliceData(membersList);
                        this.membersList = this.dentalallmembers;

                        this.membersList.sort((a, b) => a.status.localeCompare(b.status) || new Date(a.Birthdate) - new Date(b.Birthdate));

                        let index = this.membersList.findIndex((i) => i.Relationship === "Subscriber");
                        this.membersList.unshift(this.membersList.splice(index, 1)[0]);

                        this.dentalallmembers = this.membersList;

                        this.navigateTo(1, "Dental");
                        // this.allmembers= this.allmembers.slice(0, 2);
                     } else {
                        console.error(`${this.errorMessage} Member_MembersByPlan`);
                     }
                  });
               }
            }

            let pharmacyplans = [];
            pharmacyplans = this._servicetypeinfo.filter((plan) => plan.productCategory == "Pharmacy");
            if (pharmacyplans.length == this._servicetypeinfo.length && pharmacyplans.length > 0) {
               this.pharmacyonly = true;
            }

            let visiondata = [];
            visiondata = this._servicetypeinfo.filter((plan) => plan.productCategory == "Vision");

            if (visiondata.length == this._servicetypeinfo.length && visiondata.length > 0) {
               this.showVisionOnly = true;
            } else{
               this.showVisionOnly = false;
               this.showVisionOnlyAttentis = true;
            }

            if (visiondata.length > 1 && plan.productCategory == "Vision" && plan.status != "Active") {
            } else {
               if (plan.productCategory == "Vision") {
                  this.hasVision = true;
                  if (plan.status == "Active") {
                     this.visionactiveStatus = true;
                  } else {
                     this.visionactiveStatus = false;
                  }

                  if (plan.networkCode == "2T03" || (plan.networkCode == "2T02" && this.preferredstatus == "Yes" && this._pcpinfo.length > 0)) {
                     this.visionshowPCPMessage = true;
                     this.visionpcpMessage = "By selecting a Preferred Provider, you have lowered your Copay option for most professional services.";
                  } else if (plan.networkCode == "2T03" || (plan.networkCode == "2T02" && this.preferredstatus == "No")) {
                     this.visionshowPCPMessage = true;
                     this.visionpcpMessage = "Take Advantage of Your Plan's Lower Copay Option. If you choose a Preferred Provider, you’ll have lower copays for most professional services.";
                  } else if (plan.networkCode == "2T03" || (plan.networkCode == "2T02" && this._pcpinfo.length == 0)) {
                     this.visionshowPCPMessage = true;
                     this.visionpcpMessage = "Take Advantage of Your Plan's Lower Copay Option. If you choose a Preferred Provider, you’ll have lower copays for most professional services.";
                  } else if (plan.networkCode == "HT01" && this.preferredstatus == "Yes") {
                     this.visionshowPCPMessage = true;
                     this.visionpcpMessage = "By selecting a Preferred Provider, you will have lower copays for most professional services.";
                  } else if (plan.networkCode == "HT01" && this.preferredstatus == "No") {
                     this.visionshowPCPMessage = true;
                     this.visionpcpMessage = "Take Advantage of your plan's lower copay option. If you choose a Preferred Provider, you will pay less for most professional services.";
                  } else if (plan.networkCode == "HT01" && this._pcpinfo.length == 0) {
                     this.visionshowPCPMessage = true;
                     this.visionpcpMessage = "Take Advantage of your plan's lower copay option. If you choose a Preferred Provider, you will pay less for most professional services.";
                  } else if (plan.networkCode == "G005") {
                     this.visionshowPCPMessage = true;
                     this.visionpcpMessage = "Take Advantage of Your Plan's Lower Copay Option. If you choose a Preferred Provider, you’ll have lower copays for most professional services.";
                  }

                  this.visionPlanId = plan.planId;
                  this.visionEffectiveDate = plan.eligibilityEffectiveDate;
                  this.visionPlanName = plan.planName;

                  let params = {
                     sClassName: "omnistudio.IntegrationProcedureService",
                     sMethodName: "Member_MembersByPlan",
                     options: "{}",
                     input: {
                        subscriberId: this.subscriberId,
                        planId: this.visionPlanId,
                        effectiveDate: this.visionEffectiveDate,
                     },
                  };
                  this._actionUtilClass
                     .executeAction(params, null, this, null, null)
                     .then((response) => {
                        if (response.result.IPResult) {
                           //Making sure it is Array
                           if (!Array.isArray(response.result.IPResult)) {
                              this.visionMembersMobile = [response.result.IPResult];
                              this.visionallmembers = [response.result.IPResult];
                           } else {
                              this.visionMembersMobile = response.result.IPResult;
                              this.visionallmembers = response.result.IPResult;
                           }

                           this.visionallmembers.forEach((member) => {
                              let currentmember = [];
                              currentmember = this._membersinplan.filter((member1) => member1.memberId == member.memberId);
                              if (member.status == "Active") {
                                 member = Object.assign(member, { ActiveStatus: true });
                              } else {
                                 member = Object.assign(member, { ActiveStatus: false });
                              }
                              if (member.status == "Active") {
                                 member = Object.assign(member, { MemberActiveStatus: true });
                              } else if (member.status != "Pre-Effectuated") {
                                 member = Object.assign(member, { MemberActiveStatus: false });
                              } else if (member.status == "Pre-Effectuated") {
                                 member = Object.assign(member, { PreeffectuatedStatus: true });
                              }
                              member = Object.assign(member, { Relationship: currentmember[0].relationship });
                              member = Object.assign(member, { Birthdate: currentmember[0].birthdate });
                           });
                           let loggedinmemidinfo = [];
                           loggedinmemidinfo = this.visionallmembers.filter((member) => member.memberId == this.memberid);

                           if (loggedinmemidinfo[0].status == "Active") {
                              this.dependentVisionStatus = true;
                           }
                           this.dependentVisionEligibilityEffectiveDate = loggedinmemidinfo[0].eligibilityEffectiveDate;
                           this.dependentVisionEligibilityTerminationDate = loggedinmemidinfo[0].eligibilityTerminationDate;

                           // this.membersList = this.sortAndSliceData(membersList);
                           this.membersList = this.visionallmembers;

                           this.membersList.sort((a, b) => a.status.localeCompare(b.status) || new Date(a.Birthdate) - new Date(b.Birthdate));

                           let index = this.membersList.findIndex((i) => i.Relationship === "Subscriber");
                           this.membersList.unshift(this.membersList.splice(index, 1)[0]);

                           this.visionallmembers = this.membersList;
                           this.navigateTo(1, "Vision");
                           // this.allmembers= this.allmembers.slice(0, 2);
                        } else {
                           console.error(`${this.errorMessage} Member_MembersByPlan`);
                        }
                     })
                     .catch((error) => {
                        console.error(`failed at getting IP data => ${error}`);
                     });
               }
            }
            let pharmacydata = [];
            pharmacydata = this._servicetypeinfo.filter((plan) => plan.productCategory == "Pharmacy");
            if (pharmacydata.length > 1 && plan.productCategory == "Pharmacy" && plan.status != "Active") {
            } else {
               if (plan.productCategory == "Pharmacy") {
                  this.hasPharmacy = true;
                  if (plan.status == "Active") {
                     this.pharmacyactiveStatus = true;
                  } else {
                     this.pharmacyactiveStatus = false;
                  }

                  if (plan.networkCode == "2T03" || (plan.networkCode == "2T02" && this.preferredstatus == "Yes" && this._pcpinfo.length > 0)) {
                     this.pharmacyshowPCPMessage = true;
                     this.pharmacypcpMessage = "By selecting a Preferred Provider, you have lowered your Copay option for most professional services.";
                  } else if (plan.networkCode == "2T03" || (plan.networkCode == "2T02" && this.preferredstatus == "No")) {
                     this.pharmacyshowPCPMessage = true;
                     this.pharmacypcpMessage = "Take Advantage of Your Plan's Lower Copay Option. If you choose a Preferred Provider, you’ll have lower copays for most professional services.";
                  } else if (plan.networkCode == "2T03" || (plan.networkCode == "2T02" && this._pcpinfo.length == 0)) {
                     this.pharmacyshowPCPMessage = true;
                     this.pharmacypcpMessage = "Take Advantage of Your Plan's Lower Copay Option. If you choose a Preferred Provider, you’ll have lower copays for most professional services.";
                  } else if (plan.networkCode == "HT01" && this.preferredstatus == "Yes") {
                     this.pharmacyshowPCPMessage = true;
                     this.pharmacypcpMessage = "By selecting a Preferred Provider, you will have lower copays for most professional services.";
                  } else if (plan.networkCode == "HT01" && this.preferredstatus == "No") {
                     this.pharmacyshowPCPMessage = true;
                     this.pharmacypcpMessage = "Take Advantage of your plan's lower copay option. If you choose a Preferred Provider, you will pay less for most professional services.";
                  } else if (plan.networkCode == "HT01" && this._pcpinfo.length == 0) {
                     this.pharmacyshowPCPMessage = true;
                     this.pharmacypcpMessage = "Take Advantage of your plan's lower copay option. If you choose a Preferred Provider, you will pay less for most professional services.";
                  } else if (plan.networkCode == "G005") {
                     this.pharmacyshowPCPMessage = true;
                     this.pharmacypcpMessage = "Take Advantage of Your Plan's Lower Copay Option. If you choose a Preferred Provider, you’ll have lower copays for most professional services.";
                  }

                  this.pharmacyPlanId = plan.planId;
                  this.pharmacyEffectiveDate = plan.eligibilityEffectiveDate;
                  this.pharmacyPlanName = plan.planName;

                  let params = {
                     sClassName: "omnistudio.IntegrationProcedureService",
                     sMethodName: "Member_MembersByPlan",
                     options: "{}",
                     input: {
                        subscriberId: this.subscriberId,
                        planId: this.pharmacyPlanId,
                        effectiveDate: this.pharmacyEffectiveDate,
                     },
                  };
                  this._actionUtilClass
                     .executeAction(params, null, this, null, null)
                     .then((response) => {
                        if (response.result.IPResult) {
                           //Making sure it is Array
                           if (!Array.isArray(response.result.IPResult)) {
                              this.pharmacyMembersMobile = [response.result.IPResult];
                              this.pharmacyallmembers = [response.result.IPResult];
                           } else {
                              this.pharmacyMembersMobile = response.result.IPResult;
                              this.pharmacyallmembers = response.result.IPResult;
                           }

                           this.pharmacyallmembers.forEach((member) => {
                              let currentmember = [];
                              currentmember = this._membersinplan.filter((member1) => member1.memberId == member.memberId);
                              if (member.status == "Active") {
                                 member = Object.assign(member, { ActiveStatus: true });
                              } else {
                                 member = Object.assign(member, { ActiveStatus: false });
                              }
                              if (member.status == "Active") {
                                 member = Object.assign(member, { MemberActiveStatus: true });
                              } else if (member.status != "Pre-Effectuated") {
                                 member = Object.assign(member, { MemberActiveStatus: false });
                              } else if (member.status == "Pre-Effectuated") {
                                 member = Object.assign(member, { PreeffectuatedStatus: true });
                              }
                              member = Object.assign(member, { Relationship: currentmember[0].relationship });
                              member = Object.assign(member, { Birthdate: currentmember[0].birthdate });
                           });
                           let loggedinmemidinfo = [];
                           loggedinmemidinfo = this.pharmacyallmembers.filter((member) => member.memberId == this.memberid);

                           if (loggedinmemidinfo[0].status == "Active") {
                              this.dependentPharmacyStatus = true;
                           }
                           this.dependentPharmacyEligibilityEffectiveDate = loggedinmemidinfo[0].eligibilityEffectiveDate;
                           this.dependentPharmacyEligibilityTerminationDate = loggedinmemidinfo[0].eligibilityTerminationDate;

                           // this.membersList = this.sortAndSliceData(membersList);
                           this.membersList = this.pharmacyallmembers;

                           this.membersList.sort((a, b) => a.status.localeCompare(b.status) || new Date(a.Birthdate) - new Date(b.Birthdate));

                           let index = this.membersList.findIndex((i) => i.Relationship === "Subscriber");
                           this.membersList.unshift(this.membersList.splice(index, 1)[0]);

                           this.pharmacyallmembers = this.membersList;

                           this.navigateTo(1, "Pharmacy");
                           // this.allmembers= this.allmembers.slice(0, 2);
                        } else {
                           console.error(`${this.errorMessage} Member_MembersByPlan`);
                        }
                     })
                     .catch((error) => {
                        console.error(`failed at getting IP data => ${error}`);
                     });
               }
            }
         });
      }
   }

   /*changeSlide(){
      const topDiv = this.template.querySelector('[data-id="slide-2"]');
      topDiv.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
   }*/
}
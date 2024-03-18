import { LightningElement, api, track } from "lwc";
import pubsub from "omnistudio/pubsub";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import { NavigationMixin } from "lightning/navigation";
import { getDataHandler } from "omnistudio/utility";
import { isMobile } from "omnistudio/utility";

export default class MemberServiceType extends OmniscriptBaseMixin(NavigationMixin(LightningElement)) {
   loading = true;
   @api serviceTypeInfo;
   message;
   subscription = null;
   selectedPlanId;
   errorMessage = "Error --> No data returned from IP";
   _isMobile = isMobile();

   /**flag to launch the modal**/
   isModalGlobal = false;
   isModalDoctor = false;
   isModalPCP = false;
   isModalDental = false;
   isModalDentalMedicare = false;
   isModalDentalOther = false;
   isModalVision = false;
   isModalVisionMedicare = false;
   isModalVisionOther = false;
   isModalMentalHealthAttentisComm = false;
   isModalMentalHealthAttentisMed = false;
   isModalMentalHealthOther = false;
   isModalFacility = false;
   isModalChiropractor = false;
   isModalChiropractorMedicare = false;
   isModalChiropractorOther = false;
   isModalLab = false;
   isModalLabMedicare = false;
   isModalLabOther = false;
   isModalPharmacy = false;
   isModalPharmacyMedicare = false;
   isModalPharmacyOther = false;
   isModalVCP = false;
   isModalVCPMedicare = false;
   isModalHearingAid = false;
   isModalHearingAidMedicare = false;
   //provider for VCP and Hearing Aid modal
   provider = "";

   /**flag to show/hide the service type in the UI**/
   showDoctorServiceType = true;
   showPCPServiceType = true;
   showDentalServiceType = true;
   showVisionServiceType = true;
   showMentalServiceType = true;
   showFacilityServiceType = true;
   showChiroServiceType = true;
   showLabServiceType = true;
   showPharmacyServiceType = true;
   // showVCPServiceType = true;
   showVCPServiceType = false;
   showHearingAidServiceType = true;

   //MPV-1666
   @track showAllTiles = true;
   isModalMedSupp = false;
   isModalMedicareSupplement = false;
   isSmallGroup = false;
   isAttentisSolo = false;

   @track SelectedPlanInfo;

   @track publicPlanPage;
   @track findCarePlanPage;

   isPublic = false;

   handleSelectPlan(msg) {
      // perform logic to handle the pubsub data from the Step
      this.hideServiceTypePlans();

      // Calling IP to determine if VCP tile should be displayed
      this.showVCPServiceType = false;
      let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      this.SelectedPlanInfo = jsonData.SelectedPlanInfo;
      // call Member/BSDLAvailabie IP
      let inputBSDL = {
         planId: jsonData.SelectedPlanInfo.planId,
         bsdl: "TELE",
      };
      this.callIP("Member_BSDLAvailabie", inputBSDL).then((data) => {
         if (data.IPResult) {
            this.omniApplyCallResp(data.IPResult);
            // hiding VCP if isBSDLAvailable != "Y"
            if (data.IPResult.isBSDLAvailable != "Y") {
               this.showVCPServiceType = false;
            } else {
               this.showVCPServiceType = true;
            }
         } else {
            console.error(`${this.errorMessage} Member_BSDLAvailabie`);
         }
      });
   }

   registerPubSub() {
      pubsub.register("selectPlanChanel", {
         selectPlan: this.handleSelectPlan.bind(this),
      });
   }

   disconnectedCallback() {
      pubsub.unregister("selectPlanChanel", {
         selectPlan: this.handleSelectPlan.bind(this),
      });
   }

   connectedCallback() {
      let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      this.isPublic = jsonData.isPublic;

      if(jsonData.publicPage && jsonData.publicPage == "Plan" ) {
         this.publicPlanPage = true;
      }

      if (this.isPublic) {
         /******************************************************/
         /************* Handing Public User Request ************/
         /******************************************************/
         this.hideServiceTypePlans();
      } else {
         /******************************************************/
         /******** Handing Authenticated User Request **********/
         /******************************************************/
         this.SelectedPlanInfo = jsonData.SelectedPlanInfo;
         //Coming from FindCare Quick Action (Homepage)
         if (jsonData.goToFindCare == true) {
            let serviceType = jsonData.serviceType;
            let chooseServiceType = { STEP_ChooseServiceType: { radioServiceType: serviceType, TXT_ServiceType: serviceType } };
            this.omniApplyCallResp(chooseServiceType);
            this.omniNextStep();
         }

         if (jsonData.goToFacility == "Yes" && jsonData.facilityExecution == "Yes") {
            let chooseServiceTypeFacility = { STEP_ChooseServiceType: { radioServiceType: "Facility" } };
            this.omniApplyCallResp(chooseServiceTypeFacility);
            this.omniNextStep();
         }

         if (jsonData.goToFacility == "Yes" && jsonData.facilityExecution == "No") {
            let chooseServiceTypePCP = { STEP_ChooseServiceType: { radioServiceType: "PCP" } };
            this.omniApplyCallResp(chooseServiceTypePCP);

            let goToFacilityFlag = { goToFacility: "No" };
            this.omniApplyCallResp(goToFacilityFlag);
         }

         /**Show member Info**/
         if (jsonData.MemberInfo == undefined || jsonData.MemberInfo == null || jsonData.MemberInfo == "") {
         } else {
            if (jsonData.MemberInfo.zipCode) {
               let zipCodeMember = jsonData.MemberInfo.zipCode;
               if (zipCodeMember.length > 5) {
                  zipCodeMember = zipCodeMember.substring(0, 5);
               }
               let zipCodeMemberInfo = { TXT_ZipCode: zipCodeMember, SEL_Distance: "5mi", TXT_FacilityName: "" };
               this.omniApplyCallResp(zipCodeMemberInfo);
            } else {
            }
         }
         this.hideServiceTypePlans();
         this.registerPubSub();

         // call Member/BSDLAvailabie IP
         let inputBSDL = {
            planId: jsonData.SelectedPlanInfo.planId,
            bsdl: "TELE",
         };
         this.callIP("Member_BSDLAvailabie", inputBSDL).then((data) => {
            if (data.IPResult) {
               this.omniApplyCallResp(data.IPResult);
               // hiding VCP if isBSDLAvailable != "Y"
               if (data.IPResult.isBSDLAvailable != "Y") {
                  this.showVCPServiceType = false;
               } else {
                  this.showVCPServiceType = true;
               }
            } else {
               console.error(`${this.errorMessage} Member_BSDLAvailabie`);
            }
         });

         if (jsonData.ServiceTypeInfo != undefined || jsonData.ServiceTypeInfo != null || jsonData.ServiceTypeInfo != "") {
            for (var s = 0; s < jsonData.ServiceTypeInfo.length; s++) {
               if (jsonData.ServiceTypeInfo[s].defaultPlan == "Y" && jsonData.ServiceTypeInfo[s].lobMarketSegment == "Medicare Supplement") {
                  this.showAllTiles = false;
               } else if (jsonData.ServiceTypeInfo[s].defaultPlan == "Y" && jsonData.ServiceTypeInfo[s].lobMarketSegment == "Small Group") {
                  this.isSmallGroup = true;
               } else if (jsonData.ServiceTypeInfo[s].defaultPlan == "Y" && jsonData.ServiceTypeInfo[s].lobMarketSegment == "Individual Solo") {
                  this.isAttentisSolo = true;
               }
            }
         }
      }
   }   

   goToFindCarePlans(evt) {
      if (evt) {
         if (this.isPublic) {
            //Going back to the Find Care public main page
            this[NavigationMixin.Navigate](
               {
                  type: "standard__namedPage",
                  attributes: {
                     pageName: "find-care-plans",
                  },
               },
               true // Replaces the current page in your browser history with the URL
            );
         }
      }
   }

   hideServiceTypePlans() {
      this.loading = true;
      let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));

      if (jsonData.SelectedPlanInfo == undefined || jsonData.SelectedPlanInfo == null || jsonData.SelectedPlanInfo == "") {
      } else {
         /**Hide Doctor Service Type if it's Not Applicable OR N/A**/
         if (jsonData.SelectedPlanInfo.Doctor == "Not Applicable" || jsonData.SelectedPlanInfo.Doctor == "N/A" || jsonData.SelectedPlanInfo.Doctor == "NOT APPLICABLE") {
            this.showDoctorServiceType = false;
         } else {
            this.showDoctorServiceType = true;
         }

         /**Hide PCP Service Type if it's Not Applicable OR N/A**/
         if (
            jsonData.SelectedPlanInfo.PrimaryCarePhysician == "Not Applicable" ||
            jsonData.SelectedPlanInfo.PrimaryCarePhysician == "N/A" ||
            jsonData.SelectedPlanInfo.PrimaryCarePhysician == "NOT APPLICABLE"
         ) {
            this.showPCPServiceType = false;
         } else {
            this.showPCPServiceType = true;
         }

         /**Hide Dental Service Type if it's Not Applicable OR N/A**/
         //hide dental
         if (
            (jsonData.SelectedPlanInfo.Dental == "Not Applicable" || jsonData.SelectedPlanInfo.Dental == "N/A" || jsonData.SelectedPlanInfo.Dental == "NOT APPLICABLE") &&
            jsonData.SelectedPlanInfo.dentalEmbededInd == "Y"
         ) {
            this.showDentalServiceType = false;
         }

         if (
            (jsonData.SelectedPlanInfo.Dental == "Not Applicable" || jsonData.SelectedPlanInfo.Dental == "N/A" || jsonData.SelectedPlanInfo.Dental == "NOT APPLICABLE") &&
            jsonData.SelectedPlanInfo.dentalEmbededInd == "N"
         ) {
            this.showDentalServiceType = false;
         }

         if ((jsonData.SelectedPlanInfo.Dental == "Internal" || jsonData.SelectedPlanInfo.Dental == "INTERNAL") && jsonData.SelectedPlanInfo.dentalEmbededInd == "N") {
            this.showDentalServiceType = false;
         }

         //show dental
         if ((jsonData.SelectedPlanInfo.Dental == "Internal" || jsonData.SelectedPlanInfo.Dental == "INTERNAL") && jsonData.SelectedPlanInfo.dentalEmbededInd == "Y") {
            this.showDentalServiceType = true;
         }

         if (
            jsonData.SelectedPlanInfo.Dental != "Internal" &&
            jsonData.SelectedPlanInfo.Dental != "INTERNAL" &&
            jsonData.SelectedPlanInfo.Dental != "Not Applicable" &&
            jsonData.SelectedPlanInfo.Dental != "N/A" &&
            jsonData.SelectedPlanInfo.Dental != "NOT APPLICABLE" &&
            jsonData.SelectedPlanInfo.dentalEmbededInd == "Y"
         ) {
            this.showDentalServiceType = true;
         }

         /**Hide Vision Service Type if it's Not Applicable OR N/A**/
         //hide Vision
         if (
            (jsonData.SelectedPlanInfo.Vision == "Not Applicable" || jsonData.SelectedPlanInfo.Vision == "N/A" || jsonData.SelectedPlanInfo.Vision == "NOT APPLICABLE") &&
            jsonData.SelectedPlanInfo.visionEmbededInd == "Y"
         ) {
            this.showVisionServiceType = false;
         }

         if (
            (jsonData.SelectedPlanInfo.Vision == "Not Applicable" || jsonData.SelectedPlanInfo.Vision == "N/A" || jsonData.SelectedPlanInfo.Vision == "NOT APPLICABLE") &&
            jsonData.SelectedPlanInfo.visionEmbededInd == "N"
         ) {
            this.showVisionServiceType = false;
         }

         if ((jsonData.SelectedPlanInfo.Vision == "Internal" || jsonData.SelectedPlanInfo.Vision == "INTERNAL") && jsonData.SelectedPlanInfo.visionEmbededInd == "N") {
            this.showVisionServiceType = false;
         }

         //show Vision
         if ((jsonData.SelectedPlanInfo.Vision == "Internal" || jsonData.SelectedPlanInfo.Vision == "INTERNAL") && jsonData.SelectedPlanInfo.visionEmbededInd == "Y") {
            this.showVisionServiceType = true;
         }

         if (
            jsonData.SelectedPlanInfo.Vision != "Internal" &&
            jsonData.SelectedPlanInfo.Vision != "INTERNAL" &&
            jsonData.SelectedPlanInfo.Vision != "Not Applicable" &&
            jsonData.SelectedPlanInfo.Vision != "N/A" &&
            jsonData.SelectedPlanInfo.Vision != "NOT APPLICABLE" &&
            jsonData.SelectedPlanInfo.visionEmbededInd == "Y"
         ) {
            this.showVisionServiceType = true;
         }

         /**Hide MentalHealthSubstanceAbuse Service Type if it's Not Applicable OR N/A**/
         if (
            jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse == "Not Applicable" ||
            jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse == "N/A" ||
            jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse == "NOT APPLICABLE"
         ) {
            this.showMentalServiceType = false;
         } else {
            this.showMentalServiceType = true;
         }

         /**Hide Facility Service Type if it's Not Applicable OR N/A**/
         if (
            jsonData.SelectedPlanInfo.FacilityOrUrgentCare == "Not Applicable" ||
            jsonData.SelectedPlanInfo.FacilityOrUrgentCare == "N/A" ||
            jsonData.SelectedPlanInfo.FacilityOrUrgentCare == "NOT APPLICABLE"
         ) {
            this.showFacilityServiceType = false;
         } else {
            this.showFacilityServiceType = true;
         }

         /**Hide Chiropractor Service Type if it's Not Applicable OR N/A**/
         if (jsonData.SelectedPlanInfo.Chiropractic == "Not Applicable" || jsonData.SelectedPlanInfo.Chiropractic == "N/A" || jsonData.SelectedPlanInfo.Chiropractic == "NOT APPLICABLE") {
            this.showChiroServiceType = false;
         } else {
            this.showChiroServiceType = true;
         }

         /**Hide Lab Service Type if it's Not Applicable OR N/A**/
         if (jsonData.SelectedPlanInfo.Lab == "Not Applicable" || jsonData.SelectedPlanInfo.Lab == "N/A" || jsonData.SelectedPlanInfo.Lab == "NOT APPLICABLE") {
            this.showLabServiceType = false;
         } else {
            this.showLabServiceType = true;
         }

         /**Hide Pharmacy Service Type if it's Not Applicable OR N/A**/
         //hide Pharmacy
         if (
            (jsonData.SelectedPlanInfo.Pharmacy == "Not Applicable" || jsonData.SelectedPlanInfo.Pharmacy == "N/A" || jsonData.SelectedPlanInfo.Pharmacy == "NOT APPLICABLE") &&
            jsonData.SelectedPlanInfo.pharmacyEmbededInd == "Y"
         ) {
            this.showPharmacyServiceType = false;
         }

         if (
            (jsonData.SelectedPlanInfo.Pharmacy == "Not Applicable" || jsonData.SelectedPlanInfo.Pharmacy == "N/A" || jsonData.SelectedPlanInfo.Pharmacy == "NOT APPLICABLE") &&
            jsonData.SelectedPlanInfo.pharmacyEmbededInd == "N"
         ) {
            this.showPharmacyServiceType = false;
         }

         if ((jsonData.SelectedPlanInfo.Pharmacy == "Internal" || jsonData.SelectedPlanInfo.Pharmacy == "INTERNAL") && jsonData.SelectedPlanInfo.pharmacyEmbededInd == "N") {
            this.showPharmacyServiceType = false;
         }

         //show Pharmacy
         if ((jsonData.SelectedPlanInfo.Pharmacy == "Internal" || jsonData.SelectedPlanInfo.Pharmacy == "INTERNAL") && jsonData.SelectedPlanInfo.pharmacyEmbededInd == "Y") {
            this.showPharmacyServiceType = true;
         }

         if (
            jsonData.SelectedPlanInfo.Pharmacy != "Internal" &&
            jsonData.SelectedPlanInfo.Pharmacy != "INTERNAL" &&
            jsonData.SelectedPlanInfo.Pharmacy != "Not Applicable" &&
            jsonData.SelectedPlanInfo.Pharmacy != "N/A" &&
            jsonData.SelectedPlanInfo.Pharmacy != "NOT APPLICABLE" &&
            jsonData.SelectedPlanInfo.pharmacyEmbededInd == "Y"
         ) {
            this.showPharmacyServiceType = true;
         }

         // Hide Hearing Aid
         if (jsonData.SelectedPlanInfo.productBrandGrouping != "Medicare") {
            this.showHearingAidServiceType = false;
         }
      }

      this.loading = false;
   }

   radioServiceType(evt) {
      let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));

      if (evt) {
         let radio = evt.target.value;
         console.log("radio: ", radio);
         // let radio = evt.target.name;

         let optionsSelected = { STEP_ChooseServiceType: { radioServiceType: radio } };
         this.omniApplyCallResp(optionsSelected);

         /**Doctor ServiceType**/
         if (radio == "Doctor") {
            if (jsonData.SelectedPlanInfo.Doctor == "Internal" || jsonData.SelectedPlanInfo.Doctor == "INTERNAL") {
               let DoctorCard = { TXT_ServiceType: radio };
               this.omniApplyCallResp(DoctorCard);
               this.omniNextStep();
            }
         }

         /**PCP ServiceType**/
         if (radio == "PCP") {
            if (jsonData.SelectedPlanInfo.PrimaryCarePhysician == "Internal" || jsonData.SelectedPlanInfo.PrimaryCarePhysician == "INTERNAL") {
               let PCPCard = { TXT_ServiceType: radio };
               this.omniApplyCallResp(PCPCard);
               this.omniNextStep();
            }
         }

         /**Dental ServiceType**/
         if (radio == "Dental") {
            //Reset Indicators
            this.resetModalIndicators();

            if (jsonData.SelectedPlanInfo.productBrandGrouping == "Commercial") {
               this.isModalDental = true;
               this.isModalGlobal = true;
               this.provider = "Attentis Health";
            } else if (jsonData.SelectedPlanInfo.productBrandGrouping == "Medicare") {
               this.isModalDentalMedicare = true;
               this.isModalGlobal = true;
               this.provider = "Attentis Health";
            } else if (jsonData.tenantId == "Attentis") {
               this.isModalDentalOther = true;
               this.isModalGlobal = true;
            } else {
               if (jsonData.SelectedPlanInfo.Dental == "Internal" || jsonData.SelectedPlanInfo.Dental == "INTERNAL") {
                  let DentalCard = { TXT_ServiceType: radio };
                  this.omniApplyCallResp(DentalCard);
                  this.omniNextStep();
               } else if (
                  jsonData.SelectedPlanInfo.Dental != "Not Applicable" &&
                  jsonData.SelectedPlanInfo.Dental != "NOT APPLICABLE" &&
                  jsonData.SelectedPlanInfo.Dental != "N/A" &&
                  jsonData.SelectedPlanInfo.Dental != "Internal" &&
                  jsonData.SelectedPlanInfo.Dental != "INTERNAL" &&
                  jsonData.SelectedPlanInfo.productBrandGrouping == "Commercial"
               ) {
                  this.isModalDental = true;
                  this.isModalGlobal = true;
                  this.provider = "Attentis Health";
               } else if (
                  jsonData.SelectedPlanInfo.Dental != "Not Applicable" &&
                  jsonData.SelectedPlanInfo.Dental != "NOT APPLICABLE" &&
                  jsonData.SelectedPlanInfo.Dental != "N/A" &&
                  jsonData.SelectedPlanInfo.Dental != "Internal" &&
                  jsonData.SelectedPlanInfo.Dental != "INTERNAL" &&
                  jsonData.SelectedPlanInfo.productBrandGrouping == "Medicare"
               ) {
                  this.isModalDentalMedicare = true;
                  this.isModalGlobal = true;
                  this.provider = "Attentis Health";
               } else if (
                  jsonData.SelectedPlanInfo.Dental != "Not Applicable" &&
                  jsonData.SelectedPlanInfo.Dental != "NOT APPLICABLE" &&
                  jsonData.SelectedPlanInfo.Dental != "N/A" &&
                  jsonData.SelectedPlanInfo.Dental != "Internal" &&
                  jsonData.SelectedPlanInfo.Dental != "INTERNAL"
               ) {
                  this.isModalDentalOther = true;
                  this.isModalGlobal = true;
               }
            }

            this.dentalFocus = true;
            this.visionFocus = false;
            this.mentalHealthFocus = false;
            this.labFocus = false;
            this.pharmacyFocus = false;
         }

         /**Vision ServiceType**/
         if (radio == "Vision") {
            //Reset Indicators
            this.resetModalIndicators();

            if (jsonData.SelectedPlanInfo.Vision == "Internal" || jsonData.SelectedPlanInfo.Vision == "INTERNAL") {
               let VisionCard = { TXT_ServiceType: radio };
               this.omniApplyCallResp(VisionCard);
               this.omniNextStep();
            } else if (this.isAttentisSolo == true || this.isSmallGroup == true) {
               let VisionCard = { TXT_ServiceType: radio };
               this.omniApplyCallResp(VisionCard);
               this.omniNextStep();
            } else if (
               jsonData.SelectedPlanInfo.Vision != "Not Applicable" &&
               jsonData.SelectedPlanInfo.Vision != "NOT APPLICABLE" &&
               jsonData.SelectedPlanInfo.Vision != "N/A" &&
               jsonData.SelectedPlanInfo.Vision != "Internal" &&
               jsonData.SelectedPlanInfo.Vision != "INTERNAL" &&
               jsonData.SelectedPlanInfo.productBrandGrouping == "Commercial"
            ) {
               this.isModalVision = true;
               this.isModalGlobal = true;
               this.provider = "Attentis Health";
            } else if (
               jsonData.SelectedPlanInfo.Vision != "Not Applicable" &&
               jsonData.SelectedPlanInfo.Vision != "NOT APPLICABLE" &&
               jsonData.SelectedPlanInfo.Vision != "N/A" &&
               jsonData.SelectedPlanInfo.Vision != "Internal" &&
               jsonData.SelectedPlanInfo.Vision != "INTERNAL" &&
               jsonData.SelectedPlanInfo.productBrandGrouping == "Medicare"
            ) {
               this.isModalVisionMedicare = true;
               this.isModalGlobal = true;
               this.provider = "Attentis Health";
            } else if (
               jsonData.SelectedPlanInfo.Vision != "Not Applicable" &&
               jsonData.SelectedPlanInfo.Vision != "NOT APPLICABLE" &&
               jsonData.SelectedPlanInfo.Vision != "N/A" &&
               jsonData.SelectedPlanInfo.Vision != "Internal" &&
               jsonData.SelectedPlanInfo.Vision != "INTERNAL"
            ) {
               this.isModalVisionOther = true;
               this.isModalGlobal = true;
            }

            this.dentalFocus = false;
            this.visionFocus = true;
            this.mentalHealthFocus = false;
            this.labFocus = false;
            this.pharmacyFocus = false;
         }

         /**MentalHealth ServiceType**/
         if (radio == "MentalHealth") {
            //Reset Indicators
            this.resetModalIndicators();

            if (jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse == "Internal" || jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse == "INTERNAL") {
               let MentalCard = { TXT_ServiceType: radio };
               this.omniApplyCallResp(MentalCard);
               this.omniNextStep();
            } else if (
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "Not Applicable" &&
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "NOT APPLICABLE" &&
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "N/A" &&
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "Internal" &&
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "INTERNAL" &&
               jsonData.SelectedPlanInfo.productBrandGrouping == "Commercial"
            ) {
               this.isModalMentalHealthAttentisComm = true;
               this.isModalGlobal = true;
               this.provider = "Attentis Health";
            } else if (
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "Not Applicable" &&
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "NOT APPLICABLE" &&
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "N/A" &&
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "Internal" &&
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "INTERNAL" &&
               jsonData.SelectedPlanInfo.productBrandGrouping == "Medicare"
            ) {
               this.isModalMentalHealthAttentisMed = true;
               this.isModalGlobal = true;
               this.provider = "Attentis Health";
            } else if (
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "Not Applicable" &&
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "NOT APPLICABLE" &&
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "N/A" &&
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "Internal" &&
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "INTERNAL" &&
               jsonData.SelectedPlanInfo.productBrandGrouping == "Commercial"
            ) {
               this.isModalMentalHealthAttentisComm = true;
               this.isModalGlobal = true;
               this.provider = "Attentis Health";
            } else if (
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "Not Applicable" &&
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "NOT APPLICABLE" &&
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "N/A" &&
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "Internal" &&
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "INTERNAL" &&
               jsonData.SelectedPlanInfo.productBrandGrouping == "Medicare"
            ) {
               this.isModalMentalHealthAttentisMed = true;
               this.provider = "Attentis Health";
            } else if (
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "Not Applicable" &&
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "NOT APPLICABLE" &&
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "N/A" &&
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "Internal" &&
               jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse != "INTERNAL"
            ) {
               this.isModalMentalHealthOther = true;
               this.isModalGlobal = true;
            }

            this.dentalFocus = false;
            this.visionFocus = false;
            this.mentalHealthFocus = true;
            this.labFocus = false;
            this.pharmacyFocus = false;
         }

         /**Facility ServiceType**/
         if (radio == "Facility") {
            if (jsonData.SelectedPlanInfo.FacilityOrUrgentCare == "Internal" || jsonData.SelectedPlanInfo.FacilityOrUrgentCare == "INTERNAL") {
               let HospitalCard = { TXT_ServiceType: radio };
               this.omniApplyCallResp(HospitalCard);
               this.omniNextStep();
            }
         }

         /**Chiropractor ServiceType**/
         if (radio == "Chiropractor") {
            //Reset Indicators
            this.resetModalIndicators();

            if (jsonData.SelectedPlanInfo.Chiropractic == "Internal" || jsonData.SelectedPlanInfo.Chiropractic == "INTERNAL") {
               let ChiroCard = { TXT_ServiceType: radio };
               this.omniApplyCallResp(ChiroCard);
               this.omniNextStep();
            } else if (
               jsonData.SelectedPlanInfo.Chiropractic != "Not Applicable" &&
               jsonData.SelectedPlanInfo.Chiropractic != "NOT APPLICABLE" &&
               jsonData.SelectedPlanInfo.Chiropractic != "N/A" &&
               jsonData.SelectedPlanInfo.Chiropractic != "INTERNAL" &&
               jsonData.SelectedPlanInfo.Chiropractic != "Internal" &&
               jsonData.SelectedPlanInfo.productBrandGrouping == "Commercial"
            ) {
               this.isModalChiropractor = true;
               this.isModalGlobal = true;
               /*this.provider = jsonData.provider;*/
this.provider = "Attentis Health";
            } else if (
               jsonData.SelectedPlanInfo.Chiropractic != "Not Applicable" &&
               jsonData.SelectedPlanInfo.Chiropractic != "NOT APPLICABLE" &&
               jsonData.SelectedPlanInfo.Chiropractic != "N/A" &&
               jsonData.SelectedPlanInfo.Chiropractic != "INTERNAL" &&
               jsonData.SelectedPlanInfo.Chiropractic != "Internal" &&
               jsonData.SelectedPlanInfo.productBrandGrouping == "Medicare"
            ) {
               this.isModalChiropractorMedicare = true;
               this.isModalGlobal = true;
               /*this.provider = jsonData.provider;*/
this.provider = "Attentis Health";
            } else if (
               jsonData.SelectedPlanInfo.Chiropractic != "Not Applicable" &&
               jsonData.SelectedPlanInfo.Chiropractic != "NOT APPLICABLE" &&
               jsonData.SelectedPlanInfo.Chiropractic != "N/A" &&
               jsonData.SelectedPlanInfo.Chiropractic != "INTERNAL" &&
               jsonData.SelectedPlanInfo.Chiropractic != "Internal"
            ) {
               this.isModalChiropractorOther = true;
               this.isModalGlobal = true;
            }
         }

         /**Lab ServiceType**/
         if (radio == "lab") {
            //Reset Indicators
            this.resetModalIndicators();

            if (jsonData.SelectedPlanInfo.Lab == "Internal" || jsonData.SelectedPlanInfo.Lab == "INTERNAL") {
               let LabCard = { TXT_ServiceType: radio };
               this.omniApplyCallResp(LabCard);
               this.omniNextStep();
            } else if (
               jsonData.SelectedPlanInfo.Lab != "Not Applicable" &&
               jsonData.SelectedPlanInfo.Lab != "NOT APPLICABLE" &&
               jsonData.SelectedPlanInfo.Lab != "N/A" &&
               jsonData.SelectedPlanInfo.Lab != "Internal" &&
               jsonData.SelectedPlanInfo.Lab != "INTERNAL" &&
               jsonData.SelectedPlanInfo.productBrandGrouping == "Commercial"
            ) {
               this.isModalLab = true;
               this.isModalGlobal = true;
               /*this.provider = jsonData.provider;*/
this.provider = "Attentis Health";
            } else if (
               jsonData.SelectedPlanInfo.Lab != "Not Applicable" &&
               jsonData.SelectedPlanInfo.Lab != "NOT APPLICABLE" &&
               jsonData.SelectedPlanInfo.Lab != "N/A" &&
               jsonData.SelectedPlanInfo.Lab != "Internal" &&
               jsonData.SelectedPlanInfo.Lab != "INTERNAL" &&
               jsonData.SelectedPlanInfo.productBrandGrouping == "Medicare"
            ) {
               this.isModalLabMedicare = true;
               this.isModalGlobal = true;
               /*this.provider = jsonData.provider;*/
this.provider = "Attentis Health";
            } else if (
               jsonData.SelectedPlanInfo.Lab != "Not Applicable" &&
               jsonData.SelectedPlanInfo.Lab != "NOT APPLICABLE" &&
               jsonData.SelectedPlanInfo.Lab != "N/A" &&
               jsonData.SelectedPlanInfo.Lab != "Internal" &&
               jsonData.SelectedPlanInfo.Lab != "INTERNAL"
            ) {
               this.isModalLabOther = true;
               this.isModalGlobal = true;
            }

            this.dentalFocus = false;
            this.visionFocus = false;
            this.mentalHealthFocus = false;
            this.labFocus = true;
            this.pharmacyFocus = false;
         }

         /**Pharmacy ServiceType**/
         if (radio == "Pharmacy") {
            //Reset Indicators
            this.resetModalIndicators();

            if (
               jsonData.SelectedPlanInfo.Pharmacy != "Not Applicable" &&
               jsonData.SelectedPlanInfo.Pharmacy != "NOT APPLICABLE" &&
               jsonData.SelectedPlanInfo.Pharmacy != "N/A" &&
               jsonData.SelectedPlanInfo.Pharmacy != "Internal" &&
               jsonData.SelectedPlanInfo.Pharmacy != "INTERNAL" &&
               jsonData.SelectedPlanInfo.productBrandGrouping == "Commercial"
            ) {
               this.isModalGlobal = true;
               this.isModalPharmacy = true;
               this.provider = "Attentis Health";
            } else if (
               jsonData.SelectedPlanInfo.Pharmacy != "Not Applicable" &&
               jsonData.SelectedPlanInfo.Pharmacy != "NOT APPLICABLE" &&
               jsonData.SelectedPlanInfo.Pharmacy != "N/A" &&
               jsonData.SelectedPlanInfo.Pharmacy != "Internal" &&
               jsonData.SelectedPlanInfo.Pharmacy != "INTERNAL" &&
               jsonData.SelectedPlanInfo.productBrandGrouping == "Medicare"
            ) {
               this.isModalGlobal = true;
               this.isModalPharmacyMedicare = true;
               this.provider = "Attentis Health";
            } else if (
               jsonData.SelectedPlanInfo.Pharmacy != "Not Applicable" &&
               jsonData.SelectedPlanInfo.Pharmacy != "NOT APPLICABLE" &&
               jsonData.SelectedPlanInfo.Pharmacy != "N/A" &&
               jsonData.SelectedPlanInfo.Pharmacy != "Internal" &&
               jsonData.SelectedPlanInfo.Pharmacy != "INTERNAL"
            ) {
               this.isModalGlobal = true;
               this.isModalPharmacyOther = true;
            }
            this.dentalFocus = false;
            this.visionFocus = false;
            this.mentalHealthFocus = false;
            this.labFocus = false;
            this.pharmacyFocus = true;
         }

         /**VCP ServiceType**/
         if (radio == "VCP") {
            //Reset Indicators
            this.resetModalIndicators();

            let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
            if (jsonData.SelectedPlanInfo.productBrandGrouping == "Commercial") {
               this.isModalVCP = true;
               this.isModalGlobal = true;
               /*this.provider = jsonData.provider;*/
               this.provider = "Attentis Health";
            } else {
               this.isModalVCPMedicare = true;
               this.isModalGlobal = true;
               /*this.provider = jsonData.provider;*/
               this.provider = "Attentis Health";
            }
         }

         /**Hearing Aid ServiceType**/
         if (radio == "HearingAid") {
            //Reset Indicators
            this.resetModalIndicators();

            this.isModalHearingAidMedicare = true;
            this.isModalGlobal = true;
            /*this.provider = jsonData.provider;*/
            this.provider = "Attentis Health";
            // }
         }
         /**End service types**/
      }
   }

   renderedCallback() {
      var me = this;
      const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const modal = this.template.querySelector(".modalAccessibility");
      const serviceTypeAccess = this.template.querySelector(".serviceTypeCall");

      if (modal != undefined) {
         const firstFocusableElement = modal.querySelectorAll(focusableElements)[0]; // get first element to be focused inside modal
         const focusableContent = modal.querySelectorAll(focusableElements);
         const lastFocusableElement = focusableContent[focusableContent.length - 1]; // get last element to be focused inside modal

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

   resetModalIndicators() {
      this.isModalDental = false;
      this.isModalDentalMedicare = false;
      this.isModalDentalOther = false;
      this.isModalVision = false;
      this.isModalVisionMedicare = false;
      this.isModalVisionOther = false;
      this.isModalMentalHealthAttentisComm = false;
      this.isModalMentalHealthAttentisMed = false;
      this.isModalMentalHealthOther = false;
      this.isModalChiropractor = false;
      this.isModalChiropractorMedicare = false;
      this.isModalChiropractorOther = false;
      this.isModalLab = false;
      this.isModalLabMedicare = false;
      this.isModalLabOther = false;
      this.isModalPharmacy = false;
      this.isModalPharmacyMedicare = false;
      this.isModalPharmacyOther = false;
      this.isModalVCP = false;
      this.isModalVCPMedicare = false;
      this.isModalHearingAid = false;
      this.isModalHearingAidMedicare = false;
      this.isModalMedicareSupplement = false;
   }

   closeModal() {
      /**To close modal set Modal track value as false**/
      this.isModalGlobal = false;
      this.isModalDoctor = false;
      this.isModalPCP = false;

      // Accessibility
      if (this.dentalFocus == true) {
         let dentalFocusAcc = this.template.querySelector(".dentalFocusAcc");
         dentalFocusAcc.focus();
      } else if (this.visionFocus == true) {
         let visionFocusAcc = this.template.querySelector(".visionFocusAcc");
         visionFocusAcc.focus();
      } else if (this.mentalHealthFocus == true) {
         let mentalHealthFocusAcc = this.template.querySelector(".mentalHealthFocusAcc");
         mentalHealthFocusAcc.focus();
      } else if (this.labFocus == true) {
         let labFocusAcc = this.template.querySelector(".labFocusAcc");
         labFocusAcc.focus();
      } else if (this.pharmacyFocus == true) {
         let pharmacyFocusAcc = this.template.querySelector(".pharmacyFocusAcc");
         pharmacyFocusAcc.focus();
      } else {
         console.log("another card was selected");
      }
      this.resetModalIndicators();
   }

   navigateToDentalWebPage() {
      let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      let dentalWebPage = jsonData.SelectedPlanInfo.Dental;
      if (dentalWebPage) {
         window.open(dentalWebPage, "_blank");
         this.closeModal();
      }
   }

   navigateToVisionWebPage() {
      let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      let visionWebPage = jsonData.SelectedPlanInfo.Vision;
      if (visionWebPage) {
         window.open(visionWebPage, "_blank");
         this.closeModal();
      }
   }

   navigateToMentalWebPage() {
      let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      var mentalWebPage = jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse;

      if (mentalWebPage) {
         window.open(mentalWebPage, "_blank");
         this.closeModal();
      }
   }

   navigateToChiropractorWebPage() {
      let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      var chiropractorWebPage = jsonData.SelectedPlanInfo.Chiropractic;

      if (chiropractorWebPage) {
         window.open(chiropractorWebPage, "_blank");
         this.closeModal();
      }
   }

   navigateToPharmacyWebPage() {
      let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      var pharmacyWebPage = jsonData.SelectedPlanInfo.Pharmacy;
      if (pharmacyWebPage) {
         window.open(pharmacyWebPage, "_blank");
         this.closeModal();
      }
   }

   navigateToLabWebPage() {
      let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      var labWebPage = jsonData.SelectedPlanInfo.Lab;
      if (labWebPage) {
         window.open(labWebPage, "_blank");
         this.closeModal();
      }
   }

   navigateToVCPWebPage() {
      let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      var vcpWebPage = "https://attentisconsulting.com/";
      if (vcpWebPage) {
         window.open(vcpWebPage, "_blank");
         this.closeModal();
      }
   }

   navigateToHearingAidWebPage() {
      let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      var hearingAidWebPage = "https://attentisconsulting.com/";
      if (hearingAidWebPage) {
         window.open(hearingAidWebPage, "_blank");
         this.closeModal();
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

   openModalForMedSupp() {
      let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      this.isModalGlobal = true;
      this.isModalMedSupp = true;
      this.isModalMedicareSupplement = true;
      this.company = "Attentis Health";
   }

   navigateToMedicareGovPage() {
      var medicareGovPage = "https://www.medicare.gov/care-compare/";
      if (medicareGovPage) {
         window.open(medicareGovPage, "_blank");
         this.closeModal();
      }
   }
}
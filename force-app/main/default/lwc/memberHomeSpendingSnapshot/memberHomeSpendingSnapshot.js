import { LightningElement, api, track } from "lwc";
import { getDataHandler } from "omnistudio/utility";
import { NavigationMixin } from "lightning/navigation";
import { OmniscriptActionCommonUtil } from "omnistudio/omniscriptActionUtils";

export default class MemberHomeSpendingSnapshot extends NavigationMixin(LightningElement) {
   enableIPLog = false;
   activetabContent;
   defaultTab = "M";
   errorMessage = "Error --> No data returned from IP";
   _servicetypeinfo = [];
   hasDeductible = true;
   hasOOP = true;
   hasRendered = false;
   _memberId;
   _membersinplan = [];
   _userid;
   indInNtwkDedUpdated = false;
   _hfcLabel = "Healthcare Financial Summary";
   _hfcLabelAccessibility = "Healthcare financial summary link opens a modal";
   targettype = "standard__namedPage";
   targetname = "benefits";
   _label = "View All Spending";
   _iconPosition = "right";
   _iconName = "utility:chevronright";
   _variant = "base";
   _extraclass = "nds-is-absolute c-tabset-link-position c-fc-action-text nds-show_medium";
   targetparams;
   loading;
   brand;
   portalType;
   defaultPlan;
   medicalPlanId;
   dentalPlanId;
   visionPlanId;
   pharmacyPlanId;

   @track showMedFamilySpendingInfo = false;
   @track showDentFamilySpendingInfo = false;
   @track showVisionFamilySpendingInfo = false;
   @track showPharmFamilySpendingInfo = false;

   @track showMedGraph = true;
   @track showMedGraphInd = true;
   @track showMedGraphIndDeductible = true;
   @track showMedGraphIndOOPM = true;
   @track showMedGraphFam = true;
   @track showMedGraphFamDeductible = true;
   @track showMedGraphFamOOPM = true;

   @track showDentGraph = true;
   @track showDentGraphInd = true;
   @track showDentGraphIndDeductible = true;
   @track showDentGraphIndOOPM = true;
   @track showDentGraphFam = true;
   @track showDentGraphFamDeductible = true;
   @track showDentGraphFamOOPM = true;

   @track showVisionGraph = true;
   @track showVisionGraphInd = true;
   @track showVisionGraphIndDeductible = true;
   @track showVisionGraphIndOOPM = true;
   @track showVisionGraphFam = true;
   @track showVisionGraphFamDeductible = true;
   @track showVisionGraphFamOOPM = true;

   @track showPharmGraph = true;
   @track showPharmGraphInd = true;
   @track showPharmGraphIndDeductible = true;
   @track showPharmGraphIndOOPM = true;
   @track showPharmGraphFam = true;
   @track showPharmGraphFamDeductible = true;
   @track showPharmGraphFamOOPM = true;

   message = "Your plan does not have a deductible.";
   memberInfo;
   snapShotData = true;
   subscriberId;
   planId;
   status;
   planName;
   startDate;
   endDate;
   isFHS = false;
   isSubscriber = false;
   isHsa = false;
   showFamilySpending = true;
   hideIndividualData = false;
   benefitSpending = [];
   spendings = [];
   familySpendings = [];
   familyNetworkType = [];
   familyBothType = [];
   familyFinal = [];
   individualSpendings = [];
   individualNetworkType = [];
   individualBothType = [];
   individualFinal = [];
   individualOONetworkType = [];
   individualOONBothType = [];
   individualOONFinal = [];

   individualSpendings = [];
   familyProgress = 0;
   individualProgress = 0;
   individualProgressOON = 0;
   familySortSpendings = [];
   individualSpendingsOON = [];
   familySpendingsOON = [];
   familySpendingsBoth = [];
   individualSpendingsBoth = [];
   @track hasMedical = false;
   @track hasDental = false;
   @track hasVision = false;
   @track hasPharmacy = false;
   @track activeTabValue;
   @track medicalINDText = "Individual Spending";
   @track medicalFamilyText = "Family Spending";
   @track dentalINDText = "Individual Spending";
   @track dentalFamilyText = "Family Spending";
   @track visionINDText = "Individual Spending";
   @track visionFamilyText = "Family Spending";
   @track pharmacyINDText = "Individual Spending";
   @track pharmacyFamilyText = "Family Spending";
   @track showHSATextMedical = false;
   @track showHSATextDental = false;
   @track showHSATextVision = false;
   @track showHSATextPharmacy = false;
   @track showViewAllSpendingLink = true;

   @track indInNtwkDeductibleSpentMedical = "0.00";
   @track indInNtwkDeductibleTotalAmountMedical = "0.00";
   @track indInNtwkDeductibleRemainingMedical = "0.00";
   @track indOutNtwkDeductibleSpentMedical = "0.00";
   @track indOutNtwkDeductibleTotalAmountMedical = "0.00";
   @track indOutNtwkDeductibleRemainingMedical = "0.00";
   @track indInNtwkOutOfPocketMaxSpentMedical = "0.00";
   @track indInNtwkOutOfPocketMaxTotalAmountMedical = "0.00";
   @track indInNtwkOutOfPocketMaxRemainingMedical = "0.00";
   @track indOutNtwkOutOfPocketMaxSpentMedical = "0.00";
   @track indOutNtwkOutOfPocketMaxTotalAmountMedical = "0.00";
   @track indOutNtwkOutOfPocketMaxRemainingMedical = "0.00";
   @track famInNtwkDeductibleSpentMedical = "0.00";
   @track famInNtwkDeductibleTotalAmountMedical = "0.00";
   @track famInNtwkDeductibleRemainingMedical = "0.00";
   @track famOutNtwkDeductibleSpentMedical = "0.00";
   @track famOutNtwkDeductibleTotalAmountMedical = "0.00";
   @track famOutNtwkDeductibleRemainingMedical = "0.00";
   @track famInNtwkOutOfPocketMaxSpentMedical = "0.00";
   @track famInNtwkOutOfPocketMaxTotalAmountMedical = "0.00";
   @track famInNtwkOutOfPocketMaxRemainingMedical = "0.00";
   @track famOutNtwkOutOfPocketMaxSpentMedical = "0.00";
   @track famOutNtwkOutOfPocketMaxTotalAmountMedical = "0.00";
   @track famOutNtwkOutOfPocketMaxRemainingMedical = "0.00";
   @track indInNtwkDeductibleProgressMedical = "0.00";
   @track indInNtwkOutOfPocketMaxProgressMedical = "0.00";
   @track famInNtwkDeductibleProgressMedical = "0.00";
   @track famInNtwkOutOfPocketMaxProgressMedical = "0.00";

   @track indInNtwkDeductibleSpentDental = "0.00";
   @track indInNtwkDeductibleTotalAmountDental = "0.00";
   @track indInNtwkDeductibleRemainingDental = "0.00";
   @track indOutNtwkDeductibleSpentDental = "0.00";
   @track indOutNtwkDeductibleTotalAmountDental = "0.00";
   @track indOutNtwkDeductibleRemainingDental = "0.00";
   @track indInNtwkOutOfPocketMaxSpentDental = "0.00";
   @track indInNtwkOutOfPocketMaxTotalAmountDental = "0.00";
   @track indInNtwkOutOfPocketMaxRemainingDental = "0.00";
   @track indOutNtwkOutOfPocketMaxSpentDental = "0.00";
   @track indOutNtwkOutOfPocketMaxTotalAmountDental = "0.00";
   @track indOutNtwkOutOfPocketMaxRemainingDental = "0.00";
   @track famInNtwkDeductibleSpentDental = "0.00";
   @track famInNtwkDeductibleTotalAmountDental = "0.00";
   @track famInNtwkDeductibleRemainingDental = "0.00";
   @track famOutNtwkDeductibleSpentDental = "0.00";
   @track famOutNtwkDeductibleTotalAmountDental = "0.00";
   @track famOutNtwkDeductibleRemainingDental = "0.00";
   @track famInNtwkOutOfPocketMaxSpentDental = "0.00";
   @track famInNtwkOutOfPocketMaxTotalAmountDental = "0.00";
   @track famInNtwkOutOfPocketMaxRemainingDental = "0.00";
   @track famOutNtwkOutOfPocketMaxSpentDental = "0.00";
   @track famOutNtwkOutOfPocketMaxTotalAmountDental = "0.00";
   @track famOutNtwkOutOfPocketMaxRemainingDental = "0.00";
   @track indInNtwkDeductibleProgressDental = "0.00";
   @track indInNtwkOutOfPocketMaxProgressDental = "0.00";
   @track famInNtwkDeductibleProgressDental = "0.00";
   @track famInNtwkOutOfPocketMaxProgressDental = "0.00";

   @track indInNtwkDeductibleSpentVision = "0.00";
   @track indInNtwkDeductibleTotalAmountVision = "0.00";
   @track indInNtwkDeductibleRemainingVision = "0.00";
   @track indOutNtwkDeductibleSpentVision = "0.00";
   @track indOutNtwkDeductibleTotalAmountVision = "0.00";
   @track indOutNtwkDeductibleRemainingVision = "0.00";
   @track indInNtwkOutOfPocketMaxSpentVision = "0.00";
   @track indInNtwkOutOfPocketMaxTotalAmountVision = "0.00";
   @track indInNtwkOutOfPocketMaxRemainingVision = "0.00";
   @track indOutNtwkOutOfPocketMaxSpentVision = "0.00";
   @track indOutNtwkOutOfPocketMaxTotalAmountVision = "0.00";
   @track indOutNtwkOutOfPocketMaxRemainingVision = "0.00";
   @track famInNtwkDeductibleSpentVision = "0.00";
   @track famInNtwkDeductibleTotalAmountVision = "0.00";
   @track famInNtwkDeductibleRemainingVision = "0.00";
   @track famOutNtwkDeductibleSpentVision = "0.00";
   @track famOutNtwkDeductibleTotalAmountVision = "0.00";
   @track famOutNtwkDeductibleRemainingVision = "0.00";
   @track famInNtwkOutOfPocketMaxSpentVision = "0.00";
   @track famInNtwkOutOfPocketMaxTotalAmountVision = "0.00";
   @track famInNtwkOutOfPocketMaxRemainingVision = "0.00";
   @track famOutNtwkOutOfPocketMaxSpentVision = "0.00";
   @track famOutNtwkOutOfPocketMaxTotalAmountVision = "0.00";
   @track famOutNtwkOutOfPocketMaxRemainingVision = "0.00";
   @track indInNtwkDeductibleProgressVision = "0.00";
   @track indInNtwkOutOfPocketMaxProgressVision = "0.00";
   @track famInNtwkDeductibleProgressVision = "0.00";
   @track famInNtwkOutOfPocketMaxProgressVision = "0.00";

   @track indInNtwkDeductibleSpentPharmacy = "0.00";
   @track indInNtwkDeductibleTotalAmountPharmacy = "0.00";
   @track indInNtwkDeductibleRemainingPharmacy = "0.00";
   @track indOutNtwkDeductibleSpentPharmacy = "0.00";
   @track indOutNtwkDeductibleTotalAmountPharmacy = "0.00";
   @track indOutNtwkDeductibleRemainingPharmacy = "0.00";
   @track indInNtwkOutOfPocketMaxSpentPharmacy = "0.00";
   @track indInNtwkOutOfPocketMaxTotalAmountPharmacy = "0.00";
   @track indInNtwkOutOfPocketMaxRemainingPharmacy = "0.00";
   @track indOutNtwkOutOfPocketMaxSpentPharmacy = "0.00";
   @track indOutNtwkOutOfPocketMaxTotalAmountPharmacy = "0.00";
   @track indOutNtwkOutOfPocketMaxRemainingPharmacy = "0.00";
   @track famInNtwkDeductibleSpentPharmacy = "0.00";
   @track famInNtwkDeductibleTotalAmountPharmacy = "0.00";
   @track famInNtwkDeductibleRemainingPharmacy = "0.00";
   @track famOutNtwkDeductibleSpentPharmacy = "0.00";
   @track famOutNtwkDeductibleTotalAmountPharmacy = "0.00";
   @track famOutNtwkDeductibleRemainingPharmacy = "0.00";
   @track famInNtwkOutOfPocketMaxSpentPharmacy = "0.00";
   @track famInNtwkOutOfPocketMaxTotalAmountPharmacy = "0.00";
   @track famInNtwkOutOfPocketMaxRemainingPharmacy = "0.00";
   @track famOutNtwkOutOfPocketMaxSpentPharmacy = "0.00";
   @track famOutNtwkOutOfPocketMaxTotalAmountPharmacy = "0.00";
   @track famOutNtwkOutOfPocketMaxRemainingPharmacy = "0.00";
   @track indInNtwkDeductibleProgressPharmacy = "0.00";
   @track indInNtwkOutOfPocketMaxProgressPharmacy = "0.00";
   @track famInNtwkDeductibleProgressPharmacy = "0.00";
   @track famInNtwkOutOfPocketMaxProgressPharmacy = "0.00";

   isMedicare = false;
   isCommercial = false;
   isModalPharmacy = false;
   expressScriptsMembersLink = "https://www.express-scripts.com/";

   @api
   get memberinfo() {
      return this._memberInfo;
   }
   set memberinfo(val) {
      this.memberInfo = JSON.parse(JSON.stringify(val));
      this.subscriberId = this.memberInfo.subscriberId;
      this.brand = this.memberInfo.brand;
   }

   @api
   get memberid() {
      return this._memberId;
   }
   set memberid(val) {
      this._memberId = val;
   }

   @api
   get defaultplanhsa() {
      return this._defaultplanhsa;
   }
   set defaultplanhsa(val) {
      if (val === "Y") {
         this.isHsa = true;
      }
   }
   @api
   get subscriber() {
      return this._subscriber;
   }
   set subscriber(val) {
      if (val === "Y") {
         this.isSubscriber = true;
         this.isFHS = true;
      }
   }

   @api
   get servicetypeinfo() {
      return this._servicetypeinfo;
   }
   set servicetypeinfo(val) {
      this._servicetypeinfo = JSON.parse(JSON.stringify(val));
      this.getDefaultPlan();
   }
   @api
   get membersinplan() {
      return this._membersinplan;
   }
   set membersinplan(val) {
      this._membersinplan = JSON.parse(JSON.stringify(val));
   }

   @api
   get userid() {
      return this._userid;
   }
   set userid(val) {
      this._userid = JSON.parse(JSON.stringify(val));
   }

   connectedCallback() {
      this._actionUtilClass = new OmniscriptActionCommonUtil();
   }

   tabChangeHandler(event) {
      this.activetabContent = event.target.value;
      let activePlanId;
      switch (this.activetabContent) {
         case "Medical":
            activePlanId = this.medicalPlanId;
            this.showViewAllSpendingLink = true;
            break;
         case "Dental":
            activePlanId = this.dentalPlanId;
            this.showViewAllSpendingLink = true;
            break;
         case "Vision":
            activePlanId = this.visionPlanId;
            this.showViewAllSpendingLink = true;
            break;
         case "Pharmacy":
            activePlanId = this.pharmacyPlanId;
            this.showViewAllSpendingLink = false;
            break;
         default:
         // do nothing
      }
      this.buildTargetParam(activePlanId, this.activetabContent);
   }

   buildTargetParam(planId, planType) {
      //To pass parameters when user clicks the View All Spending link
      let params = {
         planId: planId,
         status: this.status,
         effectiveDate: this.startDate,
         dateText: this.startDate,
         subscriberId: this.subscriberId,
         selectedMemberId: this._memberId,
         planName: this.planName,
         tab: planType === "Dental" ? "cost share" : "spending",
         terminationDate: this.endDate,
         portalType: this.brand,
         statusText: this.status,
      };
      this.targetparams = JSON.stringify(params);
   }

   showSpendingCard(spending, planType) {
      if (spending.coverageLevel === "FAMILY") {
         if (planType === "Medical") {
            this.showMedGraph = true;
            this.showMedGraphFam = true;
         } else if (planType === "Dental") {
            this.showDentGraph = true;
            this.showDentGraphFam = true;
         } else if (planType === "Vision") {
            this.showVisionGraph = true;
            this.showVisionGraphFam = true;
         } else if (planType === "Pharmacy") {
            this.showPharmGraph = true;
            this.showPharmGraphFam = true;
         }
      } else if (spending.coverageLevel === "INDIVIDUAL") {
         if (planType === "Medical") {
            this.showMedGraph = true;
            this.showMedGraphInd = true;
         } else if (planType === "Dental") {
            this.showDentGraph = true;
            this.showDentGraphInd = true;
         } else if (planType === "Vision") {
            this.showVisionGraph = true;
            this.showVisionGraphInd = true;
         } else if (planType === "Pharmacy") {
            this.showPharmGraph = true;
            this.showPharmGraphInd = true;
         }
      }
   }

   hideSpendingCard(planType) {
      if (planType === "Medical") {
         this.showMedGraph = false;
         this.showMedGraphInd = false;
         this.showMedGraphFam = false;
         this.showMedFamilySpendingInfo = false;
      } else if (planType === "Dental") {
         this.showDentGraph = false;
         this.showDentGraphInd = false;
         this.showDentGraphFam = false;
         this.showDentFamilySpendingInfo = false;
      } else if (planType === "Vision") {
         this.showVisionGraph = false;
         this.showVisionGraphInd = false;
         this.showVisionGraphFam = false;
         this.showVisionFamilySpendingInfo = false;
      } else if (planType === "Pharmacy") {
         this.showPharmGraph = false;
         this.showPharmGraphInd = false;
         this.showPharmGraphFam = false;
         this.showPharmFamilySpendingInfo = false;
      }
   }

   callDataHandler(ipMethod, inputMap) {
      this.IPCallCount++;
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
      console.log('planType', planType);
      /****************************************************************************
         MPV-2618 It will pick up one plan based on sequence at below.
            1. Find Active 
                  (always one plan per type if it exist), If not found, go next.
            2. Find Terminated within 18 months 
                  (if multiple, use latest terminated date), If not found, go next.
            3. Find Future Active 
                  (always one per type or only handle one if it exist), If not found, go next.
            4. Find Pre-Effectuated 
                  (only one per type or only handle one per type if it exist)
      *****************************************************************************/
      let defaultPlan;
      let activePlan = [];
      let terminatedPlan = [];
      let futureActivePlan = [];
      let preEffectivePlan = [];

      let plans = this._servicetypeinfo.filter((plan) => plan.productCategory === planType);
      if (plans.length > 0) {
         //Look for Active
         activePlan = plans.filter((plan) => plan.status === "Active");
         if (activePlan.length > 0) {
            //Active Found
            defaultPlan = activePlan[0];
         } else {
            //Look for Terminated within 18 months - if multiple, use latest terminated date
            let currentDate = new Date();
            let date18MonthsAgo = new Date();
            date18MonthsAgo.setMonth(date18MonthsAgo.getMonth() - 18);
            /*
            terminatedPlan = plans.filter(
               (plan) => plan.status === "Terminated" && new Date(plan.eligibilityTerminationDate) >= date18MonthsAgo && new Date(plan.eligibilityTerminationDate) <= currentDate
            );
            */
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

   getDefaultPlan() {
      var ipMethod = "Member_BenefitSpending";
      var planType;
      if (this._memberId && Array.isArray(this._servicetypeinfo) === true && this._servicetypeinfo.length > 0) {
         //Do not show Family Spending Info if there is no dependent.
         if (this._membersinplan.length === 1) {
            this.showMedFamilySpendingInfo = false;
            this.showDentFamilySpendingInfo = false;
            this.showVisionFamilySpendingInfo = false;
            this.showPharmFamilySpendingInfo = false;
         }
         /*************** Check if there is Medical Plan **************/
         planType = "Medical";
         let medicalPlan = this.findDefaultPlan(planType);
         

         if (medicalPlan) {
            this.hasMedical = true;
            if (medicalPlan.networkCode == "2T03" || medicalPlan.networkCode == "2T02") {
               this.medicalINDText = "Individual Spending (Preferred)";
               this.medicalFamilyText = "Family Spending (Preferred)";
            }
            if (medicalPlan.hsa == "Y") {
               this.showHSATextMedical = true;
            }
            this.defaultPlan = "Medical";
            this.medicalPlanId = medicalPlan.planId;

            let inputParamMedical = { memberId: this._memberId, planId: medicalPlan.planId, eligibilityEffectiveDate: medicalPlan.eligibilityEffectiveDate };
            this.callIP(ipMethod, inputParamMedical)
               .then((response) => {
                  console.log('response', response);
                  if (response.result.IPResult) {
                     if (response.result.IPResult.noRecordFound === true) {
                        this.hideSpendingCard(medicalPlan.productCategory);
                        console.error(`${this.errorMessage} ${ipMethod}. IP works for ${medicalPlan.planId}, but no records found`);
                     } else {
                        this.benefitSpending = response.result.IPResult.benefitSpending;
                        if (this.benefitSpending) {
                           this.benefitSpending.forEach((spending) => {
                              this.showSpendingCard(spending, medicalPlan.productCategory);

                              let coverageLevel = spending.coverageLevel;
                              let accumulatorType = spending.accumulatorType;
                              let coverageType = spending.coverageType;
                              let spent = spending.spent;
                              let remaining = spending.remaining;
                              let totalAmount = spending.totalAmount;

                              if (coverageLevel == "INDIVIDUAL" && (accumulatorType == "In Network" || accumulatorType == "both") && coverageType == "DEDUCTIBLE") {
                                 this.indInNtwkDeductibleSpentMedical = spent;
                                 this.indInNtwkDeductibleTotalAmountMedical = totalAmount;
                                 this.indInNtwkDeductibleRemainingMedical = remaining;
                                 this.indInNtwkDeductibleProgressMedical = (spent * 100) / totalAmount;
                              } else if (coverageLevel == "INDIVIDUAL" && (accumulatorType == "Out of Network" || accumulatorType == "both") && coverageType == "DEDUCTIBLE") {
                                 this.indOutNtwkDeductibleSpentMedical = spending.spent;
                                 this.indOutNtwkDeductibleTotalAmountMedical = spending.totalAmount;
                                 this.indOutNtwkDeductibleRemainingMedical = spending.remaining;
                              } else if (coverageLevel == "INDIVIDUAL" && (accumulatorType == "In Network" || accumulatorType == "both") && coverageType == "OUT-OF-POCKET MAXIMUM") {
                                 this.indInNtwkOutOfPocketMaxSpentMedical = spent;
                                 this.indInNtwkOutOfPocketMaxTotalAmountMedical = totalAmount;
                                 this.indInNtwkOutOfPocketMaxRemainingMedical = remaining;
                                 this.indInNtwkOutOfPocketMaxProgressMedical = (spent * 100) / totalAmount;
                              } else if (coverageLevel == "INDIVIDUAL" && (accumulatorType == "Out of Network" || accumulatorType == "both") && coverageType == "OUT-OF-POCKET MAXIMUM") {
                                 this.indOutNtwkOutOfPocketMaxSpentMedical = spent;
                                 this.indOutNtwkOutOfPocketMaxTotalAmountMedical = totalAmount;
                                 this.indOutNtwkOutOfPocketMaxRemainingMedical = remaining;
                              } else if (coverageLevel == "FAMILY" && (accumulatorType == "In Network" || accumulatorType == "both") && coverageType == "DEDUCTIBLE") {
                                 this.famInNtwkDeductibleSpentMedical = spent;
                                 this.famInNtwkDeductibleTotalAmountMedical = totalAmount;
                                 this.famInNtwkDeductibleRemainingMedical = remaining;
                                 this.famInNtwkDeductibleProgressMedical = (spent * 100) / totalAmount;
                              } else if (coverageLevel == "FAMILY" && (accumulatorType == "Out of Network" || accumulatorType == "both") && coverageType == "DEDUCTIBLE") {
                                 this.famOutNtwkDeductibleSpentMedical = spent;
                                 this.famOutNtwkDeductibleTotalAmountMedical = totalAmount;
                                 this.famOutNtwkDeductibleRemainingMedical = remaining;
                              } else if (coverageLevel == "FAMILY" && (accumulatorType == "In Network" || accumulatorType == "both") && coverageType == "OUT-OF-POCKET MAXIMUM") {
                                 this.showMedGraphFam = true;
                                 this.famInNtwkOutOfPocketMaxSpentMedical = spent;
                                 this.famInNtwkOutOfPocketMaxTotalAmountMedical = totalAmount;
                                 this.famInNtwkOutOfPocketMaxRemainingMedical = remaining;
                                 this.famInNtwkOutOfPocketMaxProgressMedical = (spent * 100) / totalAmount;
                              } else if (coverageLevel == "FAMILY" && (accumulatorType == "Out of Network" || accumulatorType == "both") && coverageType == "OUT-OF-POCKET MAXIMUM") {
                                 this.famOutNtwkOutOfPocketMaxSpentMedical = spent;
                                 this.famOutNtwkOutOfPocketMaxTotalAmountMedical = totalAmount;
                                 this.famOutNtwkOutOfPocketMaxRemainingMedical = remaining;
                              }
                           });

                           // MPV-1684
                           // As long as the totalamount is less than 1, Suppress that graphic and show the message as per Devina Srinivasan
                           this.showMedGraphIndDeductible = parseInt(this.indInNtwkDeductibleTotalAmountMedical, 10) < 1 ? false : true;
                           this.showMedGraphIndOOPM = parseInt(this.indInNtwkOutOfPocketMaxTotalAmountMedical, 10) < 1 ? false : true;
                           this.showMedGraphFamDeductible = parseInt(this.famInNtwkDeductibleTotalAmountMedical, 10) < 1 ? false : true;
                           this.showMedGraphFamOOPM = parseInt(this.famInNtwkOutOfPocketMaxTotalAmountMedical, 10) < 1 ? false : true;

                           if (this.showMedGraphFamDeductible || this.showMedGraphFamOOPM) {
                              this.showMedFamilySpendingInfo = true;
                           } else {
                              this.showMedFamilySpendingInfo = false;
                           }
                        }
                     }
                  } else {
                     this.hideSpendingCard(medicalPlan.productCategory);
                     console.error(`${this.errorMessage} ${ipMethod} - ${planType}`);
                  }
               })
               .catch((error) => {
                  this.hideSpendingCard(medicalPlan.productCategory);
                  console.error(`Error in ${ipMethod} - ${planType} : `, error);
               });
         }
         /*************** Check if there is Dental Plan **************/
         planType = "Dental";
         let dentalPlan = this.findDefaultPlan(planType);
         if (dentalPlan) {
            this.hasDental = true;
            if (dentalPlan.networkCode == "2T03" || dentalPlan.networkCode == "2T02") {
               this.dentalINDText = "Individual Spending (Preferred)";
               this.dentalFamilyText = "Family Spending (Preferred)";
            }
            if (dentalPlan.hsa == "Y") {
               this.showHSATextDental = true;
            }
            this.dentalPlanId = dentalPlan.planId;
            if (!this.medicalPlanId) {
               this.defaultPlan = "Dental";
            }

            let inputParamDental = { memberId: this._memberId, planId: dentalPlan.planId, eligibilityEffectiveDate: dentalPlan.eligibilityEffectiveDate };
            this.callIP(ipMethod, inputParamDental)
               .then((response) => {
                  if (response.result.IPResult) {
                     if (response.result.IPResult.noRecordFound === true) {
                        this.hideSpendingCard(dentalPlan.productCategory);
                        console.error(`${this.errorMessage} ${ipMethod}. IP works for ${dentalPlan.planId}, but no records found`);
                     } else {
                        this.benefitSpending = response.result.IPResult.benefitSpending;
                        if (this.benefitSpending) {
                           this.benefitSpending.forEach((spending) => {
                              this.showSpendingCard(spending, dentalPlan.productCategory);

                              let coverageLevel = spending.coverageLevel;
                              let accumulatorType = spending.accumulatorType;
                              let coverageType = spending.coverageType;
                              let spent = spending.spent;
                              let remaining = spending.remaining;
                              let totalAmount = spending.totalAmount;

                              if (coverageLevel == "INDIVIDUAL" && (accumulatorType == "In Network" || accumulatorType == "both") && coverageType.includes("Annual Maximum")) {
                                 this.indInNtwkDeductibleSpentDental = spent;
                                 this.indInNtwkDeductibleTotalAmountDental = totalAmount;
                                 this.indInNtwkDeductibleRemainingDental = remaining;
                                 this.indInNtwkDeductibleProgressDental = (spent * 100) / totalAmount;
                              } else if (coverageLevel == "INDIVIDUAL" && (accumulatorType == "Out of Network" || accumulatorType == "both") && coverageType.includes("Annual Maximum")) {
                                 this.indOutNtwkDeductibleSpentDental = spent;
                                 this.indOutNtwkDeductibleTotalAmountDental = totalAmount;
                                 this.indOutNtwkDeductibleRemainingDental = remaining;
                              } else if (coverageLevel == "INDIVIDUAL" && (accumulatorType == "In Network" || accumulatorType == "both") && coverageType.includes("Lifetime Maximum")) {
                                 this.indInNtwkOutOfPocketMaxSpentDental = spent;
                                 this.indInNtwkOutOfPocketMaxTotalAmountDental = totalAmount;
                                 this.indInNtwkOutOfPocketMaxRemainingDental = remaining;
                                 this.indInNtwkOutOfPocketMaxProgressDental = (spent * 100) / totalAmount;
                              } else if (coverageLevel == "INDIVIDUAL" && (accumulatorType == "Out of Network" || accumulatorType == "both") && coverageType.includes("Lifetime Maximum")) {
                                 this.indOutNtwkOutOfPocketMaxSpentDental = spent;
                                 this.indOutNtwkOutOfPocketMaxTotalAmountDental = totalAmount;
                                 this.indOutNtwkOutOfPocketMaxRemainingDental = remaining;
                              } else if (coverageLevel == "FAMILY" && (accumulatorType == "In Network" || accumulatorType == "both") && coverageType.includes("Annual Maximum")) {
                                 this.famInNtwkDeductibleSpentDental = spent;
                                 this.famInNtwkDeductibleTotalAmountDental = totalAmount;
                                 this.famInNtwkDeductibleRemainingDental = remaining;
                                 this.famInNtwkDeductibleProgressDental = (spent * 100) / totalAmount;
                              } else if (coverageLevel == "FAMILY" && (accumulatorType == "Out of Network" || accumulatorType == "both") && coverageType.includes("Annual Maximum")) {
                                 this.famOutNtwkDeductibleSpentDental = spent;
                                 this.famOutNtwkDeductibleTotalAmountDental = totalAmount;
                                 this.famOutNtwkDeductibleRemainingDental = remaining;
                              } else if (coverageLevel == "FAMILY" && (accumulatorType == "In Network" || accumulatorType == "both") && coverageType.includes("Lifetime Maximum")) {
                                 this.famInNtwkOutOfPocketMaxSpentDental = spent;
                                 this.famInNtwkOutOfPocketMaxTotalAmountDental = totalAmount;
                                 this.famInNtwkOutOfPocketMaxRemainingDental = remaining;
                                 this.famInNtwkOutOfPocketMaxProgressDental = (spent * 100) / totalAmount;
                              } else if (coverageLevel == "FAMILY" && (accumulatorType == "Out of Network" || accumulatorType == "both") && coverageType.includes("Lifetime Maximum")) {
                                 this.famOutNtwkOutOfPocketMaxSpentDental = spent;
                                 this.famOutNtwkOutOfPocketMaxTotalAmountDental = totalAmount;
                                 this.famOutNtwkOutOfPocketMaxRemainingDental = remaining;
                              }
                           });
                           // MPV-2128
                           // Unlike MPV-1684, As long as the totalamount is less than 1, Suppress that graphic for both Annual Maximum and Lifetime Maximum
                           this.showDentGraphIndDeductible = parseInt(this.indInNtwkDeductibleTotalAmountDental, 10) < 1 ? false : true;
                           this.showDentGraphIndOOPM = parseInt(this.indInNtwkOutOfPocketMaxTotalAmountDental, 10) < 1 ? false : true;
                           this.showDentGraphFamDeductible = parseInt(this.famInNtwkDeductibleTotalAmountDental, 10) < 1 ? false : true;
                           this.showDentGraphFamOOPM = parseInt(this.famInNtwkOutOfPocketMaxTotalAmountDental, 10) < 1 ? false : true;

                           if (this.showDentGraphFamDeductible || this.showDentGraphFamOOPM) {
                              this.showDentFamilySpendingInfo = true;
                           } else {
                              this.showDentFamilySpendingInfo = false;
                           }
                        }
                     }
                  } else {
                     this.hideSpendingCard(dentalPlan.productCategory);
                     console.error(`${this.errorMessage} ${ipMethod} - ${planType}`);
                  }
               })
               .catch((error) => {
                  this.hideSpendingCard(dentalPlan.productCategory);
                  console.error(`Error in ${ipMethod} - ${planType} : `, error);
               });
         }

         /*************** Check if there is Vision Plan **************/
         planType = "Vision";
         let visionPlan = this.findDefaultPlan("Vision");

         if (visionPlan) {
            this.hasVision = true;
            if (visionPlan.networkCode == "2T03" || visionPlan.networkCode == "2T02") {
               this.visionINDText = "Individual Spending (Preferred)";
               this.visionFamilyText = "Family Spending (Preferred)";
            }
            if (visionPlan.hsa == "Y") {
               this.showHSATextVision = true;
            }
            this.visionPlanId = visionPlan.planId;
            if (!this.dentalPlanId) {
               this.defaultPlan = "Vision";
            }

            let inputParamVision = { memberId: this._memberId, planId: visionPlan.planId, eligibilityEffectiveDate: visionPlan.eligibilityEffectiveDate };
            this.callIP(ipMethod, inputParamVision)
               .then((response) => {
                  if (response.result.IPResult) {
                     if (response.result.IPResult.noRecordFound === true) {
                        this.hideSpendingCard(visionPlan.productCategory);
                        console.error(`${this.errorMessage} Member_BenefitSpending. IP works for ${visionPlan.planId}, but no records found`);
                     } else {
                        this.benefitSpending = response.result.IPResult.benefitSpending;
                        if (this.benefitSpending) {
                           this.benefitSpending.forEach((spending) => {
                              this.showSpendingCard(spending, visionPlan.productCategory);
                              this.showVisionGraph = false;

                              let coverageLevel = spending.coverageLevel;
                              let accumulatorType = spending.accumulatorType;
                              let coverageType = spending.coverageType;
                              let spent = spending.spent;
                              let remaining = spending.remaining;
                              let totalAmount = spending.totalAmount;

                              if (coverageLevel == "INDIVIDUAL" && accumulatorType == "In Network" && coverageType == "DEDUCTIBLE") {
                                 this.indInNtwkDeductibleSpentVision = spent;
                                 this.indInNtwkDeductibleTotalAmountVision = totalAmount;
                                 this.indInNtwkDeductibleRemainingVision = remaining;
                                 this.indInNtwkDeductibleProgressVision = (spent * 100) / totalAmount;
                              } else if (coverageLevel == "INDIVIDUAL" && accumulatorType == "Out of Network" && coverageType == "DEDUCTIBLE") {
                                 this.indOutNtwkDeductibleSpentVision = spent;
                                 this.indOutNtwkDeductibleTotalAmountVision = totalAmount;
                                 this.indOutNtwkDeductibleRemainingVision = remaining;
                              } else if (coverageLevel == "INDIVIDUAL" && accumulatorType == "In Network" && coverageType == "OUT-OF-POCKET MAXIMUM") {
                                 this.indInNtwkOutOfPocketMaxSpentVision = spent;
                                 this.indInNtwkOutOfPocketMaxTotalAmountVision = totalAmount;
                                 this.indInNtwkOutOfPocketMaxRemainingVision = remaining;
                                 this.indInNtwkOutOfPocketMaxProgressVision = (spent * 100) / totalAmount;
                              } else if (coverageLevel == "INDIVIDUAL" && accumulatorType == "Out of Network" && coverageType == "OUT-OF-POCKET MAXIMUM") {
                                 this.indOutNtwkOutOfPocketMaxSpentVision = spent;
                                 this.indOutNtwkOutOfPocketMaxTotalAmountVision = totalAmount;
                                 this.indOutNtwkOutOfPocketMaxRemainingVision = remaining;
                              } else if (coverageLevel == "FAMILY" && accumulatorType == "In Network" && coverageType == "DEDUCTIBLE") {
                                 this.famInNtwkDeductibleSpentVision = spent;
                                 this.famInNtwkDeductibleTotalAmountVision = totalAmount;
                                 this.famInNtwkDeductibleRemainingVision = remaining;
                                 this.famInNtwkDeductibleProgressVision = (spent * 100) / totalAmount;
                              } else if (coverageLevel == "FAMILY" && accumulatorType == "Out of Network" && coverageType == "DEDUCTIBLE") {
                                 this.famOutNtwkDeductibleSpentVision = spent;
                                 this.famOutNtwkDeductibleTotalAmountVision = totalAmount;
                                 this.famOutNtwkDeductibleRemainingVision = remaining;
                              } else if (coverageLevel == "FAMILY" && accumulatorType == "In Network" && coverageType == "OUT-OF-POCKET MAXIMUM") {
                                 this.famInNtwkOutOfPocketMaxSpentVision = spent;
                                 this.famInNtwkOutOfPocketMaxTotalAmountVision = totalAmount;
                                 this.famInNtwkOutOfPocketMaxRemainingVision = remaining;
                                 this.famInNtwkOutOfPocketMaxProgressVision = (spent * 100) / totalAmount;
                              } else if (coverageLevel == "FAMILY" && accumulatorType == "Out of Network" && coverageType == "OUT-OF-POCKET MAXIMUM") {
                                 this.famOutNtwkOutOfPocketMaxSpentVision = spent;
                                 this.famOutNtwkOutOfPocketMaxTotalAmountVision = totalAmount;
                                 this.famOutNtwkOutOfPocketMaxRemainingVision = remaining;
                              }
                           });
                           // MPV-1684
                           // As long as the totalamount is less than 1, Suppress that graphic and show the message as per Devina Srinivasan
                           this.showVisionGraphIndDeductible = parseInt(this.indInNtwkDeductibleTotalAmountVision, 10) < 1 ? false : true;
                           this.showVisionGraphIndOOPM = parseInt(this.indInNtwkOutOfPocketMaxTotalAmountVision, 10) < 1 ? false : true;
                           this.showVisionGraphFamDeductible = parseInt(this.famInNtwkDeductibleTotalAmountVision, 10) < 1 ? false : true;
                           this.showVisionGraphFamOOPM = parseInt(this.famInNtwkOutOfPocketMaxTotalAmountVision, 10) < 1 ? false : true;

                           if (this.showVisionGraphFamDeductible && this.showVisionGraphFamOOPM) {
                              this.showVisionFamilySpendingInfo = true;
                           } else {
                              this.showVisionFamilySpendingInfo = false;
                           }
                        }
                     }
                  } else {
                     this.hideSpendingCard(visionPlan.productCategory);
                     console.error(`${this.errorMessage} ${ipMethod} - ${planType}`);
                  }
               })
               .catch((error) => {
                  this.hideSpendingCard(visionPlan.productCategory);
                  console.error(`Error in ${ipMethod} - ${planType} : `, error);
               });
         }

         /*************** Check if there is Pharmacy Plan **************/
         planType = "Pharmacy";
         let pharmacyPlan = this.findDefaultPlan(planType);

         if (pharmacyPlan) {
            this.planName = pharmacyPlan.planName;
            this.hasPharmacy = true;

            if (pharmacyPlan.networkCode == "2T03" || pharmacyPlan.networkCode == "2T02") {
               this.pharmacyINDText = "Individual Spending (Preferred)";
               this.pharmacyFamilyText = "Family Spending (Preferred)";
            }

            if (pharmacyPlan.hsa == "Y") {
               this.showHSATextPharmacy = true;
            }

            this.pharmacyPlanId = pharmacyPlan.planId;
            if (!this.visionPlanId) {
               this.defaultPlan = "Pharmacy";
            }

            if (pharmacyPlan.productBrandGrouping == "Medicare") {
               this.isMedicare = true;
            } else if (pharmacyPlan.productBrandGrouping == "Commercial") {
               this.isCommercial = true;
            }
         }
      }
   }

   navigateToSpending(event) {
      this[NavigationMixin.Navigate]({
         type: "standard__namedPage",
         attributes: {
            pageName: "benefit-details",
            memberId: this._memberId,
         },
      });
   }

   openPharmacyModal() {
      this.isModalPharmacy = true;
   }

   closeModal() {
      this.isModalPharmacy = false;
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
      this.portalType = "Attentis";
   }

   ssoLink() {
      let inputParam = {
         ssoName: "ExpressScripts Attentis",
      };
      this.identifyPortal();
      this.callDataHandler("Member_SSOURL", inputParam).then((data) => {
         if (data) {
            let url = data.IPResult.ssoURL;
            window.open(url, "_blank");
         }
      });
      this.closeModal();
   }

   renderedCallback() {
      if (this.benefitSpending.length > 0 && !this.hasRendered) {
         if (this.benefitSpending.filter((rec) => rec.coverageType.includes("DEDUCTIBLE") || rec.coverageType.includes("Deductible")).length > 0) {
            this.hasDeductible = true;
         } else {
            this.hasDeductible = false;
         }
         if (this.benefitSpending.filter((rec) => rec.coverageType.includes("OUT-OF-POCKET MAXIMUM") || rec.coverageType.includes("Annual Maximum")).length > 0) {
            this.hasOOP = true;
         } else {
            this.hasOOP = false;
         }
         this.hasRendered = true;
      }
   }
}
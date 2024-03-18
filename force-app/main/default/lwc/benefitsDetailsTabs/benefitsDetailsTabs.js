import pubsub from "omnistudio/pubsub";
import { getDataHandler } from "omnistudio/utility";
import { LightningElement, track, api } from "lwc";

export default class BenefitsDetailsTabs extends LightningElement {
   @track showFamilyGraphContainer = false;
   @track showIndiGraphContainer = false;
   @track showPharmacySpendingInfo = false;
   @track lastTab;

   //Button focus
   @track stateFocus = false;
   @track loading = true;
   @track _memberId;
   @track _userId;
   @track _planId;
   @track _planName;
   @track _status;
   @track _brand;
   @track _planType;
   @track _memberStatus;
   @track _tab;
   @track _effectiveDate;
   @track _terminationDate;
   @track hasRendered = true;
   @track benefitUseLink = true;
   @track showBenefitUseTab = true;
   @track loggedInMemId;
   @track getInfoCalled = true;
   @track lobId;
   @track lobMarketSegment;
   @track dentalEmbededInd;
   @track pharmacyEmbededInd;
   @track visionEmbededInd;
   @track productBrandGrouping;

   //MPV-2637
   isMedicare = false;
   isCommercial = false;
   isModalPharmacy = false;
   expressScriptsMembersLink = "https://www.express-scripts.com/";
   portalType = 'Attentis';

   callMAP;
   callBenDetail;
   noCostShareData;
   errorMessage = "Error --> No data returned from IP";

   @track permGranted = [];
   @track under18 = [];
   @track benefitDetailRecord = [];
   @track benefitUseRecord = [];
   @track benefitSpendingRecord = [];
   @track benefitDetailArr = [];
   @track toothHistoryRecords = [];

   // Med Supp
   @track basicBenefits = [];
   @track additionalBenefits = [];

   @track familySpendings = [];
   @track familyNetworkType = [];
   @track familyBothType = [];
   @track familyFinal = [];
   @track familyOONetworkType = [];
   @track familyOONBothType = [];
   @track familyOONFinal = [];
   @track individualNetworkType = [];
   @track individualBothType = [];
   @track individualFinal = [];
   @track individualOONetworkType = [];
   @track individualOONBothType = [];
   @track individualOONFinal = [];

   @track individualSpendings = [];
   @track familyProgress = 0;
   @track individualProgress = 0;
   @track individualProgressOON = 0;
   @track familySortSpendings = [];
   @track individualSpendingsOON = [];
   @track familySpendingsOON = [];
   @track familySpendingsBoth = [];
   @track individualSpendingsBoth = [];

   //reduce IP calls
   activePlanCalled = false;
   grantAccessCalled = false;
   spendingCalled = false;
   planDetailsCalled = false;

   networkLabelFamily;
   networkLabelIndividual;
   toothIPcalled = false;
   hasToothRecords = false;

   inNetworkFamily = false;
   outNetoworkFamily = false;

   inNetworkIndividual = false;
   outNetoworkIndividual = false;

   hideOONButton = false;

   showOutOfNetworkButtonIndividual = false;
   showOutOfNetworkButtonFamily = false;
   showFamilySpending = false;

   showFamilyINDeducible = false;
   showFamilyONDeducible = false;
   showIndividualINDeducible = false;
   showIndividualONDeducible = false;

   get disableINFamilyButton() {
      return !this.showOutOfNetworkButtonFamily;
   }
   get disableINIndividualButton() {
      return !this.showOutOfNetworkButtonIndividual;
   }

   //MPV-1684
   @track showGraph = true;
   message = "Your plan does not have a deductible.";

   @track _memberName;
   pubsubObj;

   showIndividualData = false;
   hideFamilyData = false;
   //----sp

   // To hide and show Tabs
   showTabs = false;
   showPlanDetails = false;
   showUseDetails = false;
   showSpendingDetails = false;
   showUseSpendingTabs = true;
   showToothHistory = false;
   showCostShare = false;
   showBenefits = false;
   showBenefitTab = false;
   showToothHistoryTab = false;
   showCostShareTab = false;

   isDental = false;
   @track isMedSupp = false;
   @track medSuppType = false;

   //To refresh child Flex Card when records is ready from IP
   get showPlanDetailsCard() {
      return this.showPlanDetails && this.benefitDetailRecord.length > 0 ? true : false;
   }
   get showUseDetailsCard() {
      return this.showUseDetails && this.benefitUseRecord.length > 0 ? true : false;
   }
   get showSpendingDetailsCard() {
      return this.showSpendingDetails && this.benefitSpendingRecord.length > 0 ? true : false;
   }

   /* tab names are detail, use, spending */
   @api
   get tab() {
      return this._tab;
   }
   set tab(val) {
      this._tab = val;
   }

   @api
   get planId() {
      return this._planId;
   }
   set planId(val) {
      this._planId = val;
   }

   @api
   get planName() {
      return this._planName;
   }
   set planName(val) {
      this._planName = val;
   }

   @api
   get effectiveDate() {
      return this._effectiveDate;
   }
   set effectiveDate(val) {
      this._effectiveDate = val;
   }
   @api
   get terminationDate() {
      return this._terminationDate;
   }
   set terminationDate(val) {
      this._terminationDate = val;
   }
   @api
   get status() {
      return this._status;
   }
   set status(val) {
      this._status = val;
   }
   //MPV-1411
   @api
   get planType() {
      return this._planType;
   }
   set planType(val) {
      this._planType = val;
   }
   @api
   get brand() {
      return this._brand;
   }
   set brand(val) {
      this._brand = val;
   }
   //MPV-1411 end

   @api
   get userid() {
      return this._userId;
   }
   set userid(val) {
      this._userId = val;
   }

   get isDentalPlan() {
      return this._planType === "Dental" || this._planType === "D" ? true : false;
   }

   //Order Of Tab
   detailButtonIndex = 0;
   useButtonIndex = 1;
   spendingButtonIndex = 2;

   //Order dental tabs
   costShareButtonIndex = 0;
   benefitsButtonIndex = 1;
   toothHistoryButtonIndex = 2;

   //Long Plan Type
   planTypes = { M: "Medical", V: "Vision", D: "Dental", R: "Pharmacy" };
   //MPV-1239 sort
   sortOptions = [
      {
         key: "B002",
         value: "ToothCode",
         label: "Tooth Code",
         ascendingDirection: false,
         showBadge: false,
      },
      {
         key: "B001",
         value: "SortingDate",
         label: "Service date",
         ascendingDirection: false,
         showBadge: true,
      },
   ];

   // Default Sort Object
   sortObject = {
      sortType: "SortingDate",
      ascendingDirection: false,
   };

   sortMap = {
      SortingDate: "serviceStartDate",
      SortingProvider: "providerName",
   };

   get paramPlanId() {
      let planIdArray = [];
      planIdArray.push({ planId: this._planId });
      return planIdArray;
   }

   connectedCallback() {
      this.pubsubObj = { showMemberInfo: this.setShowFamilySpending.bind(this), memberSelectionAction: this.callBenefitAndGetInfo.bind(this) };
      this.inNetworkFamily = true;
      this.outNetoworkFamily = false;
      this.inNetworkIndividual = true;
      this.outNetoworkIndividual = false;
      this.selectedInNetwork = "true";
      this.selectedInNetworkIndividual = "true";
      this.selectedOutNetwork = "false";
      this.selectedOutNetworkIndividual = "false";
      //this._planId = 'MU001001';
      if (!this._planId) {
         this.registerPubSub();
      }
      if (this._memberId) {
         this.callMemberActivePlan();
      } else {
         this.callMAP = true;
      }
   }

   callMemberActivePlan() {
      try {
         let input = {
            memberId: this._memberId,
            "24MonthsTermDate": "Yes",
         };
         // Call Member_ActivePlan IP
         this.callIP("Member_ActivePlan", input).then((data) => {
            if (data.IPResult?.MemberInfo) {
               this._memberName = data.IPResult.MemberInfo.memberName;
               if (this._planId) {
                  data.IPResult.ServiceTypeInfo.forEach((plan) => {
                     if (this._planId === plan.planId) {
                        this.lobId = plan.lobId;
                        this.lobMarketSegment = plan.lobMarketSegment;
                        this.dentalEmbededInd = plan.dentalEmbededInd;
                        this.pharmacyEmbededInd = plan.pharmacyEmbededInd;
                        this.visionEmbededInd = plan.visionEmbededInd;
                        this.productBrandGrouping = plan.productBrandGrouping;
                        if (plan.productCategory === "Pharmacy") {
                           //MPV-2637 It has to show the message for Pharmacy Plan
                           this.showPharmacySpendingInfo = true;

                           if (plan.productBrandGrouping == "Medicare") {
                              this.isMedicare = true;
                           } else if (plan.productBrandGrouping == "Commercial") {
                              this.isCommercial = true;
                           }
                        }
                     }
                  });
               }
            } else {
               console.error(`${this.errorMessage} Member_ActivePlan`);
            }
         });
      } catch(error) {
         console.log('Error in callMemberActivePlan: ', error);
      }
   }

   callBenefitAndGetInfo(memberId) {
      console.log('Deb3 memberId: ', memberId);
      this.callBenefitAPI(memberId);
      if (this._planId) {
         console.log('Deb4 _planId: ', this._planId);
         
         this.getMedSuppBenefits();
      }
      if (this.getInfoCalled) {
         this.getInfo();
      }
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

   ssoLink() {
      let inputParam;

      inputParam = {
         ssoName: "ExpressScripts Attentis",
      };
 

      this.callIP("Member_SSOURL", inputParam).then((data) => {
         if (data) {
            let url = data.IPResult.ssoURL;
            window.open(url, "_blank");
         }
      });
      this.closeModal();
   }

   openSortDropdown() {
      this.template.querySelector(".sort_list").classList.remove("nds-hide");
   }

   closeSortDropdown() {
      this.template.querySelector(".sort_list").classList.add("nds-hide");
   }

   handleSortBy(evt) {
      evt.stopPropagation();
      if (this.sortObject.sortType == evt.target.getAttribute("data-badge-value")) {
         this.sortObject.ascendingDirection = !this.sortObject.ascendingDirection;
      }

      this.sortObject.sortType = evt.target.getAttribute("data-badge-value");
      this.sortBy(this.sortObject.sortType);
      // this.closeSortDropdown();
   }

   sortBy(sortType) {
      this.loading = true;
      this.showList = false;

      let sortCol = this.sortMap[sortType];
      let sortDirection = this.sortObject.ascendingDirection;
      let toothHistoryRecords = JSON.parse(JSON.stringify(this.toothHistoryRecords));
      if (toothHistoryRecords.length > 1) {
         if (sortType === "SortingDate") {
            toothHistoryRecords.sort((a, b) => {
               let dateA = new Date(a.serviceDate);
               let dateB = new Date(b.serviceDate);
               if (!sortDirection) {
                  // DESC
                  return dateB - dateA;
               } else if (sortDirection) {
                  // ASC
                  return dateA - dateB;
               } else {
                  return 0;
               }
            });
            this.toothHistoryRecords = toothHistoryRecords;
         }
         if (sortType === "ToothCode") {
            toothHistoryRecords.sort((a, b) => {
               if (!sortDirection) {
                  return a.toothCode < b.toothCode ? 1 : a.toothCode == b.toothCode ? 0 : -1;
               } else if (sortDirection) {
                  return a.toothCode > b.toothCode ? 1 : a.toothCode == b.toothCode ? 0 : -1;
               }
            });
            this.toothHistoryRecords = toothHistoryRecords;
         }
      }

      // Handle show badges
      for (let i = 0; i < this.sortOptions.length; i++) {
         if (this.sortOptions[i].value == sortType) {
            this.sortOptions[i].ascendingDirection = this.sortObject.ascendingDirection;
            this.sortOptions[i].showBadge = true;
         } else {
            this.sortOptions[i].ascendingDirection = !this.sortObject.ascendingDirection;
            this.sortOptions[i].showBadge = false;
         }
      }

      // Save on session storage for preserve sorting
      sessionStorage.setItem("claimsSort", JSON.stringify(this.sortObject));

      setTimeout(() => {
         this.showList = true;
         this.loading = false;
      });
   }

   contains(arr, key, val) {
      for (var i = 0; i < arr.length; i++) {
         if (arr[i][key] === val) return true;
      }
      return false;
   }

   getMedSuppBenefits() {
      try {
         const date = new Date();
         //if (this.hasRendered) {
         let tenant = 'Attenits';
         let input = {
            productCode: this._planId,
            tenant: tenant,
            effectiveDate: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + "00:00:00",
         };
         console.log('Before calling Member_MedicareSupplementBenefits: ', JSON.stringify(input));
         let basicBenefit;
         // Call Member_MedicareSupplementBenefits IP
         this.callIP("Member_MedicareSupplementBenefits", input).then((data) => {
            console.log('After calling Member_MedicareSupplementBenefits: ', JSON.stringify(data));
            if (data.IPResult) {
               console.log('Deb1 data.IPResult: ', data.IPResult);
               if (data.IPResult.basicBenefits !== "") {
                  this.isMedSupp = true;
                  this.medSuppType = true;
                  this.showBenefitUseTab = false;
                  this.spendindBtnIndexAdjustment();

                  let basicBenefits = data.IPResult.basicBenefits;
                  let additionalBenefits = data.IPResult.additionalBenefits;
                  // to populate basic benefits
                  console.log('Deb5 basicBenefits: ', JSON.stringify(basicBenefits));
                  basicBenefits.forEach((element) => {
                     if (element.Code__c == "MEDSUPBASICBENEFITS") {
                        element.productAttributes.records.forEach((benefits) => {
                           if (!this.contains(this.basicBenefits, "label", benefits.label)) {
                              basicBenefit = { label: benefits.label, description: benefits.userValues, code: benefits.code };
                              this.basicBenefits.push(basicBenefit);
                           }
                        });
                     }
                  });
                  console.log('Deb5 additionalBenefits: ', JSON.stringify(additionalBenefits));
                  // to populate additional benefits
                  additionalBenefits.forEach((element) => {
                     if (element.ProductCode == "ADDBENMEDCOV") {
                        element.attributeCategories.records[0].productAttributes.records.forEach((benefits) => {
                           if (!this.contains(this.additionalBenefits, "label", benefits.label)) {
                              additionalBenefits = { label: benefits.label, description: benefits.userValues, code: benefits.code };
                              this.additionalBenefits.push(additionalBenefits);
                           }
                        });
                     }
                  });
               } else {
                  console.log('Deb2');
                  this.isMedSupp = false;
                  this.medSuppType = false;
               }
            } else {
               console.error(`${this.errorMessage} Member_MedicareSupplementBenefits`);
            }
         });
         // }
      } catch(error) {
         console.log('Error in getMedSuppBenefits: ', error);
      }
   }

   registerPubSub() {
      pubsub.register("MemberSelection", this.pubsubObj);
   }

   disconnectedCallback() {
      pubsub.unregister("MemberSelection", this.pubsubObj);
   }

   getInfo() {
      try {
         if (this.getInfoCalled) {
            var userIdInput = this._userId;
            let input = {
               userId: userIdInput,
            };
            // Call Member_ActivePlan IP
            this.callIP("Member_ActivePlan", input).then((data) => {
               if (data.IPResult?.MembersInPlan) {
                  if (data.IPResult.MembersInPlan) {
                     data.IPResult.MembersInPlan.forEach((mem) => {
                        if (mem["18+"] == "N" && !this.under18.includes(mem.memberId)) {
                           this.under18.push(mem.memberId);
                        }
                     });
                     this.loggedInMemId = data.IPResult.MemberInfo.memberId;
                     if (this.grantAccessCalled == false) {
                        this.grantAccess(this.loggedInMemId);
                     }
                     this.getInfoCalled = false;
                  }
               } else {
                  console.error(`${this.errorMessage} Member_ActivePlan`);
               }
            });
         } else {
            this.getMembers();
         }
         if ((this._status == "Active" || this._status == "Terminated") && this.benefitUseLink == true) {
            this.showBenefitUseTab = true;
            // this.spendindBtnIndexAdjustment();
         } else {
            this.showBenefitUseTab = false;
            // this.spendindBtnIndexAdjustment();
         }
         this.spendindBtnIndexAdjustment();
      } catch(error) {
         console.log('Error in getInfo: ', error);
      }
   }

   grantAccess(memberId) {
      try {
         let input = {
            memberId: memberId,
            mode: "get",
         };

         this.callIP("Member_ManagePermissions", input).then((data) => {
            if (data.IPResult?.accessGrantedFrom) {
               data.IPResult.accessGrantedFrom.forEach((memGranted) => {
                  this.permGranted.push(memGranted);
               });

               this.getMembers();
            } else {
               console.error(`${this.errorMessage} Member_ManagePermissions`);
            }
         });
      } catch(error) {
         console.log('Error in grantAccess: ', error);
      }
   }

   /********** Pubsub BenefitsAndSpendingTabs to BenefitsDetailsTabsSN **********/
   getMembers() {
      // MPV-1151
      if (!this.permGranted.includes(this._memberId) && this._memberId != this.loggedInMemId && !this.under18.includes(this._memberId) && !this.isMedSupp) {
         this.benefitUseLink = false;
         this.showBenefitUseTab = false;
         this.spendindBtnIndexAdjustment();
      } else {
         this.benefitUseLink = true;
         if (this._status !== "Future Active" && this._status !== "Pre-Effectuated") {
            this.showBenefitUseTab = true;
         } else {
            this.showBenefitUseTab = false;
         }
         this.spendindBtnIndexAdjustment();
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

   activeTab() {
      switch (this._tab) {
         case "detail":
            if (!this.planDetailsCalled && this.planId) {
               this.getBenefitsDetail();
               this.getMedSuppBenefits();
               this.planDetailsCalled = true;
               this.showPlanDetails = true;
               this.selectedBenefits = "true";
               this.selectedBenefitUse = "false";
               this.selectedSpending = "false";
            }
            break;
         case "use":
            this.showUseDetails = true;
            this.showPlanDetails = false;
            this.selectedBenefits = "false";
            this.selectedBenefitUse = "true";
            this.selectedSpending = "false";
            break;
         case "spending":
            if (this.showUseSpendingTabs) {
               this.showSpendingDetails = true;
               this.selectedBenefits = "false";
               this.selectedBenefitUse = "false";
               this.selectedSpending = "true";
            }
            this.showPlanDetails = false;
            break;
         case "cost share":
            this.showCostShare = true;
            this.showPlanDetails = false;
            break;
         case "benefits":
            this.showBenefits = true;
            this.showPlanDetails = false;
            break;
         case "tooth history":
            this.showToothHistory = true;
            this.showPlanDetails = false;
            break;
         default:
            this.showPlanDetails = true;
            this.selectedBenefits = "true";
            this.selectedBenefitUse = "false";
            this.selectedSpending = "false";
      }
   }
   spendindBtnIndexAdjustment() {
      //=====was in original benefitDetailsTabs but had to be commented out after merge to make work
      // //When the BenefitUse Tab get hidden, make the index for the spending tab correct.
      if (!this.showBenefitUseTab && this.showUseSpendingTabs && !this.isDental) {
         this.spendingButtonIndex = 1;
      } else {
         this.spendingButtonIndex = 2;
      }
      //==========
   }

   renderedCallback() {
      if (this.callBenDetail && this.lobId && this.lobMarketSegment) {
         this.getBenefitsDetail();
         this.callBenDetail = false;
      }
      if (this._memberId && this.callMAP) {
         this.callMemberActivePlan();
         this.callMAP = false;
      }
      if (this._tab) {
         if (!this.spendingCalled) {
            this.getBenefitsSpending();
            this.spendingCalled = true;
         }

         //this.showTabs = true;
         this.activeTab();
         this.setFocus();
      }
      if (this.showToothHistory === true && this._memberId && this.toothIPcalled === false) {
         let input = {
            memberId: this._memberId,
         };
         // Call Member_ToothIP IP
         this.callIP("Member_BenefitsToothHistory", input).then((data) => {
            if (data.IPResult) {
               if (data.IPResult == []) {
                  this.hasToothRecords = false;
               } else if (data.IPResult.length > 0) {
                  this.hasToothRecords = true;
                  this.toothHistoryRecords = data.IPResult;
               }
               this.toothIPcalled = true;
            } else {
               console.error(`${this.errorMessage} Member_BenefitsToothHistory`);
            }
         });
      }
      if (this._brand === "GHI" && (this._planType === "Dental" || this._planType === "D")) {
         this.isDental = true;
         // MPV-1411 logic to always show benefit but coast share and tooth history only for current and past plans
         if (this._status === "Terminated" || this._status === "Active" || this._status === "Inactive") {
            this.showToothHistoryTab = true;
            this.showBenefitTab = true;
            this.showCostShareTab = true;
            if (this._tab == "detail") {
               this._tab = "cost share";
            }
         } else if (this._status === "Future Active" || this._status === "Pre-Effectuated") {
            this.showToothHistoryTab = false;
            this.showBenefitTab = true;
            this.showCostShareTab = false;
            if (this._tab == "detail") {
               this._tab = "benefits";
            }
         }
         this.activeTab();
      } else {
         this.isDental = false;
      }

      if (this.hasRendered && this._tab) {
         this.loading = true;
         this.activeTab();
         this.getInfo();

         if (this._status == "Active" || this._status == "Terminated") {
            // if (this._status == "Active" || this._status == "Terminated" || this._status == "Pre-Effectuated" ) {
            this.showUseSpendingTabs = true;
         } else {
            this.showUseSpendingTabs = false;
            this.showSpendingDetails = false;
         }
         this.hasRendered = false;

         this.spendindBtnIndexAdjustment();

         // //When there is no active tab, activating the plan detail tab
         let buttonList = this.template.querySelectorAll(".detailtab");
         let activeTab = false;
         for (let i = 0; i < buttonList.length; i++) {
            if (buttonList[i].classList.contains("active")) {
               activeTab = true;
               break;
            }
         }

         if (this.hasRendered) {
            if (!activeTab) {
               this.handlePlanDetails();
            }
         }
      }
      // Focus only on the component load
      if (!this.stateFocus) {
         this.setFocus();
      }
   }

   setShowFamilySpending(msg) {
      let numOfMember = msg.numOfMember;
      let numOfDependants = msg.numOfDependants;

      if (numOfMember > 1 || numOfDependants > 1) {
         this.showFamilySpending = true;
      }
   }

   callBenefitAPI(memberId) {
      this.showTabs = false;
      this.inNetworkFamily = true;
      this.outNetoworkFamily = false;
      this.inNetworkIndividual = true;
      this.outNetoworkIndividual = false;
      this._memberId = memberId.memberId;
      if (this.lastTab) {
         this._tab = this.lastTab;
      }
      if (this._tab && this._planId) {
         switch (this._tab) {
            case "medSupp":
               //this.lastTab = 'medSupp';
               this.getMedSuppBenefits();
               break;
            case "detail":
               this.lastTab = "detail";
               //this.getMedSuppBenefits();
               this.getBenefitsDetail();
               //To focus the Detail Tab
               this.stateFocus = true;
               this.showPlanDetails = true;
               this.addAndRemoveActiveClass(this.detailButtonIndex);
               break;
            case "use":
               this.lastTab = "use";
               this.getBenefitsUse();
               //To focus the Use Tab
               this.stateFocus = true;
               this.addAndRemoveActiveClass(this.useButtonIndex);
               break;
            case "spending":
               this.lastTab = "spending";
               this.getBenefitsSpending();
               //To focus the Spending Tab
               this.stateFocus = true;
               this.addAndRemoveActiveClass(this.spendingButtonIndex);
               break;
            case "cost share":
               this.lastTab = "cost share";
               this.stateFocus = true;
               this.addAndRemoveActiveClass(this.costShareButtonIndex);
               break;
            case "benefits":
               this.lastTab = "benefits";
               this.stateFocus = true;
               this.addAndRemoveActiveClass(this.benefitsButtonIndex);
               break;
            case "tooth history":
               this.lastTab = "tooth history";
               this.stateFocus = true;
               this.addAndRemoveActiveClass(this.toothHistoryButtonIndex);
               break;
            default:
            //Detail IP is pending
         }
      }
      /*setTimeout(() => {
         this.showTabs = true;
      });*/
   }

   getBenefitsDetail() {
      if (this._planId && this._brand && this._planType && this.lobId && this.lobMarketSegment) {
         if (this.benefitDetailRecord.length === 0) {
            this.benefitDetailRecord.push({ planId: this._planId });
            this.benefitDetailRecord[0] = {
               ...this.benefitDetailRecord[0],
               planType: this._planType,
               brand: this._brand,
               lobId: this.lobId,
               lobMarketSegment: this.lobMarketSegment,
               dentalEmbededInd: this.dentalEmbededInd,
               pharmacyEmbededInd: this.pharmacyEmbededInd,
               visionEmbededInd: this.visionEmbededInd,
               productBrandGrouping: this.productBrandGrouping,
            };
         } else if (
            this.benefitDetailRecord.length === 1 &&
            (!this.benefitDetailRecord[0].planType || !this.benefitDetailRecord[0].brand || !this.benefitDetailRecord[0].lobId || !this.benefitDetailRecord[0].lobMarketSegment)
         ) {
            this.benefitDetailRecord[0] = {
               ...this.benefitDetailRecord[0],
               planType: this._planType,
               brand: this._brand,
               lobId: this.lobId,
               lobMarketSegment: this.lobMarketSegment,
               dentalEmbededInd: this.dentalEmbededInd,
               pharmacyEmbededInd: this.pharmacyEmbededInd,
               visionEmbededInd: this.visionEmbededInd,
               productBrandGrouping: this.productBrandGrouping,
            };
         }
         this.showTabs = false;
         this.showPlanDetails = false;
         setTimeout(() => {
            this.showTabs = true;
            this.showPlanDetails = true;
            console.log("tabs: ", this.productBrandGrouping);
         });
      } else {
         this.callBenDetail = true;
      }
   }

   getBenefitsUse() {
      try {
         //Buid IP Input
         let input = {
            memberId: this._memberId,
            planId: this._planId,
            startDate: this._effectiveDate,
            endDate: this._terminationDate,
         };

         console.log('Inside getBenefitsUse: ', JSON.stringify(input));

         this.callIP("Member_BenefitsUseSearch", input).then((data) => {
            if (data.IPResult) {
               let usageData = [];
               if (!Array.isArray(data.IPResult)) {
                  usageData = [data.IPResult];
               } else {
                  usageData = data.IPResult;
               }
               if (usageData !== []) {
                  usageData.forEach((use) => {
                     let unit = use.limitType;
                     if (unit !== "$" && unit) {
                        use.remaining = use.remaining + " " + use.limitType;
                        use.used = use.used + " " + use.limitType;
                        use.amount = use.amount + " " + use.limitType;
                     }
                  });
                  this.benefitUseRecord = [...usageData];
                  console.log('benefit use records', this.benefitUseRecord);
               }
            } else {
               console.error(`${this.errorMessage} Member_BenefitsUseSearch`);
            }
            // setTimeout(() => {

            // });
            this.showTabs = true;
            this.loading = false;
         });
      } catch(error) {
         console.log('Error in getBenefitsUse: ', error);
      }
   }

   /******************* FAMILY In Network ************************/
   getBenefitsSpending() {
      try {
         this.getMembers();

         //Buid IP Input
         let input = {
            memberId: this._memberId,
            planId: this._planId,
            eligibilityEffectiveDate: this._effectiveDate,
         };

         console.log('The input: ' + JSON.stringify(input));

         this.callIP("Member_BenefitSpending", input).then((data) => {
            //data = {"IPResult":{"benefitSpending":[{"totalAmount":"3400.00","tier":"2","spent":"0.00","remaining":"3400.00","coverageType":"OUT-OF-POCKET MAXIMUM","coverageLevel":"INDIVIDUAL","accumulatorType":"In Network"},{"totalAmount":"3400.00","tier":"2","spent":"0.00","remaining":"3400.00","coverageType":"OUT-OF-POCKET MAXIMUM","coverageLevel":"INDIVIDUAL","accumulatorType":"Out of Network"}]},"errorCode":"INVOKE-200","error":"OK"};
            if (data.IPResult.benefitSpending) {
               if (!Array.isArray(data.IPResult.benefitSpending)) {
                  this.benefitSpendingRecord = [data.IPResult.benefitSpending];
               } else {
                  this.benefitSpendingRecord = data.IPResult.benefitSpending;
               }
               //MPV-1684
               this.benefitSpendingRecord.forEach((element, index) => {
                  if (parseInt(element.totalAmount, 10) < 1) {
                     this.benefitSpendingRecord[index].showGraph = false;
                  } else {
                     this.benefitSpendingRecord[index].showGraph = true;
                  }
               });

               this.getBenefitsFamilyIN();
               this.getBenefitsIndividualIN();
            } else if (data.IPResult.noRecordFound) {
               if (this.showCostShare) {
                  this.noCostShareData = true;
               }
            } else {
               console.error(`${this.errorMessage} Member_BenefitSpending`);
            }
            this.loading = false;
            this.showTabs = true;
         });
      } catch (error) {
         console.log('Error in getBenefitsSpending: ', error);
      }
   }

   getBenefitsFamilyIN() {
      try {
         this.showFamilyGraphContainer = false;
         //Filtering
         this.familySpendings = JSON.parse(JSON.stringify(this.benefitSpendingRecord)).filter(
            (spending) => spending.coverageLevel.includes("FAMILY") && (spending.accumulatorType.toUpperCase().includes("IN NETWORK") || spending.accumulatorType.toUpperCase().includes("BOTH"))
         );

         //Sort by coverageType
         if (this.familySpendings.length > 0) {
            this.familySpendings.sort(function (a, b) {
               return a.coverageType.localeCompare(b.coverageType);
            });
         }

         //Adding progress/coverageType
         this.familySpendings.forEach((spending) => {
            spending.progress = (spending.spent * 100) / spending.totalAmount;
            if (spending.coverageType == "DEDUCTIBLE") {
               spending.coverageType = spending.coverageType + " - TIER " + spending.tier;
               this.showFamilyINDeducible = true;
            }
         });

         //To determine to show the OON button
         this.familySpendingsOON = JSON.parse(JSON.stringify(this.benefitSpendingRecord)).filter(
            (spending) => spending.coverageLevel.includes("FAMILY") && (spending.accumulatorType.toUpperCase().includes("OUT OF NETWORK") || spending.accumulatorType.toUpperCase().includes("BOTH"))
         );

         if (this.familySpendingsOON.length > 0) {
            this.showOutOfNetworkButtonFamily = true;
         } else {
            this.showOutOfNetworkButtonFamily = false;
         }

         if (!this.showFamilyINDeducible && !this.isDentalPlan) {
            //when there is no Deducible Record
            this.familySpendings.unshift({
               accumulatorType: "In Network",
               coverageLevel: "FAMILY",
               totalAmount: "0",
               coverageType: "DEDUCTIBLE",
               showGraph: false,
            });
         }

         setTimeout(() => {
            this.showFamilyGraphContainer = true;
         });
         //this.loading = false;
      } catch(error) {
         console.log('Error in getBenefitsFamilyIN: ', error);
      }
   }

   /******************* FAMILY Out of Network ************************/
   getBenefitsFamilyOON() {
      try {
         this.showFamilyGraphContainer = false;
         //Filtering
         this.familySpendings = JSON.parse(JSON.stringify(this.benefitSpendingRecord)).filter(
            (spending) => spending.coverageLevel.includes("FAMILY") && (spending.accumulatorType.toUpperCase().includes("OUT OF NETWORK") || spending.accumulatorType.toUpperCase().includes("BOTH"))
         );

         //Sort by coverageType
         if (this.familySpendings.length > 0) {
            this.familySpendings.sort(function (a, b) {
               return a.coverageType.localeCompare(b.coverageType);
            });
         }

         //Adding progress/coverageType
         this.familySpendings.forEach((spending) => {
            spending.progress = (spending.spent * 100) / spending.totalAmount;
            if (spending.coverageType == "DEDUCTIBLE") {
               spending.coverageType = spending.coverageType + " - TIER " + spending.tier;
               this.showFamilyONDeducible = true;
            }
         });

         if (!this.showFamilyONDeducible && !this.isDentalPlan) {
            //when there is no Deducible Record
            this.familySpendings.unshift({
               accumulatorType: "Out of Network",
               coverageLevel: "FAMILY",
               totalAmount: "0",
               coverageType: "DEDUCTIBLE",
               showGraph: false,
            });
         }

         setTimeout(() => {
            this.showFamilyGraphContainer = true;
         });
      //this.loading = false;
      } catch (error) {
         console.log('Error in getBenefitsFamilyOON: ', error);
      }
   }

   /******************* INDIVIDUAL In Network ************************/
   getBenefitsIndividualIN() {
      try {
         this.showIndiGraphContainer = false;
         if (!this.benefitSpendingRecord) {
            this.showIndividualData = false;
         }
         this.showIndividualData = true;

         //Filtering
         this.individualSpendings = JSON.parse(JSON.stringify(this.benefitSpendingRecord)).filter(
            (spending) => spending.coverageLevel.includes("INDIVIDUAL") && (spending.accumulatorType.toUpperCase().includes("IN NETWORK") || spending.accumulatorType.toUpperCase().includes("BOTH"))
         );

         //Sort by coverageType
         if (this.individualSpendings.length > 0) {
            this.individualSpendings.sort(function (a, b) {
               return a.coverageType.localeCompare(b.coverageType);
            });
         }

         //Adding progress/coverageType
         this.individualSpendings.forEach((spending) => {
            spending.progress = (spending.spent * 100) / spending.totalAmount;
            if (spending.coverageType == "DEDUCTIBLE") {
               spending.coverageType = spending.coverageType + " - TIER " + spending.tier;
               this.showIndividualINDeducible = true;
            }
         });

         //To determine to show the OON button
         this.individualSpendingsOON = JSON.parse(JSON.stringify(this.benefitSpendingRecord)).filter(
            (spending) => spending.coverageLevel.includes("INDIVIDUAL") && (spending.accumulatorType.toUpperCase().includes("OUT OF NETWORK") || spending.accumulatorType.toUpperCase().includes("BOTH"))
         );

         if (this.individualSpendingsOON.length > 0) {
            this.showOutOfNetworkButtonIndividual = true;
         } else {
            this.showOutOfNetworkButtonIndividual = false;
         }

         if (!this.showIndividualINDeducible && !this.isDentalPlan) {
            //when there is no Deducible Record
            this.individualSpendings.unshift({
               accumulatorType: "In Network",
               coverageLevel: "INDIVIDUAL",
               totalAmount: "0",
               coverageType: "DEDUCTIBLE",
               showGraph: false,
            });
         }

         //this.loading = false;
         setTimeout(() => {
            this.showIndiGraphContainer = true;
         });
      } catch(error) {
         console.log('Error in getBenefitsIndividualIN: ', error);
      }
   }

   getBenefitsIndividualOON() {
      try {
         this.showIndiGraphContainer = false;
         //Filtering
         this.individualSpendings = JSON.parse(JSON.stringify(this.benefitSpendingRecord)).filter(
            (spending) => spending.coverageLevel.includes("INDIVIDUAL") && (spending.accumulatorType.toUpperCase().includes("OUT OF NETWORK") || spending.accumulatorType.toUpperCase().includes("BOTH"))
         );

         //Sort by coverageType
         if (this.individualSpendings.length > 0) {
            this.individualSpendings.sort(function (a, b) {
               return a.coverageType.localeCompare(b.coverageType);
            });
         }

         //Adding progress/coverageType
         this.individualSpendings.forEach((spending) => {
            spending.progress = (spending.spent * 100) / spending.totalAmount;
            if (spending.coverageType == "DEDUCTIBLE") {
               spending.coverageType = spending.coverageType + " - TIER " + spending.tier;
               this.showIndividualONDeducible = true;
            }
         });

         if (!this.showIndividualONDeducible && !this.isDentalPlan) {
            //when there is no Deducible Record
            this.individualSpendings.unshift({
               accumulatorType: "Out of Network",
               coverageLevel: "INDIVIDUAL",
               totalAmount: "0",
               coverageType: "DEDUCTIBLE",
               showGraph: false,
            });
         }

         //this.loading = false;
         setTimeout(() => {
            this.showIndiGraphContainer = true;
         });
      } catch(error) {
         console.log('Error in getBenefitsIndividualOON: ', error);
      }
   }

   dynamicNetworkLabelFamily(evt) {
      if (evt) {
         this.networkLabelFamily = evt.target.getAttribute("data-id");
         if (this.networkLabelFamily == "3") {
            //Family Spending - In-Network clicked
            this.inNetworkFamily = true;
            this.outNetoworkFamily = false;
            this.template.querySelector(`[data-id="3"]`).classList.add("active");
            this.template.querySelector(`[data-id="4"]`).classList.remove("active");
            if (this.showOutOfNetworkButtonFamily) {
               this.template.querySelector(`[data-id="4"]`).classList.remove("active");
            }
            this.getBenefitsFamilyIN();
            this.selectedInNetwork = "true";
            this.selectedOutNetwork = "false";
         } else {
            //Family Spending - Out-Network clicked
            this.inNetworkFamily = false;
            this.outNetoworkFamily = true;
            this.template.querySelector(`[data-id="4"]`).classList.add("active");
            this.template.querySelector(`[data-id="3"]`).classList.remove("active");
            if (this.showOutOfNetworkButtonFamily) {
               this.template.querySelector(`[data-id="4"]`).classList.add("active");
            }
            this.getBenefitsFamilyOON();
            this.selectedInNetwork = "false";
            this.selectedOutNetwork = "true";
         }
      }
   }

   dynamicNetworkLabelIndividual(evt) {
      if (evt) {
         this.networkLabelIndividual = evt.target.getAttribute("data-id");
         if (this.networkLabelIndividual == "5") {
            //Individual Spending - In-Network clicked
            this.inNetworkIndividual = true;
            this.outNetoworkIndividual = false;
            this.template.querySelector(`[data-id="5"`).classList.add("active");
            this.template.querySelector(`[data-id="6"`).classList.remove("active");
            if (this.showOutOfNetworkButtonIndividual) {
               this.template.querySelector(`[data-id="6"`).classList.remove("active");
            }
            this.getBenefitsIndividualIN();
            this.selectedInNetworkIndividual = "true";
            this.selectedOutNetworkIndividual = "false";
         } else {
            //Family Spending - Out-Network clicked
            this.inNetworkIndividual = false;
            this.outNetoworkIndividual = true;
            this.template.querySelector(`[data-id="5"`).classList.remove("active");
            this.template.querySelector(`[data-id="6"`).classList.add("active");
            if (this.showOutOfNetworkButtonIndividual) {
               this.template.querySelector(`[data-id="6"`).classList.add("active");
            }
            this.getBenefitsIndividualOON();
            this.selectedInNetworkIndividual = "false";
            this.selectedOutNetworkIndividual = "true";
         }
      }
   }

   handleCostShare(event) {
      this.showTabs = false;
      this.stateFocus = true;
      this._tab = "cost share";
      this.lastTab = "cost share";

      //Display the right child card
      this.showPlanDetails = false;
      this.showUseDetails = false;
      this.showSpendingDetails = false;
      this.showToothHistory = false;
      this.showBenefits = false;
      this.showCostShare = true;
      this.addAndRemoveActiveClass(this.costShareButtonIndex);
      setTimeout(() => {
         this.showTabs = true;
      });
   }

   handleBenefits(event) {
      this.showTabs = false;
      this.stateFocus = true;
      this._tab = "benefits";
      this.lastTab = "benefits";

      //Display the right child card
      this.showPlanDetails = false;
      this.showUseDetails = false;
      this.showSpendingDetails = false;
      this.showToothHistory = false;
      this.showBenefits = true;
      this.showCostShare = false;
      this.addAndRemoveActiveClass(this.benefitsButtonIndex);
      setTimeout(() => {
         this.showTabs = true;
      });
   }

   handleToothHistory(event) {
      this.showTabs = false;
      this.stateFocus = true;
      this._tab = "tooth history";
      this.lastTab = "tooth history";

      //Display the right child card
      this.showPlanDetails = false;
      this.showUseDetails = false;
      this.showSpendingDetails = false;
      this.showToothHistory = true;
      this.showBenefits = false;
      this.showCostShare = false;
      this.addAndRemoveActiveClass(this.toothHistoryButtonIndex);
      setTimeout(() => {
         this.showTabs = true;
      });
   }

   handlePlanDetails(event) {
      this.showTabs = false;
      this.stateFocus = true;
      this.lastTab = "detail";
      this._tab = "detail";

      this.getBenefitsDetail();
      this.getMedSuppBenefits();

      this.showPlanDetails = true;
      this.showUseDetails = false;
      this.showSpendingDetails = false;
      this.showToothHistory = false;
      this.showBenefits = false;
      this.showCostShare = false;
      this.selectedBenefits = "true";
      this.selectedBenefitUse = "false";
      this.selectedSpending = "false";
      this.addAndRemoveActiveClass(this.detailButtonIndex);
      setTimeout(() => {
         this.showTabs = true;
      });
   }

   handleUseDetails(event) {
      this.lastTab = "use";

      this.showTabs = false;
      this.loading = true;
      this.stateFocus = true;
      this._tab = "use";

      this.getBenefitsUse();

      //Display the right child card
      this.showPlanDetails = false;
      this.showUseDetails = true;
      this.showSpendingDetails = false;
      this.showToothHistory = false;
      this.showBenefits = false;
      this.showCostShare = false;
      this.selectedBenefits = "false";
      this.selectedBenefitUse = "true";
      this.selectedSpending = "false";
      //this.showFamilyGraphContainer = true;
      this.addAndRemoveActiveClass(this.useButtonIndex);
      /* setTimeout(() => {
         this.showTabs = true;
         this.loading = false;
      });*/
   }

   handleSpendingDetails(event) {
      this.isMedSupp = false;
      this.loading = true;
      this.showTabs = false;
      this.stateFocus = true;
      this._tab = "spending";
      this.lastTab = "spending";
      //Call if it gets clicked for the first time.
      this.inNetworkFamily = true;
      this.showUseDetails = false; // MPV-2212
      this.outNetoworkFamily = false;
      this.inNetworkIndividual = true;
      this.outNetoworkIndividual = false;
      this.showToothHistory = false;
      this.showBenefits = false;
      this.showCostShare = false;
      this.selectedBenefits = "false";
      this.selectedBenefitUse = "false";
      this.selectedSpending = "true";

      this.getBenefitsSpending();
      this.getBenefitsIndividualIN();

      //Display the right child card
      this.spendindBtnIndexAdjustment();
      this.addAndRemoveActiveClass(this.spendingButtonIndex);
      setTimeout(() => {
         this.loading = true;
         this.showTabs = false;
      });
   }

   setFocus() {
      // Get first button and focus that
      var btnId = 0;
      if (this.showPlanDetails) {
         btnId = this.detailButtonIndex;
      }
      if (this.showUseDetails) {
         btnId = this.useButtonIndex;
      }
      if (this.showSpendingDetails) {
         btnId = this.spendingButtonIndex;
      }
      if (this.showCostShare) {
         btnId = this.costShareButtonIndex;
      }
      if (this.showBenefits) {
         if (this.isDental && (this._status == "Future Active" || this._status == "Pre-Effectuated")) {
            btnId = 0;
         } else {
            btnId = this.benefitsButtonIndex;
         }
      }
      if (this.showToothHistory) {
         btnId = this.toothHistoryButtonIndex;
      }

      this.addAndRemoveActiveClass(btnId);
   }

   addAndRemoveActiveClass(btnIdStr) {
      let btnId = parseInt(btnIdStr, 10);
      let buttonList = this.template.querySelectorAll("button");
      let buttonToRemove;
      for (let i = 0; i < buttonList.length; i++) {
         buttonToRemove = this.template.querySelectorAll("button")[i];
         if (i !== btnId) {
            if (buttonToRemove.getAttribute("data-id") < 3) {
               buttonToRemove.classList.remove("active");
            }
         } else {
            buttonToRemove.classList.add("active");
         }
      }
   }
}
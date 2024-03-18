import { getDataHandler } from "omnistudio/utility";
import { LightningElement, track, api } from "lwc";
import pubsub from "omnistudio/pubsub";

export default class benefitsPlanDetails extends LightningElement {
   //Button focus
   @track loading = false;
   @track _memberId;
   @track _planId;
   @track _planType;
   @track _pharmacyEmbededInd;
   @track _visionEmbededInd;
   @track _brand;
   @track _lobMarketSegment;
   @track _dentalEmbededInd;
   @track _records;
   @track _productBrandGrouping;
   @track hasRendered = false;
   @track companyName;
   @track vendorName;
   @track isCommercialESI = false;
   @track isMedicareESI = false;
   @track callNonSSOLinkEyeMed = false;
   isExternalDisclaimerModalOpen = false;
   wellsparkSSO = "Wellspark";
   eyeMedSSOLink;
   wellsparkSSOLink;
   expressScriptSSOLink;
   healthPlexSSOLink;
   SSOlink;
   rendered =false;
   renderedBenefits = false;
   benefitsSummaryData;
   gotBenefitsSummary = false;
   gotActivePlanDetails = false;
   calledSSOCount = 0;
   finishedSSOCount = 0;
   errorMessage ='Error --> No data returned from IP';
   IPCallCount = 0;


   sectionOpen = true;
   removeDuplicate = true;
   RefineSearchResults = "RefineSearchResults";
   redirectUrl = "https://attentisconsulting.com";

   @api
   get records() {
      return this._records;
   }
   set records(val) {
      this._records = val;
      console.log("records:", this._records);
      this.getActivePlanCallback();
   }
   @api
   get planId() {
      return this._planId;
   }
   set planId(val) {
      this._planId = val;
   }
   @api
   get visionEmbededInd() {
      return this._visionEmbededInd;
   }
   set visionEmbededInd(val) {
      this._visionEmbededInd = val;
      this.getActivePlanCallback();
   }

   @api
   get dentalEmbededInd() {
      return this._dentalEmbededInd;
   }
   set dentalEmbededInd(val) {
      this._dentalEmbededInd = val;
      this.getActivePlanCallback();
   }

   @api
   get pharmacyEmbededInd() {
      return this._pharmacyEmbededInd;
   }
   set pharmacyEmbededInd(val) {
      this._pharmacyEmbededInd = val;
      this.getActivePlanCallback();
   }

   @api
   get planType() {
      return this._planType;
   }
   set planType(val) {
      this._planType = val;
      this.getActivePlanCallback();
   }

   @api
   get brand() {
      return this._brand;
   }
   set brand(val) {
      this._brand = val;
      this.getActivePlanCallback();
   }

   @api
   get lobMarketSegment() {
      return this._lobMarketSegment;
   }
   set lobMarketSegment(val) {
      this._lobMarketSegment = val;
      this.getActivePlanCallback();
   }

   @api
   get productBrandGrouping() {
      return this._productBrandGrouping;
   }
   set productBrandGrouping(val) {
      this._productBrandGrouping = val;
      this.getActivePlanCallback();
   }


   @track benefitCategories = [];
   @track benefitCategoriesTracked = [];

   renderedCallback() {
      //console.log('benCat', JSON.stringify(this.benefitCategories))
      // Render benefits details only after SSO IP calls are finished
      console.log('this._planId', this._planId);
      if(this._planId && this.hasRendered == false){
         this.hasRendered = true;
         this.getBenefitSummary();
      }
   }

   getActivePlanCallback() {
      // Don't call SSO IPs until all data is properly set
      if (this._visionEmbededInd != undefined && this._dentalEmbededInd != undefined && this._pharmacyEmbededInd != undefined && this._planType != undefined && this._brand != undefined && this._lobMarketSegment != undefined) {
         this.gotActivePlanDetails = true;
         if(!this.rendered){
            this.rendered = true
            this.calledSSOCount++;
            if (this._visionEmbededInd != 'N') {
               // this.callSSOIP(this.eyeMedSSO);
            }
            if ((this._planType = 'M' && this._pharmacyEmbededInd == 'Y') || this._planType == 'Pharmacy') {
               // this.callSSOIP(this.expressScriptSSO );
            }
            // Dental
            if ((this._planType = 'M' && this._dentalEmbededInd == 'Y') || this._planType == 'D') {
               // this.callSSOIP(this.healthPlexSSO);
            }
         
            // this.callSSOIP(this.wellsparkSSO);
            this.finishedSSOCount++;
            this.IPFinishCallback();
         }
      }
   }

   IPFinishCallback() {
      //console.log(this.finishedSSOCount + " finished /" + this.calledSSOCount + " called");
      // Render benefits only when all IP calls are finished
      if (!this.renderedBenefits && this.gotBenefitsSummary && this.calledSSOCount == this.finishedSSOCount) {
         this.renderedBenefits = true;
         this.renderBenefitsSummary(this.benefitsSummaryData);
         this.benefitsSummaryData = "";
         //console.log("IP Count", this.IPCallCount);
      }
   }

   // Asynchronous nature of IP calls requires a counter to determine if all calls are finished
   callSSOIP(ssoName){
      let input = {
         ssoName: ssoName,
      };
      

      this.calledSSOCount++;
      this.callIP("Member_SSOURL", input).then((data)=>{
         if(data.IPResult){    
           
            if(ssoName === "Eyemed"){
               this.eyeMedSSOLink = data.IPResult.ssoURL
            } else if(ssoName === "Wellspark"){
               this.wellsparkSSOLink = data.IPResult.ssoURL
            }
            else if(ssoName.includes('ExpressScripts')){
               this.expressScriptSSOLink = data.IPResult.ssoURL
            }
            else if(ssoName.includes('HealthFlex')){
               this.healthPlexSSOLink = data.IPResult.ssoURL
            }
         }else{
            console.error(`${this.errorMessage} Member_SSOURL`)
         }
         this.finishedSSOCount++;
         this.IPFinishCallback();
      })
   }

   getBenefitSummary() {
      //console.log("planId", this._planId);
      let input = {
         planId: this._planId,
      };

      // Call Member_BenefitSummary IP
      this.callIP("Member_BenefitSummary", input).then((data) => {
         this.benefitsSummaryData = data;
         this.gotBenefitsSummary = true;
         this.IPFinishCallback();
      });
   }

   renderBenefitsSummary(data) {
      let benefitArray = [];
      let benefitArrayFromIP = [];

      if(data.IPResult.result){      

         if (this.removeDuplicate) {
            //Removing Duplicates
            if (!Array.isArray(data.IPResult.result)) {
               benefitArrayFromIP = [data.IPResult.result];
            } else {
               benefitArrayFromIP = data.IPResult.result;
            }
            benefitArray = benefitArrayFromIP.filter(
               (tag, index, array) =>
                  array.findIndex((t) => t.BSDL === tag.BSDL && t.networkIndicator === tag.networkIndicator && t.isPreferred === tag.isPreferred && t.isParticipating === tag.isParticipating) === index
            );
         } else {
            //Not removing Duplicates
            if (!Array.isArray(data.IPResult.result)) {
               benefitArray = [data.IPResult.result];
            } else {
               benefitArray = data.IPResult.result;
            }
         }

         // Remove Vision Benefits provided by IP
         benefitArray = benefitArray.filter((tag) => tag.MBRBSDLDataMatrix__Category != "Vision Benefits");
      }

      // Add entry for Prescription Drugs if current plan has embedded pharmacy benefits, which will be an external link 
      if ((this._planType = 'M' && this._pharmacyEmbededInd == 'Y') || this._planType == 'Pharmacy') {
         benefitArray.push({
            "coveredIndicator": "Covered",
            "isPreferred": "No",
            "isParticipating": "No",
            "limitOrStoplossAmount": 0,
            "copayAmount": 0,
            "networkIndicator": "Both",
            "coInsPercentage": 0,
            "BSDL": "",
            "deductableAmount": 0,
            "MBRBSDLDataMatrix__Service": "Prescription Drugs",
            "MBRBSDLDataMatrix__Category": "Prescription Drugs",
            "SortOrder": "9999999999999999997",
            "InNetworkLanguage": "N/A",
            "OutOfNetworkLanguage": "N/A",
            "LimitUnit": "N/A",
            "ID": "0"
         });
      }

      if (this._visionEmbededInd != 'N') {
         benefitArray.push({
            "coveredIndicator": "Covered",
            "isPreferred": "No",
            "isParticipating": "No",
            "limitOrStoplossAmount": 0,
            "copayAmount": 0,
            "networkIndicator": "Both",
            "coInsPercentage": 0,
            "BSDL": "",
            "deductableAmount": 0,
            "MBRBSDLDataMatrix__Service": "Visio n Benefits",
            "MBRBSDLDataMatrix__Category": "Vision Benefits",
            "SortOrder": "9999999999999999998",
            "InNetworkLanguage": "N/A",
            "OutOfNetworkLanguage": "N/A",
            "LimitUnit": "N/A",
            "ID": "0"
         });
      }


      if (this._brand == 'Attentis' && ((this._planType = 'M' && this._dentalEmbededInd == 'Y') || this._planType == 'D')) {
         benefitArray.push({
            "coveredIndicator": "Covered",
            "isPreferred": "No",
            "isParticipating": "No",
            "limitOrStoplossAmount": 0,
            "copayAmount": 0,
            "networkIndicator": "Both",
            "coInsPercentage": 0,
            "BSDL": "",
            "deductableAmount": 0,
            "MBRBSDLDataMatrix__Service": "Dental Benefits",
            "MBRBSDLDataMatrix__Category": "Dental Benefits",
            "SortOrder": "9999999999999999999",
            "InNetworkLanguage": "N/A",
            "OutOfNetworkLanguage": "N/A",
            "LimitUnit": "N/A",
            "ID": "0"
         });
      }

      if (benefitArray.length) {

         //Sort by SortOrder
         benefitArray.sort(function (a, b) {
               return (
                  parseInt(a.SortOrder, 10) - parseInt(b.SortOrder, 10) ||
                  a.networkIndicator.localeCompare(b.networkIndicator) ||
                  a.BSDL.localeCompare(b.BSDL) ||
                  a.isParticipating.localeCompare(b.isParticipating)
               );
            });
         // console.log('sortedBenArr', JSON.stringify(benefitArray))

         /* To build new json */
         let subCategory = [];
         let inBenefitArray = [];
         let outBenefitArray = [];
         let inNetworkCopayArray = [];
         let outNetworkCopayArray = [];
         let inNetworkCoInsuranceArray = [];
         let outNetworkCoInsuranceArray = [];
         let inNetworkDeducibleArray = [];
         let outNetworkDeducibleArray = [];
         let inNetworkNotCovered = [];
         let outNetworkNotCovered = [];
         let categoryName = "";
         let inNetworkLanguage;
         let outNetworkLanguage;
         let numOfInNetworkBenefit = 0;
         let numOfOutNetworkBenefit = 0;
         let limitLanguage = "Visits Allowed";
         let pairFlag;
         let linkFlag = false;
         let showDental = false;
         let showPharmacy = false;
         let showVision = false;
         let showVisionNonSSO = false;
         let linkName = "";
         let linkAddress = "";
         let prefPartIndex = 0;


         let planId = this.__planId;
         let planType = this._planType;
         let brand = this._brand;
         let lobMarketSegment = this._lobMarketSegment;
         for (let i = 0; i < benefitArray.length; i++) {
            let benefit = benefitArray[i];

            let serviceName = benefit.MBRBSDLDataMatrix__Service;
            let networkInd = benefit.networkIndicator;
            let limitString = benefit.limitOrStoplossAmount + " " + limitLanguage;
            let limitFlag = benefit.limitOrStoplossAmount > 0 ? true : false;

            //To identify if there is a pair for BSLD or not
            let serviceName_next = "";
            let networkInd_next = "";
            if (i < benefitArray.length - 1) {
               serviceName_next = benefitArray[i + 1].MBRBSDLDataMatrix__Service;
               networkInd_next = benefitArray[i + 1].networkIndicator;
            }

            //Check if there is additional Input for same service and same network.
            if (networkInd === networkInd_next && serviceName === serviceName_next) {
               let builtLanguage = [];
               prefPartIndex = 0;
               builtLanguage = this.buildLanguage(benefit);
               prefPartIndex = builtLanguage.length;
               if (benefit.networkIndicator === "In Network") {
                  // if (benefit.copayAmount > 0) {
                     inNetworkCopayArray.push({
                        type: "copay",
                        service: serviceName,
                        language: builtLanguage,
                     });
                     inBenefitArray.push(inNetworkCopayArray);
               } else if(benefit.networkIndicator === "Both" || benefit.networkIndicator === "both" ) {
                  // push to both in network and OON array
                  outNetworkCopayArray.push({
                     type: "copay",
                     service: serviceName,
                     language: builtLanguage,
                  });
                  outBenefitArray.push(outNetworkCopayArray);
                  inNetworkCopayArray.push({
                     type: "copay",
                     service: serviceName,
                     language: builtLanguage,
                  });
                  inBenefitArray.push(inNetworkCopayArray);
               } else if(benefit.networkIndicator === "Out of Network" ) {
                     outNetworkCopayArray.push({
                        type: "copay",
                        service: serviceName,
                        language: builtLanguage,
                     });
                     outBenefitArray.push(outNetworkCopayArray);
            
               }
               continue;
            }

            // Check if categoryName is changed
            let currentCategoryName = benefit.MBRBSDLDataMatrix__Category;
            if (categoryName && categoryName !== currentCategoryName) {
               let subCategoryInput = [...subCategory];
               this.benefitCategories.push({
                  CategoryName: categoryName,
                  SubCategory: subCategoryInput,
                  LinkFlag: linkFlag,
                  showPharmacyInfo: showPharmacy,
                  showDentalInfo: showDental,
                  showVisionInfo: showVision,
                  showVisionInfoNonSSO: showVisionNonSSO
               });
               subCategory = [];
               linkFlag = false;
               showVision = false;
               showVisionNonSSO =false;
               showDental = false;
               showPharmacy = false;
               linkName = "";
               linkAddress = "";
            }
            if (!linkFlag) {
               // Do not show benefit details, show partner link and description
               if (currentCategoryName == "Prescription Drugs") {
               //if(currentCategoryName == "Prescription Drugs" ||  this._pharmacyEmbededInd == 'Y'){
                  linkFlag = true;
                  showPharmacy = true;
                  //linkText = this.buildLinkText("pharmacy", "Express Scripts, Inc., (ESI)", this.expressScriptSSOLink);
               } else if (currentCategoryName == "Dental Benefits") {
                  
                  linkFlag = true;
                  showDental = true;
                 // linkText = this.buildLinkText("dental", "HealthPlex", this.healthPlexSSOLink);
               } else if (brand === "Attentis") {
                  if (currentCategoryName == "Vision Benefits") {
                     if (lobMarketSegment !== "Individual Solo" && lobMarketSegment !== "Small Group") {
                        showVisionNonSSO = true;
                        linkFlag = true;
                       
                     }
                  }
               }else{
                  if (currentCategoryName == "Vision Benefits") {
                     showVision = true;
                     linkFlag = true;
                                       }
               }
               
               if (linkFlag) {
                  //Build SubCategory
                  subCategory.push({
                     sortOrder: benefit.MBRBSDLDataMatrix__SortOrder,
                     BSDL: benefit.BSDL,
                     serviceName: "Covered",
                     inNetworkLanguage: inNetworkLanguage,
                     outOfNetworkLanguage: outNetworkLanguage,
                  });

                  //Reset variables for next service
                  numOfInNetworkBenefit = 0;
                  numOfOutNetworkBenefit = 0;
                  inBenefitArray = [];
                  outBenefitArray = [];
                  inNetworkCopayArray = [];
                  outNetworkCopayArray = [];
                  inNetworkCoInsuranceArray = [];
                  outNetworkCoInsuranceArray = [];
                  inNetworkDeducibleArray = [];
                  outNetworkDeducibleArray = [];
                  inNetworkNotCovered = [];
                  outNetworkNotCovered = [];
                  inNetworkLanguage = "";
                  outNetworkLanguage = "";
                  pairFlag = "N";
               }
            }

            if (!linkFlag) {
               //Check if benefit is covered
               if (benefit.coveredIndicator === "Covered") {

                  let builtLanguage = [];
                  let isPreferred = benefit.isPreferred;
                  let isParticipating = benefit.isParticipating;
                  builtLanguage = this.buildLanguage(benefit, (isPreferred === "Yes" || isParticipating === "Yes" ? prefPartIndex : 0));

                  // Gym Reimbursement set as "Covered" or "Not Covered" as required in MPV-1498
                  if (serviceName == "Gym Reimbursement") {
                     if (benefit.networkIndicator === "In Network") {
                        if (inBenefitArray.length === 0) {
                           inBenefitArray.push({ type: "noamount", service: serviceName, language: [{
                              id: 0,
                              amountflag: false,
                              value: "Covered",
                           }]});
                        }
                     
                     } else {
                        if (outBenefitArray.length === 0) {
                           outBenefitArray.push({ type: "noamount", service: serviceName, language: [{
                              id: 0,
                              amountflag: false,
                              value: "Covered",
                           }]});
                        }
                     }
                  //copayAmount
                  } else if (benefit.copayAmount > 0 || (isPreferred === "Yes" || isParticipating === "Yes")) {
                     if (benefit.networkIndicator === "In Network") {
                        inNetworkCopayArray.push({
                           type: "copay",
                           service: serviceName,
                           language: builtLanguage,
                        });
                        inBenefitArray.push(...inNetworkCopayArray);
                        numOfInNetworkBenefit++;
                     } else if(benefit.networkIndicator === "Both" || benefit.networkIndicator === "Both") {
                        //in network
                        inNetworkCopayArray.push({
                           type: "copay",
                           service: serviceName,
                           language: builtLanguage,
                        });
                        inBenefitArray.push(...inNetworkCopayArray);
                        numOfInNetworkBenefit++;
                        //out of network
                        outNetworkCopayArray.push({
                           type: "copay",
                           service: serviceName,
                           language: builtLanguage,
                        });
                        outBenefitArray.push(...outNetworkCopayArray);
                        numOfOutNetworkBenefit++;
                     } else {
                        outNetworkCopayArray.push({
                           type: "copay",
                           service: serviceName,
                           language: builtLanguage,
                        });
                        outBenefitArray.push(...outNetworkCopayArray);
                        numOfOutNetworkBenefit++;
                     }
                  } else if (benefit.coInsPercentage > 0) { //coInsPercentage
                     if (benefit.networkIndicator === "In Network") {
                        inNetworkCoInsuranceArray.push({
                           type: "coinsurance",
                           service: serviceName,
                           language: builtLanguage,
                        });
                        inBenefitArray.push(...inNetworkCoInsuranceArray);
                        numOfInNetworkBenefit++;
                     } else if(benefit.networkIndicator === "Both" || benefit.networkIndicator === "Both") {
                        //in network
                        inNetworkCoInsuranceArray.push({
                           type: "coinsurance",
                           service: serviceName,
                           language: builtLanguage,
                        });
                        inBenefitArray.push(...inNetworkCoInsuranceArray);
                        numOfInNetworkBenefit++;
                        //out of network
                        outNetworkCoInsuranceArray.push({
                           type: "coinsurance",
                           service: serviceName,
                           language: builtLanguage,
                        });
                        outBenefitArray.push(...outNetworkCoInsuranceArray);
                        numOfOutNetworkBenefit++;
                     } else {
                        outNetworkCoInsuranceArray.push({
                           type: "coinsurance",
                           service: serviceName,
                           language: builtLanguage,
                        });
                        outBenefitArray.push(...outNetworkCoInsuranceArray);
                        numOfOutNetworkBenefit++;
                     }
                  } else if (benefit.deductableAmount > 0) { //deductableAmount
                     if (benefit.networkIndicator === "In Network") {
                        inNetworkDeducibleArray.push({
                           type: "deductable",
                           service: serviceName,
                           language: builtLanguage,
                        });
                        inBenefitArray.push(...inNetworkDeducibleArray);
                        numOfInNetworkBenefit++;
                     } else if(benefit.networkIndicator === "Both" || benefit.networkIndicator === "Both") {
                        //in network
                        inNetworkDeducibleArray.push({
                           type: "deductable",
                           service: serviceName,
                           language: builtLanguage,
                        });
                        inBenefitArray.push(...inNetworkDeducibleArray);
                        numOfInNetworkBenefit++;
                        //out of network
                        outNetworkDeducibleArray.push({
                           type: "deductable",
                           service: serviceName,
                           language: builtLanguage,
                        });
                        outBenefitArray.push(...outNetworkDeducibleArray);
                        numOfOutNetworkBenefit++;
                     } else {
                        outNetworkDeducibleArray.push({
                           type: "deductable",
                           service: serviceName,
                           language: builtLanguage,
                        });
                        outBenefitArray.push(...outNetworkDeducibleArray);
                        numOfOutNetworkBenefit++;
                     }
                  }

                  
                  if (benefit.copayAmount === 0 && benefit.deductableAmount === 0 && benefit.coInsPercentage === 0) { //All are 0 then (display empty value)
                     limitFlag = false;
                     if (benefit.networkIndicator === "In Network") {
                        /*inNetworkNotCovered.push({
                           id: 0,
                           amountflag: false,
                           value: "Plan pays 100%",
                        });*/
                        if (inBenefitArray.length === 0) {
                           inBenefitArray.push({ type: "noamount", service: serviceName, language: this.buildLanguage(benefit)});
                        }
                     } else if(benefit.networkIndicator === "Both" || benefit.networkIndicator === "Both") {
                        //in network
                        if (inBenefitArray.length === 0) {
                           inBenefitArray.push({ type: "noamount", service: serviceName, language: this.buildLanguage(benefit)});
                        }
                        //out of network
                        if (outBenefitArray.length === 0) {
                           outBenefitArray.push({ type: "noamount", service: serviceName, language: this.buildLanguage(benefit)});
                        }
                     } else {
                        /*outNetworkNotCovered.push({
                           id: 0,
                           amountflag: false,
                           value: "Plan pays 100%",
                        });*/
                        if (outBenefitArray.length === 0) {
                           outBenefitArray.push({ type: "noamount", service: serviceName, language: this.buildLanguage(benefit)});
                        }
                     }
                  }
               } else {
                  //coveredIndicator == Not Covered (display empty value)
                  limitFlag = false;
                  if (benefit.networkIndicator === "In Network") {
                     if (inNetworkNotCovered.length === 0) {
                        inNetworkNotCovered.push({
                           id: 0,
                           amountflag: false,
                           value: "Not Covered",
                        });
                        inBenefitArray.push({ type: "notcovered", service: serviceName, language: inNetworkNotCovered });
                     }
                  }else if (benefit.networkIndicator === "Both" || benefit.networkIndicator === "both" ) {
                     if (inNetworkNotCovered.length === 0) {
                        inNetworkNotCovered.push({
                           id: 0,
                           amountflag: false,
                           value: "Not Covered",
                        });
                        inBenefitArray.push({ type: "notcovered", service: serviceName, language: inNetworkNotCovered });
                     }
                     if (outNetworkNotCovered.length === 0) {
                        outNetworkNotCovered.push({
                           id: 0,
                           amountflag: false,
                           value: "Not Covered",
                        });
                        outBenefitArray.push({ type: "notcovered", service: serviceName, language: outNetworkNotCovered });
                     }
                  } else {
                     if (outNetworkNotCovered.length === 0) {
                        outNetworkNotCovered.push({
                           id: 0,
                           amountflag: false,
                           value: "Not Covered",
                        });
                        outBenefitArray.push({ type: "notcovered", service: serviceName, language: outNetworkNotCovered });
                     }
                  }
               }
               if (pairFlag !== "Y" && serviceName !== serviceName_next) {
                  /*******************************************************************************
                   ****      When there is single record either InNetwork or OutNetwork       ****
                  *******************************************************************************/

                  if (benefit.networkIndicator === "In Network") {
                     //In Network
                     inNetworkLanguage = { moreThanOne: numOfInNetworkBenefit > 1 ? true : false, limit: limitString, limitflag: limitFlag, benefit: inBenefitArray };
                     //When there is only InNetwork, it build empty record for OutNetwork
                     if (serviceName == "Gym Reimbursement") {
                        outNetworkNotCovered.push({
                           id: 0,
                           amountflag: false,
                           value: "Not Covered",
                        });
                     } else {
                        outNetworkNotCovered.push({
                           id: 0,
                           amountflag: false,
                           value: "Not Applicable",
                        });
                     }
                     outBenefitArray.push({ type: "noamount", service: serviceName, language: outNetworkNotCovered });
                     outNetworkLanguage = { moreThanOne: numOfOutNetworkBenefit > 1 ? true : false, limit: limitString, limitflag: limitFlag, benefit: outBenefitArray };
                  }else if (benefit.networkIndicator === "Both" || benefit.networkIndicator === "both") {
                        //both
                        //In Network
                        inNetworkLanguage = { moreThanOne: numOfInNetworkBenefit > 1 ? true : false, limit: limitString, limitflag: limitFlag, benefit: inBenefitArray };
                        //When there is only InNetwork, it build empty record for OutNetwork
                        if (serviceName == "Gym Reimbursement") {
                           outNetworkNotCovered.push({
                              id: 0,
                              amountflag: false,
                              value: "Not Covered",
                           });
                           inNetworkNotCovered.push({
                              id: 0,
                              amountflag: false,
                              value: "Not Covered",
                           });
                        // } else {
                        //    outNetworkNotCovered.push({
                        //       id: 0,
                        //       amountflag: false,
                        //       value: "Not Applicable",
                        //    });
                        }
                        outBenefitArray.push({ type: "noamount", service: serviceName, language: outNetworkNotCovered });
                        outNetworkLanguage = { moreThanOne: numOfOutNetworkBenefit > 1 ? true : false, limit: limitString, limitflag: limitFlag, benefit: outBenefitArray };
                        //out of network
                        outNetworkLanguage = { moreThanOne: numOfOutNetworkBenefit > 1 ? true : false, limit: limitString, limitflag: limitFlag, benefit: outBenefitArray };
                        //When there is only OutNetwork, it build empty record for InNetwork
                        if (serviceName == "Gym Reimbursement") {
                           inNetworkNotCovered.push({
                              id: 0,
                              amountflag: false,
                              value: "Not Covered",
                           });
                        // } else {
                        //    inNetworkNotCovered.push({
                        //       id: 0,
                        //       amountflag: false,
                        //       value: "Not Applicable",
                        //    });
                        }
                        inBenefitArray.push({ type: "noamount", service: serviceName, language: inNetworkNotCovered });
                        inNetworkLanguage = { moreThanOne: numOfInNetworkBenefit > 1 ? true : false, limit: limitString, limitflag: limitFlag, benefit: inBenefitArray };
            
                  } else {
                     //Out Network
                     outNetworkLanguage = { moreThanOne: numOfOutNetworkBenefit > 1 ? true : false, limit: limitString, limitflag: limitFlag, benefit: outBenefitArray };
                     //When there is only OutNetwork, it build empty record for InNetwork
                     if (serviceName == "Gym Reimbursement") {
                        inNetworkNotCovered.push({
                           id: 0,
                           amountflag: false,
                           value: "Not Covered",
                        });
                     } else {
                        inNetworkNotCovered.push({
                           id: 0,
                           amountflag: false,
                           value: "Not Applicable",
                        });
                     }
                     inBenefitArray.push({ type: "noamount", service: serviceName, language: inNetworkNotCovered });
                     inNetworkLanguage = { moreThanOne: numOfInNetworkBenefit > 1 ? true : false, limit: limitString, limitflag: limitFlag, benefit: inBenefitArray };
                  }

                  //Build SubCategory
                  subCategory.push({
                     sortOrder: benefit.MBRBSDLDataMatrix__SortOrder,
                     BSDL: benefit.BSDL,
                     serviceName: serviceName,
                     inNetworkLanguage: inNetworkLanguage,
                     outOfNetworkLanguage: outNetworkLanguage,
                  });

                  //Reset variables for next service
                  numOfInNetworkBenefit = 0;
                  numOfOutNetworkBenefit = 0;
                  inBenefitArray = [];
                  outBenefitArray = [];
                  inNetworkCopayArray = [];
                  outNetworkCopayArray = [];
                  inNetworkCoInsuranceArray = [];
                  outNetworkCoInsuranceArray = [];
                  inNetworkDeducibleArray = [];
                  outNetworkDeducibleArray = [];
                  inNetworkNotCovered = [];
                  outNetworkNotCovered = [];
                  inNetworkLanguage = "";
                  outNetworkLanguage = "";
                  pairFlag = "N";
                  //end
               } else {
                  /*******************************************************************************
                   ****           When there is a pair for inNetwork/outNetwork               ****
                  *******************************************************************************/
                  pairFlag = "Y";
                  //Add Network Details
                  if (benefit.networkIndicator === "In Network" && inBenefitArray.length > 0) {
                     inNetworkLanguage = { moreThanOne: numOfInNetworkBenefit > 1 ? true : false, limit: limitString, limitflag: limitFlag, benefit: inBenefitArray };
                  }
                  if (benefit.networkIndicator === "Out of Network" && outBenefitArray.length > 0) {
                     outNetworkLanguage = { moreThanOne: numOfOutNetworkBenefit > 1 ? true : false, limit: limitString, limitflag: limitFlag, benefit: outBenefitArray };
                  }

                  //Check if both inNetwork/outNetwork pair get mapped
                  if (inBenefitArray.length > 0 && outBenefitArray.length > 0) {
                     //Build SubCategory
                     subCategory.push({
                        sortOrder: benefit.MBRBSDLDataMatrix__SortOrder,
                        BSDL: benefit.BSDL,
                        serviceName: serviceName,
                        inNetworkLanguage: inNetworkLanguage,
                        outOfNetworkLanguage: outNetworkLanguage,
                     });

                     //Reset variables for next service
                     numOfInNetworkBenefit = 0;
                     numOfOutNetworkBenefit = 0;
                     inBenefitArray = [];
                     outBenefitArray = [];
                     inNetworkCopayArray = [];
                     outNetworkCopayArray = [];
                     inNetworkCoInsuranceArray = [];
                     outNetworkCoInsuranceArray = [];
                     inNetworkDeducibleArray = [];
                     outNetworkDeducibleArray = [];
                     inNetworkNotCovered = [];
                     outNetworkNotCovered = [];
                     inNetworkLanguage = "";
                     outNetworkLanguage = "";
                     pairFlag = "N";
                  }
               }
            }
            //Assign category name
            categoryName = benefit.MBRBSDLDataMatrix__Category;

            // Check if it reached to the last
            if (i === benefitArray.length - 1) {
               let subCategoryInput = [...subCategory];
               this.benefitCategories.push({
                  CategoryName: categoryName,
                  SubCategory: subCategoryInput,
                  LinkFlag: linkFlag,
                  showPharmacyInfo: showPharmacy,
                  showDentalInfo: showDental,
                  showVisionInfo: showVision,
                  showVisionInfoNonSSO: showVisionNonSSO
               });
               subCategory = [];
            }
         }
         this.benefitCategoriesTracked = [...this.benefitCategories];
         console.log('benefitcategories', this.benefitCategories);
      }else{
         console.error(`${this.errorMessage} Member_BenefitSummary`)
      }
   }

   buildLanguage(benefit, startId = 0) {
      let languages = [];
      let i = 0;
      let calcLang = "";
      let benefitLang = "";
      let isPrefPart = 0;
      // If === 0, then neither
      // If === 1, then preferred or participating benefit
      if (benefit.isPreferred == "Yes" || benefit.isParticipating === "Yes") {
         isPrefPart = 1;
      }
      if (benefit.networkIndicator === "In Network") {
         benefitLang = benefit.InNetworkLanguage;
      } else {
         benefitLang = benefit.OutOfNetworkLanguage;
      }
      // For participating benefits: add "or" to separate the text
      if (startId != 0) {
         languages.push({
            id: startId,
            headflag: false,
            amount: "",
            amountflag: false,
            value: "or",
         });
         startId++;
      }
      // If language if provided, use it and skip the rest
      if (benefitLang != "Calculate") {
         calcLang = "You Pay\n" + benefitLang;
         if (benefit.copayAmount > 0) {
            calcLang += " Copay"
         }
         if (benefit.coInsPercentage > 0) {
            calcLang += " Coinsurance"
         }
         if (isPrefPart === 1) {
            calcLang += " for " + (startId === 0 ? "Preferred" : "Participating") + " provider";
         }
      } else {
         if (benefit.copayAmount > 0) {
            calcLang = "You Pay\n$[x] Copay";
            if (isPrefPart === 1) {
               calcLang += " for " + (startId === 0 ? "Preferred" : "Participating") + " provider";
            }
            if (benefit.LimitUnit != "N/A") {
               calcLang += " per " + benefit.LimitUnit;
            }
         }
         if (benefit.coInsPercentage > 0) {
            if (calcLang === "") {
               calcLang = "You Pay\n";
            } else {
               calcLang += "\nand\n";
            }
            calcLang += "[x]% Coinsurance";
            // Add provider and unit text if copay is absent
            if (benefit.copayAmount === 0) {
               if (isPrefPart === 1) {
                  calcLang += " for " + (startId === 0 ? "Preferred" : "Participating") + " provider";
               }
               if (benefit.LimitUnit != "N/A") {
                  calcLang += " per " + benefit.LimitUnit;
               }
            }
         }
         if (calcLang === "") {
            calcLang = "Plan pays 100%"
            if (isPrefPart === 1) {
               calcLang += " for " + (startId === 0 ? "Preferred" : "Participating") + " provider";
            }
         }
         if (benefit.deductableAmount > 0) {
               calcLang += "\nafter deductible is met";
         }
      }
      calcLang.split("\n").forEach(function (lang) {
         let amountflag = false;
         let langString = "";
         let amountString = "";
         // let addOn;
         if (lang.indexOf("[") >= 0 || lang.indexOf("]") >= 0) {
            //Make string bold having $ and %
            if (lang.indexOf("$") >= 0 || lang.indexOf("%") >= 0) {
               if (lang.indexOf("$") >= 0) {
                  amountString = "$" + (benefit.copayAmount > 0 ? benefit.copayAmount : benefit.deductableAmount);
                  langString = lang.substring(lang.indexOf("]") + 1);
               } else if (lang.indexOf("%") >= 0) {
                  amountString = benefit.coInsPercentage + "%";
                  langString = lang.substring(lang.indexOf("]") + 2);
               }
               amountflag = true;
            }
         } else {
            amountflag = false;
            langString = lang;
         }
         //started in case you will need to bold 100% eventually, but not needed for now, so commented out
         // if(langString = "Plan pays 100%"){
         //    langString = "Plan pays "
         //    addOn = "100%"  
         // }
         languages.push({
            id: startId,
            headflag: i === 0 ? true : false,
            amount: amountString,
            amountflag: amountflag,
            value: langString,
            // bigNum: addOn
         });
         i++;
         startId++;
      });
      return languages;
   }

   buildLinkText(benefitType, name, address) {
      let description = "";
      description = "Your " + benefitType + " benefits are managed by our partner, <a href='" + address + "' >" + name + "</a>. To learn about your benefits and coverage, visit their site.";
      return description;
   }

   ssoLink(){
      let input;
   

      if(this.vendorName =="Express Script" ){
          input = {
              ssoName: "ExpressScripts",
          };
      }
      else if(this.vendorName =="EyeMed" ){
         input = {
             ssoName: "Eyemed",
         };
     }
      else if(this.vendorName =="HealthPlex" ){
         input = {
             ssoName: "HealthFlex",
         };
     }
  
   if (this.callNonSSOLinkEyeMed == false){
      this.callIP("Member_SSOURL",input).then((data) => {
          if (data) {
             let url = data.IPResult.ssoURL;
            
             window.open(url, "_blank");
          }
       }) 

      }
   else {
      
      let url = 'https://attentisconsulting.com/';
      
      window.open(url, "_blank");

   }
      this.closeEDM();
  }

   openExternalDisclaimer(evt){
      
      let group = evt.target.getAttribute("data-id");
      this.isExternalDisclaimerModalOpen = true;
      if (group =="vision"){
         this.vendorName= "EyeMed";
      }
      else if (group =="dental"){
         this.vendorName= "HealthPlex";
      }
      else if (group =="pharmacy"){
         this.vendorName= "Express Script";
      }
      else if (group == "visionnonsso"){
         this.vendorName= "EyeMed";
         this.callNonSSOLinkEyeMed = true;

      }
      this.companyName= "Attentis Health";
      if (this._productBrandGrouping == "Commercial") {
         this.isCommercialESI = true;
      } else {
         this.isMedicareESI = true;
      }
      

   }

   // To close the External Disclaimer Popup
   closeEDM(){
      this.isExternalDisclaimerModalOpen = false;
  }
   // old function for reference
   /*
   buildNetworkLanguage(language, amount, limitCount, limitUnit) {
      let networkArray = [];
      let i = 0;
      language.split("\n").forEach(function (lang) {
         let amountflag = false;
         let langString = "";
         let amountString = "";
         if (lang.indexOf("[") >= 0 || lang.indexOf("]") >= 0) {
            //Make string bold having $ and %
            if (lang.indexOf("$") >= 0 || lang.indexOf("%") >= 0) {
               if (lang.indexOf("$") >= 0) {
                  amountString = "$" + amount;
                  langString = lang.substring(lang.indexOf("]") + 1);
               } else if (lang.indexOf("%") >= 0) {
                  amountString = amount + "%";
                  langString = lang.substring(lang.indexOf("]") + 2);
               }
               amountflag = true;
            } else {
               // if (hasLimit === "Yes") {
               if (limitCount > 0) {
                  langString = lang.substring(0, lang.indexOf("[")) + limitCount + lang.substring(lang.indexOf("]") + 1);
                  amountflag = false;
               }
            }
         } else {
            amountflag = false;
            langString = lang;
         }
         networkArray.push({
            id: i,
            headflag: i === 0 ? true : false,
            amount: amountString,
            amountflag: amountflag,
            value: langString,
         });
         i++;
      });
      return networkArray;
   }
   */

   callIP(ipMethod, inputMap) {
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

   filterCategoryName(event) {
      // Debouncing this method: do not update the reactive property as
      // long as this function is being called within a delay of 300 ms.
      // This is to avoid filtering a very large number of list.
      window.clearTimeout(this.delayTimeout);
      let searchValue = event.target.value;
      // eslint-disable-next-line @lwc/lwc/no-async-operation
      this.delayTimeout = setTimeout(() => {
         if (searchValue !== "") {
            let searchStr = searchValue.toLowerCase();
            let filteredCategories = [];
            //Filter with Category Name and Service Name
            filteredCategories = this.benefitCategoriesTracked.filter((category) => {
               return category.CategoryName.toLowerCase().includes(searchStr) || category.SubCategory.some((sub) => sub.serviceName.toLowerCase().includes(searchStr));
            });
            //Assigning filteredCategories to Array.
            this.benefitCategories = [];
            this.benefitCategories = [...filteredCategories];
         } else {
            this.benefitCategories = [...this.benefitCategoriesTracked];
         }
      }, 300);
   }
}
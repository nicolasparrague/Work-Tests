import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getDataHandler } from "omnistudio/utility";
import { loadScript } from 'lightning/platformResourceLoader';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import pubsub from "omnistudio/pubsub";

export default class MemberClaimsFinancialSummary extends OmniscriptBaseMixin(NavigationMixin(LightningElement)) {
    showModal = false;
    loading;
    errorMessage;
    tenantUrl;
    isDisabled;
    showRadio;
    errorMessage ='Error --> No data returned from IP'

    // hfclabel = "Download Healthcare Financial Summary";
    // Date Picker Variables
    dateEntered;
    today;
    todayT;
    todayTransformed;
    todayLess24;
    todayPlus24;
    allowAll;

    // Date Options Variable
    dateSelected = 'byYear';
    dateFrom;
    dateTo;
    yearToDate;
    fromDateMessage;
    toDateMessage;
    fromValidate;
    toValidate;

    // Export to Excel
    claimsTableStructure;
    claimsTracked = [];
    claimsFilteredDate = [];
    claimsFileName = 'Healthcare Financial Summary';

    // Select Member
    memberKID;
    signedInMemberId;
    signedInMemberName;
    searchAllRecords;

    //Accessibility
    costCalculator;

    pubSubObj;

    @api
    get userid() {
        return this._userId;
    }
    set userid(val) {
        this._userId = val;
    }

    _hfclabel = "Download Healthcare Financial Summary";

    @api
    get hfclabel() {
        return this._hfclabel;
    }
    set hfclabel(value) {
        this._hfclabel = value ? value : this._hfclabel;
    }

    // @api
    // get hfclabelaccessibility() {
    //     return this._hfclabelaccessibility;
    // }
    // set hfclabelaccessibility(value) {
    //     this._hfclabelaccessibility = value ? value : this._hfclabelaccessibility
    // }

    connectedCallback() {

        // Retrieve KID
        this.pubSubObj = {
            memberListAction: this.getPubsubInfo.bind(this)
        }
        pubsub.register('MemberSelection', this.pubSubObj);

        // Get Today's date
        this.today = new Date();
        var ddmap = String(this.today.getDate()).padStart(2, "0");
        var mmmap = String(this.today.getMonth() + 1).padStart(2, "0"); //January is 0!
        var yyyymap = this.today.getFullYear();
        this.today = mmmap + "/" + ddmap + "/" + yyyymap;

        this.todayLess24 = new Date();
        var ddLess = String(this.todayLess24.getDate()).padStart(2, "0");
        var mmLess = String(this.todayLess24.getMonth() + 1).padStart(2, "0"); //January is 0!
        var yyyyLess = this.todayLess24.getFullYear() - 2;
        this.todayLess24 = mmLess + "/" + ddLess + "/" + yyyyLess;

        this.todayPlus24 = new Date();
        var ddPlus = String(this.todayPlus24.getDate()).padStart(2, "0");
        var mmPlus = String(this.todayPlus24.getMonth() + 1).padStart(2, "0"); //January is 0!
        var yyyyPlus = this.todayPlus24.getFullYear() + 2;
        this.todayPlus24 = mmPlus + "/" + ddPlus + "/" + yyyyPlus;

        // Define year-to-date
        this.yearToDate = new Date();
        this.yearToDate = '01' + "/" + '01' + "/" + yyyymap;

        this.allowAll = 'true';
        this.buidURL();
    }

    async renderedCallback() {
        Promise.all([
            //loadScript(this, '../resource/omnistudio__SheetJS'),
            loadScript(this, '../resource/xlsx'),
            loadScript(this, '../resource/pdfJSTable'),
            //loadScript(this, '../resource/SheetStyleJSV3')
        ]).catch(e => {
            console.error(e);
        })


        const  focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const modal = this.template.querySelector(".modalAccessibility");
  
        if (modal != undefined){
           const firstFocusableElement = modal.querySelectorAll(focusableElements)[0]; // get first element to be focused inside modal
           const focusableContent = modal.querySelectorAll(focusableElements);
           const lastFocusableElement = focusableContent[focusableContent.length - 1]; // get last element to be focused inside modal         
           
              var me = this;
              window.addEventListener('keydown', function(event) {
              let isTabPressed = event.key === 'Tab' || event.keyCode === 9;
            
                 if (!isTabPressed) {
                    return;
                 }
  
                 if (event.shiftKey) { // if shift key pressed for shift + tab combination
                    if (me.template.activeElement === firstFocusableElement) {
                       lastFocusableElement.focus(); // add focus for the last focusable element
                       event.preventDefault();
                 }
                 } else { // if tab key is pressed
                    if (me.template.activeElement === lastFocusableElement) { // if focused has reached to last focusable element then focus first focusable element after pressing tab
                       firstFocusableElement.focus(); // add focus for the first focusable element
                       event.preventDefault();
                    }
                 }
              });
  
           firstFocusableElement.focus();
  
              window.addEventListener('keyup', function(event) {
                 if(event.keyCode === 27 || event.key === "Escape"){
                    me.closeModal();
                 }
              });
        }//end modal focus       

        //Accessibility Focus to radio buttons
        const customDateRadio = this.template.querySelector(".customDateRadio");
        if(customDateRadio != undefined){
            customDateRadio.addEventListener("click", function() {
                customDateRadio.focus();                
            });
        }

    }

    getPubsubInfo(pubsubResponse) {
        if (pubsubResponse.listOfMember) {
            this._memberList = pubsubResponse.listOfMember;
        }
        this.getMemberKID(pubsubResponse);
        // this.dateSelected = 'byYear';
        // this.showRadio = false;
        // this.isDisabled = false;
        // this.errorMessage = false;
    }

    getMemberKID(memberId) {
        this.memberKID = memberId.memberId;
        this.selectedByDefault();
    }

    selectedByDefault() {
        let radio1 = this.template.querySelector(".radioByYear").checked;
        let radio2 = this.template.querySelector(".radioByRange").checked;
        // Keep the option checked if the member changes
        if (radio1 == false && radio2 == false) {
            this.template.querySelector(".radioByYear").checked = true;
        } else if (radio1 == false && radio2 == true) {
            this.template.querySelector(".radioByRange").checked = true;
        } else if (radio1 == true && radio2 == false) {
            this.template.querySelector(".radioByYear").checked = true;
        }
    }

    selectDateOption(evt) {
        if (evt) {
            this.dateSelected = evt.target.getAttribute('value');

            if (this.dateSelected == 'byYear') {
                this.showRadio = false;
                if (this.toDateMessage == true || this.fromDateMessage == true) {
                    this.isDisabled = false;
                } else {
                    this.isDisabled = false;
                }
            }

            if (this.dateSelected == 'byRange') {
                this.showRadio = true;
                if (this.toDateMessage == true || this.fromDateMessage == true) {
                    this.isDisabled = true;
                } else {
                    this.isDisabled = false;
                }
            }
        }

        //Accessibility Focus to radio buttons
        const yearToDateRadio = this.template.querySelector(".yearToDateRadio");
        if(yearToDateRadio != undefined){
            yearToDateRadio.addEventListener("click", function(event) {
                yearToDateRadio.focus();
            });
        }      


    }

    transformDate(evt) {
        if (evt) {
            this.dateEntered = evt.target.value;
            // Transform date entered to this format: yyyy-mm-dd
            // Desktop Received Values => 1/15/2021
            // Mobile Received Values => 2021-01-15
            // MPV-1017 - HCFS document downloaded using Custom Date Range filter is not as per Filter Criteria - Mobile
            var isMobile;
            if (window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes('CommunityHybridContainer')) {
                isMobile = this.dateEntered.split("-");
                isMobile = isMobile[1] + '/' + isMobile[2] + '/' + isMobile[0];
                this.todayTransformed = new Date(isMobile);
            } else {
                this.todayTransformed = new Date(this.dateEntered);
            }

            //this.todayTransformed = new Date(this.dateEntered);
            var dd = String(this.todayTransformed.getDate()).padStart(2, "0");
            var mm = String(this.todayTransformed.getMonth() + 1).padStart(2, "0"); //January is 0!
            var yyyy = this.todayTransformed.getFullYear();

            this.todayT = yyyy + "-" + mm + "-" + dd;
            this.dateEntered = mm + "/" + dd + "/" + yyyy;

            let todayCheck = new Date(this.today);

            let typeDate = evt.target.name;
            if (typeDate == 'From') {
                this.dateFrom = this.dateEntered;
                this.fromValidate = new Date(this.dateFrom);
            }
            if (typeDate == 'To') {
                this.dateTo = this.dateEntered;
                this.toValidate = new Date(this.dateTo);
            }

            // Validate range of dates to show error message
            let dateToCheck = new Date(this.todayLess24);

            if (typeDate == 'From') {
                if (evt.target.value == null) {
                    this.fromDateMessage = false;
                } else {
                    if (this.fromValidate > todayCheck || this.fromValidate < dateToCheck) {
                        this.fromDateMessage = true;
                    } else {
                        this.fromDateMessage = false;
                    }
                }
            }
            if (typeDate == 'To') {
                if (evt.target.value == null) {
                    this.toDateMessage = false;
                } else {
                    if (this.toValidate > todayCheck || this.toValidate < dateToCheck) {
                        this.toDateMessage = true;
                    } else {
                        this.toDateMessage = false;
                    }
                }
            }

            // Disable button
            if (this.toDateMessage == true || this.fromDateMessage == true) {
                this.isDisabled = true;
            } else {
                this.isDisabled = false;
            }
        }
    }

    exportDocument(evt) {
        if (evt) {
            if (this.dateSelected == 'byRange') {
                if (this.template.querySelector(".filter_fromDate").value == null) {
                    this.template.querySelector(".filter_fromDate").value = this.todayLess24;
                    this.dateFrom = this.todayLess24;
                    this.fromValidate = new Date(this.dateFrom);//
                    this.fromDateMessage = false;
                }
                if (this.template.querySelector(".filter_toDate").value == null) {
                    this.template.querySelector(".filter_toDate").value = this.today;
                    this.dateTo = this.today;
                    this.toValidate = new Date(this.dateTo);//
                    this.toDateMessage = false;
                }
            }
            let documentType = evt.target.getAttribute('data-btn-id');
            this.loading = true;
            this.errorMessage = false;
            this.getClaims(this.memberKID, documentType);
        }
    }

    getClaims(sessionMemberId, documentType) {
        // Input for memberId individually
        let inputParam = {
            memberId: sessionMemberId,
        };

        // Rename the node if All dropdown was selected
        if(Array.isArray(this._memberList)){
            for(var i=0; i < this._memberList.length; i++){
                if(sessionMemberId == this._memberList[i].value){
                    if(this._memberList[i].label == 'All'){
                        console.log('All');
                        inputParam = {};
                        inputParam.subscriberId = sessionMemberId;
                    }
                }
            }
        }

        let datasourcedef = JSON.stringify({
            "type": "integrationprocedure",
            "value": {
                "ipMethod": 'Member_ClaimsFinancialSummary',
                "inputMap": inputParam,
                "optionsMap": ""
            }
        });

        getDataHandler(datasourcedef).then(data => {
          let newData = JSON.parse(data);
          if(newData.IPResult){
            let claims = newData.IPResult;
            if (claims.success == false) {
                console.error('IP Error..');
                this.loading = false;
                this.errorMessage = true;
            } else {
                const formatter = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2
                });
                this.claimsTracked = [];
                // Summary for All members
                if (claims.length > 0) {
                    this.summaryForAllMembers(claims, documentType, this.dateSelected);
                    return;
                }

                // No claims
                if (claims.length === 0) {
                    this.errorMessage = true;
                    this.loading = false;
                    return;
                }

                // Summary for Member Individually
                if (claims.claimsList.length > 0) {
                } else {
                    this.errorMessage = true;
                    this.loading = false;
                    return;
                }

                this.claimsFilteredDate = [];

                // Medical Sub Total Variables
                let billedAmountSubMedical = 0;
                let amountAllowedSubMedical = 0;
                let planDiscountSubMedical = 0;
                let paidAmountSubMedical = 0;
                let deductibleAmountSubMedical = 0;
                let coInsuranceSubMedical = 0;
                let coPaySubMedical = 0;
                let youPaySubMedical = 0;

                // Hospital Sub Total Variables
                let billedAmountSubHospital = 0;
                let amountAllowedSubHospital = 0;
                let planDiscountSubHospital = 0;
                let paidAmountSubHospital = 0;
                let deductibleAmountSubHospital = 0;
                let coInsuranceSubHospital = 0;
                let coPaySubHospital = 0;
                let youPaySubHospital = 0;

                // Pharmacy Sub Total Variables
                let billedAmountSubPharmacy = 0;
                let amountAllowedSubPharmacy = 0;
                let planDiscountSubPharmacy = 0;
                let paidAmountSubPharmacy = 0;
                let deductibleAmountSubPharmacy = 0;
                let coInsuranceSubPharmacy = 0;
                let coPaySubPharmacy = 0;
                let youPaySubPharmacy = 0;

                // Dental Sub Total Variables
                let billedAmountSubDental = 0;
                let amountAllowedSubDental = 0;
                let planDiscountSubDental = 0;
                let paidAmountSubDental = 0;
                let deductibleAmountSubDental = 0;
                let coInsuranceSubDental = 0;
                let coPaySubDental = 0;
                let youPaySubDental = 0;

                // Total Summary
                let totalBilledAmount = 0;
                let totalAmountAllowed = 0;
                let totalPlanDiscount = 0;
                let totalPaidAmount = 0;
                let totalDeductibleAmount = 0;
                let totalCoInsurance = 0;
                let totalCoPay = 0;
                let totalYouPay = 0;

                let claimMemberName;
                // Year to Date
                if (this.dateSelected == 'byYear') {
                    claimMemberName = claims.memberName;
                    claims.claimsList.forEach((claim) => {
                        // Formatted Values
                        if (claim.billedAmount == null || claim.billedAmount == undefined) {
                            claim.billedAmount = 0;
                        }
                        if (claim.amountAllowed == null || claim.amountAllowed == undefined) {
                            claim.amountAllowed = 0;
                        }
                        if (claim.planDiscount == null || claim.planDiscount == undefined) {
                            claim.planDiscount = 0;
                        }
                        if (claim.paidAmount == null || claim.paidAmount == undefined) {
                            claim.paidAmount = 0;
                        }
                        if (claim.deductibleAmount == null || claim.deductibleAmount == undefined) {
                            claim.deductibleAmount = 0;
                        }
                        if (claim.coInsurance == null || claim.coInsurance == undefined) {
                            claim.coInsurance = 0;
                        }
                        if (claim.coPay == null || claim.coPay == undefined) {
                            claim.coPay = 0;
                        }
                        if (claim.youPay == null || claim.youPay == undefined) {
                            claim.youPay = 0;
                        }

                        var claimDate = new Date(claim.serviceStartDate);
                        var yearDate = new Date(this.yearToDate);
                        var todayDate = new Date(this.today);
                        if (claimDate >= yearDate && claimDate <= todayDate) {
                            // MPV-951 - Show only Finalized Claims
                            if (claim.claimStatus == 'Finalized') {
                                // Counter for Medical Claims
                                if (claim.claimType == 'Medical') {
                                    billedAmountSubMedical = billedAmountSubMedical + claim.billedAmount;
                                    amountAllowedSubMedical = amountAllowedSubMedical + claim.amountAllowed;
                                    planDiscountSubMedical = planDiscountSubMedical + claim.planDiscount;
                                    paidAmountSubMedical = paidAmountSubMedical + claim.paidAmount;
                                    deductibleAmountSubMedical = deductibleAmountSubMedical + claim.deductibleAmount;
                                    coInsuranceSubMedical = coInsuranceSubMedical + claim.coInsurance;
                                    coPaySubMedical = coPaySubMedical + claim.coPay;
                                    youPaySubMedical = youPaySubMedical + claim.youPay;
                                }

                                // Counter for Hospital Claims
                                if (claim.claimType == 'Hospital') {
                                    billedAmountSubHospital = billedAmountSubHospital + claim.billedAmount;
                                    amountAllowedSubHospital = amountAllowedSubHospital + claim.amountAllowed;
                                    planDiscountSubHospital = planDiscountSubHospital + claim.planDiscount;
                                    paidAmountSubHospital = paidAmountSubHospital + claim.paidAmount;
                                    deductibleAmountSubHospital = deductibleAmountSubHospital + claim.deductibleAmount;
                                    coInsuranceSubHospital = coInsuranceSubHospital + claim.coInsurance;
                                    coPaySubHospital = coPaySubHospital + claim.coPay;
                                    youPaySubHospital = youPaySubHospital + claim.youPay;
                                }

                                // Counter for Pharmacy Claims
                                if (claim.claimType == 'Pharmacy') {
                                    billedAmountSubPharmacy = billedAmountSubPharmacy + claim.billedAmount;
                                    amountAllowedSubPharmacy = amountAllowedSubPharmacy + claim.amountAllowed;
                                    planDiscountSubPharmacy = planDiscountSubPharmacy + claim.planDiscount;
                                    paidAmountSubPharmacy = paidAmountSubPharmacy + claim.paidAmount;
                                    deductibleAmountSubPharmacy = deductibleAmountSubPharmacy + claim.deductibleAmount;
                                    coInsuranceSubPharmacy = coInsuranceSubPharmacy + claim.coInsurance;
                                    coPaySubPharmacy = coPaySubPharmacy + claim.coPay;
                                    youPaySubPharmacy = youPaySubPharmacy + claim.youPay;
                                }

                                // Counter for Dental Claims
                                if (claim.claimType == 'Dental') {
                                    billedAmountSubDental = billedAmountSubDental + claim.billedAmount;
                                    amountAllowedSubDental = amountAllowedSubDental + claim.amountAllowed;
                                    planDiscountSubDental = planDiscountSubDental + claim.planDiscount;
                                    paidAmountSubDental = paidAmountSubDental + claim.paidAmount;
                                    deductibleAmountSubDental = deductibleAmountSubDental + claim.deductibleAmount;
                                    coInsuranceSubDental = coInsuranceSubDental + claim.coInsurance;
                                    coPaySubDental = coPaySubDental + claim.coPay;
                                    youPaySubDental = youPaySubDental + claim.youPay;
                                }
                                // Formatted Values
                                if (claim.billedAmount == null || claim.billedAmount == undefined) {
                                    claim.billedAmount = 0;
                                } else {
                                    claim.billedAmount = claim.billedAmount;
                                }
                                if (claim.amountAllowed == null || claim.amountAllowed == undefined) {
                                    claim.amountAllowed = 0;
                                } else {
                                    claim.amountAllowed = claim.amountAllowed;
                                }
                                if (claim.planDiscount == null || claim.planDiscount == undefined) {
                                    claim.planDiscount = 0;
                                } else {
                                    claim.planDiscount = claim.planDiscount;
                                }
                                if (claim.paidAmount == null || claim.paidAmount == undefined) {
                                    claim.paidAmount = 0;
                                } else {
                                    claim.paidAmount = claim.paidAmount;
                                }
                                if (claim.deductibleAmount == null || claim.deductibleAmount == undefined) {
                                    claim.deductibleAmount = 0;
                                } else {
                                    claim.deductibleAmount = claim.deductibleAmount;
                                }
                                if (claim.coInsurance == null || claim.coInsurance == undefined) {
                                    claim.coInsurance = 0;
                                } else {
                                    claim.coInsurance = claim.coInsurance;
                                }
                                if (claim.coPay == null || claim.coPay == undefined) {
                                    claim.coPay = 0;
                                } else {
                                    claim.coPay = claim.coPay;
                                }
                                if (claim.youPay == null || claim.youPay == undefined) {
                                    claim.youPay = 0;
                                } else {
                                    claim.youPay = claim.youPay;
                                }

                                this.claimsFilteredDate.push(claim);
                            }
                        }
                    });
                }

                // Range of Dates
                if (this.dateSelected == 'byRange') {
                    claimMemberName = claims.memberName;
                    claims.claimsList.forEach((claim) => {
                        // Formatted Values
                        if (claim.billedAmount == null || claim.billedAmount == undefined) {
                            claim.billedAmount = 0;
                        }
                        if (claim.amountAllowed == null || claim.amountAllowed == undefined) {
                            claim.amountAllowed = 0;
                        }
                        if (claim.planDiscount == null || claim.planDiscount == undefined) {
                            claim.planDiscount = 0;
                        }
                        if (claim.paidAmount == null || claim.paidAmount == undefined) {
                            claim.paidAmount = 0;
                        }
                        if (claim.deductibleAmount == null || claim.deductibleAmount == undefined) {
                            claim.deductibleAmount = 0;
                        }
                        if (claim.coInsurance == null || claim.coInsurance == undefined) {
                            claim.coInsurance = 0;
                        }
                        if (claim.coPay == null || claim.coPay == undefined) {
                            claim.coPay = 0;
                        }
                        if (claim.youPay == null || claim.youPay == undefined) {
                            claim.youPay = 0;
                        }

                        var claimToDate = new Date(claim.serviceStartDate);

                        //MPV-1568 when clicking on Custom Date Range for the first time, date To is getting null
                        var fromDate;
                        var toDate;
                        if (this.dateFrom == undefined || this.dateFrom == null) {
                            let fromVal = this.template.querySelector(".filter_fromDate").value;
                            fromDate = new Date(fromVal);
                        } else {
                            fromDate = new Date(this.dateFrom);
                        }

                        if (this.dateTo == undefined || this.dateFrom == null) {
                            let toVal = this.template.querySelector(".filter_toDate").value;
                            toDate = new Date(toVal);
                        } else {
                            toDate = new Date(this.dateTo);
                        }

                        if (claimToDate >= fromDate && claimToDate <= toDate) {
                            // MPV-951 - Show only Finalized Claims
                            if (claim.claimStatus == 'Finalized') {
                                // Counter for Medical Claims
                                if (claim.claimType == 'Medical') {
                                    billedAmountSubMedical = billedAmountSubMedical + claim.billedAmount;
                                    amountAllowedSubMedical = amountAllowedSubMedical + claim.amountAllowed;
                                    planDiscountSubMedical = planDiscountSubMedical + claim.planDiscount;
                                    paidAmountSubMedical = paidAmountSubMedical + claim.paidAmount
                                    deductibleAmountSubMedical = deductibleAmountSubMedical + claim.deductibleAmount;
                                    coInsuranceSubMedical = coInsuranceSubMedical + claim.coInsurance;
                                    coPaySubMedical = coPaySubMedical + claim.coPay;
                                    youPaySubMedical = youPaySubMedical + claim.youPay;
                                }

                                // Counter for Hospital Claims
                                if (claim.claimType == 'Hospital') {
                                    billedAmountSubHospital = billedAmountSubHospital + claim.billedAmount;
                                    amountAllowedSubHospital = amountAllowedSubHospital + claim.amountAllowed;
                                    planDiscountSubHospital = planDiscountSubHospital + claim.planDiscount;
                                    paidAmountSubHospital = paidAmountSubHospital + claim.paidAmount
                                    deductibleAmountSubHospital = deductibleAmountSubHospital + claim.deductibleAmount;
                                    coInsuranceSubHospital = coInsuranceSubHospital + claim.coInsurance;
                                    coPaySubHospital = coPaySubHospital + claim.coPay;
                                    youPaySubHospital = youPaySubHospital + claim.youPay;
                                }

                                // Counter for Pharmacy Claims
                                if (claim.claimType == 'Pharmacy') {
                                    billedAmountSubPharmacy = billedAmountSubPharmacy + claim.billedAmount;
                                    amountAllowedSubPharmacy = amountAllowedSubPharmacy + claim.amountAllowed;
                                    planDiscountSubPharmacy = planDiscountSubPharmacy + claim.planDiscount;
                                    paidAmountSubPharmacy = paidAmountSubPharmacy + claim.paidAmount
                                    deductibleAmountSubPharmacy = deductibleAmountSubPharmacy + claim.deductibleAmount;
                                    coInsuranceSubPharmacy = coInsuranceSubPharmacy + claim.coInsurance;
                                    coPaySubPharmacy = coPaySubPharmacy + claim.coPay;
                                    youPaySubPharmacy = youPaySubPharmacy + claim.youPay;
                                }

                                // Counter for Dental Claims
                                if (claim.claimType == 'Dental') {
                                    billedAmountSubDental = billedAmountSubDental + claim.billedAmount;
                                    amountAllowedSubDental = amountAllowedSubDental + claim.amountAllowed;
                                    planDiscountSubDental = planDiscountSubDental + claim.planDiscount;
                                    paidAmountSubDental = paidAmountSubDental + claim.paidAmount
                                    deductibleAmountSubDental = deductibleAmountSubDental + claim.deductibleAmount;
                                    coInsuranceSubDental = coInsuranceSubDental + claim.coInsurance;
                                    coPaySubDental = coPaySubDental + claim.coPay;
                                    youPaySubDental = youPaySubDental + claim.youPay;
                                }
                                // Formatted Values
                                claim.memberName = claimMemberName;
                                if (claim.billedAmount == null || claim.billedAmount == undefined) {
                                    claim.billedAmount = 0;
                                } else {
                                    claim.billedAmount = claim.billedAmount;
                                }
                                if (claim.amountAllowed == null || claim.amountAllowed == undefined) {
                                    claim.amountAllowed = 0;
                                } else {
                                    claim.amountAllowed = claim.amountAllowed;
                                }
                                if (claim.planDiscount == null || claim.planDiscount == undefined) {
                                    claim.planDiscount = 0;
                                } else {
                                    claim.planDiscount = claim.planDiscount;
                                }
                                if (claim.paidAmount == null || claim.paidAmount == undefined) {
                                    claim.paidAmount = 0;
                                } else {
                                    claim.paidAmount = claim.paidAmount;
                                }
                                if (claim.deductibleAmount == null || claim.deductibleAmount == undefined) {
                                    claim.deductibleAmount = 0;
                                } else {
                                    claim.deductibleAmount = claim.deductibleAmount;
                                }
                                if (claim.coInsurance == null || claim.coInsurance == undefined) {
                                    claim.coInsurance = 0;
                                } else {
                                    claim.coInsurance = claim.coInsurance;
                                }
                                if (claim.coPay == null || claim.coPay == undefined) {
                                    claim.coPay = 0;
                                } else {
                                    claim.coPay = claim.coPay;
                                }
                                if (claim.youPay == null || claim.youPay == undefined) {
                                    claim.youPay = 0;
                                } else {
                                    claim.youPay = claim.youPay;
                                }

                                this.claimsFilteredDate.push(claim);
                            }
                        }
                    });
                }

                totalBilledAmount = billedAmountSubMedical + billedAmountSubHospital + billedAmountSubPharmacy + billedAmountSubDental;
                totalAmountAllowed = amountAllowedSubMedical + amountAllowedSubHospital + amountAllowedSubPharmacy + amountAllowedSubDental;
                totalPlanDiscount = planDiscountSubMedical + planDiscountSubHospital + planDiscountSubPharmacy + planDiscountSubDental;
                totalPaidAmount = paidAmountSubMedical + paidAmountSubHospital + paidAmountSubPharmacy + paidAmountSubDental;
                totalDeductibleAmount = deductibleAmountSubMedical + deductibleAmountSubHospital + deductibleAmountSubPharmacy + deductibleAmountSubDental;
                totalCoInsurance = coInsuranceSubMedical + coInsuranceSubHospital + coInsuranceSubPharmacy + coInsuranceSubDental;
                totalCoPay = coPaySubMedical + coPaySubHospital + coPaySubPharmacy + coPaySubDental;
                totalYouPay = youPaySubMedical + youPaySubHospital + youPaySubPharmacy + youPaySubDental;

                // Error message displayed if there is no claims
                if (this.claimsFilteredDate.length === 0) {
                    this.loading = false;
                    this.errorMessage = true;
                    return;
                }

                this.claimsTracked = this.claimsFilteredDate.sort((a, b) => {
                    const colA = new Date(a['serviceStartDate']);
                    const colB = new Date(b['serviceStartDate']);
                    return colB - colA;
                });

                //this.claimsTracked = JSON.parse(JSON.stringify(this.claimsTracked));

                if (documentType == 'excel') {
                    // Adding Member Name node
                    for (var x = 0; x < this.claimsTracked.length; x++) {
                        this.claimsTracked[x].memberName = claimMemberName;
                    }

                    let medicalSubTotal = {
                        'memberName': 'SubTotal Medical',
                        'claimType': ' ',
                        'serviceStartDate': ' ',
                        'billedAmount': billedAmountSubMedical,
                        'amountAllowed': amountAllowedSubMedical,
                        'planDiscount': planDiscountSubMedical,
                        'paidAmount': paidAmountSubMedical,
                        'deductibleAmount': deductibleAmountSubMedical,
                        'coInsurance': coInsuranceSubMedical,
                        'coPay': coPaySubMedical,
                        'youPay': youPaySubMedical,
                    };

                    let hospitalSubTotal = {
                        'memberName': 'SubTotal Hospital',
                        'claimType': ' ',
                        'serviceStartDate': ' ',
                        'billedAmount': billedAmountSubHospital,
                        'amountAllowed': amountAllowedSubHospital,
                        'planDiscount': planDiscountSubHospital,
                        'paidAmount': paidAmountSubHospital,
                        'deductibleAmount': deductibleAmountSubHospital,
                        'coInsurance': coInsuranceSubHospital,
                        'coPay': coPaySubHospital,
                        'youPay': youPaySubHospital,
                    };

                    let pharmacySubTotal = {
                        'memberName': 'SubTotal Pharmacy',
                        'claimType': ' ',
                        'serviceStartDate': ' ',
                        'billedAmount': billedAmountSubPharmacy,
                        'amountAllowed': amountAllowedSubPharmacy,
                        'planDiscount': planDiscountSubPharmacy,
                        'paidAmount': paidAmountSubPharmacy,
                        'deductibleAmount': deductibleAmountSubPharmacy,
                        'coInsurance': coInsuranceSubPharmacy,
                        'coPay': coPaySubPharmacy,
                        'youPay': youPaySubPharmacy,
                    };

                    let dentalSubTotal = {
                        'memberName': 'SubTotal Dental',
                        'claimType': ' ',
                        'serviceStartDate': ' ',
                        'billedAmount': billedAmountSubDental,
                        'amountAllowed': amountAllowedSubDental,
                        'planDiscount': planDiscountSubDental,
                        'paidAmount': paidAmountSubDental,
                        'deductibleAmount': deductibleAmountSubDental,
                        'coInsurance': coInsuranceSubDental,
                        'coPay': coPaySubDental,
                        'youPay': youPaySubDental,
                    };

                    let totalSummary = {
                        'memberName': 'HCFS Total',
                        'claimType': ' ',
                        'serviceStartDate': ' ',
                        'billedAmount': billedAmountSubMedical + billedAmountSubHospital + billedAmountSubPharmacy + billedAmountSubDental,
                        'amountAllowed': amountAllowedSubMedical + amountAllowedSubHospital + amountAllowedSubPharmacy + amountAllowedSubDental,
                        'planDiscount': planDiscountSubMedical + planDiscountSubHospital + planDiscountSubPharmacy + planDiscountSubDental,
                        'paidAmount': paidAmountSubMedical + paidAmountSubHospital + paidAmountSubPharmacy + paidAmountSubDental,
                        'deductibleAmount': deductibleAmountSubMedical + deductibleAmountSubHospital + deductibleAmountSubPharmacy + deductibleAmountSubDental,
                        'coInsurance': coInsuranceSubMedical + coInsuranceSubHospital + coInsuranceSubPharmacy + coInsuranceSubDental,
                        'coPay': coPaySubMedical + coPaySubHospital + coPaySubPharmacy + coPaySubDental,
                        'youPay': youPaySubMedical + youPaySubHospital + youPaySubPharmacy + youPaySubDental,
                    }

                    this.claimsTracked.push(medicalSubTotal);
                    this.claimsTracked.push(hospitalSubTotal);
                    this.claimsTracked.push(pharmacySubTotal);
                    this.claimsTracked.push(dentalSubTotal);
                    this.claimsTracked.push(totalSummary);

                    this.generateExcel();
                }

                if (documentType == 'pdf') {
                    let claimsTableData = [];
                    for (var n = 0; n < this.claimsTracked.length; n++) {
                        var claim = {
                            'Member Name': claimMemberName,
                            'Claim Type': this.claimsTracked[n].claimType,
                            'Date of Service': this.claimsTracked[n].serviceStartDate,
                            'Amount Billed': this.claimsTracked[n].billedAmount,
                            'Amount Allowed': this.claimsTracked[n].amountAllowed,
                            'Plan Discount': this.claimsTracked[n].planDiscount,
                            'ConnectiCare Paid': this.claimsTracked[n].paidAmount,
                            'Deductible': this.claimsTracked[n].deductibleAmount,
                            'Coinsurance': this.claimsTracked[n].coInsurance,
                            'Copay': this.claimsTracked[n].coPay,
                            'Your Share': this.claimsTracked[n].youPay,
                        };
                        claimsTableData.push(claim);
                    }
                    let medicalSubTotal;
                    let hospitalSubTotal;
                    let pharmacySubTotal;
                    let dentalSubTotal;
                    let totalSummary;

                    medicalSubTotal = {
                        'Member Name': 'SubTotal Medical',
                        'Claim Type': ' ',
                        'Date of Service': ' ',
                        'Amount Billed': billedAmountSubMedical,
                        'Amount Allowed': amountAllowedSubMedical,
                        'Plan Discount': planDiscountSubMedical,
                        'ConnectiCare Paid': paidAmountSubMedical,
                        'Deductible': deductibleAmountSubMedical,
                        'Coinsurance': coInsuranceSubMedical,
                        'Copay': coPaySubMedical,
                        'Your Share': youPaySubMedical,
                    };

                    hospitalSubTotal = {
                        'Member Name': 'SubTotal Hospital',
                        'Claim Type': ' ',
                        'Date of Service': ' ',
                        'Amount Billed': billedAmountSubHospital,
                        'Amount Allowed': amountAllowedSubHospital,
                        'Plan Discount': planDiscountSubHospital,
                        'ConnectiCare Paid': paidAmountSubHospital,
                        'Deductible': deductibleAmountSubHospital,
                        'Coinsurance': coInsuranceSubHospital,
                        'Copay': coPaySubHospital,
                        'Your Share': youPaySubHospital,
                    };

                    pharmacySubTotal = {
                        'Member Name': 'SubTotal Pharmacy',
                        'Claim Type': ' ',
                        'Date of Service': ' ',
                        'Amount Billed': billedAmountSubPharmacy,
                        'Amount Allowed': amountAllowedSubPharmacy,
                        'Plan Discount': planDiscountSubPharmacy,
                        'ConnectiCare Paid': paidAmountSubPharmacy,
                        'Deductible': deductibleAmountSubPharmacy,
                        'Coinsurance': coInsuranceSubPharmacy,
                        'Copay': coPaySubPharmacy,
                        'Your Share': youPaySubPharmacy,
                    };

                    dentalSubTotal = {
                        'Member Name': 'SubTotal Dental',
                        'Claim Type': ' ',
                        'Date of Service': ' ',
                        'Amount Billed': billedAmountSubDental,
                        'Amount Allowed': amountAllowedSubDental,
                        'Plan Discount': planDiscountSubDental,
                        'ConnectiCare Paid': paidAmountSubDental,
                        'Deductible': deductibleAmountSubDental,
                        'Coinsurance': coInsuranceSubDental,
                        'Copay': coPaySubDental,
                        'Your Share': youPaySubDental,
                    };

                    totalSummary = {
                        'Member Name': 'HCFS Total',
                        'Claim Type': ' ',
                        'Date of Service': ' ',
                        'Amount Billed': billedAmountSubMedical + billedAmountSubHospital + billedAmountSubPharmacy + billedAmountSubDental,
                        'Amount Allowed': amountAllowedSubMedical + amountAllowedSubHospital + amountAllowedSubPharmacy + amountAllowedSubDental,
                        'Plan Discount': planDiscountSubMedical + planDiscountSubHospital + planDiscountSubPharmacy + planDiscountSubDental,
                        'ConnectiCare Paid': paidAmountSubMedical + paidAmountSubHospital + paidAmountSubPharmacy + paidAmountSubDental,
                        'Deductible': deductibleAmountSubMedical + deductibleAmountSubHospital + deductibleAmountSubPharmacy + deductibleAmountSubDental,
                        'Coinsurance': coInsuranceSubMedical + coInsuranceSubHospital + coInsuranceSubPharmacy + coInsuranceSubDental,
                        'Copay': coPaySubMedical + coPaySubHospital + coPaySubPharmacy + coPaySubDental,
                        'Your Share': youPaySubMedical + youPaySubHospital + youPaySubPharmacy + youPaySubDental,
                    };
                

                    claimsTableData.push(medicalSubTotal);
                    claimsTableData.push(hospitalSubTotal);
                    claimsTableData.push(pharmacySubTotal);
                    claimsTableData.push(dentalSubTotal);
                    claimsTableData.push(totalSummary);

                    this.generatePDF(claimsTableData);
                }

            }

        }else{
            console.error(`${this.errorMessage} Member_ClaimsFinancialSummary`)
        }
        
        }).catch(error => {
            console.error(`failed at getting IP data => ${error}`);
            this.loading = false;
        });
    }

    summaryForAllMembers(claimListPerMember, documentType, dateSelected) {
        let records = [];

        // Medical Sub Total Variables
        let billedAmountSubMedical = 0;
        let amountAllowedSubMedical = 0;
        let planDiscountSubMedical = 0;
        let paidAmountSubMedical = 0;
        let deductibleAmountSubMedical = 0;
        let coInsuranceSubMedical = 0;
        let coPaySubMedical = 0;
        let youPaySubMedical = 0;

        // Hospital Sub Total Variables
        let billedAmountSubHospital = 0;
        let amountAllowedSubHospital = 0;
        let planDiscountSubHospital = 0;
        let paidAmountSubHospital = 0;
        let deductibleAmountSubHospital = 0;
        let coInsuranceSubHospital = 0;
        let coPaySubHospital = 0;
        let youPaySubHospital = 0;

        // Pharmacy Sub Total Variables
        let billedAmountSubPharmacy = 0;
        let amountAllowedSubPharmacy = 0;
        let planDiscountSubPharmacy = 0;
        let paidAmountSubPharmacy = 0;
        let deductibleAmountSubPharmacy = 0;
        let coInsuranceSubPharmacy = 0;
        let coPaySubPharmacy = 0;
        let youPaySubPharmacy = 0;

        // Dental Sub Total Variables
        let billedAmountSubDental = 0;
        let amountAllowedSubDental = 0;
        let planDiscountSubDental = 0;
        let paidAmountSubDental = 0;
        let deductibleAmountSubDental = 0;
        let coInsuranceSubDental = 0;
        let coPaySubDental = 0;
        let youPaySubDental = 0;

        let perMemberBilledAmount = 0;
        let perMemberAmountAllowed = 0;
        let perMemberPlanDiscount = 0;
        let perMemberPaidAmount = 0;
        let perMemberDeductible = 0;
        let perMemberCoInsurance = 0;
        let perMemberCoPay = 0;
        let perMemberYouPay = 0;

        let subTotalMedical;
        let subTotalHospital;
        let subTotalPharmacy;
        let subTotalDental;
        let totalSummaryAll;

        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        });

        let yearDate;
        let todayDate;
        let fromDate;
        let toDate;


        // Year-to-date filter
        if (dateSelected == 'byYear') {
            yearDate = new Date(this.yearToDate);
            todayDate = new Date(this.today);
        }

        // Range of dates filter
        if (dateSelected == 'byRange') {
            fromDate = new Date(this.dateFrom);
            toDate = new Date(this.dateTo);

            //MPV-1568 when clicking on Custom Date Range for the first time, date To is getting null
            if (this.dateFrom == undefined || this.dateFrom == null) {
                let fromVal = this.template.querySelector(".filter_fromDate").value;
                fromDate = new Date(fromVal);
            } else {
                fromDate = new Date(this.dateFrom);
            }

            if (this.dateTo == undefined || this.dateFrom == null) {
                let toVal = this.template.querySelector(".filter_toDate").value;
                toDate = new Date(toVal);
            } else {
                toDate = new Date(this.dateTo);
            }
        }

        // Filter valid claims in a new node based on Year-to-date
        for (var r = 0; r < claimListPerMember.length; r++) {
            claimListPerMember[r].claimListNew = [];
            for (var z = 0; z < claimListPerMember[r].claimsList.length; z++) {
                var claimDate = new Date(claimListPerMember[r].claimsList[z].serviceStartDate);
                if (dateSelected == 'byYear') {
                    //05/14/2020 >= //01/01/2021
                    //05/14/2020 <= //07/14/2021
                    if (claimDate >= yearDate && claimDate <= todayDate) {
                        var obj = claimListPerMember[r].claimsList[z];
                        claimListPerMember[r].claimListNew.push(obj);
                    }
                }
                if (dateSelected == 'byRange') {
                    if (claimDate >= fromDate && claimDate <= toDate) {
                        var obj = claimListPerMember[r].claimsList[z];
                        claimListPerMember[r].claimListNew.push(obj);
                    }
                }
            }
        }

        let dataToDisplay = false;
        let cleanedMemberList = [];
        // Check if there is data available to show on documents
        for (var a = 0; a < claimListPerMember.length; a++) {
            var addToTable = false;
            if (claimListPerMember[a].claimListNew.length > 0) {
                // Remove members from the iteration whether doesn't have claims in Finalized status
                for (var b = 0; b < claimListPerMember[a].claimListNew.length; b++) {
                    if (claimListPerMember[a].claimListNew[b].claimStatus == 'Finalized') {
                        addToTable = true;
                    }
                }

                if (addToTable == true) {
                    cleanedMemberList.push(claimListPerMember[a]);
                    dataToDisplay = true;
                }
            }
        }

        // Stop the execution if there is no data available filtered previously
        if (dataToDisplay == false) {
            this.loading = false;
            this.errorMessage = true;
            return;
        }

        // Create totals for each member
        for (var member = 0; member < cleanedMemberList.length; member++) {
            let tempName = '';
            tempName = cleanedMemberList[member].memberName;
            perMemberBilledAmount = 0;
            perMemberAmountAllowed = 0;
            perMemberPlanDiscount = 0;
            perMemberPaidAmount = 0;
            perMemberDeductible = 0;
            perMemberCoInsurance = 0;
            perMemberCoPay = 0;
            perMemberYouPay = 0;

            // Counters for each member
            for (var h = 0; h < cleanedMemberList[member].claimListNew.length; h++) {
                // MPV-951 - Show only Finalized Claims
                if (cleanedMemberList[member].claimListNew[h].claimStatus == 'Finalized') {
                    perMemberBilledAmount = perMemberBilledAmount + cleanedMemberList[member].claimListNew[h].billedAmount;
                    perMemberAmountAllowed = perMemberAmountAllowed + cleanedMemberList[member].claimListNew[h].amountAllowed;
                    if(cleanedMemberList[member].claimListNew[h].hasOwnProperty('planDiscount')){
                        perMemberPlanDiscount = perMemberPlanDiscount + cleanedMemberList[member].claimListNew[h].planDiscount;
                    }else{
                        perMemberPlanDiscount = perMemberPlanDiscount;
                    }
                    perMemberPaidAmount = perMemberPaidAmount + cleanedMemberList[member].claimListNew[h].paidAmount;
                    perMemberDeductible = perMemberDeductible + cleanedMemberList[member].claimListNew[h].deductibleAmount;
                    perMemberCoInsurance = perMemberCoInsurance + cleanedMemberList[member].claimListNew[h].coInsurance;
                    perMemberCoPay = perMemberCoPay + cleanedMemberList[member].claimListNew[h].coPay;
                    perMemberYouPay = perMemberYouPay + cleanedMemberList[member].claimListNew[h].youPay;
                }
            }

            // Adding an extra record with totals for each member
            let dummyNode;
            dummyNode = {
                'memberName': tempName,
                'claimType': ' ',
                'claimStatus': 'Finalized',
                'serviceStartDate': ' ',
                'billedAmount': perMemberBilledAmount,
                'amountAllowed': perMemberAmountAllowed,
                'planDiscount': perMemberPlanDiscount,
                //'ConnectiCare Paid': perMemberPaidAmount,
                'paidAmount': perMemberPaidAmount,
                'deductibleAmount': perMemberDeductible,
                'coInsurance': perMemberCoInsurance,
                'coPay': perMemberCoPay,
                'youPay': perMemberYouPay,
            }
        
            cleanedMemberList[member].claimListNew.unshift(dummyNode);

            for (var c = 0; c < cleanedMemberList[member].claimListNew.length; c++) {
                // Formatted Values
                if (cleanedMemberList[member].claimListNew[c].billedAmount == null || cleanedMemberList[member].claimListNew[c].billedAmount == undefined) {
                    cleanedMemberList[member].claimListNew[c].billedAmount = 0;
                }
                if (cleanedMemberList[member].claimListNew[c].amountAllowed == null || cleanedMemberList[member].claimListNew[c].amountAllowed == undefined) {
                    cleanedMemberList[member].claimListNew[c].amountAllowed = 0;
                }
                if (cleanedMemberList[member].claimListNew[c].planDiscount == null || cleanedMemberList[member].claimListNew[c].planDiscount == undefined) {
                    cleanedMemberList[member].claimListNew[c].planDiscount = 0;
                }
                if (cleanedMemberList[member].claimListNew[c].paidAmount == null || cleanedMemberList[member].claimListNew[c].paidAmount == undefined) {
                    cleanedMemberList[member].claimListNew[c].paidAmount = 0;
                }
                if (cleanedMemberList[member].claimListNew[c].deductibleAmount == null || cleanedMemberList[member].claimListNew[c].deductibleAmount == undefined) {
                    cleanedMemberList[member].claimListNew[c].deductibleAmount = 0;
                }
                if (cleanedMemberList[member].claimListNew[c].coInsurance == null || cleanedMemberList[member].claimListNew[c].coInsurance == undefined) {
                    cleanedMemberList[member].claimListNew[c].coInsurance = 0;
                }
                if (cleanedMemberList[member].claimListNew[c].coPay == null || cleanedMemberList[member].claimListNew[c].coPay == undefined) {
                    cleanedMemberList[member].claimListNew[c].coPay = 0;
                }
                if (cleanedMemberList[member].claimListNew[c].youPay == null || cleanedMemberList[member].claimListNew[c].youPay == undefined) {
                    cleanedMemberList[member].claimListNew[c].youPay = 0;
                }
                // MPV-951 - Show only Finalized Claims
                if (cleanedMemberList[member].claimListNew[c].claimStatus == 'Finalized') {
                    // Counter for Medical Claims
                    if (cleanedMemberList[member].claimListNew[c].claimType == 'Medical') {
                        billedAmountSubMedical = billedAmountSubMedical + cleanedMemberList[member].claimListNew[c].billedAmount;
                        amountAllowedSubMedical = amountAllowedSubMedical + cleanedMemberList[member].claimListNew[c].amountAllowed;
                        planDiscountSubMedical = planDiscountSubMedical + cleanedMemberList[member].claimListNew[c].planDiscount;
                        paidAmountSubMedical = paidAmountSubMedical + cleanedMemberList[member].claimListNew[c].paidAmount;
                        deductibleAmountSubMedical = deductibleAmountSubMedical + cleanedMemberList[member].claimListNew[c].deductibleAmount;
                        coInsuranceSubMedical = coInsuranceSubMedical + cleanedMemberList[member].claimListNew[c].coInsurance;
                        coPaySubMedical = coPaySubMedical + cleanedMemberList[member].claimListNew[c].coPay;
                        youPaySubMedical = youPaySubMedical + cleanedMemberList[member].claimListNew[c].youPay;
                    }

                    // Counter for Hospital Claims
                    if (cleanedMemberList[member].claimListNew[c].claimType == 'Hospital') {
                        billedAmountSubHospital = billedAmountSubHospital + cleanedMemberList[member].claimListNew[c].billedAmount;
                        amountAllowedSubHospital = amountAllowedSubHospital + cleanedMemberList[member].claimListNew[c].amountAllowed;
                        planDiscountSubHospital = planDiscountSubHospital + cleanedMemberList[member].claimListNew[c].planDiscount;
                        paidAmountSubHospital = paidAmountSubHospital + cleanedMemberList[member].claimListNew[c].paidAmount;
                        deductibleAmountSubHospital = deductibleAmountSubHospital + cleanedMemberList[member].claimListNew[c].deductibleAmount;
                        coInsuranceSubHospital = coInsuranceSubHospital + cleanedMemberList[member].claimListNew[c].coInsurance;
                        coPaySubHospital = coPaySubHospital + cleanedMemberList[member].claimListNew[c].coPay;
                        youPaySubHospital = youPaySubHospital + cleanedMemberList[member].claimListNew[c].youPay;
                    }

                    // Counter for Pharmacy Claims
                    if (cleanedMemberList[member].claimListNew[c].claimType == 'Pharmacy') {
                        billedAmountSubPharmacy = billedAmountSubPharmacy + cleanedMemberList[member].claimListNew[c].billedAmount;
                        amountAllowedSubPharmacy = amountAllowedSubPharmacy + cleanedMemberList[member].claimListNew[c].amountAllowed;
                        planDiscountSubPharmacy = planDiscountSubPharmacy + cleanedMemberList[member].claimListNew[c].planDiscount;
                        paidAmountSubPharmacy = paidAmountSubPharmacy + cleanedMemberList[member].claimListNew[c].paidAmount;
                        deductibleAmountSubPharmacy = deductibleAmountSubPharmacy + cleanedMemberList[member].claimListNew[c].deductibleAmount;
                        coInsuranceSubPharmacy = coInsuranceSubPharmacy + cleanedMemberList[member].claimListNew[c].coInsurance;
                        coPaySubPharmacy = coPaySubPharmacy + cleanedMemberList[member].claimListNew[c].coPay;
                        youPaySubPharmacy = youPaySubPharmacy + cleanedMemberList[member].claimListNew[c].youPay;
                    }

                    // Counter for Dental Claims
                    if (cleanedMemberList[member].claimListNew[c].claimType == 'Dental') {
                        billedAmountSubDental = billedAmountSubDental + cleanedMemberList[member].claimListNew[c].billedAmount;
                        amountAllowedSubDental = amountAllowedSubDental + cleanedMemberList[member].claimListNew[c].amountAllowed;
                        planDiscountSubDental = planDiscountSubDental + cleanedMemberList[member].claimListNew[c].planDiscount;
                        paidAmountSubDental = paidAmountSubDental + cleanedMemberList[member].claimListNew[c].paidAmount;
                        deductibleAmountSubDental = deductibleAmountSubDental + cleanedMemberList[member].claimListNew[c].deductibleAmount;
                        coInsuranceSubDental = coInsuranceSubDental + cleanedMemberList[member].claimListNew[c].coInsurance;
                        coPaySubDental = coPaySubDental + cleanedMemberList[member].claimListNew[c].coPay;
                        youPaySubDental = youPaySubDental + cleanedMemberList[member].claimListNew[c].youPay;
                    }


                    if (cleanedMemberList[member].claimListNew[c].billedAmount == null || cleanedMemberList[member].claimListNew[c].billedAmount == undefined) {
                        cleanedMemberList[member].claimListNew[c].billedAmount = 0;
                    } else {
                        cleanedMemberList[member].claimListNew[c].billedAmount = cleanedMemberList[member].claimListNew[c].billedAmount;
                    }
                    if (cleanedMemberList[member].claimListNew[c].amountAllowed == null || cleanedMemberList[member].claimListNew[c].amountAllowed == undefined) {
                        cleanedMemberList[member].claimListNew[c].amountAllowed = 0;
                    } else {
                        cleanedMemberList[member].claimListNew[c].amountAllowed = cleanedMemberList[member].claimListNew[c].amountAllowed;
                    }
                    if (cleanedMemberList[member].claimListNew[c].planDiscount == null || cleanedMemberList[member].claimListNew[c].planDiscount == undefined) {
                        cleanedMemberList[member].claimListNew[c].planDiscount = 0;
                    } else {
                        cleanedMemberList[member].claimListNew[c].planDiscount = cleanedMemberList[member].claimListNew[c].planDiscount;
                    }
                    if (cleanedMemberList[member].claimListNew[c].paidAmount == null || cleanedMemberList[member].claimListNew[c].paidAmount == undefined) {
                        cleanedMemberList[member].claimListNew[c].paidAmount = 0;
                    } else {
                        cleanedMemberList[member].claimListNew[c].paidAmount = cleanedMemberList[member].claimListNew[c].paidAmount;
                    }
                    if (cleanedMemberList[member].claimListNew[c].deductibleAmount == null || cleanedMemberList[member].claimListNew[c].deductibleAmount == undefined) {
                        cleanedMemberList[member].claimListNew[c].deductibleAmount = 0;
                    } else {
                        cleanedMemberList[member].claimListNew[c].deductibleAmount = cleanedMemberList[member].claimListNew[c].deductibleAmount;
                    }
                    if (cleanedMemberList[member].claimListNew[c].coInsurance == null || cleanedMemberList[member].claimListNew[c].coInsurance == undefined) {
                        cleanedMemberList[member].claimListNew[c].coInsurance = 0;
                    } else {
                        cleanedMemberList[member].claimListNew[c].coInsurance = cleanedMemberList[member].claimListNew[c].coInsurance;
                    }
                    if (cleanedMemberList[member].claimListNew[c].coPay == null || cleanedMemberList[member].claimListNew[c].coPay == undefined) {
                        cleanedMemberList[member].claimListNew[c].coPay = 0;
                    } else {
                        cleanedMemberList[member].claimListNew[c].coPay = cleanedMemberList[member].claimListNew[c].coPay;
                    }
                    if (cleanedMemberList[member].claimListNew[c].youPay == null || cleanedMemberList[member].claimListNew[c].youPay == undefined) {
                        cleanedMemberList[member].claimListNew[c].youPay = 0;
                    } else {
                        cleanedMemberList[member].claimListNew[c].youPay = cleanedMemberList[member].claimListNew[c].youPay;
                    }

                    if (documentType == 'excel') {
                        if (cleanedMemberList[member].claimListNew[c].memberName != null) {
                            var claim = {
                                'memberName': tempName,
                                'claimType': cleanedMemberList[member].claimListNew[c].claimType,
                                'serviceStartDate': cleanedMemberList[member].claimListNew[c].serviceStartDate,
                                'billedAmount': cleanedMemberList[member].claimListNew[c].billedAmount,
                                'amountAllowed': cleanedMemberList[member].claimListNew[c].amountAllowed,
                                'planDiscount': cleanedMemberList[member].claimListNew[c].planDiscount,
                                'paidAmount': cleanedMemberList[member].claimListNew[c].paidAmount,
                                'deductibleAmount': cleanedMemberList[member].claimListNew[c].deductibleAmount,
                                'coInsurance': cleanedMemberList[member].claimListNew[c].coInsurance,
                                'coPay': cleanedMemberList[member].claimListNew[c].coPay,
                                'youPay': cleanedMemberList[member].claimListNew[c].youPay,
                            };
                        } else {
                            var claim = {
                                'memberName': tempName,
                                'claimType': cleanedMemberList[member].claimListNew[c].claimType,
                                'serviceStartDate': cleanedMemberList[member].claimListNew[c].serviceStartDate,
                                'billedAmount': cleanedMemberList[member].claimListNew[c].billedAmount,
                                'amountAllowed': cleanedMemberList[member].claimListNew[c].amountAllowed,
                                'planDiscount': cleanedMemberList[member].claimListNew[c].planDiscount,
                                'paidAmount': cleanedMemberList[member].claimListNew[c].paidAmount,
                                'deductibleAmount': cleanedMemberList[member].claimListNew[c].deductibleAmount,
                                'coInsurance': cleanedMemberList[member].claimListNew[c].coInsurance,
                                'coPay': cleanedMemberList[member].claimListNew[c].coPay,
                                'youPay': cleanedMemberList[member].claimListNew[c].youPay,
                            };
                        }

                    }

                    if (documentType == 'pdf') {
                        if (cleanedMemberList[member].claimListNew[c].memberName != null) {
                            var claim = {
                                'Member Name': tempName,
                                'Claim Type': cleanedMemberList[member].claimListNew[c].claimType,
                                'Date of Service': cleanedMemberList[member].claimListNew[c].serviceStartDate,
                                'Amount Billed': cleanedMemberList[member].claimListNew[c].billedAmount,
                                'Amount Allowed': cleanedMemberList[member].claimListNew[c].amountAllowed,
                                'Plan Discount': cleanedMemberList[member].claimListNew[c].planDiscount,
                                'ConnectiCare Paid': cleanedMemberList[member].claimListNew[c].paidAmount,
                                'Deductible': cleanedMemberList[member].claimListNew[c].deductibleAmount,
                                'Coinsurance': cleanedMemberList[member].claimListNew[c].coInsurance,
                                'Copay': cleanedMemberList[member].claimListNew[c].coPay,
                                'Your Share': cleanedMemberList[member].claimListNew[c].youPay,
                            };
                        } else {
                            var claim = {
                                'Member Name': tempName,
                                'Claim Type': cleanedMemberList[member].claimListNew[c].claimType,
                                'Date of Service': cleanedMemberList[member].claimListNew[c].serviceStartDate,
                                'Amount Billed': cleanedMemberList[member].claimListNew[c].billedAmount,
                                'Amount Allowed': cleanedMemberList[member].claimListNew[c].amountAllowed,
                                'Plan Discount': cleanedMemberList[member].claimListNew[c].planDiscount,
                                'ConnectiCare Paid': cleanedMemberList[member].claimListNew[c].paidAmount,
                                'Deductible': cleanedMemberList[member].claimListNew[c].deductibleAmount,
                                'Coinsurance': cleanedMemberList[member].claimListNew[c].coInsurance,
                                'Copay': cleanedMemberList[member].claimListNew[c].coPay,
                                'Your Share': cleanedMemberList[member].claimListNew[c].youPay,
                            };
                        }
                    }
                    records.push(claim);
                }
            }
        }

        if (documentType == 'excel') {
            // subTotalMedical = {
            //     'memberName': 'SubTotal Medical',
            //     'claimType': ' ',
            //     'serviceStartDate': ' ',
            //     'billedAmount': formatter.format(billedAmountSubMedical),
            //     'amountAllowed': formatter.format(amountAllowedSubMedical),
            //     'planDiscount': formatter.format(planDiscountSubMedical),
            //     'paidAmount': formatter.format(paidAmountSubMedical),
            //     'deductibleAmount': formatter.format(deductibleAmountSubMedical),
            //     'coInsurance': formatter.format(coInsuranceSubMedical),
            //     'coPay': formatter.format(coPaySubMedical),
            //     'youPay': formatter.format(youPaySubMedical),
            // };

            subTotalMedical = {
                'memberName': 'SubTotal Medical',
                'claimType': ' ',
                'serviceStartDate': ' ',
                'billedAmount': billedAmountSubMedical,
                'amountAllowed': amountAllowedSubMedical,
                'planDiscount': planDiscountSubMedical,
                'paidAmount': paidAmountSubMedical,
                'deductibleAmount': deductibleAmountSubMedical,
                'coInsurance': coInsuranceSubMedical,
                'coPay': coPaySubMedical,
                'youPay': youPaySubMedical,
            };

            subTotalHospital = {
                'memberName': 'SubTotal Hospital',
                'claimType': ' ',
                'serviceStartDate': ' ',
                'billedAmount': billedAmountSubHospital,
                'amountAllowed': amountAllowedSubHospital,
                'planDiscount': planDiscountSubHospital,
                'paidAmount': paidAmountSubHospital,
                'deductibleAmount': deductibleAmountSubHospital,
                'coInsurance': coInsuranceSubHospital,
                'coPay': coPaySubHospital,
                'youPay': youPaySubHospital,
            };

            subTotalPharmacy = {
                'memberName': 'SubTotal Pharmacy',
                'claimType': ' ',
                'serviceStartDate': ' ',
                'billedAmount': billedAmountSubPharmacy,
                'amountAllowed': amountAllowedSubPharmacy,
                'planDiscount': planDiscountSubPharmacy,
                'paidAmount': paidAmountSubPharmacy,
                'deductibleAmount': deductibleAmountSubPharmacy,
                'coInsurance': coInsuranceSubPharmacy,
                'coPay': coPaySubPharmacy,
                'youPay': youPaySubPharmacy,
            };

            subTotalDental = {
                'memberName': 'SubTotal Dental',
                'claimType': ' ',
                'serviceStartDate': ' ',
                'billedAmount': billedAmountSubDental,
                'amountAllowed': amountAllowedSubDental,
                'planDiscount': planDiscountSubDental,
                'paidAmount': paidAmountSubDental,
                'deductibleAmount': deductibleAmountSubDental,
                'coInsurance': coInsuranceSubDental,
                'coPay': coPaySubDental,
                'youPay': youPaySubDental,
            };

            totalSummaryAll = {
                'memberName': 'HCFS Total',
                'claimType': ' ',
                'serviceStartDate': ' ',
                'billedAmount': billedAmountSubMedical + billedAmountSubHospital + billedAmountSubPharmacy + billedAmountSubDental,
                'amountAllowed': amountAllowedSubMedical + amountAllowedSubHospital + amountAllowedSubPharmacy + amountAllowedSubDental,
                'planDiscount': planDiscountSubMedical + planDiscountSubHospital + planDiscountSubPharmacy + planDiscountSubDental,
                'paidAmount': paidAmountSubMedical + paidAmountSubHospital + paidAmountSubPharmacy + paidAmountSubDental,
                'deductibleAmount': deductibleAmountSubMedical + deductibleAmountSubHospital + deductibleAmountSubPharmacy + deductibleAmountSubDental,
                'coInsurance': coInsuranceSubMedical + coInsuranceSubHospital + coInsuranceSubPharmacy + coInsuranceSubDental,
                'coPay': coPaySubMedical + coPaySubHospital + coPaySubPharmacy + coPaySubDental,
                'youPay': youPaySubMedical + youPaySubHospital + youPaySubPharmacy + youPaySubDental,
            };
        }

        if (documentType == 'pdf') {
            subTotalMedical = {
                'Member Name': 'SubTotal Medical',
                'Claim Type': ' ',
                'Date of Service': ' ',
                'Amount Billed': billedAmountSubMedical,
                'Amount Allowed': amountAllowedSubMedical,
                'Plan Discount': planDiscountSubMedical,
                'ConnectiCare Paid': paidAmountSubMedical,
                'Deductible': deductibleAmountSubMedical,
                'Coinsurance': coInsuranceSubMedical,
                'Copay': coPaySubMedical,
                'Your Share': youPaySubMedical,
            };

            subTotalHospital = {
                'Member Name': 'SubTotal Hospital',
                'Claim Type': ' ',
                'Date of Service': ' ',
                'Amount Billed': billedAmountSubHospital,
                'Amount Allowed': amountAllowedSubHospital,
                'Plan Discount': planDiscountSubHospital,
                'ConnectiCare Paid': paidAmountSubHospital,
                'Deductible': deductibleAmountSubHospital,
                'Coinsurance': coInsuranceSubHospital,
                'Copay': coPaySubHospital,
                'Your Share': youPaySubHospital,
            };

            subTotalPharmacy = {
                'Member Name': 'SubTotal Pharmacy',
                'Claim Type': ' ',
                'Date of Service': ' ',
                'Amount Billed': billedAmountSubPharmacy,
                'Amount Allowed': amountAllowedSubPharmacy,
                'Plan Discount': planDiscountSubPharmacy,
                'ConnectiCare Paid': paidAmountSubPharmacy,
                'Deductible': deductibleAmountSubPharmacy,
                'Coinsurance': coInsuranceSubPharmacy,
                'Copay': coPaySubPharmacy,
                'Your Share': youPaySubPharmacy,
            };

            subTotalDental = {
                'Member Name': 'SubTotal Dental',
                'Claim Type': ' ',
                'Date of Service': ' ',
                'Amount Billed': billedAmountSubDental,
                'Amount Allowed': amountAllowedSubDental,
                'Plan Discount': planDiscountSubDental,
                'ConnectiCare Paid': paidAmountSubDental,
                'Deductible': deductibleAmountSubDental,
                'Coinsurance': coInsuranceSubDental,
                'Copay': coPaySubDental,
                'Your Share': youPaySubDental,
            };

            totalSummaryAll = {
                'Member Name': 'HCFS Total',
                'Claim Type': ' ',
                'Date of Service': ' ',
                'Amount Billed': billedAmountSubMedical + billedAmountSubHospital + billedAmountSubPharmacy + billedAmountSubDental,
                'Amount Allowed': amountAllowedSubMedical + amountAllowedSubHospital + amountAllowedSubPharmacy + amountAllowedSubDental,
                'Plan Discount': planDiscountSubMedical + planDiscountSubHospital + planDiscountSubPharmacy + planDiscountSubDental,
                'ConnectiCare Paid': paidAmountSubMedical + paidAmountSubHospital + paidAmountSubPharmacy + paidAmountSubDental,
                'Deductible': deductibleAmountSubMedical + deductibleAmountSubHospital + deductibleAmountSubPharmacy + deductibleAmountSubDental,
                'Coinsurance': coInsuranceSubMedical + coInsuranceSubHospital + coInsuranceSubPharmacy + coInsuranceSubDental,
                'Copay': coPaySubMedical + coPaySubHospital + coPaySubPharmacy + coPaySubDental,
                'Your Share': youPaySubMedical + youPaySubHospital + youPaySubPharmacy + youPaySubDental,
            };
        
        }

        records.push(subTotalMedical);
        records.push(subTotalHospital);
        records.push(subTotalPharmacy);
        records.push(subTotalDental);
        records.push(totalSummaryAll);

        if (documentType == 'pdf') {
            this.generatePDF(records);
        }

        if (documentType == 'excel') {
            this.claimsTracked = records;
            this.generateExcel();
        }
    }

    async generatePDF(claimsTableData) {
        /* PDF Config */
        let options = {
            orientation: 'l',
            unit: 'mm',
            format: 'ledger',
        }
        var pageWidthPdf = 210,
            margin = 10,
            maxLineWidth = pageWidthPdf - (margin * 2)

        /* Table Header */
        let header = [
            'Member Name',
            'Claim Type',
            'Date of Service',
            'Amount Billed',
            'Amount Allowed',
            'Plan Discount',
            'Deductible',
            'Coinsurance',
            'Copay',
            'Your Share'
        ];

        let headerConfig = header.map(key => ({
            'id': key,
            'name': key,
            'prompt': key,
            'width': 50,
            'align': 'left',
            'padding': 0,
            'border': 'none'
        }));

        let headerTableConfig = {
            printHeaders: true,
            autoSize: false,
            margins: {
                left: 10,
                top: 10,
                bottom: 10
            },
            fontSize: 10,
            padding: 2,
            headerBackgroundColor: '#c8c8c8'
        }

        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        });

        for (var i = 0; i < claimsTableData.length; i++) {
            if (claimsTableData[i]['Amount Billed'] != null) {
                var newVal = formatter.format(claimsTableData[i]['Amount Billed']);
                claimsTableData[i]['Amount Billed'] = newVal;
            }
            if (claimsTableData[i]['Amount Allowed'] != null) {
                var newVal = formatter.format(claimsTableData[i]['Amount Allowed']);
                claimsTableData[i]['Amount Allowed'] = newVal;
            }
            if (claimsTableData[i]['Plan Discount'] != null) {
                var newVal = formatter.format(claimsTableData[i]['Plan Discount']);
                claimsTableData[i]['Plan Discount'] = newVal;
            }
            if (claimsTableData[i].Deductible != null) {
                var newVal = formatter.format(claimsTableData[i].Deductible);
                claimsTableData[i].Deductible = newVal;
            }
            if (claimsTableData[i].Coinsurance != null) {
                var newVal = formatter.format(claimsTableData[i].Coinsurance);
                claimsTableData[i].Coinsurance = newVal;
            }
            if (claimsTableData[i].Copay != null) {
                var newVal = formatter.format(claimsTableData[i].Copay);
                claimsTableData[i].Copay = newVal;
            }
            if (claimsTableData[i]['Your Share'] != null) {
                var newVal = formatter.format(claimsTableData[i]['Your Share']);
                claimsTableData[i]['Your Share'] = newVal;
            }
        }

        var doc = await new jspdf.jsPDF(options);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);

        // MPV-1005
        doc.text("As of date: " + this.today, 10, 10);
        doc.table(10, 20, claimsTableData, headerConfig, headerTableConfig);

        // Download for Desktop or Mobile
        if (window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes('CommunityHybridContainer')) {
            this.loading = true;
            let base64 = doc.output('datauristring'); // base64 string
            let base64result = base64.split(',');
            let base64value = base64result[1];
            // Required Extra parameter for Attachment
            var contentType = 'application/pdf';
            this.downloadForMobile(this.claimsFileName, this.claimsFileName + '.pdf', base64value, contentType);
        } else {
            doc.save(this.claimsFileName + '.pdf');
            this.loading = false;
        }
    }

    async generateExcel() {
        // Export to Excel configuration
        this.claimsTableStructure = {
            "header": [
                [
                    "Member Name",
                    "Claim Type",
                    "Date of Service",
                    "Amount Billed",
                    "Amount Allowed",
                    "Plan Discount",
                    "Deductible",
                    "Coinsurance",
                    "Copay",
                    "Your Share"
                ]
            ],
            "fields": [
                'memberName',
                'claimType',
                'serviceStartDate',
                'billedAmount',
                'amountAllowed',
                'planDiscount',
                'paidAmount',
                'deductibleAmount',
                'coInsurance',
                'coPay',
                'youPay'
            ],
            "types": ['text', 'text', 'date', 'currency', 'currency', 'currency', 'currency', 'currency', 'currency', 'currency', 'currency'],
            "letters": ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
        };

        let headerLabels = JSON.parse(JSON.stringify(this.claimsTableStructure)).header;
        let fields = JSON.parse(JSON.stringify(this.claimsTableStructure)).fields;
        let types = JSON.parse(JSON.stringify(this.claimsTableStructure)).types;
        let letters = JSON.parse(JSON.stringify(this.claimsTableStructure)).letters;

        let tableData = JSON.parse(JSON.stringify(this.claimsTracked));

        for (var d = 0; d < tableData.length; d++) {
            tableData[d].serviceStartDate = ' ' + tableData[d].serviceStartDate;
        }

        const updatedTableData = tableData.map(({ Id, uniqueKey, ...data }) => {
            if (fields) {
                let parsedData = {};
                for (let i = 0; i < fields.length; i++) {
                    parsedData[fields[i]] = data[fields[i]];
                }
                return parsedData;
            } else {
                return data;
            }
        });

        const XLSX = window.XLSX;
        const headers = headerLabels;

        var workbook = XLSX.utils.book_new();

        //MPV-1005 - As of date header is not displayed in downloaded excel document
        XLSX.utils.sheet_add_aoa(workbook, [['As of date: ' + this.today]], { origin: 'A1' });
        XLSX.utils.sheet_add_aoa(workbook, headers, { origin: 'A2' });

        var worksheet = XLSX.utils.sheet_add_json(workbook, updatedTableData, { origin: 'A3', skipHeader: true });

        // MPV-1326 - Dollar values in downloaded HCFS excel sheet is left aligned
        let colIndex = [];
        let myMap = new Map();
        if (types.length > 0) {
            for (var t = 0; t < types.length; t++) {
                if (types[t] == 'currency') {
                    colIndex.push(t);
                    myMap.set(t, letters[t]);
                }
            }
        }

        // Assign styles for any column with currency fields
        var fmt = "$#,##0.00";
        var range = XLSX.utils.decode_range(worksheet['!ref']);
        for (var col = 0; col < colIndex.length; col++) {
            var actualColumn = XLSX.utils.decode_col(myMap.get(colIndex[col])); // 3
            for (var i = range.s.r + 1; i <= range.e.r; ++i) {
                var ref = XLSX.utils.encode_cell({ r: i, c: actualColumn });
                if (!worksheet[ref]) continue;
                //worksheet[ref].s = cellStyle;
                //worksheet[ref].t = 'n';
                worksheet[ref].z = fmt;
            }
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, this.claimsFileName);

        if (window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes('CommunityHybridContainer')) {
            var base64 = XLSX.write(workbook, { type: 'base64' }); // base64 string
            // Required Extra parameter for Attachment
            var contentType = 'application/vnd.ms-excel';
            this.downloadForMobile(this.claimsFileName, `${this.claimsFileName}.xlsx`, base64, contentType);
        } else {
            await XLSX.writeFile(workbook, `${this.claimsFileName}.xlsx`);
            this.loading = false;
        }
    }

    downloadForMobile(title, fileName, base64, contentType) {
        //MPV-1604 Sprint13
        let pathTenant = 'memberportal';
        let params = {
            sClassName: "omnistudio.IntegrationProcedureService",
            sMethodName: "Member_Base64ToContentDoc",
            options: "{}",
            input: {
                base64: base64,
                title: title,
                fileNameWithExtension: fileName,
            }
        };
        this.omniRemoteCall(params, true).then((response) => {
            if(response.result.IPResult){
                let data = response.result.IPResult;
                const contentDocId = data.contentDocId;
                this.loading = false;
                this[NavigationMixin.Navigate]({
                    type: 'standard__webPage',
                    attributes: {
                        "url": `${window.top.location.origin}/${pathTenant}/sfc/servlet.shepherd/document/download/${contentDocId}?operationContext=S1`
                    }
                });
            }else{
                console.error(`${this.errorMessage} Member_Base64ToContentDoc`)
            }
        }).catch(error => {
            console.error(
                "Error in funtion that calls Base64 IP",
                JSON.stringify(error)
            );
        });
    }

    openModal() {
        this.showModal = true;
        this.errorMessage = false;
        this.showRadio = false;
        this.isDisabled = false;
    }

    closeModal() {
        this.showModal = false;
    }

    disconnectedCallback() {
        pubsub.unregister('MemberSelection', this.pubSubObj);
    }

    buidURL() {
        let type = "";
        let protocol = "";
        const urlString = window.location.href;
        const hostUrl = window.location.host;
    
        let urlArray = urlString.split("/");
        this.costCalculator = true;

        for (let index = 0; index < urlArray.length; index++) {
           let element = urlArray[index];
           if (element == "https:") {
              protocol = element;
           }
           if (element == "http:") {
              protocol = element;
           }
        }    
    }



}
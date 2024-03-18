import { LightningElement, track, api } from 'lwc';
import { getDataHandler } from "omnistudio/utility";
import pubsub from "omnistudio/pubsub";

export default class MemberClaimsHighlightPanel extends LightningElement {
    loggedUserKID
    @track
    _highlightTotals;
    @track
    showHighlightPanel;

    pubSubObj;
    memberKID;

    _userId;

    // Dates
    today;
    todayCheck;
    yearToDate;
    yearToDateCheck;

    hasRenderedKID = true;

    // Summary
    amountBilled;
    planDiscount;
    planPaidAmount;
    youShare;

    @api
    get userid() {
        return this._userId;
    }
    set userid(val) {
        this._userId = val;
    }

    connectedCallback() {
        // Receive current MemberKID
        // this.pubSubObj = {
        //     memberSelectionAction: this.getMemberKID.bind(this)
        // }
        // pubsub.register('MemberSelection', this.pubSubObj);

        // Get Today's date
        this.today = new Date();
        var ddmap = String(this.today.getDate()).padStart(2, "0");
        var mmmap = String(this.today.getMonth() + 1).padStart(2, "0"); //January is 0!
        var yyyymap = this.today.getFullYear();
        this.today = mmmap + "/" + ddmap + "/" + yyyymap;
        this.todayCheck = new Date(this.today);


        // Define year-to-date
        this.yearToDate = new Date();
        this.yearToDate = '01' + "/" + '01' + "/" + yyyymap;
        this.yearToDateCheck = new Date(this.yearToDate);

        // Call IP to get current User Id
        let dummyNode = { '': '' };
        let datasourcedef = JSON.stringify({
            "type": "integrationprocedure",
            "value": {
                "ipMethod": 'Member_GetMemberUserInfo',
                "inputMap": dummyNode,
                "optionsMap": ""
            }
        });
        getDataHandler(datasourcedef).then(data => {
            let newData = JSON.parse(data);
            if (newData.IPResult != null) {
                this.callDemographyIP(newData.IPResult.userId);
            }
        });
    }

    // Get Logged MemberKID
    callDemographyIP(memberUserId) {
        let inputParam = {
            userId: memberUserId,
        };
        let datasourcedef = JSON.stringify({
            "type": "integrationprocedure",
            "value": {
                "ipMethod": 'Member_Demography',
                "inputMap": inputParam,
                "optionsMap": ""
            }
        });
        getDataHandler(datasourcedef).then(data => {
            let newData = JSON.parse(data);
            console.log('demography newData: ', newData);
            if (newData.IPResult != null) {
                if(newData.IPResult.IPResult.memberId != null){
                    this.loggedUserKID = newData.IPResult.IPResult.memberId;
                    this.calculatePanel(newData.IPResult.IPResult.memberId);
                }
            }
        });
    }  

    calculatePanel(memberKID) {
        console.log('Inside calculatePanel, memberKID: ', memberKID);
        if(memberKID != null){
            let isSubscriber;
            let inputId = memberKID.substring(0, memberKID.length - 2);
            isSubscriber = memberKID.slice(-2);
            
            if (isSubscriber != '01') {
                return;
            }
        
            let inputParam = {
                subscriberId: inputId,
            };
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
                let claimsSummary = newData.IPResult;
                const formatter = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2
                });
            
                let totalAmountBilled = 0;
                let totalPlanDiscount = 0;
                let totalPlanPaidAmount = 0;
                let totalYouShare = 0;
                let debugList = [];
            
                // Calculate highlight panel for Family
                if (claimsSummary.length > 0) {
                    for (var member = 0; member < claimsSummary.length; member++) {
                        for (var claim = 0; claim < claimsSummary[member].claimsList.length; claim++) {
                            if (claimsSummary[member].claimsList[claim].claimStatus == 'Finalized') {
                                // Formatted Values
                                if (claimsSummary[member].claimsList[claim].billedAmount == null || claimsSummary[member].claimsList[claim].billedAmount == undefined) {
                                    claimsSummary[member].claimsList[claim].billedAmount = 0;
                                }
                                if (claimsSummary[member].claimsList[claim].planDiscount == null || claimsSummary[member].claimsList[claim].planDiscount == undefined) {
                                    claimsSummary[member].claimsList[claim].planDiscount = 0;
                                }
                                if (claimsSummary[member].claimsList[claim].paidAmount == null || claimsSummary[member].claimsList[claim].paidAmount == undefined) {
                                    claimsSummary[member].claimsList[claim].paidAmount = 0;
                                }
                                if (claimsSummary[member].claimsList[claim].youPay == null || claimsSummary[member].claimsList[claim].youPay == undefined) {
                                    claimsSummary[member].claimsList[claim].youPay = 0;
                                }
                                var claimDate = new Date(claimsSummary[member].claimsList[claim].serviceStartDate);
                                if (claimDate >= this.yearToDateCheck && claimDate <= this.todayCheck) {
                                    totalAmountBilled = totalAmountBilled + claimsSummary[member].claimsList[claim].billedAmount;
                                    totalPlanDiscount = totalPlanDiscount + claimsSummary[member].claimsList[claim].planDiscount;
                                    totalPlanPaidAmount = totalPlanPaidAmount + claimsSummary[member].claimsList[claim].paidAmount;
                                    totalYouShare = totalYouShare + claimsSummary[member].claimsList[claim].youPay;
                                    debugList.push(claimsSummary[member].claimsList[claim]);
                                }
                            }
                        }
                    }
                    this.amountBilled = formatter.format(totalAmountBilled);
                    this.planDiscount = formatter.format(totalPlanDiscount);
                    this.planPaidAmount = formatter.format(totalPlanPaidAmount);
                    this.youShare = formatter.format(totalYouShare);
                
                    this._highlightTotals = {
                        "amountBilled": this.amountBilled,
                        "planDiscount": this.planDiscount,
                        "planPaidAmount": this.planPaidAmount,
                        "youShare": this.youShare
                    }
                    this.showHighlightPanel = true;
                    // Calculate highlight panel for Individual
                } else {
                    if (claimsSummary.length == 0) {
                        this._highlightTotals = {
                            "amountBilled": 0,
                            "planDiscount": 0,
                            "planPaidAmount": 0,
                            "youShare": 0
                        }
                        this.showHighlightPanel = true;
                    } else {
                        for (var indiClaim = 0; indiClaim < claimsSummary.claimsList.length; indiClaim++) {
                            if (claimsSummary.claimsList[indiClaim].claimStatus == 'Finalized') {
                                // Formatted Values
                                if (claimsSummary.claimsList[indiClaim].billedAmount == null || claimsSummary.claimsList[indiClaim].billedAmount == undefined) {
                                    claimsSummary.claimsList[indiClaim].billedAmount = 0;
                                }
                                if (claimsSummary.claimsList[indiClaim].planDiscount == null || claimsSummary.claimsList[indiClaim].planDiscount == undefined) {
                                    claimsSummary.claimsList[indiClaim].planDiscount = 0;
                                }
                                if (claimsSummary.claimsList[indiClaim].paidAmount == null || claimsSummary.claimsList[indiClaim].paidAmount == undefined) {
                                    claimsSummary.claimsList[indiClaim].paidAmount = 0;
                                }
                                if (claimsSummary.claimsList[indiClaim].youPay == null || claimsSummary.claimsList[indiClaim].youPay == undefined) {
                                    claimsSummary.claimsList[indiClaim].youPay = 0;
                                }
                                var claimDate = new Date(claimsSummary.claimsList[indiClaim].serviceStartDate);
                                if (claimDate >= this.yearToDateCheck && claimDate <= this.todayCheck) {
                                    totalAmountBilled = totalAmountBilled + claimsSummary.claimsList[indiClaim].billedAmount;
                                    totalPlanDiscount = totalPlanDiscount + claimsSummary.claimsList[indiClaim].planDiscount;
                                    totalPlanPaidAmount = totalPlanPaidAmount + claimsSummary.claimsList[indiClaim].paidAmount;
                                    totalYouShare = totalYouShare + claimsSummary.claimsList[indiClaim].youPay;
                                    debugList.push(claimsSummary.claimsList[indiClaim]);
                                }
                            }
                        }
                    
                        this.amountBilled = formatter.format(totalAmountBilled);
                        this.planDiscount = formatter.format(totalPlanDiscount);
                        this.planPaidAmount = formatter.format(totalPlanPaidAmount);
                        this.youShare = formatter.format(totalYouShare);
                    
                        this._highlightTotals = {
                            "amountBilled": this.amountBilled,
                            "planDiscount": this.planDiscount,
                            "planPaidAmount": this.planPaidAmount,
                            "youShare": this.youShare
                        }
                        this.showHighlightPanel = true;
                    }
                }
            }).catch(error => {
                console.error(`failed at getting IP data => ${JSON.stringify(error)}`);
                this.loading = false;
            });
        }
    }
}
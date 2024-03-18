import { LightningElement, api } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";

export default class BillingAndPaymentCancelAutoPay extends OmniscriptBaseMixin(LightningElement) {
    @api
    get info() {
        return this._info;
    };

    set info(val) {
        this._info = val;
    };
    userId;
    planType;
    invoiceNumber;
    lob;

    loading;
    errorMessage;
    successMessage;
    requiredConfirmation = false;
    
    connectedCallback(){
        // Verify Data
        this.userId = this.info[0].subscriberId;
        this.planType = this.info[0].planType;
        this.invoiceNumber = this.info[0].invoiceNumber;
        this.lob = this.info[0].lob;
        // Prepare IP to receive the reference Id
        let myParams = { 
            userId : this.userId, 
            planType : this.planType,
            invoiceNumber : this.invoiceNumber,
            mode : 'get'
        };
        console.log('data', myParams);
        const params = {
         input: myParams,
         sClassName: "omnistudio.IntegrationProcedureService",
         sMethodName: "Member_ManageRecurringEnrollment",
         options: "{}",
        };

        this.omniRemoteCall(params, true)
        .then((response) => {
         let checkPay = response.result.IPResult;
         if(checkPay.success == false){
            console.log('Error..');
         }else{
            if(checkPay.recurringEnrollment != null && checkPay.recurringEnrollment != undefined && checkPay.recurringEnrollment != ''){
                if(checkPay.recurringEnrollment.recurringReferenceId != null && checkPay.recurringEnrollment.recurringReferenceId != undefined && checkPay.recurringEnrollment.recurringReferenceId != ''){
                    this.referenceId = checkPay.recurringEnrollment.recurringReferenceId;
                    console.log('Reference Id: ', this.referenceId);
                }else{
                    console.log('Reference Id not found..');
                }
             }
         }
        });
    }

    renderedCallback(){

    }

    cancelAutoPay(){
        this.loading = true;
        let inputParam = { 
            userId : this.userId, 
            planType : this.planType,
            invoiceNumber : this.invoiceNumber,
            recurringReferenceId : this.referenceId,
            mode : 'cancel'
        };
        const params = {
         input: inputParam,
         sClassName: "omnistudio.IntegrationProcedureService",
         sMethodName: "Member_ManageRecurringEnrollment",
         options: "{}",
        };

        this.omniRemoteCall(params, true)
        .then((response) => {
         let statusResponse = response.result.IPResult;
         console.log("Canceling..", statusResponse);
         if(statusResponse.success == false){
            console.log('Canceling Error..');
            this.errorMessage = true;
            this.loading = false;
         }else{
            if(statusResponse.result.code == 'S039'){
                this.successMessage = true;
                this.loading = false;
             }else{
                this.errorMessage = true;
                this.loading = false;
            }
         }
        });
    }

    openConfirmation() {
        this.requiredConfirmation = true;
    }
  
    closeConfirmation() {
        this.requiredConfirmation = false;
    }

    closeReload(){
        location.reload();
    }

    tryAgain(){
        this.errorMessage = false;
        this.requiredConfirmation = false;
    }
}
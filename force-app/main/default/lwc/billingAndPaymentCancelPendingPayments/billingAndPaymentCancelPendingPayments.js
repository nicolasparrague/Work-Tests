import { LightningElement, api } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";


export default class BillingAndPaymentCancelPendingPayments extends OmniscriptBaseMixin(LightningElement) {
    
   @api info;
     userId;
     planType;
     invoiceNumber;
     confirmationNumber;
     pendingPayment;
     loading;
     errorMessage;
     successMessage;
     openModal = false;
   
     connectedCallback(){
         //verify Data
         this.pendingPayment = this.info;
         console.log('pendingPayment:',  this.pendingPayment);
         this.userId = this.pendingPayment.subId;
         this.planType = this.pendingPayment.planType;
         //this.invoiceNumber = this.info[0].invoiceNumber;
         //this.lob = this.info[0].lob;
         this.confirmationNumber = this.pendingPayment.confirmationNumber;
         
     }  
     cancelPendingPayment(){
        this.loading = true;
        
        let inputParam = {
            userId : this.userId,
            planType : this.planType,
           // invoiceNumber : this.invoiceNumber,
            confirmationNumber : this.confirmationNumber,  
            mode : 'cancel'
        };
        const params = {
            input: inputParam,
            sClassName: "omnistudio.IntegrationProcedureService",
            sMethodName: "Member_MakeSinglePayment",
            options: "{}",
        };
        this.omniRemoteCall(params, true)
        .then((response) => {
            
         //let statusResponse = response.result.IPResult;
         
         console.log("Canceling..", response);
         let paymentResponse = response.result.IPResult.payment;
         console.log("Canceling result", paymentResponse.status);
         
         if(paymentResponse.status ==false){
           
            this.errorMessage = true;
            this.loading = false;
         }else{ 
            this.successMessage = true;
            this.loading = false;
            
         }
         });

     }

    launchModal(){
        this.openModal = true;
    }

    closeModal(){
        this.openModal = false;
    }
    closeReload(){
        
        location.reload();
       
    }

    tryAgain(){
        this.openModal = false;
        this.successMessage = false;
        this.errorMessage = false;
    }
}
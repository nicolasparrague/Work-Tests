import { LightningElement, api, track } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";

let oldccAccountLenght;
let oldachAccountLength;

export default class MakeChasePaymentETF extends OmniscriptBaseMixin(LightningElement) {
    //iframe height
    @track iframeHeight = '960';
   
    //iframe parameters
    paymentMethod = null; 
    returnURLEnvironment = null;
    userIdFrame = null;
    planTypeFrame = null;

    //Header variables - Make a Payment/Set up Autopay
    headerTitleACHAutoPay = false;
    headerTitleACHMakePayment = false;

    //Add/Edit BankInformation labels *Sprint 7*
    // addBankInformation = false;
    // editBankInformation = false;

    //Other variables
    srcTest = null;
    loading = false; //Spinner variable
    memberUserId; // member user id to get userID
    
    connectedCallback() {     

        let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));


        //Getting the userId to pass it as a parameter to Member_ActivePlan IP
        this.memberUserId = jsonData.userId;

        this.loading = true;

        //Set up Autopay
        if(jsonData.setPay == true){
            this.headerTitleACHAutoPay = true;
            this.headerTitleACHMakePayment = false;
        } 
        //Make a Payment
        else{
            this.headerTitleACHMakePayment = true;
            this.headerTitleACHAutoPay = false;
        }


        /**Change Label Add/Edit CC or ETF**/
        //Edit 
        // if(jsonData.editCard == true || jsonData.editETF == true){
        //     this.editBankInformation = true; 
        //     this.addBankInformation = false;
        // }
        // //Add
        // if(jsonData.addCard == true || jsonData.addEFT == true){
        //     this.addBankInformation = true;
        //     this.editBankInformation = false;            
        // }


        //1. Payment Method: ACH is Bank Information/CC is credit card
        this.paymentMethod = 'ACH';
          
        this.returnURLEnvironment = 'https://'+window.location.hostname+'/memberportal/apex/ehPaymentRedirectLWC';            


        //3. Plan Type
        this.planTypeFrame = jsonData.MemberLatest.brand;

        
        //4. User Id 
        // MPV-638
        if (jsonData.action == "makebinderpayment" || jsonData.binderPayment == true) {
            this.userIdFrame = jsonData.subscriberId;
        } else {
            this.userIdFrame = jsonData.MemberLatest.records[0].clientId;
        }

        //this.userIdFrame = jsonData.MemberLatest.records[0].clientId;

        /**************** Member/InitiatePublicSessionTransfer IP **************/
        let inputParam = { paymentMethod : this.paymentMethod, returnURLEnvironment : this.returnURLEnvironment, userId : this.userIdFrame, planType : this.planTypeFrame };
        const params = {
            input: inputParam,
            sClassName: "omnistudio.IntegrationProcedureService",
            sMethodName: "Member_InitiatePublicSessionTransfer",
            options: "{}",
        };
        
        this.omniRemoteCall(params, true).then((response) => {
            let jsonPaymentData = response.result.IPResult;                    
            this.srcTest = jsonPaymentData.sessionTransferUrl;
            this.loading = false;
        });

        //To access the variable we need "me" as a reference for this
        var me = this;

        window.addEventListener('message', function(event) {
            if (event.data.redirect == true) {
                me.createCase();
                // Not the expected origin: Reject the message!

                //RETURN TO PREVIOUS STEP
                me.omniPrevStep();   
                // me.omniNavigateTo('STEP_SetAutoPayAndMakeAPayment');
            }      

            // Handle the message
        }, false); //end listener

    }//end callback

    addCSS() {
        let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));

        this.template.querySelector(".chaseIFrame").classList.add("iframeDesktop");

    }

    prevButton() {        
        this.omniPrevStep();        
    }


    get showIframe() {
        return (this.iframeSrc != null && this.iframeSrc);
    }

    get iframeSrc() {
        if(this.srcTest == null) {
            return this.src;
        } else if(this.srcTest != null && this.srcTest != '') {
            return this.srcTest;
        }
    }

    createCase(){
        //console.log('makeChasePaymentETF');
        let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
        let tenant = 'Attentis';
        let inputs = {
            sClassName: "omnistudio.IntegrationProcedureService",
            sMethodName: "Member_CreateCase",
            options: "{}",
            input: {
                userId: jsonData.userId,
                description: 'An attempt has been made to Add new Payment method',
                tenant: tenant,
                filter: 'makePayment'
            }
        }
        //console.log('---inputs', inputs);
        this.omniRemoteCall(inputs, true).then((response) => {
            console.log('request sent', response);
        })

    }

}
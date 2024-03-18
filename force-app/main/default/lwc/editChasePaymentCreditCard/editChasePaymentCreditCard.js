import { LightningElement, api, track } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";

export default class EditChasePaymentCreditCard extends OmniscriptBaseMixin(LightningElement) {
    //iframe height
    @track iframeHeight = '960';

    //iframe parameters
    editPaymentMethod;
    editReturnURLEnvironment;
    userId;
    planType;
    editAccountId;
    editMode;    

    //Header variables - Make a Payment/Set up Autopay
    headerTitleACHAutoPay = false;
    headerTitleACHMakePayment = false;

    //Other variables
    srcTest = null;
    loading = false; //Spinner variable
    editCreditDebitCardInfo;
    
    connectedCallback() {

        let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
        console.log("jsonData iframe: ",jsonData);      

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


        //1. Payment Method: ACH is Bank Information/CC is credit card
        this.editPaymentMethod = "CC";
     
        this.editReturnURLEnvironment = 'https://'+window.location.hostname+'/memberportal/apex/ehPaymentRedirectLWC';            

        //3. Plan Type
        this.planType = jsonData.MemberLatest.brand;
        
        //4. User Id
        // MPV-638
        if (jsonData.action == "makebinderpayment" || jsonData.binderPayment == true) {
            this.userId = jsonData.subscriberId;
        } else {
            this.userId = jsonData.MemberLatest.records[0].clientId;
        } 


        // this.userId = jsonData.MemberLatest.records[0].clientId;
        // console.log("userIdFrame is from MemberLatest: ", this.userId);

        //5. Account Id 
        this.editAccountId = jsonData.editAcccId;

        //6. Mode (could be edit or EDIT)
        this.editMode = "edit";

        console.log("editPaymentMethod is: ",this.editPaymentMethod);
        console.log("editReturnURLEnvironment is: ",this.editReturnURLEnvironment);
        console.log("userId is: ",this.userId);
        console.log("planType is: ",this.planType);        
        console.log("editAccountId is: ",this.editAccountId);
        console.log("editMode is: ",this.editMode);

        /**************** Member/InitiatePublicSessionTransfer IP **************/
        let inputParam = { paymentMethod : this.editPaymentMethod, returnURLEnvironment : this.editReturnURLEnvironment, userId : this.userId, planType : this.planType, accountId : this.editAccountId, mode : this.editMode };
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
            // console.log("event: ",event);
            if (event.data.redirect == true) {
                // Not the expected origin: Reject the message!
                // console.log("listener message");
                me.createCase();
                //RETURN TO PREVIOUS STEP
                me.omniPrevStep();   
                // me.omniNavigateTo('STEP_SetAutoPayAndMakeAPayment');
            }      

            // Handle the message
            console.log(event.data);
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
        let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
        let tenant = 'Attentis'
        let inputs = {
            sClassName: "omnistudio.IntegrationProcedureService",
            sMethodName: "Member_CreateCase",
            options: "{}",
            input: {
                userId: jsonData.userId,
                description: 'An attempt has been made to Edit Payment method',
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
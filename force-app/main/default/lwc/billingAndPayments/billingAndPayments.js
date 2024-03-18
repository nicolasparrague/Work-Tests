import { LightningElement, track , api} from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import { NavigationMixin } from "lightning/navigation";

export default class BillingAndPayments extends OmniscriptBaseMixin(NavigationMixin(LightningElement)) {
   loading;
   initJSON; // JSON OmniScript Data
   jsonDemographyData;

   allowAutoPay = true; // Hide and Show
   allowMakePay; // Hide and Show
   disableMakeAPayment; // Disable make a payment button
   showMessageMakeAPayment; // Display make a payment button
   showMessage;
   validateMedicare;
   zeroDollarPremium;

   showPendingPayMessage = false;
   showCancelPendingPayButton = false;
   pendingPaymentAmount;
   record;

   lineOfBusiness; // Medicare or Commercial
   totalAmountDue; // Total Amount Due
   premiumAmount; // Premium Amount
   pastDueAmount; // Past Due Amount
   dueDate; // Due Date
   ordinalDate;

   recStatus;
   codeId;

   userId;
   planType;
   invoiceNumber;
   mode;
   ssarrb;

   memberUserId;
   suscriberIdRegister;
   memberCity;
   memberState;
   memberStreet;
   memberZipCode;
   responseError = false;

   //MPV-1549 Enable email functionality
   registerMemberId;
   registerFirstName;
   registerLastName;
   registerEmail;
   registerCellPhone;
   registerCity;
   registerState;
   registerStreetAddress1;
   registerStreetAddress2;
   registerZipCode;

   showCancelPendingPayments = false;
   subscriberId; //MPV-638
   planIdBindePayment; //MPV-638
   @track binderPaymentData; //MPV-638
   autoPayRecordM = [{ paymentMethod: "", totalAmountDue: 0, status: "", accountId: "", maskedAccountNumber: "", dueDate: "" }];
   autoPayRecord;
   card4digits;
   acc4digits;
   pendingPaymentsList = [];
   pendingPayments = [];
   memberType;
   typeAccount = false;
   typeCard = false;
   errorMessage;
   successMessage;
   requiredConfirmation = false;
   referenceId;

   dueDateLabel = "Due Date";

   showCancelAutoPay;

   _mdmUserId;

   // @api
   // get mdmUserId() {
   //    return this._mdmUserId;
   // }
   // set mdmUserId(value) {
   //    this._mdmUserId = value;
   //    console.log("mdmUserId", this._mdmUserId);
   // }

   @track autopayParams = {
      input: {},
      sClassName: "omnistudio.IntegrationProcedureService",
      sMethodName: "Autopayment_Card",
      options: "{}",
   };

   //MPV-1364
   @track hidePastDueAmount;
   @track binderProcess;

   connectedCallback() {
      /* Receive JSON data from OmniScript */
      this.loading = true;
      this.hidePastDueAmount = true;
      this.initJSON = JSON.parse(JSON.stringify(this.omniJsonData));
      console.log('OMNI DATA => ', this.initJSON);
      this._mdmUserId = this.initJSON.userId;
      console.log("mdmUserId", this._mdmUserId);
      let jsonMemberData = this.initJSON.MemberActivePlan;
      this.registerMemberId = jsonMemberData.MemberInfo.memberId;
      this.jsonDemographyData = this.initJSON.MemberActivePlan.MembersInPlan.find((mem) => mem.memberId === this.registerMemberId);

      //************************ MPV-638 ************************
      if (this.initJSON.action == "makebinderpayment" || this.initJSON.binderPayment == true) {
         this.userId = this.initJSON.subscriberId;

         /************************ Member_BinderInvoiceDetails IP *************************/
         let inputBinderPayment = { subscriberId: this.initJSON.subscriberId, planId: this.initJSON.planId };

         const params = {
            input: inputBinderPayment,
            sClassName: "omnistudio.IntegrationProcedureService",
            sMethodName: "Member_BinderInvoiceDetails",
            options: "{}",
         };

         this.omniRemoteCall(params, true).then((response) => {
            let binderPaymentInfo = response.result.IPResult;
            let binderInfo = { binder: binderPaymentInfo };
            this.omniApplyCallResp(binderInfo);

            let applyNav = { setPay: false, makePay: true, recStatus: this.recStatus };
            this.omniApplyCallResp(applyNav);
            this.omniNextStep();
         });
         this.binderProcess = true;
      }
      //

      /* Assign variables to display in the UI */
      if (this.initJSON.MemberLatest.records != null || this.initJSON.MemberLatest.records != undefined) {
         this.totalAmountDue = this.initJSON.MemberLatest.records[0].totalAmountDue;
         this.premiumAmount = this.initJSON.MemberLatest.records[0].premiumAmount;
         this.pastDueAmount = this.initJSON.MemberLatest.records[0].pastDueAmount;
         this.dueDate = this.initJSON.MemberLatest.records[0].invoiceDueDate;
         this.userId = this.initJSON.MemberLatest.records[0].billingAccount;
         this.invoiceNumber = this.initJSON.MemberLatest.records[0].invoiceNumber;
      } else {
         this.totalAmountDue = null;
         this.premiumAmount = null;
         this.pastDueAmount = null;
         this.dueDate = null;
         this.userId = null;
         this.invoiceNumber = null;
      }
      /* Receive the latest pending payment amount, filtered previously by IP */
      if (this.initJSON.PendingPayments.payments != null && this.initJSON.PendingPayments.payments != undefined) {
         if (this.initJSON.PendingPayments.payments[0].status == "PEND") {
            this.showPendingPayMessage = true;
            this.showCancelPendingPayButton = true;
            this.pendingPaymentAmount = this.initJSON.PendingPayments.payments[0].totalAmount;
            this.record = this.initJSON.PendingPayments.payments[0];
            this.record.planType = this.jsonDemographyData.brand;
            this.record.subId = this.userId;
         } else {
            console.log("No pending available..");
         }
      } else {
         //console.log('no pp');
      }

      this.ssarrb = this.initJSON.MemberLatest.premiumWthhdOptnCd;
      this.lineOfBusiness = this.jsonDemographyData.memberType;
      this.planType = this.jsonDemographyData.brand;
      this.mode = "get";

      // MPV-1045 - If the Subscriber is a Medicare member whose premium is paid via SSA/RRB
      let isMedicare;
      if (this.lineOfBusiness == "Medicare" && (this.ssarrb == "S" || this.ssarrb == "R")) {
         this.showMessageMakeAPayment = true;
         this.disableMakeAPayment = true;
         this.validateMedicare = true;
         isMedicare = true;
      } else {
         this.showMessageMakeAPayment = false;
         this.validateMedicare = false;
         isMedicare = false;
      }

      /* Saved Payment Accounts */

      let currentEnrollment = this.initJSON.ManageEnrollment;
      if (currentEnrollment.recurringEnrollment != null && currentEnrollment.recurringEnrollment != undefined) {
         this.recStatus = currentEnrollment.recurringEnrollment.status;

         // Set Reference ID in order to Cancel Auto Pay
         if(currentEnrollment.recurringEnrollment.recurringReferenceId != null){
            this.referenceId = currentEnrollment.recurringEnrollment.recurringReferenceId;
         }

         // Highlight Panel Set up Auto Pay - Card Information
         if(currentEnrollment.recurringEnrollment.accountEnrolledWith != null){
            // Validate ACH
            if(Object.keys(currentEnrollment.recurringEnrollment.accountEnrolledWith.achAccount).length > 0){
               this.typeCard = true;
               this.card4digits = currentEnrollment.recurringEnrollment.accountEnrolledWith.achAccount.accountNumberLast4;
               console.log('ACH Account Found', this.typeCard, this.card4digits);
            }else if(Object.keys(currentEnrollment.recurringEnrollment.accountEnrolledWith.ccAccount).length > 0){
               this.acc4digits = currentEnrollment.recurringEnrollment.accountEnrolledWith.ccAccount.creditCardNumberLast4;
               this.typeAccount = true;
               console.log('CC Account Found', this.acc4digits, this.typeAccount);
            }
         }

      } else {
         this.codeId = currentEnrollment.result.code;
      }

      

      /* Display Set up Auto Pay button*/
      /*****
            1. If lineOfBusiness = Commercial and premiumAmount > 0 or premiumAmount < 0 then 
                -> If Status = STOP then Setup button is enabled, Cancel button is hidden
                If Status = ACTV then Setup button is hidden, Cancel button is enabled

            2. If lineOfBusiness = Medicare and SSA/RRB code NOT in (S, R) and premiumAmount > 0 or premiumAmount < 0 then 
                -> If Status = STOP then Setup button is enabled, Cancel button is hidden
                If Status = ACTV then Setup button is hidden, Cancel button is enabled

            3. If lineOfBusiness = Commercial and premiumAmount = 0 then 
                -> Both Setup Auto Pay/Cancel buttons should be hidden                    

            4. If lineOfBusiness = Medicare and SSA/RRB code NOT in (S, R) and premiumAmount = 0 then
                -> Both Setup Auto Pay/Cancel buttons should be hidden       

            5. If lineOfBusiness = Medicare and SSA/RRB code in (S, R) then
                -> Both Setup Auto Pay/Cancel buttons should be hidden
         ******/

      if (this.codeId == "R114" && (this.premiumAmount > 0 || this.premiumAmount < 0)) {
         /* Allow Set up Auto Pay if Recurring Payment Record does not exist */
         this.sendCode();
         this.allowAutoPay = true;
      } else if (this.premiumAmount !== 0 && (this.lineOfBusiness == "Commercial" || (this.lineOfBusiness == "Medicare" && !isMedicare)) && this.recStatus == "STOP") {
         /* If Status = STOP then Setup button is enabled, Cancel button is hidden */
         this.allowAutoPay = true;
         this.showMessage = false;
      } else if (this.premiumAmount !== 0 && (this.lineOfBusiness == "Commercial" || (this.lineOfBusiness == "Medicare" && !isMedicare)) && this.recStatus == "ACTV") {
         /* If Status = ACTV then Setup button is hidden, Cancel button is enabled */
         this.allowAutoPay = false;
         this.showMessage = true;
         this.showCancelAutoPay = true; // Show cancel auto pay
      } else if (parseInt(this.premiumAmount, 10) === 0 && (this.lineOfBusiness == "Commercial" || (this.lineOfBusiness == "Medicare" && !isMedicare))) {
         /* When premiumAmount = 0, Both Setup Auto Pay/Cancel buttons should be hidden as the same as Medicare */
         this.validateMedicare = true;
         this.zeroDollarPremium = true;
         this.showMessage = false;
      } else {
         /* Every other cases */
         this.showMessage = false;
         if (this.premiumAmount != 0 && !(this.premiumAmount < 0)) {
            this.allowAutoPay = false;
            this.showCancelAutoPay = true; // Show cancel auto pay
         }
      }

      if (this.binderProcess == true) {
         this.allowAutoPay = false;
         this.showCancelAutoPay = false; // Do not show Cancel Auto Pay
      }

      /* MPV-198 - Make a payment option will be disabled for the members with zero dollar premium */
      if (this.premiumAmount == 0 || this.premiumAmount == "0.00" || this.premiumAmount == "0" || isMedicare == true) {
         this.disableMakeAPayment = true;
         this.zeroDollarPremium = true;
      } else {
         this.disableMakeAPayment = false;
         this.zeroDollarPremium = false;
      }

      this.datesHandler();

      /**************************REGISTER USER********************************/
      /************************ Member_ActivePlan IP *************************/
      /**************** Member/RegisterUpdateUserProfile IP ******************/
      /***********************************************************************/

      if (this.initJSON.userChaseRegistered == false) {
         this.memberUserId = this.initJSON.userId;

         /**************** Get output of Member_ActivePlan IP from DataJson******************/

         //MPV-1363 && MPV-1364
         if (jsonMemberData.ServiceTypeInfo != undefined || jsonMemberData.ServiceTypeInfo != null) {
            this.loading = true; //lets keep the spiner running
            jsonMemberData.ServiceTypeInfo.forEach((st) => {
               if (st.defaultPlan === "Y" && st.status === "Pre-Effectuated" && st.eligExplCd == "S25") {
                  //console.log("++++ Pre-Effectuated Member Found : ", st.planId);
                  this.binderProcess = true;
                  this.hidePastDueAmount = false;
                  if (st.planId == "" || st.planId == null || st.planId == undefined) {
                     this.planIdBindePayment = ""; // We pass null or empty if planId does not exist,
                  } else {
                     this.planIdBindePayment = st.planId;
                  }
               } else {
                  this.binderProcess = false;
               }
            });

            this.subscriberId = jsonMemberData.MemberInfo.subscriberId;
            this.subId = this.subscriberId;
            if (this.binderProcess == true) {
               //Change Due date label
               this.dueDateLabel = "Binder Due Date";
               /************************ Member_BinderInvoiceDetails IP *************************/
               let inputBinderPayment = { subscriberId: this.subscriberId, planId: this.planIdBindePayment };

               const inputParamBinderPayment = {
                  input: inputBinderPayment,
                  sClassName: "omnistudio.IntegrationProcedureService",
                  sMethodName: "Member_BinderInvoiceDetails",
                  options: "{}",
               };

               this.omniRemoteCall(inputParamBinderPayment, true).then((response) => {
                  this.disableMakeAPayment = false;
                  this.allowAutoPay = true;
                  this.binderPaymentInfo = response.result.IPResult;
                  //console.log("bidner payment info: ", this.binderPaymentInfo);
                  this.totalAmountDue = this.binderPaymentInfo.memberResponsibilityAmount;
                  this.premiumAmount = this.binderPaymentInfo.memberResponsibilityAmount;
                  //this.dueDate = this.binderPaymentInfo.paymentDate;
                  this.dueDate = this.binderPaymentInfo.dueDate;
               });
            } else {
               this.dueDateLabel = "Due Date";
            }
         }

         // Get User Information
         this.registerFirstName = this.jsonDemographyData.firstName;
         this.registerLastName = this.jsonDemographyData.lastName;
         this.registerEmail = this.jsonDemographyData.email;
         this.registerCellPhone = this.jsonDemographyData.cellPhone;
         this.registerCity = this.jsonDemographyData.mailingAddressCity;
         this.registerState = this.jsonDemographyData.mailingAddressState;
         this.registerStreetAddress1 = this.jsonDemographyData.mailingAddressLine1;
         this.registerStreetAddress2 = this.jsonDemographyData.mailingAddressLine2;
         this.registerZipCode = this.jsonDemographyData.mailingAddressZipCode;

         // Ensure that ZIP is only 5 characters
         let zip = this.registerZipCode;

         if (zip == undefined) {
            zip = "";
         } else {
            if (zip.length > 5) {
               zip = zip.slice(0, 5);
            } else {
               zip = "";
            }
         }

         let inputParamRegister = {
            userId: this.subscriberId,
            planType: this.planType,
            firstName: this.registerFirstName,
            lastName: this.registerLastName,
            email: this.registerEmail,
            cellNumber: this.registerCellPhone,
            city: this.registerCity,
            state: this.registerState,
            streetAddress1: this.registerStreetAddress1,
            streetAddress2: this.registerStreetAddress2,
            zipCode: zip,
         };

         const registerParams = {
            input: inputParamRegister,
            sClassName: "omnistudio.IntegrationProcedureService",
            sMethodName: "Member_RegisterUpdateUserProfile",
            options: "{}",
         };

         this.omniRemoteCall(registerParams, true).then((response) => {
            let jsonRegisterData = response.result.IPResult;
            //Remove commented code to test
            //jsonRegisterData.success = false;
            if (jsonRegisterData.success == false) {
               this.responseError = true;
            } else {
               this.responseError = false;
            }
            //this.loading = false;
         });

         //flag in OS to register only once
         let userChaseRegistered = { userChaseRegistered: true };
         this.omniApplyCallResp(userChaseRegistered);
      }

      this.loading = false;
   }

   renderedCallback(){
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

            // window.addEventListener('keyup', function(event) {
            //    if(event.key === "Escape"){
            //       me.closeConfirmation();
            //       // me.closeReload();
            //    }
            // });
      }
   }




   datesHandler() {
      /* Extract Day of the Month */
      let today = new Date(this.dueDate);
      let dd = String(today.getDate()) - 1;
      let ordinal = [
         "1st",
         "2nd",
         "3rd",
         "4th",
         "5th",
         "6th",
         "7th",
         "8th",
         "9th",
         "10th",
         "11th",
         "12th",
         "13th",
         "14th",
         "15th",
         "16th",
         "17th",
         "18th",
         "19th",
         "20th",
         "21st",
         "22nd",
         "23rd",
         "24th",
         "25th",
         "26th",
         "27th",
         "28th",
         "29th",
         "30th",
         "31st",
      ];
      let formatted = ordinal[dd];
      this.ordinalDate = formatted;
   }

   /* Go to Set up Auto Payment */
   navigateSetPay(evt) {
      if (evt) {
         let applyNav = { setPay: true, makePay: false };
         this.omniApplyCallResp(applyNav);
         this.omniNextStep();
      }
   }
   /* Go to Make a Payment */
   navigateMakePay(evt) {
      if (evt) {
         let applyNav = { setPay: false, makePay: true, recStatus: this.recStatus };
         this.omniApplyCallResp(applyNav);

         let binder = this.binderPaymentInfo;
         console.log("binder2 binderPmt : ", binder);
         if (this.binderProcess == true) {
            let binderPayment = { action: "makebinderpayment", subscriberId: this.subId };
            let binderPmt = { binder };
            this.omniApplyCallResp(binderPayment);
            this.omniApplyCallResp(binderPmt);
         }
         this.omniNextStep();
      }
   }

   sendCode() {
      let sendCodeNewMember = { code: this.codeId };
      this.omniApplyCallResp(sendCodeNewMember);
   }

   cancelAutoPay() {
      this.loading = true;
      let inputParam = {
         // userId : this.suscriberIdRegister,
         userId: this.subscriberId,
         planType: this.planType,
         invoiceNumber: this.invoiceNumber,
         recurringReferenceId: this.referenceId,
         mode: "cancel",
      };
      const params = {
         input: inputParam,
         sClassName: "omnistudio.IntegrationProcedureService",
         sMethodName: "Member_ManageRecurringEnrollment",
         options: "{}",
      };
      console.log('CANCEL AUTO PAY => ', params);
      this.omniRemoteCall(params, true).then((response) => {
         let statusResponse = response.result.IPResult;
         if (statusResponse.success == false) {
            this.errorMessage = true;
            this.loading = false;
         } else {
            if (statusResponse.result.code == "S039") {
               this.successMessage = true;
               this.loading = false;
            } else {
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

   closeReload() {
      location.reload();
   }

   tryAgain() {
      this.errorMessage = false;
      this.requiredConfirmation = false;
   }
}
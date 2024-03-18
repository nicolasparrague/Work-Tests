import { LightningElement, track, api } from "lwc";
import { getPagesOrDefault, handlePagerChanged } from "c/pagerUtils";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";

export default class BillingAndPaymentTabs extends OmniscriptBaseMixin(LightningElement) {
   //State load different components using button tabs
   getPagesOrDefault = getPagesOrDefault.bind(this);
   handlePagerChanged = handlePagerChanged.bind(this);
   @track stateInvoiceHistory = true;
   @track statePaymentHistory = false;
   @track stateLoadPendingPayment = false;
   @track stateLoadAutoPayments = false;
   @track autoPayRecord;
   @track autoPayRecordM = [{ paymentMethod: "", totalAmountDue: 0, status: "", accountId: "", maskedAccountNumber: "", dueDate: "" }];
   @track showAutopayment = false;

   @api displayButtons = false;
   @api totalAmount;
   @api enrollmentStatus;
   @api jsondata = null;
   @api dueDate;

   @track autopayParams = {
      input: {},
      sClassName: "omnistudio.IntegrationProcedureService",
      sMethodName: "Autopayment_Card",
      options: "{}",
   };

   //Button focus
   @track stateFocus = false;
   @track hasRendered = true;
   loading;

   //Set tenant
   redirectUrl;
   tenantUrl;
   isModalOpen = false;
   jsonData;
   jsonDemographyData;

   apDataId;
   ppDataId;

   showTabButton;
   autoPayTab = false;
   pendingPayTab = false;

   userId;
   registerMemberId;
   memberType;
   planType;
   invoiceNumber;
   subscriberId;
   ssarrb;

   @track pendingPayments = [];
   @track pendingPaymentsList = [];
   @track askQuestionParams;

   @track invoiceHistorySelected;
   @track paymentHistorySelected;

   connectedCallback() {
      this.loading = true;
      this.userId = this.jsondata.userId;
      this.registerMemberId = this.jsondata.MemberActivePlan.MemberInfo.memberId;
      this.jsonDemographyData = this.jsondata.MemberActivePlan.MembersInPlan.find((mem) => mem.memberId === this.registerMemberId);

      this.planType = this.jsonDemographyData.brand;
      this.memberType = this.jsonDemographyData.memberType;
      this.ssarrb = this.jsondata.MemberLatest.premiumWthhdOptnCd;
      if (this.jsondata.MemberLatest.records != null && this.jsondata.MemberLatest.records != undefined && this.jsondata.MemberLatest.records != "") {
         this.invoiceNumber = this.jsondata.MemberLatest.records[0].invoiceNumber;
         this.subscriberId = this.jsondata.MemberLatest.records[0].clientId;
      } else {
         // console.log("No invoice number..");
      }

      // Verify Auto Payment status (Currently it is not being used)
      if (this.enrollmentStatus == "ACTV") {
         this.autoPayTab = true;
      } else {
         this.autoPayTab = false;
      }

      // View Pending Payments (Currently it is not being used)
      let pendingInfo = this.jsondata.PendingPayments;
      if (pendingInfo.success === false) {
         console.error("Error..");
      } else {
         if (pendingInfo.payments != null || pendingInfo.payments != undefined) {
            this.pendingPayments = pendingInfo.payments;
            if (this.pendingPayments != null && this.pendingPayments.length > 0) {
               for (let p = 0; p < this.pendingPayments.length; p++) {
                  let pp = {
                     totalAmount: this.pendingPayments[p].totalAmount,
                     effectiveDate: this.pendingPayments[p].effectiveDate,
                     paymentMethod: "Bank Account",
                     accountNumberLast4: "**** **** **** " + this.pendingPayments[p].accountNumberLast4,
                     subId: this.subscriberId,
                     planType: this.planType,
                     confirmationNumber: this.pendingPayments[p].confirmationNumber,
                  };
                  this.pendingPaymentsList.push(pp);
               }
            }
            this.pendingPayTab = true;
         }
      }
      this.loading = false;
      this.showTabButton = true;
      this.learnMoreLink();

      /* Auto Payment Tab is not being used*/
      /*
      let inputAutopayParams = { totalAmount: this.totalAmount, userId: this.userId, planType: this.planType, dueDate: this.dueDate };
      this.autopayParams.input = inputAutopayParams;
      this.getAutopayinformation();
      */

      //MPV - 1118 : Added memberId parameter
      this.askQuestionParams = '{"origin":"billingandpayment","memberId":"' + this.registerMemberId + '"}';

      this.invoiceHistorySelected = "true";
      this.paymentHistorySelected = "false";
   }

   renderedCallback() {
      // Focus only on the component load
      if (this.hasRendered && this.memberType && this.memberType.toLowerCase() == "medicare" && (this.ssarrb == "S" || this.ssarrb == "R")) {
         this.showTabButton = false;
         this.hasRendered = false;
      }

      if (!this.stateFocus) {
         this.setFocus();
         this.stateFocus = true;
      }

      this.dynamicDataId();
   }

   getAutopayinformation() {
      return this.omniRemoteCall(this.autopayParams, true)
         .then((response) => {
            if (Object.prototype.hasOwnProperty.call(response.result.IPResult, "success") && response.result.IPResult.success === false) {
               if (this.numOfRetry < this.maxOfRetry) {
                  this.numOfRetry++;
                  this.getAutopayinformation();
               }
            } else {
               //Callout was succesful
               let autopayArray = response.result.IPResult;
               if (autopayArray.length > 0 && autopayArray[0].status !== "STOP") {
                  this.autoPayRecord = autopayArray;
               }
               if (this.autoPayRecord.length > 0) {
                  this.showAutopayment = true;
               }
               let paymentMethod = this.autoPayRecord[0].paymentMethod;
               if (paymentMethod === "Bank Account") {
                  this.autoPayRecordM[0].paymentMethod = this.autoPayRecord[0].paymentMethod;
                  this.autoPayRecordM[0].totalAmountDue = this.autoPayRecord[0].totalAmountDue;
                  this.autoPayRecordM[0].status = this.autoPayRecord[0].status;
                  this.autoPayRecordM[0].accountId = this.autoPayRecord[0].accountId;
                  this.autoPayRecordM[0].maskedAccountNumber = this.autoPayRecord[0].maskedAccountNumber;
                  this.autoPayRecordM[0].dueDate = this.datesHandler(this.dueDate);
               } else {
                  this.autoPayRecordM[0].paymentMethod = this.autoPayRecord[0].paymentMethod;
                  this.autoPayRecordM[0].totalAmountDue = this.autoPayRecord[0].totalAmountDue;
                  this.autoPayRecordM[0].status = this.autoPayRecord[0].status;
                  this.autoPayRecordM[0].accountId = this.autoPayRecord[0].accountId;
                  this.autoPayRecordM[0].cardType = this.autoPayRecord[0].cardType;
                  this.autoPayRecordM[0].maskedCardNumber = this.autoPayRecord[0].maskedCardNumber;
                  this.autoPayRecordM[0].dueDate = this.datesHandler(this.dueDate);
               }
               // Variables passed to Cancel Auto Pay
               this.autoPayRecordM[0].subscriberId = this.subscriberId;
               this.autoPayRecordM[0].planType = this.planType;
               this.autoPayRecordM[0].invoiceNumber = this.invoiceNumber;
               this.autoPayRecordM[0].lob = this.memberType;
               //this.autoPayRecordM = Object.assign(this.autoPayRecord,{dueDate : this.dueDate});
            }
         })
         .catch((error) => {
            console.error(error, "error");
            //error handling
            this.loading = false;
         });
   }

   showInvoiceHistory(event) {
      this.stateInvoiceHistory = true;
      this.invoiceHistorySelected = "true";
      this.statePaymentHistory = false;
      this.paymentHistorySelected = "false";
      this.stateLoadPendingPayment = false;
      this.stateLoadAutoPayments = false;
      let btnId = event.target.dataset.id;
      this.addAndRemoveActiveClass(btnId);
   }

   showPaymentHistory(event) {
      this.statePaymentHistory = true;
      this.paymentHistorySelected = "true";
      this.stateInvoiceHistory = false;
      this.invoiceHistorySelected = "false";
      this.stateLoadPendingPayment = false;
      this.stateLoadAutoPayments = false;
      let btnId = event.target.dataset.id;
      this.addAndRemoveActiveClass(btnId);
   }

   loadPendingPayment(event) {
      this.stateLoadPendingPayment = true;
      this.stateInvoiceHistory = false;
      this.statePaymentHistory = false;
      this.stateLoadAutoPayments = false;
      let btnId = event.target.dataset.id;
      this.addAndRemoveActiveClass(btnId);
   }

   loadAutoPayments(event) {
      this.stateLoadAutoPayments = true;
      this.stateLoadPendingPayment = false;
      this.stateInvoiceHistory = false;
      this.statePaymentHistory = false;
      let btnId = event.target.dataset.id;
      this.addAndRemoveActiveClass(btnId);
   }

   setFocus() {
      // Get first button and focus that
      let buttonToFocus = this.template.querySelectorAll("button")[0];
      buttonToFocus.classList.add("active");
   }

   dynamicDataId() {
      // Dynamic Data Id for Hiden buttons due to conditionals
      if (this.pendingPayTab == true && this.autoPayTab == true) {
         this.ppDataId = 2;
         this.apDataId = 3;
      } else if (this.pendingPayTab == false && this.autoPayTab == true) {
         this.ppDataId = 3;
         this.apDataId = 2;
      } else if (this.pendingPayTab == true && this.autoPayTab == false) {
         this.ppDataId = 2;
         this.apDataId = 3;
      } else {
         this.ppDataId = 2;
         this.apDataId = 3;
      }
   }

   addAndRemoveActiveClass(btnId) {
      let buttonToFocus = this.template.querySelectorAll("button")[btnId];
      buttonToFocus.classList.add("active");
      let buttonList = this.template.querySelectorAll("button");
      let buttonToRemove;
      for (let i = 0; i < buttonList.length; i++) {
         buttonToRemove = this.template.querySelectorAll("button")[i];
         if (i != btnId) {
            buttonToRemove.classList.remove("active");
         }
      }
   }

   learnMoreLink() {
      this.tenantUrl = window.location.pathname;

      if (this.tenantUrl.includes("member/s")) {
         this.redirectUrl = "https://attentisconsulting.com/";
      } else {
         console.error("No valid url received..");
      }
   }

   openModal() {
      this.isModalOpen = true;
   }

   closeModal() {
      this.isModalOpen = false;
   }

   datesHandler(dateVal) {
      /* Extract Day of the Month */
      let today = new Date(dateVal);
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
      return formatted;
   }
}
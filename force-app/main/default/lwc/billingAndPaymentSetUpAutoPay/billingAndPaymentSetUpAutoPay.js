/********
    Billing & Payment - Set up Auto Pay
    Authors: Eric Castillo, Erick Rocha, Sergio Najera
    Companies: Attentis Consulting, Inc., Arcsona
    Emails: eric@attentisconsulting.com
********/
import { LightningElement, api, track } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import { NavigationMixin } from "lightning/navigation";
// import Third_Party_Administrator_Type__c from "@salesforce/schema/Account.Third_Party_Administrator_Type__c";

export default class BillingAndPaymentSetUpAutoPay extends OmniscriptBaseMixin(NavigationMixin(LightningElement)) {
   @api omniscriptData; // Data received from OmniScript
   @track cardList = []; // Total List of Cards
   @track ccAccount = []; // Credit/Debit Cards
   @track achAccount = []; // Electronic Fund Transfer
   listEmpty; // Flag to display a message if there is no cards
   tenantId;
   loading = false;
   //ManageRecurringEnrollment IP Variables
   paymentMethod; // Payment Method
   userId; // Subscriber ID without 01
   accountId; // Card Id
   planType; // Plan Type
   invoiceNumber; // Retrieved from Member/Latest IP
   recurringReferenceId; // RETURNED if perform an enroll or edit action | NEED to include if perform a cancel action | NOT NEEDED if the action is get
   mode = "enroll"; // enroll/edit/get/cancel
   setUpAutopayFlow;
   settedAutoPay;
   showSAP;
   @track amountcustom = 0;
   firstLoadCA;
   radioSelected;
   //radioSelected = "Pay Custom Amount";

   @track editPaymentAriaLabel;

   @track editButtonAriaLabel;
   @track deleteButtonAriaLabel;

   //added sn 1
   // registerFirstName;
   // registerLastName;
   // registerEmail;
   // registerCellPhone;
   // registerCity;
   // registerState;
   // registerStreetAddress1;
   // registerStreetAddress2;
   // registerZipCode;

   flagTotalAmount = false;
   flagPastDue = false;
   flagCustomAmount = false;

   memberUserId;
   memberCity;
   memberState;
   memberStreet;
   memberZipCode;

   editAccountId;

   //delete card and show modal
   modalDeleteCard = false;
   @track cardId;
   accountPopUp = false;
   cardPopUp = false;

   // Confirmation Pages Handler
   code;
   codeDesc;
   referenceId;
   confirmationDate;

   //Auto Pay Information
   totalAmountDue;
   paymentDate;

   //Make a Payment - MPV-198 ------ Make a Payment - MPV-198 ------ Make a Payment - MPV-198

   makeAPaymentFlow;
   radioOptionsPaymentInformation = true;
   today = "";
   openModalCVV = false;
   openCVVDesktop = false;
   payCstmAmt = false; // Flag to hide the currency field that allows the user entering custom amount of money
   showAmountMessage; // If the member enters an amount that is less than the total amount due an informational text should appear
   showZeroValueMessage; // If the memeber enters 0, we should display a new message.
   showCustomAmountMessage;
   paymentTypeSelected;
   modeMakeAPayment = "pay"; // pay/get/cancel
   @track paymentAmount;
   cvdValue;
   checkTAD = true; // check total amout due;

   confirmationNumber;
   statusMAP;
   codeMAP;

   codeIP;
   stillZero;
   disableSubmitButton = false; // If any field of “total Amount due”, Past amount Due, Custom amount is selected and value  =  0 or negative, then disable the Submit button
   @track hideTotalAmount = false; // If total amount due is 0 or negative, hide it.
   @track hidePastDouAmount = false; // If past due amount is 0 or negative, hide it.

   @track keepSelection = false;

   //Make a Payment - MPV-198 ------ Make a Payment - MPV-198 ------ Make a Payment - MPV-198

   //Terms & Conditions
   @track checkboxVal = false;

   //Error Messages
   @track errorTerms = false;
   @track selectCardError = false;

   //Make a Binder Payment - MPV-638
   @track makeBinderPayment;
   @track headerMakePayment;

   binderPaymentAmount;
   binderPaymentDueDate;
   binderPaymentDate;
   @track
   dataJson;

   @track errorMessageCancelPendingPayment = false;
   @track openModalNoCardSelected = false;
   @track allowToDelete = false;

   connectedCallback() {
      /* Receive JSON data from OmniScript */
      this.loading = true;
      this.omniscriptData = JSON.parse(JSON.stringify(this.omniJsonData));

      //added sn 2
      // this.registerFirstName = this.omniscriptData.MemberDemography.firstName;
      // this.registerLastName = this.omniscriptData.MemberDemography.lastName;
      // this.registerEmail = this.omniscriptData.MemberDemography.email;
      // this.registerCellPhone = this.omniscriptData.MemberDemography.cellPhone;
      // this.registerCity = this.omniscriptData.MemberDemography.mailingAddressCity;
      // this.registerState = this.omniscriptData.MemberDemography.mailingAddressState;
      // this.registerStreetAddress1 = this.omniscriptData.MemberDemography.mailingAddressLine1;
      // this.registerStreetAddress2 = this.omniscriptData.MemberDemography.mailingAddressLine2;
      // this.registerZipCode = this.omniscriptData.MemberDemography.mailingAddressZipCode;

      // MPV-638
      if (this.omniscriptData.action == "makebinderpayment" || this.omniscriptData.binderPayment == true) {
         this.makeBinderPayment = true;
         this.headerMakePayment = "Make a Binder Payment";

         let binderTwoDigits = parseFloat(this.omniscriptData.binder.memberResponsibilityAmount);
         this.binderPaymentAmount = binderTwoDigits.toFixed(2);
         //this.binderPaymentAmount = this.binderPaymentAmount.toFixed(2);
         this.binderPaymentDueDate = this.omniscriptData.binder.dueDate;
         this.binderPaymentDate = this.omniscriptData.binder.paymentDate;

         this.userId = this.omniscriptData.subscriberId;
         //this.userId = this.omniscriptData.memId;
      } else {
         this.makeBinderPayment = false;
         this.userId = this.omniscriptData.MemberLatest.records[0].clientId;
      }

      // this.userId = this.omniscriptData.MemberLatest.records[0].clientId;
      this.planType = this.omniscriptData.MemberActivePlan.MemberInfo.brand;
      this.tenantId = this.omniscriptData.tenantId;

      /* Auto Pay Information assigment */
      this.totalAmountDue = this.omniscriptData.MemberLatest.records[0].premiumAmount + this.omniscriptData.MemberLatest.records[0].pastDueAmount;
      this.paymentDate = this.omniscriptData.MemberLatest.records[0].invoiceDueDate;
      this.invoiceNumber = this.omniscriptData.MemberLatest.records[0].invoiceNumber;

      /* Check if there is a current auto payment*/
      this.settedAutoPay = this.omniscriptData.recStatus;

      /* Extract Day of the Month */
      let today = new Date(this.paymentDate);
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
      this.paymentDate = formatted;

      // MPV-198
      if (this.omniscriptData.setPay == true) {
         this.setUpAutopayFlow = true;
      } else {
         this.setUpAutopayFlow = false;
      }

      // MPV-198
      if (this.omniscriptData.makePay == true) {
         if (this.omniscriptData.action == "makebinderpayment") {
            this.headerMakePayment = "Make a Binder Payment";
         } else {
            this.headerMakePayment = "Make a Payment";
         }
         this.makeAPaymentFlow = true;
      } else {
         this.makeAPaymentFlow = false;
      }


      this.dueDate = this.omniscriptData.MemberLatest.records[0].invoiceDueDate;
      // this.totalAmountDue = this.omniscriptData.MemberLatest.records[0].totalAmountDue;
      this.pastDueAmount = this.omniscriptData.MemberLatest.records[0].pastDueAmount;

      /* Saved Payment Accounts */
      let inputParam = { UserId: this.userId, planType: this.planType };
      const params = {
         input: inputParam,
         sClassName: "omnistudio.IntegrationProcedureService",
         sMethodName: "Member_GetUserPaymentAccounts",
         options: "{}",
      };
      this.omniRemoteCall(params, true).then((response) => {
         let jsonPaymentAccounts = response.result.IPResult;

         /* Check IP Response */
         if (jsonPaymentAccounts.noRecordFound) {
         } else {
            /* Verify records */
            let cleanCC = jsonPaymentAccounts.account.ccAccount.filter(function (cc) {
               return cc != null;
            });
            let cleanACH = jsonPaymentAccounts.account.achAccount.filter(function (ach) {
               return ach != null;
            });

            if (cleanCC.length === 0) {
            } else {
               this.ccAccount = cleanCC;

               for (var i = 0; i < this.ccAccount.length; i++) {
                  var recCC = this.ccAccount[i];
                  this.ccAccount[i].expDate = true;
                  this.ccAccount[i].isSelected = false;
                  this.ccAccount[i].requiredCVV = true;
                  this.ccAccount[i].cvvNumber = 0;
                  this.ccAccount[i].cvvId = "CVV-" + this.ccAccount[i].accountId;

                  if (this.ccAccount[i].creditCardType == "MC") {
                     this.ccAccount[i].mastercard = true;
                     this.ccAccount[i].cardname = "Credit/Debit Card";
                     this.ccAccount[i].cc = true;
                     this.ccAccount[i].cvSize = 3;
                  } else if (this.ccAccount[i].creditCardType == "VISA") {
                     this.ccAccount[i].visa = true;
                     this.ccAccount[i].cardname = "Credit/Debit Card";
                     this.ccAccount[i].cc = true;
                     this.ccAccount[i].cvSize = 3;
                  } else if (this.ccAccount[i].creditCardType == "DISC") {
                     this.ccAccount[i].disc = true;
                     this.ccAccount[i].cardname = "Credit/Debit Card";
                     this.ccAccount[i].cc = true;
                     this.ccAccount[i].cvSize = 3;
                  } else {
                     this.ccAccount[i].amex = true;
                     this.ccAccount[i].cardname = "Credit/Debit Card";
                     this.ccAccount[i].cc = true;
                     this.ccAccount[i].cvSize = 4;
                  }

                  // if (this.ccAccount[i].accountId === this.recEnrollment && this.recEnrollmentStatus != "STOP"){
                  //    this.ccAccount[i].enrolledAlready = true;
                  // } else {
                  //    this.ccAccount[i].enrolledAlready = false;
                  // }

                  this.ccAccount[i].editButtonAriaLabel = "Edit your credit/debit card information";
                  this.ccAccount[i].deleteButtonAriaLabel = "Delete your credit/debit card information";
                  this.cardList.push(recCC);
               }
              
            }
            if (cleanACH.length === 0) {
            } else {
               this.achAccount = cleanACH;
               for (var o = 0; o < this.achAccount.length; o++) {
                  var recACH = this.achAccount[o];
                  this.achAccount[o].expDate = false;
                  this.achAccount[o].cvv = false;
                  this.achAccount[o].isSelected = false;
                  this.achAccount[o].cardname = "Bank Account Details";
                  this.achAccount[o].cc = false;
                  this.achAccount[o].editButtonAriaLabel = "Edit your bank account details";
                  this.achAccount[o].deleteButtonAriaLabel = "Delete your bank account details";

                  // if (this.achAccount[o].accountId === this.recEnrollment && this.recEnrollmentStatus != "STOP"){
                  //    this.achAccount[o].enrolledAlready = true;
                  // } else {
                  //    this.achAccount[o].enrolledAlready = false;
                  // }

                  this.cardList.push(recACH);
               }
            }

            console.log("all credit cards/bank accounts: ", this.cardList);
         }
         this.loading = false;
      });

      //Get Today's date
      this.today = new Date();
      var ddmap = String(this.today.getDate()).padStart(2, "0");
      var mmmap = String(this.today.getMonth() + 1).padStart(2, "0"); //January is 0!
      var yyyymap = this.today.getFullYear();

      this.today = mmmap + "/" + ddmap + "/" + yyyymap;

      if (this.omniscriptData.keepSelection == undefined || this.omniscriptData.keepSelection == null) {
         this.keepSelection = false;
      } else {
         this.keepSelection = true;
      }

      this.flagTotalAmount = true;
      this.flagPastDue = false;
      this.flagCustomAmount = false;

      this.paymentTypeSelected = true;

      if (this.flagTotalAmount == true && this.flagPastDue == false && this.flagCustomAmount == false) {
         this.stillZero = false;
         this.showAmountMessage = false;
      }

      if (this.totalAmountDue >= 0 && this.flagTotalAmount == true) {
         this.radioSelected = "Total Amount Due";
         this.setPaymentType(this.radioSelected);
         let pay = { pay: this.totalAmountDue };
         this.omniApplyCallResp(pay);
      }


      //console.log("Omni data: ", this.omniscriptData);

      //added sn 3
      // Ensure that ZIP is only 5 characters
      //  let zip = this.registerZipCode;

      //  if (zip.length > 5) {
      //     zip = zip.slice(0, 5);
      //  }

      // let inputParamRegister = {
      //     userId: this.userId,
      //     planType: this.planType,
      //     firstName: this.registerFirstName,
      //     lastName: this.registerLastName,
      //     email: this.registerEmail,
      //     cellNumber: this.registerCellPhone,
      //     city: this.registerCity,
      //     state: this.registerState,
      //     streetAddress1: this.registerStreetAddress1,
      //     streetAddress2: this.registerStreetAddress2,
      //     zipCode: zip
      // };

      // const registerParams = {
      //     input: inputParamRegister,
      //     sClassName: "omnistudio.IntegrationProcedureService",
      //     sMethodName: "Member_RegisterUpdateUserProfile",
      //     options: "{}",
      // };

      // this.omniRemoteCall(registerParams, true).then((response) => {
      //     let jsonRegisterData = response.result.IPResult;
      // });
   }

   renderedCallback() {
      this.omniscriptData = JSON.parse(JSON.stringify(this.omniJsonData));
      //let omniscriptData = JSON.parse(JSON.stringify(this.omniJsonData));

      // if (this.flagTotalAmount == true){
      //    this.omniscriptData.paymentType = "Total Amount Due";
      // } else if (this.flagPastDue == true){
      //    this.omniscriptData.paymentType = "Past Due Amount";
      // } else if (this.flagCustomAmount == true) {
      //    this.omniscriptData.paymentType = "Pay Custom Amount";
      // }

      if (this.cardList.length > 0) {
         this.listEmpty = false;
      } else {
         this.listEmpty = true;
      }

      if (this.omniscriptData.paymentType != null || this.omniscriptData.paymentType != undefined) {
         if (this.omniscriptData.paymentType == "Past Due Amount") {
            this.flagTotalAmount = false;
            this.flagPastDue = true;
            this.flagCustomAmount = false;
         }

         if (this.omniscriptData.paymentType == "Pay Custom Amount") {
            this.flagTotalAmount = false;
            this.flagPastDue = false;
            this.flagCustomAmount = true;

            if (this.omniscriptData.pay == 0 || this.omniscriptData.pay == "0") {
               if (this.totalAmountDue > 0) {
                  this.showAmountMessage = false; // See MPV-786
                  this.showZeroValueMessage = true;
               } else if (this.totalAmountDue == 0) {
                  this.showAmountMessage = false; // See MPV-786
                  this.stillZero = true;
                  if (this.amountcustom == 0) {
                     this.showZeroValueMessage = true;
                  } else {
                     this.showZeroValueMessage = false;
                  }
               }

               if (this.amountcustom == 0 && this.radioSelected == "Pay Custom Amount") {
                  this.disableSubmitButton = true;
               }
            } else {
               this.amountcustom = this.omniscriptData.pay;
               this.amountcustom = this.amountcustom.toString().replace(/[,$]/g, "");

               if (this.flagCustomAmount == true) {
                  this.radioSelected = "Pay Custom Amount";
                  this.setPaymentType(this.radioSelected);
                  let pay = { pay: this.amountcustom };
                  this.omniApplyCallResp(pay);
               }

               if (this.amountcustom < this.totalAmountDue) {
                  this.showAmountMessage = true; // See MPV-786
               } else {
                  this.showAmountMessage = false; // See MPV-786
               }

               this.disableSubmitButton = false; // Disable submit button if custom amount is 0
               this.stillZero = false;
               this.showZeroValueMessage = false;

               this.template.querySelector(".customAmt").value = this.omniscriptData.pay;
            }
         }
      } else {
      }


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
            if(event.key === "Escape"){
               me.closeIDM();
               me.closeEDM();                    
             }
         });
      }
      this.defaultSelected();
   }

   defaultSelected() {
      if (this.cardList.length == 1) {
         if (this.flagTotalAmount == true) {
            this.flagPastDue = false;
            this.flagCustomAmount = false;
         } else if (this.flagPastDue == true) {
            this.flagTotalAmount = false;
            this.flagCustomAmount = false;
         } else if (this.flagCustomAmount == true) {
            this.flagTotalAmount = false;
            this.flagPastDue = false;
         }

         // this.template.querySelector("input[type='radio']").checked = true;
         this.template.querySelector("input[name='cardSelection']").checked = true;
         this.cardList[0].isSelected = true;
      }
   }

   /********** ACTIONS METHODS **********/
   /* Pick a card from the UI */
   selectCard(evt) {
      if (evt) {
         const valueSelected = evt.target.getAttribute("value");
         for (var i = 0; i < this.cardList.length; i++) {
            if (this.cardList[i].accountId == valueSelected) {
               this.cardList[i].isSelected = true;
            } else {
               /* Reset to default */
               this.cardList[i].isSelected = false;
               this.cardList[i].cvvNumber = null;
               this.cardList[i].requiredCVV = true;
            }

            if (this.cardList[i].showCvv == true) {
               this.cardList[i].showCvv = false;
            }
         }
      }
   }

   /* Edit card and go to edit Bank Account/CreditDebit Card details*/
   navigateEditCardETF(evt) {
      if (evt) {
         this.cardId = evt.target.getAttribute("data-btn-id");
         this.editAccountId = evt.target.getAttribute("data-btn-id");

         let editAccountRecordId = { editAcccId: this.editAccountId };
         this.omniApplyCallResp(editAccountRecordId);

         for (var i = 0; i < this.cardList.length; i++) {
            if (this.cardList[i].accountId == this.cardId) {
               if (this.cardList[i].cc == true) {
                  let editInfoHeader = { editCard: true, editETF: false, addCard: false, addEFT: false };
                  this.omniApplyCallResp(editInfoHeader);
                  this.omniNextStep();
               } else {
                  let editInfoHeader = { editETF: true, editCard: false, addCard: false, addEFT: false };
                  this.omniApplyCallResp(editInfoHeader);
                  this.omniNextStep();
               }
            }
         }
      }
   }

   //Delete card from UI
   deleteFromUI(evt) {
      if (evt) {

         this.removeCard(evt);

         //const cardId = this.cardId;
         //console.log("cardId in deleteFromUI: ", cardId);
         
         // function refreshList(obj) {
         //    if (obj.accountId != cardId) {
         //       return true;
         //    } else {
         //       return false;
         //    }
         // }
         
         
         //The card should not be deleted from the UI is IP sends an error
         //this.allowToDelete = false;

         // if (this.allowToDelete == true){
         //    console.log("remove card form UI");
         //    //this.cardList = this.cardList.filter(refreshList);   
         //    this.cardList = this.cardList.filter(refreshList);
         // }
         //this.closeModalDeleteCard();
      }
   }

   /* Delete card and go to the make a payment/set up autopay page and delete CC or ETF record*/
   removeCard(evt) {
      if (evt) {
         this.closeModalDeleteCard();
         this.loading = true;
         for (var i = 0; i < this.cardList.length; i++) {
            if (this.cardList[i].accountId == this.cardId) {
               /**************** Member/DeleteUserPaymentAccount IP **************/
               //1. User Id
               //2. Plan Type
               //3. Account Id

               let deleteInputParam = { UserId: this.userId, planType: this.planType, accountId: this.cardList[i].accountId };
               const deleteParams = {
                  input: deleteInputParam,
                  sClassName: "omnistudio.IntegrationProcedureService",
                  sMethodName: "Member_DeleteUserPaymentAccount",
                  options: "{}",
               };

               this.omniRemoteCall(deleteParams, true).then((response) => {
                  let jsonDeleteData = response.result.IPResult;
                  //console.log("DeleteUserPaymentAccount response: ", jsonDeleteData);

                  if (jsonDeleteData.code == "R356"){
                     this.openModalNoCardSelected = true; // open sencond modal
                     this.noAllowToDeleteMsg = true;
                  } else {
                     //console.log("remove card form UI");
                     
                     const cardId = this.cardId;
                     function refreshList(obj) {
                        if (obj.accountId != cardId) {
                           return true;
                        } else {
                           return false;
                        }
                     }
                     this.allowToDelete = true; // If IP response is good, delete card from the UI
                     this.openModalNoCardSelected = false;
                     this.noAllowToDeleteMsg = false; // change content of the modal
                     this.cardList = this.cardList.filter(refreshList); 
                  }
                  this.loading = false;
               });
               this.noAllowToDeleteMsg = false; //Set false to show original message
            } //end if
         } //end for
      } //end evt
   }

   openModalDeleteCard(evt) {
      if (evt) {
         this.modalDeleteCard = true;
         this.cardId = evt.target.getAttribute("data-btn-id");

         for (var i = 0; i < this.cardList.length; i++) {
            if (this.cardList[i].accountId == this.cardId) {
               if (this.cardList[i].cc == true) {
                  this.cardPopUp = true;
                  this.accountPopUp = false;

                  this.errorMessageCancelPendingPayment = false;
               } else {
                  this.accountPopUp = true;
                  this.cardPopUp = false;

                  this.errorMessageCancelPendingPayment = false;
               }
            }

         }
         // this.modalDeleteCard = true;
      }
      //console.log("this.errorMessageCancelPendingPayment: ", this.errorMessageCancelPendingPayment);
   }

   closeModalDeleteCard() {
      this.modalDeleteCard = false;
   }

   closeModalNoCardSelected(){
      console.log("closeModalNoCardSelected");
      this.openModalNoCardSelected = false;
   }

   /* Remove card from the UI */
   // removeCard(evt) {
   //    if (evt) {
   //       const cardId = evt.target.getAttribute("data-btn-id");
   //       function refreshList(obj) {
   //          if (obj.accountId != cardId) {
   //             return true;
   //          } else {
   //             return false;
   //          }
   //       }
   //       this.cardList = this.cardList.filter(refreshList);
   //    }
   // }

   /* Enter your CVV */
   validateCV(evt) {
      if (evt) {
         let cvValue = evt.target.value;
         this.loadCVV(cvValue);
         let cvId = evt.target.id;
         let splitedId = cvId.split("-");
         for (var a = 0; a < this.cardList.length; a++) {
            if (this.cardList[a].accountId == splitedId[0]) {
               this.cardList[a].cvvNumber = cvValue;
               if (evt.target.value.length == this.cardList[a].cvSize) {
                  this.cardList[a].requiredCVV = false;
                  // this.loadCVV(this.cardList[a].cvvNumber);
               } else {
                  this.cardList[a].requiredCVV = true;
               }
            }
         }
      }
   }

   /* I Accept Terms & Conditions */
   termsConditions(evt) {
      if (evt) {
         this.checkboxVal = evt.target.checked;
      }
   }

   /* Retrieve the Status of the Payment */
   async checkPayment() {
      let myinputs = { paymentMethod: this.paymentMethod, userId: this.userId, accountId: this.accountId, planType: this.planType, invoiceNumber: this.invoiceNumber, mode: this.mode };
      const myparams = {
         input: myinputs,
         sClassName: "omnistudio.IntegrationProcedureService",
         sMethodName: "Member_ManageRecurringEnrollment",
         options: "{}",
      };
      let response = await this.omniRemoteCall(myparams, true);
      return response;
   }

   /* Retrieve the Status of the Payment in MakeSinglePayment*/
   async checkPaymentMAP() {
      this.omniScritpData = JSON.parse(JSON.stringify(this.omniJsonData));
      // MPV-638
      if (this.omniScritpData.binderPayment == true || this.omniScritpData.action == "makebinderpayment") {
         // Tranform totalAmountDue string to integer
         let totalBinderPayment = parseFloat(this.omniScritpData.binder.memberResponsibilityAmount);
         this.paymentAmount = totalBinderPayment;
         //this.paymentAmount = false;
      } else {
         this.paymentAmount = this.omniScritpData.pay;
         this.paymentAmount = this.paymentAmount.toString().replace(/[,$]/g, "");
      }
      this.cvdValue = this.omniScritpData.CVV;

      if (this.cvdValue == null || this.cvdValue == undefined) {
         this.cvdValue = "";
      } else {
         this.cvdValue = this.omniScritpData.CVV;
      }

      let inputParam = {
         paymentMethod: this.paymentMethod,
         paymentAmount: this.paymentAmount,
         userId: this.userId,
         accountId: this.accountId,
         planType: this.planType,
         cvdValue: this.cvdValue,
         mode: this.modeMakeAPayment,
         effectiveDate: this.todayT,
      };

      const myparams = {
         input: inputParam,
         sClassName: "omnistudio.IntegrationProcedureService",
         sMethodName: "Member_MakeSinglePayment",
         options: "{}",
      };
      let response = await this.omniRemoteCall(myparams, true);
      return response;
   }

   /* How to find CVV */
   showCVVImage() {
      for (var i = 0; i < this.cardList.length; i++) {
         if (this.cardList[i].isSelected == true) {
            this.cardList[i].showCvv = true;
         } else {
            this.cardList[i].showCvv = false;
         }
      }
   }

   /********** NAVIGATION METHODS ADD CC/ACH **********/
   /* Add a New Credit/Debit Card */
   navigateAddCard(evt) {
      if (evt) {
         let viewCardInfo = { addCard: true, addEFT: false, editCard: false, editETF: false };
         this.omniApplyCallResp(viewCardInfo);
         this.omniNextStep();
         this.keepSelection = true;
         let keepValues = { keepSelection: true };
         this.omniApplyCallResp(keepValues);
      }
   }
   /* Add a New Electronic Fund Transfer */
   navigateAddEFT(evt) {
      if (evt) {
         let viewCardInfo = { addEFT: true, addCard: false, editCard: false, editETF: false };
         this.omniApplyCallResp(viewCardInfo);
         this.omniNextStep();
         this.keepSelection = true;
         let keepValues = { keepSelection: true };
         this.omniApplyCallResp(keepValues);
      }
   }
   /* Set up Auto Pay */
   async setAutoPay(evt) {
      if (evt) {
         let selectedCard; //  Store selected Card
         let checkCard = false; //  Check that one card is selected
         let checkCVV = false; //  Validate CVV
         let checkSuccess = false; //  Validate all the above
         let checkAmountToPay = false;

         /* Check if there is an amount selected  */
         if (this.paymentTypeSelected == true) {
            checkAmountToPay = true;
         } else {
            checkAmountToPay = false;
         }

         /* Check if there is a card selected */
         if (this.cardList.length > 0) {
            function getSelected(card) {
               if (card.isSelected == true) {
                  return true;
               } else {
                  return false;
               }
            }
            selectedCard = this.cardList.filter(getSelected);
            if (selectedCard.length === 0) {
               this.selectCardError = true;
               this.openModalNoCardSelected = true;
               this.noAllowToDeleteMsg = false;
            } else {
               /* Validate CVV for Credit/Debit cards*/
               this.selectCardError = false;
               if (selectedCard[0].cc == true) {
                  if (selectedCard[0] != null && selectedCard[0] != undefined) {
                     checkCard = selectedCard[0].isSelected;
                     if (selectedCard[0].cvvNumber.length == selectedCard[0].cvSize) {
                        checkCVV = true;
                     } else {
                        let idName = selectedCard[0].cvvId;
                        this.template.querySelector("input[name='" + idName + "']").focus();
                        this.template.querySelector("input[name='" + idName + "']").setAttribute("style", "border-color: #cc0000; border-radius: 5px");
                     }
                  }
                  /* Skip validation for Bank or Chase accounts*/
               } else {
                  checkCard = true;
                  checkCVV = true;
               }
            }
         } else {
            //console.log("please add a card to continue");
            this.selectCardError = true;
            this.openModalNoCardSelected = true;
            this.noAllowToDeleteMsg = false;
         }

         /* Check Terms & Conditions */
         if (this.checkboxVal == true) {
            this.errorTerms = false;
         } else {
            this.errorTerms = true;
         }

         /* Validate all the conditions above */
         if (checkCard == true && this.checkboxVal == true && checkCVV == true) {
            checkSuccess = true;
         } else {
            checkSuccess = false;
         }

         /* SET UP AUTOPAY If all the conditions are met then proceed to the next step*/
         if (checkCard == true && this.checkboxVal == true && checkSuccess == true && checkCVV == true && this.setUpAutopayFlow == true) {
            this.loading = true;
            this.accountId = selectedCard[0].accountId;
            if (selectedCard[0].cc == true) {
               this.paymentMethod = "CC";
            } else {
               this.paymentMethod = "ACH";
            }
            // Code S037: Recurring Enrollment Added Successfully - ENROLL
            // Code R117: Recurring Payment Exists for this User and Product - ENROLL
            // Code S040: Recurring Enrollment Found Successfully - GET
            // Code S039: Recurring Enrollment Cancelled Successfully - CANCEL

            // Make a Payment
            // Code S013: "ACH Payment Created"
            // Code S016: "CC Payment Created"
            let expectedData;

            if ((this.setUpAutopayFlow = true)) {
               expectedData = await this.checkPayment();
            }
            /* Validate if is Server Error or Internal Error*/
            let infoStatusCodeAutoPay;
            if (expectedData.result.IPResult.success == false) {
               infoStatusCodeAutoPay = "ERROR";
               let viewCardInfo = {
                  checkSuccess: checkSuccess,
                  statusCode: infoStatusCodeAutoPay,
                  addCard: false,
                  addEFT: false,
                  editCard: false,
                  editETF: false,
               };
               this.loading = false;
               this.omniApplyCallResp(viewCardInfo);
               this.omniNextStep();
            } else {
               /* Validate values to push to OmniScript JSON */
               if (expectedData.result.IPResult.recurringEnrollment != null && expectedData.result.IPResult.recurringEnrollment != null) {
                  this.code = expectedData.result.IPResult.result.code;
                  this.codeDesc = expectedData.result.IPResult.result.description;
                  this.referenceId = expectedData.result.IPResult.recurringEnrollment.recurringReferenceId;
                  this.confirmationDate = expectedData.result.IPResult.recurringEnrollment.confirmationDate;
               } else {
                  this.referenceId = null;
                  this.confirmationDate = null;
               }

               /* Create redirect URL for Confirmation page */
               let redirectBilling = "";
               let hostName = window.location.hostname;

               redirectBilling = "https://" + hostName + "/memberportal/s/";
 
               /* Update OmniScript JSON */
               let viewCardInfo = {
                  checkSuccess: checkSuccess,
                  statusCode: this.code,
                  statusDescription: this.codeDesc,
                  redirectBilling: redirectBilling,
                  referenceId: this.referenceId,
                  confirmationDate: this.confirmationDate,
                  showSAP: false,
                  addCard: false,
                  addEFT: false,
                  editCard: false,
                  editETF: false,
               };

               let stepInfo = {
                  STEP_SetAutoPay: {
                     paymentMethod: this.paymentMethod,
                     userId: this.userId,
                     accountId: this.accountId,
                     planType: this.planType,
                     invoiceNumber: this.invoiceNumber,
                     mode: this.mode,
                  },
               };
               this.loading = false;

               //AFIRE-46 - Allow Success Auto Pay for Demo Purposes
               viewCardInfo.statusCode = 'S037';
               viewCardInfo.referenceId = '238947628756';
               //
               this.omniApplyCallResp(stepInfo);
               this.omniApplyCallResp(viewCardInfo);
               this.omniNextStep();
            }
         } else {
         }

         /* MAKE A PAYMENT: If all the conditions are met then proceed to the next step*/
         if (
            checkCard == true &&
            this.checkboxVal == true &&
            checkSuccess == true &&
            checkCVV == true &&
            checkAmountToPay == true &&
            (this.makeAPaymentFlow == true || this.makeBinderPayment == true) &&
            this.stillZero == false
         ) {
            this.loading = true;
            this.accountId = selectedCard[0].accountId;
            if (selectedCard[0].cc == true) {
               this.paymentMethod = "CC";
            } else {
               this.paymentMethod = "ACH";
            }

            this.modeMakeAPayment = "pay";
            //let expectedDataMakeAPayment = await this.setAutoPay();
            let expectedDataMakeAPayment = await this.checkPaymentMAP();
            /* Validate if is Server Error or Internal Error*/
            let infoStatusCode;
            if (expectedDataMakeAPayment.result.IPResult.success == false) {
               infoStatusCode = "ERROR";
               let viewCardInfo = {
                  checkSuccess: checkSuccess,
                  statusCode: infoStatusCode,
                  addCard: false,
                  addEFT: false,
                  editCard: false,
                  editETF: false,
               };
               this.loading = false;
               this.omniApplyCallResp(viewCardInfo);
               this.omniNextStep();
            } else {

               //AFIRE-48 By pass IP Call that does not exist 
               /* Validate values to push to OmniScript JSON */
               // if (expectedDataMakeAPayment.result.IPResult.payment.confirmationNumber != null) {
               //    this.statusMAP = expectedDataMakeAPayment.result.IPResult.payment.status;
               //    this.confirmationNumber = expectedDataMakeAPayment.result.IPResult.payment.confirmationNumber;
               //    this.codeMAP = expectedDataMakeAPayment.result.IPResult.result.code;
               //    this.referenceId = expectedDataMakeAPayment.result.IPResult.payment.confirmationNumber;
               // } else {
               //    this.statusMAP = null;
               //    this.confirmationNumber = null;
               //    this.codeMAP = null;
               // }

               /* Create redirect URL for Confirmation page */
               let redirectBilling = "";
               let hostName = window.location.hostname;

               redirectBilling = "https://" + hostName + "/memberportal/s/";
         
               if (this.settedAutoPay == "STOP") {
                  this.showSAP = true;
               } else if (this.settedAutoPay == "ACTV") {
                  this.showSAP = false;
               } else {
                  this.showSAP = false;
                  if (this.omniscriptData.code == "R114") {
                     this.showSAP = true;
                  } else {
                     this.showSAP = false;
                  }
               }
               //MPV-1361
               if (this.omniscriptData.action == "makebinderpayment" || this.omniscriptData.binderPayment == true) {
                  this.showSAP = false;
               }

               /* Update OmniScript JSON - ONLY FOR MAKE A PAYMENT */
               let viewCardInfo = {
                  checkSuccess: checkSuccess,
                  statusCode: this.codeMAP,
                  statusMAP: this.statusMAP,
                  redirectBilling: redirectBilling,
                  confirmationNumber: this.confirmationNumber,
                  referenceId: this.referenceId,
                  showSAP: this.showSAP,
                  addCard: false,
                  addEFT: false,
                  editCard: false,
                  editETF: false,
               };
               this.loading = false;

               //AFIRE-46 - Allow Success Auto Pay for Demo Purposes
               viewCardInfo.statusCode = 'S037';
               viewCardInfo.referenceId = '238947628757';
               this.omniApplyCallResp(viewCardInfo);
               this.omniNextStep();
            }
         } else {
            if (this.radioSelected == "Pay Custom Amount" && this.stillZero == true && this.showAmountMessage == false) {
               this.showAmountMessage = true;
            }
         }
      }
   }

   loadCVV(cvvNum) {
      let cvvEntered = { CVV: cvvNum };
      this.omniApplyCallResp(cvvEntered);
   }
   /* Cancel */
   goBack(evt) {
      if (this.omniscriptData.action == "makebinderpayment" || this.omniscriptData.binderPayment == true) {
         this[NavigationMixin.Navigate](
            {
               type: "standard__namedPage",
               attributes: {
                  pageName: "billing-and-payment",
               },
            },
            true // Replaces the current page in your browser history with the URL
         );
      } else {
         if (evt) {
            this.omniPrevStep();
         }
      }
   }

   handleAmountChange(evt) {
      let customAmount = evt.target.value;

      let customNoDollarSignAndCommas = customAmount.toString().replace(/[,$]/g, "");

      let customAmountParsed = parseFloat(customNoDollarSignAndCommas);

      if (customAmountParsed < this.totalAmountDue) {
         this.showAmountMessage = true;
         this.showCustomAmountMessage = false;
      } else if (customAmountParsed > this.totalAmountDue) {
         this.showCustomAmountMessage = true;
         this.showAmountMessage = false;
      } else {
         this.showAmountMessage = false;
         this.showCustomAmountMessage = false;
      }
      //this.amountcustom = customAmount;
      this.amountcustom = customAmountParsed;

      this.firstLoadCA = true;

      if (this.amountcustom > 0) {
         this.stillZero = false;
         this.disableSubmitButton = false;
         this.showZeroValueMessage = false;
      } else if (this.amountcustom <= 0) {
         this.stillZero = true;
         this.disableSubmitButton = true;
         this.showZeroValueMessage = true;
      }
      let customAmountToBePaid = { pay: customAmount };
      this.omniApplyCallResp(customAmountToBePaid);
   }

   payCustomAmount(evt) {
      if (evt) {
         this.radioSelected = evt.target.getAttribute("value");
      }
      if (this.radioSelected === "Pay Custom Amount") {
         this.payCstmAmt = true;

         //flags
         this.flagTotalAmount = false;
         this.flagPastDue = false;
         this.flagCustomAmount = true;

         if (this.totalAmountDue == 0 || this.totalAmountDue == "0.00" || this.totalAmountDue == "0") {
            this.showAmountMessage = false;
            this.showZeroValueMessage = true;
            this.showCustomAmountMessage = false;
         } else if ((this.amountcustom < this.totalAmountDue) & (this.firstLoadCA == true)) {
            this.showAmountMessage = true;
            this.showCustomAmountMessage = false;
         } else if (this.amountcustom > this.totalAmountDue) {
            this.showCustomAmountMessage = true;
         } else {
            this.showAmountMessage = false;
            this.showCustomAmountMessage = false;
         }

         if (this.amountcustom == 0 || this.amountcustom == "0" || this.amountcustom < 0) {
            this.showAmountMessage = true; // See MPV-786
            this.disableSubmitButton = true; // Disable submit button if custom amount is 0
            this.stillZero = true;
            this.showZeroValueMessage = true;
            this.showCustomAmountMessage = false;
         } else {
            this.stillZero = false;
            this.disableSubmitButton = false; // Enable submit button if custom amount is > 0
            this.showZeroValueMessage = false;
         }

         let pay = { pay: this.amountcustom };

         this.omniApplyCallResp(pay);
      } else {
         this.payCstmAmt = false;
         this.showAmountMessage = false;
         this.showCustomAmountMessage = false;
         // this.flagTotalAmount =false;
      }

      if (this.radioSelected === "Total Amount Due") {
         //flags
         this.flagTotalAmount = true;
         this.flagPastDue = false;
         this.flagCustomAmount = false;
         this.showCustomAmountMessage = false;
         this.stillZero = false;

         // if (this.totalAmountDue <= 0){
         //    this.disableSubmitButton = true;
         // } else {
         //    this.disableSubmitButton = false;
         // }
         this.disableSubmitButton = false;
         this.showZeroValueMessage = false;

         this.payCstmAmt = false;
         let pay = { pay: this.totalAmountDue };
         this.omniApplyCallResp(pay);
      }

      if (this.radioSelected === "Past Due Amount") {
         //flags
         this.flagTotalAmount = false;
         this.flagPastDue = true;
         this.flagCustomAmount = false;
         this.showCustomAmountMessage = false;
         this.stillZero = false;

         // if (this.pastDueAmount <= 0){
         //    this.disableSubmitButton = true;
         // } else {
         //    this.disableSubmitButton = false;
         // }
         this.disableSubmitButton = false;
         this.showZeroValueMessage = false;

         this.payCstmAmt = false;
         let pay = { pay: this.pastDueAmount };
         this.omniApplyCallResp(pay);
      }

      this.paymentTypeSelected = true;
      this.setPaymentType(this.radioSelected);
      
   }

   selectedByDefault() {
      this.template.querySelector(".radioTotal").checked = true;
   }

   selectedCustomAmounntByDefault() {
      this.template.querySelector(".radioCustom").checked = true;
      this.flagCustomAmount = true;
   }

   setPaymentType(radioSelected) {
      let paymentSelected = { paymentType: radioSelected };
      this.omniApplyCallResp(paymentSelected);
   }

   openModalCVVImage() {
      this.openModalCVV = true;
   }

   closeCVVModal() {
      this.openModalCVV = false;
   }

   closeCardDesktop() {
      for (var i = 0; i < this.cardList.length; i++) {
         if (this.cardList[i].isSelected == true) {
            this.cardList[i].showCvv = false;
         }
      }
   }

   transformPaymentDate(evt) {
      if (evt) {
         this.dateEntered = evt.target.value;

         // Transform date entered to this format: yyyy-mm-dd
         this.todayTransfromed = new Date(this.dateEntered);
         var dd = String(this.todayTransfromed.getDate()).padStart(2, "0");
         var mm = String(this.todayTransfromed.getMonth() + 1).padStart(2, "0"); //January is 0!
         var yyyy = this.todayTransfromed.getFullYear();

         this.todayT = yyyy + "-" + mm + "-" + dd;

         let paymentDate = { effectiveDate: this.todayT };
         this.omniApplyCallResp(paymentDate);
      }
   }

   // totalAmountDefaultSelected(){
   //     this.template.querySelector(".defaultSelected").value = true;
   // }
}
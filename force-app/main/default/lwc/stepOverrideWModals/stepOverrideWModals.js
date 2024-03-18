import { LightningElement, api, track } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import OmniscriptStep from "omnistudio/omniscriptStep";
import tmpl from "./stepOverrideWModals.html";
import pubsub from "omnistudio/pubsub";
import { fetchCustomLabels } from "omnistudio/utility";
import { NavigationMixin } from "lightning/navigation";
import { loadStyle } from "lightning/platformResourceLoader";
//import { getUrlValues } from "c/stepUtilsLWC";
// import FORM_FACTOR from '@salesforce/client/formFactor';

export default class StepOverrideWModals extends NavigationMixin(OmniscriptBaseMixin(OmniscriptStep)) {
   // render html file
   render() {
      return tmpl;
   }

   // track changing values
   @track errorLog = [];
   disabled = false;
   submitnotclickable = false;
   errorMsg;
   cancelBtnClass;
   portalRender = false;
   cancelRender = false;
   currentStep;
   currentStepLabel;
   currentIndex;
   showPreviousButton = false;
   errorClicked = false;
   cancelClicked = false;
   errorLink;
   ariaInvalid = false;
   nextButtonLabel = "Next";
   cancelButtonLabel = "Cancel";

   //Accessibility
   previousButtonAriaLabel;
   nextButtonAriaLabel;
   cancelButtonAriaLabel;

   // @track labels={}; --> comment back in when custom labels are used
   pageWithoutCancel = false;
   pageWithoutNextBtn = false;
   pageWithoutPrevious = false;
   maxDate;
   minDate;
   cancelButtons = true;
   CancelOnSide = false;
   url;
   cancelText;
   cancelYes;
   cancelNo;
   privateTitle;
   portal = "member";
   /*isphoneNull = false;
   phoneError;
   phoneCancelClicked = false;*/

   //@api to expose public title attribute for screen readers
   @api
   get title() {
      return this.privateTitle;
   }

   //valueURLTest = getUrlValues();

   // once we use custom labels we will need to uncomment
   // getCustomLabels(){
   //     fetchCustomLabels(["CancelModalText"])
   //           .then(data => {
   //
   //             this.labels = data;
   //
   //           })
   //           .catch(error => console.error(error));
   //     };

   @track sticky = "";
   get getStickyClass() {
      if (document.documentElement.clientWidth > 768) {
            this.sticky = false;
           
      } else {
            this.sticky = true;
      }
      //console.log("getStickyClass: ", this.sticky nds-hide_medium);
      return this.sticky ? "nds-hide_small nds-grid sticky" : "nds-hide_small nds-grid nonSticky";
      //return this.sticky ? "c-mobile-device_hide nds-grid sticky" : "c-mobile-device_hide nds-grid nonSticky";

   }

   //validation to proceed to next step
   handleNextClick(e) {
      e.preventDefault();
      // handleNextClick(){
      this.errorClicked = false;
      //dynamic version to check validation errors
      let validationErrors = [];

      //current step name
      if (this.jsonDef.bAccordionActive === true) {
         if (this.jsonDef.propSetMap.label) {
            this.currentStepLabel = this.jsonDef.propSetMap.label;
         } else {
            this.currentStepLabel = this.jsonDef.name;
         }
         this.currentStep = this.jsonDef.name;

         if (this.jsonData.StepsWCustomFields) {
            this.jsonData.StepsWCustomFields.forEach((stepName) => {
               for (const key in this.jsonData) {
                  if (key === stepName) {
                     for (const node in this.jsonData[key]) {
                        let jDNode = this.jsonData[key];
                        if (node.includes("c---") & node.includes("---Msg")) {
                           if (jDNode[node] !== "") {
                              validationErrors.push(jDNode[node]);
                           }
                        }
                     }
                  }
               }
            });
         }
         //addon 9/7 stop

         //validation inside of current step for Text, Block, Edit Block, TypeAhead
         this.jsonDef?.children?.forEach((item) => {
            if (item.eleArray[0].bShow === undefined || item.eleArray[0].bShow == true) {
               // if(!item.eleArray[0].propSetMap.customModalError){
               if (item.eleArray[0].type === "Block") {
                  if (item.eleArray[0].children.length > 0) {
                     item.eleArray[0].children.forEach((item2) => {
                        if (
                           (item2.eleArray[0].bShow === undefined || item2.eleArray[0].bShow == true) &&
                           !item2.eleArray[0].response &&
                           item2.eleArray[0].propSetMap.required === true &&
                           item2.eleArray[0].propSetMap.hide === false
                        ) {
                           validationErrors.push(`${item2.eleArray[0].propSetMap.label} is missing`);
                        }
                     });
                  }
                  // }
               } else if (item.eleArray[0].type === "Edit Block") {
                  // if(!item.eleArray[0].propSetMap.customModalError){
                  if (item.eleArray[0].children.length > 0) {
                     item.eleArray[0].children.forEach((item2) => {
                        if (
                           (item2.eleArray[0].bShow === undefined || item2.eleArray[0].bShow == true) &&
                           !item2.eleArray[0].response &&
                           item2.eleArray[0].propSetMap.required === true &&
                           item2.eleArray[0].propSetMap.hide === false
                        ) {
                           validationErrors.push(`${item2.eleArray[0].propSetMap.label} is missing`);
                        }
                     });
                  }
                  // }
               } else if (item.eleArray[0].type === "Type Ahead Block") {
                  let resp = item.eleArray[0].response;
                  let nullResp = false;
                  let values;
                  if (resp !== null && typeof resp === "object") {
                     values = Object.keys(resp).map((e) => {
                        return resp[e];
                     });
                     if (values[0] === null) {
                        nullResp = true;
                     }
                  }
                  // if((!resp || !Object.values(resp) === null)){
                  // }
                  if ((!resp || nullResp === true) && !item.eleArray[0].propSetMap.customModalError) {
                     if (item.eleArray[0].children.length > 0) {
                        item.eleArray[0].children.forEach((item2) => {
                           if (!item2.response && item2.eleArray[0].propSetMap.required === true) {
                              validationErrors.push(`${item2.eleArray[0].propSetMap.label} is missing`);
                           }
                        });
                     }
                  }
               } else if (item.eleArray[0].type === "Validation") {
                  if (item.eleArray[0].propSetMap.messages.length > 0 && item.eleArray[0].response === false && item.eleArray[0].response !== null) {
                     item.eleArray[0].propSetMap.messages.forEach((item2) => {
                        if (item2.active && item2.type !== "Success") {
                           //added 9/7/21 MPV-1312 to account for differnt error messages
                           if (item2.text == "%FRMLmsgArr%") {
                              let messageArray = [];
                              if (this.jsonData.MessageLoop && this.jsonData.MessageLoop !== "NA") {
                                 messageArray = this.jsonData.MessageLoop;
                                 if (this.jsonData.Node) {
                                    messageArray.forEach((node) => {
                                       for (const key in node) {
                                          if (key == this.jsonData.Node) {
                                             validationErrors.push(node[key]);
                                          }
                                       }
                                    });
                                 }
                              }
                           } else if (item2.text.includes("%") && item2.text !== "%FRMLmsgArr%") {
                              let indices = [];
                              for (let i = 0; i < item2.text.length; i++) {
                                 if (item2.text[i] === "%") {
                                    indices.push(i);
                                 }
                              }
                              let newString;
                              if (indices.length > 0) {
                                 newString = item2.text.slice(indices[0] + 1, indices[1]);
                                 if (newString) {
                                    for (const key in this.jsonData) {
                                       if (key === newString) {
                                          let data = this.jsonData[key];
                                          let errMsg = `${item2.text.slice(0, indices[0])}${data}${item2.text.slice(indices[1] + 1)}`;
                                          validationErrors.push(errMsg);
                                       }
                                    }
                                 }
                              }
                              //add on stop
                           } else {
                              validationErrors.push(item2.text);
                           }
                        }
                     });
                  }
               } else if (
                  item.eleArray[0].type === "Text" ||
                  item.eleArray[0].type === "Email" ||
                  item.eleArray[0].type === "Telephone" ||
                  item.eleArray[0].type === "Password" ||
                  item.eleArray[0].type === "Select" ||
                  item.eleArray[0].type === "Number" ||
                  item.eleArray[0].type === "Radio"
               ) {
                  // if(!item.eleArray[0].propSetMap.customModalError){
                  if (!item.eleArray[0].response && item.eleArray[0].propSetMap.required === true && item.eleArray[0].children.length === 0) {
                     //check for required field
                     if (item.eleArray[0].propSetMap.label === "" || item.eleArray[0].propSetMap.label === null) {
                        validationErrors.push(`Required field is missing`);
                     } else {
                        validationErrors.push(`${item.eleArray[0].propSetMap.label} is missing`);
                     }
                     // }
                  } else if (item.eleArray[0].response && item.eleArray[0].propSetMap.pattern) {
                     //check for validation pattern
                     var regexMatch = new RegExp(item.eleArray[0].propSetMap.pattern);
                     var patternMatch = regexMatch.test(item.eleArray[0].response);
                     if (patternMatch === false) {
                        if (item.eleArray[0].propSetMap.ModalErrorMsg) {
                           validationErrors.push(item.eleArray[0].propSetMap.ModalErrorMsg);
                        } else {
                           validationErrors.push(`${item.eleArray[0].propSetMap.label} is invalid`);
                        }
                     }
                  }
                  //add on 9/8 MPV-1312 for custom error messages related to length
                  // }else if((item.eleArray[0].response.length > item.eleArray[0].propSetMap.maxLength ||  item.eleArray[0].response.length < item.eleArray[0].propSetMap.minLength) && item.eleArray[0].propSetMap.customErrMsg){
                  //    validationErrors.push(`${item.eleArray[0].propSetMap.label} ${item.eleArray[0].propSetMap.customErrMsg}`);
                  // }
               } else if (item.eleArray[0].type === "Date") {
                  // if(!item.eleArray[0].propSetMap.customModalError){
                  if (!item.eleArray[0].response && item.eleArray[0].propSetMap.required === true) {
                     validationErrors.push(`${item.eleArray[0].propSetMap.label} is missing`);
                  }
                  // }
                  //define maxDate
                  else if (item.eleArray[0].response && (item.eleArray[0].propSetMap.maximumDate != "" || item.eleArray[0].propSetMap.maxDate != "")) {
                     if (item.eleArray[0].response && item.eleArray[0].propSetMap.maximumDate) {
                        this.maxDate = item.eleArray[0].propSetMap.maximumDate.split(" ");
                     } else if (item.eleArray[0].response && item.eleArray[0].propSetMap.maxDate) {
                        this.maxDate = item.eleArray[0].propSetMap.maxDate.split(" ");
                     }
                  }

                  //define minDate
                  if (item.eleArray[0].response && (item.eleArray[0].propSetMap.minimumDate != "" || item.eleArray[0].propSetMap.minDate != "")) {
                     if (item.eleArray[0].response && item.eleArray[0].propSetMap.minimumDate) {
                        this.minDate = item.eleArray[0].propSetMap.minimumDate.split(" ");
                     } else if (item.eleArray[0].response && item.eleArray[0].propSetMap.minDate) {
                        this.minDate = item.eleArray[0].propSetMap.minDate.split(" ");
                     }
                  }
                  //get the date from the split maxDate
                  try {
                     if (this.maxDate != "" && this.maxDate != null && this.maxDate != "undefined") {
                        if (this.maxDate.length === 1) {
                           if (this.maxDate[0].toUpperCase() != "TODAY") {
                              var todaysDate = new Date();
                              if (item.eleArray[0].response > todaysDate) {
                                 if (item.eleArray[0].propSetMap.ModalDateErrorMsg) {
                                    validationErrors.push(item.eleArray[0].propSetMap.ModalDateErrorMsg);
                                 } else {
                                    validationErrors.push(`${item.eleArray[0].propSetMap.label} is invalid`);
                                 }
                              }
                           }
                        } else if (this.maxDate.length === 4) {
                           //Today +- x months

                           var d = new Date();
                           if (this.maxDate[3].toUpperCase() == "MONTHS") {
                              if (this.maxDate[1] == "-") {
                                 d.setMonth(d.getMonth() - this.maxDate[2]);
                              } else {
                                 d.setMonth(d.getMonth() + this.maxDate[2]);
                              }
                           }
                           d = d.toISOString().slice(0, 10);

                           if (item.eleArray[0].response > d) {
                              if (item.eleArray[0].propSetMap.ModalDateErrorMsg) {
                                 validationErrors.push(item.eleArray[0].propSetMap.ModalDateErrorMsg);
                              } else {
                                 validationErrors.push(`${item.eleArray[0].propSetMap.label} is invalid`);
                              }
                           }
                        }
                     }
                  } catch (e) {
                     console.error(e);
                  }

                  //get the date from the split minDate
                  try {
                     if (this.minDate != "" && this.minDate != null && this.minDate != "undefined") {
                        if (this.minDate.length === 1) {
                           if (this.minDate[0].toUpperCase() != "TODAY") {
                              var todaysDate = new Date();
                              if (item.eleArray[0].response > todaysDate) {
                                 if (item.eleArray[0].propSetMap.ModalDateErrorMsg) {
                                    validationErrors.push(item.eleArray[0].propSetMap.ModalDateErrorMsg);
                                 } else {
                                    validationErrors.push(`${item.eleArray[0].propSetMap.label} is invalid`);
                                 }
                              }
                           }
                        } else if (this.minDate.length === 4) {
                           //Today +- x months
                           var nd = new Date();
                           if (this.minDate[3].toUpperCase() == "MONTHS") {
                              if (this.minDate[1] == "-") {
                                 nd.setMonth(nd.getMonth() - this.minDate[2]);
                              } else {
                                 nd.setMonth(nd.getMonth() + this.minDate[2]);
                              }
                           }
                           nd = nd.toISOString().slice(0, 10);
                           if (item.eleArray[0].response < nd) {
                              if (item.eleArray[0].propSetMap.ModalDateErrorMsg) {
                                 validationErrors.push(item.eleArray[0].propSetMap.ModalDateErrorMsg);
                              } else {
                                 validationErrors.push(`${item.eleArray[0].propSetMap.label} is invalid`);
                              }
                           }
                        }
                     }
                  } catch (e) {
                     console.error(e);
                  }
               } else if (!item.eleArray[0].response && item.eleArray[0].propSetMap.required === true && item.eleArray[0].children.length === 0) {
                  validationErrors.push(`${item.eleArray[0].propSetMap.label} is missing`);
               }
            }
         });
      }

      //error message handling
      this.errorMsg = "";
      this.errorLog = validationErrors;
      this.errorSubMsg = "";
      this.ariaInvalid = false;
      this.errorLink;

      this.handleErrModal();
   }

   handleErrModal() {
      //create an error message if errorLog is not null
      if (this.errorLog.length > 0) {
         this.errorMsg = "Please fix the following " + this.errorLog.length + " error(s).";
         this.errorSubMsg = this.currentStepLabel + " has following missing required fields and errors:";
         // if(this.disabled === false){
         this.ariaInvalid = true;
         this.firstError = this.errorLog[0];
         //set focus on modal button
         setTimeout(() => this.template.querySelector('[data-id="modalButton"]').focus());
         // }
      } else {
         //added 10/1
         // this.disabled = false;
         // if(this.pageWithoutNextBtn == false){
         //    this.pageWithoutNextBtn = true;
         //    pubsub.fire("IMSOSNestButtonEvent", "data", "true");
         //    this.omniNextStep();
         // }else{
         //end add on 10/1
         pubsub.fire("IMSOSNestButtonEvent", "data", "true");
         this.omniNextStep();
         //}
      }
   }

   handlePreviousClick() {
      //clear error message
      this.errorMsg = "";
      this.errorSubMsg = "";
      this.errorLog = [];

      //fire back button
      pubsub.fire("IMSOSBackButtonEvent", "data", "true");
      this.omniPrevStep();
   }

   handleCancelClick() {
      if (this.jsonData.CancelText) {
         this.CancelText = this.jsonData.CancelText;
      } else {
         this.CancelText = "Are you sure? If you leave now, you will lose all previously entered information and will have to start over.";
      }
      if (this.jsonData.CancelYes) {
         this.cancelYes = this.jsonData.CancelYes;
      } else {
         this.cancelYes = "Yes, I am Sure";
      }
      if (this.jsonData.CancelNo) {
         this.cancelNo = this.jsonData.CancelNo;
      } else {
         this.cancelNo = "Go Back";
      }
      //added 9/8 MPV-1312 to allow to have steps without error modal when cancel is clicked but immediate redirect
      if (this.jsonDef.bAccordionActive === true && this.jsonData.PagesWOCancelModal) {
         this.jsonData.PagesWOCancelModal.forEach((step) => {
            if (step === this.jsonDef.name) {
               this.cancelClicked = false;
               this.url = `/${this.portal}/s${this.jsonData.RedirectTo}`;

               window.open(this.url, "_self");
               this[NavigationMixin.Navigate]({
                  type: "standard_navItemPage",
                  attributes: {
                     apiName: this.url,
                  },
               });
               // } else{
               //    this.cancelClicked = true;
               //    setTimeout(() => this.template.querySelector('[data-id="modalButton2"]').focus());
            }
         });

         //end add on
      } else {
         this.cancelClicked = true;
         setTimeout(() => this.template.querySelector('[data-id="modalButton2"]').focus());
      }
   }

   lastPage() {
      if (this.jsonDef.bAccordionActive === true && this.jsonData.LastStep) {
         this.jsonData.LastStep.forEach((step) => {
            if (step === this.jsonDef.name) {
               this.pageWithoutCancel = true;
               this.pageWithoutNextBtn = true;
            }
         });
      } else {
         this.pageWithoutCancel = false;
         this.pageWithoutNextBtn = false;
      }
   }

   hideCancelOnPage() {
      if (this.jsonDef.bAccordionActive === true && this.jsonData.PagesWOCancel) {
         this.jsonData.PagesWOCancel.forEach((step) => {
            if (step === this.jsonDef.name) {
               this.pageWithoutCancel = true;
            }
         });
      } else {
         this.pageWithoutCancel = false;
      }
   }

   hideNextOnPage() {
      if (this.jsonDef.bAccordionActive === true && this.jsonData.PagesWONext) {
         this.jsonData.PagesWONext.forEach((step) => {
            if (step === this.jsonDef.name) {
               this.pageWithoutNextBtn = true;
            }
         });
      } else {
         this.pageWithoutNextBtn = false;
      }
   }

   //added 10/1 to only show next button when all fields are validated
   // showNextOnlyAfterValidation(){
   //    if (this.jsonDef.bAccordionActive === true && this.jsonData.PagesWONextUntilValidation) {
   //       this.jsonData.PagesWONextUntilValidation.forEach((step) => {
   //          if (step === this.jsonDef.name) {
   //             this.pageWithoutNextBtn = true;
   //          }
   //       });
   //    } else {
   //       this.pageWithoutNextBtn = false;
   //    }
   //    this.handleNextClick();
   // }

   hidePreviousOnPage() {
      if (this.jsonDef.bAccordionActive === true && this.jsonData.PagesWOPrevious) {
         this.jsonData.PagesWOPrevious.forEach((step) => {
            if (step === this.jsonDef.name) {
               this.pageWithoutPrevious = true;
            }
         });
      } else {
         this.pageWithoutPrevious = false;
      }
   }

   hideCancelOnPage() {
      if (this.jsonDef.bAccordionActive === true && this.jsonData.PagesWOCancel) {
         this.jsonData.PagesWOCancel.forEach((step) => {
            if (step === this.jsonDef.name) {
               this.cancelButtons = false;
               this.pageWithoutCancel = true;
            }
         });
      } else {
         this.cancelButtons = this.cancelButtons;
         this.pageWithoutCancel = this.pageWithoutCancel;
      }
   }

   closeCancelModal() {
      this.cancelClicked = false;
   }
   closePhoneModal() {
      this.isphoneNull = false;
   }

   exitOS() {
      this.url = `/${this.portal}/s${this.jsonData.RedirectTo}`;


      // Accessibility changes required, see MPV-2138
      // this[NavigationMixin.Navigate]({
      //    type: "standard_navItemPage",
      //    attributes: {
      //       apiName: this.url,
      //    },
      // });

      window.open(this.url, "_self");
   }

   closeModal() {
      this.ariaInvalid = false;
   }

   trapFocus() {
      if (this.ariaInvalid == true) {
         this.template.querySelector('[data-id="modalButton"]').focus();
      } else if (this.cancelClicked == true) {
         this.template.querySelector('[data-id="modalButton2"]').focus();
      } else if (this.isphoneNull == true) {
         this.template.querySelector('[data-id="modalButton3"]').focus();
      }
   }

   connectedCallback() {
      // console.log('This device form factor is:', FORM_FACTOR);
      super.connectedCallback();

      this.portal = "member";
      this.cancelBtnClass = "nds-grid nds-show_medium";

      //get info from URL to set key provider to the correct value that is used in OS
      const _urlString = window.location.href;
      let provider = 'Attemtis'

      let tenantIdMsg = { provider: provider };
      this.omniApplyCallResp(tenantIdMsg);
      this.omniUpdateDataJson(tenantIdMsg);

      //comment back in if custom labels are used
      // this.getCustomLabels();
   }

   //10/1/ attempt to disable button
   // disabledNextButton(){
   //    if (this.jsonDef.bAccordionActive === true && this.jsonData.PagesWDisabledNext) {

   //             this.jsonData.PagesWDisabledNext.forEach((step) => {
   //                if (step === this.jsonDef.name) {
   //                this.disabled = true;
   //             }
   //             });
   //          } else {
   //             this.pageWithoutNextBtn = false;
   //          }
   // }

   //lifecycle hook
   renderedCallback() {
      super.renderedCallback();
      /*
      if (document.documentElement.clientWidth < 768) {
         console.log("mobile");
      } else {
         console.log("desktop");
      }
      */
      // if(this.jsonData.PagesWDisabledNext){

      //    this.disabledNextButton();
      // }

      //console.log("this.sticky: ",this.sticky);
      //this.sticky = false;
      //Accessibility Fix for Modal Focus begins here
      const focusableElements = 'anchor, button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const modal = this.template.querySelector(".modalAccessibility");

      if (modal != undefined) {
         const firstFocusableElement = modal.querySelectorAll(focusableElements)[0]; // get first element to be focused inside modal
         const focusableContent = modal.querySelectorAll(focusableElements);
         const lastFocusableElement = focusableContent[focusableContent.length - 1]; // get last element to be focused inside modal

         var me = this;
         window.addEventListener("keydown", function (event) {
            let isTabPressed = event.key === "Tab" || event.keyCode === 9;

            if (!isTabPressed) {
               return;
            }

            if (event.shiftKey) {
               // if shift key pressed for shift + tab combination
               if (me.template.activeElement === firstFocusableElement) {
                  lastFocusableElement.focus(); // add focus for the last focusable element
                  event.preventDefault();
               }
            } else {
               // if tab key is pressed
               if (me.template.activeElement === lastFocusableElement) {
                  // if focused has reached to last focusable element then focus first focusable element after pressing tab
                  firstFocusableElement.focus(); // add focus for the first focusable element
                  event.preventDefault();
               }
            }
         });

         firstFocusableElement.focus();

         window.addEventListener("keyup", function (event) {
            if (event.keyCode === 27 || event.key === "Escape") {
               me.closeModal();
               me.closeCancelModal();
            }
         });
      } //Accessibility Fix for Modal Focus ends here
      //console.log("this.jsonData: ", this.jsonData);
      if (this.jsonData.CancelOnMobile && this.jsonData.CancelOnMobile === "Y" && this.cancelRender === false) {
         this.CancelButtons = false;
         this.cancelBtnClass = "nds-grid nds-show";
         setTimeout(() => {
            this.CancelButtons = true;
         });
         this.cancelRender = true;
      }
      if (this.jsonData.CancelOnSide && this.jsonData.CancelOnSide === "Y") {
         this.CancelOnSide = true;
      }

      if (this.jsonData.portal && this.portalRender === false) {
         if (this.jsonData.portal) {
            this.portal = this.jsonData.portal;
         } else {
            this.portal = "member";
         }
         this.portalRender = true;
      }
      //find the currently open step
      if (this.jsonDef.bAccordionActive === true) {
         this.currentStep = this.jsonDef.name;
         // mpv-1672 adding check if specific step name and checked equal to false then submit button will have no funcationality
         if (this.currentStep == "ConnectWithCare" && this.jsonData.checked && this.jsonData.checked == "error") {
            this.submitnotclickable = true;
         } else {
            this.submitnotclickable = false;
         }

         if (this.jsonDef.propSetMap.label) {
            this.currentStepLabel = this.jsonDef.propSetMap.label;
         } else {
            this.currentStepLabel = this.jsonDef.name;
         }
         this.currentIndex = this.jsonDef.indexInParent;
      }
      // check if there is LastStep logic in set values
      if (this.jsonData.LastStep) {
         this.lastPage();
      }
      // check if there is PagesWOCancel logic in set values
      if (this.jsonData.PagesWOCancel) {
         this.hideCancelOnPage();
      }
      // check if there is PagesWONext logic in set values
      if (this.jsonData.PagesWONext) {
         this.hideNextOnPage();
      }
      // check if there is PagesWOPrevious logic in set values
      if (this.jsonData.PagesWOPrevious) {
         this.hidePreviousOnPage();
      }

      // check if there is PagesWOCancel logic in set values
      if (this.jsonData.PagesWOCancel) {
         this.hideCancelOnPage();
      }

      //define the first step that is shown
      let firstStepIndex;
      if (this.scriptHeaderDef.firstStepIndex === this.currentIndex) {
         firstStepIndex = this.scriptHeaderDef.firstStepIndex;
      }

      //hide previous button on the first active
      if (firstStepIndex === this.currentIndex) {
         this.showPreviousButton = false;
      } else {
         this.showPreviousButton = true;
      }

      //dynamically change Next button labels based on values in Set Values in OS
      //create a jsonData var to have it parsed correctly
      let jsonData = JSON.parse(JSON.stringify(this.jsonData));

      for (const key in jsonData.NextButtonLabels) {
         if (key == this.jsonDef.name) {
            //@sandeep - Added logic to invoke the CSS to hide the nav items
            if (jsonData.NextButtonLabels[key] == "Reset Password") {
               let staticResource = "../resource/MemberNavItems";
               let css = staticResource;
               loadStyle(this, css)
                  .then(() => {})
                  .catch(() => {});
            }
            //@sandeep - Logic ends
            this.nextButtonLabel = jsonData.NextButtonLabels[key];
         }
      }

      //dynamically change Cancel button labels based on values in Set Values in OS
      for (const key in jsonData.CancelButtonLabels) {
         if (key == this.jsonDef.name) {
            this.cancelButtonLabel = jsonData.CancelButtonLabels[key];
         }
      }

      //hide cancel buttons throughout whole OS
      if (jsonData.CancelButtons == "hide") {
         this.cancelButtons = false;
         this.pageWithoutCancel = true;
      }

      //Start Accessibility
      let jsonDataHeader = JSON.parse(JSON.stringify(this.scriptHeaderDef));

      if (jsonDataHeader.asName != undefined || jsonDataHeader.asName != null || jsonDataHeader.asName != "") {
         //Find Care
         if (jsonDataHeader.asName === "STEP_ChooseSpecialities") {
            this.previousButtonAriaLabel = "Previous will return you to Service Type Page";
         }
         if (jsonDataHeader.asName === "STEP_ChooseLocation") {
            this.previousButtonAriaLabel = "Previous will return you to Choose Specialties Page";
         }
         if (jsonDataHeader.asName === "STEP_SelectProviders") {
            this.previousButtonAriaLabel = "Previous will return you to Location and Distance Page";
         }
         if (jsonDataHeader.asName === "STEP_SelectProviders") {
            this.previousButtonAriaLabel = "Previous will return you to Location and Distance Page";
         }
         if (jsonDataHeader.asName === "STEP_ReviewProviderDetails") {
            this.previousButtonAriaLabel = "Previous will return you to Providers Page";
         }
         if (jsonDataHeader.asName === "STEP_ProviderLocationResults") {
            this.previousButtonAriaLabel = "Previous will return you to Providers Page";
         }
         if (jsonDataHeader.asName === "STEP_SelectEffectDateAndReason") {
            this.previousButtonAriaLabel = "Previous will return you to Providers Page";
         }
         if (jsonDataHeader.asName === "STEP_PCPReviewChanges") {
            this.previousButtonAriaLabel = "Previous will return you to Select Effective Date and Reason of Change Page";
         }
         if (jsonDataHeader.asName === "STEP_ChooseFacilityType") {
            this.previousButtonAriaLabel = "Previous will return you to Service Type Page";
         }
         if (jsonDataHeader.asName === "STEP_SelectFacility") {
            this.previousButtonAriaLabel = "Previous will return you to Location and Distance Page";
         }
         if (jsonDataHeader.asName === "STEP_ReviewFacilityDetails") {
            this.previousButtonAriaLabel = "Previous will return you to Facilities Page";
         }

         //Billing and Payment
         if (jsonDataHeader.asName === "STEP_SetAutoPayAndMakeAPayment") {
            this.previousButtonAriaLabel = "Previous will return you to Billing and Payments Page";
         }
         if (jsonDataHeader.asName === "STEP_AddCreditDebitCard") {
            this.previousButtonAriaLabel = "Previous will return you to Payment Page";
         }
         if (jsonDataHeader.asName === "STEP_AddBankInformation") {
            this.previousButtonAriaLabel = "Previous will return you to Payment Page";
         }
         if (jsonDataHeader.asName === "STEP_EditCreditDebitCard") {
            this.previousButtonAriaLabel = "Previous will return you to Payment Page";
         }
         if (jsonDataHeader.asName === "STEP_EditBankInformation") {
            this.previousButtonAriaLabel = "Previous will return you to Payment Page";
         }
         if (jsonDataHeader.asName === "STEP_ConfirmationPage") {
            this.previousButtonAriaLabel = "Previous will return you to Payment Page";
         }

         //My Profile - Member Information
         if (jsonDataHeader.asName === "StepMember_Information") {
            this.nextButtonAriaLabel = "Submit Member Information";
            this.cancelButtonAriaLabel = "Cancel and go back to My Profile Page";
         }
         if (jsonDataHeader.asName === "Unsuccessful") {
            //this.previousButtonAriaLabel = "Previous will return you to Member Information Page";
            this.previousButtonAriaLabel = "Previous button will take you to Connect With Care Management page";
         }
         if (jsonDataHeader.asName === "Confirmation") {
            //this.previousButtonAriaLabel = "Previous will return you to Member Information Page";
            this.previousButtonAriaLabel = "Previous button will take you to Connect With Care Management page";
         }

         //My Profile - Contact Information
         if (jsonDataHeader.asName === "TwoStepVerification") {
            this.nextButtonAriaLabel = "Next will take you to Update your Phone or Email Information Page";
            this.cancelButtonAriaLabel = "Cancel and go back to My Profile Page";
         }
         if (jsonDataHeader.asName === "UpdatePhoneInformation") {
            this.previousButtonAriaLabel = "Previous will return you to Update Contact Information Page";
            this.nextButtonAriaLabel = "Submit your Information";
            this.cancelButtonAriaLabel = "Cancel and go back to My Profile Page";
         }
         if (jsonDataHeader.asName === "UpdateContactInformation") {
            this.previousButtonAriaLabel = "Previous will return you to Update Contact Information Page";
            this.nextButtonAriaLabel = "Submit your Information";
         }
         if (jsonDataHeader.asName === "EmailVerification") {
            this.previousButtonAriaLabel = "Previous will return you to Update Contact Information Page";
            this.nextButtonAriaLabel = "Next will take you to Confirmation Page";
         }

         //Login Page
         if (jsonDataHeader.asName === "STEP_EnterUsername") {
            this.cancelButtonAriaLabel = "Cancel and go back to My Login Page";
         }

         //Connect with Care Management
         // if (jsonDataHeader.asName === "Confirmation" && jsonDataHeader.bpSubType === "ConnectWithCare") {
         //    this.previousButtonAriaLabel = "Previous will return you to the Connect with Care Management Page";
         // }
      } //end accessibility
   }
   callUpdatePrefIP() {
      //Call UpdatePrefDB IP
      /* let params = {
         sClassName: "omnistudio.IntegrationProcedureService",
         sMethodName: "Member_UpdateMemberPreferences",
         options: "{}",
         input: {
            methodName:
         }
     };
    
     this.omniRemoteCall(params, true).then((response) => {
         let data = response.result.IPResult;
         
     })*/
   }
}
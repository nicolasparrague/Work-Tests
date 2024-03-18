import { LightningElement, track, api } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import { getDataHandler } from "omnistudio/utility";

export default class HomeHealthRiskAssessment extends OmniscriptBaseMixin(LightningElement) {
   errorMessage ='Error --> No data returned from IP'
   @track
    _selectedMemberId;
    @api
    get selectedMemberId() {
       return this._selectedMemberId;
    }
    set selectedMemberId(val) {
       this._selectedMemberId = val;
       this.callActiveIP();  
    }
    @track
    _planId;
    @api
    get planId() {
       return this._planId;
    }
    set planId(val) {
       this._planId = val;
    }
    @track _brand;
    @api
    get brand() {
      return this._brand;
   }
    set brand(val) {
      this._brand = val;
   }
    @track _productGroup;

    @api
    get productGroup() {
       return this._productGroup;
    }
    set productGroup(val) {
       this._productGroup = val;
    }
    @track brandDemography;
    @track commercialDemography;
    @track showClaimEstimatorForm = false;
    @track claimEstimatorRedirect;
    isModalGlobal = false;
    isModalCostCalcComm = false;
    isModalCostCalcMed = false;
    isModalCostCalcOther = false;

    goToExternalSite() {
        this.isModalGlobal = true;        
    }

    connectedCallback(){
      this.buidURL();    
    }
    
    prevButton(evt) {
        if (evt) {
          this.omniPrevStep();
        }
    }

    navigateToCostCalculator() {
      this.isModalGlobal = true;
      if (this._productGroup == 'Commercial'){
         this.provider = 'Attentis Health';
         this.isModalCostCalcAttentisComm = true;
      }
      else if (this._productGroup == 'Medicare'){
         this.provider = 'Attentis Health';
         this.isModalCostCalcAttentisMed = true;
      }
      else{
         this.isModalCostCalcOther = true;
      }
   }

   truvenLoginWithToken() {
         window.location.href = "https://attentisconsulting.com/contact/";
          this.isModalGlobal = false;
   }

   callActiveIP(){
      let input = {
        memberId: this._selectedMemberId,
      };
  
      // Call Member_Demography IP
      this.callIP("Member_Demography", input).then((data) => {
        if(data.IPResult){
          let dataIP = data.IPResult.IPResult;      
          this.brandDemography = dataIP.brand;
          this.commercialDemography = dataIP.memberType;
          this.showClaimEstimatorForm = true;  
       }else{
          console.error(`${this.errorMessage} Member_Demography`)
       }
    }); 
  }


    callIP(ipMethod, inputMap) {
        this.loading = true;
        let datasourcedef = JSON.stringify({
           type: "integrationprocedure",
           value: {
              ipMethod: ipMethod,
              inputMap: inputMap,
              optionsMap: "",
           },
        });
    
        return getDataHandler(datasourcedef)
           .then((data) => {
              this.loading = false;
              return JSON.parse(data);
           })
           .catch((error) => {
              console.error(`failed at getting IP data => ${JSON.stringify(error)}`);
              this.loading = false;
           });
    }


    buidURL() {
        //Build URL for Claim Estimate Form
        let type = "";
        let protocol = "";
        const urlString = window.location.href;
        const hostUrl = window.location.host;
    
        let urlArray = urlString.split("/");
    
        for (let index = 0; index < urlArray.length; index++) {
           let element = urlArray[index];
           if (element == "memberportal") {
              type = element;
           }
           if (element == "https:") {
              protocol = element;
           }
           if (element == "http:") {
              protocol = element;
           }
        }
        this.claimEstimatorRedirect = `${protocol}//${hostUrl}/${type}/s/health-risk-assessment`;
    }

    navigateToClaimEstimatorForm() {
        var claimEstimatorPage = this.claimEstimatorRedirect;
        if (claimEstimatorPage) {
            window.open(claimEstimatorPage, "_blank");
        }    
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

            window.addEventListener('keyup', function(event) {
               if(event.key === "Escape"){
                  me.closeModal();
               }
            });
      }
   }

   closeModal() {
      // to close modal set isModalGlobal track value as false
      this.isModalGlobal = false;
  }
}
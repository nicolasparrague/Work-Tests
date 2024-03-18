import { LightningElement, track } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";

export default class MemberFacilityType extends OmniscriptBaseMixin(LightningElement) {
   @track facilities = [];
   displayOnCheck = false;
   selectedRadio;
   radioButtons = false;
   errorMessage ='Error --> No data returned from IP';

   @track specialtyParams = {
      input: {},
      sClassName: "omnistudio.IntegrationProcedureService",
      sMethodName: "Member_Speciealities",
      options: "{}",
   };
   jsonData = null;
   readOnly = false;
   defaultFacility = "";
   defaultFacilityCode = "";
   loading = true;
   numOfRetry = 0;
   maxOfRetry = 2;
   urgentCareArrayValue;

   radioHandler(event) {      
      this.selectedRadio = event.target.value;
      if (this.selectedRadio == "Facility") {
         this.displayOnCheck = true;
         //Initiate default Facility when user clicks the radio
         this.defaultFacility = "";
         this.defaultFacilityCode = "";
      } else if(this.selectedRadio == "Hospital") {
         this.displayOnCheck = false;
         this.updateDataJson("Hospital", "Hospital");
         this.defaultFacility = "Hospital";
         this.defaultFacilityCode = "Hospital";
      } else if (this.selectedRadio == "UrgentCare") {
         this.displayOnCheck = false;
         this.updateDataJson(this.urgentCareArrayValue,'Urgent Care Center');
         this.defaultFacility = this.urgentCareArrayValue;
         this.defaultFacilityCode = 'Urgent Care Center';
      }
   }

   connectedCallback() {
      this.radioButtons = true;
      this.jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      if(this.jsonData.goToFacility == "Yes" && this.jsonData.facilityExecution == "Yes"){
         this.omniNextStep();
      }
      if (this.jsonData) {
         let planType = this.jsonData.SelectedPlanInfo.brand;
         let category = this.jsonData.SelectedPlanInfo.productCategory;
         let serviceType = this.jsonData.STEP_ChooseServiceType.radioServiceType;

         //Reset readOnly
         this.readOnly = false;
         let inputParam = { serviceType: serviceType, category: category, planType: planType };
         this.specialtyParams.input = inputParam;
         this.getSpecialties();

         // Setting Default Speciality
         if (Object.prototype.hasOwnProperty.call(this.jsonData, "selectedFacilityType") && this.jsonData.selectedFacilityType!='') {
            this.defaultFacility = this.jsonData.selectedFacilityType;
            this.defaultFacilityCode = this.jsonData.selectedFacilityTypeCode;
         }
         else {         
            this.updateDataJson("Hospital", "Hospital");
            this.defaultFacility = "Hospital";
            this.defaultFacilityCode = "Hospital";
         }

         //Setting Default Speciality for Lab
         if (serviceType === "lab") {
            this.radioButtons = false;
            this.displayOnCheck = true;
            this.updateDataJson("Laboratory Medicine","Laboratory Medicine");
            this.defaultFacility = "Laboratory Medicine";
            this.defaultFacilityCode = "Laboratory Medicine";
            this.readOnly = true;
         }
      }
   } // end callback

   markCheckbox(){
      this.template.querySelector(".hospital-radio").checked = false;
               this.template.querySelector(".urgentcare-radio").checked = true;
               this.template.querySelector(".facility-radio").checked = false;   
   }
   renderedCallback() {
      if(this.defaultFacility == "Laboratory Medicine"){
         this.radioButtons = false;
         this.displayOnCheck = true;
      }
      else if (this.defaultFacility == "Hospital") {
         this.displayOnCheck = false;
         this.template.querySelector(".hospital-radio").checked = true;
      } else if (this.defaultFacility == this.urgentCareArrayValue) {
         this.displayOnCheck = false;
         this.template.querySelector(".urgentcare-radio").checked = true;
      } else if (this.defaultFacility != null && this.defaultFacility != "") {
         this.displayOnCheck = true;
         this.template.querySelector(".facility-radio").checked = true;
      }
   }
   
   updateDataJson(selectedFacility, selectedFacilityCode) {
      var selectedData = { selectedFacilityType: selectedFacility, selectedFacilityTypeCode: selectedFacilityCode };
      this.omniApplyCallResp(selectedData);
   }


   getSpecialties() {
      return this.omniRemoteCall(this.specialtyParams, true)
         .then((response) => {
            if(response.result.IPResult){
               if (Object.prototype.hasOwnProperty.call(response.result.IPResult, "success") && response.result.IPResult.success === false) {
                  if (this.numOfRetry < this.maxOfRetry) {
                     this.numOfRetry++;
                     this.getSpecialties();
                  } else {
                     this.loading = false;
                  }
               } else {
                  //Callout was successful
                  let spArray = response.result.IPResult;
                  spArray.forEach((sp) => {
                     sp.key = sp.code;
                     sp.value = sp.description;
                  });
                  let urgentCareArray = spArray.filter(element => { 
                     if(element.value.includes("Urgent Care")){
                        return element.value;
                     }});
                  if(urgentCareArray.length>0){
                  this.urgentCareArrayValue = urgentCareArray[0].value;
                  }
                  else {
                     this.urgentCareArrayValue = "Urgent Care Center";
                  }
                  this.facilities = spArray;
                  this.sortingArray();
                  this.loading = false;
               }
            }else{
               console.error(`${this.errorMessage} Member_Speciealities`)
            }
         })
         .catch((error) => {
            console.error("Error with Member_Speciealities", error);
            this.loading = false;
         });
   }

   sortingArray() {
      // Sort by code
      this.facilities.sort(function (a, b) {
         var codeA = a.description.toUpperCase();
         var codeB = b.description.toUpperCase();
         if (codeA < codeB) {
            return -1;
         }
         if (codeA > codeB) {
            return 1;
         }
         // code must be equal
         return 0;
      });
   }
}
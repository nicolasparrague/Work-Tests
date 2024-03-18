import { LightningElement } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
export default class MemberValidateLocation extends OmniscriptBaseMixin(LightningElement) {
   zipCode;
   connectedCallback() {
      let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      //Coming from FindCare Quick Action (Homepage)
      if (jsonData.goToFindCare == true || jsonData.goToFindCare == "true" || jsonData.goToFindCare == "true") {
         let goToFindCareFlag = { goToFindCare: false };
         this.omniApplyCallResp(goToFindCareFlag);
         this.omniNextStep();
      }
      if (jsonData.goToFacility == "Yes" && jsonData.facilityExecution == "Yes") {
         this.omniNextStep();
      }
      //Accessibility
      if(jsonData.selectedFacilityType == ""){
         this.messageNextButton = "Next will take you to Provider Search Results Page";
      }
      else{
         this.messageNextButton = "Next will take you to Facility Search Results Page";
      }
   }

   validateLocation() {
      let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      this.zipCode = jsonData.STEP_ChooseLocation.TXT_ZipCode;
      if (this.zipCode && this.validateZipCode(this.zipCode)) {
         // It will move to the next step if zipcode is validated
         this.updateDataJson(true);
         this.omniNextStep();
      } else {
         // It will validate and show error message in the UI.
         this.updateDataJson(false);
      }
   }
   updateDataJson(flag) {
      let zipValid = { isZipcodeValid: flag };
      this.omniApplyCallResp(zipValid);
   }

   validateZipCode(zipcode) {
      var zipCodePattern = /^\d{5}$/;
      return zipCodePattern.test(zipcode);
   }
}
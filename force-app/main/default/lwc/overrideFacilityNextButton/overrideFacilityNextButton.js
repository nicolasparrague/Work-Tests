import { LightningElement } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";

export default class OverrideFacilityNextButton extends OmniscriptBaseMixin(LightningElement) {
   facility;
   validateLocation() {
      let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      this.facility = jsonData.selectedFacilityType;
      if (this.facility == "" || this.facility == null || this.facility == undefined) {
         // It will move to the next step if facility is validated
         this.updateDataJson(false);
      } else {
         // It will validate and show error message in the UI.
         this.updateDataJson(true);
         this.omniNextStep();
      }
   }

   updateDataJson(flag) {
      let facilityValid = { isFacilityValid: flag};
      this.omniApplyCallResp(facilityValid);
   }
}
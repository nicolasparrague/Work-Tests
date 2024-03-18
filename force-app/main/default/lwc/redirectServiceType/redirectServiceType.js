import { LightningElement, track, api } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
export default class RedirectServiceType extends OmniscriptBaseMixin(LightningElement) {
    /**flag to launch the modal**/
   isModalGlobal = false;
   isModalAcupuncture = false;
   isModalMentalHealth = false;  
    redirectDoctor(){
        let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
        if(jsonData.STEP_ChooseServiceType.radioServiceType == "Doctor"){
            if(jsonData.selectedSpeciality == "View All Specialties" || (jsonData.selectedSpeciality != "Mental Health and Substance Abuse" && jsonData.selectedSpeciality != "Acupuncture")){
                this.omniNextStep();
            }else{
                if(jsonData.selectedSpeciality == "Mental Health and Substance Abuse"){
                    this.isModalGlobal = true;
                    this.isModalMentalHealth = true;
                }
                else if(jsonData.selectedSpeciality == "Acupuncture"){
                    this.isModalGlobal = true;
                    this.isModalAcupuncture = true;
                }
            }
        }else{
            this.omniNextStep();
        }
    }

    goToExternalSite() {
        // go to External site when isModalGlobal track value is true
        this.isModalGlobal = false;
        this.isModalAcupuncture = false;
        this.isModalMentalHealth = false;  
    }

    closeModal() {
        // to close modal set isModalGlobal track value as false
        this.isModalGlobal = false;
        this.isModalAcupuncture = false;
        this.isModalMentalHealth = false;
    }
    
    prevButton(evt) {
        if (evt) {
          this.omniPrevStep();
        }
    }

    navigateToAcupunctureWebPage() {
        let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
        var acupunctureWebPage = jsonData.SelectedPlanInfo.Acupuncture;
  
        if (acupunctureWebPage) {
           window.open(acupunctureWebPage, "_blank");
           this.closeModal();
        }
     }

     navigateToMentalHealthWebPage() {
        let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
        var mentalHealthWebPage = jsonData.SelectedPlanInfo.MentalHealthSubstanceAbuse;
  
        if (mentalHealthWebPage) {
           window.open(mentalHealthWebPage, "_blank");
           this.closeModal();
        }
     }
}
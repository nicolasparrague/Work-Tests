import { LightningElement, track } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
export default class MemberSpecialityCombo extends OmniscriptBaseMixin(LightningElement) {
   @track specialties = [];

   @track specialtyParams = {
      input: {},
      sClassName: "omnistudio.IntegrationProcedureService",
      sMethodName: "Member_Speciealities",
      options: "{}",
   };
   errorMessage = "Error --> No data returned from IP";
   defaultSpecialty = "All Specialties";
   defaultSpecialtyCode = "All Specialties";
   allValue = "All Specialties";
   readOnly = false;
   loading = true;
   numOfRetry = 0;
   maxOfRetry = 2;
   isPublic = false;
   portalType;

   connectedCallback() {
      let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      let planType = jsonData.SelectedPlanInfo.brand;
      let category = jsonData.SelectedPlanInfo.productCategory;
      let serviceType = jsonData.STEP_ChooseServiceType.radioServiceType;

      //Coming from FindCare Quick Action (Homepage)
      if (jsonData.goToFindCare == true) {
         serviceType = jsonData.serviceType;
         this.omniNextStep();
      }

      //For Dental
      if (serviceType === "Dental") {
         category = "Dental";
      }

      //Reset readOnly
      this.readOnly = false;

      //Set Input for the Member_Speciealities IP
      this.isPublic = jsonData.isPublic;
      if (this.isPublic) {
         //Handling Public Search
         let lobMctrType = jsonData.lobMctrType;
         planType = this.portalType;

         let coverageType = jsonData.coverageType;
         switch (coverageType) {
            case "M":
               category = "Medical";
               break;
            case "D":
               category = "Dental";
               break;
            case "V":
               category = "Vision";
               break;
            case "R":
               category = "Pharmacy";
               break;
            default:
               category = "Medical";
         }
      }

      let inputParam = { serviceType: serviceType, category: category, planType: planType };
      this.specialtyParams.input = inputParam;
      this.getSpecialties();

      //Setting Default Speciality
      if (Object.prototype.hasOwnProperty.call(jsonData, "selectedSpeciality")) {
         if (jsonData.selectedSpeciality == "All Specialties") {
            this.defaultSpecialty = jsonData.selectedSpeciality;
            this.defaultSpecialtyCode = jsonData.selectedSpecialityCode;
         } else {
            this.defaultSpecialty = jsonData.selectedSpecialityCode;
            this.defaultSpecialtyCode = jsonData.selectedSpecialityCode;
         }
      }

      //Setting Default Speciality for Chiropractor
      if (serviceType === "Chiropractor") {
         this.defaultSpecialty = "Chiropractic Medicine";
         this.allValue = "Chiropractic Medicine";
         this.readOnly = true;
      }

      if (serviceType === "PCP") {
         this.defaultSpecialty = "All PCP Specialties";
         this.allValue = "All PCP Specialties";
         this.defaultSpecialtyCode = "All PCP Specialties";
         this.readOnly = false;
      }

      if (serviceType === "Vision") {
         this.defaultSpecialty = "Optometry";
         this.allValue = "Optometry";
         this.defaultSpecialtyCode = "Optometry";
         this.readOnly = true;
      }
      
      if (jsonData.selectedSpecialityCode) {
         this.defaultSpecialty = jsonData.selectedSpecialityCode;
         this.defaultSpecialtyCode = jsonData.selectedSpecialityCode;
      }
   }

   getSpecialties() {
      return this.omniRemoteCall(this.specialtyParams, true)
         .then((response) => {
            if (response.result.IPResult) {
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
                     sp.value = sp.code;
                  });
                  this.specialties = spArray;
                  //this.sortingArray();
                  this.loading = false;
               }
            } else {
               console.error(`${this.errorMessage} Member_Speciealities`);
            }
         })
         .catch((error) => {
            console.error("error", error);
            //error handling
            this.loading = false;
         });
   }

   sortingArray() {
      // Sort by code
      this.specialties.sort(function (a, b) {
         var codeA = a.code.toUpperCase();
         var codeB = b.code.toUpperCase();
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
import { LightningElement, track, api } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
export default class ProviderDetailsLWC extends OmniscriptBaseMixin(LightningElement) {
   @track activeList = [];
   @track docFinal;
   @track proEffDate;
   activeSectionName = "ProviderInformation";
   activeSectionNameLocationInfo = "LocationInformation";
   sectionOpen = true;
   @track providerDetails = [];
   @track newArray = [];
   errorMessage ='Error --> No data returned from IP'
   loading = true;
   tenantId;
   memberInfo;
   ServiceTypeInfo;
   pcpInfo = [];
   // BronxDocs and ACPNY Icons
   bronxModal = false;
   redirectMessage;
   allowACPNYRedirect = false;
   allowBronxDocsRedirect = false;
   bronxCompanyName;
   // Variables - Provider Information
   ProviderId = "";
   providerTitle = "";
   providerName = "";
   provId = "";
   providerGender = "";
   providerSpeciality = "";
   providerSpecialties = [];
   providerEducation = "";
   providerLanguage = "";
   providerLanguages = [];
   providerNetworkStatus = "";
   providerPPCP = "";
   providerBoardCert = [];
   providerACPNY = "";
   providerVirtualCare = "";
   provBoardPlusSpec = "";
   providerCOE = "";
   providerAcceptsMedicaid = "";
   providerMedicaidshowhide = false;
   locationCOEshowhide = "";
   iconACPNY = false;
   iconPreferred = false;
   iconCOE = false;
   // Variables - Location Information
   locationAdd = "";
   locationAdd1 = "";
   locationAdd2 = "";
   locationCity = "";
   locationState = "";
   locationZipFormatted = "";
   locationPhone = "";
   locationPhoneFormatted = "";
   locationHours = "";
   locationPlanAccepted = "";
   locationWheelchairAcc = "";
   locationAcceptingNewPatients = "";
   locationAcceptingNewPatientsMob = "";
   locationNotAcceptingNewPatientsMob = "";
   locationCenterOfExcellence = "";
   locationHomelessShelter = "";
   locationHomelessshowhide = false;
   locationMultipleOfficeLink = "";
   isPublic = false;
   @track hospitals = [];
   @track networks = [];
   @track plans = [];
   @track networkCode;
   @track providerisPreferred =false;
   @track providermodalAttentisMessage;
   @track showNotPreferredmodalMessage =false;
   @track isNoPreferredPCPModalOpen = false;
   @track showAttentisNotPreferredmodalMessage = false;
   // Variable for hours
   @track officeHrs = [];
   officeHrsAvailable = "";
   mondayClosed = true;
   mondayFrom = 0;
   mondayTo = "";
   tuesdayClosed = true;
   tuesdayFrom = 0;
   tuesdayTo = "";
   wednesdayClosed = true;
   wednesdayFrom = 0;
   wednesdayTo = "";
   thursdayClosed = true;
   thursdayFrom = 0;
   thursdayTo = "";
   fridayClosed = true;
   fridayFrom = 0;
   fridayTo = "";
   saturdayClosed = true;
   saturdayFrom = 0;
   saturdayTo = "";
   sundayClosed = true;
   sundayFrom = 0;
   sundayTo = "";
   noHours = "";
   specialties = [];
   value = "";
   key = "NA";
   netAccCount = 0;
   planAcCount = 0;
   chooseAsPCPLink = false;
   directionsUrl = "";

   connectedCallback() {
      // Get Json Data
      let jsonDataPD = JSON.parse(JSON.stringify(this.omniJsonData));
      if(jsonDataPD.isPublic != undefined && jsonDataPD.isPublic) {
         this.isPublic = true;
      } else {
         this.isPublic = false;
      }
      this.pcpInfo = jsonDataPD.PCPInfo;
      this.memberInfo = jsonDataPD.MemberInfo;
      this.ServiceTypeInfo = jsonDataPD.ServiceTypeInfo;
      let providerId = jsonDataPD.providerId;
      this.tenantId = jsonDataPD.tenantId;
      this.ProviderId = jsonDataPD.providerId;
      this.networkCode = jsonDataPD.SelectedPlanInfo.networkCode;
      this.bronxCompanyName = 'my AttentisHealth';
      this.SelectedPlanInfo = jsonDataPD.SelectedPlanInfo;

      //iconBronxDocs
      if(jsonDataPD.isBronx != null){
         if(jsonDataPD.isBronx == true){
            this.iconBronxDocs = true;
         }else{
            this.iconBronxDocs = false;
         }
      }

      //FHN
      if(jsonDataPD.isFHN != null){
         if(jsonDataPD.isFHN == true){
            this.labelFHN = true;
         }else{
            this.labelFHN = false;
         }
      }

      this.providerTitle = jsonDataPD.degree;
      // Set Input parameter for the ProviderDetails IP
      let inputParam = { providerId: providerId, tenantId: this.tenantId, networkId: jsonDataPD.SelectedPlanInfo.networkId, planType: jsonDataPD.SelectedPlanInfo.brand };
      const params = {
         input: inputParam,
         sClassName: "omnistudio.IntegrationProcedureService",
         sMethodName: "Member_providerDetails",
         options: "{}",
      };

      //Call out the Member_ProviderDetails IP
      this.omniRemoteCall(params, true)
         .then((response) => {
            if(response.result.IPResult){
            let providerDetailsArray = response.result.IPResult;
            this.providerDetails = providerDetailsArray;
            this.directionsUrl = this.getEncodedAddr(this.providerDetails);
            //Set data for provider information block
            this.providerName = this.providerDetails.reviewProviderDetails.providerInformation.FullName;
            this.provId = jsonDataPD.providerId;
            this.providerGender = this.providerDetails.reviewProviderDetails.providerInformation.gender;
            this.providerCOE = this.providerDetails.reviewProviderDetails.providerInformation.isCOE;
            this.providerAcceptsMedicaid = this.providerDetails.reviewProviderDetails.providerInformation.medicaidIndicator;
            this.locationHomelessShelter = this.providerDetails.reviewProviderDetails.providerInformation.homelessIndicator;

            if (Array.isArray(this.providerDetails.reviewProviderDetails.providerSpecialties)) {
               for (var p = 0; p < this.providerDetails.reviewProviderDetails.providerSpecialties.length; p++) {
                  this.providerSpecialties.push(this.providerDetails.reviewProviderDetails.providerSpecialties[p].specialty);
               }
               this.providerSpecialties = this.providerSpecialties.toString();
               this.providerSpecialties = this.providerSpecialties.replace(/,/g, ", ");
            } else {
               let newObj = this.providerDetails.reviewProviderDetails.providerSpecialties;
               this.providerSpecialties = newObj ? newObj.specialty : "";
            }

            //AFIRE-35 Reflect selected provider information override
            this.providerName = jsonDataPD.provDetailsInfo.providerFullName;
            this.provId = jsonDataPD.provDetailsInfo.ProviderId;
            this.providerGender = jsonDataPD.provDetailsInfo.Gender;
            this.providerCOE = jsonDataPD.provDetailsInfo.isCOE;
            this.providerSpecialties = jsonDataPD.provDetailsInfo.Speciality;
            this.providerNetworkStatus = jsonDataPD.provDetailsInfo.NetworkStatus;

            // Logic for Education Field
            if (this.providerDetails.reviewProviderDetails.providerEducation.education.length > 1) {
               this.sortingEduDate();
            }
            let medSchool = 0;
            if (Array.isArray(this.providerDetails.reviewProviderDetails.providerEducation.education)) {
               for (var e = 0; e < this.providerDetails.reviewProviderDetails.providerEducation.education.length; e++) {
                  if (medSchool != 1) {
                     if (
                        this.providerDetails.reviewProviderDetails.providerEducation.education[e].trainingCategoryDesc === "Education" &&
                        this.providerDetails.reviewProviderDetails.providerEducation.education[e].medSchool !== null &&
                        this.providerDetails.reviewProviderDetails.providerEducation.education[e].medSchool !== "Not Available" &&
                        this.providerDetails.reviewProviderDetails.providerEducation.education[e].medSchool !== "N/A"
                     ) {
                        this.providerEducation = this.providerDetails.reviewProviderDetails.providerEducation.education[e].medSchool;
                        medSchool = 1;
                     }
                  }
               }
               if (this.providerEducation == "" || this.providerEducation == null || this.providerEducation == "N/A" || this.providerEducation == "n/a" || this.providerEducation == "Not Available") {
                  this.providerEducation = "No information available";
               }
            } else {
               this.providerEducation = "No information available";
            }

            if (
               this.providerDetails.reviewProviderDetails.providerInformation.languagesSpoken == "N" ||
               this.providerDetails.reviewProviderDetails.providerInformation.languagesSpoken == null ||
               this.providerDetails.reviewProviderDetails.providerInformation.languagesSpoken == undefined
            ) {
               this.providerLanguages = "No Information - Please Contact Provider Office";
            } else {
               if (Array.isArray(this.providerDetails.reviewProviderDetails.providerInformation.languagesSpoken)) {
                  for (var l = 0; l < this.providerDetails.reviewProviderDetails.providerInformation.languagesSpoken.length; l++) {
                     this.providerLanguages.push(this.providerDetails.reviewProviderDetails.providerInformation.languagesSpoken[l]);
                  }
                  this.providerLanguages = this.providerLanguages.toString();
                  this.providerLanguages = this.providerLanguages.replace(/,/g, ", ");
               } else {
                  this.providerLanguages = "No Information - Please Contact Provider Office";
               }
            }

               if (this.providerDetails.reviewProviderDetails.providerInformation.leavingNetwork == "No") {
                  
                  let proParam = {
                     lastName: this.omniJsonData.providerParams.input.lastName,
                     tenantId: this.omniJsonData.providerParams.input.tenantId,
                     planId: this.omniJsonData.providerParams.input.planId,
                     planType: this.omniJsonData.providerParams.input.planType,
                     firstName: this.omniJsonData.providerParams.input.firstName,
                     ServiceType: this.omniJsonData.providerParams.input.ServiceType,
                     networkId: this.omniJsonData.SelectedPlanInfo.networkId,                  
                     distance: this.omniJsonData.providerParams.input.distance,
                     zipCode: this.omniJsonData.providerParams.input.zipCode,
                     providerSpeciality: this.omniJsonData.providerParams.input.providerSpeciality,
                     from: this.omniJsonData.providerParams.input.from,
                     size: this.omniJsonData.providerParams.input.size,
                     fhn:this.omniJsonData.providerParams.input.fhn,
                     networkCode: this.omniJsonData.providerParams.input.networkCode,
                     providerFullName: this.omniJsonData.providerParams.input.providerFullName
                  }
               
                     const params = {
                        input: proParam,
                        sClassName: "omnistudio.IntegrationProcedureService",
                        sMethodName: "Member_findDoctor",
                        options: "{}",
                     };
                     this.omniRemoteCall(params, true)
                        .then((response) => {
                        if (response.result.IPResult) {
                           let findDrProvList = response.result.IPResult.providerList;
                           findDrProvList.forEach((doc)=> {
                                 if(doc.ProviderId == this.omniJsonData.providerId){
                                    this.docFinal = doc;
                                    let docProvId = doc.ProviderId;
                                    this.proEffDate = new Date ( doc.NetworkEffectiveDate);                                    
                                 }                                
                           });
                           
                           let today = new Date();
                           let months3later = new Date(today.setMonth(today.getMonth() + 3));
                           if (this.proEffDate.getTime() > today.getTime() && this.proEffDate.getTime() <= months3later.getTime()) {

                               this.providerNetworkStatus = "Joining on" + " " + this.docFinal.NetworkEffectiveDate;
                           }
                           else{
                              this.providerNetworkStatus = "Active";

                           }                           
                           return response;
                        } else {
                           console.error(`${this.errorMessage} Member_findDoctor`);
                           this.loading = false;
                        }}).catch((error) => {
                           console.error("error", error);
                           this.loading = false;
                        });
                     }            
            else {
               this.providerNetworkStatus = "Leaving on" + " " + this.providerDetails.reviewProviderDetails.providerInformation.leavingNetwork;
            }
            if (this.providerDetails.reviewProviderDetails.providerInformation.preferred === "Y" || this.providerDetails.reviewProviderDetails.providerInformation.preferred === "Yes") {
               this.providerPPCP = "Yes";
               this.iconPreferred = true;
            } else {
               this.providerPPCP = "No";
               this.iconPreferred = false;
            }

            // preferred
            if (this.providerDetails.reviewProviderDetails.providerInformation.preferred === "No" || this.providerDetails.reviewProviderDetails.providerInformation.preferred === "N") {
               this.providerisPreferred = false;
               if (this.networkCode == "2T02" || this.networkCode == "2T03") {
                  this.showNotPreferredmodalMessage = true;
                  this.showAttentisNotPreferredmodalMessage = true;
                  this.providermodalAttentisMessage = "Did you know that if you choose a Preferred Provider, rather than any other PCP in the network, you’ll have lower copays for most professional services?";
               }
            } else {
               this.showNotPreferredmodalMessage = false;
               this.providerisPreferred = true;
            }

            //Accept Medicaid
            if (
               this.providerDetails.reviewProviderDetails.providerInformation.medicaidIndicator === "Y" ||
               this.providerDetails.reviewProviderDetails.providerInformation.medicaidIndicator === "Yes"
            ) {
               this.providerAcceptsMedicaid = "Yes";
            } else {
               this.providerAcceptsMedicaid = "No";
            }
            //Homeless Shelter
            if (
               this.providerDetails.reviewProviderDetails.providerInformation.homelessIndicator === "Y" ||
               this.providerDetails.reviewProviderDetails.providerInformation.homelessIndicator === "Yes"
            ) {
               this.locationHomelessShelter = "Yes";
            } else {
               this.locationHomelessShelter = "No";
            }

            let providerInfo = this.providerDetails.reviewProviderDetails.providerInformation;
            // Show or Hide Choose as PCP Link
            if (Object.prototype.hasOwnProperty.call(jsonDataPD, "PCPLink")) {
               if (Object.prototype.hasOwnProperty.call(jsonDataPD.PCPLink, "EnableFlag")) {
                  if (jsonDataPD.PCPLink.EnableFlag === "suppressed") {
                     // Hide Choose as PCP for all providers
                     this.chooseAsPCPLink = false;
                  } else if (jsonDataPD.PCPLink.EnableFlag != "suppressed") {
                     if ((providerInfo.isPCP == "Yes" || providerInfo.isPCP == "Y") && (providerInfo.leavingNetwork == "N" || providerInfo.leavingNetwork == "No")) {
                        // Show Choose as PCP for particular provider
                        this.chooseAsPCPLink = true;
                     } else {
                        // Hide Choose as PCP for particular provider
                        this.chooseAsPCPLink = false;
                     }
                  }
               }
            } else {
               this.chooseAsPCPLink = false;
            }

            if (this.providerCOE == "Yes") {
               this.iconCOE = true;
            } else {
               this.iconCOE = false;
            }

            if (this.providerAcceptsMedicaid == "Yes") {
               this.providerMedicaidshowhide = true;
            } else {
               this.providerMedicaidshowhide = false;
            }
            if (this.locationHomelessShelter == "Yes") {
               this.locationHomelessshowhide = true;
            } else {
               this.locationHomelessshowhide = false;
            }

            // Logic for Board Certification
            if (this.providerDetails.reviewProviderDetails.providerSpecialties != null || this.providerDetails.reviewProviderDetails.providerSpecialties != undefined) {
               if (Array.isArray(this.providerDetails.reviewProviderDetails.providerSpecialties)) {
                  for (var k = 0; k < this.providerDetails.reviewProviderDetails.providerSpecialties.length; k++) {
                     if (this.providerDetails.reviewProviderDetails.providerSpecialties[k].boardCertifications == "Yes") {
                        this.providerBoardCert.push(this.providerDetails.reviewProviderDetails.providerSpecialties[k].specialty);
                     }
                  }
                  this.providerBoardCert = this.providerBoardCert.toString();
                  this.providerBoardCert = this.providerBoardCert.replace(/,/g, ", ");
               } else {
                  let boardCertObj = this.providerDetails.reviewProviderDetails.providerSpecialties;
                  if (
                     this.providerDetails.reviewProviderDetails.providerSpecialties.boardCertifications != undefined ||
                     this.providerDetails.reviewProviderDetails.providerSpecialties.boardCertifications != null
                  ) {
                     if (this.providerDetails.reviewProviderDetails.providerSpecialties.boardCertifications === "Yes") {
                        this.providerBoardCert = boardCertObj.specialty;
                     } else {
                        this.providerBoardCert = "No information available";
                     }
                  } else {
                     this.providerBoardCert = "No information available";
                  }
               }
            } else {
               this.providerBoardCert = "No information available";
            }
            if (this.providerDetails.reviewProviderDetails.providerInformation.ACPNY == "N" || this.providerDetails.reviewProviderDetails.providerInformation.ACPNY == "") {
               this.providerACPNY = "No";
               this.iconACPNY = false;
            } else if (this.providerDetails.reviewProviderDetails.providerInformation.ACPNY == "Y") {
               this.providerACPNY = "Yes";
               this.iconACPNY = true;
            }

            let virtualCareProvider = this.SelectedPlanInfo.virtualCareProvider;
            if (virtualCareProvider) {
               this.providerVirtualCare = "Yes";
            } else {
            this.providerVirtualCare = "No";
            }

            // Change phone format
            if (this.providerDetails.reviewProviderDetails.LocationInformation[0].Phone != undefined || this.providerDetails.reviewProviderDetails.LocationInformation[0].Phone != null) {
               this.locationPhoneFormatted =
                  this.providerDetails.reviewProviderDetails.LocationInformation[0].Phone.substring(0, 3) +
                  "-" +
                  this.providerDetails.reviewProviderDetails.LocationInformation[0].Phone.substring(3, 6) +
                  "-" +
                  this.providerDetails.reviewProviderDetails.LocationInformation[0].Phone.substring(6, 10);
            }
            // Change zip code format
            this.locationZipFormatted = this.providerDetails.reviewProviderDetails.LocationInformation[0].zip.substring(0, 5);
            // Set data for provider information block
            let address2;
            if (this.providerDetails.reviewProviderDetails.LocationInformation[0].addressLine2 != null && this.providerDetails.reviewProviderDetails.LocationInformation[0].addressLine2 != undefined) {
               address2 = this.providerDetails.reviewProviderDetails.LocationInformation[0].addressLine2 + ", ";
            } else {
               address2 = "";
            }

            this.locationAdd =
               this.providerDetails.reviewProviderDetails.LocationInformation[0].addressline1 +
               ", " +
               address2 +
               this.providerDetails.reviewProviderDetails.LocationInformation[0].city +
               " " +
               this.providerDetails.reviewProviderDetails.LocationInformation[0].state +
               " " +
               this.locationZipFormatted;
            this.locationAdd1 = this.providerDetails.reviewProviderDetails.LocationInformation[0].addressline1;
            this.locationAdd2 = this.providerDetails.reviewProviderDetails.LocationInformation[0].addressLine2;
            this.locationCity = this.providerDetails.reviewProviderDetails.LocationInformation[0].city;
            this.locationState = this.providerDetails.reviewProviderDetails.LocationInformation[0].state;

            this.locationPhone = this.locationPhoneFormatted;
            this.locationHours = "";
            this.locationPlanAccepted = jsonDataPD.SelectedPlanInfo.planName;

            if (this.providerDetails.reviewProviderDetails.LocationInformation[0].wheelchairAccessible == "N") {
               this.locationWheelchairAcc = "No";
            } else if (this.providerDetails.reviewProviderDetails.LocationInformation[0].wheelchairAccessible == "Y") {
               this.locationWheelchairAcc = "Yes";
            }

            this.locationAcceptingNewPatients = jsonDataPD.acceptNewPa;
            // Handle mobile - accepting new patients
            if (jsonDataPD.acceptNewPa == "Yes") {
               this.locationAcceptingNewPatientsMob = true;
            } else {
               this.locationAcceptingNewPatientsMob = false;
            }
            // Handle mobile - not accepting new patients
            if (jsonDataPD.acceptNewPa == "No") {
               this.locationNotAcceptingNewPatientsMob = true;
            } else {
               this.locationNotAcceptingNewPatientsMob = false;
            }

            this.locationCenterOfExcellence = this.providerDetails.reviewProviderDetails.providerInformation.isCOE;
            this.locationCOEshowhide = null;
            // Show or Hide The Multiple Offices link

            if (this.providerDetails.reviewProviderDetails.providerInformation.multiLocation == "Yes" || this.providerDetails.reviewProviderDetails.providerInformation.multiLocation == "Y") {
               this.locationMultipleOfficeLink = true;
            } else {
               this.locationMultipleOfficeLink = false;
            }
            //show hide COE
            if (this.locationCenterOfExcellence == "Yes") {
               this.locationCOEshowhide = true;
            } else {
               this.locationCOEshowhide = false;
            }

            // Logic for Office Hours
            let firstMonday = true;
            let firstTuesday = true;
            let firstWed = true;
            let firstThurs = true;
            let firstFri = true;
            let firstSat = true;
            let firstSun = true;
            if (Array.isArray(this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours)) {
               if (this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours.length >= 7) {
                  this.noHours = false;
                  this.officeHrsAvailable = true;
                  for (var d = 0; d < this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours.length; d++) {
                     if (
                        this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeDays == "MONDAY" &&
                        this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeFromHours != null
                     ) {
                        this.mondayClosed = false;
                        let fromH = this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeFromHours;
                        let toH = this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeToHours;
                        if (firstMonday) {
                           this.mondayFrom = fromH;
                           this.mondayTo = toH;
                           firstMonday = false;
                        } else {
                           if (this.timeConversionSlicker(fromH) < this.timeConversionSlicker(this.mondayFrom)) {
                              this.mondayFrom = fromH;
                           }
                           if (this.timeConversionSlicker(toH) > this.timeConversionSlicker(this.mondayTo)) {
                              this.mondayTo = toH;
                           }
                        }
                     } else if (
                        this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeDays == "TUESDAY" &&
                        this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeFromHours != null
                     ) {
                        this.tuesdayClosed = false;
                        let fromH = this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeFromHours;
                        let toH = this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeToHours;
                        if (firstTuesday) {
                           this.tuesdayFrom = fromH;
                           this.tuesdayTo = toH;
                           firstTuesday = false;
                        } else {
                           if (this.timeConversionSlicker(fromH) < this.timeConversionSlicker(this.tuesdayFrom)) {
                              this.tuesdayFrom = fromH;
                           }
                           if (this.timeConversionSlicker(toH) > this.timeConversionSlicker(this.tuesdayTo)) {
                              this.tuesdayTo = toH;
                           }
                        }
                     } else if (
                        this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeDays == "WEDNESDAY" &&
                        this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeFromHours != null
                     ) {
                        this.wednesdayClosed = false;
                        let fromH = this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeFromHours;
                        let toH = this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeToHours;
                        if (firstWed) {
                           this.wednesdayFrom = fromH;
                           this.wednesdayTo = toH;
                           firstWed = false;
                        } else {
                           if (this.timeConversionSlicker(fromH) < this.timeConversionSlicker(this.wednesdayFrom)) {
                              this.wednesdayFrom = fromH;
                           }
                           if (this.timeConversionSlicker(toH) > this.timeConversionSlicker(this.wednesdayTo)) {
                              this.wednesdayTo = toH;
                           }
                        }
                     } else if (
                        this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeDays == "THURSDAY" &&
                        this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeFromHours != null
                     ) {
                        this.thursdayClosed = false;
                        let fromH = this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeFromHours;
                        let toH = this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeToHours;
                        if (firstThurs) {
                           this.thursdayFrom = fromH;
                           this.thursdayTo = toH;
                           firstThurs = false;
                        } else {
                           if (this.timeConversionSlicker(fromH) < this.timeConversionSlicker(this.thursdayFrom)) {
                              this.thursdayFrom = fromH;
                           }
                           if (this.timeConversionSlicker(toH) > this.timeConversionSlicker(this.thursdayTo)) {
                              this.thursdayTo = toH;
                           }
                        }
                     } else if (
                        this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeDays == "FRIDAY" &&
                        this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeFromHours != null
                     ) {
                        this.fridayClosed = false;
                        let fromH = this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeFromHours;
                        let toH = this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeToHours;
                        if (firstFri) {
                           this.fridayFrom = fromH;
                           this.fridayTo = toH;
                           firstFri = false;
                        } else {
                           if (this.timeConversionSlicker(fromH) < this.timeConversionSlicker(this.fridayFrom)) {
                              this.fridayFrom = fromH;
                           }
                           if (this.timeConversionSlicker(toH) > this.timeConversionSlicker(this.fridayTo)) {
                              this.fridayTo = toH;
                           }
                        }
                     } else if (
                        this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeDays == "SATURDAY" &&
                        this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeFromHours != null
                     ) {
                        this.saturdayClosed = false;
                        let fromH = this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeFromHours;
                        let toH = this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeToHours;
                        if (firstSat) {
                           this.saturdayFrom = fromH;
                           this.saturdayTo = toH;
                           firstSat = false;
                        } else {
                           if (this.timeConversionSlicker(fromH) < this.timeConversionSlicker(this.saturdayFrom)) {
                              this.saturdayFrom = fromH;
                           }
                           if (this.timeConversionSlicker(toH) > this.timeConversionSlicker(this.saturdayTo)) {
                              this.saturdayTo = toH;
                           }
                        }
                     } else if (
                        this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeDays == "SUNDAY" &&
                        this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeFromHours != null
                     ) {
                        this.sundayClosed = false;
                        let fromH = this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeFromHours;
                        let toH = this.providerDetails.reviewProviderDetails.LocationInformation[0].officeHours[d].officeToHours;
                        if (firstSun) {
                           this.sundayFrom = fromH;
                           this.sundayTo = toH;
                           firstSun = false;
                        } else {
                           if (this.timeConversionSlicker(fromH) < this.timeConversionSlicker(this.sundayFrom)) {
                              this.sundayFrom = fromH;
                           }
                           if (this.timeConversionSlicker(toH) > this.timeConversionSlicker(this.sundayTo)) {
                              this.sundayTo = toH;
                           }
                        }
                     }
                  }
               } else {
                  //No information at all
                  this.noHours = true;
               }
            } else {
               this.noHours = true;
            }

            if (Object.prototype.hasOwnProperty.call(this.providerDetails, "reviewProviderDetails")) {
               // Get Hospital Information
               if (Object.prototype.hasOwnProperty.call(this.providerDetails.reviewProviderDetails, "affiliationDetails")) {
                  this.hospitals = this.providerDetails.reviewProviderDetails.affiliationDetails.HospitalAffiliations;
               }
               // Get Networks accepted
               this.networks = this.providerDetails.reviewProviderDetails.networkName;
            }

            // Update networks array.
            if (Array.isArray(this.networks)) {
               this.networks.forEach((network) => {
                  network.key = "NA" + this.netAccCount;
                  network.value = network.networkName;
                  // Increase number for each key
                  this.netAccCount++;
               });
            } else {
               this.networks = [];
            }
            
            // Update plan accepted array.
            let today = new Date()
            let dateToday = new Date()
            let months3later = new Date(dateToday.setMonth(dateToday.getMonth() + 3));
           
            if (Array.isArray(this.networks)) {
               this.networks.forEach((network) => {

                  let provnetworkstatus = network.NetworkStatus;
            let provterminationdate = new Date(network.networkTerminationDate);
            let proveffectivedate = new Date(network.networkEffectiveDate);
            let provleavingNetwork= network.leavingNetwork;

            if (proveffectivedate.getTime() > today.getTime() && months3later.getTime() >= proveffectivedate.getTime() ){
               network.networkName = network.networkName + " - Joining on " + network.networkEffectiveDate;
               this.activeList.push(network);
            }
            else if (provterminationdate.getTime() > months3later.getTime()){
               network.networkName = network.networkName + " - Active";
               this.activeList.push(network); 
            }
            else if(proveffectivedate.getTime() < today.getTime() && provterminationdate.getTime() <= months3later.getTime()){
               network.networkName = network.networkName + " - Leaving on " + network.networkTerminationDate;
               this.activeList.push(network);
            }
            else {
               network.networkName = network.networkName + " - "+ provnetworkstatus;
            }

            network.key = "NA" + this.netAccCount;
            network.value = network.networkName;
            // Increase number for each key
            this.netAccCount++;
            });
               this.networks = this.activeList;
            }
            let inputParams = { providerId: providerId };
            const paramsPlanA = {
               input: inputParams,
               sClassName: "omnistudio.IntegrationProcedureService",
               sMethodName: "Member_ProviderPlans",
               options: "{}",
            };

            //Call out the Member_ProviderPlans IP
            this.omniRemoteCall(paramsPlanA, true)
               .then((response) => {
                  if(response.result.IPResult){
                     let providerPlansArray = response.result.IPResult;
                     this.plans = providerPlansArray.providerPlanInfo;
                     this.loading = false;
                     if(this.plans = []){
                        this.plans = [];
                     }
                  }else{
                     console.error(`${this.errorMessage} Member_ProviderPlans`)
                     this.loading = false;
                  }
               })
               .catch((error) => {
                  console.error("error", error);
                  this.loading = false;
               });

         }else{
            console.error(`${this.errorMessage} Member_providerDetails`)
            this.loading = false;
         }         
         })
         .catch((error) => {
            console.error("error",error);
            this.loading = false;
         });
   }

   timeConversionSlicker(s) {
      let AMPM = s.slice(-2);
      let timeArr = s.slice(0, -2).split(":");
      if (AMPM === "AM" && timeArr[0] === "12") {
         timeArr[0] = "00";
      } else if (AMPM === "PM") {
         timeArr[0] = (timeArr[0] % 12) + 12;
      }
      return timeArr.join(":");
   }

   getEncodedAddr(provider) {
      let fullAddrEnc = "";
      if (provider) {
         // Create encoded URL for Google Maps directions
         // If Address 2 is present, use it. Otherwise, use only Address 1
         let street =
            this.providerDetails.reviewProviderDetails.LocationInformation[0].addressLine2 && this.providerDetails.reviewProviderDetails.LocationInformation[0].addressLine2 != ""
               ? `${this.providerDetails.reviewProviderDetails.LocationInformation[0].addressline1}%2C+${this.providerDetails.reviewProviderDetails.LocationInformation[0].addressLine2}`
               : this.providerDetails.reviewProviderDetails.LocationInformation[0].addressline1;
         // Concatenate full address, then sanitize URL (look up Google Maps URL encoding for details)
         // Ensure that ZIP is only 5 characters
         let zip = this.locationZipFormatted;
         if (zip.length > 5) {
            zip = zip.slice(0, 5);
         }
         let fullAddr = `${street}%2C+${this.providerDetails.reviewProviderDetails.LocationInformation[0].city}%2C+${this.providerDetails.reviewProviderDetails.LocationInformation[0].state}%2C+${zip}`;
         fullAddrEnc = fullAddr.replace(/ /g, "+").replace(/,/g, "%2C").replace(/"/g, "%22").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/#/g, "%23").replace(/\|/g, "%7C");
         return `https://www.google.com/maps/dir/?api=1&destination=${fullAddrEnc}/`;
      }
      return fullAddrEnc;
   }

   updateDataJson() {
      let networkArray = {};
      networkArray.networkName = this.networks;

      let planArray = {};
      planArray.plans = this.newArray;

      this.omniApplyCallResp(JSON.parse(JSON.stringify(networkArray)));
      this.omniApplyCallResp(JSON.parse(JSON.stringify(planArray)));
   }

   //Boolean tracked variable to indicate if modal is open or not default value is false as modal is closed when page is loaded
   isModalOpen = false;
   isNoPCPModalOpen = false;

   sortingEduDate() {
      // Sort by code
      this.providerDetails.reviewProviderDetails.providerEducation.education.sort(function (a, b) {
         var aDate, bDate;
         var diff = 0;
         if (a.gradYear !== null && b.gradYear !== null) {
            aDate = new Date(a.gradYear);
            bDate = new Date(b.gradYear);
            diff = aDate > bDate ? -1 : aDate < bDate ? 1 : 0;
         }
         return diff;
      });
   }

   choosePCP(evt) {
      if (evt) {
         //Set selected Provider Id
         let member = this.pcpInfo.find((pcp) => pcp.memberId === this.memberInfo.memberId);
         let userPCP = member.pcpName !== "" && member.pcpName === "NA" ? "" : member.pcpName;
         let currentPCPName = { currentPCPName: userPCP };
         let currentPCPId = { currentPCPId: member.pcpId };

         //AFIRE-35 Override PCP Values for Demo Account Provider
         let dataJSON = JSON.parse(JSON.stringify(this.omniJsonData));
         currentPCPName.currentPCPName = dataJSON.demoAccountProviderFullName;
         //
         
         let newPCP = { newPCPName: this.providerName };
         let newProviderId = { newProviderId: this.provId };
         this.omniApplyCallResp(currentPCPName);
         this.omniApplyCallResp(currentPCPId);
         this.omniApplyCallResp(newPCP);
         this.omniApplyCallResp(newProviderId);
         if (this.locationAcceptingNewPatients === "Yes") {
            this.moveToChangePCP(evt);
         } else {
            this.openModal();
         }
      }
   }

   openModal() {
      this.isModalOpen = true;
   }

   openNoPCPModal() {
      this.isNoPCPModalOpen = true;
   }
   openNoPreferredPCPModalOpen(evt) {
      this.isNoPreferredPCPModalOpen = true;
   }

   closeModal() {
      // to close modal set isModalOpen tarck value as false
      this.isModalOpen = false;
   }

   stayInSelectProv() {
      //If the user clicks "ok", display select provider step
      this.isModalOpen = false;
      this.isNoPCPModalOpen = false;
      this.isNoPreferredPCPModalOpen = false;
   }

   moveToChangePCP(evt) {
      if (evt) {
         let viewPCPUpdate = { viewPCPUpdate: "Yes", viewMutlipleOffice: "No" };
         this.omniApplyCallResp(viewPCPUpdate);
         this.omniNextStep();
      }
   }

   navigateToMutlipleOffice(evt) {
      if (evt) {

         let viewMutlipleOffice = { viewMutlipleOffice: "Yes", viewProviderDetails: "Yes" };
         this.omniApplyCallResp(viewMutlipleOffice);
         this.omniNavigateTo("STEP_ProviderLocationResults");
      }
   }

   printDetails() {
     
      window.print();
   }

   acpnySite(){
      window.open('https://attentisconsulting.com/', '_blank');
      this.bronxClose();
   }

   bronxSite(){
      window.open('https://attentisconsulting.com/', '_blank');
      this.bronxClose();
   }

   redirectMenu(evt) {
      if(evt){
         let name = evt.target.title;
         this.allowACPNYRedirect = false;
         this.allowBronxDocsRedirect = false;
         if(name == 'ACPNY'){
            this.allowACPNYRedirect = true;
         }
         if(name == 'BronxDocs'){
            this.allowBronxDocsRedirect = true;
         }
         this.bronxModal = true;
         // Desktop or Mobile
         if (window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes('CommunityHybridContainer')) {
            this.redirectMessage = 'This link will open in your browser. You can come back to the app at any time to pick up where you left off.';
         } else {
            this.redirectMessage = 'This link will take to a new tab, but your '+this.bronxCompanyName+' session will remain active in this tab.';
         }
      }
   }

   bronxClose() {
      this.bronxModal = false;
   }
}
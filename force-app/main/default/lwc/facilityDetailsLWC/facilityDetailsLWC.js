import { LightningElement, track } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";

export default class FacilityDetailsLWC extends OmniscriptBaseMixin(LightningElement) {
   @track plans = [];
   @track networks = [];
   @track agencies = [];
   @track facility = {};
   @track agenciesEmpty;
   @track agencyList = [];
   activeSectionName = "FacilityInformation";
   accreditationInformation = "AccreditationInformation";
   errorMessage ='Error --> No data returned from IP';
   loading = true;
   sectionOpen = true;
   locationAddress;
   locationPhone;
   displayLine;
   facilityCOEshowhide = "";
   facilityTypeHospital = false;
   //Omni JSON Main Variable
   mainJSON;
   mainJSONPlans;
   selectedFacilityType;

   //Variable used in IP
   providerId;
   facilityId;
   tenantId;
   planType;
   networkId;

   connectedCallback() {
      // Get JSON Data
      let jsonOmniData = JSON.parse(JSON.stringify(this.omniJsonData));

      this.facilityId = jsonOmniData.selectedFacility.facetsProviderId;
      this.tenantId = jsonOmniData.tenantId;
      this.planType = jsonOmniData.planType;
      this.networkId = jsonOmniData.networkId;
      this.providerId = jsonOmniData.selectedFacility.facetsProviderId;
      this.selectedFacilityType = jsonOmniData.selectedFacilityType;

      if (this.selectedFacilityType == "Hospital") {
         this.facilityTypeHospital = true;
      } else {
         this.facilityTypeHospital = false;
      }

      // Get Accreditation and Networks from IP
      let inputParam = { facilityId: this.facilityId, tenantId: this.tenantId, planType: this.planType, networkId: this.networkId };
      const params = {
         input: inputParam,
         sClassName: "omnistudio.IntegrationProcedureService",
         sMethodName: "Member_facilityDetails",
         options: "{}",
      };

      // Call out the Accreditation and Networks IP
      this.omniRemoteCall(params, true).then((response) => {
         if(response.result.IPResult){
            let jsonNetworkPlans = response.result.IPResult;
            this.mainJSON = jsonNetworkPlans;

            // List of Networks Accepted
            this.networks = this.mainJSON.facilityNetwork.participatingNetworks;
            this.networks = this.networks.filter((net) => net.value != null);
            this.networks = this.networks.sort((a, b) => (a.value > b.value ? 1 : b.value > a.value ? -1 : 0));

            // List of Accreditation Information
            this.agencyList = this.mainJSON.facilityAccreditation;

            // Filter Function based on AC MPV-159
            function filterAgencies(obj) {
               // Today Date
               var today = new Date();
               var dd = String(today.getDate()).padStart(2, "0");
               var mm = String(today.getMonth() + 1).padStart(2, "0");
               var yyyy = today.getFullYear();
               today = mm + "/" + dd + "/" + yyyy;

               var objExpDate = new Date(obj.expirationDate);
               var todayDate = new Date(today);

               if (obj.accred != null && (objExpDate >= todayDate || objExpDate == null)) {
                  //Flag
                  obj.displayLine = false;
                  return true;
               } else {
                  return false;
               }
            }

            this.agencies = this.agencyList.filter(filterAgencies);

            //Display Line for Mobile in Accreditation section
            if (this.agencies.length == 1) {
            } else {
               for (var i = 0; i < this.agencies.length; i++) {
                  if (i == 0) {
                     this.agencies[i].displayLine = true;
                  } else if (i == this.agencies.length - 1) {
                     this.agencies[i].displayLine = false;
                  } else {
                     this.agencies[i].displayLine = true;
                  }
               }
            }

            //Flag message if there is no Accreditations
            if (this.agencies.length > 0) {
               this.agenciesEmpty = false;
            } else {
               this.agenciesEmpty = true;
            }

            // Facility Object Creation to show all Details

            this.facility = {
               name: this.mainJSON.facilityName,
               type: this.mainJSON.facilityType,
               addressLine1: this.mainJSON.facilityaddress.addressLine1,
               addressLine2: this.mainJSON.facilityaddress.addressLine2,
               addressLine3: this.mainJSON.facilityaddress.addressLine3,
               city: this.mainJSON.facilityaddress.city,
               county: this.mainJSON.facilityaddress.county,
               state: this.mainJSON.facilityaddress.state,
               zip: this.mainJSON.facilityaddress.zip,
               geoPoint: this.mainJSON.facilityaddress.geoPoint,
               phone: this.mainJSON.facilityaddress.provAddressContact.phone,
               isCOE: this.mainJSON.isCOE,
            };
            // Ensure that ZIP is only 5 characters
            if(this.facility.zip != undefined || this.facility.zip != null){
               if (this.facility.zip.length > 5) {
                  this.facility.zip = this.facility.zip.slice(0, 5);
               }
            }            
            // Formatted Phone            
            if (this.facility.phone != undefined || this.facility.phone != null) {
               this.locationPhone = this.facility.phone.substring(0, 3) + "-" + this.facility.phone.substring(3, 6) + "-" + this.facility.phone.substring(6, 10);
            }
            // Formatted Address
            this.locationAddress = this.facility.addressLine1 + ", " + this.facility.city + " " + this.facility.state + " " + this.facility.zip;
            this.directionsUrl = this.getEncodedAddress(this.facility);
            this.loading = false;
            //Show - Hide Center of Excellence Field - MPV-1036
            if(this.facility.isCOE == "Yes" )
            {
               this.facilityCOEshowhide = true;
            }else{
               this.facilityCOEshowhide = false;
            }
         }else{
            console.error(`${this.errorMessage} Member_facilityDetails`)
         }
      
      }).catch((error) => {
         console.error(`failed at getting IP data => ${JSON.stringify(error)}`);
         this.loading = false;
      });

      // Get Plans from Provider IP
      let inputp = { providerId: this.providerId };
      const parameter = {
         input: inputp,
         sClassName: "omnistudio.IntegrationProcedureService",
         sMethodName: "Member_ProviderPlans",
         options: "{}",
      };

      this.omniRemoteCall(parameter, true).then((response) => {
         if(response.result.IPResult){
            let jsonPlans = response.result.IPResult;
            this.mainJSONPlans = jsonPlans;

            // List of Plans Accepted
            this.plans = this.mainJSONPlans.providerPlanInfo;
         }else{
            console.error(`${this.errorMessage} Member_ProviderPlans`)
         }
      }).catch((error) => {
         console.error(`failed at getting IP data => ${JSON.stringify(error)}`);
         this.loading = false;
      });
   }

   printDetails() {
      window.print();
   }

   backToFacilities(evt) {
      if (evt) {
         this.omniNavigateTo("STEP_SelectFacility");
      }
   }

   getEncodedAddress(facility) {
      let fullAddrEnc = "";
      if (facility) {
         // Create encoded URL for Google Maps directions
         // If Address 2 is present, use it. Otherwise, use only Address 1
         let street = this.facility.addressLine2 && this.facility.addressLine2 != "" ? `${this.facility.addressLine1}%2C+${this.facility.addressLine2}` : this.facility.addressLine1;
         // Concatenate full address, then sanitize URL (look up Google Maps URL encoding for details)
         let zip = this.facility.zip;
         let fullAddr = `${street}%2C+${this.facility.city}%2C+${this.facility.state}%2C+${zip}`;
         fullAddrEnc = fullAddr.replace(/ /g, "+").replace(/,/g, "%2C").replace(/"/g, "%22").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/#/g, "%23").replace(/\|/g, "%7C");
         return `https://www.google.com/maps/dir/?api=1&destination=${fullAddrEnc}/`;
      }
      return fullAddrEnc;
   }

}
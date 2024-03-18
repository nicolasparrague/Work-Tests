import { LightningElement, track, api } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import { getPagesOrDefault, handlePagerChanged } from "c/pagerUtils";

export default class MultipleOfficesLWC extends OmniscriptBaseMixin(LightningElement) {
   @track multipleOffices = [];
   loading = true;

   showMap = false;
   @track mapMarkers = [];
   @track selectedMapMarkerValue;
   @track isMapLoading = true;
   @track pinDetailDirLink = "";
   @track pinDetailPhoneLink = "";
   @track pinDetailPhone = "";
   openMapDetail = false;

   _currentlyVisible = [];
   @track selectedViewNumber = 10;
   isPublic = false;

   getPagesOrDefault = getPagesOrDefault.bind(this);
   handlePagerChanged = handlePagerChanged.bind(this);

   @api
   get currentlyVisible() {
      const pages = this.getPagesOrDefault();
      return pages.length === 0 ? this._currentlyVisible : pages;
   }
   set currentlyVisible(value) {
      this._currentlyVisible = value;
   }

   get getListWrapClass() {
      if (document.documentElement.clientWidth < 768) {
         return this.showMap ? "nds-hide" : "nds-size_12-of-12";
      }
      return this.showMap ? "nds-size_8-of-12" : "nds-size_12-of-12";
   }

   get getMapWrapClass() {
      if (document.documentElement.clientWidth < 768) {
         return this.showMap ? "nds-grid nds-wrap nds-size_12-of-12" : "nds-hide";
      }
      return this.showMap ? "nds-size_4-of-12" : "nds-hide";
   }

   get showMobileMapDetails() {
      return document.documentElement.clientWidth < 768 && this.openMapDetail ? true : false;
   }

   // Set all variables here ****
   elementsLoaded = true;
   providerFullName = "";
   providerTitle = "";
   acceptNewPatients = "";
   notAcceptNewPatients = "";
   providerPlanAccepted = "Test Plan";
   planAccepted = "";
   networkId = "";
   providerDistanceFromZip = "";

   // Multiple Office PDF
   pdfJsonData;

   //for multiple offices IP - profileId and zip code
   profileIdMP = null;
   zipCodeMP = null;

   connectedCallback() {
      // Get JSON from OS
      let jsonDataMP = JSON.parse(JSON.stringify(this.omniJsonData));
      if (jsonDataMP.isPublic != undefined && jsonDataMP.isPublic) {
         this.isPublic = true;
      } else {
         this.isPublic = false;
      }

      this.pdfJsonData = jsonDataMP;
      this.profileIdMP = jsonDataMP.profileId;
      this.zipCodeMP = jsonDataMP.STEP_ChooseLocation.TXT_ZipCode;
      this.planAccepted = jsonDataMP.SelectedPlanInfo.planName;
      this.networkId = jsonDataMP.SelectedPlanInfo.networkId;

      // Set Input parameter for the MultipleOffices IP
      let inputParam;
      if (this.isPublic) {
         //Handling Public Search
         let networkCode = jsonDataMP.networkCode;
         if (Array.isArray(networkCode) && networkCode.length > 0) {
            let networkCodeStr = "";
            for (let i = 0; i < networkCode.length; i++) {
               let code = networkCode[i].replace(/\s+/g, "");
               if (i == 0) {
                  networkCodeStr = networkCodeStr + `\"${code}\"`;
               } else {
                  networkCodeStr = networkCodeStr + ` OR \"${code}\"`;
               }
            }
            networkCode = networkCodeStr;
         }
         inputParam = { profileId: this.profileIdMP, zipCode: this.zipCodeMP, networkCode: networkCode };
      } else {
         //Handling Login Search
         inputParam = { profileId: this.profileIdMP, zipCode: this.zipCodeMP, networkId: this.networkId };
      }

      const params = {
         input: inputParam,
         sClassName: "vlocity_ins.IntegrationProcedureService",
         sMethodName: "Member_multipleOffices",
         options: "{}",
      };
      this.loading = false;
   }

   updateJson() {
      let providerMultipleLocation = {};
      providerMultipleLocation.providerMultipleLocation = this.multipleOffices;
      this.omniApplyCallResp(JSON.parse(JSON.stringify(providerMultipleLocation)));
   }

   setMapMarkers() {
      this.isMapLoading = true;
      if (this.multipleOffices.length >= 0) {
         let tmpMarkers = [];
         this.multipleOffices.forEach((provider) => {
            if (provider.ProviderId) {
               // For each provider given, create a map marker.
               let coords = [];
               if (provider.geoPoint != "0,0") {
                  coords = provider.geoPoint.split(",");
               }
               let fullStreet = provider.addressLine1;
               if (provider.addressLine2 && provider.addressLine2 != "") {
                  fullStreet = fullStreet + ", " + provider.addressLine2;
               }
               let locationObj = {
                  Street: fullStreet,
                  City: provider.city,
                  State: provider.state,
                  PostalCode: provider.zip,
               };
               if (coords.length > 0) {
                  locationObj["Latitude"] = coords[0];
                  locationObj["Longitude"] = coords[1];
               }
               tmpMarkers.push({
                  location: locationObj,
                  title: `${provider.providerFullName}`,
                  description: `${fullStreet}</br>${provider.city}, ${provider.state}</br>${provider.zip}`,
                  value: provider.ProviderId,
                  fillColor: "#A32BAA",
               });
            }
         });
         this.mapMarkers = [...tmpMarkers];
         this.isMapLoading = false;
      }
   }

   handleViewSelect(evt) {
      this.selectedViewNumber = evt.target.value;
      console.log(`View ${this.selectedViewNumber} selected`);
   }

   handleMapToggle(evt) {
      this.showMap = evt.target.checked;
   }

   handleListViewClick() {
      if (this.showMap) {
         this.showMap = false;
      }
   }

   handleMapViewClick() {
      if (!this.showMap) {
         this.showMap = true;
      }
   }

   handleMapMarkerSelect(event) {
      this.selectedMapMarkerValue = event.detail.selectedMarkerValue;
      let filteredProv = this.multipleOffices.filter((prov) => {
         return prov.ProviderId == this.selectedMapMarkerValue;
      });
      this.pinDetailDirLink = filteredProv[0].directionsUrl;
      this.pinDetailPhone = filteredProv[0].Phone;
      this.pinDetailPhoneLink = `tel:${this.pinDetailPhone}`;
      let selectedProvider = this.template.querySelector(`[data-target-id="${this.selectedMapMarkerValue}"]`);
      selectedProvider.focus();
      this.openMapDetail = true;
   }

   handleClosePinDetail() {
      this.openMapDetail = false;
      this.pinDetailDirLink = "";
      this.pinDetailPhone = "";
      this.pinDetailPhoneLink = "";
   }

   navigateToProviderDetails(evt) {
      if (evt) {
         console.log("Go To provider details");
         //Set selected Provider Id
         const provId = evt.target.getAttribute("data-btn-id");
         let pr = this.multipleOffices.find((provider) => provider.ProviderId === provId);
         // Accepting New Patients
         let acceptNewPa = { acceptNewPa: pr.acceptingNewPatients };
         console.log("prov :", pr);

         let providerId = { providerId: provId };
         this.omniApplyCallResp(providerId);
         this.omniApplyCallResp(acceptNewPa);

         let viewProviderDetails = { viewProviderDetails: "Yes" };
         this.omniApplyCallResp(viewProviderDetails);
         this.omniNavigateTo("STEP_ReviewProviderDetails");
      }
   }

   getEncodedAddr(provider) {
      let fullAddrEnc = "";
      if (provider) {
         // Create encoded URL for Google Maps directions
         // If Address 2 is present, use it. Otherwise, use only Address 1
         let street = provider.addressLine2 && provider.addressLine2 != "" ? `${provider.addressLine1}%2C+${provider.addressLine2}` : provider.addressLine1;
         // Concatenate full address, then sanitize URL (look up Google Maps URL encoding for details)
         // Ensure that ZIP is only 5 characters
         let zip = provider.zip;
         if (zip.length > 5) {
            zip = zip.slice(0, 5);
         }
         let fullAddr = `${street}%2C+${provider.city}%2C+${provider.state}%2C+${zip}`;
         fullAddrEnc = fullAddr.replace(/ /g, "+").replace(/,/g, "%2C").replace(/"/g, "%22").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/#/g, "%23").replace(/\|/g, "%7C");
         return `https://www.google.com/maps/dir/?api=1&destination=${fullAddrEnc}/`;
      }
      return fullAddrEnc;
   }
}
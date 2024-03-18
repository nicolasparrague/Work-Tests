import { LightningElement, track, api } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";

export default class FacilityResultsLWC extends OmniscriptBaseMixin(LightningElement) {
   loading = true;
   facJsonData = null;
   noElementsMsg = false;
   systemErrorMsg = false;
   elementsToDisplayMobile = null;
   elementsLoaded = null; // Used to see if IP response is sending information.
   exist = false;
   errorMessage = "Error --> No data returned from IP";
   @track facilities = [];
   @track facilitiesTracked = [];
   @track facilitiesAmount;
   @track selectedFacilityType = "";
   distanceFrom;
   distanceMile;
   userZipCode;
   facilityTypeHospital = false;
   modalFacilityComparison = false;
   @track facilitiesToCompare = [];
   @track facilityComparison = [];
   get isCompareDisabled() {
      return this.facilitiesToCompare.length > 1 ? false : true;
   }
   showCompareFooter = false;
   facilitiesAmount = 0;
   @track facilitiesFound = 0;
   @track facs = [];
   compareFacilities = false;
   messageCompare;
   messageCancel;
   // Compare Facilities
   addressLine1 = "";
   addressLine2 = "";
   city = "";
   state = "";
   zip = "";
   phone = "";
   facilityType = "";
   loading = false;
   added = false;
   @track disableCompareButton = true;
   @track facilityCount = 0;
   @track accreditations = [];
   @track fhn = "";
   dynamicCOE = false;
   fieldParam = {
      fieldToSave: "",
      fieldValue: "",
   };
   @track accreditationParams = {
      input: {},
      sClassName: "omnistudio.IntegrationProcedureService",
      sMethodName: "Member_Accreditation",
      options: "{}",
   };
   @track facilityParams = {
      input: {},
      sClassName: "omnistudio.IntegrationProcedureService",
      sMethodName: "Member_findFacility",
      options: "{}",
   };
   numOfRetry = 0;
   maxOfRetry = 2;
   @track totalProviderNum = 0;
   @track pagerFirstEle = 0;
   @track selectedViewNumber = 10;
   @track viewOptions = [
      { label: "5", value: 5 },
      { label: "10", value: 10 },
      { label: "25", value: 25 },
      { label: "50", value: 50 },
   ];
   // For use by the map
   @track showMap = false;
   @track mapMarkers = [];
   @track selectedMapMarkerValue;
   @track isMapLoading = true;
   @track zoomLevel = 12;
   @track pinnedFacilityFullName = "";
   @track pinnedFacilityTitle = "";
   @track pinDetailDirLink = "";
   @track pinDetailPhoneLink = "";
   @track pinDetailPhone = "";
   openMapDetail = false;
   zoomLevelMapping = {
      "1mi": 14,
      "5mi": 12,
      "10mi": 11,
      "20mi": 10,
      "30mi": 9,
      "40mi": 9,
      "50mi": 9,
   };

   //Filter
   filterBy = "Filter By";
   selectedGender = "Either";

   //Sort
   sortBy = "Distance - Closest";
   selectedSort = "";
   selectedSortId = "";
   sortDirection = "ASC";
   sortIdNum;

   sortOptions = [
      {
         key: "B001",
         ascBadgeId: "B001-ASC",
         descBadgeId: "B001-DESC",
         value: "Name A-Z",
      },
      {
         key: "B002",
         ascBadgeId: "B002-ASC",
         descBadgeId: "B002-DESC",
         value: "Name Z-A",
      },
      {
         key: "B007",
         ascBadgeId: "B007-ASC",
         descBadgeId: "B007-DESC",
         value: "Distance - Closest",
      },
   ];
   sortMoOptions = [
      {
         key: "B001M",
         ascBadgeId: "B001M-ASC",
         descBadgeId: "B001M-DESC",
         value: "Name A-Z",
      },
      {
         key: "B002M",
         ascBadgeId: "B002M-ASC",
         descBadgeId: "B002M-DESC",
         value: "Name Z-A",
      },
      {
         key: "B007M",
         ascBadgeId: "B007M-ASC",
         descBadgeId: "B007M-DESC",
         value: "Distance - Closest",
      },
   ];

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

   get mapMarginClass() {
      if (document.documentElement.clientWidth < 768) {
         return "";
      }
      return "nds-m-right_none";
   }

   get showMobileMapDetails() {
      return document.documentElement.clientWidth < 768 && this.openMapDetail ? true : false;
   }

   setFilterValue() {
      // Set Input parameter for the FindDoctor IP
      if (Object.prototype.hasOwnProperty.call(this.facJsonData, "facilityParams")) {
         let input = this.facJsonData.facilityParams.input;
         //Accreditation
         if (!input.accreditation && this.template.querySelector(".filter_accreditation_Desktop")) {
            this.template.querySelector(".filter_accreditation_Desktop").value = "All";
         } else {
            this.template.querySelector(".filter_accreditation_Desktop").value = input.accreditation;
         }
         //WheelChair
         if (this.template.querySelector(".filter_WA_Desktop")) {
            this.template.querySelector(".filter_WA_Desktop").checked = Boolean(input.wheelchair);
         }
         //Center Of Excellence
         if (this.template.querySelector(".filter_COE_Desktop")) {
            this.template.querySelector(".filter_COE_Desktop").checked = Boolean(input.coe);
         }
      }
   }

   setFilterValueMobile() {
      // Set Input parameter for the FindDoctor IP
      if (Object.prototype.hasOwnProperty.call(this.facJsonData, "facilityParams")) {
         let input = this.facJsonData.facilityParams.input;
         //Accreditation
         if (this.template.querySelector(".filter_accreditation")) {
            if (!input.accreditation) {
               this.template.querySelector(".filter_accreditation").value = "All";
            } else {
               this.template.querySelector(".filter_accreditation").value = input.accreditation;
            }
         }
         if (this.template.querySelector(".filter_WA")) {
            this.template.querySelector(".filter_WA").checked = Boolean(input.wheelchair);
         }

         if (this.template.querySelector(".filter_COE")) {
            this.template.querySelector(".filter_COE").checked = Boolean(input.coe);
         }
      }
   }

   setPageView() {
      if (this.selectedViewNumber) {
         let pageview = this.template.querySelector(".pageview");
         if (pageview) {
            pageview.value = this.selectedViewNumber;
         }
      }
   }

   renderedCallback() {
      this.setPageView();
      this.setFilterValue();
      this.setFilterValueMobile();

      //Modal Focus - Start
      const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
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
            if (event.key === "Escape") {
               me.closeModalFacilityComparison();
            }
         });
      }
      // }//Modal Focus - End
   }

   connectedCallback() {
      //Get Json Data
      this.facJsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      let jsonDataFac = this.facJsonData;
      this.pcpInfo = jsonDataFac.PCPInfo;
      this.memberInfo = jsonDataFac.MemberInfo;
      this.selectedSort = jsonDataFac.selectedSort;
      this.selectedSortId = jsonDataFac.selectedSortId;
      this.sortDirection = jsonDataFac.sortDirection;

      if (Object.prototype.hasOwnProperty.call(this.facJsonData, "filterBy")) {
         this.filterBy = jsonDataFac.filterBy;
      }

      if (Object.prototype.hasOwnProperty.call(this.facJsonData, "selectedGender")) {
         this.selectedGender = jsonDataFac.selectedGender;
      }
      let navigateFrom = jsonDataFac.navigateFrom;
      let distance = jsonDataFac.distance;
      let zipCode = jsonDataFac.zipCode;
      let facilityType = jsonDataFac.facilityType;
      let facilityName = jsonDataFac.facilityName;
      // Set zoom level for map based on distance
      this.zoomLevel = this.zoomLevelMapping[distance];

      let planType = jsonDataFac.SelectedPlanInfo.brand;
      let planId = jsonDataFac.SelectedPlanInfo.planId;
      let networkId = jsonDataFac.SelectedPlanInfo.networkId;
      let networkCode = jsonDataFac.SelectedPlanInfo.networkCode;

      this.facInfoBrand = jsonDataFac.SelectedPlanInfo.brand;
      this.userZipCode = this.facJsonData.zipCode;
      this.selectedFacilityType = this.facJsonData.selectedFacilityType;
      //Get Distance From
      this.distanceFrom = this.facJsonData.STEP_ChooseLocation.SEL_Distance;
      this.formattedDistanceFrom = this.distanceFrom.slice(0, this.distanceFrom.length - 2);
      if (this.formattedDistanceFrom == "1") {
         this.formattedDistanceFrom = this.formattedDistanceFrom + " mile";
      } else {
         this.formattedDistanceFrom = this.formattedDistanceFrom + " miles";
      }

      if (this.facJsonData.selectedFacilityType == "Hospital") {
         this.facilityTypeHospital = true;
      } else {
         this.facilityTypeHospital = false;
      }

      // If running on mobile, default to 5 per page
      let viewNumber = this.selectedViewNumber;
      if (document.documentElement.clientWidth < 768) {
         viewNumber = 5;
      }

      //Set Input for IP
      let inputParamAccreditation = { brand: this.facInfoBrand };
      this.accreditationParams.input = inputParamAccreditation;
      //this.getAccreditations();

      if (Array.isArray(jsonDataFac.ServiceTypeInfo)){
         for (var j = 0; j < jsonDataFac.ServiceTypeInfo.length; j++){
            if (jsonDataFac.ServiceTypeInfo[j].fhnMember == "Yes" && jsonDataFac.ServiceTypeInfo[j].status == "Active" && jsonDataFac.ServiceTypeInfo[j].defaultPlan == "Y"){
               this.sendFHN = true;
               this.fhn = "Y";
            }
         }
      }

      // Set Input parameter for the FindFacility IP
      if (Object.prototype.hasOwnProperty.call(this.facJsonData, "facilityParams")) {
         this.facilityParams = this.facJsonData.facilityParams;
         //Check if user go back and change value

         if (this.facJsonData.facilityParams.input.facilityType !== facilityType) {
            this.facilityParams.input.facilityType = facilityType;
         }
         if (this.facJsonData.facilityParams.input.facilityName !== facilityName) {
            this.facilityParams.input.facilityName = facilityName;
         }
         if (this.facJsonData.facilityParams.input.zipCode !== zipCode) {
            this.facilityParams.input.zipCode = zipCode;
         }
         if (this.facJsonData.facilityParams.input.distance !== distance) {
            this.facilityParams.input.distance = distance;
         }

         if (navigateFrom !== "SelectFacility") {
            //Reseting Page No
            this.facilityParams.input.from = 0;
            this.facJsonData.facilityParams.input.from = 0;
            //Reseting Page View Number
            if (document.documentElement.clientWidth < 768) {
               viewNumber = 5;
            } else {
               this.selectedViewNumber = 10;
               viewNumber = 10;
            }
            this.facilityParams.input.size = viewNumber;
            this.facJsonData.facilityParams.input.size = viewNumber;
            //Reseting Sort
            this.resetSortParams();
            //Reseting Filter
            this.resetFilterParams();
         }

         this.pagerFirstEle = this.facJsonData.facilityParams.input.from;
         this.selectedViewNumber = this.facJsonData.facilityParams.input.size;
      } else {
         let inputParam = {
            facilityType: facilityType,
            facilityName: facilityName,
            planId: planId,
            planType: planType,
            networkId: networkId,
            networkCode: networkCode,
            distance: distance,
            zipCode: zipCode,
            from: this.pagerFirstEle,
            size: viewNumber,
            fhn: this.fhn,
         };
         this.facilityParams.input = inputParam;
      }
      this.getFacilities();

      //Accessibility
      if (jsonDataFac.selectedFacilityType == "") {
         this.messageCompare = "Compare up to 3 Providers";
         this.messageCancel = "Cancel will remove all Providers from compare and footer component will be closed";
      } else {
         this.messageCompare = "Compare up to 3 Facilities";
         this.messageCancel = "Cancel will remove all Facilities from compare and footer component will be closed";
      }
   }

   /*****************************************************************/
   /* Call Member_findDoctor IP and map returned output to variables.*/
   /*****************************************************************/
   getAccreditations() {
      return this.omniRemoteCall(this.accreditationParams, true)
         .then((response) => {
            if (response.result.IPResult) {
               if (Object.prototype.hasOwnProperty.call(response.result.IPResult, "success") && response.result.IPResult.success === false) {
                  if (this.numOfRetry < this.maxOfRetry) {
                     this.numOfRetry++;
                     this.getAccreditations();
                  }
               } else {
                  //Callout was succesful
                  let AccreditationArray = response.result.IPResult;
                  this.accreditations = AccreditationArray;
               }
            } else {
               console.error(`${this.errorMessage} Member_Accreditation`);
            }
         })
         .catch((error) => {
            onsole.log("error", error);
            //error handling
            this.loading = false;
         });
   }

   getFacilities() {
      this.loading = true;
      this.facilitiesTracked = [];
      this.systemErrorMsg = false;

      // Call out the Member_Multiple Offices IP
      this.omniRemoteCall(this.facilityParams, true)
         .then((response) => {
            if (response.result.IPResult && Object.prototype.hasOwnProperty.call(response.result.IPResult, "totalRecords")) {
               let facilityResultsArray = response.result.IPResult;
               this.totalProviderNum = facilityResultsArray.totalRecords;
               this.facilities = facilityResultsArray.selectFacility;

               //remove duplicates
               this.facilities = this.facilities.filter((v, i, a) => a.findIndex((t) => t.facetsProviderId === v.facetsProviderId) === i);
               this.loading = false;

               if (Array.isArray(this.facilities) && this.totalProviderNum > 0) {
                  if (this.facilities.length === 1) {
                     this.facilities.forEach((facility) => {
                        if (!facility.facetsProviderId) {
                           this.noElementsMsg = true;
                           this.elementsLoaded = false;
                           this.elementsToDisplayMobile = false;
                        } else {
                           this.noElementsMsg = false;
                           this.elementsToDisplayMobile = true;
                           this.elementsLoaded = true;
                           facility.directionsUrl = this.getEncodedAddr(facility);
                        }
                     });
                  } else if (this.facilities.length > 1) {
                     this.noElementsMsg = false;
                     this.elementsLoaded = true;
                     this.elementsToDisplayMobile = true;
                     this.facilities.forEach((facility) => {
                        if (facility.facetsProviderId) {
                           facility.directionsUrl = this.getEncodedAddr(facility);
                        }
                     });
                  }
                  // Check if facilitiesToCompare Exist
                  this.facilityJD = JSON.parse(JSON.stringify(this.omniJsonData));
                  this.facilities.forEach((facility) => {
                     //get distance from IP and fixed it to 2 decimals
                     if (this.facilities.length > 0) {
                        if (facility.distanceFromZip) {
                           facility.distanceFromZip = facility.distanceFromZip.toFixed(2);
                        }
                     }

                     //Validate if provider has wheelchair accessility
                     if (facility.wheelChair === "Yes" || facility.wheelChair === "Y") {
                        facility.isWheelchairAccessible = true;
                     } else {
                        facility.isWheelchairAccessible = false;
                     }

                     //  Format Zip Code
                     if (facility.facilityAddress.zip === undefined || facility.facilityAddress.zip === null || facility.facilityAddress.zip === "") {
                        facility.zip = " ";
                     } else {
                        facility.zip = facility.facilityAddress.zip.substring(0, 5);
                     }

                     //  Format Phone Number
                     if (
                        facility.facilityAddress.provAddressContact.phone === undefined ||
                        facility.facilityAddress.provAddressContact.phone == null ||
                        facility.facilityAddress.provAddressContact.phone === ""
                     ) {
                        facility.Phone = " ";
                     } else {
                        facility.Phone =
                           facility.facilityAddress.provAddressContact.phone.substring(0, 3) +
                           "-" +
                           facility.facilityAddress.provAddressContact.phone.substring(3, 6) +
                           "-" +
                           facility.facilityAddress.provAddressContact.phone.substring(6, 10);
                     }

                     //Logic for enable/disable button add/remove to compare
                     if (this.facilityJD.facilitiesToCompare != undefined || this.facilityJD.facilitiesToCompare != null) {
                        this.exist = true;
                        if (this.facilityJD.facilitiesToCompare.length > 0) {
                           this.showCompareFooter = true;
                        }

                        if (this.facilityJD.facilitiesToCompare.length > 0 && this.facilityJD.facilitiesToCompare.length <= 2) {
                           let found = this.facilityJD.facilitiesToCompare.some((fa) => fa.facilityId === facility.facetsProviderId);
                           if (found) {
                              facility.added = true;
                           }
                        } else if (this.facilityJD.facilitiesToCompare.length == 3) {
                           facility.isBtnDisabled = true;
                           let found = this.facilityJD.facilitiesToCompare.some((fa) => fa.facilityId === facility.facetsProviderId);
                           if (found) {
                              facility.added = true;
                              facility.isBtnDisabled = false;
                           }
                        }
                     } else {
                        this.exist = false;
                     }

                     // See if facility is FHN
                     if (facility.isFHN != null) {
                        if (facility.isFHN == "YES"){
                           facility.FHN = true;
                        } else {
                           facility.FHN = false
                        }
                     }
                  });
                  this.setFacilitiesToCompare();
               } else {
                  // No record returned from IP
                  this.noElementsMsg = true;
                  this.elementsLoaded = false;
                  this.elementsToDisplayMobile = false;
               }

               // Update IP input to data JSON
               if (this.facilities.length > 0) {
                  this.saveAPIInput();
               }

               //To reset 'from' to 0 in the facilityParams.input
               this.fieldParam.fieldToSave = "navigateFrom";
               this.fieldParam.fieldValue = "SelectFacility";

               this.saveFieldToDataJson();

               if (Array.isArray(this.facilities) && this.facilities.length > 0) {
                  this.facilitiesTracked = [...this.facilities];
               } else {
                  //do nothing
               }
               this.setMapMarkers();
            } else {
               console.error(`${this.errorMessage} Member_findFacility`);
               this.loading = false;
               this.systemErrorMsg = true;
            }
         })
         .catch((error) => {
            console.error("error", error);
            this.loading = false;
            this.systemErrorMsg = true;
         });
      //dynamic filters
      this.dynamicFilterShowHide();
   }

   setFacilitiesToCompare() {
      let jsonFTC = JSON.parse(JSON.stringify(this.omniJsonData));
      if (jsonFTC.facilitiesToCompare != null || jsonFTC.facilitiesToCompare != undefined) {
         this.facilityCount = jsonFTC.facilitiesToCompare.length;
         this.facilitiesToCompare = JSON.parse(JSON.stringify(jsonFTC.facilitiesToCompare));
         if (jsonFTC.facilitiesToCompare.length >= 2) {
            this.disableCompareButton = false;
         } else {
            this.disableCompareButton = true;
         }
      } else {
         this.facilityCount = 0;
      }
   }

   dynamicFilterShowHide() {
      let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      if (jsonData.SelectedPlanInfo.centerOfExcellence == "Y" && (jsonData.selectedFacilityType == "Orthopaedic Surgery" || jsonData.selectedFacilityType == "Oncology")) {
         this.dynamicCOE = true;
      } else {
         this.dynamicCOE = false;
      }
   }

   saveAPIInput() {
      let inputs = {};
      inputs.facilityParams = this.facilityParams;
      this.omniApplyCallResp(JSON.parse(JSON.stringify(inputs)));
   }

   getEncodedAddr(facility) {
      let fullAddrEnc = "";
      if (facility) {
         // Create encoded URL for Google Maps directions
         // If Address 2 is present, use it. Otherwise, use only Address 1
         let street =
            facility.facilityAddress.addressLine2 && facility.facilityAddress.addressLine2 != ""
               ? `${facility.facilityAddress.addressLine1}%2C+${facility.facilityAddress.addressLine2}`
               : facility.facilityAddress.addressLine1;
         // Concatenate full address, then sanitize URL (look up Google Maps URL encoding for details)
         // Ensure that ZIP is only 5 characters
         let zip = facility.facilityAddress.zip;
         if (zip.length > 5) {
            zip = zip.slice(0, 5);
         }
         let fullAddr = `${street}%2C+${facility.facilityAddress.city}%2C+${facility.facilityAddress.state}%2C+${zip}`;
         fullAddrEnc = fullAddr.replace(/ /g, "+").replace(/,/g, "%2C").replace(/"/g, "%22").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/#/g, "%23").replace(/\|/g, "%7C");
         return `https://www.google.com/maps/dir/?api=1&destination=${fullAddrEnc}/`;
      }
      return fullAddrEnc;
   }

   saveFieldToDataJson() {
      var field = { [this.fieldParam.fieldToSave]: this.fieldParam.fieldValue };
      this.omniApplyCallResp(field);
   }

   goToChooseServiceType(evt) {
      if (evt) {
         this.omniNavigateTo("STEP_ChooseServiceType");
      }
   }

   clearFiltersDesktop() {
      // clear filters in UI
      this.template.querySelector(".filter_WA_Desktop").checked = false;

      if (this.dynamicCOE == true) {
         this.template.querySelector(".filter_COE_Desktop").checked = false;
      }

      this.template.querySelector(".filter_accreditation_Desktop").value = "All";

      // clear filters in backend
      this.resetFilterParams();

      this.filterDesktop();
   }

   /* Facility Filter functionality for Desktop */
   filterDesktop() {
      /**Filter Accreditation - IP Dynamic Accreditation value**/
      if (this.template.querySelector(".filter_accreditation_Desktop").value != "All") {
         this.facilityParams.input.accreditation = this.template.querySelector(".filter_accreditation_Desktop").value;
      } else {
         this.facilityParams.input.accreditation = "";
      }

      /**Filter Wheelchair - IP Dynamic Wheelchair value**/
      if (this.template.querySelector(".filter_WA_Desktop").checked == true) {
         this.facilityParams.input.wheelchair = "true";
      } else {
         this.facilityParams.input.wheelchair = "";
      }

      /**Filter Center of Excellence - IP Dynamic COE value**/
      if (this.dynamicCOE == true) {
         if (this.template.querySelector(".filter_COE_Desktop").checked == true) {
            this.facilityParams.input.coe = "true";
         } else {
            this.facilityParams.input.coe = "";
         }
      }
      this.goToFirstPage();
      this.getFacilities();
   }

   goToFirstPage() {
      this.facilityParams.input.from = 0;
      this.pagerFirstEle = 0;
   }

   /**Facility Filter functionality for Mobile**/
   mobileCloseFilterWindow() {
      this.template.querySelector(".item_list").classList.add("nds-hide");
   }

   mobileIsOpen() {
      this.template.querySelector(".item_list").classList.remove("nds-hide");
      this.template.querySelector(".nds-dropdown-trigger").classList.add("nds-is-open");
   }

   mobileClearFilters() {
      // clear filters in UI
      this.template.querySelector(".filter_WA").checked = false;

      if (this.dynamicCOE == true) {
         this.template.querySelector(".filter_COE").checked = false;
      }

      this.template.querySelector(".filter_accreditation").value = "All";

      // clear filters in backend
      this.resetFilterParams();

      //clear tags and filter by value in UI - only mobile
      this.countTags = 0;
      this.filterBy = this.template.querySelector(".filter_input").value = "Filter By";

      this.filterMobile();
   }

   filterMobile() {
      /**Filter Accreditation - IP Dynamic Accreditation value**/
      if (this.template.querySelector(".filter_accreditation").value != "All") {
         this.facilityParams.input.accreditation = this.template.querySelector(".filter_accreditation").value;
      } else {
         this.facilityParams.input.accreditation = "";
      }

      /**Filter Wheelchair - IP Dynamic Wheelchair value**/
      if (this.template.querySelector(".filter_WA").checked == true) {
         this.facilityParams.input.wheelchair = "true";
      } else {
         this.facilityParams.input.wheelchair = "";
      }

      /**Filter Center of Excellence - IP Dynamic COE value**/
      if (this.dynamicCOE == true) {
         if (this.template.querySelector(".filter_COE").checked == true) {
            this.facilityParams.input.coe = "true";
         } else {
            this.facilityParams.input.coe = "";
         }
      }
      this.goToFirstPage();
      this.getFacilities();
      this.mobileCloseFilterWindow();
   }
   /** Sort logic **/

   //Sort logic - Mobile
   mobileSortFocusIn() {
      this.template.querySelector(".item_list").classList.add("nds-hide");
      this.template.querySelector(".sort_list_mo").classList.remove("nds-hide");
      if (!this.selectedSortId) {
         this.sortShowBadge("B005M");
      } else {
         this.sortShowBadge(this.selectedSortId);
      }
   }

   mobileSortWindlowClose() {
      this.template.querySelector(".sort_list_mo").classList.add("nds-hide");
   }

   // Sort logic - Desktop
   sortFocusIn() {
      let sortId = this.selectedSortId;
      let sortDir = this.sortDirection;
      let selectedSort = this.selectedSort;

      if (!sortId) {
         this.sortShowBadge("B005");
      } else {
         this.sortShowBadge(this.selectedSortId);
      }
      this.template.querySelector(".sort_list").classList.remove("nds-hide");
   }

   sortWindlowClose() {
      this.template.querySelector(".sort_list").classList.add("nds-hide");
   }

   sortDefault(badgeId) {
      let defaultBadge = this.template.querySelector('[data-badge-id="' + badgeId + '"]');
      if (defaultBadge) {
         let sortId = defaultBadge.id;
         this.sortIdNum = sortId.substring(sortId.indexOf("-") + 1);
         let ascBadgeId = "#" + badgeId + "-ASC-" + this.sortIdNum;
         //Display ASC Badge
         this.template.querySelector(ascBadgeId).classList.remove("nds-hide");
      }
   }

   sortShowBadge(badgeId) {
      let badge = this.template.querySelector('[data-badge-id="' + badgeId + '"]');
      if (badge) {
         let sortId = badge.id;
         this.sortIdNum = sortId.substring(sortId.indexOf("-") + 1);
         let dirBadgeId;
         if (this.sortDirection) {
            dirBadgeId = "#" + badgeId + "-" + this.sortDirection + "-" + this.sortIdNum;
         } else {
            dirBadgeId = "#" + badgeId + "-ASC-" + this.sortIdNum;
         }
         //Display ASC Badge
         this.template.querySelector(dirBadgeId).classList.remove("nds-hide");
      }
   }

   sortAppendName() {
      if (this.selectedSort.indexOf(" ") > -1) {
         this.sortBy = "Sort By " + this.selectedSort.substring(0, this.selectedSort.indexOf(" "));
      } else {
         this.sortBy = "Sort By " + this.selectedSort;
      }
   }

   sortSelect(event) {
      let badgeId = event.target.getAttribute("id");
      if (badgeId.includes("M")) {
         this.mobileSortWindlowClose();
      } else {
         this.sortWindlowClose();
      }
      let badgeVal = event.target.getAttribute("data-badge-value");
      if (badgeVal) {
         this.selectedSort = event.target.getAttribute("data-badge-value");
         this.selectedSortId = event.target.getAttribute("data-badge-id");
         let sortId = event.target.id;
         this.sortIdNum = sortId.substring(sortId.indexOf("-") + 1);
         this.sortDirection = "ASC";
         //Append the fied name after Sort By.
         let badgeKey = event.target.getAttribute("data-badge-id");
         let ascBadgeId;
         if (this.sortIdNum.length > 0) {
            ascBadgeId = "#" + badgeKey + "-ASC-" + this.sortIdNum;
         } else {
            ascBadgeId = "#" + badgeKey + "-ASC";
         }

         //All badges need to be hiddend
         Array.from(this.template.querySelectorAll(".nds-badge")).forEach((element) => {
            if (element.id) {
               element.classList.add("nds-hide");
            }
         });
         //Display ASC Badge
         this.template.querySelector(ascBadgeId).classList.remove("nds-hide");
         this.updateSortFields();
         this.sortApply();
      }
   }

   sortToggle(event) {
      let evtBadgeId = event.target.getAttribute("id");
      if (evtBadgeId) {
         let badgeKey = evtBadgeId.substring(0, evtBadgeId.indexOf("-"));
         let ascBadgeId;
         let descBadgeId;
         if (this.sortIdNum.length > 0) {
            ascBadgeId = "#" + badgeKey + "-ASC-" + this.sortIdNum;
            descBadgeId = "#" + badgeKey + "-DESC-" + this.sortIdNum;
         } else {
            ascBadgeId = "#" + badgeKey + "-ASC";
            descBadgeId = "#" + badgeKey + "-DESC";
         }
         //Toggle
         if (evtBadgeId.indexOf("ASC") > -1) {
            this.template.querySelector(ascBadgeId).classList.add("nds-hide");
            this.template.querySelector(descBadgeId).classList.remove("nds-hide");
            this.sortDirection = "DESC";
         } else {
            this.template.querySelector(ascBadgeId).classList.remove("nds-hide");
            this.template.querySelector(descBadgeId).classList.add("nds-hide");
            this.sortDirection = "ASC";
         }
         this.selectedSortId = badgeKey;
         //Apply
         this.updateSortFields();
         this.sortApply();
      }
   }

   sortApply() {
      //Will call the dynamic API
      let sortbyField;
      let sortOrder = this.sortDirection.toLowerCase();
      let sortId = this.selectedSortId;
      switch (this.selectedSort) {
         case "Name A-Z":
            this.sortBy = "Name A-Z";
            sortbyField = "providerFullName.normalize";
            break;
         case "Name Z-A":
            this.sortBy = "Name Z-A";
            sortbyField = "providerFullName.normalize";
            sortOrder = sortOrder === "desc" ? "asc" : "desc";
            break;

         default:
            this.sortBy = "Distance - Closest";
            sortbyField = "";
      }

      this.facilityParams.input.order = sortOrder;
      this.facilityParams.input.sortByField = sortbyField;
      this.goToFirstPage();
      this.getFacilities();
   }

   updateSortFields() {
      var sortData = { selectedSort: this.selectedSort, selectedSortId: this.selectedSortId, sortDirection: this.sortDirection };
      this.omniApplyCallResp(sortData);
   }

   resetSortParams() {
      //Reseting Sort
      this.facilityParams.input.from = "0";
      this.facilityParams.input.order = "";
      this.facilityParams.input.sortByField = "";
      this.selectedSort = "";
      this.selectedSortId = "";
      this.sortDirection = "ASC";
      this.sortIdNum = "";
   }

   resetFilterParams() {
      //Reseting Filter
      this.facilityParams.input.wheelchair = "";
      this.facilityParams.input.coe = "";
      this.facilityParams.input.accreditation = "";
   }

   handleViewSelect(evt) {
      this.selectedViewNumber = evt.target.value;
      this.facilityParams.input.size = this.selectedViewNumber;
      this.goToFirstPage();
      this.getFacilities();
   }

   handleViewSelectCombo(evt) {
      this.selectedViewNumber = evt.detail.value;
      this.facilityParams.input.size = this.selectedViewNumber;
      this.goToFirstPage();
      this.getFacilities();
   }

   handleNewPage(evt) {
      this.facilityParams.input.from = evt.detail.from;
      this.pagerFirstEle = evt.detail.from;
      this.getFacilities();
   }

   goToDetails(evt) {
      if (evt) {
         //Set selected facility Id
         const facId = evt.target.getAttribute("data-btn-id");
         var facRecord = this.facilities.find((facility) => facility.facetsProviderId === facId);
         var facilityNode = { selectedFacility: facRecord };
         let FHN = { isFHN: facRecord.FHN };
         this.omniApplyCallResp(FHN);
         this.omniApplyCallResp(facilityNode);
         this.omniNextStep();
      }
   }

   handleMapToggle(evt) {
      this.showMap = evt.target.checked;
      evt.target.setAttribute("aria-checked", evt.target.checked);
   }

   handleMapMarkerSelect(event) {
      this.selectedMapMarkerValue = event.detail.selectedMarkerValue;
      let filteredFacility = this.facilitiesTracked.filter((facility) => {
         return facility.facetsProviderId == this.selectedMapMarkerValue;
      });
      this.pinnedFacilityFullName = filteredFacility[0].providerFullName;
      this.pinDetailDirLink = filteredFacility[0].directionsUrl;
      this.pinDetailPhone = filteredFacility[0].Phone;
      this.pinDetailPhoneLink = `tel:${this.pinDetailPhone}`;
      let selectedFacility = this.template.querySelector(`[data-target-id="${this.selectedMapMarkerValue}"]`);
      selectedFacility.focus();
      this.openMapDetail = true;
   }

   // reset to empty
   handleClosePinDetail() {
      this.openMapDetail = false;
      this.pinnedFacilityFullName = "";
      this.pinnedFacilityTitle = "";
      this.pinDetailDirLink = "";
      this.pinDetailPhone = "";
      this.pinDetailPhoneLink = "";
   }

   handleMapMarkerSelected(evt) {
      let selectedFacility = this.template.querySelector(`[data-target-id="${evt.detail}"]`);
      selectedFacility.focus();
   }

   // set map markers
   setMapMarkers() {
      this.isMapLoading = true;
      // filter through facilitiesTracked list
      // then push an obj with the locationObj, title, descrip, value, color to mapMarkers array
      this.mapMarkers = this.facilitiesTracked.reduce((result, facility) => {
         // if no valid Id, return
         if (!facility.facetsProviderId) {
            return result;
         }
         // deconstruct address from facility
         const { facilityAddress: address } = facility;
         // split the coordinates if geoPoint is not 0,0, otherwise []
         const coords = address.geoPoint != "0,0" ? address.geoPoint.split(",") : [];
         // if addressLine2 is true, concatenate line1+line2 for fullstreet address
         const fullStreet = address.addressLine2 ? `${address.addressLine1}, ${address.addressLine2}` : address.addressLine1;
         // create locationObj with

         const locationObj = {
            Street: fullStreet,
            City: address.city,
            State: address.state,
            PostalCode: address.zip.slice(0, 5),
         };
         // if coords is not an empty array, add locationObj lat + long
         if (coords.length > 0) {
            locationObj["Latitude"] = coords[0];
            locationObj["Longitude"] = coords[1];
         }
         // push new facility details obj with location, title, descrip, value
         result.push({
            location: locationObj,
            title: `${facility.providerFullName}`,
            description: `${fullStreet}</br>${address.city}, ${address.state}</br>${address.zip.slice(0, 5)}`,
            value: facility.facetsProviderId,
            fillColor: "#A32BAA",
         });
         return result;
      }, []);

      this.isMapLoading = false;
   }

   openFacilityComparison() {
      this.facJsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      // this.modalFacilityComparison = true;
      if (Object.prototype.hasOwnProperty.call(this.facJsonData, "facilitiesToCompare")) {
         this.facilitiesToCompare = this.facJsonData.facilitiesToCompare;

         if (this.facilitiesToCompare.length >= 2) {
            this.loading = true;
            let facilityId = [];
            this.facilitiesToCompare.forEach((f) => {
               facilityId.push(f.facilityId);
            });

            facilityId = facilityId.toString();
            facilityId = facilityId.replace(/,/g, ", ");

            let planType = this.facJsonData.SelectedPlanInfo.brand;
            let inputParam = { facilityId: facilityId, planType: planType };
            const params = {
               input: inputParam,
               sClassName: "omnistudio.IntegrationProcedureService",
               sMethodName: "Member_compareFacilities",
               options: "{}",
            };

            //Call out the Member_ProviderDetails IP
            this.omniRemoteCall(params, true)
               .then((response) => {
                  if (response.result.IPResult) {
                     let facilityInfoArray = response.result.IPResult;
                     this.facilityComparison = [...facilityInfoArray];
                     this.modalFacilityComparison = true;

                     this.facilityComparison.forEach((facility) => {
                        if (Array.isArray(facility)) {
                           facility.address = facility.facilityaddress[0];
                        } else {
                           facility.address = facility.facilityaddress;
                        }
                        facility.zip = facility.address.zip;

                        if (facility.zip !== undefined && facility.zip !== null && facility.zip !== "") {
                           facility.zip = facility.zip.substring(0, 5);
                        }

                        //  Format Phone Number
                        if (facility.address.provAddressContact.phone === undefined || facility.address.provAddressContact.phone == null || facility.address.provAddressContact.phone === "") {
                           facility.phone = " ";
                        } else {
                           facility.phone =
                              facility.address.provAddressContact.phone.substring(0, 3) +
                              "-" +
                              facility.address.provAddressContact.phone.substring(3, 6) +
                              "-" +
                              facility.address.provAddressContact.phone.substring(6, 10);
                        }
                     });
                  } else {
                     console.error(`${this.errorMessage} Member_compareFacilities`);
                  }
                  this.loading = false;
               })
               .catch((error) => {
                  console.error("error", error);
                  this.loading = false;
               });
         }
      }
   }

   handleComparision(evt) {
      const provId = evt.target.value;
      if (evt.target.checked) {
         this.addToCompare(provId);
      } else {
         this.removeFromCompare(provId);
      }
   }

   addToCompare(provId) {
      if (provId) {
         this.addFacility(provId);
      }
   }

   removeFromCompare(provId) {
      if (provId) {
         this.removeFacility(provId);
      }
   }

   addFacility(provId) {
      //Filtering only selcted Provider
      let facComp = this.facilities.find((facility) => facility.facetsProviderId === provId);
      if (this.facilitiesToCompare.length < 3) {
         this.facilitiesToCompare.push({ facilityId: facComp.facetsProviderId, name: facComp.providerFullName, label: "Remove " + facComp.providerFullName + " from comparison" });
         let facToCom = { facilitiesToCompare: this.facilitiesToCompare };
         this.omniApplyCallResp(facToCom);
         this.facilitiesAmount++;
         this.compareFacilities = true;
         facComp.added = true; // For the facility select, change the button label
         this.facilityCount = this.facilitiesToCompare.length;
         if (this.facilitiesToCompare.length >= 2) {
            this.disableCompareButton = false;
         }
         if (this.facilitiesToCompare.length === 3) {
            this.facilities.forEach((facility) => {
               if (facility.added) {
                  facility.isBtnDisabled = false;
               } else {
                  facility.isBtnDisabled = true;
               }
            });
         }
         this.showCompareFooter = true;
      } else {
      }
      let viewPCPUpdate = { viewPCPUpdate: "Yes", viewProviderDetails: "No", viewMutlipleOffice: "No" };
      this.omniApplyCallResp(viewPCPUpdate);
   }

   removeFacility(provId2) {
      let facComp = this.facilities.find((provider) => provider.facetsProviderId === provId2);

      if (this.facilitiesToCompare.length != 0) {
         for (let r = 0; r < this.facilitiesToCompare.length; r++) {
            if (this.facilitiesToCompare[r].facilityId === provId2) {
               this.facilitiesToCompare.splice(r, 1);

               let facToCom = { facilitiesToCompare: this.facilitiesToCompare };
               this.omniApplyCallResp(facToCom);
               if (facComp) {
                  facComp.added = false; // Set original label for specific button
               }
               this.facilityCount = this.facilitiesToCompare.length;
            }
         }
         if (this.facilitiesToCompare.length < 2) {
            this.disableCompareButton = true;
         }
         //enable button
         this.facilities.forEach((facility) => {
            facility.isBtnDisabled = false;
         });
         //close footer
         if (this.facilitiesToCompare.length == 0) {
            this.showCompareFooter = false;
         }
      } else {
      }
   }

   handleRemoveCompare(event) {
      let facilityId = event.currentTarget.dataset.facilityid;
      if (this.facilitiesToCompare.length > 1) {
         this.removeFacility(facilityId);
      } else if (this.facilitiesToCompare.length == 1) {
         this.removeFacility(facilityId);
         this.facilitiesToCompare = [];
         this.showCompareFooter = false;
      }
   }

   removeAllComparison() {
      let arrayLength = this.facilitiesToCompare.length;
      for (let i = 0; i < arrayLength; i++) {
         let facilityId = this.facilitiesToCompare[0].facilityId;
         this.removeFacility(facilityId);
      }
      this.facilitiesToCompare = [];
      this.showCompareFooter = false;
   }

   closeModalFacilityComparison() {
      this.modalFacilityComparison = false;
      this.loading = false;
   }

   goToLocation(evt) {
      if (evt) {
         this.omniPrevStep();
      }
   }
   goToChooseFacilityType(evt) {
      if (evt) {
         this.omniNavigateTo("STEP_ChooseFacilityType");
      }
   }
}
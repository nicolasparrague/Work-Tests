import { LightningElement, track, api } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import { NavigationMixin } from "lightning/navigation";
import { getPagesOrDefault, handlePagerChanged } from "c/pagerUtils";

export default class ProviderResultsLWC extends OmniscriptBaseMixin(NavigationMixin(LightningElement)) {
   // Variables
   @track medicalgroups = [];
   @track showmedicalgroup;
   errorMessage = "Error --> No data returned from IP";
   @track showNotPreferredmodalMessage = false;
   @track provIdforPCPModal;
   @track planNetworkcode;
   @track modalMessage;
   @track showAttentisPreferredmessage = false;
   activeSectionName = ["RefineSearchResults"];
   activeSectionName = ["b"];
   allow = "true";
   clickedButtonLabel;
   countProv = null;
   compareTitle = "Compare";
   loading = true;
   exist = false;
   userZipCode = "";
   numOfRetry = 0;
   maxOfRetry = 2;
   bronxModal = false;
   redirectMessage;
   allowACPNYRedirect = false;
   allowBronxDocsRedirect = false;
   bronxCompanyName;
   tenantId;
   productBrandGrouping;
   messageCompare;
   messageCancel;
   isPublic = false;
   isPublicHome = false;
   isPublicPlan = false;
   portalType;
   _currentlyVisible = [];
   getPagesOrDefault = getPagesOrDefault.bind(this);
   handlePagerChanged = handlePagerChanged.bind(this);

   //Compare Related
   @track providersToCompare = [];
   @track providerComparison = [];
   get isCompareDisabled() {
      return this.providersToCompare.length > 1 ? false : true;
   }
   showCompareFooter = false;
   @api
   get currentlyVisible() {
      const pages = this.getPagesOrDefault();
      return pages.length === 0 ? this._currentlyVisible : pages;
   }
   set currentlyVisible(value) {
      this._currentlyVisible = value;
   }
   handleClick(event) {
      this.clickedButtonLabel = event.target.label;
   }
   // Used for selectProvidersLWC
   @track providers = [];
   @track providersTracked = [];
   @track providersAmount;
   noElementsMsg = false;
   systemErrorMsg = false;
   noElementsAfterFilter = false;
   refinedSearchfilter = true;
   elementsToDisplayMobile = false;
   elementsLoaded = false;
   displayfullName = false;

   // Parameters for getting providers, can be changed by paginator/sorting/filters
   fieldParam = {
      fieldToSave: "",
      fieldValue: "",
   };

   @track paramsLanguage = {
      input: {},
      sClassName: "omnistudio.IntegrationProcedureService",
      sMethodName: "Member_Languages",
      options: "{}",
   };
   @track paramsMedicalGroups = {
      input: {},
      sClassName: "omnistudio.IntegrationProcedureService",
      sMethodName: "Member_medicalGroup",
      options: "{}",
   };

   @track providerParams = {
      input: {},
      sClassName: "omnistudio.IntegrationProcedureService",
      sMethodName: "Member_findDoctor",
      options: "{}",
   };

   @track paramsHospital = {
      input: {},
      sClassName: "omnistudio.IntegrationProcedureService",
      sMethodName: "Member_HospitalAffiliations",
      options: "{}",
   };

   attentisCompass;
   currentPCPName = "";
   provInfoBrand = null;
   provBusinessUnit = null;
   provJsonData = null;
   totalProviderNum = 0;
   pagerFirstEle = 0;
   fullName = "";

   //Diplay green dot or red square based on the variables below
   acceptNewProv = false;
   notNewPatients = false;
   memberInfo;
   @track pcpInfo = [];
   @track memberInPlan = [];

   //used for dynamic filters: VirtualCareProvider/COE/Preferred
   dynamicVCP = false;
   dynamicCOE = false;
   dynamicPreferred = false;

   // Use these variables for...
   speciallity = null;
   distanceFrom = null;
   @track formattedDistanceFrom = null;
   providerPlanAccepted = null;
   acceptsNewPatients = false;

   // Additional variables to hide and show icons
   isWheelchairAccessible = false;
   isPrimaryCareProvider = false;
   acpny = false;
   isPreferred = false;
   hasMultipleLoc = false;
   hasEyewearDis = false;

   // Varibale to show or hide choose as pcp link
   chooseAsPCPLink = null;

   @track accepNewPat;

   //for language, hospital IP's
   @track languages = [];
   @track hospitalAff = [];
   @track isLanguage = [];
   countTags = 0;
   selectedLanguageFilter = "All";
   @track setLanguageFilter = "";

   // for Hospital Affiliation
   selectedHospitalAffFilter = "All";
   selectedMedicalFilter = "";

   modalProviderComparison = false;
   compareProviders = false;
   providersAmount = 0;
   compareThreeProviders = "";

   // Compare Providers
   addressLine1 = "";
   addressLine2 = "";
   city = "";
   state = "";
   zip = "";
   wheelchair = "";
   virtualCareProvider = "";
   education = "";
   boardCert = "";
   planAc = "";
   language = "";
   loading = false;
   added = false;
   multipleLan = "";
   multipleHos = "";
   value = "";
   key = "";

   noHours = "";
   mondayClosed = true;
   mondayFrom = 0;
   mondayTo = "";
   tuesdayClosed = true;
   tuesdayFrom = 0;
   tuesdayTo = "";
   wednesdayClosed = "";
   wednesdayFrom = 0;
   wednesdayTo = "";
   thursdayClosed = "";
   thursdayFrom = 0;
   thursdayTo = "";
   fridayClosed = "";
   fridayFrom = 0;
   fridayTo = "";
   saturdayClosed = "";
   saturdayFrom = 0;
   saturdayTo = "";
   sundayClosed = "";
   sundayFrom = 0;
   sundayTo = "";

   @track hospitalAff = [];
   @track languagesProviderComparison = [];

   // For use by the map
   @track showMap = false;
   @track mapMarkers = [];
   @track selectedMapMarkerValue;
   @track isMapLoading = true;
   @track zoomLevel = 12;
   @track pinnedProviderFullName = "";
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

   @track selectedViewNumber = 10;
   @track viewOptions = [
      { label: "5", value: 5 },
      { label: "10", value: 10 },
      { label: "25", value: 25 },
      { label: "50", value: 50 },
   ];

   //Filter
   filterBy = "Filter By";
   selectedGender = "Either";

   //Sort
   sortByMo = "Sort By";
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
         key: "B003",
         ascBadgeId: "B003-ASC",
         descBadgeId: "B003-DESC",
         value: "Specialty A-Z",
      },
      {
         key: "B004",
         ascBadgeId: "B004-ASC",
         descBadgeId: "B004-DESC",
         value: "Specialty Z-A",
      },
      {
         key: "B005",
         ascBadgeId: "B005-ASC",
         descBadgeId: "B005-DESC",
         value: "Accepting New Patients",
      },
      {
         key: "B006",
         ascBadgeId: "B006-ASC",
         descBadgeId: "B006-DESC",
         value: "ACPNY",
      },
      {
         key: "B007",
         ascBadgeId: "B007-ASC",
         descBadgeId: "B007-DESC",
         value: "Distance - Closest",
      },
      {
         key: "B008",
         ascBadgeId: "B008-ASC",
         descBadgeId: "B008-DESC",
         value: "BronxDocs",
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
         key: "B003M",
         ascBadgeId: "B003M-ASC",
         descBadgeId: "B003M-DESC",
         value: "Specialty A-Z",
      },
      {
         key: "B004M",
         ascBadgeId: "B004M-ASC",
         descBadgeId: "B004M-DESC",
         value: "Specialty Z-A",
      },
      {
         key: "B005M",
         ascBadgeId: "B005M-ASC",
         descBadgeId: "B005M-DESC",
         value: "Accepting New Patients",
      },
      {
         key: "B006M",
         ascBadgeId: "B006M-ASC",
         descBadgeId: "B006M-DESC",
         value: "ACPNY",
      },
      {
         key: "B007M",
         ascBadgeId: "B007M-ASC",
         descBadgeId: "B007M-DESC",
         value: "Distance - Closest",
      },
      {
         key: "B008M",
         ascBadgeId: "B008M-ASC",
         descBadgeId: "B008M-DESC",
         value: "BronxDocs",
      },
   ];

   //FHN
   @track fhn = "";

   get getMapToggleClass() {
      let toggleclass = "nds-grid nds-grid_align-end  nds-show_medium nds-m-vertical_x-small nds-medium-size_3-of-12";
      if (this.displayfullName) {
         toggleclass = toggleclass + " nds-large-size_5-of-12";
      } else {
         toggleclass = toggleclass + " nds-large-size_7-of-12";
      }
      return toggleclass;
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

   get mapMarginClass() {
      if (document.documentElement.clientWidth < 768) {
         return "";
      }
      return "nds-m-right_none";
   }

   get showMobileMapDetails() {
      return document.documentElement.clientWidth < 768 && this.openMapDetail ? true : false;
   }

   renderedCallback() {
      var me = this;
      this.setPageView();
      this.setFilterValue();
      this.setFilterValueMobile();

      //Close the Sort Combo list when user clicks outside of the Sort Combo.
      this.template.addEventListener("click", function (evt) {
         let targetElementId = evt.target.id; // clicked element
         //Sort Combo for desktop
         let isSortHidden = me.template.querySelector(".sort_list").classList.contains("nds-hide");
         if (!targetElementId.includes("sort_combo") && !isSortHidden) {
            me.sortWindlowClose();
         }
         //Language Filter for desktop
         if (!targetElementId.includes("lang_combo")) {
            if (me.template.querySelector("c-provider-language-multi-select")) {
               me.template.querySelector("c-provider-language-multi-select").closeList();
            }
         }
         //Hospital Affiliation Filter for desktop
         if (!targetElementId.includes("hosp_affil_combo")) {
            if (me.template.querySelector("c-member-search-hospital-affiliation")) {
               me.template.querySelector("c-member-search-hospital-affiliation").closeList();
            }
         }
         //Medical Group Filter for desktop
         if (!targetElementId.includes("medical_group_combo" && this.showmedicalgroup)) {
            if (me.template.querySelector("c-member-search-medical-group")) {
               me.template.querySelector("c-member-search-medical-group").closeList();
            }
         }
      });

      //Modal Focus - Start
      const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), table, thead, tr, th';
      const modal = this.template.querySelector(".modalAccessibility");

      if (modal != undefined) {
         const firstFocusableElement = modal.querySelectorAll(focusableElements)[0]; // get first element to be focused inside modal
         const focusableContent = modal.querySelectorAll(focusableElements);
         const lastFocusableElement = focusableContent[focusableContent.length - 1]; // get last element to be focused inside modal

         window.addEventListener("keydown", function (event) {
            // modal.addEventListener('focus', function(event) {
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
            if (event.keyCode === 27 || event.key === "Escape") {
               me.stayInSelectProv();
            }
         });
      } //Modal Focus - End
   }

   setPageView() {
      if (this.selectedViewNumber) {
         let pageview = this.template.querySelector(".pageview");
         if (pageview) {
            pageview.value = this.selectedViewNumber;
         }
      }
   }

   connectedCallback() {
      this.initCall();
   }

   async initCall() {
      //Get Json Data
      this.provJsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      console.log("provJsonData 1", this.provJsonData);

      let jsonDataPR = this.provJsonData;
      this.tenantId = jsonDataPR.tenantId;
      this.productBrandGrouping = jsonDataPR.SelectedPlanInfo.productBrandGrouping;

      if (jsonDataPR.isPublic != undefined && jsonDataPR.isPublic) {
         this.isPublic = true;
         if (jsonDataPR.publicPage && jsonDataPR.publicPage == "Home") {
            this.isPublicHome = true;
         } else if (jsonDataPR.publicPage && jsonDataPR.publicPage == "Plan") {
            this.isPublicPlan = true;
         }
      } else {
         this.isPublic = false;
      }

      this.bronxCompanyName = "myAttentisHealth";
      this.showmedicalgroup = true;
      this.attentisCompass = true;

      this.pcpInfo = jsonDataPR.PCPInfo;
      this.memberInfo = jsonDataPR.MemberInfo;
      this.memberInPlan = jsonDataPR.MembersInPlan;

      this.selectedSort = jsonDataPR.selectedSort;
      this.selectedSortId = jsonDataPR.selectedSortId;
      this.sortDirection = jsonDataPR.sortDirection;

      if (Object.prototype.hasOwnProperty.call(this.provJsonData, "filterBy")) {
         this.filterBy = jsonDataPR.filterBy;
      }

      if (Object.prototype.hasOwnProperty.call(this.provJsonData, "selectedGender")) {
         this.selectedGender = jsonDataPR.selectedGender;
      }

      let tenantId = jsonDataPR.tenantId;
      let navigateFrom = jsonDataPR.navigateFrom;
      let ServiceType = jsonDataPR.ServiceType;
      let distance = jsonDataPR.distance;

      let zipCode;
      let lastName;
      let firstName;
      let networkCode;

      if (this.isPublic) {
         zipCode = jsonDataPR.zipCodePublic ? jsonDataPR.zipCodePublic : jsonDataPR.zipCode;
         lastName = jsonDataPR.lastNamePublic ? jsonDataPR.lastNamePublic : jsonDataPR.lastName;
         firstName = jsonDataPR.firstNamePublic ? jsonDataPR.firstNamePublic : jsonDataPR.firstName;
         this.distanceFrom = jsonDataPR.distanceMilesPublic ? jsonDataPR.distanceMilesPublic : "5mi";
         if (jsonDataPR.fhn) {
            this.fhn = "Y";
         } else {
            this.fhn = "";
         }
         networkCode = jsonDataPR.networkCode;
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
            console.log("networkCode multi1", networkCodeStr);
            networkCode = networkCodeStr;
            console.log("networkCode multi2", networkCode);
         }
      } else {
         zipCode = jsonDataPR.zipCode;
         lastName = jsonDataPR.lastName ? jsonDataPR.lastName : "";
         firstName = jsonDataPR.firstName ? jsonDataPR.firstName : "";
         this.distanceFrom = jsonDataPR.STEP_ChooseLocation.SEL_Distance;
         networkCode = jsonDataPR.SelectedPlanInfo.networkCode;
         // Set plan accepted for every provider
         this.providerPlanAccepted = this.provJsonData.MemberInfo.planName;
      }

      this.userZipCode = zipCode;
      this.fullName = `${firstName} ${lastName}`;

      let planType = jsonDataPR.SelectedPlanInfo.brand ? jsonDataPR.SelectedPlanInfo.brand : this.portalType;
      let planId = jsonDataPR.SelectedPlanInfo.planId ? jsonDataPR.SelectedPlanInfo.planId : "";
      let networkId = jsonDataPR.SelectedPlanInfo.networkId ? jsonDataPR.SelectedPlanInfo.networkId : "";

      let providerSpeciality = jsonDataPR.providerSpeciality;
      if (this.fullName != " ") {
         this.displayfullName = true;
      }

      this.planNetworkcode = jsonDataPR.SelectedPlanInfo.networkCode;
      if (this.planNetworkcode == "2T02" || this.planNetworkcode == "2T03") {
         this.showAttentisPreferredmessage = true;
      }

      // Set zoom level for map based on distance
      this.zoomLevel = this.zoomLevelMapping[distance];

      //for language and hospital IP's
      this.provInfoBrand = jsonDataPR.SelectedPlanInfo.brand;
      this.provBusinessUnit = jsonDataPR.SelectedPlanInfo.businessUnit;

      //Set Input for the Member_Languages IP
      let inputParamLanguage = { brand: this.provInfoBrand };
      this.paramsLanguage.input = inputParamLanguage;
      this.getLanguages();

      //Set Input for the Member_HospitalAffiliations IP
      let busUnit;
      if (this.provInfoBrand === "Attentis") {
         busUnit = "CC";
      } else {
         busUnit = this.provBusinessUnit;
      }
      let inputParamHospital = { brand: this.provInfoBrand, businessUnit: busUnit };
      this.paramsHospital.input = inputParamHospital;
      this.getHospitalAffiliations();

      // Set Speciallity
      this.speciallity = this.provJsonData.selectedSpeciality;

      this.setDistanceFrom();

      if (ServiceType === "Chiropractor") {
         providerSpeciality = "Chiropractic";
      }
      // If running on mobile, default to 5 per page
      let viewNumber = this.selectedViewNumber;
      if (document.documentElement.clientWidth < 768) {
         viewNumber = 5;
      }

      if (Array.isArray(jsonDataPR.ServiceTypeInfo)) {
         for (var j = 0; j < jsonDataPR.ServiceTypeInfo.length; j++) {
            if (jsonDataPR.ServiceTypeInfo[j].fhnMember == "Yes" && jsonDataPR.ServiceTypeInfo[j].status == "Active" && jsonDataPR.ServiceTypeInfo[j].defaultPlan == "Y") {
               this.sendFHN = true;
               this.fhn = "Y";
            }
         }
      }

      // Set Input parameter for the FindDoctor IP
      if (Object.prototype.hasOwnProperty.call(this.provJsonData, "providerParams")) {
         this.providerParams = this.provJsonData.providerParams;
         //Check if user go back and change value
         if (this.provJsonData.providerParams.input.firstName !== firstName) {
            this.providerParams.input.firstName = firstName;
         }
         if (this.provJsonData.providerParams.input.lastName !== lastName) {
            this.providerParams.input.lastName = lastName;
         }
         if (this.provJsonData.providerParams.input.zipCode !== zipCode) {
            this.providerParams.input.zipCode = zipCode;
         }
         if (this.provJsonData.providerParams.input.distance !== distance) {
            this.providerParams.input.distance = distance;
         }
         if (this.provJsonData.providerParams.input.ServiceType !== ServiceType) {
            this.providerParams.input.ServiceType = ServiceType;
         }
         if (this.provJsonData.providerParams.input.providerSpeciality !== providerSpeciality) {
            this.providerParams.input.providerSpeciality = providerSpeciality;
         }
         if (navigateFrom !== "SelectProvider") {
            //Reseting Page No
            this.providerParams.input.from = 0;
            this.provJsonData.providerParams.input.from = 0;
            //Reseting Page View Number
            if (document.documentElement.clientWidth < 768) {
               viewNumber = 5;
            } else {
               this.selectedViewNumber = 10;
               viewNumber = 10;
            }
            this.providerParams.input.size = viewNumber;
            this.provJsonData.providerParams.input.size = viewNumber;
            //Reseting Sort
            this.resetSortParams();
            //Reseting Filter
            this.resetFilterParams();
         }
         this.pagerFirstEle = this.provJsonData.providerParams.input.from;
         this.selectedViewNumber = this.provJsonData.providerParams.input.size;
      } else {
         let inputParam = {
            lastName: lastName,
            tenantId: tenantId,
            planId: planId,
            planType: planType,
            firstName: firstName,
            ServiceType: ServiceType,
            networkId: networkId,
            networkCode: networkCode,
            distance: distance,
            zipCode: zipCode,
            providerSpeciality: providerSpeciality,
            from: this.pagerFirstEle,
            size: viewNumber,
            fhn: this.fhn,
         };
         this.providerParams.input = inputParam;
      }
      //console.log("providerParams", JSON.stringify(this.providerParams));

      console.log("provJsonData 2 ", this.provJsonData);
      await this.getProviders();

      if (Array.isArray(this.providers) && this.totalProviderNum < 10) {
         this.noElementsMsg = false;
         this.distanceFrom = "50mi";
         //update dataJson with new distance
         let chooseLocation = {
            distance: this.distanceFrom,
            STEP_ChooseLocation: {
               FML_Zipcode5Len: true,
               MSG_ValidZipcode: null,
               SEL_Distance: this.distanceFrom,
               TXT_ZipCode: zipCode,
            },
         };
         this.omniApplyCallResp(chooseLocation);

         //Call getProviders with new distance (50mi)
         this.setDistanceFrom();
         this.providerParams.input.distance = this.distanceFrom;
         this.getProviders();
      }

      let inputParamMedicalGroups = {
         ACPNY: "",
         ServiceType: jsonDataPR.ServiceType,
         acceptingNewPatients: "",
         coe: "",
         distance: jsonDataPR.distance,
         firstName: jsonDataPR.firstName,
         from: "",
         gender: jsonDataPR.selectedGender,
         hospitalAffiliation: "",
         language: "",
         lastName: jsonDataPR.lastName,
         networkCode: networkCode,
         networkId: jsonDataPR.networkId,
         planId: jsonDataPR.planId,
         planType: jsonDataPR.SelectedPlanInfo.brand,
         preferredOnly: "",
         providerFullName: this.fullName,
         providerAriaLabel: this.ariaLabel,
         providerSpeciality: jsonDataPR.providerSpeciality,
         size: "",
         tenantId: jsonDataPR.tenantId,
         virtualCareProvider: "",
         wheelchair: "",
         zipCode: jsonDataPR.zipCode,
         homelessShelter: "",
      };
      this.paramsMedicalGroups.input = inputParamMedicalGroups;
      if (jsonDataPR.tenantId == "Attentis") {
         this.getMedicalGroups();
      }

      //Accessibility
      if (jsonDataPR.selectedFacilityType == "") {
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
   setDistanceFrom() {
      this.formattedDistanceFrom = this.distanceFrom.slice(0, this.distanceFrom.length - 2);
      if (this.formattedDistanceFrom == "1") {
         this.formattedDistanceFrom = this.formattedDistanceFrom + " mile";
      } else {
         this.formattedDistanceFrom = this.formattedDistanceFrom + " miles";
      }
   }

   getLanguages() {
      return this.omniRemoteCall(this.paramsLanguage, true)
         .then((response) => {
            if (response.result.IPResult) {
               if (Object.prototype.hasOwnProperty.call(response.result.IPResult, "success") && response.result.IPResult.success === false) {
                  if (this.numOfRetry < this.maxOfRetry) {
                     this.numOfRetry++;
                     this.getLanguages();
                  }
               } else {
                  //Callout was succesful
                  let LanguageArray = response.result.IPResult;
                  this.languages = LanguageArray;
               }
            } else {
               console.error(`${this.errorMessage} Member_Languages`);
               this.loading = false;
            }
         })
         .catch((error) => {
            console.error("error", error);
            this.loading = false;
         });
   }
   getMedicalGroups() {
      return this.omniRemoteCall(this.paramsMedicalGroups, true)
         .then((response) => {
            if (response.result.IPResult) {
               if (Object.prototype.hasOwnProperty.call(response.result.IPResult, "success") && response.result.IPResult.success === false) {
                  if (this.numOfRetry < this.maxOfRetry) {
                     this.numOfRetry++;
                     this.getMedicalGroups();
                  }
               } else {
                  //Callout was succesful
                  this.medicalgroups = response.result.IPResult;
               }
            } else {
               console.error(`${this.errorMessage} Member_medicalGroup`);
               this.loading = false;
            }
         })
         .catch((error) => {
            console.error("error", error);
            this.loading = false;
         });
   }

   getHospitalAffiliations() {
      return this.omniRemoteCall(this.paramsHospital, true)
         .then((response) => {
            if (response.result.IPResult) {
               if (Object.prototype.hasOwnProperty.call(response.result.IPResult, "success") && response.result.IPResult.success === false) {
                  if (this.numOfRetry < this.maxOfRetry) {
                     this.numOfRetry++;
                     this.getHospitalAffiliations();
                  }
               } else {
                  //Callout was succesful
                  let HospitalArray = response.result.IPResult;
                  this.hospitalAff = HospitalArray;
               }
            } else {
               console.error(`${this.errorMessage} Member_HospitalAffiliations`);
               this.loading = false;
            }
         })
         .catch((error) => {
            console.error("error", error);
            this.loading = false;
         });
   }

   async callFindDocIP(inputParam) {
      let response = await this.omniRemoteCall(inputParam, true);
      if (response.result.IPResult) {
         let providerResultsArray = response.result.IPResult;
         this.totalProviderNum = providerResultsArray.totalRecords;
         return response;
      } else {
         console.error(`${this.errorMessage} Member_findDoctor`);
         this.loading = false;
      }
   }

   async getProviders() {
      this.loading = true;
      this.providersTracked = [];
      this.systemErrorMsg = false;
      this.elementsLoaded = false;
      console.log("providerParams on getProviders: ", this.providerParams);
      let response = await this.callFindDocIP(this.providerParams);
      console.log("response on getProviders: ", response);
      console.log("cc--");
      try {
         if (response.result.IPResult && Object.prototype.hasOwnProperty.call(response.result.IPResult, "totalRecords")) {
            let providerResultsArray = response.result.IPResult;
            this.totalProviderNum = providerResultsArray.totalRecords;
            this.providers = providerResultsArray.providerList;
            this.loading = false;

            if (Array.isArray(this.providers) && this.totalProviderNum > 0) {
               if (this.providers.length === 1) {
                  this.providers.forEach((provider) => {
                     if (!provider.ProviderId) {
                        this.noElementsMsg = true;
                        if (this.refinedSearchfilter == true) {
                           this.noElementsAfterFilter = true;
                           this.refinedSearchfilter = false;
                        }
                        this.elementsLoaded = false;
                        this.elementsToDisplayMobile = false;
                        this.resetFilterParams();
                     } else {
                        this.noElementsMsg = false;
                        this.noElementsAfterFilter = false;
                        this.elementsToDisplayMobile = true;
                        this.elementsLoaded = true;
                        provider.directionsUrl = this.getEncodedAddr(provider);
                     }
                  });
               } else if (this.providers.length > 1) {
                  this.noElementsMsg = false;
                  this.noElementsAfterFilter = false;
                  this.elementsToDisplayMobile = true;
                  this.elementsLoaded = true;
                  this.providers.forEach((provider) => {
                     if (provider.ProviderId) {
                        provider.directionsUrl = this.getEncodedAddr(provider);
                     }
                  });
               }

               // Check if providersToCompare Exist
               this.providerJD = JSON.parse(JSON.stringify(this.omniJsonData));
               // console.log("providerJD", JSON.stringify(this.providerJD));

               //Validate providers who accept new patients, format phone number & much more.....
               // console.log('JSON.stringify(this.providers)', JSON.stringify(this.providers));
               let dateToday = new Date();
               // console.log("testToday", testToday);
               let today = new Date();
               // console.log('dateToday', dateToday);
               let months3later = new Date(dateToday.setMonth(dateToday.getMonth() + 3));
               // console.log("months3later", months3later);

               this.providers.forEach((provider) => {
                  let effDate = new Date(provider.NetworkEffectiveDate);
                  let terDate = new Date(provider.NetworkTerminationDate);

                  if (provider.NetworkEffectiveDate == "" || provider.NetworkEffectiveDate == null) {
                     if (terDate.getTime() <= months3later.getTime()) {
                        provider.NetworkStatus = "Leaving network on " + provider.NetworkTerminationDate;
                     } else {
                        provider.NetworkStatus = "Active";
                     }
                  } else if (effDate.getTime() > today.getTime() && effDate.getTime() <= months3later.getTime()) {
                     //effective date < today in console.logs
                     // } else if (effDate.getTime() < today.getTime() && effDate.getTime() <= months3later.getTime()) {

                     provider.NetworkStatus = "Joining network on " + provider.NetworkEffectiveDate;
                     // } else if (provider.NetworkStatus == "Active" && terDate.getTime() > months3later.getTime()) {
                  } else if (terDate.getTime() > months3later.getTime()) {
                     provider.NetworkStatus = "Active";
                     // } else if (provider.NetworkStatus == "Active" && terDate.getTime() <= months3later.getTime()) {
                  } else if (terDate.getTime() <= months3later.getTime()) {
                     provider.NetworkStatus = "Leaving network on " + provider.NetworkTerminationDate;
                  }

                  provider.showNotPreferredmodalMessage = false;
                  //get distance from IP and fixed it to 2 decimals
                  if (this.providers.length > 0) {
                     if (provider.distanceFromZip) {
                        provider.distanceFromZip = provider.distanceFromZip.toFixed(2);
                        provider.directionsAriaLabel = provider.distanceFromZip + " miles google maps directions to " + provider.providerFullName + " opens a new tab";
                     }
                  }

                  // Validate if provider accpets new patients
                  if (provider.acceptingNewPatients == "No" || provider.acceptingNewPatients == "N") {
                     provider.notNewPatients = true;
                  } else if (provider.acceptingNewPatients === "Yes" || provider.acceptingNewPatients === "Y") {
                     provider.acceptNewProv = true;
                  }

                  // Logic to hide or show icons/labels ***********************************

                  //Validate if provider has wheelchair accessility
                  if (provider.WheelchairAccessible === "Yes" || provider.WheelchairAccessible === "Y") {
                     provider.isWheelchairAccessible = true;
                  } else {
                     provider.isWheelchairAccessible = false;
                  }

                  //Validate if provider is COE
                  if (provider.isCOE === "Yes" || provider.isCOE === "Y") {
                     provider.iconCOE = true;
                  } else {
                     provider.iconCOE = false;
                  }

                  //Validate if provider is primary care provider
                  if (provider.isPCP === "Yes" || provider.isPCP === "Y") {
                     provider.isPrimaryCareProvider = true;
                  } else {
                     provider.isPrimaryCareProvider = false;
                  }

                  // Validate if provider has multiple locations
                  if (provider.multipleLocations === "Y" || provider.multipleLocations === "Yes") {
                     provider.hasMultipleLoc = true;
                  } else {
                     provider.hasMultipleLoc = false;
                  }

                  // See if provider has eyewar discount
                  if (provider.eyewearDiscount === "Y" || provider.eyewearDiscount === "Yes") {
                     provider.hasEyewearDis = true;
                  } else {
                     provider.hasEyewearDis = false;
                  }

                  // See if provider has is/has ACPNY
                  if (provider.ACPNY === "N" || provider.ACPNY === "No") {
                     provider.acpny = false;
                  } else {
                     provider.acpny = true;
                  }

                  // See if provider is BronxDocs
                  if (provider.networkProviderPrefix === "BXD1") {
                     provider.bronxDocs = true;
                  } else {
                     provider.bronxDocs = false;
                  }

                  // See if provider is FHN

                  if (provider.isFHN != null) {
                     if (provider.isFHN == "YES") {
                        provider.FHN = true;
                     } else {
                        provider.FHN = false;
                     }
                  }

                  // preferred
                  if (provider.preferred == "No" || provider.preferred == "N" || provider.preferred == null) {
                     provider.isPreferred = false;
                     if (this.planNetworkcode == "HT01") {
                        provider.modalMessage = "Did you know? If you select a Preferred Provider instead of any other PCP in the network, you will have lower copays for most professional services.";
                        this.showNotPreferredmodalMessage = true;
                        provider.showNotPreferredmodalMessage = true;
                     } else if (this.planNetworkcode == "2T02" || this.planNetworkcode == "2T03") {
                        this.showNotPreferredmodalMessage = true;
                        provider.showNotPreferredmodalMessage = true;
                        provider.modalMessage =
                           "Did you know that if you choose a Preferred Provider, rather than any other PCP in the network, you’ll have lower copays for most professional services?";
                     }
                  } else {
                     provider.showNotPreferredmodalMessage = false;
                     provider.isPreferred = true;
                  }

                  //  Format Zip Code
                  if (provider.zip === undefined || provider.zip === null || provider.zip === "") {
                     provider.zip = " ";
                  } else {
                     provider.zip = provider.zip.substring(0, 5);
                  }

                  //  Format Phone Number
                  if (provider.Phone === undefined || provider.Phone == null || provider.Phone === "") {
                     provider.Phone = " ";
                  } else {
                     provider.Phone = provider.Phone.substring(0, 3) + "-" + provider.Phone.substring(3, 6) + "-" + provider.Phone.substring(6, 10);
                  }

                  // Show or Hide Choose as PCP Link
                  if (Object.prototype.hasOwnProperty.call(this.provJsonData, "PCPLink")) {
                     if (Object.prototype.hasOwnProperty.call(this.provJsonData.PCPLink, "EnableFlag")) {
                        if (this.provJsonData.PCPLink.EnableFlag === "suppressed") {
                           // Hide Choose as PCP for all providers
                           provider.chooseAsPCPLink = false;
                        } else if (this.provJsonData.PCPLink.EnableFlag != "suppressed") {
                           if ((provider.isPCP == "Yes" || provider.isPCP == "Y") && (provider.leavingNetwork == "N" || provider.leavingNetwork == "No")) {
                              // Show Choose as PCP for particular provider
                              provider.chooseAsPCPLink = true;
                           } else {
                              // Hide Choose as PCP for particular provider
                              provider.chooseAsPCPLink = false;
                           }
                        }
                     }
                  } else {
                     provider.chooseAsPCPLink = false;
                  }

                  //Logic for enable/disable checkbox and add/remove to compare
                  if (this.providerJD.providersToCompare != undefined || this.providerJD.providersToCompare != null) {
                     this.exist = true;
                     if (this.providerJD.providersToCompare.length > 0) {
                        this.showCompareFooter = true;
                     }

                     if (this.providerJD.providersToCompare.length > 0 && this.providerJD.providersToCompare.length <= 2) {
                        let found = this.providerJD.providersToCompare.some((pr) => pr.providerId === provider.ProviderId);
                        if (found) {
                           provider.added = true;
                        }
                     } else if (this.providerJD.providersToCompare.length == 3) {
                        provider.isBtnDisabled = true;
                        let found = this.providerJD.providersToCompare.some((pr) => pr.providerId === provider.ProviderId);
                        if (found) {
                           provider.added = true;
                           provider.isBtnDisabled = false;
                        }
                     }
                  } else {
                     this.exist = false;
                  }
               });
               this.setProvidersToCompare();
            } else {
               //there is no record returned from IP
               this.elementsLoaded = false;
               this.noElementsMsg = true;
               if (this.refinedSearchfilter == true) {
                  this.noElementsAfterFilter = true;
                  this.refinedSearchfilter = false;
               }
               this.elementsToDisplayMobile = false;
            }
            // Update IP input to data JSON
            this.saveAPIInput();

            //To reset 'from' to 0 in the providerParams.input
            this.fieldParam.fieldToSave = "navigateFrom";
            this.fieldParam.fieldValue = "SelectProvider";

            this.saveFieldToDataJson("navigateFrom", "SelectProvider");
            if (Array.isArray(this.providers) && this.totalProviderNum > 0) {
               this.providersTracked = [...this.providers];
            }

            this.setMapMarkers();
            //dynamic filters
            this.dynamicFilterShowHide();
            return this.providers;
         } else {
            console.error(`${this.errorMessage} Member_findDoctor`);
            this.loading = false;
            this.systemErrorMsg = true;
         }
      } catch (error) {
         console.error("Error coming from Member_findDoctor", error);
         this.loading = false;
         this.systemErrorMsg = true;
      }
   }
   /*****************************************************************/

   setProvidersToCompare() {
      let jsonFTC = JSON.parse(JSON.stringify(this.omniJsonData));

      if (jsonFTC.providersToCompare != null || jsonFTC.providersToCompare != undefined) {
         this.providersCount = jsonFTC.providersToCompare.length;
         this.providersToCompare = JSON.parse(JSON.stringify(jsonFTC.providersToCompare));

         if (jsonFTC.providersToCompare.length >= 2) {
            this.disableCompareButton = false;
         } else {
            this.disableCompareButton = true;
         }
      } else {
         this.providersCount = 0;
      }
   }

   dynamicFilterShowHide() {
      let jsonData = JSON.parse(JSON.stringify(this.omniJsonData));

      //preferred
      if (jsonData.SelectedPlanInfo.preferred == "Y") {
         this.dynamicPreferred = true;
      } else {
         this.dynamicPreferred = false;
      }

      //virtualCareProvider
      if (jsonData.SelectedPlanInfo.virtualCareProvider == "Y") {
         this.dynamicVCP = true;
      } else {
         this.dynamicVCP = false;
      }

      if (jsonData.SelectedPlanInfo.centerOfExcellence == "Y") {
         this.dynamicCOE = true;
      } else {
         this.dynamicCOE = false;
      }
   }

   findCommonElement(array1, array2) {
      for (let i = 0; i < array1.length; i++) {
         for (let j = 0; j < array2.length; j++) {
            if (array1[i].ProviderId === array2[j].item) {
               return true;
            }
         }
      }
   }

   saveAPIInput() {
      let inputs = {};
      inputs.providerParams = this.providerParams;
      this.omniApplyCallResp(JSON.parse(JSON.stringify(inputs)));
   }

   saveFieldToDataJson() {
      var field = { [this.fieldParam.fieldToSave]: this.fieldParam.fieldValue };
      this.omniApplyCallResp(field);
   }

   setMapMarkers() {
      this.isMapLoading = true;
      if (this.providersTracked.length >= 0) {
         let tmpMarkers = [];
         this.providersTracked.forEach((provider) => {
            if (provider.ProviderId) {
               // For each provider given, create a map marker.
               let coords = [];
               if (provider.geoPoint != "0,0") {
                  coords = provider.geoPoint.split(",");
               }
               //let listNum = this.providersTracked.indexOf(provider) + 1;
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
                  //title: `#${listNum}: ${provider.providerFullName}`,
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

   updateDataJson() {
      let providerArray = {};
      providerArray.providerList = this.providers;
      this.omniApplyCallResp(JSON.parse(JSON.stringify(providerArray)));
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

   /*
   goToProvDetailsFromPlanInformation(evt) {
      if (evt) {
         //To display Provider Review Page
         let providerId = { providerId: provId };
         let reviewProDet = { viewProviderDetails: "Yes" };
         this.omniApplyCallResp(reviewProDet);
         this.omniApplyCallResp(reviewProDet);
         this.omniNextStep();
      }
   }
   */

   populateDetailPage(provId) {
      //Filtering only selcted Provider
      let pr = this.providers.find((provider) => provider.ProviderId === provId);
      // Accepting New Patients
      let acceptNewPa = { acceptNewPa: pr.acceptingNewPatients };
      let degree = { degree: pr.Title };
      let profileId = { profileId: pr.multiOfficesProviderId };
      let isBronx = { isBronx: pr.bronxDocs };
      let FHN = { isFHN: pr.FHN };

      this.omniApplyCallResp(FHN);
      this.omniApplyCallResp(isBronx);
      this.omniApplyCallResp(acceptNewPa);
      this.omniApplyCallResp(degree);
      this.omniApplyCallResp(profileId);

      //AFIRE-35 - Show Provider Details dinamically based on previous selection
      let providerStructure = {
         provDetailsInfo : pr
      }
      this.omniApplyCallResp(providerStructure);
   }

   //Boolean tracked variable to indicate if modal is open or not default value is false as modal is closed when page is loaded
   isModalOpen = false;
   isNoPCPModalOpen = false;
   isNoPreferredPCPModalOpen = false;

   choosePCP(evt) {
      if (evt) {
         let userPCP = "";
         let currentPCPInfo = "";
         let newPCPInfo = "";

         //Set selected Provider Id
         const provId = evt.target.getAttribute("data-btn-id");
         let pr = this.providers.find((provider) => provider.ProviderId === provId);

         //Set currentPCP, newPCP and PCPTranscationType
         let member = this.pcpInfo.find((pcp) => pcp.memberId === this.memberInfo.memberId);
         if (Array.isArray(this.pcpInfo) && this.pcpInfo.length > 0 && member) {
            // PCPInfo comes and get information for current PCP
            userPCP = member.pcpName !== "" && member.pcpName === "NA" ? "" : member.pcpName;
            this.currentPCPName = userPCP;
            currentPCPInfo = { currentPCPName: userPCP, currentPCPId: member.pcpId };
         } else {
            // PCPInfo come as empty and  assume there is no current PCP for the member
            // Build PCPInfo based on MemberInPlan
            let newPCPInfoArray = [];
            if (Array.isArray(this.memberInPlan) && this.memberInPlan.length > 0) {
               this.memberInPlan.forEach((m) => {
                  newPCPInfoArray.push({
                     relationship: m.relationship,
                     memberName: m.memberName,
                     memberId: m.memberId,
                     address1: m.homeAddressLine1,
                     address2: m.homeAddressLine2,
                     city: m.homeAddresCity,
                     state: m.homeAddressState,
                     country: m.homeAddresCountry,
                     zipCode: m.homeAddressZipCode,
                     primaryPhone: m.homePhone,
                     pcpName: "",
                     pcpId: "",
                     pcpEffectiveDate: "",
                  });
               });
               this.omniApplyCallResp({ PCPInfo: newPCPInfoArray });
               currentPCPInfo = { currentPCPName: "", currentPCPId: "" };
            }
         }
         newPCPInfo = { newPCPName: pr.providerFullName, newProviderId: pr.ProviderId };

         let pcpAddress = { pcpAddressLine1: pr.addressLine1, pcpAddressLine2: pr.addressLine2, pcpCity: pr.city, pcpState: pr.state, pcpZip: pr.zip };
         this.omniApplyCallResp(currentPCPInfo);
         this.omniApplyCallResp(newPCPInfo);
         this.omniApplyCallResp(pcpAddress);

         if (pr.acceptingNewPatients === "Yes") {
            this.moveToChangePCP(evt);
         } else {
            if (this.modalProviderComparison) {
               this.closeModalProviderComparison();
            }
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
      this.provIdforPCPModal = evt.target.getAttribute("data-btn-id");
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

   //Boolean tracked variable to indicate if modal is open or not default value is false as modal is closed when page is loaded
   isModalOpen = false;
   isNoPCPModalOpen = false;
   isNoPreferredPCPModalOpen = false;

   moveToChangePCP(evt) {
      if (evt) {
         let transactionType = this.currentPCPName !== "" ? "Update" : "Add";
         let viewPCPUpdate = { reviewProDet: "Yes", viewPCPUpdate: "Yes", viewProviderDetails: "No", viewMutlipleOffice: "No", PCPTransactionType: transactionType };
         this.omniApplyCallResp(viewPCPUpdate);
         this.omniNextStep();
         evt.preventDefault();
      }
   }
   goToReviewProvDetails(evt) {
      if (evt) {
         //Set selected Provider Id
         const provId = evt.target.getAttribute("data-btn-id");
         this.populateDetailPage(provId);

         //To display Provider Review Page
         let providerId = { providerId: provId };
         let reviewProDet = { reviewProDet: "Yes", viewProviderDetails: "Yes", viewMutlipleOffice: "No" };
         this.omniApplyCallResp(providerId);
         this.omniApplyCallResp(reviewProDet);
         this.omniNextStep();
      }
   }

   goToChooseServiceType(evt) {
      if (evt) {
         if (this.isPublic) {
            //Going back to the Find Care public main page
            this[NavigationMixin.Navigate](
               {
                  type: "standard__namedPage",
                  attributes: {
                     pageName: "find-care-public",
                  },
               },
               true // Replaces the current page in your browser history with the URL
            );
         } else {
            this.omniNavigateTo("STEP_ChooseServiceType");
         }
      }
   }

   goToFindCarePublic(evt) {
      if (evt) {
         if (this.isPublic) {
            //Going back to the Find Care public main page
            this[NavigationMixin.Navigate](
               {
                  type: "standard__namedPage",
                  attributes: {
                     pageName: "find-care-services",
                  },
               },
               true // Replaces the current page in your browser history with the URL
            );
         }
      }
   }

   /* On click of bubbles redirects back to the relavant page */
   goToLocation(evt) {
      if (evt) {
         this.omniPrevStep();
      }
   }

   goToChooseSpecialities(evt) {
      if (evt) {
         this.omniNavigateTo("STEP_ChooseSpecialities");
      }
   }

   handleLanguageSelectionChange(evt) {
      this.selectedLanguageFilter = evt.detail.request;
   }

   handleHospitalAffSelect(evt) {
      this.selectedHospitalAffFilter = evt.detail.itemCode;
   }
   handleMedicalGroupSelect(evt) {
      this.selectedMedicalFilter = evt.detail.itemCode;
   }
   /* Provider Filter functionality for Desktop */
   filterDesktop() {
      console.log("filterDesktop");
      this.refinedSearchfilter = false;

      if (this.selectedMedicalFilter != "") {
         this.providerParams.input.groupName = this.selectedMedicalFilter;
      } else {
         this.providerParams.input.groupName = "";
      }

      /**Filter Provider Name Partial Match - IP Dynamic Provider Name value**/
      if (this.template.querySelector(".filter_providerName_Desktop").value != "") {
         this.providerParams.input.providerFullName = this.template.querySelector(".filter_providerName_Desktop").value;
         this.providerParams.input.providerAriaLabel = "Choose " + this.template.querySelector(".filter_providerName_Desktop").value + " as your primary care provider";
      } else {
         this.providerParams.input.providerFullName = "";
         this.providerParams.input.providerAriaLabel = "";
      }

      /**Filter Language - IP Dynamic Language value**/
      //if (this.template.querySelector(".filter_language_Desktop").value != "All") {
      if (this.selectedLanguageFilter != "All") {
         this.providerParams.input.language = this.selectedLanguageFilter;
         // this.selectedLanguage = this.providerParams.input.language;
      } else {
         this.providerParams.input.language = "";
      }

      /**Filter Gender - IP Dynamic Gender value**/
      if (this.template.querySelector(".filter_gender_Desktop") && this.template.querySelector(".filter_gender_Desktop").value != "Either") {
         this.providerParams.input.gender = this.template.querySelector(".filter_gender_Desktop").value;
      } else {
         this.providerParams.input.gender = "";
      }

      if (this.selectedHospitalAffFilter != "All") {
         this.providerParams.input.hospitalAffiliation = this.selectedHospitalAffFilter;
      } else {
         this.providerParams.input.hospitalAffiliation = "";
      }

      /**Filter Wheelchair - IP Dynamic Wheelchair value**/
      if (this.template.querySelector(".filter_WA_Desktop") && this.template.querySelector(".filter_WA_Desktop").checked == true) {
         this.providerParams.input.wheelchair = "true";
      } else {
         this.providerParams.input.wheelchair = "";
      }

      /**Filter Accepting New Patient - IP Dynamic ANP value**/
      if (this.template.querySelector(".filter_ANP_Desktop") && this.template.querySelector(".filter_ANP_Desktop").checked == true) {
         this.providerParams.input.acceptingNewPatients = "true";
      } else {
         this.providerParams.input.acceptingNewPatients = "";
      }

      /**Filter ACPNY - IP Dynamic ACPNY value**/

      if (this.template.querySelector(".filter_ACPNY_Desktop") && this.template.querySelector(".filter_ACPNY_Desktop").checked == true) {
         this.providerParams.input.ACPNY = "true";
      } else {
         this.providerParams.input.ACPNY = "";
      }

      /**Filter BronxDocs - IP Dynamic BronxDocs value**/
      if (this.template.querySelector(".filter_BRONX_Desktop") && this.template.querySelector(".filter_BRONX_Desktop").checked == true) {
         this.providerParams.input.bronxDocs = "Y";
      } else {
         this.providerParams.input.bronxDocs = "";
      }

      /**Filter Homeless Shelter - IP Dynamic Homeless Shelter value**/
      if (this.template.querySelector(".filter_HomelessShelter_Desktop") && this.template.querySelector(".filter_HomelessShelter_Desktop").checked == true) {
         this.providerParams.input.homelessShelter = "true";
      } else {
         this.providerParams.input.homelessShelter = "";
      }

      /********************************************************************************/
      /******************Dynamic Filters Preferred/VCP/COE*****************************/
      /********************************************************************************/

      if (this.dynamicPreferred == true) {
         /**Filter Preferred - IP Dynamic Preferred value**/
         if (this.template.querySelector(".filter_Preferred_Desktop") && this.template.querySelector(".filter_Preferred_Desktop").checked == true) {
            this.providerParams.input.preferredOnly = "true";
         } else {
            this.providerParams.input.preferredOnly = "";
         }
      }

      if (this.dynamicCOE == true) {
         /**Filter Center of Excellence - IP Dynamic COE value**/
         if (this.template.querySelector(".filter_COE_Desktop") && this.template.querySelector(".filter_COE_Desktop").checked == true) {
            this.providerParams.input.coe = "true";
         } else {
            this.providerParams.input.coe = "";
         }
      }

      // this.mobileApplyFilters();
      this.goToFirstPage();
      this.getProviders();
      // this.filterMobile();
   }

   setFilterValue() {
      // Set Input parameter for the FindDoctor IP
      if (Object.prototype.hasOwnProperty.call(this.provJsonData, "providerParams") && this.elementsLoaded) {
         let input = this.provJsonData.providerParams.input;

         //desktop
         if (this.template.querySelector(".filter_providerName_Desktop")) {
            this.template.querySelector(".filter_providerName_Desktop").value = input.providerFullName;
         }

         //language
         /*
         if (!input.language && this.template.querySelector(".filter_language_Desktop")) {
            this.template.querySelector(".filter_language_Desktop").setDisplayValue(input.language);
         }
         */
         if (!input.language) {
            this.selectedLanguageFilter = "All";
            this.setLanguageFilter = "";
         } else if (input.language && this.template.querySelector(".filter_language_Desktop")) {
            this.selectedLanguageFilter = input.language;
            this.setLanguageFilter = input.language;
         }

         //gender
         if (!input.gender && this.template.querySelector(".filter_gender_Desktop")) {
            this.template.querySelector(".filter_gender_Desktop").value = "Either";
         } else {
            this.template.querySelector(".filter_gender_Desktop").value = input.gender;
         }

         //hospitalAffiliation
         if (!input.hospitalAffiliation) {
            this.selectedHospitalAffFilter = "";
         } else if (input.hospitalAffiliatio && this.template.querySelector(".filter_hospaffil_Desktop")) {
            this.selectedHospitalAffFilter = input.hospitalAffiliation;
            this.template.querySelector(".filter_hospaffil_Desktop").setDisplayValue(input.hospitalAffiliation);
         }
         //medical group
         if (this.showmedicalgroup) {
            if (!input.groupName) {
               this.selectedMedicalFilter = "";
            } else if (input.groupName && this.template.querySelector(".filter_medicalgroup_Desktop")) {
               this.template.querySelector(".filter_medicalgroup_Desktop").setDisplayValue(input.groupName);
               this.selectedMedicalFilter = input.groupName;
            }
         }

         if (this.template.querySelector(".filter_WA_Desktop")) {
            this.template.querySelector(".filter_WA_Desktop").checked = Boolean(input.wheelchair);
         }
         if (this.template.querySelector(".filter_ANP_Desktop")) {
            this.template.querySelector(".filter_ANP_Desktop").checked = Boolean(input.acceptingNewPatients);
         }
         if (this.template.querySelector(".filter_ACPNY_Desktop")) {
            this.template.querySelector(".filter_ACPNY_Desktop").checked = Boolean(input.ACPNY);
         }
         if (this.template.querySelector(".filter_BRONX_Desktop")) {
            this.template.querySelector(".filter_BRONX_Desktop").checked = Boolean(input.bronxDocs);
         }
         if (this.template.querySelector(".filter_HomelessShelter_Desktop")) {
            this.template.querySelector(".filter_HomelessShelter_Desktop").checked = Boolean(input.homelessShelter);
         }

         /********************************************************************************/
         /******************Dynamic Filters Preferred/VCP/COE*****************************/
         /********************************************************************************/
         if (this.template.querySelector(".filter_Preferred_Desktop")) {
            this.template.querySelector(".filter_Preferred_Desktop").checked = Boolean(input.preferredOnly);
         }

         if (this.template.querySelector(".filter_VCP_Desktop")) {
            this.template.querySelector(".filter_VCP_Desktop").checked = Boolean(input.virtualCareProvider);
         }

         if (this.template.querySelector(".filter_COE_Desktop")) {
            this.template.querySelector(".filter_COE_Desktop").checked = Boolean(input.coe);
         }
      }
   }

   setFilterValueMobile() {
      // Set Input parameter for the FindDoctor IP
      if (Object.prototype.hasOwnProperty.call(this.provJsonData, "providerParams") && this.elementsLoaded) {
         let input = this.provJsonData.providerParams.input;
         let counter = 0;

         //providerFullName
         if (input.providerFullName && this.template.querySelector(".filter_providername")) {
            this.template.querySelector(".filter_providername").value = input.providerFullName;
            counter++;
         }
         //language
         if (!input.language) {
            this.selectedLanguageFilter = "All";
            this.setLanguageFilter = "";
         } else if (input.language && this.template.querySelector(".filter_language")) {
            this.selectedLanguageFilter = input.language;
            this.setLanguageFilter = input.language;
            this.template.querySelector(".filter_language").setDisplayValue(input.language);
            counter++;
         }

         //medical group
         if (this.showmedicalgroup) {
            if (!input.groupName) {
               this.selectedMedicalFilter = "";
            } else if (input.groupName && this.template.querySelector(".filter_medicalgroup")) {
               this.template.querySelector(".filter_medicalgroup").setDisplayValue(input.groupName);
               this.selectedMedicalFilter = input.groupName;
               counter++;
            }
         }

         //hospitalAffiliation
         if (!input.hospitalAffiliation) {
            this.selectedHospitalAffFilter = "";
         } else if (input.hospitalAffiliation && this.template.querySelector(".filter_hospaffil")) {
            this.selectedHospitalAffFilter = input.hospitalAffiliation;
            this.template.querySelector(".filter_hospaffil").setDisplayValue(input.hospitalAffiliation);
            counter++;
         }

         //gender
         if (!input.gender && this.template.querySelector(".filter_gender")) {
            this.template.querySelector(".filter_gender").value = "Either";
         } else {
            this.template.querySelector(".filter_gender").value = input.gender;
            counter++;
         }

         //wheelchair
         if (input.wheelchair && this.template.querySelector(".filter_WA")) {
            this.template.querySelector(".filter_WA").checked = input.wheelchair;
            counter++;
         }

         //acceptingNewPatients
         if (input.acceptingNewPatients && this.template.querySelector(".filter_ANP")) {
            this.template.querySelector(".filter_ANP").checked = input.acceptingNewPatients;
            counter++;
         }

         //ACPNY
         if (input.ACPNY && this.template.querySelector(".filter_ACPNY")) {
            this.template.querySelector(".filter_ACPNY").checked = input.ACPNY;
            counter++;
         }

         //BronxDocs
         if (input.BronxDocs && this.template.querySelector(".filter_BRONX")) {
            this.template.querySelector(".filter_BRONX").checked = input.BronxDocs;
            counter++;
         }

         //homelessShelter
         if (input.homelessShelter && this.template.querySelector(".filter_homelessShelter")) {
            this.template.querySelector(".filter_homelessShelter").checked = input.homelessShelter;
            counter++;
         }

         /******************Dynamic Filters Preferred/VCP/COE*****************************/
         // Preferred
         if (input.preferredOnly && this.template.querySelector(".filter_Preferred")) {
            this.template.querySelector(".filter_Preferred").checked = input.preferredOnly;
            counter++;
         }

         // VCP
         if (input.virtualCareProvider && this.template.querySelector(".filter_VCP")) {
            this.template.querySelector(".filter_VCP").checked = input.virtualCareProvider;
            counter++;
         }

         // COE
         if (input.coe && this.template.querySelector(".filter_COE")) {
            this.template.querySelector(".filter_COE").checked = input.coe;
            counter++;
         }

         if (counter === 0) {
            this.filterBy = this.template.querySelector(".filter_input").value = "Filter By";
         } else {
            this.filterBy = this.template.querySelector(".filter_input").value = "(" + counter + ")" + " Filter By";
         }
      }
   }

   clearFiltersDesktop() {
      // clear filters in UI
      this.template.querySelector(".filter_providerName_Desktop").value = "";
      this.selectedLanguageFilter = "All";
      this.setLanguageFilter = "";
      this.selectedHospitalAffFilter = "";

      this.template.querySelector(".filter_language_Desktop").resetToAll();
      this.template.querySelector(".filter_hospaffil_Desktop").resetToAll();

      if (this.showmedicalgroup) {
         this.template.querySelector(".filter_medicalgroup_Desktop").resetToAll();
         this.selectedMedicalFilter = "";
      }

      this.template.querySelector(".filter_gender_Desktop").value = "Either";

      if (this.template.querySelector(".filter_WA_Desktop")) {
         this.template.querySelector(".filter_WA_Desktop").checked = false;
      }
      if (this.template.querySelector(".filter_ANP_Desktop")) {
         this.template.querySelector(".filter_ANP_Desktop").checked = false;
      }
      if (this.template.querySelector(".filter_ACPNY_Desktop")) {
         this.template.querySelector(".filter_ACPNY_Desktop").checked = false;
      }
      if (this.template.querySelector(".filter_BRONX_Desktop")) {
         this.template.querySelector(".filter_BRONX_Desktop").checked = false;
      }
      if (this.template.querySelector(".filter_HomelessShelter_Desktop")) {
         this.template.querySelector(".filter_HomelessShelter_Desktop").checked = false;
      }

      /******************Dynamic Filters Preferred/VCP/COE*****************************/
      if (this.dynamicVCP == true) {
         this.template.querySelector(".filter_VCP_Desktop").checked = false;
      }

      if (this.dynamicCOE == true) {
         this.template.querySelector(".filter_COE_Desktop").checked = false;
      }

      if (this.dynamicPreferred == true) {
         this.template.querySelector(".filter_Preferred_Desktop").checked = false;
      }

      // clear filters in backend
      this.resetFilterParams();

      this.filterDesktop();
   }

   /**Provider Filter functionality for Mobile**/
   mobileCloseFilterWindow() {
      this.template.querySelector(".item_list").classList.add("nds-hide");
   }

   mobileIsOpen() {
      this.template.querySelector(".item_list").classList.remove("nds-hide");
      this.template.querySelector(".nds-dropdown-trigger").classList.add("nds-is-open");
   }

   mobileClearFilters() {
      // clear filters in UI
      this.template.querySelector(".filter_providername").value = "";
      this.selectedLanguageFilter = "All";
      this.setLanguageFilter = "";
      this.selectedHospitalAffFilter = "";

      this.template.querySelector(".filter_language").resetToAll();
      this.template.querySelector(".filter_hospaffil").resetToAll();
      if (this.showmedicalgroup) {
         this.template.querySelector(".filter_medicalgroup").resetToAll();
         this.selectedMedicalFilter = "";
      }
      this.template.querySelector(".filter_gender").value = "Either";

      if (this.template.querySelector(".filter_WA")) {
         this.template.querySelector(".filter_WA").checked = false;
      }
      if (this.template.querySelector(".filter_ANP")) {
         this.template.querySelector(".filter_ANP").checked = false;
      }
      if (this.template.querySelector(".filter_ACPNY")) {
         this.template.querySelector(".filter_ACPNY").checked = false;
      }
      if (this.template.querySelector(".filter_BRONX")) {
         this.template.querySelector(".filter_BRONX").checked = false;
      }
      if (this.template.querySelector(".filter_homelessShelter")) {
         this.template.querySelector(".filter_homelessShelter").checked = false;
      }

      /******************Dynamic Filters Preferred/VCP/COE*****************************/
      if (this.dynamicVCP == true) {
         this.template.querySelector(".filter_VCP").checked = false;
      }

      if (this.dynamicCOE == true) {
         this.template.querySelector(".filter_COE").checked = false;
      }

      if (this.dynamicPreferred == true) {
         this.template.querySelector(".filter_Preferred").checked = false;
      }

      // clear filters in backend
      this.resetFilterParams();

      //clear tags and filter by value in UI - only mobile
      this.countTags = 0;
      this.filterBy = this.template.querySelector(".filter_input").value = "Filter By";

      this.filterMobile();
   }

   mobileApplyFilters() {
      let counter = 0;

      // wheelchair
      if (this.template.querySelector(".filter_WA").checked == true) {
         counter++;
      }

      //accepting new patient
      if (this.template.querySelector(".filter_ANP").checked == true) {
         counter++;
      }

      //gender
      if (this.template.querySelector(".filter_gender").value != "Either" && this.template.querySelector(".filter_gender").value != "") {
         counter++;
      }

      //language
      /*
      if (this.template.querySelector(".filter_language").value != "All" && this.template.querySelector(".filter_language").value != "") {
         counter++;
      }
      */
      if (this.selectedLanguageFilter != "All") {
         counter++;
      }

      //hospital
      if (this.selectedHospitalAffFilter != "All" && this.selectedHospitalAffFilter != "") {
         counter++;
      }
      //medical group
      if (this.selectedMedicalFilter != "" && this.showmedicalgroup) {
         counter++;
      }

      //provider name
      if (this.template.querySelector(".filter_providername").value != "") {
         counter++;
      }

      //acpny
      if (this.template.querySelector(".filter_ACPNY") && this.template.querySelector(".filter_ACPNY").checked == true) {
         counter++;
      }

      //bronxDocs
      if (this.template.querySelector(".filter_BRONX") && this.template.querySelector(".filter_BRONX").checked == true) {
         counter++;
      }

      //homelessShelter
      if (this.template.querySelector(".filter_homelessShelter") && this.template.querySelector(".filter_homelessShelter").checked == true) {
         counter++;
      }

      /******************Dynamic Filters Preferred/VCP/COE*****************************/
      //preferred
      if (this.dynamicPreferred == true) {
         if (this.template.querySelector(".filter_Preferred")) {
            if (this.template.querySelector(".filter_Preferred").checked == true) {
               counter++;
            }
         }
      }

      //virtual care
      if (this.dynamicVCP == true) {
         if (this.template.querySelector(".filter_VCP")) {
            if (this.template.querySelector(".filter_VCP").checked == true) {
               counter++;
            }
         }
      }

      //coe
      if (this.dynamicCOE == true) {
         if (this.template.querySelector(".filter_COE")) {
            if (this.template.querySelector(".filter_COE").checked == true) {
               counter++;
            }
         }
      }

      if (counter === 0) {
         this.filterBy = this.template.querySelector(".filter_input").value = "Filter By";
      } else {
         this.filterBy = this.template.querySelector(".filter_input").value = "(" + counter + ")" + " Filter By";
      }

      let filterBy = { filterBy: this.filterBy };
      this.omniApplyCallResp(filterBy);
   }

   filterMobile() {
      if (this.selectedMedicalFilter != "") {
         this.providerParams.input.groupName = this.selectedMedicalFilter;
      } else {
         this.providerParams.input.groupName = "";
      }

      /**Filter Provider Name Partial Match - IP Dynamic Provider Name value**/
      if (this.template.querySelector(".filter_providername").value != "") {
         this.providerParams.input.providerFullName = this.template.querySelector(".filter_providername").value;
         this.providerParams.input.providerAriaLabel = "Choose " + this.template.querySelector(".filter_providername").value + " as your primary care provider";
      } else {
         this.providerParams.input.providerFullName = "";
         this.providerParams.input.providerAriaLabel = "";
      }

      /**Filter Language - IP Dynamic Language value**/
      //if (this.template.querySelector(".filter_language").value != "All") {
      if (this.selectedLanguageFilter != "All") {
         this.providerParams.input.language = this.selectedLanguageFilter;
      } else {
         this.providerParams.input.language = "";
      }

      /**Filter Gender - IP Dynamic Gender value**/
      if (this.template.querySelector(".filter_gender").value != "Either") {
         this.providerParams.input.gender = this.template.querySelector(".filter_gender").value;
      } else {
         this.providerParams.input.gender = "";
      }

      if (this.selectedHospitalAffFilter != "All") {
         this.providerParams.input.hospitalAffiliation = this.selectedHospitalAffFilter;
      } else {
         this.providerParams.input.hospitalAffiliation = "";
      }

      /**Filter Wheelchair - IP Dynamic Wheelchair value**/
      if (this.template.querySelector(".filter_WA").checked == true) {
         this.providerParams.input.wheelchair = "true";
      } else {
         this.providerParams.input.wheelchair = "";
      }

      /**Filter Accepting New Patient - IP Dynamic ANP value**/
      if (this.template.querySelector(".filter_ANP").checked == true) {
         this.providerParams.input.acceptingNewPatients = "true";
      } else {
         this.providerParams.input.acceptingNewPatients = "";
      }

      /**Filter ACPNY - IP Dynamic ACPNY value**/
      if (this.template.querySelector(".filter_ACPNY") && this.template.querySelector(".filter_ACPNY").checked == true) {
         this.providerParams.input.ACPNY = "true";
      } else {
         this.providerParams.input.ACPNY = "";
      }

      /**Filter BRONX - IP Dynamic BRONX value**/
      if (this.template.querySelector(".filter_BRONX") && this.template.querySelector(".filter_BRONX").checked == true) {
         this.providerParams.input.bronxDocs = "Y";
      } else {
         this.providerParams.input.bronxDocs = "";
      }

      /**Filter homelessShelter - IP Dynamic homelessShelter value**/
      if (this.template.querySelector(".filter_homelessShelter") && this.template.querySelector(".filter_homelessShelter").checked == true) {
         this.providerParams.input.homelessShelter = "true";
      } else {
         this.providerParams.input.homelessShelter = "";
      }

      /******************Dynamic Filters Preferred/VCP/COE*****************************/

      /**Filter Preferred - IP Dynamic Preferred value**/
      if (this.dynamicPreferred == true) {
         if (this.template.querySelector(".filter_Preferred").checked == true) {
            this.providerParams.input.preferredOnly = "true";
         } else {
            this.providerParams.input.preferredOnly = "";
         }
      }

      /**Filter Center of Excellence - IP Dynamic COE value**/
      if (this.dynamicCOE == true) {
         if (this.template.querySelector(".filter_COE").checked == true) {
            this.providerParams.input.coe = "true";
         } else {
            this.providerParams.input.coe = "";
         }
      }

      this.mobileApplyFilters();
      this.goToFirstPage();
      this.getProviders();
      this.mobileCloseFilterWindow();
   }

   /** Sort logic **/

   //Sort logic - Mobile
   mobileSortFocusIn() {
      this.template.querySelector(".item_list").classList.add("nds-hide");
      //this.template.querySelector(".sort_list_mo").classList.remove("nds-hide");
      if (!this.selectedSortId) {
         this.sortShowBadge("B005M");
      } else {
         this.sortShowBadge(this.selectedSortId);
      }

      let isHiddenMo = this.template.querySelector(".sort_list_mo").classList.contains("nds-hide");
      if (isHiddenMo) {
         this.template.querySelector(".sort_list_mo").classList.remove("nds-hide");
      } else {
         this.mobileSortWindlowClose();
      }
   }

   mobileSortWindlowClose() {
      this.template.querySelector(".sort_list_mo").classList.add("nds-hide");
   }

   // Sort logic - Desktop
   sortFocusIn() {
      let sortId = this.selectedSortId;
      // let sortDir = this.sortDirection;
      // let selectedSort = this.selectedSort;

      let isHidden = this.template.querySelector(".sort_list").classList.contains("nds-hide");

      if (!sortId) {
         this.sortShowBadge("B005");
      } else {
         this.sortShowBadge(this.selectedSortId);
      }
      //this.template.querySelector(".sort_list").classList.remove("nds-hide");

      if (isHidden) {
         this.template.querySelector(".sort_list").classList.remove("nds-hide");
      } else {
         this.sortWindlowClose();
      }
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
      // MVP-1079 : Sort By Enhancements - Starts here
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
         // this.sortAppendName();
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

   sortApply() {
      //Will call the dynamic API
      let sortbyField;
      let sortOrder = this.sortDirection.toLowerCase();
      let sortId = this.selectedSortId;
      switch (this.selectedSort) {
         // MVP-1079 : Sort By Enhancements - Starts here
         case "Name A-Z":
            this.sortBy = "Name A-Z";
            sortbyField = "providerFullName.normalize";
            break;
         case "Name Z-A":
            this.sortBy = "Name Z-A";
            sortbyField = "providerFullName.normalize";
            sortOrder = sortOrder === "desc" ? "asc" : "desc";
            break;
         case "Specialty A-Z":
            this.sortBy = "Specialty A-Z";
            sortbyField = "speciality.keyword";
            break;
         case "Specialty Z-A":
            this.sortBy = "Specialty Z-A";
            sortbyField = "speciality.keyword";
            sortOrder = sortOrder === "desc" ? "asc" : "desc";
            break;
         case "Accepting New Patients":
            this.sortBy = "Accepting New Patients";
            sortbyField = "acceptingNewPatients.keyword";
            sortOrder = sortOrder === "asc" ? "desc" : "asc";
            break;
         case "ACPNY":
            this.sortBy = "ACPNY";
            sortbyField = "prefProvACPNY.keyword";
            sortOrder = sortOrder === "asc" ? "desc" : "asc";
            break;
         case "BronxDocs":
            this.sortBy = "BronxDocs";
            sortbyField = "BronxDocs";
            sortOrder = sortOrder === "asc" ? "desc" : "asc";
            break;
         // MVP-1079 : Sort By Enhancements - Ends here
         default:
            this.sortBy = "Distance - Closest";
            sortbyField = "";
      }

      this.providerParams.input.order = sortOrder;
      this.providerParams.input.sortByField = sortbyField;
      this.goToFirstPage();
      this.getProviders();
   }

   updateSortFields() {
      var sortData = { selectedSort: this.selectedSort, selectedSortId: this.selectedSortId, sortDirection: this.sortDirection };
      this.omniApplyCallResp(sortData);
   }
   /** End - Sort logic **/

   resetSortParams() {
      //Reseting Sort
      this.providerParams.input.from = "0";
      this.providerParams.input.order = "";
      this.providerParams.input.sortByField = "";
      this.selectedSort = "";
      this.selectedSortId = "";
      this.sortDirection = "ASC";
      this.sortIdNum = "";
   }
   resetFilterParams() {
      //Reseting Filter
      this.providerParams.input.providerFullName = "";
      this.providerParams.input.providerAriaLabel = "";
      this.providerParams.input.language = "";
      this.providerParams.input.gender = "";
      this.providerParams.input.hospitalAffiliation = "";
      this.providerParams.input.wheelchair = "";
      this.providerParams.input.acceptingNewPatients = "";
      this.providerParams.input.ACPNY = "";
      this.providerParams.input.bronxDocs = "";
      this.providerParams.input.homelessShelter = "";
      this.providerParams.input.virtualCareProvider = "";
      this.providerParams.input.coe = "";
      this.providerParams.input.preferredOnly = "";
      this.providerParams.input.groupName = "";
   }

   goToFirstPage() {
      this.providerParams.input.from = 0;
      this.pagerFirstEle = 0;
   }

   handleMapToggle(evt) {
      /*var pressed = (evt.target.getAttribute("aria-pressed") === "true");
      evt.target.setAttribute("aria-pressed", !pressed);
      this.showMap = evt.target.getAttribute("aria-pressed");*/
      this.showMap = evt.target.checked;
      evt.target.setAttribute("aria-checked", evt.target.checked);
   }

   handleMapMarkerSelect(event) {
      this.selectedMapMarkerValue = event.detail.selectedMarkerValue;
      let filteredProv = this.providersTracked.filter((prov) => {
         return prov.ProviderId == this.selectedMapMarkerValue;
      });
      this.pinnedProviderFullName = filteredProv[0].providerFullName;
      this.pinDetailDirLink = filteredProv[0].directionsUrl;
      this.pinDetailPhone = filteredProv[0].Phone;
      this.pinDetailPhoneLink = `tel:${this.pinDetailPhone}`;
      let selectedProvider = this.template.querySelector(`[data-target-id="${this.selectedMapMarkerValue}"]`);
      selectedProvider.focus();
      this.openMapDetail = true;
   }

   handleClosePinDetail() {
      this.openMapDetail = false;
      this.pinnedProviderFullName = "";
      this.pinnedProviderTitle = "";
      this.pinDetailDirLink = "";
      this.pinDetailPhone = "";
      this.pinDetailPhoneLink = "";
   }

   handleMapMarkerSelected(evt) {
      let selectedProvider = this.template.querySelector(`[data-target-id="${evt.detail}"]`);
      selectedProvider.focus();
   }

   handleViewSelect(evt) {
      this.selectedViewNumber = evt.target.value;
      this.providerParams.input.size = this.selectedViewNumber;
      this.goToFirstPage();
      this.getProviders();
   }

   handleViewSelectCombo(evt) {
      this.selectedViewNumber = evt.detail.value;
      this.providerParams.input.size = this.selectedViewNumber;
      this.goToFirstPage();
      this.getProviders();
   }

   handleNewPage(evt) {
      this.providerParams.input.from = evt.detail.from;
      this.pagerFirstEle = evt.detail.from;
      this.getProviders();
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

   navigateToMutlipleOffice(evt) {
      if (evt) {
         //Set selected Provider Id
         const provId = evt.target.getAttribute("data-btn-id");
         let mulOffice = this.providers.find((provider) => provider.ProviderId === provId);

         let viewMutlipleOffice = { viewMutlipleOffice: "Yes", viewProviderDetails: "No" };
         // Accepting New Patients
         let profileId = { profileId: mulOffice.multiOfficesProviderId };
         this.omniApplyCallResp(profileId);
         this.omniApplyCallResp(viewMutlipleOffice);
         // setTimeout(function(){}, 100);
         this.omniNextStep();
      }
   }

   openProviderComparison() {
      // if ()
      this.provJsonData = JSON.parse(JSON.stringify(this.omniJsonData));
      //console.log("openProviderComparison - this.provJsonData", this.provJsonData);
      if (Object.prototype.hasOwnProperty.call(this.provJsonData, "providersToCompare")) {
         //   if (Object.prototype.hasOwnProperty("providersToCompare")) {
         this.providersToCompare = this.provJsonData.providersToCompare;

         //Footer Logic 3
         // this.providersToCompare = this.providersToCompare.filter((v,i,a)=>a.findIndex(t=>(t.Id === v.Id))===i);

         if (this.providersToCompare.length >= 2) {
            this.loading = true;
            let providerId = [];
            this.providersToCompare.forEach((p) => {
               providerId.push(p.providerId);
            });

            //Footer Logic 4
            // providerId = providerId.map(providerId => providerId.Id);

            providerId = providerId.toString();
            providerId = providerId.replace(/,/g, ", ");

            let planType;
            let networkId;
            let tenantId;
            let zipCode;
            let distance;
            let networkCode;

            if (this.isPublic == true) {
               planType = "";
               networkId = "";
               networkCode = "";
               tenantId = this.provJsonData.tenantId;
               zipCode = this.provJsonData.zipCodePublic;
               distance = this.provJsonData.distanceMilesPublic;
            } else {
               planType = this.provJsonData.SelectedPlanInfo.brand;
               networkId = this.provJsonData.SelectedPlanInfo.networkId;
               networkCode = this.provJsonData.SelectedPlanInfo.networkCode;
               tenantId = this.provJsonData.tenantId;
               zipCode = this.provJsonData.STEP_ChooseLocation.TXT_ZipCode;
               distance = this.provJsonData.distance;
            }

            let inputParam = { providerId: providerId, planType: planType, tenantId: tenantId, networkId: networkId, zipCode: zipCode, distance: distance, networkCode: networkCode };
            const params = {
               input: inputParam,
               sClassName: "omnistudio.IntegrationProcedureService",
               sMethodName: "Member_comapreDetails",
               options: "{}",
            };

            //Call out the Member_ProviderDetails IP
            this.omniRemoteCall(params, true)
               .then((response) => {
                  if (response.result.IPResult) {
                     let providerInfoArray = [];
                     let iPreturn = response.result.IPResult;
                     if (Array.isArray(iPreturn.reviewProviderDetails.providerInformation) === false) {
                        providerInfoArray.push(iPreturn.reviewProviderDetails.providerInformation);
                     } else {
                        providerInfoArray = iPreturn.reviewProviderDetails.providerInformation;
                     }
                     // this.providerComparison = providerInfoArray.providerInformation;
                     this.providerComparison = providerInfoArray;

                     this.modalProviderComparison = true;

                     this.providerComparison.forEach((provider) => {
                        //below is still causing error if IP return doesnt have all nodes. Was told to leave as is for now, but should probably be looked at later
                        if (provider.providerLocations[0].provAddress.addressLine1 != null) {
                           provider.addressLine1 = provider.providerLocations[0].provAddress.addressLine1;
                           provider.addressLine2 = provider.providerLocations[0].provAddress.addressLine2;
                           provider.city = provider.providerLocations[0].provAddress.city;
                           provider.state = provider.providerLocations[0].provAddress.state;
                           provider.zip = provider.providerLocations[0].provAddress.zip;

                           // Getting Provider Phone
                           if (Object.prototype.hasOwnProperty.call(provider.providerLocations[0].provAddress, "provAddressContact")) {
                              provider.providerPhone = provider.providerLocations[0].provAddress.provAddressContact.phone;
                           }

                           //  Format Zip Code
                           if (provider.zip === undefined || provider.zip === null || provider.zip === "") {
                              provider.zip = "";
                           } else {
                              provider.zip = provider.zip.substring(0, 5);
                           }
                        }
                        //Distance from
                        provider.distanceFromZip = provider.distanceFromZip.toFixed(2);

                        //Label
                        provider.providerAriaLabel = "Choose " + provider.providerFullName + " as your primary care provider";

                        //ACPNY
                        if (provider.ACPNY == "Y") {
                           provider.ACPNY = "Yes";
                        } else {
                           provider.ACPNY = "No";
                        }

                        //Wheelchair Accessible
                        if (provider.wheelChair == "Y") {
                           provider.wheelchair = "Yes";
                        } else {
                           provider.wheelchair = "No";
                        }

                        // See if provider is BronxDocs
                        if (provider.networkProviderPrefix === "BXD1") {
                           provider.bronxDocs = "Yes";
                        } else {
                           provider.bronxDocs = "No";
                        }

                        // See if provider is FHN}
                        if (provider.isFHN != null) {
                           if (provider.isFHN == "YES") {
                              provider.FHN = true;
                           } else {
                              provider.FHN = false;
                           }
                        }

                        provider.vcp = this.provJsonData.SelectedPlanInfo.virtualCareProvider;
                        if (provider.vcp) {
                           provider.virtualCareProvider = "Yes";
                        } else {
                           provider.virtualCareProvider = "No";
                        }

                        // Logic for Education Field
                        let medSchool = 0;
                        if (provider.providerEducation != null || provider.providerEducation != undefined) {
                           for (let e = 0; e < provider.providerEducation.length; e++) {
                              if (medSchool != 1) {
                                 if (provider.providerEducation[e].trainingCategoryDesc === "Education" && provider.providerEducation[e].medSchool != null) {
                                    provider.education = provider.providerEducation[e].medSchool;
                                    medSchool = 1;
                                 }
                              }
                           }
                           // If no medSchool available
                           if (provider.education == "" || provider.education == null) {
                              provider.education = "No information present";
                           }
                        } else {
                           provider.education = "No information present";
                        }

                        if (provider.providerSpecialties != null || provider.providerSpecialties != undefined) {
                           if (provider.providerSpecialties.length > 0) {
                              provider.specialty = provider.providerSpecialties[0].specialty;
                              for (let a = 0; a < provider.providerSpecialties.length; a++) {
                                 if (provider.providerSpecialties[a].boardCertified === "Yes") {
                                    provider.boardCert = provider.providerSpecialties[a].specialty + " - " + provider.providerSpecialties[a].boardCertified;
                                 } else {
                                    provider.boardCert = "No information present";
                                 }
                              }
                           }
                        }

                        // Show or Hide Choose as PCP Link
                        if (Object.prototype.hasOwnProperty.call(this.provJsonData, "PCPLink")) {
                           if (Object.prototype.hasOwnProperty.call(this.provJsonData.PCPLink, "EnableFlag")) {
                              if (this.provJsonData.PCPLink.EnableFlag === "suppressed") {
                                 // Hide Choose as PCP for all providers
                                 provider.chooseAsPCPLink = false;
                              } else if (this.provJsonData.PCPLink.EnableFlag != "suppressed") {
                                 if ((provider.isPCP == "Yes" || provider.isPCP == "Y") && (provider.leavingNetwork == "N" || provider.leavingNetwork == "No")) {
                                    // Show Choose as PCP for particular provider
                                    provider.chooseAsPCPLink = true;
                                 } else {
                                    // Hide Choose as PCP for particular provider
                                    provider.chooseAsPCPLink = false;
                                 }
                              }
                           }
                        } else {
                           provider.chooseAsPCPLink = false;
                        }

                        // Set Plan Accepted
                        // provider.planAc = this.provJsonData.MemberInfo.planName;
                        provider.planAc = this.provJsonData.SelectedPlanInfo.planName;

                        // Languages Spoken
                        let langArray = [];
                        if (provider.languagesSpoken != null || provider.languagesSpoken != undefined) {
                           if (Array.isArray(provider.languagesSpoken)) {
                              provider.multipleLan = true;
                              provider.languagesSpoken.forEach((lan) => {
                                 let languageItem = {};
                                 languageItem.key = "Idiom";
                                 languageItem.Value = lan;
                                 langArray.push(languageItem);
                              });
                              if (!(Array.isArray(provider.languagesProviderComparison) && provider.languagesProviderComparison.length)) {
                                 provider.languagesProviderComparison = [...langArray];
                              }
                           }
                           //  provider.language = this.languages;
                        } else {
                           provider.multipleLan = false;
                           provider.language = "No information present";
                        }

                        // Hospital Affiliations
                        if (provider.hospitalAffiliations.affiliationName != null || provider.hospitalAffiliations.affiliationName != undefined) {
                           if (Array.isArray(provider.hospitalAffiliations.affiliationName)) {
                              this.hospitalAff = provider.hospitalAffiliations.affiliationName;
                              provider.multipleHos = true;
                              provider.hospitals = this.hospitalAff;
                           } else {
                              provider.multipleHos = false;
                              provider.hospitalAffiliation = provider.hospitalAffiliations.affiliationName;
                           }
                        } else {
                           provider.multipleHos = false;
                           provider.NoHospital = "No Information present";
                        }

                        // Office Hours
                        if (provider.providerLocations[0].provAddress.officeHours != null || provider.providerLocations[0].provAddress.officeHours != undefined) {
                           if (Array.isArray(provider.providerLocations[0].provAddress.officeHours)) {
                              provider.mondayClosed = true;
                              provider.tuesdayClosed = true;
                              provider.wednesdayClosed = true;
                              provider.thursdayClosed = true;
                              provider.fridayClosed = true;
                              provider.saturdayClosed = true;
                              provider.sundayClosed = true;
                              for (let j = 0; j < provider.providerLocations[0].provAddress.officeHours.length; j++) {
                                 if (
                                    provider.providerLocations[0].provAddress.officeHours[j].officeDays == null &&
                                    provider.providerLocations[0].provAddress.officeHours[j].officeFromHours == null &&
                                    provider.providerLocations[0].provAddress.officeHours[j].officeToHours == null
                                 ) {
                                    provider.noHours = true;
                                 } else {
                                    if (
                                       provider.providerLocations[0].provAddress.officeHours[j].officeDays === "MONDAY" &&
                                       provider.providerLocations[0].provAddress.officeHours[j].officeFromHours != null
                                    ) {
                                       provider.noHours = false;
                                       provider.mondayClosed = false;
                                       provider.mondayFrom = provider.providerLocations[0].provAddress.officeHours[j].officeFromHours;
                                       provider.mondayTo = provider.providerLocations[0].provAddress.officeHours[j].officeToHours;
                                    } else if (
                                       provider.providerLocations[0].provAddress.officeHours[j].officeDays === "TUESDAY" &&
                                       provider.providerLocations[0].provAddress.officeHours[j].officeFromHours != null
                                    ) {
                                       provider.noHours = false;
                                       provider.tuesdayClosed = false;
                                       provider.tuesdayFrom = provider.providerLocations[0].provAddress.officeHours[j].officeFromHours;
                                       provider.tuesdayTo = provider.providerLocations[0].provAddress.officeHours[j].officeToHours;
                                    } else if (
                                       provider.providerLocations[0].provAddress.officeHours[j].officeDays === "WEDNESDAY" &&
                                       provider.providerLocations[0].provAddress.officeHours[j].officeFromHours != null
                                    ) {
                                       provider.noHours = false;
                                       provider.wednesdayClosed = false;
                                       provider.wednesdayFrom = provider.providerLocations[0].provAddress.officeHours[j].officeFromHours;
                                       provider.wednesdayTo = provider.providerLocations[0].provAddress.officeHours[j].officeToHours;
                                    } else if (
                                       provider.providerLocations[0].provAddress.officeHours[j].officeDays === "THURSDAY" &&
                                       provider.providerLocations[0].provAddress.officeHours[j].officeFromHours != null
                                    ) {
                                       provider.noHours = false;
                                       provider.thursdayClosed = false;
                                       provider.thursdayFrom = provider.providerLocations[0].provAddress.officeHours[j].officeFromHours;
                                       provider.thursdayTo = provider.providerLocations[0].provAddress.officeHours[j].officeToHours;
                                    } else if (
                                       provider.providerLocations[0].provAddress.officeHours[j].officeDays === "FRIDAY" &&
                                       provider.providerLocations[0].provAddress.officeHours[j].officeFromHours != null
                                    ) {
                                       provider.noHours = false;
                                       provider.fridayClosed = false;
                                       provider.fridayFrom = provider.providerLocations[0].provAddress.officeHours[j].officeFromHours;
                                       provider.fridayTo = provider.providerLocations[0].provAddress.officeHours[j].officeToHours;
                                    } else if (
                                       provider.providerLocations[0].provAddress.officeHours[j].officeDays === "SATURDAY" &&
                                       provider.providerLocations[0].provAddress.officeHours[j].officeFromHours != null
                                    ) {
                                       provider.noHours = false;
                                       provider.saturdayClosed = false;
                                       provider.saturdayFrom = provider.providerLocations[0].provAddress.officeHours[j].officeFromHours;
                                       provider.saturdayTo = provider.providerLocations[0].provAddress.officeHours[j].officeToHours;
                                    } else if (
                                       provider.providerLocations[0].provAddress.officeHours[j].officeDays === "SUNDAY" &&
                                       provider.providerLocations[0].provAddress.officeHours[j].officeFromHours != null
                                    ) {
                                       provider.noHours = false;
                                       provider.sundayClosed = false;
                                       provider.sundayFrom = provider.providerLocations[0].provAddress.officeHours[j].officeFromHours;
                                       provider.sundayTo = provider.providerLocations[0].provAddress.officeHours[j].officeToHours;
                                    }
                                 }
                              }
                           }
                        } else {
                           provider.noHours = true;
                        }

                        this.loading = false;
                     });
                  } else {
                     console.error(`${this.errorMessage} Member_comapreDetails`);
                     this.loading = false;
                  }
               })
               .catch((error) => {
                  console.error("error", error);
                  this.loading = false;
               });
         } else {
         }
      }
   }

   closeModalProviderComparison() {
      this.modalProviderComparison = false;
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
         this.addProvider(provId);
      }
   }

   removeFromCompare(provId) {
      if (provId) {
         this.removeProvider(provId);
      }
   }

   addProvider(provId) {
      //Filtering only selcted Provider
      let provComp = this.providers.find((provider) => provider.ProviderId === provId);

      //push provider
      if (this.providersToCompare.length < 3) {
         this.providersToCompare.push({ providerId: provComp.ProviderId, name: provComp.providerFullName });
         let provToCom = { providersToCompare: this.providersToCompare };
         this.omniApplyCallResp(provToCom);

         this.providersAmount++;
         this.compareProviders = true;
         provComp.added = true; // For the provider select, change the button label
         this.providersCount = this.providersToCompare.length;
         if (this.providersToCompare.length === 3) {
            this.providers.forEach((provider) => {
               if (provider.added) {
                  provider.isBtnDisabled = false;
               } else {
                  provider.isBtnDisabled = true;
               }
            });
         }
         this.showCompareFooter = true;
      }

      let viewPCPUpdate = { viewPCPUpdate: "Yes", viewProviderDetails: "No", viewMutlipleOffice: "No" };
      this.omniApplyCallResp(viewPCPUpdate);
   }

   removeProvider(provId2) {
      let provComp = this.providers.find((provider) => provider.ProviderId === provId2);

      if (this.providersToCompare.length != 0) {
         for (let r = 0; r < this.providersToCompare.length; r++) {
            if (this.providersToCompare[r].providerId === provId2) {
               this.providersToCompare.splice(r, 1);

               let provToCom = { providersToCompare: this.providersToCompare };
               this.omniApplyCallResp(provToCom);
               if (provComp) {
                  provComp.added = false; // Set original label for specific button
               }
               this.providersCount = this.providersToCompare.length;
            }
         }
         //enable button
         this.providers.forEach((provider) => {
            provider.isBtnDisabled = false;
         });
         //close footer
         if (this.providersToCompare.length == 0) {
            this.showCompareFooter = false;
         }
      } else {
         // console.log("providersToCompare is empty");
      }
   }

   acpnySite() {
      window.open("https://attentisconsulting.com/contact/", "_blank");
      this.bronxClose();
   }

   bronxSite() {
      window.open("https://attentisconsulting.com/contact/", "_blank");
      this.bronxClose();
   }

   redirectMenu(evt) {
      if (evt) {
         let name = evt.target.title;

         this.allowACPNYRedirect = false;
         this.allowBronxDocsRedirect = false;
         if (name == "ACPNY") {
            this.allowACPNYRedirect = true;
         }

         if (name == "BronxDocs") {
            this.allowBronxDocsRedirect = true;
         }

         this.bronxModal = true;
         // Desktop or Mobile
         if (window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes("CommunityHybridContainer")) {
            this.redirectMessage = "This link will open in your browser. You can come back to the app at any time to pick up where you left off.";
         } else {
            this.redirectMessage = "This link will take to a new tab, but your " + this.bronxCompanyName + " session will remain active in this tab.";
         }
      }
   }

   bronxClose() {
      this.bronxModal = false;
   }

   handleRemoveCompare(event) {
      let providerId = event.currentTarget.dataset.providerid;
      if (this.providersToCompare.length > 1) {
         this.removeProvider(providerId);
      } else if (this.providersToCompare.length == 1) {
         this.removeProvider(providerId);
         this.providersToCompare = [];
         this.showCompareFooter = false;
      }
   }

   removeAllComparison() {
      let arrayLength = this.providersToCompare.length;
      for (let i = 0; i < arrayLength; i++) {
         let providerId = this.providersToCompare[0].providerId;
         this.removeProvider(providerId);
      }
      this.providersToCompare = [];
      this.showCompareFooter = false;
   }

   backToFindCareHome() {
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

      let findCarePublicSite = `${protocol}//${hostUrl}/${type}/s/find-care-services`;
      window.open(findCarePublicSite, "_self");
   }

   backToFindCarePlan() {
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

      let findCarePublicSite = `${protocol}//${hostUrl}/${type}/s/find-care-plans`;
      window.open(findCarePublicSite, "_self");
   }
}
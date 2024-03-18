import { LightningElement, track, api } from 'lwc';
import { getDataHandler } from "omnistudio/utility";
import { loadCssFromStaticResource } from 'omnistudio/utility';

export default class MemberPharmacyPage extends LightningElement {
    @track productGroupingBrand;
    @track isDefaultPlan;
    @track tenant;
    @track tenantUrl;
    @track companyName;
    @track vendorName;
    @track healthyHeader;
    @track healthyText;
    @track healthyLink;
    @track linkGoTo;
    @track isCommercialESI = false;
    @track isMedicareESI = false;
    @track buttonClicked;
    url;

    subHeader = "Your Pharmacy benefits are managed by Express Scripts (ESI). For questions about your pharmacy coverage, call the Customer Service number on the back of your ID card.";
    bodySubHeader = "You can view and manage all of your pharmacy benefits through Express Scripts, including:";
    attentisPharmacyResources = "View and download forms, learn about programs available to you, get answers to your questions, and more.";
    mobileInternalPopUp = "This link will open in your browser. You can come back to the app at any time to pick up where you left off.";

    //Boolean tracked variable to indicate if modal is open or not default value is false as modal is closed when page is loaded
    isInternalDisclaimerModalOpen = false;
    isExternalDisclaimerModalOpen = false;
    @track isActiveDefault = false;
    isCommercial = false;
    isMedicare = false;

    @api
    get productBrandGrouping() {
        return this._productBrandGrouping;
    }
    set productBrandGrouping(valProductBrandGrouping) {
        this.productGroupingBrand = valProductBrandGrouping;
    }

    @api
    get defaultPlan() {
        return this._defaultPlan;
    }
    set defaultPlan(valDefaultPlan) {
        this.isDefaultPlan = valDefaultPlan;
    }

    get headerClass() {
        if(this.isDefaultPlan == 'Y') {
            return 'nds-page-header_title desktopHeader';
        } else {
            return 'nds-page-header_title';
        }
    }

    connectedCallback() {
        let completeURL = '/assets/styles/vlocity-newport-design-system-scoped.min.css';
        loadCssFromStaticResource(this, 'newportAttentisAlt', completeURL).then(resource => {
           console.log(`Theme loaded successfully`);
        }).catch(error => {
           console.log(`Theme failed to load => ${error}`);
        });
        this.tenantDefinition();
        let type;
        let protocol;
        const urlString = window.location.href;
        const hostUrl = window.location.host;
        let urlArray = urlString.split('/');
        for (let index = 0; index < urlArray.length; index++) {
            let element = urlArray[index];
            if (element == 'memberportal') {
                type = element;
            }
            if (element == 'https:') {
                protocol = element;
            }
            if (element == 'http:') {
                protocol = element;
            }
        }
        if (type == 'member') {   
            this.url = protocol + '//' + hostUrl + '/' + type + '/s/medication-coverage-form';
        }    
    }

    tenantDefinition() {
        this.tenantUrl = window.location.pathname;
        this.tenant = "Attentis";
        this.companyName = "Attentis Health";
        this.healthyHeader = "Forms and Documents";
        this.healthyText = "";
    }

    openExternalDisclaimer(evt){
        this.buttonClicked = evt.target.getAttribute("data-name");
        this.vendorName = "Express Script";
        this.isExternalDisclaimerModalOpen = true;
        if (evt){
            //Set selected section name
            this.sectionName = evt.target.getAttribute("section-name");
            this.btnName = evt.target.getAttribute("data-btn-id");
        } 
        if(this.productGroupingBrand == "Commercial"){
            this.isCommercialESI = true;
            if(this.sectionName == "GoToPharmacyResources"){
                this.vendorName = "Go to Pharmacy Resources";
            }else if(this.sectionName == "PreauthorizationForPharmacy"){
               this.vendorName = "Express Script";
                this.companyName = "Attentis Health";
            }
            this.companyName = "Attentis Health";
        }
        else if(this.productGroupingBrand == "Medicare"){
            this.isMedicareESI = true;
            if(this.sectionName == "GoToPharmacyResources"){
                this.vendorName = "Go to Pharmacy Resources";
            }else if(this.sectionName == "PreauthorizationForPharmacy"){
               this.vendorName = "Express Script";
                this.companyName = "Attentis Health";
            }
            this.companyName = "Attentis Health";
        }
    }

    callIP(ipMethod, inputMap) {
        this.loading = true;
        let datasourcedef = JSON.stringify({
           type: "integrationprocedure",
           value: {
              ipMethod: ipMethod,
              inputMap: inputMap,
              optionsMap: "",
           },
        });
  
        return getDataHandler(datasourcedef)
           .then((data) => {
              this.loading = false;
              return JSON.parse(data);
           })
           .catch((error) => {
              console.error(`failed at getting IP data => ${JSON.stringify(error)}`);
              this.loading = false;
           });
    }


    // To close the External Disclaimer Popup
    closeEDM(){
        this.isExternalDisclaimerModalOpen = false;
    }

    // setting Internal Links, company name and vendor name dynamically based on tenant
    openInternalDisclaimer(evt){
        this.vendorName = "Go to Express Scripts";
        this.isInternalDisclaimerModalOpen = true;

        if (evt){
            this.sectionName = evt.target.getAttribute("section-name");
            this.btnName = evt.target.getAttribute("data-btn-id");
        } 

        if(this.sectionName == "PharmacyResources"){
            this.companyName = "Attentis Health";
            this.linkGoTo = "https://attentisconsulting.com/";
        }else if(this.sectionName == "SpecialtyDrugPreauthorization"){
            this.companyName = "Attentis Health";
            this.linkGoTo = "https://attentisconsulting.com/";
        }else if(this.sectionName == "Formulary"){
            if(this.productGroupingBrand == "Commercial"){
                this.companyName = "Attentis Health";
                this.linkGoTo = "https://attentisconsulting.com/";
            }
            else if(this.productGroupingBrand == "Medicare"){
                this.companyName = "Attentis Health";
                this.linkGoTo = "https://attentisconsulting.com/";
            }
        }
    }

    ssoLink(){
        window.location.href = 'https://attentisconsulting.com/contact/';
    }

    // To close Internal Disclaimer Popup.
    closeIDM(){
        this.isInternalDisclaimerModalOpen = false;
    }

    // Redirection of Internal Links
    openLinkIDM(){
        if (this.sectionName == "null" || this.sectionName == "null" || this.sectionName == undefined){
        } else {
            window.open(this.linkGoTo);
        }
        this.isInternalDisclaimerModalOpen = false;
    }

    openMedicationForm() {
        window.location.replace(this.url);
    }

    renderedCallback(){
        let mainContent = this.template.querySelector('.desktopHeader');
        if(mainContent != null)
        mainContent.setAttribute('id','maincontent');
        const focusableElements = 'anchor, button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const modal = this.template.querySelector(".modalAccessibility");

        if (modal != undefined){
           const firstFocusableElement = modal.querySelectorAll(focusableElements)[0]; // get first element to be focused inside modal
           const focusableContent = modal.querySelectorAll(focusableElements);
           const lastFocusableElement = focusableContent[focusableContent.length - 1]; // get last element to be focused inside modal         
              var me = this;
              window.addEventListener('keydown', function(event) {
              let isTabPressed = event.key === 'Tab' || event.keyCode === 9;
                 if (!isTabPressed) {
                    return;
                 }
                 if (event.shiftKey) { // if shift key pressed for shift + tab combination
                    if (me.template.activeElement === firstFocusableElement) {
                       lastFocusableElement.focus(); // add focus for the last focusable element
                       event.preventDefault();
                 }
                 } else { // if tab key is pressed
                    if (me.template.activeElement === lastFocusableElement) { // if focused has reached to last focusable element then focus first focusable element after pressing tab
                       firstFocusableElement.focus(); // add focus for the first focusable element
                       event.preventDefault();
                    }
                 }
              });

           firstFocusableElement.focus();

              window.addEventListener('keyup', function(event) {
                 if(event.keyCode === 27 || event.key === "Escape"){
                    console.log("Escape pressed");
                    me.closeEDM();
                    me.closeIDM();
                 }
              });
        }
    }
}
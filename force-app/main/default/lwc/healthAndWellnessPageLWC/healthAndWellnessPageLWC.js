import { LightningElement, api, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import { getUserProfile,getDataHandler } from "omnistudio/utility";
import { loadCssFromStaticResource } from 'omnistudio/utility';


export default class HealthAndWellnessPageLWC extends OmniscriptBaseMixin(NavigationMixin(LightningElement)) {
    loading = true;
    @track brandMain;
    @track lobIdMain;
    @track lobdMctrMain;
    @track networkCodeMain;
    @track planIdMain;
    @track productGroupMain;
    @track planNameMain;

    @track showWellnessProgramAllMembers = false;
    @track showBenefitsVideoCNYGoldMembers = false;
    @track showHealthRiskAssessment = false;
    @track showFitnessBenefits = false;
    @track showAdvancedCare = false;
    @track showBenefitHub = true;

    @track ashText = false;
    @track silverSneakersText = false;
    @track activeFitText = false;

    @track healthyHeader;
    @track healthyText;
    @track healthyLink;

    @track wellnessProgramText;
    @track wellnessGoldMemberText = false;
    @track companyName;
    @track tenantUrl;
    @track tenant;
    @track linkTogo = "";
    @track linkExternal = "";
    @track externalDisclaimer;
    @track silverSneakerText = false;
    @track silverSneakerGoText = false;
    @track benefitHubText = true;
    @track bsdlAvailable;
    @track bsdlASH;
    @track provider = "";
    @track getStartedParams = "{}";

    //Boolean tracked variable to indicate if modal is open or not default value is false as modal is closed when page is loaded
    isInternalDisclaimerModalOpen = false;
    isExternalDisclaimerModalOpen = false;
    isAdvancedCareModalOpen = false;
    isWellnessProgramModalOpen = false;
    wellnessMobileApp = false;

    memberFirstNameVal
    memberLastNameVal;
    memberIdVal;
    memberZipCode;
    memberBirthDate;
    birthdateVal;
    _userId;
    @track gotoVideovalue=false;
    @track listMember;
    @track coniferDisclaimer="";
    @track coniferDisclaimerFlag=false;
    @track userName="";
    @track JunctionRecordName;
    @track TOSacceptedDate;
    @track DC ={};

    @api
    get brand() {
        return this._brand;
    }
    set brand(valBrand) {
        this.brandMain = valBrand;
    }

    @api
    get lobId() {
        return this._lobId;
    }
    set lobId(valLobId) {
        this.lobIdMain = valLobId;
    }

    @api
    get lobdMctr() {
        return this._lobdMctr;
    }
    set lobdMctr(valMctr) {
        this.lobdMctrMain = valMctr;
    }

    @api
    get networkCode() {
        return this._networkCode;
    }
    set networkCode(valNetworkCode) {
        this.networkCodeMain = valNetworkCode;

        if (valNetworkCode == "HT01") {
            this.getCnyGold();
        }
    }

    @api
    get productBrandGrouping() {
        return this._productBrandGrouping;
    }
    set productBrandGrouping(valProductBrandGrouping) {
        this.productGroupMain = valProductBrandGrouping;
    }

    @api
    get planId() {
        return this._planId;
    }
    set planId(valPlan) {

        this.planIdMain = valPlan;
        this.getBSDL();
    }

    @api
    get planName() {
        return this._planName;
    }
    set planName(valPlanName) {

        this.planNameMain = valPlanName;
        this.getAdvancedCare();
    }

    @api
    get memberFirstName() {
        return this._memberFirstName;
    }
    set memberFirstName(valMemberFirstName) {

        this.memberFirstNameVal = valMemberFirstName;
    }

    @api
    get memberLastName() {
        return this._memberLastName;
    }
    set memberLastName(valMemberLastName) {

        this.memberLastNameVal = valMemberLastName;
    }

    @api
    get memberId() {
        return this._memberId;
    }
    set memberId(valMemberId) {

        this.memberIdVal = valMemberId;
    }

    @api
    get zipCode() {
        return this._zipCode;
    }
    set zipCode(valZipCode) {

        this.memberZipCode = valZipCode;
    }

    @api
    get birthdate() {
        return this._birthdate;
        
    }
    set birthdate(valBirthdate) {
        
        this.listMember = valBirthdate;
       
    }

    

    connectedCallback() {
        let completeURL = '/assets/styles/vlocity-newport-design-system-scoped.min.css';
        loadCssFromStaticResource(this, 'newportAttentisAlt', completeURL).then(resource => {
           console.log(`Theme loaded successfully`);
        }).catch(error => {
           console.log(`Theme failed to load => ${error}`);
        });
        this.getAsyncProfile();
        this.tenantDefinition();
        if (window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes('CommunityHybridContainer')) {
            this.wellnessMobileApp = true;
        };

    }
    async getAsyncProfile() {
        this._userProfile = await getUserProfile();
        this._userId = this._userProfile.userid;
        this.userName = this._userProfile.username;
        await this.getConiferDisclaimer();
     }

    renderedCallback() {
        if(this.listMember){
            for(var i=0; i < this.listMember.length; i++){
                if(this.listMember[i].memberId == this.memberIdVal){
                    this.brandMain = this.listMember[i].productBrandGroup;
                    this.birthdateVal = this.listMember[i].birthdate;
                }
            }
            this.showBenefitHub = true;
        }
        if(this.wellnessGoldMemberText == true && this.coniferDisclaimerFlag == true){
            this.template.querySelector('.wellness-page-wrapper').classList.add("terms-unaccepted");
        }

        if(this.template.querySelector('.elementHoldingHTMLContent')){
            this.template.querySelector('.elementHoldingHTMLContent').innerHTML = this.coniferDisclaimer;
            }
        
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const modal = this.template.querySelector(".modalAccessibility");

        if (modal != undefined) {
            const firstFocusableElement = modal.querySelectorAll(focusableElements)[0]; // get first element to be focused inside modal
            const focusableContent = modal.querySelectorAll(focusableElements);
            const lastFocusableElement = focusableContent[focusableContent.length - 1]; // get last element to be focused inside modal         

            var me = this;
            window.addEventListener('keydown', function (event) {
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

            window.addEventListener('keyup', function (event) {
                if (event.key === "Escape") {
                    me.closeIDM();
                    me.closeEDM();
                }
            });
        }
    }

    tenantDefinition() {
        this.tenantUrl = window.location.pathname;
        this.tenant = "Attentis";
        this.healthyHeader = "Discounts and Rewards";
        this.healthyText = "An Attentis Health plan gives you more than health insurance. As a member, you also have access to special offers and discounts.";
        this.healthyLink = "Go to Discounts and Rewards";
        this.companyName = "Attentis Health";
        this.showFitnessBenefits = false;
    }

    getBSDL() {
        this.defineUserTypes();
        this.loading = false;
    }

    defineUserTypes() {
        if (this.lobIdMain == "1008" || this.lobIdMain == "1005" || this.lobIdMain == "1061" || this.lobIdMain == "1021") {
            this.showHealthRiskAssessment = true;
        }
        if (this.lobIdMain == "1014" || this.lobIdMain == "1015" || this.lobIdMain == "1061" || this.lobIdMain == "1064" || this.lobIdMain == "1006" || this.lobIdMain == "1060") {
            if (this.networkCodeMain == "HT01") {
                this.showWellnessProgramAllMembers = true;
            } else {
                this.showWellnessProgramAllMembers = false; //Wellness Program is not displayed.
            }
        } else {
            this.showWellnessProgramAllMembers = true;  //Wellness Program is displayed.
            this.wellnessGoldMemberText = false;
            this.wellnessProgramText = "Whether you're just getting started or trying to maintain a healthy lifestyle, our wellness program through WellSpark, has all the tools and activities to support you on your journey to better health.";
        }

    }

    fitnessBenefits() {
        if (this.bsdlAvailable == "Y") {
            if (this.lobIdMain == "1008" || this.lobIdMain == "1005" || this.lobIdMain == "1059") {
                this.silverSneakersText = true;
            }
        } else {
            this.silverSneakersText = false;
        }
    }

    getASH() {
        let inputParams = { planId: this.planIdMain, bsdl: "EXER" };
        const params = {
            input: inputParams,
            sClassName: "omnistudio.IntegrationProcedureService",
            sMethodName: "Member_BSDLAvailabie",
            options: "{}",
        };
        this.omniRemoteCall(params, true).then((response) => {
            let bsdlResponseASH = response.result.IPResult;
            this.bsdlASH = bsdlResponseASH.isBSDLAvailable;
            if (this.bsdlASH == "Y") {
                if (this.lobIdMain != "1008" || this.lobIdMain != "1005" || this.lobIdMain != "1059") {
                    this.ashText = true;
                }
            } else {
                this.ashText = false;
                if (this.bsdlASH != "Y" && this.bsdlAvailable != "Y") {
                    this.activeFitText = true;
                } else {
                    this.activeFitText = false;
                }
            }

        });
    }

    getCnyGold() {
        if (this.networkCodeMain == "HT01") {
            this.showBenefitsVideoCNYGoldMembers = true;
            this.showWellnessProgramAllMembers = true;
            this.wellnessGoldMemberText = true;
        } else {
            this.showBenefitsVideoCNYGoldMembers = false;
        }

    }
    openVideoDisclaimer(){
        this[NavigationMixin.Navigate](
            {
               type: "standard__namedPage",
               attributes: {
                  pageName: "health-benefits-video",
               },
            },
            true // Replaces the current page in your browser history with the URL
         );
    }

    openInternalDisclaimer(evt) {
        this.isInternalDisclaimerModalOpen = true;
        this.gotoVideovalue=false;
        if (evt) {
            this.sectionName = evt.target.name;
            this.btnName = evt.target.getAttribute("data-btn-id");
        }
       
        if (this.sectionName == "null" || this.sectionName == "null" || this.sectionName == undefined) {
        } else if (this.sectionName == "Discounts") {
            this.linkTogo = "https://attentisconsulting.com/";
        } else if (this.sectionName == "LiveWell") {
            this.linkTogo = "https://attentisconsulting.com/";
        } else if (this.sectionName == "questionareWellnessGoldMember") {
            this.linkTogo = "https://attentisconsulting.com/";
        }
    }

    closeIDM() {
        this.isInternalDisclaimerModalOpen = false;
    }

    cnyConiferRedirect() {
        const params = {
            input: { memberId: this.memberIdVal, firstName: this.memberFirstNameVal, lastName: this.memberLastNameVal, dateOfBirth: this.birthdateVal, zipCode: this.memberZipCode },
            sClassName: "MBR_ConiferSSO",
            sMethodName: "encryptConiferInput",
            options: "{}"
        };
        this.omniRemoteCall(params, true).then((response) => {
            let resp = response.result.response.finalURL;
            window.open(resp, "_blank");
        }).catch(error => {
            console.error("error while posting data", JSON.stringify(error));
        })
    }

    ssoLink() {
        if (this.networkCodeMain == "HT01") {
            this.cnyConiferRedirect();
        }else {
            let input = {
                    ssoName: "Wellspark Attentis",
            };
            this.callIP("Member_SSOURL", input).then((data) => {
                if (data) {
                    let url = data.IPResult.ssoURL;
                    window.open(url, "_blank");
                }
            })
            this.closeEDM();
        }
    }

    goToVideo(){
        this[NavigationMixin.Navigate](
            {
               type: "standard__namedPage",
               attributes: {
                  pageName: "health-benefits-video",
               },
            },
            true // Replaces the current page in your browser history with the URL
         );
         this.isInternalDisclaimerModalOpen = false;
    }

    openLinkIDM() {
        if (this.sectionName == "null" || this.sectionName == "null" || this.sectionName == undefined) {
        } else {
            window.open(this.linkTogo);
        }
        this.isInternalDisclaimerModalOpen = false;
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

    openExternalDisclaimer(evt) {
        if (evt) {
            //Set selected section name
            this.sectionName = evt.target.getAttribute("section-name");
            this.btnNameExt = evt.target.getAttribute("data-btn-id")
        }
        if  (this.btnNameExt == "BenefitHubDesktop" || this.btnNameExt == "BenefitHubMobile") {
            this.silverSneakerText = false;
            this.silverSneakerGoText = false;
            this.ashTextDisclaimer = false;
            this.benefitHubText = true;
            this.linkExternal = "https://attentisconsulting.com/";
        }
        this.isExternalDisclaimerModalOpen = true;

        if (this.sectionName == "silverSneakers") {
            this.silverSneakerText = true;
            this.silverSneakerGoText = false;
            this.benefitHubText = false;
            this.linkExternal = "https://tools.silversneakers.com/";
        } else if (this.sectionName == "silverSneakersGo") {
            this.silverSneakerGoText = true;
            this.silverSneakerText = false;
            this.benefitHubText = false;
            this.linkExternal = "https://tools.silversneakers.com/";
        } else if (this.sectionName == "ashExerciseRewards") {
            this.silverSneakerText = false;
            this.silverSneakerGoText = false;
            this.ashTextDisclaimer = true;
            this.benefitHubText = false;
            this.linkExternal = "https://www.exerciserewards.com/";
        } else if (this.sectionName == "null" || this.sectionName == null || this.sectionName == undefined) {
            if (this.btnNameExt == "ashExerciseDesktop" || this.btnNameExt == "ashExerciseMobile") {
                this.silverSneakerText = false;
                this.silverSneakerGoText = false;
                this.ashTextDisclaimer = true;
                this.benefitHubText = false;
                this.linkExternal = "https://www.exerciserewards.com/";
            }
        }
    }

    closeEDM() {
        this.isExternalDisclaimerModalOpen = false;
        this.isAdvancedCareModalOpen = false;
        this.isWellnessProgramModalOpen = false;
    }

    openLinkEDM() {
        if (this.sectionName == "null" || this.sectionName == "null" || this.sectionName == undefined) {
            window.open(this.linkExternal);
        } else {
            window.open(this.linkExternal);
        }
        this.isExternalDisclaimerModalOpen = false;
    }


    getAdvancedCare() {
        if ((
            (this.planNameMain == "ATTENTISHEALTH VIP DUAL (HMO SNP)" ||
                this.planNameMain == "ATTENTISHEALTH VIP DUAL RESERVE (HMO D-SNP)" ||
                this.planNameMain == "ATTENTISHEALTH VIP DUAL SELECT (HMO D-SNP)" ||
                this.planNameMain == "ATTENTISHEALTH VIP PREMIER DUAL (HMO SNP) GROUP" ||
                this.planNameMain == "ATTENTISHEALTH ADVANTAGE PASSAGE DUAL (HMO SNP)" ||
                this.planNameMain == "ATTENTISHEALTH VIP DUAL SELECT")) ||
            (this.lobIdMain == '1021' && this.lobdMctrMain == '1006')) {
            this.showAdvancedCare = true;
        }
    }

    openAdvancedCareDisclaimer() {
        this.isAdvancedCareModalOpen = true;
        this.isModalAdvancedCareAttentis = true;
        this.provider = "Attentis Consulting";
    }

    navigateToAdvancedCareWebPage() {
        var advancedCareWebPage = "https://attentisconsulting.com/";
        if (advancedCareWebPage) {
            window.open(advancedCareWebPage, "_blank");
            this.closeEDM();
        }
    }

    openConnectWithCareMang() {
        // Navigate to a URL
        this[NavigationMixin.GenerateUrl](
            {
                type: "standard__namedPage",
                attributes: {
                    pageName: "connectwithcaremanagement",
                },
            },
        ).then(url => {
            window.open(url, "_blank");
        })
    }

    openWellnessProgramModal() {
        this.isWellnessProgramModalOpen = true;
    }

    healthRiskAssessment() {
        // Navigate to a URL
        this[NavigationMixin.GenerateUrl]({
            type: "standard__namedPage",
            attributes: {
                pageName: "health-risk-assessment",
            },
        },
        ).then(url => {
            window.open(url, "_blank");
        });
    }

    async getConiferDisclaimer() {
        const inputParams = {
                IsArchived: false, 
                Category: "Member", 
                userId: this._userId
        };
        const params = {
            input: inputParams,
            sClassName: "MBR_GetTOS",
            sMethodName: "GetTOS",
            options: "{}",
        };

        this.omniRemoteCall(params, true).then((response) => {
            this.coniferDisclaimer = response.result.TOS;
            this.JunctionRecordName = response.result.Name + '-' + this.userName;
            this.TOSacceptedDate = new Date();
            this.DC = response.result;
            if(response.result.TOSneverAccepted && response.result.TOSneverAccepted == true){
                this.coniferDisclaimerFlag = true;
            }
            else{
                this.coniferDisclaimerFlag = false;
            }
        }).catch(error => {
            console.error("error while posting data", JSON.stringify(error));
        })
    
    }

    postTOS(){
        let stepterms= {
            "JunctionRecordName": this.JunctionRecordName,
            "TOSacceptedDate": this.TOSacceptedDate,
            "R_UserAcceptanceOfTOS": "TOS_Accepted"
        };

        const inputParams = {
            STEP_TermsOfUse: stepterms,
            DC: this.DC,
            userId: this._userId
        };
        const params = {
            input: inputParams,
            sClassName: "MBR_GetTOS",
            sMethodName: "PostTOS",
            options: "{}",
        };

        this.omniRemoteCall(params, true).then((response) => {
            this.ssoLink();
        }).catch(error => {
            console.error("error while posting data", JSON.stringify(error));
        })
        this.closeEDM();
    }
}
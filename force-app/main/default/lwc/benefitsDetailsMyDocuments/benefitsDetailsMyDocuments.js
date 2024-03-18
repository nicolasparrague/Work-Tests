import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from "lightning/navigation";
import { getDataHandler } from "omnistudio/utility";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import pubsub from "omnistudio/pubsub";
import { isMobile } from "omnistudio/utility";
import { loadCssFromStaticResource } from 'omnistudio/utility';

export default class BenefitsDetailsMyDocuments extends OmniscriptBaseMixin(NavigationMixin(LightningElement)) {
    sectionOpen = true;
    loading = false;
    _decryptedParams;
    _records;
    pubSubObj;
    encryptedValues;
    tenant;
    desktopLink;
    isSubscriber = false;
    subScriberKID;

    taxFormLabel = 'Tax Form';
    // taxFormLabelAccessibility = taxFormLabel + "link downloads a PDF file";
    @track otherDocumentsLabel = 'Other Documents';
    @track otherDocumentList = [];
    @track pagerTotalEle;
    @track pagerFirstEle = 0;
    @track elementsPerPage = 5;
    @track iframeUrl;
    @track iframeId = '1';
    @track showTaxForm = false;
    @track showPlanCard = false;
    @track showMessage = false;
    @track showError = false;
    @track errorMsg = false;
    @track errorTitle = false;
    @track languages;
    @track _isMobile = isMobile();
    @track showiFrame = false;
    @track showContactUs = false;


    // Document Process
    productBrandGrouping;
    lobMarketSegment;
    fullyInsuredVsSelfInsured;
    marketSegmentCodeDesc;
    lobId;
    suppressDisplayInfo;
    // contact us
    productBrandGroupingDefault;

    // Member Select
    subscriberId;
    selectedMemberId;
    planId;
    effectiveDate;
    status;
    networkCode;
    portalType;
    dateText;
    terminationDate;
    userId;
    pathTenant;

    memberId;

    // UI Variables
    planName;
    documentList = [];

    //Accessibility
    ariaLabelDocument;

    connectedCallback() {
        let dataToDecrypt = this.getQueryParameters().dataParam;
        this.decryptData(dataToDecrypt);

        // Tenant definition
        let tenantUrl = window.location.pathname;
      
        if (tenantUrl.includes("member/s")) {
            this.tenant = "Attentis";
            this.pathTenant = "memberportal";
        } else {
            console.error("No valid url received..");
        }

        // Get Member Logged KID - to show/hide Tax Form card
        this.checkLoggedInMember();

        // Pubsub MemberId
        this.pubSubObj = {
            memberSelectionAction: this.getMemberKID.bind(this)
        }
        pubsub.register('MemberSelection', this.pubSubObj);

        window.addEventListener("message", this.handleResponse.bind(this), false);

        let completeURL = '/assets/styles/vlocity-newport-design-system-scoped.min.css';
        loadCssFromStaticResource(this, 'newportAttentisAlt', completeURL).then(resource => {
           console.log(`Theme loaded successfully`);
        }).catch(error => {
           console.log(`Theme failed to load => ${error}`);
        });

    }

    renderedCallback() {
        //Accessibility Fix for Modal Focus begins here
        //const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusableElements = 'anchor, button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
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
                if (event.keyCode === 27 || event.key === "Escape") {
                    // console.log("Escape pressed");
                    me.closeModal();
                    //  me.closeCancelModal();
                }
            });
        }//Accessibility Fix for Modal Focus ends here
        console.log('LOADING', this.loading);
    }

    handleResponse(message) {
        let msg = JSON.parse(JSON.stringify(message.data));
        let msgValue = msg.message;
        if(msgValue){
            this.loading = false;
        }
    }

    getOtherDocuments() {
        let inputMap = { memberId: this.memberId }
        //let inputMap = { memberId: 'K6027066901' }
        let newDocument = {};
        this.callIp('Member_OtherDocumentsList', inputMap).then(data => {
            // console.log('data', data);
            let otherDocuments = data.IPResult.documents;
            // MPV-1688 AC. 5
            this.otherDocumentList = [
                {
                    key: 1,
                    date: 'Date',
                    name: 'Document Name',
                    isHyperlink: false,
                    isHeader: true
                }
            ];
            if (otherDocuments) {
                otherDocuments.forEach((item) => {
                    newDocument = {
                        key: 1,
                        date: item.printedDate,
                        name: item.templateName,
                        docId: item.archivalDocId,
                        link: '',
                        isHyperlink: false,
                        isHeader: false
                    };
                    this.otherDocumentList.push(newDocument);
                })
            }


            if ((this.lobMarketSegment == "Medicare Supplement" || this.lobMarketSegment == "Medicare Supplemental") && this.tenant == "Attentis") {
                newDocument = {
                    key: 1,
                    date: '',
                    name: 'Outline of Coverage',
                    ariaLabel: 'Outline of Coverage link opens a new tab',
                    link: 'https://www.connecticare.com/content/dam/connecticare/pdfs/members/medicare-supplement/2022-outline-of-coverage.pdf',
                    isHyperlink: true,
                    isHeader: false
                };
                this.documentList.push(newDocument);
            }


            // MPV-1688 AC. 10
            if (this.planId == 'MU001005' || this.planId == 'MU001006' || this.planId == 'MU001007' || this.planId == 'MU001008') {
                // create a message 'Requested documents are not available'
            }
            
            
            this.pagerTotalEle = this.otherDocumentList.length;
            
        });

    }

    checkLoggedInMember() {
        let inputMap = { 'dummyNode': 'dummyNode' }
        this.callIp('Member_GetLoggedInMember', inputMap).then(data => {
            console.log('data', data);
            let memberResult = data.IPResult;
            if (memberResult.memberKID != null) {
                let loggedMemberKID = memberResult.memberKID.memberKID;
                let last2 = loggedMemberKID.slice(-2);
                if (last2 == '01') {
                    this.subScriberKID = memberResult.memberKID.memberKID;
                    this.isSubscriber = true;
                } else {
                    this.isSubscriber = false;
                }
            } else {
                this.isSubscriber = false;
            }
        });
    }

    getMemberKID(memberId) {
        this.loading = true;
        this.memberId = memberId.memberId;
        //console.log('---this.memberId', this.memberId);
        this.isSubscriber = (this.memberId != this.subScriberKID) ? false : true;

        //console.log('---this.isSubscriber', this.isSubscriber);
        // Update redirection breadcrumb
        this._decryptedParams.selectedMemberId = this.memberId;
        //this.encryptDataNavigation();

        let inputMap = { memberId: this.memberId }

        this.callIp('Member_ActivePlan', inputMap).then(data => {
            console.log('RUNNING ACTIVE PLAN');
            let dataResult = data.IPResult;
            if (dataResult.ServiceTypeInfo) {
                if (Array.isArray(dataResult.ServiceTypeInfo)) {
                    for (var i = 0; i < dataResult.ServiceTypeInfo.length; i++) {
                        if (dataResult.ServiceTypeInfo[i].planName == this.planName && dataResult.ServiceTypeInfo[i].planId == this.planId) {
                            this.productBrandGrouping = dataResult.ServiceTypeInfo[i].productBrandGrouping;
                            this.lobMarketSegment = dataResult.ServiceTypeInfo[i].lobMarketSegment;
                            this.fullyInsuredVsSelfInsured = dataResult.ServiceTypeInfo[i].fullyInsuredVsSelfInsured;
                            this.marketSegmentCodeDesc = dataResult.ServiceTypeInfo[i].marketSegmentCodeDesc;
                            this.lobId = dataResult.ServiceTypeInfo[i].lobId;
                            this.suppressDisplayInfo = dataResult.ServiceTypeInfo[i].suppressDisplayInfo;
                        }
                        // MPV-2861
                        if(dataResult.ServiceTypeInfo[i].defaultPlan == "Y"){
                            this.productBrandGroupingDefault = dataResult.ServiceTypeInfo[i].productBrandGrouping;
                        }
                    }
                }
            }

            //MPV-2068: My Documents - Suppress Tax Documents Section
            if (this.suppressDisplayInfo == 'Yes') {
                this.showTaxForm = false;
            } else {
                this.showTaxForm = true;
            }

            if (this.fullyInsuredVsSelfInsured == 'Self Insured') {
                this.showPlanCard = false;
            } else {
                this.showPlanCard = true;
            }

            if (this.tenant == 'Attentis' && this.lobId == '1044') {
                this.lobMarketSegment = 'Large Group - ASO';
                this.showPlanCard = true;
            }
            
            let inputMapDoc = {
                productBrandingGroup: this.productBrandGrouping,
                lobMarketSegment: this.lobMarketSegment,
                tenantId: this.portalType,
                marketSegmentCodeDesc: this.marketSegmentCodeDesc
            }
            //console.log('---inputMapDoc', inputMapDoc);
            this.getOtherDocuments();
            this.getDocumentList(inputMapDoc);
            // MPV-2861
            if(this.productBrandGroupingDefault == "Commercial" && this.portalType == "Attentis" ){
                this.showContactUs = true;
            }
        });

        //this.loading = false;
    }

    getHyperlinks() {
        let linkStartGuide;
        let linkHandBook;
        let newDocument;
        switch (this.lobId) {
            case '1008':
                linkStartGuide = 'https://www.emblemhealth.com/content/dam/emblemhealth/pdfs/resources/member-forms/2021/10_EMB_MB_QSG_51728_EnhancedCare_45-8869PD.pdf';
                linkHandBook = 'https://www.emblemhealth.com/content/dam/emblemhealth/pdfs/resources/quickstart-guides/EmblemHealth_Medicaid_Enhanced_Care_Handbook.pdf';
                break;
            case '1009':
                linkStartGuide = 'https://www.emblemhealth.com/content/dam/emblemhealth/pdfs/resources/member-forms/2021/9_EMB_MB_QSG_51728_ChildHealthPlus_45-7219PD.pdf';
                linkHandBook = false; // CHPlus member handbook does not exist today.  
                break;
            case '1010':
                linkStartGuide = 'https://www.emblemhealth.com/content/dam/emblemhealth/pdfs/resources/member-forms/2021/11_EMB_MB_QSG_51728_EnhancedCarePlus_10-10891PD.pdf';
                linkHandBook = 'https://www.emblemhealth.com/content/dam/emblemhealth/pdfs/resources/quickstart-guides/EmblemHealth_HARP_Member_Handbook.pdf';
                break;
            default:
                break;
        }
        newDocument = {
            key: 1,
            date: '-',
            name: 'Quick start guide',
            link: linkStartGuide,
            isHyperlink: true,
            isHeader: false
        };
        this.documentList.push(newDocument);
        // MPV-2733
        if(linkHandBook){
            newDocument = {
                key: 2,
                date: '-',
                name: 'Member handbook',
                link: linkHandBook,
                isHyperlink: true,
                isHeader: false
            };
            this.documentList.push(newDocument);
        }
    }

    getDocumentList(inputs) {
        this.loading = true;
        this.documentList = [];

        // if (this.productBrandGrouping == "Medicaid" && this.tenant == "EH" && (this.lobId == '1008' || this.lobId == '1009' || this.lobId == '1010')) {
        //     this.getHyperlinks(); // MPV-2729 - MPV-2733
        //     this.showMessage = false;
        // }
        this.callIp('Member_DocumentList', inputs).then(data => {
            //console.log('inputs', inputs);
            let documentData = data.IPResult;
            //console.log('documentData', documentData); Ted commented out
            if (documentData.documents) {
                let docList = documentData.documents.split(',');
                docList.forEach(element => {
                    let obj = {
                        name: element,
                        accessibilityName: element + " " + "link downloads a PDF file",
                        isHyperlink: false
                    }
                    if (this.tenant == 'Attentis') {
                        if (!element.includes('Chinese')) {
                            this.documentList.push(obj);
                        }
                    } else {
                        this.documentList.push(obj);
                    }
                });
                this.loading = false;
            } else {
              //  console.log('documentList');
                if(this.documentList.length > 0){
                    this.showMessage = false;
                }else{
                    this.showMessage = true;
                }
                
                this.loading = false;
            }
        });
       // console.log('---this.documentList', this.documentList);
    }
    
    downloadPDF(evt) {
        
        /*let doc = evt.target.name;
        this.loading = true;
        
        let inputs = {
            productBrandingGroup: this.productBrandGrouping,
            lobMarketSegment: this.lobMarketSegment,
            tenantId: this.portalType,
            document: doc,
            memberId: this.memberId,
            planCode: this.planId,
            marketSegmentCodeDesc: this.marketSegmentCodeDesc
        }

        if (doc == this.taxFormLabel) {
            inputs.productBrandingGroup = 'All';
            inputs.lobMarketSegment = 'All';
        }

        let params = {
            sClassName: 'vlocity_ins.IntegrationProcedureService',
            sMethodName: 'Member_GetPlanDocument',
            options: '{}',
            input: inputs,
        };


        this.omniRemoteCall(params, true).then((response) => {
             //console.log('response', response);
            if (!response.error) {
                let data = response.result.IPResult;
                if (data.documents) {
                    if (data.documents.length > 0) {
                        let docId = data.documents[0].id;
                        if (!this._isMobile) {
                            this.showiFrame = true;
                            this.iframeId = (parseInt(this.iframeId) + 1).toString();
                            let encryptedDocId = btoa(docId);
                            let protocol = window.location.protocol;
                            let hostUrl = window.location.host;
                            let baseurl = `${protocol}//${hostUrl}/${this.pathTenant}`;
                            this.iframeUrl = `${baseurl}/MBR_OpenSoftheonDoc?docId=${encryptedDocId}&id=${this.iframeId}`;
                            // console.log("@@iframeUrl ", this.iframeUrl);
                        } else if (this._isMobile) {
                            this.getDocument(docId, inputs);
                        }
                    } else {
                        this.errorTitle = 'My Documents';
                        this.errorMsg = 'Requested document not available';
                        this.showError = true;
                        this.loading = false;
                    }
                } else {
                    this.errorTitle = 'My Documents';
                    this.errorMsg = 'Requested document not available';
                    this.showError = true;
                    this.loading = false;
                }
            }
        }).catch((error) => {
            if (error) {
                console.error(error);
            } else {
                console.error('Unknown error.');
            }
            this.showError = true;
            this.loading = false;
        });*/
        //Desktop Execution
    }

    downloadOtherDocumentPDF(evt) {
        let doc = evt.target.name;
        let docId;
        if(evt.target.id != null){
            docId = evt.target.id.split('-');
            docId = docId[0];
        }

        this.loading = true;
        
        let inputs = {
            productBrandingGroup: this.productBrandGrouping,
            lobMarketSegment: this.lobMarketSegment,
            tenantId: this.portalType,
            document: doc,
            memberId: this.memberId,
            planCode: this.planId,
            marketSegmentCodeDesc: this.marketSegmentCodeDesc
        }

        if (doc == this.taxFormLabel) {
            inputs.productBrandingGroup = 'All';
            inputs.lobMarketSegment = 'All';
        }

        //MPV-2812 
        this.getDocument(docId, inputs);
    }
    getQueryParameters() {
        var params = {};
        var search = location.search.substring(1);

        if (search) {
            params = JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}', (key, value) => {
                return key === "" ? value : decodeURIComponent(value);
            });
        }

        return params;
    }

    decryptData(value) {
        // Current Page variable assignment - HARDCODED VALUE
        this.subscriberId = "K37636791";
        this.selectedMemberId = "K3763679101";
        this.planId = "MS040114";
        this.effectiveDate = "10/01/2021";
        this.planName = "FlexPOS Platinum Alternative";
        this.networkCode = "2023";
        this.portalType = "Attentis";
        this.dateText = "10/01/2021";
        this.status = "Active";
        this.terminationDate = "12/31/2199";
        this.userId = "0058G000004xkWdQAI";

        this._decryptedParams = {
            subscriberId : this.subscriberId,
            selectedMemberId : this.selectedMemberId,
            planId : this.planId,
            effectiveDate : this.effectiveDate,
            planName : this.planName,
            networkCode : this.networkCode,
            portalType : this.portalType,
            dateText :  this.dateText,
            status : this.status,
            terminationDate :  this.terminationDate,
            userId : this.userId
        }
    }

    // encryptDataNavigation() {
    //     let inputMap = {
    //         methodName: "encrypt",
    //         unencryptedStringValue: JSON.stringify(this._decryptedParams),
    //     };
    //     this.callIp("portalEncrypt_Decrypt", inputMap).then((data) => {
    //         this.encryptedValues = data.IPResult.encryptedString;
    //         //console.log('encrypt: ', this.encryptedValues);
    //         pubsub.fire("NavigateSelection", "memberNavigateSelection", {
    //             params: data.IPResult.encryptedString,
    //         });
    //     });
    // }

    callIp(ipMethod, inputMap) {
        let datasourcedef = JSON.stringify({
            "type": "integrationprocedure",
            "value": {
                "ipMethod": ipMethod,
                "inputMap": inputMap,
                "optionsMap": ""
            }
        });

        return getDataHandler(datasourcedef).then(data => {
            return JSON.parse(data);

        }).catch(error => {
            console.error(`failed at getting IP data => ${JSON.stringify(error)}`);
        });
    }

    downloadPDFForMobile(title, fileName, base64) {
        this.loading = true;
        let pathTenant;
        if (this.tenant == 'Attentis') {
            pathTenant = 'memberportal';
        } else {
            pathTenant = 'member';
        }
        // MPV-1309 US Sprint 11
        // console.log('---Downloading');
        let params = {
            sClassName: 'vlocity_ins.IntegrationProcedureService',
            sMethodName: 'Member_Base64ToContentDocApex',
            options: '{}',
            input: {
                base64: base64,
                title: title,
                fileNameWithExtension: fileName,
            },

        };
        //console.log('input', params);
        this.omniRemoteCall(params, true).then((response) => {
            let data = response.result.IPResult;
            // console.log('response', response);
            const contentDocId = data.contentDocId;
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: `${window.top.location.origin}/${pathTenant}/sfc/servlet.shepherd/document/download/${contentDocId}?operationContext=S1`
                },
            });
            this.loading = false;

        }).catch((error) => {
            if (error) {
                console.error(error);
            } else {
                console.error('Unknown error.');
            }
            this.errorTitle = 'My Documents';
            this.errorMsg = 'Requested document not available';
            this.showError = true;
            this.loading = false;
        });
    }

    getDocument(docId, inputs) {
        this.loading = true;
        let params = {
            sClassName: 'vlocity_ins.IntegrationProcedureService',
            sMethodName: 'ESB_GetDocument',
            options: '{}',
            input: {
                id: docId
            },
        };
        this.omniRemoteCall(params, true).then((response) => {
            if (!response.error) {
                let data = response.result.IPResult;
                if (data.documents.length > 0) {
                    let doc = data.documents[0];
                    if (doc.mimeType === 'pdf') {
                        //To create a content doc and download
                        let title = inputs.memberId + '_' + inputs.document;
                        let fileName = inputs.memberId + '_' + inputs.document + '.pdf';
                        //console.log('fileName', fileName);
                        //console.log('inputs.document', inputs.document);
                        this.downloadPDFForMobile(title, fileName, doc.content);
                    }
                } else {
                    this.loading = false;
                }
            }
        }).catch((error) => {
            if (error) {
                console.error(error);
            } else {
                console.error('Unknown error.');
            }
            this.loading = false;
        });
    }

    closeModal() {
        this.showError = false;
    }

    trapFocus() {
        this.template.querySelector('[data-id="modalButton"]').focus();
    }

    disconnectedCallback() {
        pubsub.unregister('MemberSelection', this.pubSubObj);
    }

    handlePagerChange(){
        return false;
    }
}
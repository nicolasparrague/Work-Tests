import { LightningElement, track, api } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import { NavigationMixin } from 'lightning/navigation';
import pubsub from "omnistudio/pubsub";
import { isMobile } from "omnistudio/utility";

export default class DownloadEobPdf extends OmniscriptBaseMixin(NavigationMixin(LightningElement)) {
    @track loading = true;
    @track showError = false;
    @track errorTitle = '';
    @track errorMsg = '';
    pubSubObj;
    desktopLink = '';

    _baseURL = '';
    _lastItem = 0;
    _isMobile = isMobile();
    rBaseUrl = '';
    
    @track _memberId;
    @track _claimId;
    @track _brand;
    @track _parentBrand;
    @track _memberType;
    @track _claimType;
    @track _memberInfo;
    _tenantId;

    @track targetParams = {};
    @track showNavigationEncrypt = false;
    @track targetName;
    
    isModalGlobal = false;

    get gotVars() {
        let hasMemberInfo = false;
        if(this._memberInfo && this._memberInfo != '{"memberId": "{Parent.memberId}", "memberType": "{Parent.memberType}"}') {
            let obj = JSON.parse(this._memberInfo);
            hasMemberInfo = (obj.memberId != undefined && obj.memberId != '') && (obj.memberType != undefined && obj.memberType != '');
        }
        return hasMemberInfo 
            && !!(this._claimId) 
            && !!(this._claimType) 
            && !!(this._brand);
    }

    @track notRendered = true;

    @api
    get memberinfo() {
        return this._memberInfo;
    }

    set memberinfo(val) {
        this._memberInfo = val;
    }
    @api
    get memberid() {
        return this._memberId;
    }

    set memberid(val) {
        this._memberId = val;
    }
    @api
    get claimid() {
        return this._claimId;
    }

    set claimid(val) {
        this._claimId = val;
    }
    @api
    get brand() {
        return this._brand;
    }

    set brand(val) {
        this._brand = val;
    }
    @api
    get parentbrand() {
        return this._parentBrand;
    }

    set parentbrand(val) {
        this._parentBrand = val;
    }
    @api
    get tenantId() {
        return this._tenantId;
    }

    set tenantId(val) {
        this._tenantId = val;
    }
    @api
    get membertype() {
        return this._memberType;
    }

    set membertype(val) {
        this._memberType = val;
    }
    @api
    get claimType() {
        return this._claimType;
    }

    set claimType(val) {
        this._claimType = val;
    }

    get isDesktop() {
        return (
            (this._isMobile) 
            || (window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes('CommunityHybridContainer'))
            ) 
        ? false : true;
    }

    get query() {
        if(this.brand == 'GHI') {
            return 'EOBPPO';
        } else {
            return `EOB${this.brand}`;
        }
    }

    handleClick(evt) {
        //console.log(this.isDesktop);
        //console.log('EOB Button clicked!');
        if(this.isDesktop) {
            //console.log(`Opening the following page: ${this.desktopLink}`);
            window.open(this.desktopLink);
        } else {
            this.loading = true;
            this.getLastDocument();
        }

        this.closeExternalLinkModal();
    }

    connectedCallback() {
        // Receive pubsub to close modal
        this.pubSubObj = {
            closeExternalLinkModal: this.closeIfOpen.bind(this)
        }
        pubsub.register('closeModal', this.pubSubObj);
        this.loading = false;
        this.redirectESBDocument();
    }

    closeIfOpen(values){
        if(values.closeModal == true || values.closeModal == 'true'){
            this.closeExternalLinkModal();
        }
    }

    renderedCallback() {
        //console.log('memberinfo:');
        //console.log(this.memberinfo);
        //console.log("- ", this._memberId);
        //console.log(this._claimId);
        //console.log('1. gotVars?');
        //console.log(this.gotVars);
        if(this.notRendered && this.gotVars) {
            //console.log('memberinfo:');
            //console.log(this.memberinfo);
            //console.log('2. gotVars?');
            //console.log(this.gotVars);
            let memberInfoObj = JSON.parse(this.memberinfo);
            this.membertype = memberInfoObj.memberType;
            this.memberid = memberInfoObj.memberId; 
            let type = '';
            let protocol = '';
            const urlString = window.location.href;
            const hostUrl = window.location.host;

            let urlArray = urlString.split('/');

            for (let index = 0; index < urlArray.length; index++) {
                let element = urlArray[index];
                if (element == 'member') {
                    type = element;
                }
                if (element == 'https:') {
                    protocol = element;
                }
                if (element == 'http:') {
                    protocol = element;
                }
            }
            // this.desktopLink = `${protocol}//${hostUrl}/${type}/apex/GetLatestDocumentMember?param1=${this.memberid}&query=${this.query}`;
            // if(!(this.membertype == 'Medicare')) {
                this.desktopLink = `${protocol}//${hostUrl}/${type}/apex/GetLatestDocumentMember?param1=${this.memberid}&param2=${this.claimid}&query=${this.query}`;
                this.targetParams = '{"type": "'+type+'", "param1": "'+this.memberid+'", "param2": "'+this.claimid+'", "query":"'+this.query+'", "modal":"true"}';
                if(this.targetParams && this.isDesktop){
                    this.targetName = '/'+type+'/apex/GetLatestDocumentMember';
                    this.showNavigationEncrypt = true;
                }
            //}
            //this.desktopLink = `${protocol}//${hostUrl}/${type}/apex/GetLatestDocumentMember?param1=${this.memberid}&param2=${this.claimid}&query=${this.query}`;
            //console.log('renderedCallback finished');
            //console.log(this.memberid);
            //console.log(this.claimType);
            //console.log(this.membertype);
            //console.log(this.brand);
            //console.log(this.query);
            //console.log(this.desktopLink);
            this.notRendered = false;
        }
    }

    getLastDocument() {
        //console.log('getLastDocument called!');
        this.loading = true;
        this.errorMsg = '';
        this.errorTitle = '';

        // Test parameters to test a user that has > 1 documents returned
        /*
        let testParams = {
            sClassName: 'omnistudio.IntegrationProcedureService',
            sMethodName: 'ESB_GetLastDocument',
            options: '{}',
            input: {
               param1: 'AZQ33332E01',
               param2: '21K000009700',
               query: 'EOBHIP',
            },
        };
        */

        let input = {
            param1: this.memberid,
            param2: this.claimid,
            query: this.query
        };

        // If NOT Medicare, monthly EOB is NOT wanted, so pass claimid as param2
        // if(!(this.membertype == 'Medicare')) {
        //     input.param2 = this.claimid;
        // }

        let params = {
            sClassName: 'omnistudio.IntegrationProcedureService',
            sMethodName: 'ESB_GetLastDocument',
            options: '{}',
            input: input,
        };
        //console.log('ESB_GetLastDocument params:');
        //console.log(params);
        this.omniRemoteCall(params, true).then((response) => {
            //console.log('Response from ESB_GetLastDocument successful!');
            //console.log(response);
            if (!response.error) {
                let data = response.result.IPResult;
                if (data.documents.length > 0) {
                    if(data.documents.length == 1) {
                        let doc = data.documents[0];
                        //console.log("doc.mimeType:" + JSON.stringify(doc.mimeType));
                        if (doc.mimeType === 'pdf') {
                            //this.base64 = doc.content;
                            //console.log("base64:" + JSON.stringify(this.base64));
                            //To create a content doc and download
                            let title = `${this.memberid}_${this.claimid}_EOB`;
                            let fileName = `${this.memberid}_${this.claimid}_EOB.pdf`;
                            this.downloadPDFForMobile(title, fileName, doc.content);
                        }
                    } else {
                        // If more than one document, we need to call ESB_GetDocument for the correct base64
                        let docId = data.documents[0].id;
                        this.getDocument(docId);
                    }
                 } else {
                    this.errorTitle = 'Explanation of Benefits (EOB)';
                    this.errorMsg = 'Requested document not available';
                    this.showError = true;
                    this.loading = false;
                 }
            }
            if(response.result.IPResult.success == false) {
                this.errorTitle = 'Explanation of Benefits (EOB)';
                this.errorMsg = response.result.IPResult.error ? response.result.IPResult.error : 'Requested document not available';
                this.showError = true;
                this.loading = false;
            }
        }).catch((error) => {
            console.error('Error when calling omniRemoteCall for ESB_GetLastDocument:');
            if (error) {
               console.log(error);
            } else {
               console.error('Unknown error.');
            }
            this.loading = false;
        });
    }

    getDocument(docId) {
        this.loading = true;
        let params = {
            sClassName: 'omnistudio.IntegrationProcedureService',
            sMethodName: 'ESB_GetDocument',
            options: '{}',
            input: {
                id: docId
            },
        };

        this.omniRemoteCall(params, true).then((response) => {

            if (!response.error) {
                let data = response.result.IPResult;
                if(data.documents.length > 0) {
                    let doc = data.documents[0];
                    if (doc.mimeType === 'pdf') {
                        //this.base64 = doc.content;
                        //console.log("base64:" + JSON.stringify(this.base64));
                        //To create a content doc and download
                        let title = `${this.memberid}_${this.claimid}_EOB`;
                        let fileName = `${this.memberid}_${this.claimid}_EOB.pdf`;
                        this.downloadPDFForMobile(title, fileName, doc.content);
                    }
                } else {
                    this.errorTitle = 'Explanation of Benefits (EOB)';
                    this.errorMsg = 'Requested document not available';
                    this.showError = true;
                    this.loading = false;
                }
            }
        }).catch((error) => {
            console.error('Error when calling omniRemoteCall for ESB_GetDocument:');
            if (error) {
               console.log(error);
            } else {
               console.error('Unknown error.');
            }
            this.loading = false;
        });
    }

    downloadPDFForMobile(title, fileName, base64) {
        let pathTenant = 'memberportal';
        this.loading = true;
        // MPV-1309 Sprint 11 US
        let params = {
           sClassName: 'omnistudio.IntegrationProcedureService',
           sMethodName: 'Member_Base64ToContentDoc',
           options: '{}',
           input: {
              base64: base64,
              title: title,
              fileNameWithExtension: fileName,
              //contentType: 'application/pdf'
           },
        };
  
        this.omniRemoteCall(params, true).then((response) => {

            let data = response.result.IPResult;
            const contentDocId = data.contentDocId;
            this.loading = false;
            //--added--
            this._baseURL = window.location.href;
            this._lastItem = this._baseURL.indexOf('/s');
            this.rBaseUrl = this._baseURL.substring(0, this._lastItem);
            //-added--
            console.log('EOB: opening URL -');
            console.log(`${window.top.location.origin}/memberportal/servlet/servlet.FileDownload?file=${contentDocId}`);
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    "url": `${window.top.location.origin}/${pathTenant}/sfc/servlet.shepherd/document/download/${contentDocId}?operationContext=S1`
                },
            });
            this.loading = false;
        })
        .catch((error) => {
            console.error('Error when calling omniRemoteCall for POCMember_Base64ToContentDoc:');
            if (error) {
                console.log(error);
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

    openModal() {
        this.isModalGlobal = true;  
    }

    closeExternalLinkModal() {
        // to close modal set isModalGlobal track value as false
        this.isModalGlobal = false;
    }

    disconnectedCallback() {
        pubsub.unregister('closeModal', this.pubSubObj);
    }

    redirectESBDocument(){
        let type = '';
        let protocol = '';
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
        this.urlEsbDocument = `${protocol}//${hostUrl}/${type}/resource/Sample_Explanation_of_Benefits`;
        this.isModalGlobal = false; 
    }
    disputeClaim(){
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Dispute_Claim__c'
            }
        });
    }
}
import { LightningElement, api, track } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import { NavigationMixin } from 'lightning/navigation';
//import HCFA1500 from '@salesforce/resourceUrl/HCFA1500';

export default class LookingClaimForms extends OmniscriptBaseMixin(NavigationMixin(LightningElement)) {
    @track
    mobileUrl;
    nameUrl;
    type;
    source;
    url;
    isOtherForm = false;
    tenant;
    pathName;
    labelSource;
    hasRendered = false;
    _type;
    _url;
    _soiurce;
    _source;

    @api
    get type() {
        return this._type;
    }

    set type(val) {
        this._type = val;
    }

    @api
    get source() {
        console.log('--getSource', this._source);
        return this._source;
    }

    set source(val) {
        this._source = val;
        console.log('--setSource', this._source);
    }

    @api
    get url() {
        return this._url;
    }

    set url(val) {
        this._url = val;
    }

    connectedCallback(){
        this.buidURL();
    }

    renderedCallback(){
         if(!this.hasRendered){
            setTimeout(() => {
                this.getUrls();                
                this.hasRendered = true; 
            }, );
        }
    }

    getUrls() {
        this.pathName = window.parent.location.href;
        this.tenant = 'member'      
        if(this._type != 'Other'){
            this.labelSource = this._source;
            this.sourceName = '../resource/'+this._source;
            this.nameUrl = this._url;
            // adding line below to cover accessibility
            this.nameUrlAcc = this._url + " " + "opens a new tab";
        }else{
            this.sourceName = this._source;
            //this.mobileUrl = this._sourceName;
            this.mobileUrl = this.sourceName;
            this.nameUrl = this._url;
            this.isOtherForm = true;
            // adding line below to cover accessibility
            this.nameUrlAcc = this._url + " " + "opens a new tab";
        }
        //console.log('---nameUrl', this.nameUrl);
        //console.log('---mobileUrl', this.sourceName);
    }

    buidURL() {
        let type = "";
        let protocol = "";
        const urlString = window.location.href;
        const hostUrl = window.location.host;
    
        let urlArray = urlString.split("/");
    
        for (let index = 0; index < urlArray.length; index++) {
           let element = urlArray[index];
           if (element == "member") {
              type = element;
           }
           if (element == "https:") {
              protocol = element;
           }
           if (element == "http:") {
              protocol = element;
           }
        }
    }

    downloadMobileForm() {
        let _baseURL = window.location.href;
        let _lastItem = _baseURL.indexOf("/s");
        let pathTenant = 'memberportal';

        if (this.type != 'Other') {
            let params = {
                sClassName: "omnistudio.IntegrationProcedureService",
                sMethodName: "Member_GenerateBase64",
                options: "{}",
                input: {
                    resourceName: this.labelSource
                }
            };
            //console.log('source params: ', params);
            this.omniRemoteCall(params, true).then((response) => {
                // MPV-1309 US Sprint 11
                let params = {
                    sClassName: "omnistudio.IntegrationProcedureService",
                    sMethodName: "Member_Base64ToContentDoc",
                    options: "{}",
                    input: {
                        base64: response.result.IPResult.baseCode,
                        title: this.nameUrl,
                        fileNameWithExtension: this.nameUrl + '.pdf',
                        //contentType: 'application/pdf'
                    }
                };
                this.omniRemoteCall(params, true).then((response) => {
                    let data = response.result.IPResult;
                    const contentDocId = data.contentDocId;
                    this[NavigationMixin.Navigate]({
                        "type": "standard__webPage",
                        "attributes": {
                            "url": `${window.top.location.origin}/${pathTenant}/sfc/servlet.shepherd/document/download/${contentDocId}?operationContext=S1`
                        }
                    });
                })

            })
        } else {
            //console.log('---this.mobileUrl', this.mobileUrl);
            this[NavigationMixin.Navigate]({
                "type": "standard__webPage",
                "attributes": {
                    "url": this.mobileUrl
                }
            });
        }
    }

}
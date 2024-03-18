import { LightningElement, api, track } from 'lwc';
import { loadCssFromStaticResource } from 'omnistudio/utility';
import OmniscriptSetValues from 'omnistudio/omniscriptSetValues';
import { OmniscriptBaseMixin } from 'omnistudio/omniscriptBaseMixin';
export default class LoadCustomStylesOmni extends OmniscriptBaseMixin(OmniscriptSetValues) {
    connectedCallback() {
        
        console.log('Loading styles');
        super.connectedCallback();
        const path = '../resource/newportAttentisAlt/assets/styles/vlocity-newport-design-system-scoped.min.css';
        const _urlString = window.location.href;
        const _baseURL = _urlString.indexOf("/s");
        console.log('baseurl: ', _baseURL);
        let completeURL = '/assets/styles/vlocity-newport-design-system-scoped.min.css';
        console.log('completeURL: ', completeURL);
        let tenantId = 'Attentis'
        let tenantIdMsg = {tenantId : tenantId}
        this.omniApplyCallResp(tenantIdMsg);
        //if (_baseURL <0){
            //if(this.jsonData.theme !== undefined){
                console.log('this.jsonData.theme: ', this.jsonData.theme);
                //loadCssFromStaticResource(this, this.jsonData.theme, path).then(resource => {
                    loadCssFromStaticResource(this, 'newportAttentisalt', completeURL).then(resource => {
                    console.log(`Theme loaded successfully => ${this.jsonData.theme}`);
                }).catch(error => {
                    console.log(`Theme failed to load => ${error}`);
                });
            //}
        //}
        console.log('Finish loading styles');
    }
}
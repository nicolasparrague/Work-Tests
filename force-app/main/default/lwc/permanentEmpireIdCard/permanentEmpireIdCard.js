import { LightningElement, track, api } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";


const EMPIRE_LOGO = '../resource/ehLogo';
export default class PermanentEmpireIdCard extends OmniscriptBaseMixin(LightningElement) {
    @api type = '';

    @track empireLogo = '';

    connectedCallback(){
        this.empireLogo = EMPIRE_LOGO;
    }

    handleGeneratePDFEmpire() {
        console.log("empire log", this.type);
        this.sendEvent('generatepdf', { detail: this.type });
    } 

    sendEvent(name, detailObj) {
        this.dispatchEvent(new CustomEvent(name, detailObj));
    }

}
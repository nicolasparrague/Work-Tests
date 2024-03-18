import { LightningElement, track, api } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";

const ATTENTIS_LOGO = '../resource/AttentisLogo';
const WATERMARK = '../resource/temporary_watermark';

export default class TempIdCard extends OmniscriptBaseMixin(LightningElement) {
    @api cardData = null;
    @api type = '';

    @track cardLogo = '';
    @track watermark = '';
    @track member = {};
    @track loading = true;
    @track showRXPCN = true;

    get typeTitle() {
        return this.type.toUpperCase();
    }
    
    connectedCallback() {
        this.loading = true;
        this.cardData = {...this.cardData};
        this.watermark = WATERMARK;
        this.cardLogo = ATTENTIS_LOGO;
        if(this.type != '') {
            this.targetId = `${this.type}-id-card`;
        }
        if(this.type == 'dental' || this.type == 'Dental' || this.type == 'DENTAL') {
            this.showRXPCN = false;
        }
        if(this.cardData != null) {
            if((this.cardData.hasOwnProperty('PCN') == false) || this.cardData.PCN == '') {
                this.cardData.PCN = 'N/A';
            }
            if((this.cardData.hasOwnProperty('RxBinNumber') == false) || this.cardData.RxBinNumber == '') {
                this.cardData.RxBinNumber = 'N/A';
            }
            this.loading = false;
        }
    }

    renderedCallback() {
        let downButton = this.template.querySelector('[data-target-id="downloadButton"]');
        downButton.disabled = this.loading;

        let requestButton = this.template.querySelector('[data-target-id="requestButton"]');
        requestButton.disabled = this.loading;
    }

    handleGeneratePDF() {
        let eventDetail = {
            detail: {
                type: this.type,
                cardData: this.cardData
            }
        };
        this.sendEvent('generatepdf', eventDetail);
    }

    handleRequestIdCard() {
        let eventDetail = {
            detail: {
                type: this.type
            }
        };
        this.sendEvent('requestid', eventDetail);
    }

    sendEvent(name, detailObj) {
        this.dispatchEvent(new CustomEvent(name, detailObj));
    }
}
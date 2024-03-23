import { LightningElement, track, api } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
const WATERMARK = '../resource/temporary_watermark';

export default class TempEmpireIdCard extends OmniscriptBaseMixin(LightningElement) {
    @api cardData = null;
    @api type = '';
    @track cardLogo = '../resource/empire_logo_color';
    @track member = {};
    @track loading = true;
    @track showRXPCN = true;
    @track watermark = '';
    empirePlanName = '';
    firstDescription = '';
    secondDescription = '';
    cnyLogo = '../resource/ny_seal';
    suitcaseLogo = '../resource/suitcase_logo';

    get typeTitle() {
        return this.type.toUpperCase();
    }
    
    connectedCallback() {
        this.loading = true;
        this.cardData = {...this.cardData};
        this.cardData.MemberId = this.cardData.MemberId.substring(0, 9);
        this.watermark = WATERMARK;
        if(this.type != '') {
            this.targetId = `${this.type}-id-card`;
        }
        if(this.cardData != null) {
            if (this.cardData.empireType == 'Commercial') {
                this.empirePlanName = 'Hospital'
                this.firstDescription = 'ER copay*: $150\r\nHospital copay: $300 per admission';
                this.secondDescription = 'Call NYC HEALTHLINE  for hospital admissions and Empire member services for benefit information\r\n(see back for details).';
            } else if (this.cardData.empireType == 'Senior') {
                this.empirePlanName = 'Empire Hospital Senior Care'
                this.firstDescription = '';
                this.secondDescription = 'Medicare is primary. Bill Medicare first.';
            }
            this.loading = false;
        }
    }

    renderedCallback() {
        let downButton = this.template.querySelector('[data-target-id="downloadButton"]');
        downButton.disabled = this.loading;

        let requestButton = this.template.querySelector('[data-target-id="requestButton"]');
        requestButton.disabled = this.loading;
        if (this.cardData.empireType == 'Commercial') {
            this.template.querySelector('.id-card-body-second-description').classList.add('id-card-body-commercial-description');
        } else if (this.cardData.empireType == 'Senior') {
            this.template.querySelector('.id-card-body-second-description').classList.add('id-card-body-senior-description');
        }
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
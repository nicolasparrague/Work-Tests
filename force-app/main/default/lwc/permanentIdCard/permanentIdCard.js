import { LightningElement, track, api } from 'lwc';

export default class PermanentIdCard extends LightningElement {
    @api type = '';
    @api cardData = null;
    @api permData = null;
    @track targetId = '';
    @track printUrl = '';
    @track isMobileApp = false;

    @track permCardFront = 'data:image/png;base64,';
    @track permCardBack = 'data:image/png;base64,';

    showCard = false;

    connectedCallback() {
        this.showCard = false;
        if(this.cardData != null) {
            this.targetId = `${this.type}-id-card`;
            if(this.permData != null) {
                let tenant = 'Attentis';
                this.printUrl = `../apex/MBR_PermanentCardPage?MemberId=${this.cardData.MemberId}&planType=${this.capFirstLetter(this.type)}&requestType=PDF&tenantId=${tenant}`;
                this.permCardFront = this.permCardFront + this.permData.PNGFront;
                if(this.permData.hasOwnProperty('PNGBack')) {
                    this.permCardBack = this.permCardBack + this.permData.PNGBack
                }
            }
            this.showCard = true;
            if (window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes('CommunityHybridContainer')) {
                this.isMobileApp = true;
            }
        }
    }

    handleGeneratePDFDesktop() {
        // Should only be called for mobile users
        let eventDetail = {
            detail: {
                type: this.type,
                cardData: this.cardData,
                permData: this.permData
            }
        };
        this.sendEvent('generatepdfdesktop', eventDetail);
    }

    handleGeneratePDFMobile() {
        // Should only be called for mobile users
        let eventDetail = {
            detail: {
                type: this.type,
                cardData: this.cardData,
                permData: this.permData
            }
        };
        this.sendEvent('generatepdfmobile', eventDetail);
    }

    handleRequestIdCard() {
        let eventDetail = {
            detail: {
                type: this.type,
                cardData: this.cardData,
                permData: this.permData
            }
        };
        this.sendEvent('requestid', eventDetail);
    }

    capFirstLetter(string) {
        return string.slice(0, 1).toUpperCase() + string.slice(1);
    }

    sendEvent(name, detailObj) {
        this.dispatchEvent(new CustomEvent(name, detailObj));
    }
}
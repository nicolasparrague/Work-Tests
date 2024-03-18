import { LightningElement, track, api } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";

export default class MemberIdCard extends OmniscriptBaseMixin(LightningElement) {
    permanentCardStatus = false;
    empirePermanentCardStatus = false;
    showTempCard = false;
    showPermCard = false;
    showPermEmpireCard = false;
    isEmpire = false;
    cardType = '';
    memberId = '';
    @track activeAccordionSection = [];
    @api planData = null;
    @track cardData = {};
    @api cardLogo = '';
    @track permCardData = null;
    @track empirePermCardData = null;
    @track loading = true;

    @track showRequestMsg = false;
    @track requestIdCardMsg = '';
    @track showErrorMsg = false;
    @track errorMsg = '';
    @track errorDetails = '';

    @track isOpen = false;

    openSection(value) {
        if(value == true && (this.showTempId == false && this.showPermId == false)) {
            if(!(this.cardType == 'medical' || this.cardType == 'Medical' || this.cardType == 'MEDICAL')) {
                this.loading = true;
            } else {
                this.loading = false;
            }
            this.isOpen = value;
            this.getTempId();
        }
        if(value == false) {
            this.isOpen = value;
        }
    }

    get isAttentisDental() {
        return (this.cardType == 'dental' || this.cardType == 'Dental' || this.cardType == 'DENTAL');
    }

    get showTempId() {
        return this.showTempCard && (this.permanentCardStatus == false) && (this.loading == false);
    }

    get showPermId() {
        return this.showPermCard && (this.permanentCardStatus == true) && (this.loading == false);
    }

    get showEmpireTempId() {
        return this.isEmpire && this.showTempCard && (this.empirePermanentCardStatus == false) && (this.loading == false);
    }

    get showEmpirePermId() {
        return this.showPermEmpireCard && (this.empirePermanentCardStatus == true) && (this.loading == false);
    }

    get showAccordion() {
        if(this.isAttentisDental) {
            return (this.showTempCard != true);
        } else {
            return true;
        }
    }

    connectedCallback() {
        if(this.planData != null) {
            this.cardType = this.planData.type;
            this.memberId = this.planData.MemberId;

            if(this.planData.isOpen == true || this.planData.isOpen == 'true') {
                this.activeAccordionSection = this.planData.accordionName;
                this.openSection(true);
            }
            if(this.isOpen == false) {
                this.sendEvent('doneloading', {});
                this.loading = false;
            }
        }  
    }

    handleSectionToggle(evt) {
        this.openSection(!this.isOpen);
    }

    handleGeneratePDFEvent(evt) {
        this.sendEvent('generatepdf', { detail: evt.detail });
    }

    handleGenerateEmpirePDFEvent(evt) {
        this.sendEvent('generateempirepdf', { detail: evt.detail });
    }

    handleGeneratePermPDFDesktopEvent(evt) {
        if(this.isEmpire == true) {
            evt.detail.isEmpire = this.isEmpire;
        }
        this.sendEvent('generatepermpdfdesktop', { detail: evt.detail });
    }

    handleGeneratePermPDFMobileEvent(evt) {
        if(this.isEmpire == true) {
            evt.detail.isEmpire = this.isEmpire;
        }
        this.sendEvent('generatepermpdfmobile', { detail: evt.detail });
    }

    handleRequestIdEvent(evt) {
        this.loading = true;
        this.requestIdCard(evt.detail);
    }

    sendEvent(name, detailObj) {
        this.dispatchEvent(new CustomEvent(name, detailObj));
    }

    capFirstLetter(string) {
        return string.slice(0, 1).toUpperCase() + string.slice(1);
    }

    getTempId() {
        this.loading = true;
        let params = {
            sClassName: "omnistudio.IntegrationProcedureService",
            sMethodName: "Member_TempHealthCard",
            options: "{}",
            input: {
                memberId: this.planData.MemberId,
                planId: this.planData.planId,
            }
        };
        this.omniRemoteCall(params, true).then((response) => {
            if(!response.error) {
                let data = response.result.IPResult;
                if(response.result.hasOwnProperty('error') && response.result.error == 'OK') {
                    for(let key in data) {
                        if(key == 'healthCard' && data[key] == 'No ID Cards for this member ID') {
                            // This user has no ID cards, display a message.
                            this.errorMsg = 'No ID cards were found for this member.';
                            this.showErrorMsg = true;
                            this.loading = false;
                        } else {
                            this.cardData = data[key][0];
                            this.cardData.type = this.cardType;
                            this.cardData.accordionLabel = this.planData.accordionLabel;
                            this.cardData.accordionName = this.planData.accordionName;
                            this.cardData.empireType = this.planData.empireType;
                            if(this.cardData.hasOwnProperty('isNYPPO') && this.cardData.isNYPPO == 'Yes') {
                                this.isEmpire = true;
                                this.sendEvent('isempirecard', {});
                            }
                            this.showTempCard = true;
                        }
                    }
                    if(this.showErrorMsg == false) {
                        this.getPermanentID(false);
                        if(this.isEmpire) {
                            this.getPermanentID(true)
                        }
                    }
                } else {
                    console.error(`IP Member_TempHealthCard responded with error code ${data.info.statusCode} ${data.info.status}`);
                    this.errorMsg = `An error occured when getting your ID Card(s), please try again later.`;
                    this.errorDetails = `Error Code: ${data.info.statusCode} ${data.info.status}`
                    this.showErrorMsg = true;
                    this.loading = false;
                }
            } else {
                console.error('Could not call IP Member_TempHealthCard, returned with error.');
                this.errorMsg = 'An error occured when getting your ID Card(s), please try again later.';
                this.showErrorMsg = true;
                this.loading = false;
            }
        }).catch((error) => {
            console.error('Error when calling omniRemoteCall for Member_TempHealthCard:');
            if(error) {
                console.log(error);
            } else {
                console.error('Unknown error.');
            }
            this.errorMsg = 'An error occured when getting your ID Card(s), please try again later.';
            this.showErrorMsg = true;
            this.loading = false;
        });
    }

    getPermanentID(isEmpire) {
        let tenantId = 'Attentis';
        let params = {
            sClassName: "omnistudio.IntegrationProcedureService",
            sMethodName: "Member_RequestPermanentCard",
            options: "{}",
            input: {
                MemberId: this.cardData.MemberId,
                planType: this.capFirstLetter(this.cardData.type),
                requestType: 'PNG',
                tenantId: tenantId
            }
        };
        if(isEmpire) {
            params.input.isEmpire = "true";
        }

        this.omniRemoteCall(params, true).then((response) => {
            if(!response.error) {
                let data = response.result.IPResult;
                if(response.result.hasOwnProperty('error') && response.result.error == 'OK') {
                    if(data.hasOwnProperty('success')) {
                        if(data.success == false) {
                            this.showTempCard = true;
                        }
                    } else if(data.hasOwnProperty('Status')) {
                        if(data.Status == 'Success') {
                            if(isEmpire) {
                                this.empirePermCardData = data;
                                this.empirePermCardData.isEmpire = true;
                                this.empirePermanentCardStatus = true;
                                this.showPermEmpireCard = true;
                            } else {
                                this.permCardData = data;
                                this.permanentCardStatus = true;
                                this.showPermCard = true;
                            }
                        } else {
                            this.showTempCard = true;
                        }
                    }
                    // If the card is a temporary Attentis Dental card, dispatch event of it being present
                    if(this.isAttentisDental && this.showTempCard) {
                        this.sendEvent('tempattentisdental', {});
                    }
                    this.loading = false;
                    // Let parent component know this card is done loading
                    this.sendEvent('doneloading', {});
                } else {
                    console.error(`IP Member_RequestPermanentCard responded with error code ${data.info.statusCode} ${data.info.status}`);
                    this.errorMsg = `An error occured when getting your permanent ${this.capFirstLetter(this.cardType)} ID Card(s), please try again later.`;
                    this.errorDetails = `Error Code: ${data.info.statusCode} ${data.info.status}`
                    this.showErrorMsg = true;
                }
            } else {
                console.error('Could not call IP Member_RequestPermanentCard, returned with error.');
                this.errorMsg = `An error occured when getting your permanent ${this.capFirstLetter(this.cardType)} ID Card(s), please try again later.`;
                this.showErrorMsg = true;
            }
        }).catch((error) => {
            console.error('Error when calling omniRemoteCall for Member_RequestPermanentCard:');
            if(error) {
                console.log(error);
            } else {
                console.error('Unknown error.');
            }
            this.errorMsg = `An error occured when getting your permanent ${this.capFirstLetter(this.cardType)} ID Card, please try again later.`;
            this.showErrorMsg = true;
        });
    }

    requestIdCard(detail) {
        this.sendEvent('showrequestchange', { detail: { showMsg: false, msg: '' } });
        let type = detail.type;
        let capType = this.capFirstLetter(type);
        if(capType == 'Pharmacy' || capType == 'pharmacy') {
            capType = 'Rx';
        }

        let params = {
            sClassName: "omnistudio.IntegrationProcedureService",
           sMethodName: "Member_RequestCard",
            options: "{}",
            input: { 
                memberId: this.memberId,
                planType: capType
            }
        };
        this.omniRemoteCall(params, true).then((response) => {
            if(!response.error) {
                let eventDetail = {
                    detail: {
                        showMsg: true,
                        msg: ''
                    }
                };
                let data = response.result.IPResult;
                // IF technical error ocurred 
                if(data.hasOwnProperty('success') && !data.success){
                    this.errorMsg = `There was an error processing your request. Please try again later.`;
                    this.showErrorMsg = true;
                    this.loading = false;
                    let params = {
                        sClassName: "omnistudio.IntegrationProcedureService",
                        sMethodName: "Member_RequestCardTechnicalFailure",
                        options: "{}",
                        input: {
                            memberId: this.cardData.MemberId,
                            description: data.result.description,
                        }
                    };
                    this.omniRemoteCall(params, true).then((response) => {
                        console.log('Response Technical ERROR', response)
                    })
                }

                if(response.result.hasOwnProperty('error') && response.result.error == 'OK') {
                    if(data.hasOwnProperty('Description') && data.Description != '') {
                        this.requestIdCardMsg = data.Description;
                        this.showRequestMsg = true;
                        this.loading = false;
                    }
                } else {
                    console.error(`IP Member_RequestCard responded with error code ${data.info.statusCode} ${data.info.status}`);
                    this.errorMsg = `There was an error processing your request. Please try again later.`;
                    this.errorDetails = `Error Code: ${data.info.statusCode} ${data.info.status}`;
                    this.showErrorMsg = true;
                    this.loading = false;
                }
            } else {
                this.errorMsg = `There was an error processing your request. Please try again later.`;
                this.showErrorMsg = true;
                this.loading = false;
            }
        }).catch((error) => {
            console.error('Error when calling omniRemoteCall for Member_RequestCard:');
            if(error) {
                console.log(error);
            } else {
                console.error('Unknown error.');
            }
            this.errorMsg = `There was an error processing your request. Please try again later.`;
            this.showErrorMsg = true;
            this.loading = false;
        });
    }
}
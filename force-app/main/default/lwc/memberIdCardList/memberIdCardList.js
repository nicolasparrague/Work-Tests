import { LightningElement, track, api } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import { NavigationMixin } from 'lightning/navigation';

const ATTENTIS_LOGO = '../resource/AttentisLogo';
const EMPIRE_LOGO = '../resource/empire_logo_color';
const CNY_LOGO = '../resource/ny_seal';
const PPO_LOGO = '../resource/suitcase_logo';
const WATERMARK = '../resource/temporary_watermark';

export default class MemberIdCardList extends OmniscriptBaseMixin(NavigationMixin(LightningElement)) {
    @track memberId = '';
    @track planArr = [];
    @track _selectedMember = {};
    
    @api
    get selectedMember() {
        return this._selectedMember;
    }
    set selectedMember(value) {
        this.loading = true;
        this._selectedMember = {};
        this.memberId = '';
        this.cards = [];
        this.planArr = [];
        this._selectedMember = value;
        this.memberId = value.memberId;
        this.planArr = value.planArr;
        this.cardsNum = 0;
        this.loadedCardCount = 0;
        this.cardSetup();
    }
    
    memberName = '';
    @track loading = true;
    @track showErrorMsg = false;
    @track errorMsg = '';
    @track errorDetails = '';
    cardsNum = 0;
    loadedCardCount = 0;
    
    cardTypeMap = {
        M: {  name: 'medical', value: 0, count: 0  },
        D: {  name: 'dental', value: 1, count: 0  },
        R: {  name: 'pharmacy', value: 2, count: 0  },
        V: {  name: 'vision', value: 3, count: 0  }
    };

    @track cards = [];
    @track showRequestMsg = false;
    @track requestIdCardMsg = '';

    tempAttentisDentalPresent = false;

    get cardBorderColor() {
        return { r: 3, g: 108, b: 182 };
    }

    connectedCallback() {
        this.loading = true;
    }

    handleDoneLoading(evt) {
        // For each doneloading event fired, increase loadedCardCount by 1. If loadedCardCount is equal to the number of cards, all cards are loaded.
        this.loadedCardCount++;
        if(this.loadedCardCount >= this.cardsNum) {
            // If there is only one card in array and it is a temporary Attentis dental card, show error message.
            if(this.tempAttentisDentalPresent && this.cardsNum == 1) {
                this.errorMsg = 'No ID cards were found for this member.';
                this.showErrorMsg = true;
            }
            this.loading = false;
        }
    }

    handleGeneratePDFEvent(evt) {
        this.generatePDF(evt.detail);
    }

    handleGeneratePermPDFDesktopEvent(evt) {
        this.printPermanentPdf(evt.detail, false);
    }

    handleGeneratePermPDFMobileEvent(evt) {
        this.printPermanentPdf(evt.detail, true);
    }

    handleGenerateEmpirePDF(evt) {
        this.generateEmpirePDF(evt.detail);
    }

    handleShowRequestMsgEvent(evt) {
        this.showRequestMsg = false;
        this.requestIdCardMsg = evt.detail.msg;
        this.showRequestMsg = evt.detail.showMsg;
    }

    handleTempAttentisDental(evt) {
        this.tempAttentisDentalPresent = true;
    }

    handleIsEmpireCard(evt) {
        this.cardsNum++;
    }

    capFirstLetter(string) {
        return string.slice(0, 1).toUpperCase() + string.slice(1);
    }

    cardSetup() {
        this.loading = true;
        this.cards = [];
        this.showErrorMsg = false;
        this.errorMsg = '';
        let plans = [...this.planArr];
        let newArr = [];
        let hasMedical = false;
        let hasDental = false;
        this.cardTypeMap.M.count = 0;
        this.cardTypeMap.D.count = 0;
        this.cardTypeMap.R.count = 0;
        this.cardTypeMap.V.count = 0;
        
        plans.forEach((plan) => {
            let cardData = {};
            cardData.type = this.cardTypeMap[plan.planType].name;
            this.cardTypeMap[plan.planType].count++;
            cardData.planId = plan.planId,
            cardData.MemberId = this.memberId,
            cardData.sortValue = this.cardTypeMap[plan.planType].value;
            cardData.key = this.memberId + cardData.type + cardData.planId + this.cardTypeMap[plan.planType].count.toString();
            let cappedType = this.capFirstLetter(cardData.type);
            cardData.accordionLabel = `${cappedType} ID Card`;
            cardData.accordionName = cardData.accordionLabel.replace(/ /g, '');
            cardData.isOpen = false;
            cardData.empireType = plan.empireType;
            // For now, need to figure out how to count NYPPO
            // May need to pass loading on to each memberIdCard instead of this LWC
            if(cardData.type == 'medical') {
                hasMedical = true;
                cardData.isOpen = true;
            }
            if(cardData.type == 'dental') {
                hasDental = true;
            }
            newArr.push(cardData);
        });
        if(newArr.length == 0) {
            this.errorMsg = 'No ID cards were found for this member.';
            this.showErrorMsg = true;
            this.loading = false;
        }
        // Ensures that if no medical card is present but a dental card is, it will default to open
        if(hasDental && (hasMedical == false)) {
            newArr.forEach((plan) => {
                if(plan.type == 'dental') {
                    plan.isOpen = true;
                }
            });
        }
        newArr.sort((a, b) => {
            return a.sortValue - b.sortValue;
        });
        this.cards = [...newArr];
        this.cardsNum = this.cards.length;
    }

    printPermanentPdf(detail, isMobile) {
        this.loading = true;
        let tenantId = 'Attentis';
        let cardData = detail.cardData;
        let name = cardData.MemberName.toLowerCase().replace(/ /g, '');
        let cappedType = this.capFirstLetter(cardData.type);

        let title = `${cappedType}_Card`;
        let filename = `${cappedType}_Card.PDF`;

        let params = {
            sClassName: "omnistudio.IntegrationProcedureService",
            sMethodName: "Member_RequestPermanentCard",
            options: "{}",
            input: {
                MemberId: cardData.MemberId,
                planType: this.capFirstLetter(cardData.type),
                requestType: 'PDF',
                tenantId: tenantId,
                title: title,
                fileNameWithExtension: filename
            }
        };
        if(detail.permData.isEmpire) {
            params.input.isEmpire = "true";
        }
        if(isMobile != undefined && isMobile) {
            //params.input.convertToContentDoc = true;
        }

        console.log('Calling for permanent card PDF, params:');
        console.log(params);
        this.omniRemoteCall(params, true).then((response) => {
            if(!response.error) {
                let data = response.result.IPResult;
                if(response.result.hasOwnProperty('error') && response.result.error == 'OK') {
                    console.log('Successfully got contentDocId OR base64 of PDF!');
                    console.log(data);

                    if(isMobile != undefined && isMobile) {
                        this.downloadPDFForMobile(title, filename, data.BrandedPDF);
                    } else if(isMobile == false) {
                        let downloadLink = document.createElement("a");
                        downloadLink.href = "data:application/pdf;base64," + data.BrandedPDF;
                        downloadLink.download = filename;
                        downloadLink.click();
                    }

                    this.loading = false;
                } else {
                    console.error(`IP Member_RequestPermanentCard responded with error code ${data.info.statusCode} ${data.info.status}`);
                    this.errorMsg = `An error occured when getting your permanent ${this.capFirstLetter(cardData.type)} ID Card(s), please try again later.`;
                    this.errorDetails = `Error Code: ${data.info.statusCode} ${data.info.status}`
                    this.showErrorMsg = true;
                    this.loading = false;
                }
            } else {
                console.error('Could not call IP Member_RequestPermanentCard, returned with error.');
                console.log(response);
                this.errorMsg = `An error occured when getting your permanent ${this.capFirstLetter(cardData.type)} ID Card(s), please try again later.`;
                this.showErrorMsg = true;
                this.loading = false;
            }
        }).catch((error) => {
            console.error('Error when calling omniRemoteCall for Member_RequestPermanentCard:');
            if(error) {
                console.log(error);
            } else {
                console.error('Unknown error.');
            }
            this.errorMsg = `An error occured when getting your permanent ${this.capFirstLetter(cardData.type)} ID Card, please try again later.`;
            this.showErrorMsg = true;
            this.loading = false;
        });
    }

    async generatePDF(detail) {
        let cardData = detail.cardData;
        let name = cardData.MemberName.toLowerCase().replace(/ /g, '');

        var doc = await new jspdf.jsPDF('p','px', 'a4', false, true, 16, 1.0, ['px_scaling']);

        // Create PDF using cardData passed in the detail Object
        let cardType = detail.type.toUpperCase();
        let borderRGB = this.cardBorderColor;
        let logoSrc = ATTENTIS_LOGO;
        let logoH = 15.5;
        let logoHOffset = 30;
        let logo = new Image();
        logo.src = logoSrc;

        // Set up 'TEMPORARY' watermark
        let watermarkSrc = WATERMARK;
        let watermark = new Image();
        watermark.src = watermarkSrc;

        // Add content to card
        doc.addImage(logo, 'JPG', 32.5, logoHOffset, 66, logoH, 'id-logo', 'FAST', 0);

        // Have to do the following to set opacity of watermark
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({opacity: 0.5}));
        doc.addImage(watermark, 'JPG', 20, 20, 220, 111, 'watermark', 'FAST', 0);
        doc.restoreGraphicsState();

        doc.setFont('helvetica', 'normal');
        doc.setDrawColor(borderRGB.r, borderRGB.g, borderRGB.b);
        doc.setLineWidth(0.75);
        doc.roundedRect(20, 20, 204, 113, 10, 10);

        doc.setFontSize(7);

        doc.setTextColor(borderRGB.r, borderRGB.g, borderRGB.b);
        doc.text(cardType, 190, 35);

        doc.setTextColor(52, 55, 65);

        doc.text('Member Name', 40, 57.5);
        doc.text('Member ID', 40, 62.5); 
        doc.text('Coverage Effective Date', 40, 67.5); 
        doc.text('Plan Name', 40, 72.5); 
        if(cardType != 'DENTAL') {
            doc.text(`Rx Bin Number: ${cardData.RxBinNumber}`, 40, 92.5);
        }
        doc.text('Customer Service Number:', 32.5, 112.5);
        doc.text(cardData.CustomerServiceNumber, 32.5, 117.5);

        doc.text(cardData.MemberName, 117.5, 57.5);
        doc.text(cardData.MemberId, 117.5, 62.5); 
        doc.text(cardData.CoverageEffectiveDate, 117.5, 67.5); 
        doc.text(cardData.PlanName, 117.5, 72.5, { maxWidth: 105 }); 
        if(cardType != 'DENTAL') {
            doc.text(`PCN: ${cardData.PCN}`, 117.5, 92.5);
        }
        doc.text('Contact Us:', 117.5, 112.5);
        //doc.text(cardData.WebsiteLinkToCustomerService, 117.5, 117.5);
        doc.text('https://attentisconsulting.com/', 117.5, 117.5);

        let cappedType = this.capFirstLetter(cardData.type);
        if (window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes('CommunityHybridContainer')) {
            this.loading = true;
            let base64 = doc.output('datauristring'); // base64 string
            await this.downloadPDFForMobile(`${cappedType}_Card`, `${cappedType}_Card.PDF`, base64);
        } else {
            doc.save(`${cappedType}_Card.PDF`);
        }
    }

    downloadPermPDFForMobile(contentDocId) {
        let _baseURL = window.location.href;
        let _lastItem = _baseURL.indexOf('/s');
        let rBaseUrl = _baseURL.substring(0, _lastItem);
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: `${window.top.location.origin}/memberportal/servlet/servlet.FileDownload?file=${contentDocId}`
            },
        });
    }

    async generateEmpirePDF(detail) {
        let cardData = detail.cardData;
        let name = cardData.MemberName.toLowerCase().replace(/ /g, '');
        let textOpts = {};
        if(cardData.empireType == 'Commercial') {
            textOpts.maxWidth = 78;
        }
        
        var doc = await new jspdf.jsPDF('p','px', 'a4', false, true, 16, 1.0, ['px_scaling']);

        // ID card border and type needs to be purple or blue depending on branding.
        let borderRGB = this.cardBorderColor;

        let empireLogo = new Image();
        let cnyLogo = new Image();
        let ppoLogo = new Image();

        empireLogo.src = EMPIRE_LOGO;
        cnyLogo.src = CNY_LOGO;
        ppoLogo.src = PPO_LOGO;

        // Set up 'TEMPORARY' watermark
        let watermarkSrcEmp = WATERMARK;
        let watermarkEmp = new Image();
        watermarkEmp.src = watermarkSrcEmp;

        // Image template: doc.addImage(image, 'JPG', logoXOffset, logoYOffset, logoW, logoH, logo-id, 'FAST', 0);
        doc.addImage(empireLogo, 'JPG', 32, 28, 50, 23, 'id-logo-empire', 'FAST', 0);
        doc.addImage(cnyLogo, 'JPG', 183, 28, 26.7, 23, 'id-logo-cny', 'FAST', 0);
        doc.addImage(ppoLogo, 'JPG', 135, 135, 13.6, 11, 'id-logo-ppo', 'FAST', 0);
        
        // Have to do the following to set opacity of watermark
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({opacity: 0.5}));
        doc.addImage(watermarkEmp, 'JPG', 20, 20, 220, 111, 'watermark', 'FAST', 0);
        doc.restoreGraphicsState();

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setDrawColor(borderRGB.r, borderRGB.g, borderRGB.b);
        doc.setLineWidth(0.75);
        doc.roundedRect(20, 20, 204, 133, 10, 10);

        doc.setDrawColor(0, 0, 0);

        doc.line(32, 55, 110, 55);
        doc.line(32, 90, 110, 90);
        doc.line(32, 130, 110, 130);

        doc.line(131.7, 55, 209.7, 55);
        doc.line(131.7, 90, 209.7, 90);
        doc.line(131.7, 130, 209.7, 130);

        doc.text(cardData.MemberName, 32, 64, textOpts);
        doc.text('Identification Number', 32, 74, textOpts);
        
        let planNameY = cardData.empireType == 'Commercial' ? 115 : 109;
        let bcPlanY = cardData.empireType == 'Commercial' ? 125 : 119;
        let planName = cardData.empireType == 'Commercial' ? 'Hospital' : 'Empire Hospital Senior Care';
        doc.text(`Health Plan: ${planName}`, 32, planNameY, textOpts);
        doc.text('BC Plan 754', 32, bcPlanY, textOpts);

        if(cardData.empireType == 'Commercial') {
            doc.text('ER Copay*: $150', 131.7, 64, textOpts);
            doc.text('Hospital Copay: $300 per admission', 131.7, 74, textOpts);
            doc.setFont('Helvetica', 'italic');
            doc.setFontSize(7);
            doc.text('Call NYC HEALTHLINE  for hospital admissions and Empire member services for benefit information (see back for details).', 131.7, 99, textOpts)
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(8);
        }

        if(cardData.empireType == 'Senior') {
            doc.text('Medicare is primary. Bill Medicare first.', 105, 125);
        }

        doc.setFont('Helvetica', 'bold');
        doc.text(`NYC ${cardData.MemberId}`, 32, 84, textOpts);
        doc.text('The City of New York Health Benefits Program', 32, 99, textOpts);

        let cappedType = this.capFirstLetter(cardData.type);
        if (window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes('CommunityHybridContainer')) {
            this.loading = true;
            let base64 = doc.output('datauristring'); // base64 string
            await this.downloadPDFForMobile(`${cappedType}_Card`, `${cappedType}_Card.PDF`, base64);
        } else {
            doc.save(`${cappedType}_Card.PDF`);
        }
    }

    downloadPDFForMobile(title, fileName, base64) {
        let pathTenant = 'memberportal';
        let params = {
            sClassName: "omnistudio.IntegrationProcedureService",
            sMethodName: "Member_Base64ToContentDoc",
            options: "{}",
            input: {
                base64: base64,
                title: title,
                fileNameWithExtension: fileName
            }
        };
        this.omniRemoteCall(params, true).then((response) => {
            let data = response.result.IPResult;
            const contentDocId = data.contentDocId;
            this.loading = false;
            this[NavigationMixin.Navigate]({
                "type": "standard__webPage",
                "attributes": {
                  "url": `${window.top.location.origin}/${pathTenant}/sfc/servlet.shepherd/document/download/${contentDocId}?operationContext=S1`
                }
              });
        }).catch((error) => {
            console.error('Error when calling omniRemoteCall for Member_Base64ToAttachment:');
            if(error) {
                console.log(error);
            } else {
                console.error('Unknown error.');
            }
        });
    }
}
import { LightningElement, track, api } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import { NavigationMixin } from 'lightning/navigation';
import { getDataHandler } from "omnistudio/utility";

//Specify values for quarter picklist.
const QValues = [
    { "label": "Jan-Mar", "value": "Jan-Mar" },
    { "label": "Apr-Jun", "value": "Apr-Jun" },
    { "label": "Jul-Sep", "value": "Jul-Sep" },
    { "label": "Oct-Dec", "value": "Oct-Dec" }
];

//Specify values for month picklist.                   
const MoValues = [{ "label": "Jan", "value": "Jan" }, { "label": "Feb", "value": "Feb" }, { "label": "Mar", "value": "Mar" },
{ "label": "Apr", "value": "Apr" }, { "label": "May", "value": "May" },
{ "label": "Jun", "value": "Jun" }, { "label": "Jul", "value": "Jul" },
{ "label": "Aug", "value": "Aug" }, { "label": "Sep", "value": "Sep" },
{ "label": "Oct", "value": "Oct" }, { "label": "Nov", "value": "Nov" },
{ "label": "Dec", "value": "Dec" }];
export default class QuarterlyMonthlyEOB extends OmniscriptBaseMixin(NavigationMixin(LightningElement)) {

    eobQValues = [];
    eobYValues = [];
    eobMoValues = [];
    @track _brand;
    @track _memberType;
    @track _memberId;
    @track _claims;
    eobMFilter;
    eobQFilter;
    showExport;
    tenant;
    loading;
    desktopLink;

    showError = false;
    errorTitle = '';
    errorMsg = '';

    _baseURL = '';
    _lastItem = 0;
    rBaseUrl = '';
    //accessibility
    //innerLabel = "Export";

    // EOB Dropdown Values
    quarterMonth = '';
    quarterYear = '';
    quarterIndex;
    monthlyMonth = '';
    monthlyYear = '';
    monthIndex;

    //Encrypted PDF
    @track targetParams = {};
    @track targetName;

    optionSelected;
    //accessibility code below
    /* @api
     get ariaLabel() {
         return this.innerLabel;
     }
 
     set ariaLabel(newValue) {
         this.innerLabel = newValue;
     }*/
    @api
    get claims(){
        return this._claims;
    }
    set claims(val){
        this._claims = val;
    }

    @api
    get brand() {
        return this._brand;
    }
    //accessibility code ends
    set brand(val) {
        this._brand = val;
    }
    @api
    get memberType() {
        return this._memberType;
    }

    set memberType(val) {
        this._memberType = val;
    }
    @api
    get memberId() {
        return this._memberId;
    }

    set memberId(val) {
        this._memberId = val;
    }

    get showQuarterly() {
        // Only show quarterly if NOT Medicare or Commercial
        return !(this.memberType == 'Medicare' || this.memberType == 'Commercial')
    }

    connectedCallback() {
        //Specify values for quarter/monthly picklist.
        // this.template.querySelector('[data-id="export"]').ariaLabel = 'Export Testing';
        this.eobQValues = QValues;
        this.eobMoValues = MoValues;
        this.setYearDropdownList();

        let tenantUrl = window.location.pathname;
        if (tenantUrl.includes("member/s")) {
            this.tenant = "Attentis";
            this.desktopLink = window.location.origin + '/memberportal/apex/GetLatestDocumentMember?';
            this.targetName = '/memberportal/apex/GetLatestDocumentMember';
        } else {
            console.log("No valid url received..");
        }

        //console.log('claims-- ', JSON.stringify(this._claims));
    }

    setYearDropdownList() {
        let yearArray = []
        var today = new Date();
        var currentYear = Number(today.getFullYear());
        let startYear = currentYear - 2;

        //Get last 2 years from current year.
        for (let i = 0; i < 3; i++) {
            yearArray.push({ "label": String(startYear), "value": String(startYear) });
            startYear++;
        }
        this.eobYValues = yearArray;
    }

    transformDate(evt) {
        if (evt) {
            let dateLabel;
            let dateName;
            let dateValue;

            dateLabel = evt.target.placeholder;
            dateName = evt.target.name;
            dateValue = evt.target.value;
            // console.log('date value', dateValue);
            // console.log('date name', dateName);
            // console.log('date label', dateLabel);

            // Quarter Dropdown
            if (dateName == 'Quarterly') {
                if (dateLabel == 'Quarter') {
                    this.quarterMonth = dateValue;
                }

                if (dateLabel == 'Year') {
                    this.quarterYear = dateValue;
                }
            }

            // Monthly Dropdown
            if (dateName == 'Monthly') {
                if (dateLabel == 'Month') {
                    this.monthlyMonth = dateValue;
                }

                if (dateLabel == 'Year') {
                    this.monthlyYear = dateValue;
                }
            }

            // Recalculate available Months and Quarters for each available year
            var today = new Date();
            var todayMM = Number(String(today.getMonth() + 1).padStart(2, "0")); //January is 0!
            var todayDD = Number(String(today.getDate()).padStart(2, "0"));
            var todayYYYY = Number(today.getFullYear());

            // Calculate previous 2 years in array
            var yearValues = [todayYYYY, todayYYYY - 1, todayYYYY - 2];

            // Validate Years
            var counterM = 0;
            var counterQ = 0;
            var allowedMonths = [];
            var allowedQuarters = [];

            // Assign quarter value from today month
            var todayQuarterNumber;

            if (todayMM == 1 || todayMM == 2 || todayMM == 3) {
                todayQuarterNumber = 1;
            } else if (todayMM == 4 || todayMM == 5 || todayMM == 6) {
                todayQuarterNumber = 2;
            } else if (todayMM == 7 || todayMM == 8 || todayMM == 9) {
                todayQuarterNumber = 3;
            } else {
                todayQuarterNumber = 4;
            }

            // Validate quarters for each available year
            if (this.quarterYear == '') {

            } else if (this.quarterYear == yearValues[0]) {
                // Remove quarters ahead of current date
                for (var q = 0; q < QValues.length; q++) {
                    if (q < todayQuarterNumber) {
                        allowedQuarters.push(QValues[q]);
                    }
                }
                this.quarterIndex = 0;
                this.eobQValues = allowedQuarters;
            } else if (this.quarterYear == yearValues[1]) {
                this.quarterIndex = 0;
                this.eobQValues = QValues;
            } else if (this.quarterYear == yearValues[2]) {
                for (var k = 0; k < QValues.length; k++) {
                    if (k >= todayQuarterNumber - 1) {
                        allowedQuarters.push(QValues[k]);
                    } else {
                        counterQ++;
                    }
                }
                this.quarterIndex = counterQ;
                this.eobQValues = allowedQuarters;
            } else {
                console.log('Unexpected values..');
            }

            // Monthly-Year
            if (this.monthlyYear == '') {

            } else if (this.monthlyYear == yearValues[0]) {
                // Remove months ahead of current date
                for (var z = 0; z < MoValues.length; z++) {
                    if (z < todayMM) {
                        allowedMonths.push(MoValues[z]);
                    }
                }
                this.monthIndex = 0;
                this.eobMoValues = allowedMonths;
            } else if (this.monthlyYear == yearValues[1]) {
                this.monthIndex = 0;
                this.eobMoValues = MoValues;
            } else if (this.monthlyYear == yearValues[2]) {
                // Remove months behind 24 months
                for (var x = 0; x < MoValues.length; x++) {
                    // Less 1 added in order to have the same month 2 years ago
                    if (x >= todayMM - 1) {
                        allowedMonths.push(MoValues[x]);
                    } else {
                        counterM++;
                    }
                }
                this.monthIndex = counterM;
                this.eobMoValues = allowedMonths;
            } else {
                console.log('Unexpected value..');
            }

            // Bug
            let flag;
            let flagQ

            // Monthly
            for (var m = 0; m < this.eobMoValues.length; m++) {
                if (this.monthlyMonth == this.eobMoValues[m].value) {
                    flag = true;
                    break;
                } else {
                    flag = false;
                }
            }

            // Quarterly
            for (var n = 0; n < this.eobQValues.length; n++) {
                if (this.quarterMonth == this.eobQValues[n].value) {
                    flagQ = true;
                    break;
                } else {
                    flagQ = false;
                }
            }

            if (flag == false) {
                this.monthlyMonth = '';
            }

            if (flagQ == false) {
                this.quarterMonth = '';
            }
        }
    }

    handleEobFilterChange(event) {
        let selectedRadio = event.target.getAttribute("value");
        this.optionSelected = selectedRadio;
        if (selectedRadio == 'quarterly') {
            this.eobMFilter = false;
            this.eobQFilter = true;
            this.showExport = true;
        }
        if (selectedRadio == 'monthly') {
            this.eobQFilter = false;
            this.eobMFilter = true;
            this.showExport = true;
        }
    }

    handleExportEobPdf() {
        // Validate Option
        if (this.optionSelected == 'quarterly') {
            if (this.quarterMonth != '' && this.quarterYear != '') {
                // Get last day of quarter
                let lastQuarterMonth;
                let finalMonth;
                if (this.quarterIndex == 0) {
                    for (var a = 0; a < this.eobQValues.length; a++) {
                        if (this.quarterMonth == this.eobQValues[a].value) {
                            lastQuarterMonth = a;
                            break;
                        }
                    }
                } else {
                    for (var c = this.quarterIndex; c < QValues.length; c++) {
                        if (this.quarterMonth == QValues[c].value) {
                            lastQuarterMonth = c;
                            break;
                        }
                    }
                }

                if (lastQuarterMonth == 0) {
                    finalMonth = 2;
                } else if (lastQuarterMonth == 1) {
                    finalMonth = 5;
                } else if (lastQuarterMonth == 2) {
                    finalMonth = 8;
                } else {
                    finalMonth = 11;
                }

                // Building Date
                let ldom = new Date(this.quarterYear, finalMonth + 1, 0);
                let dd = String(ldom.getDate()).padStart(2, "0");
                let mm = String(ldom.getMonth() + 1).padStart(2, "0"); //January is 0!
                let yyyy = ldom.getFullYear();
                let lastDayQuarterly = mm + "/" + dd + "/" + yyyy;

                // Validate Brand
                let brandInput;
                if (this.brand == 'HIP') {
                    brandInput = 'HMO';
                }

                if (this.brand == 'GHI') {
                    brandInput = 'PPO';
                }

                // Quarterly Data EOB EH
                let inputs = {
                    param1: this.memberId,              //MemberId
                    param2: brandInput,                 //Brand
                    param3: lastDayQuarterly,           //Last Date of Quarter
                    query: "EOB_Emblem_Quarterly"
                }

                this.getLastDocument(inputs);
            } else {
                console.log('Quarterly: Required Fields Missing..');
            }
        }

        if (this.optionSelected == 'monthly') {
            if (this.monthlyMonth != '' && this.monthlyYear != '') {
                // Get last day of month
                let month;
                if (this.monthIndex == 0) {
                    for (var b = 0; b < this.eobMoValues.length; b++) {
                        if (this.monthlyMonth == this.eobMoValues[b].value) {
                            month = b;
                            break;
                        }
                    }
                } else {
                    for (var b = this.monthIndex; b < MoValues.length; b++) {
                        if (this.monthlyMonth == MoValues[b].value) {
                            month = b;
                            break;
                        }
                    }
                }
                // Building Date
                let ldom = new Date(this.monthlyYear, month + 1, 0);
                let dd = String(ldom.getDate()).padStart(2, "0");
                let mm = String(ldom.getMonth() + 1).padStart(2, "0"); //January is 0!
                let yyyy = ldom.getFullYear();
                let lastDayMonthly = mm + "/" + dd + "/" + yyyy;
                let claimFound = false;
                let inputs;
                // Monthly Data EOB 
                inputs = {
                    param1: this.memberId,
                    param2: '',
                    param3: '',
                    query: ''
                }
                // If user is Medicare, fetch relevant claim by matching month/year to relevant claimPaidDate (MPV-2516)
                if(this.memberType == 'Medicare') {
                    let claimId = '';
                    
                    this.claims.forEach(claim => {
                        let paidM = claim.claimPaidDate.substring(0, 2);
                        let paidY = claim.claimPaidDate.substring(6, claim.claimPaidDate.length);

                        if(paidM == mm && paidY == yyyy) {
                            claimId = claim.claimNumber;
                        }
                    });

                    if(claimId != '') {
                        claimFound = true;
                        inputs = {
                            param1: this.memberId,
                            param2: claimId,
                            param3: '',
                            query: ''
                        }
                    }
                } else {
                    claimFound = true;
                }
                if(claimFound) {
                    this.getLastDocument(inputs);
                } else {
                    this.errorTitle = 'Explanation of Benefits (EOB)';
                    this.errorMsg = 'Requested document not available';
                    this.showError = true;
                    this.loading = false;
                }
            } else {
                console.log('Monthly: Required Fields Missing..');
            }
        }
    }

    getLastDocument(inputs) {
        //alert('inputs '+ inputs.param1 +' '+inputs.param2 +' '+inputs.param3 +' '+inputs.query);
        this.targetParams = '{"param1": "' + inputs.param1 + '", "param2": "' + inputs.param2 + '", "param3": "' + inputs.param3 + '","query":"' + inputs.query + '"}';
        this.showError = false;
        this.loading = true;
        // Mobile Devices
        if (window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes('CommunityHybridContainer')) {
            //alert('getLastDocument Mobile');
            let params = {
                sClassName: 'omnistudio.IntegrationProcedureService',
                sMethodName: 'AMP_GetLastDocument',
                options: '{}',
                input: inputs,
            };
            this.omniRemoteCall(params, true).then((response) => {
                if (!response.error) {
                    let data = response.result.IPResult;
                    if (data.documents.length == 1) {
                        //alert('Document Found!');
                        let doc = data.documents[0];
                        if (doc.mimeType === 'pdf') {
                            //To create a content doc and download
                            let title = inputs.memberId + '_' + inputs.query;
                            let fileName = inputs.memberId + '_' + inputs.query + '.pdf';
                            this.downloadPDFForMobile(title, fileName, doc.content);
                        }
                    } else if (data.documents.length > 1) {
                        //alert('We found more than one document..');
                        // If more than one document, we need to call ESB_GetDocument for the correct base64
                        let docId = data.documents[0].id;
                        this.getDocument(docId, inputs);
                    } else {
                        //alert('There is no document..');
                        this.errorTitle = 'Explanation of Benefits (EOB)';
                        this.errorMsg = 'Requested document not available';
                        this.showError = true;
                        this.loading = false;
                    }
                }
            }).catch((error) => {
                console.error('Error when calling omniRemoteCall for ESB_GetLastDocument:');
                if (error) {
                    console.log(error);
                } else {
                    console.error('Unknown error.');
                }
                this.showError = true;
                this.loading = false;
            });
            // Desktop Execution
        } else {
            let inputMap = {
                methodName: "encrypt",
                unencryptedStringValue: JSON.stringify(JSON.parse(this.targetParams)),
            };
            this.loading = false;
            this.callIp("portalEncrypt_Decrypt", inputMap).then((data) => {
                this[NavigationMixin.GenerateUrl]({
                    type: 'standard__webPage',
                    attributes: {
                        url: this.targetName + '?dataParam=' + data.IPResult.encryptedString
                    }
                }).then((url) => {
                    let completeURL = window.location.origin + url;
                    window.open(completeURL);
                });
            });
            //window.open(this.desktopLink + 'param1=' + inputs.param1 + '&param2=' + inputs.param2 + '&param3=' + inputs.param3 + '&query=' + inputs.query);
        }
    }

    getDocument(docId, inputs) {
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
                if (data.documents.length > 0) {
                    let doc = data.documents[0];
                    if (doc.mimeType === 'pdf') {
                        //To create a content doc and download
                        let title = inputs.memberId + '_' + inputs.query;
                        let fileName = inputs.memberId + '_' + inputs.query + '.pdf';
                        this.downloadPDFForMobile(title, fileName, doc.content);
                    }
                } else {
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
        this.loading = true;
        let pathTenant= 'memberportal';
        
        // MPV-1309 US Sprint 11
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

    callIp(ipMethod, inputMap) {
        let datasourcedef = JSON.stringify({
            type: "integrationprocedure",
            value: {
                ipMethod: ipMethod,
                inputMap: inputMap,
                optionsMap: "",
            },
        });

        return getDataHandler(datasourcedef)
            .then((data) => {
                return JSON.parse(data);
            })
            .catch((error) => {
                if (error && error.length) {
                    console.error(`failed at getting data from IP - portalEncrypt_Decrypt => ${JSON.stringify(error)}`);
                } else {
                    console.error(`failed at getting data from IP - portalEncrypt_Decrypt => ${error}`);
                }
            });
    }

    closeModal() {
        this.showError = false;
    }

    trapFocus() {
        this.template.querySelector('[data-id="modalButton"]').focus();
    }

}
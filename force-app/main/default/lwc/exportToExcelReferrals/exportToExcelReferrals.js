import { LightningElement, api, track } from 'lwc';
import template from "./exportToExcelReferrals.html";
import { loadScript } from 'lightning/platformResourceLoader';
import { NavigationMixin } from 'lightning/navigation';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";

export default class ExportToExcelReferrals extends OmniscriptBaseMixin(NavigationMixin(LightningElement)) {
    _buttonLabel;
    // _ariaLabel;
    _sourceFromIp;
    _ipStructure;
    _ipResponseNode;
    _tableData;
    _tableStructure;
    _fileName;
    loading;
    @track
    listRecords;
    @api
    tab;

    @api
    ariaLabel;

    render() {
        return template;
    }

    @api
    get buttonLabel() {
        return this._buttonLabel;
    }

    set buttonLabel(label) {
        this._buttonLabel = label;
    }

    // @api
    // get ariaLabel() {
    //     return this._ariaLabel;
    // }

    // set ariaLabel(newValue) {
    //     this._ariaLabel = newValue;
    // }

    @api
    get sourceFromIp() {
        return this._sourceFromIp;
    }

    set sourceFromIp(val) {
        this._sourceFromIp = val == 'true';
    }

    @api
    get ipStructure() {
        return this._ipStructure;
    }

    set ipStructure(structure) {
        this._ipStructure = structure;
    }

    @api
    get ipResponseNode() {
        return this._ipResponseNode;
    }

    set ipResponseNode(val) {
        this._ipResponseNode = val
    }

    @api
    get tableData() {
        return this._tableData;
    }

    set tableData(tableData) {
        if (tableData) {
            this._tableData = tableData;
        }
    }

    @api
    get tableStructure() {
        return this._tableStructure;
    }

    set tableStructure(structure) {
        this._tableStructure = structure;
    }

    @api
    get fileName() {
        return this._fileName;
    }

    set fileName(name) {
        this._fileName = name;
    }

    async renderedCallback() {
        await Promise.all([
            loadScript(this, '../resource/omnistudio__SheetJS')
        ]).catch(e => {
            console.error(e);
        })
    }

    async generateExcel() {
        this.today = new Date();
        var ddmap = String(this.today.getDate()).padStart(2, "0");
        var mmmap = String(this.today.getMonth() + 1).padStart(2, "0"); //January is 0!
        var yyyymap = this.today.getFullYear();
        this.today = mmmap + "/" + ddmap + "/" + yyyymap;
        let headerLabels = JSON.parse(JSON.stringify(this._tableStructure)).header;
        let fields = JSON.parse(JSON.stringify(this._tableStructure)).fields;
        this.loading = true;
        let tableData = [];

        if (this._sourceFromIp) {
            this._tableData = await this.getAllRecordsFromIP();

        }

        tableData = JSON.parse(JSON.stringify(this._tableData));

        const updatedTableData = tableData.map(({ Id, uniqueKey, ...data }) => {
            if (fields) {
                let parsedData = {};
                for (let i = 0; i < fields.length; i++) {
                    parsedData[fields[i]] = data[fields[i]];
                }
                return parsedData;
            } else {
                return data;
            }
        });
        const XLSX = window.XLSX;

        const headers = headerLabels;

        var workbook = XLSX.utils.book_new();

        //XLSX.utils.sheet_add_aoa(workbook, headers);
        XLSX.utils.sheet_add_aoa(workbook, [['As of date: ' + this.today]], { origin: 'A1' } );
        XLSX.utils.sheet_add_aoa(workbook, headers, { origin: 'A2' });

        var worksheet = XLSX.utils.sheet_add_json(workbook, updatedTableData, { origin: 'A3', skipHeader: true });

        XLSX.utils.book_append_sheet(workbook, worksheet, this._fileName);

        if (window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes('CommunityHybridContainer')) {
            var base64 = XLSX.write(workbook, { type: 'base64' }); // base64 string
            await this.downloadExcelForMobile(this._fileName, `${this._fileName}.xlsx`, base64);
        } else {
            await XLSX.writeFile(workbook, `${this._fileName}.xlsx`);
            this.loading = false;
        }
        this.ariaHidden = "true";
        this.ariaLabel = "test test";
    }


    getAllRecordsFromIP() {
        
        let ipStructure = JSON.parse(JSON.stringify(this._ipStructure));
        let params = {
            sClassName: "omnistudio.IntegrationProcedureService",
            sMethodName: ipStructure.sMethodName,
            options: "{}",
            input: ipStructure.input
        };
        
        return this.omniRemoteCall(params, true)
            .then((response) => {
                let data = response.result.IPResult;
                this.listRecords = this.ipResponseNode ? data[this.ipResponseNode] : data;
                if(this.tab == "Pre-Authorization") {
                    this.updatePreauthData(this.listRecords);
                }
                return Array.isArray(this.listRecords) ? this.listRecords : [this.listRecords];
            })
            .catch(error => {
                console.error(
                    "error while posting data",
                    JSON.stringify(error)
                );
            });
    }

    updatePreauthData(arrayPreuth){
        if (Array.isArray(arrayPreuth)){
            for (var r = 0; r < arrayPreuth.length; r ++){
                if(arrayPreuth[r].status != "Fully Approved"){
                    arrayPreuth[r].visits = null;
                }
            }
        }
    }


    downloadExcelForMobile(title, fileName, base64) {
        // MPV-1309 US Sprint 11
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
        })
            .catch(error => {
                console.error(
                    "error while posting data",
                    JSON.stringify(error)
                );
            });
    }
}
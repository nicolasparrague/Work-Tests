import { LightningElement, api } from 'lwc';
import template from "./exportToExcel.html";
import { loadScript } from 'lightning/platformResourceLoader';
import { NavigationMixin } from 'lightning/navigation';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";

export default class ExportToExcel extends OmniscriptBaseMixin(NavigationMixin(LightningElement)) {
    _buttonLabel;
    _sourceFromIp;
    _ipStructure;
    _ipResponseNode;
    _tableData;
    _tableStructure;
    _fileName;
    loading;

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
            loadScript(this, '../resource/SheetJS')
        ]).catch(e => {
            console.error(e);
        })
    }

    async generateExcel() {
        // Get Today's date
        this.today = new Date();
        var ddmap = String(this.today.getDate()).padStart(2, "0");
        var mmmap = String(this.today.getMonth() + 1).padStart(2, "0"); //January is 0!
        var yyyymap = this.today.getFullYear();
        this.today = mmmap + "/" + ddmap + "/" + yyyymap;
        let headerLabels = JSON.parse(JSON.stringify(this._tableStructure)).header;
        let fields = JSON.parse(JSON.stringify(this._tableStructure)).fields;
        let types = JSON.parse(JSON.stringify(this.tableStructure)).types;
        let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        this.loading = true;
        let tableData = [];
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        });
        if (this._sourceFromIp) {
            this._tableData = await this.getAllRecordsFromIP();
        }
        tableData = JSON.parse(JSON.stringify(this._tableData));
        const updatedTableData = tableData.map(({ Id, uniqueKey, ...data }) => {
            if (fields) {
                let parsedData = {};
                for (let i = 0; i < fields.length; i++) {
                    // if(types[i] =='currency')
                    // {
                    //     parsedData[fields[i]] = formatter.format(data[fields[i]]);
                    //  }
                    //  else
                    //  {
                    // parsedData[fields[i]] = data[fields[i]];
                    //  }
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
        XLSX.utils.sheet_add_aoa(workbook, [['As of date: ' + this.today]], { origin: 'A1' });
        XLSX.utils.sheet_add_aoa(workbook, headers, { origin: 'A2' });
        var worksheet = XLSX.utils.sheet_add_json(workbook, updatedTableData, { origin: 'A3', skipHeader: true });
        let colIndex = [];
        let myMap = new Map();
        if (types.length > 0) {
            for (var t = 0; t < types.length; t++) {
                if (types[t] == 'currency') {
                    colIndex.push(t);
                    myMap.set(t, letters[t]);
                }
            }
        }
        var range = XLSX.utils.decode_range(worksheet['!ref']);
        for (var col = 0; col < colIndex.length; col++) {
            var actualColumn = XLSX.utils.decode_col(myMap.get(colIndex[col])); // 3
            for (var i = range.s.r + 2; i <= range.e.r; ++i) {
                var ref = XLSX.utils.encode_cell({ r: i, c: actualColumn });
                if (!worksheet[ref]) continue;
                if (worksheet[ref].v == '-') {
                } else {
                    worksheet[ref].z = fmt;
                }
            }
        }
        XLSX.utils.book_append_sheet(workbook, worksheet, this._fileName);
        if (window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes('CommunityHybridContainer')) {
            var base64 = XLSX.write(workbook, { type: 'base64' }); // base64 string
            await this.downloadExcelForMobile(this._fileName, `${this._fileName}.xlsx`, base64);
        } else {
            await XLSX.writeFile(workbook, `${this._fileName}.xlsx`);
            this.loading = false;
        }
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
                console.log('getAllRecordsFromIP', data);
                let listRecords = this.ipResponseNode ? data[this.ipResponseNode] : data;
                return Array.isArray(listRecords) ? listRecords : [listRecords];
            })
            .catch(error => {
                console.error(
                    "error while posting data",
                    JSON.stringify(error)
                );
            });
    }


    downloadExcelForMobile(title, fileName, base64) {
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
                    // MPV-1309 Sprint 11 US
                    //url: `${window.top.location.origin}/${pathTenant}/servlet/servlet.FileDownload?file=${contentDocId}`
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
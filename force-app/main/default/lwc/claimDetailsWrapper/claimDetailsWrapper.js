import { LightningElement } from 'lwc';
import { getDataHandler } from "omnistudio/utility";
import { loadCssFromStaticResource } from 'omnistudio/utility';

export default class ClaimDetailsWrapper extends LightningElement {
    _decryptedParams;
    _records;
    _attributes;

    connectedCallback() {
        let dataToDecrypt = this.getQueryParameters().dataParam;
        this.decryptData(dataToDecrypt);

        let completeURL = '/assets/styles/vlocity-newport-design-system-scoped.min.css';
        loadCssFromStaticResource(this, 'newportAttentisAlt', completeURL).then(resource => {
            console.log(`Theme loaded successfully =>`);
        }).catch(error => {
            console.log(`Theme failed to load => ${error}`);
        });
    }   

    getQueryParameters() {
        var params = {};
        var search = location.search.substring(1);

        if (search) {
            params = JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}', (key, value) => {
                return key === "" ? value : decodeURIComponent(value)
            });
        }

        return params;
    }

    getClaimDetails(params) {
        let inputMap = {
            claimNumber: params.claimNumber,
            claimType: params.claimType,
            memberId: params.memberId
        };

        this.callIp('Member_ClaimsDetails', inputMap).then(data => {
            console.log('data', JSON.stringify(data));
            
            this._records = data.IPResult;
            this._records.lobdMCTR = params.lobdMCTR;
        });
    }

    decryptData(value) {
        let inputMap = {
            methodName: 'decrypt',
            encryptedAndEncodedString: value
        };

        // this.callIp('portalEncrypt_Decrypt', inputMap).then(data => {
        //     this._decryptedParams = JSON.parse(data.IPResult.decryptedString);
        //     this._attributes = {
        //         networkCode: this._decryptedParams.networkCode
        //     }
            this.getClaimDetails({
                "memberId": "K3763679101",
                "claimNumber": "21Q012799900",
                "claimType": "Medical",
                "networkCode": "2023",
                "lobdMCTR": "1006"
            });
        // });
    }

    callIp(ipMethod, inputMap) {
        let datasourcedef = JSON.stringify({
            "type": "integrationprocedure",
            "value": {
                "ipMethod": ipMethod,
                "inputMap": inputMap,
                "optionsMap": ""
            }
        });

        return getDataHandler(datasourcedef).then(data => {
            return JSON.parse(data);

        }).catch(error => {
            console.error(`failed at getting IP data => ${JSON.stringify(error)}`);
        });
    }


}
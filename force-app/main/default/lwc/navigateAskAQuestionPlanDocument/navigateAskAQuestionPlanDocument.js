import { LightningElement, track, api } from 'lwc';
import { getDataHandler } from "omnistudio/utility";

export default class NavigateAskAQuestionPlanDocument extends LightningElement {
    @track
    askQuestionParams;
    showButton;
    dataParam;
    url;

    connectedCallback(){
        this.url = window.location.href;
        let url = new URL(this.url);
        let dataParam = url.searchParams.get("dataParam");
        console.info('Data params: ', dataParam);
        if(dataParam){
            this.decryptData(dataParam);
        }else{
            this.askQuestionParams = '{"origin":"PlanDocument", "planName":"null", "url": "' + this.url + '"}';
            this.showButton = true;
        }  
    }

    decryptData(value) {
        let inputMap = {
            methodName: 'decrypt',
            encryptedAndEncodedString: value
        };

        this.callIp('portalEncrypt_Decrypt', inputMap).then(data => {
            let decryptedParams = JSON.parse(data.IPResult.decryptedString);
            this.askQuestionParams = '{"origin":"PlanDocument", "planName":"' + decryptedParams.planName + '", "url": "' + this.url + '"}';
            this.showButton = true;
        });
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
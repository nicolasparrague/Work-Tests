import { LightningElement, api } from "lwc";
import { getDataHandler } from "omnistudio/utility";
import { loadCssFromStaticResource } from 'omnistudio/utility';

export default class BenefitsPlanDetailsWrapper extends LightningElement {
   _decryptedParams;
   _records;
   errorMessage ='Error --> No data returned from IP'


   connectedCallback() {

      let completeURL = '/assets/styles/vlocity-newport-design-system-scoped.min.css';

      loadCssFromStaticResource(this, 'newportAttentisAlt', completeURL).then(resource => {
         console.log(`Theme loaded successfully`);
      }).catch(error => {
         console.log(`Theme failed to load => ${error}`);
      });

      let dataToDecrypt = this.getQueryParameters().dataParam;
      this.decryptData(dataToDecrypt);
      
   }

   getQueryParameters() {
      var params = {};
      var search = location.search.substring(1);

      if (search) {
         params = JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}', (key, value) => {
            return key === "" ? value : decodeURIComponent(value);
         });
      }

      return params;
   }

   decryptData(value) {
      let inputMap = {
         methodName: "decrypt",
         encryptedAndEncodedString: value,
      };

      // APEX CLASS USED IS NOT WORKING FOR OMNISTUDIO
      // this.callIp("portalEncrypt_Decrypt", inputMap).then((data) => {
      //    if(data.IPResult?.decryptedString){
      //       this._decryptedParams = JSON.parse(data.IPResult.decryptedString);
      //       this._records = this._decryptedParams;
      //       //console.log("decryptedParams >>" + JSON.stringify(this._decryptedParams));
      //    }else{
      //       console.error(`${this.errorMessage} portalEncrypt_Decrypt`)
      //    }
      // });

      this._records = {
         "planId": "MS040114",
         "status": "Active",
         "effectiveDate": "10/01/2021",
         "dateText": "10/01/2021",
         "subscriberId": "K37636791",
         "selectedMemberId": "K3763679101",
         "planName": "FlexPOS Platinum Alternative",
         "tab": "detail",
         "terminationDate": "12/31/2199",
         "portalType": "Attentis",
         "statusText": "Active",
         "networkCode": "2023",
         "brand": "Attentis",
         "planType": "M",
         "hideMemberMsg": true
     }
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
            console.error(`failed at getting IP data => ${JSON.stringify(error)}`);
         });
   }
}
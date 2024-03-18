import { LightningElement, api } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";

export default class BillingAndPaymentWrapper extends OmniscriptBaseMixin(LightningElement) {
   json;
   showOS;

   connectedCallback() {
      let jsonParamsForDecrypt = this.getQueryParameters().dataParam;

      if (jsonParamsForDecrypt) {
         let params = {
            sClassName: "omnistudio.IntegrationProcedureService",
            sMethodName: "portalEncrypt_Decrypt",
            options: "{}",
            input: {
               methodName: "decrypt",
               encryptedAndEncodedString: jsonParamsForDecrypt,
            },
         };
         this.omniRemoteCall(params, true).then((response) => {
            this.json = response.result.IPResult.decryptedString;
            this.showOS = true;
         });
      } else {
         this.showOS = true;
      }
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
}
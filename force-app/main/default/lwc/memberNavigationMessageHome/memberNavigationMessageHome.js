import { LightningElement, api, track } from "lwc";
import template from "./memberNavigationMessageHome.html";
import { getDataHandler, } from "omnistudio/utility";
import { NavigationMixin } from "lightning/navigation";
import pubsub from "omnistudio/pubsub";

export default class MemberNavigationMessageHome extends NavigationMixin(LightningElement) {
   memberSessionObjStr;
   pathName;
   targetparams;
   @track onMobile = false;
   iconResource;
   errorMessage ='Error --> No data returned from IP'

   @track iconFocusInvert;


   connectedCallback() {
      this.setButtonColor();
      if (document.documentElement.clientWidth < 768 ) {
         this.onMobile = true;
     }
   }

   setButtonColor() {
      this.pathName = window.parent.location.href;
      this.iconResource = 'data:image/svg+xml;base64, PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOm5vbmU7c3Ryb2tlOiMyMDIwMjA7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS13aWR0aDoycHg7fTwvc3R5bGU+PC9kZWZzPjxnIGlkPSJHcm91cCI+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNNjIsNTJIMlYxMkg2MlpNMiw1MiwyMiwzMS41OW0yMCwwTDYyLDUyTTIsMTIsMzIsNDEsNjIsMTIiLz48L2c+PC9zdmc+'
   }

   encryptData(evt) {
      let inputMap = {
         methodName: "encrypt",
         unencryptedStringValue: JSON.stringify(JSON.parse(this.targetparams)),
      };
      this.callIp("portalEncrypt_Decrypt", inputMap).then((data) => {
         if(data.IPResult){
         this[NavigationMixin.Navigate]({
            type: "standard__namedPage",
            attributes: {
               pageName: "create-message",
            },
            state: {
               dataParam: data.IPResult.encryptedString,
            },
         });
      }else{
         console.error(`${this.errorMessage} portalEncrypt_Decrypt`)
      }
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
            console.error(`failed at getting IP data => ${JSON.stringify(error)}`);
         });
   }

   handleRedirection(evt) {
      this.targetparams = '{"origin":"home"}';
      this.encryptData(this.targetparams);
   }

   renderedCallback() {
      const iconSelected = this.template.querySelector(".iconSelected");
      if(iconSelected != undefined){         
         iconSelected.addEventListener("focus", function(event) {
            this.iconFocusInvert = true;   
         });
      }
      else{
         this.iconFocusInvert = false;
      }
   }
}
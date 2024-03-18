import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import pubsub from "omnistudio/pubsub";
import { getDataHandler } from "omnistudio/utility";

export default class NavigationActionEncrypted extends NavigationMixin(LightningElement) {
   _targetType;
   _targetName;
   _targetParams;
   _label;
   _variant;
   _iconPosition;
   _iconName;
   _iconSize = "x-small";
   _encryptedParams;
   _extraclass;
   _openurl;
   _customurl;
   _planName;
   _ariaLabel;
   _origin;
   _referralId;

   get gotVars() {
      let value = !!(this._targetType && this._targetName && this._targetParams && this._label);
      return value;
   }

   @api
   get targettype() {
      return this._targetType;
   }
   set targettype(value) {
      this._targetType = value;
   }

   @api
   get targetname() {
      return this._targetName;
   }
   set targetname(value) {
      this._targetName = value;
   }

   @api
   get targetparams() {
      return this._targetParams;
   }
   set targetparams(value) {
      this._targetParams = value;
   }

   @api
   get label() {
      return this._label;
   }
   set label(value) {
      this._label = value;
   }

   @api
   get variant() {
      return this._variant;
   }
   set variant(value) {
      this._variant = value;
   }

   @api
   get iconposition() {
      return this._iconPosition;
   }
   set iconposition(value) {
      this._iconPosition = value;
   }

   @api
   get iconname() {
      return this._iconName;
   }
   set iconname(value) {
      this._iconName = value;
   }

   @api
   get extraclass() {
      return this._extraclass;
   }
   set extraclass(value) {
      this._extraclass = "testClass " + value;
   }

   @api
   get openurl() {
      return this._openurl;
   }
   set openurl(value) {
      this._openurl = value;
   }

   @api
   get customurl() {
      return this._customurl;
   }
   set customurl(value) {
      this._customurl = value;
   }

   @api
   get planName() {
      return this._planName;
   }
   set planName(value) {
      this._planName = value;
      this.newPlanName = value;
      this._ariaLabel = this.newPlanName + " " + this._label;
   }

   @api
   get origin() {
      return this._origin;
   }
   set origin(value) {
      this._origin = value;
   }

   @api
   get referralId() {
      return this._referralId;
   }
   set referralId(value) {
      this._referralId = value;
      if (this._origin == "referrals") {
         this._ariaLabel = "Ask a question for referral ID " + this._referralId;
      } else if (this._origin == "preauthorization" || this._origin == "dental") {
         this._ariaLabel = "Ask a question for reference ID " + this._referralId;
      } else {
         this._ariaLabel = "Ask a question link, opens a new message";
      }
   }

   encryptData(evt) {
      let inputMap = {
         methodName: "encrypt",
         unencryptedStringValue: JSON.stringify(JSON.parse(this._targetParams)),
      };
      let targetParamsJSON = JSON.parse(this._targetParams);

      this.callIp("portalEncrypt_Decrypt", inputMap).then((data) => {
         let attributes = {
            pageName: this._targetName,
         };

         if (this._customurl === "Y") {
            this._targetName += "?dataParam=" + data.IPResult.encryptedString;
            attributes = {
               url: this._targetName,
            };
         }

         if (this._openurl === "Y") {
            this[NavigationMixin.GenerateUrl]({
               type: this._targetType,
               attributes: attributes,
               state: {
                  dataParam: data.IPResult.encryptedString,
               },
            }).then((url) => {
               let completeURL = window.location.origin + url;
               window.open(completeURL);
            });
         } else {
            this[NavigationMixin.Navigate]({
               type: this._targetType,
               attributes: attributes,
               state: {
                  dataParam: data.IPResult.encryptedString,
               },
            });
         }

         if (targetParamsJSON.modal) {
            pubsub.fire("closeModal", "closeExternalLinkModal", {
               closeModal: targetParamsJSON.modal,
            });
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
            if (error && error.length) {
               console.error(`failed at getting data from IP - portalEncrypt_Decrypt => ${JSON.stringify(error)}`);
            } else {
               console.error(`failed at getting data from IP - portalEncrypt_Decrypt => ${error}`);
            }
         });
   }

   handleRedirection(evt) {
      if(this._label == 'Ask a Question'){
         this[NavigationMixin.Navigate]({
             type: 'comm__namedPage',
             attributes: {
                 name: 'Dispute_Claim__c'
             }
         });
      }else{
         this.encryptData(this._targetParams);
      }
   }

   renderedCallback() {
      let mainContent = this.template.querySelector("vlocity_ins-button");
      this.ariaLabelAcc = "";

      if (this._label == "Ask a Question") {
         if (this._origin == "referrals") {
            this.ariaLabelAcc = "Ask a question for referral ID " + this._referralId;
         } else if (this._origin == "preauthorization" || this._origin == "dental") {
            this.ariaLabelAcc = "Ask a question for reference ID " + this._referralId;
         } else {
            this.ariaLabelAcc = "Ask a question link, opens a new message";
         }
      } else if (this._label == "Benefits") {
         if (this._planName != null || this._planName != "" || this._planName != undefined) {
            this.ariaLabelAcc = this._planName + " " + this._label;
         } else {
            this.ariaLabelAcc = this._label;
         }
      } else if (this._label == "Benefit Use") {
         if (this._planName != null || this._planName != "" || this._planName != undefined) {
            this.ariaLabelAcc = this._planName + " " + this._label;
         } else {
            this.ariaLabelAcc = this._label;
         }
      } else if (this._label == "Spending") {
         if (this._planName != null || this._planName != "" || this._planName != undefined) {
            this.ariaLabelAcc = this._planName + " " + this._label;
         } else {
            this.ariaLabelAcc = this._label;
         }
      } else if (this._label == "Cost Share") {
         if (this._planName != null || this._planName != "" || this._planName != undefined) {
            this.ariaLabelAcc = this._planName + " " + this._label;
         } else {
            this.ariaLabelAcc = this._label;
         }
      } else if (this._label == "Tooth History") {
         if (this._planName != null || this._planName != "" || this._planName != undefined) {
            this.ariaLabelAcc = this._planName + " " + this._label;
         } else {
            this.ariaLabelAcc = this._label;
         }
      } else if (this._label == "View Details") {
         this.ariaLabelAcc = this._label;
      }

      if (mainContent != null) {
         mainContent.setAttribute("aria-label", this.ariaLabelAcc);
      }

      let mainContent2 = this.template.querySelector("lightning-button > button");
      if (mainContent2 != null) {
         mainContent2.setAttribute("aria-label", this.ariaLabelAcc);
      }
   }
}
import { LightningElement, track, api } from "lwc";
import pubsub from "omnistudio/pubsub";

export default class BenefitHomeRedirect extends LightningElement {
   @track benefitHomeSrc = "";
   @track benefitHomeDetailsSrc = "";
   pubSubObj;
   type;
   // FlexCard values
   @track _memberId;
   @track _tab;
   @track pageName;
   @track previousPage;
   @track documentBreadCrumb = false;

   @api
   get memberid() {
      return this._memberId;
   }
   set memberid(val) {
      this._memberId = val;
   }

   /* tab names are detail, use, spending */
   @api
   get tab() {
      return this._tab;
   }
   set tab(val) {
      this._tab = val;
    
      this.pageName = "Plan Details";

      if(this._tab == "My Documents"){
         this.pageName = 'My Documents';
         this.previousPage = 'Plan Details'
         this.documentBreadCrumb = true;
      }else{
         this.pageName = "Plan Details";
         this.documentBreadCrumb = false;
      }
   }

   connectedCallback() {
      // Retrieve Data
      this.pubSubObj = {
         memberNavigateSelection: this.navigateBack.bind(this)
     }
     pubsub.register('NavigateSelection', this.pubSubObj);

      let type = "";
      let protocol = "";
      const urlString = window.location.href;
      const hostUrl = window.location.host;
      let urlArray = urlString.split("/");

      for (let index = 0; index < urlArray.length; index++) {
         let element = urlArray[index];
         if (element == "memberportal") {
            type = element;
         }
         if (element == "member") {
            type = element;
         }
         if (element == "https:") {
            protocol = element;
         }
         if (element == "http:") {
            protocol = element;
         }
      }

      this.benefitHomeSrc = `${protocol}//${hostUrl}/${type}/s/benefits?param1=1`;
      this.type = type;
   }

   navigateBack(params) {
      
      this.benefitHomeDetailsSrc = `${window.top.location.origin}/${this.type}/s/benefit-details?dataParam=${params.params}`;
   }

   disconnectedCallback() {
      pubsub.unregister('NavigateSelection', this.pubSubObj);
  }
}
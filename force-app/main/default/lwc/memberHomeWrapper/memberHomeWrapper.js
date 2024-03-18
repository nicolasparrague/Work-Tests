import { LightningElement } from "lwc";
import { isMobile } from "omnistudio/utility";
import { loadCssFromStaticResource } from 'omnistudio/utility';

export default class MemberHomeWrapper extends LightningElement {
   portalType = "Attentis";
   _isMobile = isMobile();
   _records;

   get records() {
      this._records = {
         isMobile: this._isMobile ? "Y" : "N",
      };
      return this._records;
   }

   connectedCallback() {

      let completeURL = '/assets/styles/vlocity-newport-design-system-scoped.min.css';
      loadCssFromStaticResource(this, 'newportAttentisAlt', completeURL).then(resource => {
         console.log(`Theme loaded successfully`);
      }).catch(error => {
         console.log(`Theme failed to load => ${error}`, error);
      });

   }
}
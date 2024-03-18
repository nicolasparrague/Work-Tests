import pubsub from "omnistudio/pubsub";
import { getDataHandler } from "omnistudio/utility";
import { LightningElement, track, api } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";

export default class MemberBenefitsHomeWrapper extends OmniscriptBaseMixin(LightningElement) {
   @track targetName = "benefit-details";
   @track encryptedParams;

   connectedCallback() {
      this.redirectMethod();
   }

   redirectMethod(){
      this.encryptedParams = "dataParam=" + "uHZxWZk-oZKVEY90BkL-KnkEOD9aDzZhrvbMsObJm0I.-x5BpaQ7wMCucM9GFU1EbUbHqKXRKyRhLQ7tNVhrcNfUc4EfCHaFFyOhUnJYPilWfrW3zeHjRVvnNdnOyZYO6pal_2iTyFAjy7RE2jQZrkck1xUMcxwvuUzw9GvNpe66amy3qRN3v_04X4q7AkD-EQBOXiIjJFuMJ135AWSoNBHzgVw89Gz_mXWQSp1S9_VF6sWJ5TjiZ_sNeyb4GZ9v1G0rlOogLCiZbGFL7hFB1-2isbv4ZsaN230GNrKCd5XVmLhc1_ldj9BjH_kVKlhUEdb2XojUDf2OsPSwF9jvJA4_ss7iBpebIGzOjRu9v4AIX1VGkipZsdh_JefnvDKufeEkTTeDg7EYq0_Nd1HudrvUEpIhvdjX8Szadk9iqJtQXO1PhsfPBucMTycRm5XsObxBJMwbcW_Cn38equF7zeLBRUa54zxULzgoYIxnV5p8FWedMWe_7cbhtAYhumSO6CxUNNLNureOwi3QqfCq_j2K4cAqiq2LdRW1KscJXFJW";
      this.redUrl = `${this.targetName}?${this.encryptedParams}`;
      window.open(this.redUrl, "_self");
   }
   
}
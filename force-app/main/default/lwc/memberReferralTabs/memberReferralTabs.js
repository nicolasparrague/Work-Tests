import { LightningElement, track, api } from "lwc";
import { getPagesOrDefault, handlePagerChanged } from "c/pagerUtils";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import pubsub from "omnistudio/pubsub";


// import { getDataHandler } from "omnistudio/utility";
export default class MemberReferralTabs extends OmniscriptBaseMixin(LightningElement) {
   pubsubObj;

   //State load different components using button tabs
   getPagesOrDefault = getPagesOrDefault.bind(this);
   handlePagerChanged = handlePagerChanged.bind(this);

   //Button focus
   @track stateFocus = false;

   // Mobile Menu Default
   dentalPred;
   referral;
   preAuth;
   completed = false;

   //Set tenant
   redirectUrl;
   tenantUrl;
   isModalOpen = false;
   provider;
   showlist;
   contador = 0;
   @track domRender = false;
   @track rendered = false;
   @track referralSummary = false;
   @track preAuthSummary = false;
   @track dentalSummary = false;
   @track btnClass = 'nds-button nds-button_neutral nds-nowrap-whitespace';
   @track lastBtnClass = 'nds-button nds-button_neutral nds-nowrap-whitespace';
   @track _brandd;
   get btnGroupClass() {
      return (document.documentElement.clientWidth <= 480) ? 'c-tab-button-group nds-size_12-of-12' : 'c-tab-button-group nds-size_12-of-12 nds-align_absolute-center';
   }
   @api
   _showTabButton;
   @track membersinplanFiltered;


   @track _userId;
   @track _memberId;

   @api
   get userId() {
      return this._userId;
   }
   set userId(val) {
      this._userId = val;
   }

   @api
   get memberId() {
      return this_memberId;
   }
   set memberId(val) {
      this._memberId = val;
      this.domRender = true;
   }


   @track
   hasRendered = true;

   _memberType;
   _userId;

   @api
   get membertype() {
      return this._memberType;
   }
   set membertype(val) {
      this._memberType = val;
   }
   @api
   get userid() {
      return this._userId;
   }
   set userid(val) {
      this._userId = val;
   }

   @api
   get defaultPlan() {
      return this._defaultPlan;
   }
   set defaultPlan(val) {
      this._defaultPlan = val;
   }

   @api
   get productBrandGrouping() {
      return this._productBrandGrouping;
   }
   set productBrandGrouping(val) {
      this._productBrandGrouping = val;
   }

   @api
   get lobId() {
      return this._lobId;
   }
   set lobId(val) {
      this._lobId = val;
   }



   @api
   get loblMctr() {
      return this._loblMctr;
   }
   set loblMctr(val) {
      this._loblMctr = val;
   }


   @track showReferralsTab;

   connectedCallback() {
      const _urlString = window.location.href;
      this.provider = "ConnectiCare";
      this._showTabButton = false;
      this.btnClass = 'nds-button nds-large-size_12-of-12 nds-medium-size_10-of-12 nds-small-size_8-of-12 nds-x-small-size_6-of-12 nds-button_neutral nds-nowrap-whitespace';
      this.lastBtnClass = 'nds-button nds-large-size_12-of-12 nds-medium-size_10-of-12 nds-small-size_8-of-12 nds-x-small-size_6-of-12 nds-button_neutral nds-nowrap-whitespace';
      this._brandd = "Attentis";

      this.referral = "nds-button nds-button_neutral nds-nowrap-whitespace active referralTab"
      this.preAuth = "nds-button nds-button_neutral nds-nowrap-whitespace preauth";
      this.dentalPred = "nds-button nds-button_neutral nds-nowrap-whitespace dentalTab";
      this.showReferralsTab = true;
      this.referralSummary = true;
      this.preAuthSummary = false;
      this.dentalSummary = false;


      //this.learnMoreLink();
      this.pubsubObj = {
         memberSelectionAction: this.getMembers.bind(this)
      };

      pubsub.register("MemberSelection", this.pubsubObj);

   }
   disconnectedCallback() {
      pubsub.unregister("MemberSelection", this.pubsubObj);
   }


   getMembers(memberId) {
      // console.log("member: ", memberId);
      this.showlist = false;
      this._memberId = memberId.memberId;
      setTimeout(() => {
         this.showlist = true;
      });
      let params = {
         sClassName: "omnistudio.IntegrationProcedureService",
         sMethodName: "Member_ActivePlan",
         options: "{}",
         input: {
            "memberId": this._memberId,
         }
      };

      this.omniRemoteCall(params, true).then((data) => {

         this.membersinplanFiltered = data.result.IPResult.ServiceTypeInfo.filter((plan) => plan.defaultPlan == "Y");
         let productValueCodevalue = this.membersinplanFiltered[0].productValueCode;
         let productBrandGrouping = this.membersinplanFiltered[0].productBrandGrouping;
         let LOBD_MCTRvalue = this.membersinplanFiltered[0].LOBD_MCTR;
         let defaultplanName = this.membersinplanFiltered[0].planName;
         let planType = this.membersinplanFiltered[0].planType;

         //MPV-1453 and MPV-1850
         if (productBrandGrouping == "Medicare" || productBrandGrouping == "1061" || LOBD_MCTRvalue == '1003' || productValueCodevalue == "NGTD" || (!defaultplanName.toUpperCase().includes("PASSAGE")) && this._brandd == 'Attentis') {
            // this.showReferralsTab = false;
            // console.log('---1');
            // this.referralSummary = false;
            // From Mobile Publisher Menu
            if (window.location.href.includes("view=predetermination")) {
               //Do nothing
            } else {
                  // console.log('this.completed', this.completed);
                  if (this.completed == false) {
                     if (planType == 'D') {
                        this.template.querySelector(".preauth").classList.remove("active");
                        // this.template.querySelector(".dentalTab").classList.add("active");
                        this.referral = "nds-button nds-button_neutral nds-nowrap-whitespace referralTab";
                        this.preAuth = "nds-button nds-button_neutral nds-nowrap-whitespace preauth";
                        this.dentalPred = "nds-button nds-button_neutral nds-nowrap-whitespace dentalTab active";
                        this.referralSummary = false;
                        this.preAuthSummary = false;
                        this.dentalSummary = true;
                        this.selectedDental = "true";
                        this.selectedPreauth = "false"
                        this.completed = true;
                     }else{
                        this.template.querySelector(".preauth").classList.add("active");
                        this.preAuthSummary = true;

                        // this.referralSummary = false;
                        this.dentalSummary = false;
                        this.completed = true;
                        // this.selectedPreauth = "true";
                        this.selectedDental = "false";
                     }
                  }
               // } else {
               //    this.template.querySelector(".preauth").classList.add("active");
               //    this.preAuthSummary = true;
               //    this.selectedPreauth = "true";
               //    this.selectedDental = "false";
               // }
            }
         } else {
            if (this.completed == false) {
               if (planType == 'D') {
                  this.template.querySelector(".preauth").classList.remove("active");
                  this.template.querySelector(".dentalTab").classList.add("active");
                  this.referral = "nds-button nds-button_neutral nds-nowrap-whitespace referralTab";
                  this.preAuth = "nds-button nds-button_neutral nds-nowrap-whitespace preauth";
                  this.dentalPred = "nds-button nds-button_neutral nds-nowrap-whitespace dentalTab active";
                  this.referralSummary = false;
                  this.preAuthSummary = false;
                  this.dentalSummary = true;
                  this.completed = true;
               }else{
                  this.showReferralsTab = true;
                  //MPV-1099 : to show Referrals section by default
                  this.referralSummary = true;
                  this.selectedReferral = "true";
                  this.selectedPreauth = "false";
                  this.selectedDental = "false";
               }
            } else {
               this.showReferralsTab = true;
               //MPV-1099 : to show Referrals section by default
               this.referralSummary = true;
               this.selectedReferral = "true";
               this.selectedPreauth = "false";
               this.selectedDental = "false";
            }
         }

         // call IP
         let params = {
            sClassName: "omnistudio.IntegrationProcedureService",
            sMethodName: "Member_Demography",
            options: "{}",
            input: {
               "memberId": this._memberId,
            }
         };

         this.omniRemoteCall(params, true).then((response) => {
            let brand = response.result.IPResult.brand;
            let memberType = response.result.IPResult.memberType;
            this._brandd = brand;
         });
      });
   }



   renderedCallback() {
      if (!this.rendered) {
         this.contador++;
         // Focus only on the component load
      }
      this.rendered = true;
      this.domRender = true;
      // console.log('---referralSummary', this.referralSummary);
   }


   showReferrals(event) {

      var btnId = event.target.dataset.id;
      this.addAndRemoveActiveClass(btnId);
      this.referralSummary = true;
      this.dentalSummary = false;
      this.preAuthSummary = false;
      this.selectedReferral = "true";
      this.selectedPreauth = "false";
      this.selectedDental = "false";
   }

   showPreAuth(event) {

      var btnId = event.target.dataset.id;
      this.addAndRemoveActiveClass(btnId);
      this.referralSummary = false;
      this.dentalSummary = false;
      this.preAuthSummary = true;

      this.selectedReferral = "false";
      this.selectedPreauth = "true";
      this.selectedDental = "false";
   }

   showDentalPreDet(event) {

      var btnId = event.target.dataset.id;
      this.addAndRemoveActiveClass(btnId);
      this.referralSummary = false;
      this.dentalSummary = true;
      this.preAuthSummary = false;

      this.selectedReferral = "false";
      this.selectedPreauth = "false";
      this.selectedDental = "true";
   }



   setFocus() {
      // Get first button and focus that
      let buttonToFocus = this.template.querySelectorAll("button")[0];
      buttonToFocus.classList.add("active");
   }

   // addAndRemoveActiveClass(btnId) {
   //    let buttonToFocus = this.template.querySelectorAll("button")[btnId];
   //    buttonToFocus.classList.add("active");
   //    let buttonList = this.template.querySelectorAll("button");
   //    let buttonToRemove;
   //    for (var i = 0; i < buttonList.length; i++) {
   //       buttonToRemove = this.template.querySelectorAll("button")[i];
   //       if (i != btnId) {
   //          buttonToRemove.classList.remove("active");
   //       }
   //    }
   // }

   addAndRemoveActiveClass(id) {
      if (id == "0") {
         this.template.querySelector(".referralTab").classList.add("active");
         this.template.querySelector(".preauth").classList.remove("active");
         // if (this._showTabButton != false) {
         //    this.template.querySelector(".dentalTab").classList.remove("active");
         // }
      } else if (id == "1") {
         if (this.showReferralsTab == true) {
            this.template.querySelector(".referralTab").classList.remove("active");
         }
         this.template.querySelector(".preauth").classList.add("active");
         // if (this._showTabButton != false) {
         //    this.template.querySelector(".dentalTab").classList.remove("active");
         // }
      } else if (id == "2") {
         if (this.showReferralsTab == true) {
            this.template.querySelector(".referralTab").classList.remove("active");
         }
         this.template.querySelector(".preauth").classList.remove("active");
         // this.template.querySelector(".dentalTab").classList.add("active");
      }
   }
}
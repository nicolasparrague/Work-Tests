import { LightningElement, track } from "lwc";
import pubsub from "omnistudio/pubsub";
import { getDataHandler } from "omnistudio/utility";

export default class BenefitWatchVideo extends LightningElement {
   @track loading = true;
   @track iframeSrc = "";
   iframeW = "100%";
   iframeH = "450px;";
   sessionItemName = "benefitmember";
   isMobilePublisher = false;
   errorMessage ='Error --> No data returned from IP'


   // FlexCard values
   @track _selectedMemberId;
   @track _selectedMemberName;
   @track _videoLink;
   @track benefitMemberVideo = true;
   @track showButton = true;
   @track showModal = false;
   @track showRetry = false;

   @track box;

   get srcLoaded() {
      return this.iframeSrc && this.iframeSrc != "" ? true : false;
   }

   registerPubSub() {
      pubsub.register("MemberSelection", {
         memberSelectionAction: this.getVideoLink.bind(this),
      });
   }

   renderedCallback() {
      if (window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes("CommunityHybridContainer")) {
         // User is in the publisher playground app
         this.isMobilePublisher = true;
      } else {
         this.isMobilePublisher = false;

         //Modal Focus Accessibility
         const  focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
         const modal = this.template.querySelector(".modalAccessibility");
      
         if (modal != undefined){
            const firstFocusableElement = modal.querySelectorAll(focusableElements)[0]; // get first element to be focused inside modal
            const focusableContent = modal.querySelectorAll(focusableElements);
            const lastFocusableElement = focusableContent[focusableContent.length - 1]; // get last element to be focused inside modal         
            
               var me = this;
               window.addEventListener('keydown', function(event) {
               let isTabPressed = event.key === 'Tab' || event.keyCode === 9;
               
                  if (!isTabPressed) {
                     return;
                  }

                  if (event.shiftKey) { // if shift key pressed for shift + tab combination
                     if (me.template.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus(); // add focus for the last focusable element
                        event.preventDefault();
                  }
                  } else { // if tab key is pressed
                     if (me.template.activeElement === lastFocusableElement) { // if focused has reached to last focusable element then focus first focusable element after pressing tab
                        firstFocusableElement.focus(); // add focus for the first focusable element
                        event.preventDefault();
                     }
                  }
               });

               firstFocusableElement.focus();

               window.addEventListener('keyup', function(event) {
                  if(event.key === "Escape"){
                     me.closeModal();
                  }
               });
         }
      }

   }

   connectedCallback() {
      if (!this._selectedMemberId) {
         this.registerPubSub();
      }
      this.loading = false;
   }

   disconnectedCallback() {
      pubsub.unregister("MemberSelection", {
         memberSelectionAction: this.getVideoLink.bind(this),
      });
   }

   getVideoLink(msg) {
      if (msg) {
         this._selectedMemberId = msg.memberId;
      }

      let input = {
         memberId: this._selectedMemberId,
      };


      // Call Member_BenefitsVideo IP
      this.callIP("Member_BenefitsVideo", input).then((data) => {
         if(data.IPResult){
            if (data.IPResult.success == false) {
               this.showRetry = true;
            } else {
               if (data.IPResult.videoLink) {
                  this._videoLink = data.IPResult.videoLink;
                  this.buidURL();
                  this.showRetry = false;
               } else if (data.IPResult.success === false) {
                  //User has video but there is Access Error
                  this.showRetry = true;
               } else {
                  //User doesn’t have Video
                  this.showButton = false;
               }
            }
         }else{
            console.error(`${this.errorMessage} Member_BenefitsVideo`)
         }
      });
   }

   buidURL() {
      let type = "";
      let protocol = "";
      const urlString = window.location.href;
      const hostUrl = window.location.host;

      let urlArray = urlString.split("/");

      for (let index = 0; index < urlArray.length; index++) {
         let element = urlArray[index];
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

      //Get Member Name
      let memberSessionObjStr = sessionStorage.getItem(this.sessionItemName);
      this._selectedMemberName = memberSessionObjStr ? JSON.parse(memberSessionObjStr).label : "";

      //Build URL for SundaySkyResponse
      if (this.isMobilePublisher) {
         this.iframeSrc = `${protocol}//${hostUrl}/${type}/apex/BenefitVideoSundaySky?SundaySkyResponse=${this._videoLink}&mobileapp=true&MemberID=${this._selectedMemberId}&MemberName=${this._selectedMemberName}`;
      } else {
         this.iframeSrc = `${protocol}//${hostUrl}/${type}/apex/BenefitVideoSundaySky?SundaySkyResponse=${this._videoLink}&MemberID=${this._selectedMemberId}&MemberName=${this._selectedMemberName}`;
      }

      this.loading = false;
   }

   callIP(ipMethod, inputMap) {
      this.loading = true;
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
            this.loading = false;
            return JSON.parse(data);
         })
         .catch((error) => {
            console.error(`failed at getting IP data => ${JSON.stringify(error)}`);
            this.loading = false;
         });
   }

   retryVideo() {
      this.showModal = false;
      this.getVideoLink();

      setTimeout(() => {
         this.showModal = true;
      });
   }

   openModal() {
      this.showModal = true;
   }

   closeModal() {
      this.showModal = false;
   }
}
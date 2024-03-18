import { api, LightningElement, track } from "lwc";

export default class Pager extends LightningElement {
   @track askQuestionParams;
   @track goToValue = "1";
   @api pagedata = null;
   @api jsondata = null;
   @api criteria = null;
   @api elementsPerPage = 10;
   @api totalElements = 0;
   @api firstElement = 0;
   @api memberid = "";
   @track lessthan7pages = false;

   @api _showSaveSearch = false;
   isPublic = false;

   @api
   get showSaveSearch() {
      return this._showSaveSearch;
   }
   set showSaveSearch(val) {
      this._showSaveSearch = val === "true" || val === true ? true : false;
   }

   get totalEle() {
      return parseInt(this.totalElements);
   }

   get from() {
      return parseInt(this.firstElement) + 1;
   }

   get to() {
      return parseInt(this.firstElement) + parseInt(this.elementsPerPage) > parseInt(this.totalElements) ? parseInt(this.totalElements) : parseInt(this.firstElement) + parseInt(this.elementsPerPage);
   }

   get currentPage() {
      return Math.floor(parseInt(this.firstElement) / parseInt(this.elementsPerPage) + 1);
   }

   get maxPages() {
      let calc = Math.ceil(parseFloat(this.totalElements) / parseFloat(this.elementsPerPage));
      if (calc == 0 && this.totalEle > 0) {
         return 1;
      }
      return calc;
   }

   // Decide which range of pages to show, depending on number of pages and the page user is currently on.
   get currentRange() {
      if (this.maxPages <= 7) {
         return this.allRange;
      }
      if (this.currentPage <= 4) {
         return this.beginningRange;
      }
      if (this.currentPage >= this.maxPages - 3) {
         return this.endRange;
      }
      return this.middleRange;
   }

   // Returns the first five pages, and the last page.
   get beginningRange() {
      return [
         { id: 1, value: 1 },
         { id: 2, value: 2 },
         { id: 3, value: 3 },
         { id: 4, value: 4 },
         { id: 5, value: 5 },
         { id: "ph", value: "..." },
         { id: this.maxPages, value: this.maxPages },
      ];
   }

   // Returns the first page, and the last five pages
   get endRange() {
      return [
         { id: 1, value: 1 },
         { id: "ph", value: "..." },
         { id: this.maxPages - 4, value: this.maxPages - 4 },
         { id: this.maxPages - 3, value: this.maxPages - 3 },
         { id: this.maxPages - 2, value: this.maxPages - 2 },
         { id: this.maxPages - 1, value: this.maxPages - 1 },
         { id: this.maxPages, value: this.maxPages },
      ];
   }

   // Returns the first page, the current page, one page on either side of the current page, and the last page.
   get middleRange() {
      return [
         { id: 1, value: 1 },
         { id: "ph", value: "..." },
         { id: this.currentPage - 1, value: this.currentPage - 1 },
         { id: this.currentPage, value: this.currentPage },
         { id: this.currentPage + 1, value: this.currentPage + 1 },
         { id: "ph", value: "..." },
         { id: this.maxPages, value: this.maxPages },
      ];
   }

   // Provided there are 7 pages or less, returns the full range.
   get allRange() {
      if (this.maxPages <= 7) {
         this.lessthan7pages = true;
         let ret = [];
         let i = 0;
         while (i < this.maxPages) {
            i++;
            ret.push({ id: i, value: i });
         }
         return ret;
      }
   }

   connectedCallback() {
      // If running on mobile, default to 5 per page
      if (document.documentElement.clientWidth < 768) {
         this.elementsPerPage = 5;
      }
      this.elementsPerPage = parseInt(this.elementsPerPage);
      this.totalElements = parseInt(this.totalElements);
      this.firstElement = parseInt(this.firstElement);
      this.goToValue = this.currentPage;
      let url = window.location.href;
      if (url.includes("billing-and-payment")) {
         this.askQuestionParams = '{"origin":"billingandpayment"}';
      } else {
         //MPV - 1118 : Added memberId parameter
         //console.log("this.memberid", this.memberid);
         if (this.memberid != "") {
            this.askQuestionParams = `{"origin":"provider","memberId":"${this.memberid}"}`;
         } else if (this.jsondata) {
            if (this.jsondata.MemberInfo) {
               this.askQuestionParams = '{"origin":"provider","memberId":"' + this.jsondata.MemberInfo.memberId + '"}';
            }
            if (this.jsondata.isPublic) {
               this.isPublic = this.jsondata.isPublic;
            }
         }
      }
   }

   renderedCallback() {
      // Apply styling to currently selected page
      let pageSpans = this.template.querySelectorAll(".page-span");
      if (pageSpans) {
         pageSpans.forEach((span) => {
            span.classList.remove("selected-page");
         });
         this.template.querySelector(`[data-pageid="${this.currentPage}"]`).classList.add("selected-page");
      }

      // Enable both buttons, then check if either needs to be disabled.
      let prevButton = this.template.querySelector('[data-id="prevButton"]');
      if (prevButton) {
         prevButton.disabled = false;
      }

      let nextButton = this.template.querySelector('[data-id="nextButton"]');
      if (nextButton) {
         nextButton.disabled = false;
      }

      if (this.currentPage == 1) {
         if (prevButton) {
            prevButton.disabled = true;
         }
      }

      if (this.currentPage == this.maxPages) {
         if (nextButton) {
            nextButton.disabled = true;
         }
      }
   }

   moveTop() {
      const scrollOptions = {
         left: 0,
         top: 0,
         behavior: "smooth",
      };
      window.scrollTo(scrollOptions);
   }

   handlePrevious() {
      if (this.currentPage != 1) {
         // Checks if there is a 'previous' page to navigate to. If there isnt, that means it's page 1, so it stays at page 1.
         let requestedFirstElement = parseInt(this.firstElement) - parseInt(this.elementsPerPage) < 0 ? 0 : parseInt(this.firstElement) - parseInt(this.elementsPerPage);
         this.sendPagerEvent(requestedFirstElement);
         this.moveTop();
      }
   }

   handleNext() {
      if (this.currentPage < this.maxPages) {
         // Checks if there is a 'next' page to navigate to. If there isnt, stays on the current page.
         let requestedFirstElement =
            parseInt(this.firstElement) + parseInt(this.elementsPerPage) > parseInt(this.totalElements) ? parseInt(this.firstElement) : parseInt(this.firstElement) + parseInt(this.elementsPerPage);
         this.sendPagerEvent(requestedFirstElement);
         this.moveTop();
      }
   }

   handleGoToClick(evt) {
      // Validate that ID isnt a number or placeholder
      let id = evt.currentTarget.dataset.id;
      if (id != "ph" && isFinite(id) && id != " ") {
         this.handleGoToPage(id);
      }
   }

   handleGoToInput() {
      // Ensure goToValue is a number and isnt a space (isFinite evaluates to true on spaces as well).
      if (isFinite(this.goToValue) && this.goToValue != " ") {
         this.handleGoToPage(this.goToValue);
      }
   }

   handleKeyUp(evt) {
      // On keyup, if 'enter' key was pressed, submit.
      if (evt.key == "Enter") {
         this.handleGoToInput();
      }
   }

   handleGoToChange(evt) {
      this.goToValue = evt.target.value.replace(/[^0-9]/g, "");
   }

   handleGoToPage(pageNum) {
      let num = parseInt(pageNum);
      // Ensure that pageNum is within range of current pages
      if (num > 0 && num <= this.maxPages) {
         let requestedFirstElement = num * parseInt(this.elementsPerPage) - parseInt(this.elementsPerPage);
         this.sendPagerEvent(requestedFirstElement);
         this.goToValue = num;
         this.moveTop();
      }
   }

   validateInput(key) {
      switch (true) {
         case isFinite(key) && key != " ":
            return true;
         case key == "Backspace":
            return true;
         case key == "Delete":
            return true;
         case key == "ArrowLeft":
            return true;
         case key == "ArrowRight":
            return true;
         default:
            return false;
      }
   }

   sendPagerEvent(requestedFirstElement) {
      this.dispatchEvent(new CustomEvent("pagerchanged", { detail: { from: requestedFirstElement } }));
   }
}
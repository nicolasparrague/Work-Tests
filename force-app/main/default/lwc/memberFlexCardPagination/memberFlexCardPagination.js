import { api, LightningElement, track } from "lwc";
import { getPagesOrDefault, handlePagerChanged } from "c/pagerUtils";
import { getDataHandler } from "omnistudio/utility";

export default class MemberFlexCardPagination extends LightningElement {
   getPagesOrDefault = getPagesOrDefault.bind(this);
   handlePagerChanged = handlePagerChanged.bind(this);
   loading;
   _showNoRecordsMessage;
   invoiceTableStructure;
   paymentTableStructure;
   sortIdNum;
   sortOptions;
   sortMap;

   @api
   showPayment;
   @api
   showInvoice;
   @api
   historyType;
   @api
   selectedSortId;
   @api
   sortDirection;
   @api
   selectedSort;

   @track
   showList;

   @track
   _userId;
   @api
   get userid() {
      return this._userId;
   }
   set userid(val) {
      this._userId = val;
   }

   @track paginatedRecords;
   @track pagerFirstEle = 0;
   @track pagerLastEle = 9;

   get currentlyShown() {
      if (this.paginatedRecords) {
         let dataSlice = this.paginatedRecords.slice(this.pagerFirstEle, this.pagerLastEle + 1);
         console.log('datea', JSON.stringify(dataSlice));
         return dataSlice;
      }
      return [];
   }

   @track
   selectedViewNumber = 10;
   @track
   totalProviderNum;
   @track
   pagerFirstEle;
   @track
   hasRendered = true;

   connectedCallback() {
      //this.pagerFirstEle = 1;
      // If running on mobile, default to 5 per page
      if (document.documentElement.clientWidth < 768) {
         this.pagerFirstEle = 0;
         this.pagerLastEle = 4;
      }

      this.selectedSort = "SortingDate";
      this.sortDirection = "DESC";

      if (this.historyType == "Invoice") {
         // Export to Excel configuration
         this.invoiceTableStructure = {
            header: [["Invoice Number", "Invoice Date", "Total Amount Due", "Premium Amount", "Due Date"]],
            fields: ["invoiceNumber", "invoiceDate", "totalAmountDue", "premiumAmount", "invoiceDueDate"],
            types: ["number", "date", "currency", "currency", "date"],
         };

         // sorting configuration
         this.sortMap = {
            SortingDate: "invoiceDate",
         };
         this.sortOptions = [
            {
               key: "B001",
               ascBadgeId: "B001-ASC",
               descBadgeId: "B001-DESC",
               value: "SortingDate",
               label: "Invoice date",
            },
         ];
      } else if (this.historyType == "Payment") {
         // Export to Excel configuration
         this.paymentTableStructure = {
            header: [["Payment Number", "Amount", "Date", "Payment Channel"]],
            fields: ["paymentNumber", "paymentAmount", "paymentDateFormatted", "methodOfPayment"],
            types: ["number", "currency", "date", "text"],
         };

         // sorting configuration
         this.sortMap = {
            SortingDate: "paymentDateFormatted",
            SortingMethod: "methodOfPayment",
         };
         this.sortOptions = [
            {
               key: "B002",
               ascBadgeId: "B002-ASC",
               descBadgeId: "B002-DESC",
               value: "SortingMethod",
               label: "Payment method",
            },
            {
               key: "B001",
               ascBadgeId: "B001-ASC",
               descBadgeId: "B001-DESC",
               value: "SortingDate",
               label: "Payment date",
            },
         ];
      }
   }

   renderedCallback() {
      if (this.hasRendered && this._userId) {
         if (this.historyType == "Invoice") {
            let inputMap = {
               userId: this._userId,
               clientType: "Direct Payment",
               billType: "I",
            };

            this.getDataSource("Member_History", inputMap).then((data) => {
               if (data) {
                  this.paginatedRecords = data.IPResult.records;
                  this.showInvoice = true;
                  this.totalProviderNum = this.paginatedRecords.length;
                  this.sortBy(this.selectedSort);
                  this.loading = false;
               }
            });
         } else if (this.historyType == "Payment") {
            let inputMap = {
               userId: this._userId,
               clientType: "Direct Payment",
               billType: "I",
            };

            this.getDataSource("Member_Payment", inputMap).then((data) => {
               if (data) {
                  this.paginatedRecords = data.IPResult.records;
                  this.showPayment = true;
                  this.totalProviderNum = this.paginatedRecords.length;
                  this.sortBy(this.selectedSort);
                  this.loading = false;
               }
            });
         }

         this.hasRendered = false;
      }

      if (Array.isArray(this.paginatedRecords)) {
         this.paginatedRecords.forEach((p) => {
            if (typeof p.premiumAmount == "string") {
               p.premiumAmount = parseInt(p.premiumAmount);
            }
         });
      }
   }

   handleNewPage(evt) {
      console.info(evt);
   }

   handlePagerChange(evt) {
      this.pagerFirstEle = evt.detail.firstEle;
      this.pagerLastEle = evt.detail.lastEle;
   }

   handleSortSelect(evt) {
      this.selectedSort = evt.target.getAttribute("data-badge-value");
      this.sortSelect(evt);
      this.sortBy(this.selectedSort);
   }

   handleSortToggle(event) {
      let evtBadgeId = event.target.getAttribute("id");
      if (evtBadgeId) {
         let badgeKey = evtBadgeId.substring(0, evtBadgeId.indexOf("-"));
         let ascBadgeId;
         let descBadgeId;
         if (this.sortIdNum.length > 0) {
            ascBadgeId = "#" + badgeKey + "-ASC-" + this.sortIdNum;
            descBadgeId = "#" + badgeKey + "-DESC-" + this.sortIdNum;
         } else {
            ascBadgeId = "#" + badgeKey + "-ASC";
            descBadgeId = "#" + badgeKey + "-DESC";
         }
         //Toggle
         if (evtBadgeId.indexOf("ASC") > -1) {
            this.template.querySelector(ascBadgeId).classList.add("nds-hide");
            this.template.querySelector(descBadgeId).classList.remove("nds-hide");
            this.sortDirection = "DESC";
         } else {
            this.template.querySelector(ascBadgeId).classList.remove("nds-hide");
            this.template.querySelector(descBadgeId).classList.add("nds-hide");
            this.sortDirection = "ASC";
         }

         this.selectedSortId = badgeKey;
         this.sortDirSelect(this.sortDirection);
      }
   }

   getDataSource(ipMethod, inputMap) {
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
            let newData = JSON.parse(data);

            if (!newData.IPResult.records && !newData.IPResult.records.length) {
               this._showNoRecordsMessage = true;
            }

            return newData;
         })
         .catch((error) => {
            if (error && error.length) {
               console.error(`failed at getting data from IP ${ipMethod} => ${JSON.stringify(error)}`);
            }
            this._showNoRecordsMessage = true;
            this.loading = false;
         });
   }

   sortBy(type) {
      this.showList = false;
      this.loading = true;

      let sortCol = this.sortMap[type];

      if (this.paginatedRecords.length > 1) {
         if (this.selectedSort === "SortingDate") {
            this.paginatedRecords.sort((a, b) => {
               const colA = new Date(a[sortCol]);
               const colB = new Date(b[sortCol]);
               if (this.sortDirection === "DESC") {
                  return colB - colA;
               }
               return colA - colB;
            });
         } else {
            this.paginatedRecords.sort((a, b) => {
               var colA = a[sortCol].toUpperCase();
               var colB = b[sortCol].toUpperCase();
               if (colA < colB) {
                  return this.sortDirection == "ASC" ? -1 : 1;
               }
               if (colA > colB) {
                  return this.sortDirection == "ASC" ? 1 : -1;
               }
               return 0;
            });
         }
      }
      setTimeout(() => {
         this.loading = false;
         this.showList = true;
      });
   }

   sortFocusIn() {
      
      let sortId = this.selectedSortId;
      let sortDir = this.sortDirection;
      let selectedSort = this.selectedSort;
      if (!sortId) {
         this.sortShowBadge("B001");
      } else {
         this.sortShowBadge(this.selectedSortId);
      }
      this.template.querySelector(".sort_list").classList.remove("nds-hide");

      if (this.historyType === "Invoice") {
         let sortByInvoice = this.template.querySelector(".sortByInvoice");
         sortByInvoice.setAttribute('aria-expanded', 'true');
      } else if (this.historyType === "Payment") {
         let sortByPayment = this.template.querySelector(".sortByPayment");
         sortByPayment.setAttribute('aria-expanded', 'true');
      }
      
      
   }


   sortShowBadge(badgeId) {
      let badge = this.template.querySelector('[data-badge-id="' + badgeId + '"]');
      if (badge) {
         let sortId = badge.id;
         this.sortIdNum = sortId.substring(sortId.indexOf("-") + 1);
         let dirBadgeId;
         if (this.sortDirection) {
            dirBadgeId = "#" + badgeId + "-" + this.sortDirection + "-" + this.sortIdNum;
         } else {
            dirBadgeId = "#" + badgeId + "-ASC-" + this.sortIdNum;
         }
         //Display ASC Badge
         this.template.querySelector(dirBadgeId).classList.remove("nds-hide");
      }
   }

   sortWindowClose() {
      if (this.historyType === "Invoice") {
         //console.log("1");
         let sortByInvoice = this.template.querySelector(".sortByInvoice");
         sortByInvoice.setAttribute('aria-expanded', 'false');
         sortByInvoice.focus();
      } else if (this.historyType === "Payment") {
         //console.log("2");
         let sortByPayment = this.template.querySelector(".sortByPayment");
         sortByPayment.setAttribute('aria-expanded', 'false');
         sortByPayment.focus();
      }
      this.template.querySelector(".sort_list").classList.add("nds-hide");
   }

   sortSelect(event) {
      let badgeVal = event.target.getAttribute("data-badge-value");
      if (badgeVal) {
         this.selectedSort = badgeVal;
         this.selectedSortId = event.target.getAttribute("data-badge-id");
         let sortId = event.target.id;
         this.sortIdNum = sortId.substring(sortId.indexOf("-") + 1);
         this.sortDirection = "ASC";
         //Append the fied name after Sort By.
         // this.sortAppendName();
         let badgeKey = event.target.getAttribute("data-badge-id");
         let ascBadgeId;
         if (this.sortIdNum.length > 0) {
            ascBadgeId = "#" + badgeKey + "-ASC-" + this.sortIdNum;
         } else {
            ascBadgeId = "#" + badgeKey + "-ASC";
         }

         //All badges need to be hiddend
         Array.from(this.template.querySelectorAll(".nds-badge")).forEach((element) => {
            if (element.id) {
               element.classList.add("nds-hide");
            }
         });
         //Display ASC Badge
         this.template.querySelector(ascBadgeId).classList.remove("nds-hide");
      }
   }

   sortDirSelect(direction) {
      this.sortDirection = direction;
      this.sortBy(this.selectedSort);
   }
}
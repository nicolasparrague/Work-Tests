import { NavigationMixin } from "lightning/navigation";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import { api, LightningElement, track, wire } from "lwc";

export default class DownloadPdfNavigationActionMobile extends OmniscriptBaseMixin(NavigationMixin(LightningElement)) {
   @track url;

   @api
   invoice;

   @api mobilesdk;
   @track ariaLabelInvoice;
   @api invoiceArray = [];

   base64;
   query;
   param1;
   param2;
   param3;
   loading = false;
   showError = false;
   errorTitle;
   errorMsg;
   isMobile = false;
   //-added--
   _baseURL = "";
   _lastItem = 0;
   rBaseUrl = "";
   //-added--

   connectedCallback() {
      let invoice = JSON.parse(JSON.stringify(this.invoice));
      // console.log("invoice data ", invoice);
      let docInvoiceid = invoice.invoiceNumber;
      // console.log("docInvoiceid ", docInvoiceid);
      let clienteIdSubstring = invoice.clientId.substring(0, 9);
      let docSource = invoice.sourceSystemCode;
      let invoiceDate = invoice.invoiceDate;
      let type;
      let protocol;

      // this.invoiceArray = this.invoiceArray.concat(invoice);
      // let invoiceArray = JSON.parse(JSON.stringify(this.invoice));
      // invoiceArray = invoiceArray.concat(invoice);
      // console.log("invoiceArray ", invoiceArray);
      this.ariaLabelInvoice = "Download invoice document for invoice number " + docInvoiceid + " from Billing and Payments opens a new tab";

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

      if (type == "member") {
         if (docSource == "FACETS") {
            // MPV-1873: Invoice ID for Facet must be 11 characters.
            docInvoiceid = this.validateIdLength(docInvoiceid);
            this.query = "InvoiceDirectHMO";
            this.param1 = "HIP";
            this.param2 = clienteIdSubstring;
            this.param3 = docInvoiceid;
            //this.url = protocol + "//" + hostUrl + "/" + type + "/apex/GetLatestDocument?query=" + this.query + "&param1=" + this.param1 + "&param2=" + this.param2 + "&param3=" + this.param3;
            this.url = protocol + "//" + hostUrl + "/" + type + "/apex/GetLatestDocumentMember?query=" + this.query + "&param1=" + this.param1 + "&param2=" + this.param2 + "&param3=" + this.param3;

         } else {
            this.query = "InvoiceDirectPPO";
            this.param1 = clienteIdSubstring;
            this.param2 = invoiceDate;
            this.param3 = "";
            //this.url = protocol + "//" + hostUrl + "/" + type + "/apex/GetLatestDocument?query=" + this.query + "&param1=" + this.param1 + "&param2=" + this.param2;
            this.url = protocol + "//" + hostUrl + "/" + type + "/apex/GetLatestDocumentMember?query=" + this.query + "&param1=" + this.param1 + "&param2=" + this.param2;

         }
      }

      if (type == "member") {
         if (docSource == "FACETS") {
            // MPV-1873: Invoice ID for Facet must be 11 characters.
            docInvoiceid = this.validateIdLength(docInvoiceid);
            this.query = "InvoiceDirect";
            this.param1 = "Attentis";
            this.param2 = docInvoiceid;
            this.param3 = "";
            this.url = protocol + "//" + hostUrl + "/" + type + "/apex/GetLatestDocumentMember?query=InvoiceDirect&param1=Attentis&param2=" + docInvoiceid;
         }
      }
   }

   renderedCallback() {
      if (document.documentElement.clientWidth < 768) {
         // Code executes if window is smaller than 768 px
         this.isMobile = true;
      } else {
         // Code executes if larger than (or equal to) 768px
         this.isMobile = false;
      }
   }

   validateIdLength(id) {
      // MPV-1873 - Facet ID needs to be 11 characters. This method takes an invoice ID and either trims or pads it out to the needed length.

      // If invoice ID is already 11 characters, simply return it.
      if(id.length == 11) { return id; }

      // Length is greater than 11, so trim to the last 11 characters and return.
      if (id.length > 11) {
         let slicedId = id.slice(-11);
         return slicedId;
      }

      // Length is smaller than 11, so pad '0' character(s) until it reaches 11 characters in length and return.
      if (id.length < 11) {
         let paddedId = id.padStart(11, '0');
         return paddedId;
      }
   }

   btnHandler(event) {
      //this.isMobile = true;
      /*if (this.isMobile || (window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes("CommunityHybridContainer"))) {
         // This code will execute only if the user is in the publisher playground app
         this.loading = true;
         this.handleInvoicePDFMobile();
      } else {
         // This will execute if the user is on desktop, OR is using a regular browser on their phone
         window.open(this.url);
      }*/
   }

   handleInvoicePDFMobile() {
      //Call ESB_GetLastDocument
      let getDocParams = {
         sClassName: "omnistudio.IntegrationProcedureService",
         sMethodName: "ESB_GetLastDocument",
         options: "{}",
         input: {
            param1: this.param1,
            param2: this.param2,
            param3: this.param3,
            query: this.query,
         },
      };

      this.omniRemoteCall(getDocParams, true)
         .then((response) => {
            console.log("Success calling ESB_GetLastDocument");
            console.log(response);
            if (!response.error) {
               let data = response.result.IPResult;
               if (data.documents.length === 1) {
                  let doc = data.documents[0];
                  this.getBase64(doc);
               } else if (data.documents.length > 1) {
                  let firstdoc = data.documents[0];
                  let documentId = firstdoc.id;
                  let firstdocDT = new Date(firstdoc.createdOn);
                  //To get the id of the latest document
                  data.documents.forEach((doc) => {
                     if (doc.id && doc.createdOn && doc.id !== documentId) {
                        let dt = new Date(doc.createdOn);
                        if (dt > firstdocDT) {
                           documentId = doc.id;
                        }
                     }
                  });
                  //Call ESB_GetDocument
                  let docParams = {
                     sClassName: "omnistudio.IntegrationProcedureService",
                     sMethodName: "ESB_GetDocument",
                     options: "{}",
                     input: {
                        id: documentId,
                     },
                  };
                  this.omniRemoteCall(docParams, true).then((resp) => {
                     if (!resp.error) {
                        let doc = resp.result.IPResult.documents[0];
                        this.getBase64(doc);
                     }
                  });
               } else {
                  this.errorTitle = "Download Invoice";
                  this.errorMsg = "Requested document not available";
                  this.loading = false;
                  this.showError = true;
               }
            }
         })
         .catch((error) => {
            this.loading = false;
            console.error("Error when calling omniRemoteCall for ESB_GetLastDocument:");
            if (error) {
               console.log(error);
            } else {
               console.error("Unknown error.");
            }
         });
      this.loading = false;
   }

   getBase64(doc) {
      if (doc.mimeType === "pdf") {
         this.base64 = doc.content;
         //console.log("base64:" + JSON.stringify(this.base64));
         //To create a content doc and download
         let title = `${this.param1}_${this.param2}_invoice`;
         let fileName = `${this.param1}_${this.param2}_invoice.pdf`;
         this.downloadTempPDFForMobile(title, fileName, this.base64);
      }
   }

   downloadTempPDFForMobile(title, fileName, base64) {
      let pathTenant = 'memberportal';
      let params = {
         sClassName: "omnistudio.IntegrationProcedureService",
         sMethodName: "Member_Base64ToContentDoc",
         options: "{}",
         input: {
            base64: base64,
            title: title,
            fileNameWithExtension: fileName,
            //contentType: 'application/pdf'
         },
      };

      this.omniRemoteCall(params, true)
         .then((response) => {
            let data = response.result.IPResult;
            const contentDocId = data.contentDocId;
            this.loading = false;
            //--added--
            this._baseURL = window.location.href;
            this._lastItem = this._baseURL.indexOf("/s");
            this.rBaseUrl = this._baseURL.substring(0, this._lastItem);
            let url = `${this.rBaseUrl}/sfc/servlet.shepherd/document/download/${contentDocId}?operationContext=S1`;
            console.log("URL: " + url);
            //-added--
            this[NavigationMixin.Navigate]({
               type: "standard__webPage",
               attributes: {
                  "url": `${window.top.location.origin}/${pathTenant}/sfc/servlet.shepherd/document/download/${contentDocId}?operationContext=S1`
               },
            });
         })
         .catch((error) => {
            this.loading = false;
            console.error("Error when calling omniRemoteCall for POCMember_Base64ToContentDoc:");
            if (error) {
               console.log(error);
            } else {
               console.error("Unknown error.");
            }
         });
   }

   closeModal() {
      this.showError = false;
   }

   trapFocus() {
      this.template.querySelector('[data-id="modalButton"]').focus();
   }
}
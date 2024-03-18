//import getConsumerProfile from '@salesforce/apex/VlocityQuoteAndEnrollServiceController.getConsumerProfile';
import { api, LightningElement, track } from 'lwc';
//import formFactor from '@salesforce/client/formFactor';

const IS_ACTIVE = 'active';

export default class PagerNonDynamic extends LightningElement {
    @track currentPage = 1;
    @track maxPages = 1;
    @track currentElement = 1;
    @track elementsLoaded = 0;
    @track goToValue = '1';
    @track lessthan7pages =false;
    
    showSpinner = true;

    totalProv = 0;
    firstEle = 0;
    lastEle = 9;
    prevElePerPage;

    @api flexipageRegionWidth;
    @api pagedata = [];
    @api title = 'Insert Title Here';
    @api elementsPerPage = 10;

    @api selectedPage = 1;

    @api _showSaveSearch = false;
    
    @api
    errorMessage;
    
    @api
    get showSaveSearch() {
        return this._showSaveSearch;
    }
    set showSaveSearch(val) {
        this._showSaveSearch = val === "true" || val === true ? true : false;
    }
    
    @api
    get currentlyShown() {
        if(this.pagedata) {
            let dataSlice = this.pagedata.slice(this.firstEle, (this.lastEle + 1));
            return dataSlice;
        }
        return [];
    }

    get isLoading() {
        return this.pagedata == null && this.showSpinner == true;
    }

    get noData() {
        if(this.pagedata) {
            return this.pagedata.length == 0 ? true : false;
        }
        return false;
        
    }

    // Decide which range of pages to show, depending on number of pages and the page user is currently on.
    get currentRange() {
        if(this.maxPages <= 7) { return this.allRange; }
        if(this.currentPage <= 4) { return this.beginningRange; }
        if(this.currentPage >= (this.maxPages-3)) { return this.endRange; }
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
            { id: 'ph', value: '...' },
            { id: this.maxPages, value: this.maxPages }
        ];
    }

    // Returns the first page, and the last five pages
    get endRange() {
        return [
            { id: 1, value: 1 },
            { id: 'ph', value: '...' },
            { id: this.maxPages-4, value: this.maxPages-4 },
            { id: this.maxPages-3, value: this.maxPages-3 },
            { id: this.maxPages-2, value: this.maxPages-2 },
            { id: this.maxPages-1, value: this.maxPages-1 },
            { id: this.maxPages, value: this.maxPages }
        ];
    }

    // Returns the first page, the current page, one page on either side of the current page, and the last page.
    get middleRange() {
        return [
            { id: 1, value: 1 },
            { id: 'ph', value: '...' },
            { id: this.currentPage-1, value: this.currentPage-1 },
            { id: this.currentPage, value: this.currentPage },
            { id: this.currentPage+1, value: this.currentPage+1 },
            { id: 'ph', value: '...' },
            { id: this.maxPages, value: this.maxPages }
        ];
    }

    // Provided there are 7 pages or less, returns the full range.
    get allRange() {
        if(this.maxPages <= 7) {
            this.lessthan7pages = true;
            let ret = [];
            let i = 0;
            while(i < this.maxPages) {
                i++;
                ret.push({ id: i, value: i });
            }
            return ret;
        }
    }

    // Multiple Office PDF
    @api pdfToJson;

    initPager() {
        // If running on mobile, default to 5 per page
        if(document.documentElement.clientWidth < 768) {
            this.elementsPerPage = 5;
            this.lastEle = 4;
        }
        this.prevElePerPage = this.elementsPerPage;
        this.firstEle = 0;
        this.lastEle = this.elementsPerPage - 1;

        this.totalProv = this.pagedata.length;
        if(this.totalProv < this.elementsPerPage) {
            this.elementsLoaded = this.totalProv;
        } else {
            this.elementsLoaded = this.elementsPerPage;
        }
        if(this.totalProv == 0) {
            this.currentElement = 0;
            this.maxPages = 1;
        } else {
            this.currentElement = 1;
            this.maxPages = Math.ceil(this.pagedata.length / this.elementsPerPage);
        }

        // this.currentPage = 1;
        this.currentPage = this.selectedPage;
        if(this.currentPage != 1) {
            this.calculateRange();
        }
    }

    handlePrevious() {
        if(this.currentPage != 1) {
            this.showSpinner = true;
            this.currentPage--;
            this.calculateRange();
            /*
            this.currentElement = this.currentElement - this.elementsPerPage;
            this.elementsLoaded = this.elementsLoaded - this.elementsPerPage;
            this.firstEle = this.firstEle - this.elementsPerPage;
            this.lastEle = this.lastEle - this.elementsPerPage;
            */
        }
    }

    handleNext() {
        if(this.currentPage < this.maxPages) {
            this.showSpinner = true;
            this.currentPage++;
            this.calculateRange();
            /*
            this.currentElement = this.currentElement + this.elementsPerPage;
            if((this.elementsLoaded + this.elementsPerPage) > this.totalProv) {
                this.elementsLoaded = this.totalProv;
            } else {
                this.elementsLoaded = this.elementsLoaded + this.elementsPerPage;
            }
            this.firstEle = this.firstEle + this.elementsPerPage;
            this.lastEle = this.lastEle + this.elementsPerPage;
            */
        }
    }

    handleGoToClick(evt) {
        // Validate that ID isnt a number or placeholder
        let id = evt.currentTarget.dataset.id;
        if(id != 'ph' && isFinite(id) && id != ' ') {
            this.handleGoToPage(id);
        }
    }

    handleGoToInput() {
        // Ensure goToValue is a number and isnt a space (isFinite evaluates to true on spaces as well).
        if(isFinite(this.goToValue) && this.goToValue != ' ') {
            this.handleGoToPage(this.goToValue);
        }
    }

    handleKeyUp(evt) {
        // On keyup, if 'enter' key was pressed, submit.
        if(evt.key == 'Enter') {
            this.handleGoToInput();
        }
    }

    handleGoToChange(evt) {
        this.goToValue = evt.target.value.replace(/[^0-9]/g, "");
    }

    handleGoToPage(pageNum) {
        let num = parseInt(pageNum);
        // Ensure that pageNum is within range of current pages
        if((num > 0) && (num <= this.maxPages)) {
            this.goToValue = num;
            this.showSpinner = true;
            this.currentPage = num;
            this.calculateRange();
        }
    }

    calculateRange() {
        this.firstEle = (this.currentPage - 1) * this.elementsPerPage;
        this.lastEle = (this.currentPage * this.elementsPerPage) - 1;
        this.currentElement = this.firstEle + 1;
        if(((this.currentElement + this.elementsPerPage) - 1) > this.totalProv) {
            this.elementsLoaded = this.totalProv;
        } else {
            this.elementsLoaded = (this.currentElement + this.elementsPerPage) - 1;
        }
        this.dispatchEvent(new CustomEvent('pagerchanged', { detail: { firstEle: this.firstEle, lastEle: this.lastEle, currentPage:this.currentPage } }));
    }

    connectedCallback() {
        if(!this.pagedata) {
            this.pagedata = [];
        }
        this.showSpinner = true;
        this.elementsPerPage = parseInt(this.elementsPerPage);
        this.selectedPage = parseInt(this.selectedPage);
        this.goToValue = this.currentPage;
        this.initPager();
        this.showSpinner = false;
        //console.log("errorMessage: ", this.errorMessage);
    }

    renderedCallback() {
        if(!this.pagedata) {
            this.pagedata = [];
        }
        this.showSpinner = true;
        // Ensure correct page is shown as selected
        let pageSpans = this.template.querySelectorAll('.page-span');
        if(pageSpans) {
            pageSpans.forEach(span => {
                span.classList.remove('selected-page');
            });
            this.template.querySelector(`[data-pageid="${this.currentPage}"]`).classList.add('selected-page');
        }

        // Ensure this.elementsPerPage is an int, not a string.
        this.elementsPerPage = parseInt(this.elementsPerPage);
        
        // If the elementsPerPage has been changed, re-initialize.
        if(this.elementsPerPage != this.prevElePerPage || this.totalProv != this.pagedata.length) {
            this.initPager();
        }

        // Enable both buttons, then check if either needs to be disabled.
        let prevButton = this.template.querySelector('[data-id="prevButton"]');
        if(prevButton){
            prevButton.disabled = false;
        }

        let nextButton = this.template.querySelector('[data-id="nextButton"]');
        if(nextButton){
            nextButton.disabled = false;
        }

        if(this.currentPage == 1) {
            if(prevButton){
                prevButton.disabled = true;
            }
        }

        if(this.currentPage == this.maxPages) {
            if(nextButton){
                nextButton.disabled = true;
            }
        }
        
        // Dispatch event
        // this.dispatchEvent(new CustomEvent('pagerchanged', { detail: { firstEle: this.firstEle, lastEle: this.lastEle } }));
        this.showSpinner = false;
    }
}
import { LightningElement, api } from "lwc";
const MAX_LENGTH_START_END = 5;

export default class DataTablePagination extends LightningElement {
  _numberOfPages = 20;
  _currentPage = 1;
  _pages = [];

  @api
  get numberOfPages() {
    return this._numberOfPages;
  }
  set numberOfPages(value) {
    this._numberOfPages = Number(value);
    this.updatePages();
  }

  addPages(start, end) {
    for (let i = start; i <= end; i++) {
      this._pages.push({ value: i });
    }
  }

  updatePages() {
    this._pages = [];
    if (this._numberOfPages <= 10) {
      this.addPages(1, this._numberOfPages);
    } else if (this._currentPage <= MAX_LENGTH_START_END) {
      this.addPages(1, MAX_LENGTH_START_END);
      this._pages.push({ spacer: true });
      this.addPages(this._numberOfPages - 1, this._numberOfPages);
    } else if (
      this._currentPage >=
      this._numberOfPages - MAX_LENGTH_START_END
    ) {
      this.addPages(1, 2);
      this._pages.push({ spacer: true });
      this.addPages(
        this._numberOfPages - MAX_LENGTH_START_END,
        this._numberOfPages
      );
    } else {
      this.addPages(1, 2);
      this._pages.push({ spacer: true });
      this.addPages(this._currentPage - 1, this._currentPage + 1);
      this._pages.push({ spacer: true });
      this.addPages(this._numberOfPages - 1, this._numberOfPages);
    }

    this._pages.find((page) => page.value === this._currentPage).selected =
      true;
  }

  get shouldShowButton() {
    return this._numberOfPages > 1;
  }

  get nextDisabled() {
    return this._currentPage === this._numberOfPages;
  }

  get previousDisabled() {
    return this._currentPage === 1;
  }

  handlePageChange(event) {
    this._currentPage = Number(event.target.dataset.value);
    this.updatePages();
    this.dispatchEvent(
      new CustomEvent("pagechange", {
        detail: { currentPage: this._currentPage }
      })
    );
  }

  handlePrevious() {
    this._currentPage--;
    this.updatePages();
  }

  handleNext() {
    this._currentPage++;
    this.updatePages();
  }
}

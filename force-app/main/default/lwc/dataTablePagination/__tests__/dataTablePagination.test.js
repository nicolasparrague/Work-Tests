import { createElement } from "lwc";
import DataTablePagination from "c/dataTablePagination";

describe("c-data-table-pagination", () => {
  const flushPromises = () => new Promise.resolve();

  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("Test buttons of navigation by pages", async () => {
    // ARRANGE
    const element = createElement("c-data-table-pagination", {
      is: DataTablePagination
    });
    element.numberOfPages = 20;
    element.dispatchEvent = jest.fn();

    // ACT
    document.body.appendChild(element);
    const buttons = element.shadowRoot.querySelectorAll("lightning-button");

    // ASSERT
    expect(buttons.length).toBe(7);
    expect(element.shadowRoot.querySelector('lightning-button[data-id="selected"]').label).toBe(1);
    

    // ACT
    const otherButton = element.shadowRoot.querySelector('lightning-button[data-value="5"]');
    otherButton.click();
    
    await flushPromises;

    // ASSERT

    expect(element.dispatchEvent).toHaveBeenCalledWith(new CustomEvent({value: '5'}));
    expect(element.shadowRoot.querySelector('lightning-button[data-id="selected"]').label).toBe(5);

    // ACT
    const buttonNext = element.shadowRoot.querySelector('lightning-button-icon[data-id="next"]');
    buttonNext.click();

    await flushPromises;

    // ASSERT
    expect(element.shadowRoot.querySelector('lightning-button[data-id="selected"]').label).toBe(6);

    // ACT
    const buttonPrevious = element.shadowRoot.querySelector('lightning-button-icon[data-id="previous"]');
    buttonPrevious.click();

    await flushPromises;

    // ASSERT
    expect(element.shadowRoot.querySelector('lightning-button[data-id="selected"]').label).toBe(5);
  });
});

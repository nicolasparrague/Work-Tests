import { createElement } from "lwc";
import MainContent from "c/mainContent";

describe("c-main-content", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("should display heading", async () => {
    const element = createElement("c-main-content", {
      is: MainContent
    });

    element.styleclass = "someCss";
    element.headingstyle = "someCssStyle";
    element.heading = "someHeading";

    document.body.appendChild(element);

    const heading = element.shadowRoot.querySelector("h1");

    await Promise.resolve();

    expect(heading.getAttribute('class')).toBe(`mainContent someCss`);
    expect(heading.getAttribute('style')).toBe(element.headingstyle);
    expect(heading.id).toBe('maincontent');
  });
});

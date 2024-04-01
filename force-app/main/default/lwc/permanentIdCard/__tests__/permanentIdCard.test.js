import { createElement } from "lwc";
import PermanentIdCard from "c/permanentIdCard";

describe("c-permanent-id-card", () => {

  function event(nameEvent, element) {
    return new CustomEvent(
      nameEvent, {
      detail: {
        type: element.type,
        cardData: element.cardData,
        permData: element.permData
      }
    });
  }

  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("test buttons", () => {
    // ARRANGE
    const element = createElement("c-permanent-id-card", {
      is: PermanentIdCard
    });

    element.type = 'type';
    element.cardData = {
      MemberId: "MemberId"
    };

    element.permData = {
      PNGBack: "PNGBack",
      PNGFront: "PNGFront"
    };

    window.navigator = {
      userAgent: "CommunityHybridContainer"
    };

    element.dispatchEvent = jest.fn();

    // ACT
    document.body.appendChild(element);

    // ASSERT
    const targetId = element.shadowRoot.querySelector('div[data-target-id]').getAttribute('data-target-id');
    const permCardFront = element.shadowRoot.querySelector("img")?.src;
    element.shadowRoot.querySelector('button[data-target-id="downloadButton"]').click();
    element.shadowRoot.querySelector('button[data-target-id="requestButton"]').click();
    element.shadowRoot.querySelector('button[data-target-id="requestButtonMobile"]').click();
    element.shadowRoot.querySelector('button[data-target-id="downloadButtonMobile"]').click();

    expect(targetId).toBe("type-id-card");
    expect(permCardFront).toBe("data:image/png;base64,PNGFront");
    expect(element.dispatchEvent).toHaveBeenCalledWith(event("generatepdfdesktop", element));
    expect(element.dispatchEvent).toHaveBeenCalledWith(event("requestid", element));
    expect(element.dispatchEvent).toHaveBeenCalledWith(event("generatepdfmobile", element));
  });

  it("test button if isMobileApp is false", () => {
    // ARRANGE
    const element = createElement("c-permanent-id-card", {
      is: PermanentIdCard
    });

    element.cardData = {
      MemberId: "MemberId"
    };

    element.dispatchEvent = jest.fn();

    // ACT
    document.body.appendChild(element);

    // ASSERT
    element.shadowRoot.querySelector('button[data-target-id="downloadButtonMobile"]').click();

    expect(element.dispatchEvent).toHaveBeenCalledWith(event("generatepdfdesktop", element));
  });
});
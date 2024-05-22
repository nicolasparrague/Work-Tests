import { createElement } from "lwc";
import getMemberCount from "@salesforce/apex/BrokerStatusController.getMemberCount";
import { NavigationMixin } from "lightning/navigation";

jest.mock(
  "@salesforce/apex/BrokerStatusController.getMemberCount",
  () => {
    const { createApexTestWireAdapter } = require("@salesforce/sfdx-lwc-jest");
    return {
      default: createApexTestWireAdapter(jest.fn())
    };
  },
  { virtual: true }
);

jest.mock(
  "lightning/navigation",
  () => ({
    NavigationMixin: jest.fn()
  }),
  { virtual: true }
);

// mock NavigationMixin class and methods
// manually populate NavigationMixin.mock.instances on every instance so we can later access it

const result = (Base) => {
  NavigationMixin.mock.instances = [];

  return class extends Base {
    constructor() {
      super();
      this.navigate = jest.fn();
      NavigationMixin.mock.instances.push(this);
    }
  };
};

NavigationMixin.mockImplementation(result);
NavigationMixin.Navigate = "navigate";


const BrokerStatus = require("c/brokerStatus").default;

describe("c-broker-status", () => {
  const flushPromises = () => new Promise(process.nextTick);

  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("Test if value is positive", async () => {
    // ARRANGE
    const element = createElement("c-broker-status", {
      is: BrokerStatus
    });

    document.body.appendChild(element);

    // ACT
    getMemberCount.emit(JSON.stringify({ totalUntilLastMonth: 2, total: 3 }));
    await flushPromises();

    // ASSERT
    const total = element.shadowRoot.querySelector(
      `lightning-formatted-number[data-id="total"]`
    )?.value;
    const differenceAbs = element.shadowRoot.querySelector(
      `lightning-formatted-number[data-id="differenceAbs"]`
    )?.value;
    //const iconName = element.shadowRoot.querySelector(`lightning-icon`).getAttribute('icon-name');
    const iconClass = element.shadowRoot
      .querySelector(`lightning-icon`)
      .getAttribute("class");
    const text = element.shadowRoot
      .querySelector(`span[data-id="text"]`)
      .getAttribute("class");

    expect(total).toBe(3);
    expect(differenceAbs).toBe(1);
    expect(iconClass).toBe("positiveIcon");
    expect(text).toBe("positiveText");

    const button = element.shadowRoot.querySelector("lightning-button-icon");
    button.click();

    expect(NavigationMixin.mock.instances[0].navigate).toHaveBeenCalledWith({
      type: "comm__namedPage",
      attributes: {
        name: "members__c"
      }
    });
  });

    it("Test if value is negative", async () => {
      // ARRANGE
      const element = createElement("c-broker-status", {
        is: BrokerStatus
      });

      document.body.appendChild(element);

      // ACT
      getMemberCount.emit(JSON.stringify({ totalUntilLastMonth: 3, total: 2 }));
      await flushPromises();

      // ASSERT
      const total = element.shadowRoot.querySelector(
        `lightning-formatted-number[data-id="total"]`
      )?.value;
      const differenceAbs = element.shadowRoot.querySelector(
        `lightning-formatted-number[data-id="differenceAbs"]`
      )?.value;
      //const iconName = element.shadowRoot.querySelector(`lightning-icon`).getAttribute('icon-name');
      const iconClass = element.shadowRoot
        .querySelector(`lightning-icon`)
        .getAttribute("class");
      const text = element.shadowRoot
        .querySelector(`span[data-id="text"]`)
        .getAttribute("class");

      expect(total).toBe(2);
      expect(differenceAbs).toBe(1);
      expect(iconClass).toBe("negativeIcon");
      expect(text).toBe("negativeText");
    });

    it("Test if value is neutral", async () => {
      // ARRANGE
      const element = createElement("c-broker-status", {
        is: BrokerStatus
      });

      document.body.appendChild(element);

      // ACT
      getMemberCount.emit(JSON.stringify({ totalUntilLastMonth: 3, total: 3 }));
      await flushPromises();

      // ASSERT
      const total = element.shadowRoot.querySelector(
        `lightning-formatted-number[data-id="total"]`
      )?.value;
      const differenceAbs = element.shadowRoot.querySelector(
        `lightning-formatted-number[data-id="differenceAbs"]`
      )?.value;
      //const iconName = element.shadowRoot.querySelector(`lightning-icon`).getAttribute('icon-name');
      const iconClass = element.shadowRoot
        .querySelector(`lightning-icon`)
        .getAttribute("class");
      const text = element.shadowRoot
        .querySelector(`span[data-id="text"]`)
        .getAttribute("class");

      expect(total).toBe(3);
      expect(differenceAbs).toBe(0);
      expect(iconClass).toBe("neutralIcon");
      expect(text).toBe("neutralText");
    });
});

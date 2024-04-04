import { createElement } from "lwc";
import ServiceTypeIcon from "c/serviceTypeIcon";

jest.mock("c/customIcon");
describe("c-service-type-icon", () => {
  const flushPromises = () => new Promise(process.nextTick);

  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("Test if showCostCalculator is true", async () => {

    // ARRANGE
    const element = createElement("c-service-type-icon", {
      is: ServiceTypeIcon
    });
    element.claimtype = "Calculator";
    // ACT
    document.body.appendChild(element);

    await flushPromises();

    const costCalculator = element.shadowRoot.querySelector('svg[data-id="costCalculator"]');
    // ASSERT
    expect(costCalculator).not.toBeNull();
  });

  it("Test if showTelehealth is true", async () => {

    // ARRANGE
    const element = createElement("c-service-type-icon", {
      is: ServiceTypeIcon
    });

    element.claimtype = "Telehealth";
    // ACT
    document.body.appendChild(element);

    await flushPromises();

    const telehealth = element.shadowRoot.querySelector('svg[data-id="telehealth"]');
    // ASSERT
    expect(telehealth).not.toBeNull();
  });

  it("Test if showForm is true", async () => {

    // ARRANGE
    const element = createElement("c-service-type-icon", {
      is: ServiceTypeIcon
    });

    element.claimtype = "Form";
    // ACT
    document.body.appendChild(element);

    await flushPromises();

    const form = element.shadowRoot.querySelector('svg[data-id="form"]');
    // ASSERT
    expect(form).not.toBeNull();
  });

  it("Test if showGralIcons is true", async () => {

    // ARRANGE
    const element = createElement("c-service-type-icon", {
      is: ServiceTypeIcon
    });

    element.claimtype = "Vision";
    // ACT
    document.body.appendChild(element);

    await flushPromises();

    const iconName = element.shadowRoot.querySelector("c-custom-icon")?.iconName;
    // ASSERT
    expect(iconName).not.toBeNull();
    expect(iconName).toBe("Ophthalmology");
  });
});

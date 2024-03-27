import { createElement } from "lwc";
import { getDataHandler } from "omnistudio/utility";
import BenefitsDentalPlanBenefits from "c/benefitsDentalPlanBenefits";

jest.mock('c/customIcon');

jest.mock(
  "omnistudio/utility",
  () => ({
    getDataHandler: jest.fn()
  }),
  { virtual: true }
);

describe("c-benefits-dental-plan-benefits", () => {

  const flushPromises = () => new Promise(process.nextTick);

  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    } 
  });

  it("should display table based on integration procedure response", async () => {

    // ARRANGE

    const element = createElement("c-benefits-dental-plan-benefits", {
      is: BenefitsDentalPlanBenefits
    });
    element.planId = 'somePlanId';
    element.planname = 'somePlanName';

    const integrationProducedureMock = {
      IPResult: {
        dental: [
          { bsdlCode: 'first', bsdlLabel: 'label', description: 'description' }
        ],
        limits: [
          { group: 'primary', title: '1', limitLanguage: 'spanish' },
          { group: 'primary', title: '2', limitLanguage: 'english' }
        ]
      }
    };

    getDataHandler.mockResolvedValue(JSON.stringify(integrationProducedureMock));

    // ACT component is visible

    document.body.appendChild(element);

    await flushPromises();

    // ASSERT should display dentalBenefits

    const { dental, limits } = integrationProducedureMock.IPResult;
    const elements = [...element.shadowRoot.querySelectorAll('p')];
    const group = [...element.shadowRoot.querySelectorAll('h2')]
      .find(e => e.textContent === limits[0].group);

    expect(elements.find(e => e.textContent === dental[0].bsdlLabel)).toBeDefined();
    expect(elements.find(e => e.textContent === dental[0].description)).toBeDefined();
    expect(elements.find(e => e.textContent === limits[0].title)).toBeDefined();
    expect(elements.find(e => e.textContent === limits[1].limitLanguage)).toBeDefined();
    expect(group).toBeDefined();
  });
});

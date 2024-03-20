import { createElement } from 'lwc';
import BenefitHomeRedirect from 'c/benefitHomeRedirect';
import pubsub from "omnistudio/pubsub";

jest.mock("omnistudio/pubsub", () => ({ register: jest.fn(), unregister: jest.fn() }), { virtual: true });

describe("c-benefit-home-redirect", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    // Prevent data saved on mocks from leaking between tests
      jest.clearAllMocks();
  });

  it('sets correct page name and breadcrumb when tab is not My Documents', () => {
    const element = createElement('c-benefit-home-redirect', {
      is: BenefitHomeRedirect
    });
    // Arrange
    element.tab = "Not is my Documents";
    // Act
    document.body.appendChild(element);
    const pageName = element.shadowRoot.querySelector('span[data-id="pageName"]');
    const benefitHomeSrc = element.shadowRoot.querySelector('a').getAttribute('href');
    document.body.removeChild(element);
    // Assert
    expect(benefitHomeSrc).toBe('http://localhost//s/benefits?param1=1');
    expect(pageName.textContent).toBe("Plan Details");
    expect(pubsub.unregister).toHaveBeenCalled();
  });
  
  it('sets pageName correctly when tab is My Documents', () => {
    const element = createElement('c-benefit-home-redirect', {
      is: BenefitHomeRedirect
    });
    // Arrange
    element.tab = "My Documents";
    // Act
    document.body.appendChild(element);
    const pageName = element.shadowRoot.querySelector('span[data-id="pageName"]');
    const previousPage = element.shadowRoot.querySelector('span[data-id="previousPage"]');
    const benefitHomeSrc = element.shadowRoot.querySelector('a').getAttribute('href');
    document.body.removeChild(element);
    // Assert
    expect(benefitHomeSrc).toBe('http://localhost//s/benefits?param1=1');
    expect(pageName.textContent).toBe('My Documents');
    expect(previousPage.textContent).toBe('Plan Details');
    expect(pubsub.unregister).toHaveBeenCalled();
  });
});
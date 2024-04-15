import { createElement } from 'lwc';
import BrokerPerformaceLayout from 'c/brokerPerformaceLayout';

describe('c-broker-performace-layout', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('Test layout elements', () => {

        // ARRANGE
        const element = createElement('c-broker-performace-layout', {
            is: BrokerPerformaceLayout
        });

        // ACT
        document.body.appendChild(element);

        // ASSERT
        const layoutElements = element.shadowRoot.querySelectorAll('c-broker-status');
        expect(layoutElements.length).toBe(3);
    });
});
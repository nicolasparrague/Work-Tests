import { createElement } from 'lwc';
import BrokerStatus from 'c/brokerStatus';

describe('c-broker-status', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('Test if value is positive', async () => {

        // ARRANGE
        const element = createElement('c-broker-status', {
            is: BrokerStatus
        });

        // ACT
        element.totalLastMonth = 2;
        element.total = 3;
    
        document.body.appendChild(element);

        // ASSERT
        const valueTotal = element.shadowRoot.querySelector(`lightning-formatted-number[data-id="valueTotal"]`).value;
        const differenceAbs = element.shadowRoot.querySelector(`lightning-formatted-number[data-id="differenceAbs"]`).value;
        //const iconName = element.shadowRoot.querySelector(`lightning-icon`).getAttribute('icon-name');
        const iconClass = element.shadowRoot.querySelector(`lightning-icon`).getAttribute('class');
        const text = element.shadowRoot.querySelector(`span[data-id="text"]`).getAttribute('class');

        expect(valueTotal).toBe(3);
        expect(differenceAbs).toBe(1);
        expect(iconClass).toBe('positiveIcon');
        expect(text).toBe('positiveText');

        const button = element.shadowRoot.querySelector('lightning-button-icon');
        button.click();

        await Promise.resolve();

    });

    it('Test if value is negative', async () => {

        // ARRANGE
        const element = createElement('c-broker-status', {
            is: BrokerStatus
        });

        // ACT
        element.totalLastMonth = 3;
        element.total = 2;
    
        document.body.appendChild(element);

        // ASSERT
        const valueTotal = element.shadowRoot.querySelector(`lightning-formatted-number[data-id="valueTotal"]`).value;
        const differenceAbs = element.shadowRoot.querySelector(`lightning-formatted-number[data-id="differenceAbs"]`).value;
        //const iconName = element.shadowRoot.querySelector(`lightning-icon`).getAttribute('icon-name');
        const iconClass = element.shadowRoot.querySelector(`lightning-icon`).getAttribute('class');
        const text = element.shadowRoot.querySelector(`span[data-id="text"]`).getAttribute('class');

        expect(valueTotal).toBe(2);
        expect(differenceAbs).toBe(1);
        expect(iconClass).toBe('negativeIcon');
        expect(text).toBe('negativeText');

        const button = element.shadowRoot.querySelector('lightning-button-icon');
        button.click();
      
        await Promise.resolve();

    });

    it('Test if value is neutral', async () => {

        // ARRANGE
        const element = createElement('c-broker-status', {
            is: BrokerStatus
        });

        // ACT
        element.totalLastMonth = 3;
        element.total = 3;
    
        document.body.appendChild(element);

        // ASSERT
        const valueTotal = element.shadowRoot.querySelector(`lightning-formatted-number[data-id="valueTotal"]`).value;
        const differenceAbs = element.shadowRoot.querySelector(`lightning-formatted-number[data-id="differenceAbs"]`).value;
        //const iconName = element.shadowRoot.querySelector(`lightning-icon`).getAttribute('icon-name');
        const iconClass = element.shadowRoot.querySelector(`lightning-icon`).getAttribute('class');
        const text = element.shadowRoot.querySelector(`span[data-id="text"]`).getAttribute('class');

        expect(valueTotal).toBe(3);
        expect(differenceAbs).toBe(0);
        expect(iconClass).toBe('neutralIcon');
        expect(text).toBe('neutralText');

        const button = element.shadowRoot.querySelector('lightning-button-icon');
        button.click();
      
        await Promise.resolve();

    });
});
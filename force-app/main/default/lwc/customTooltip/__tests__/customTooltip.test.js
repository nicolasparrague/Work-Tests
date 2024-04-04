import { createElement } from 'lwc';
import CustomTooltip from 'c/customTooltip';

describe('c-custom-tooltip', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('if outputfield is true', async () => {

        // ARRANGE
        const element = createElement('c-custom-tooltip', {
            is: CustomTooltip
        });

        element.format = "outputField";
        element.labelclass = "label class";
        element.helptext = "help text";
        element.valueclass = "value class";

        // ACT
        document.body.appendChild(element);
        await Promise.resolve();

        // ASSERT
        const labelClass = element.shadowRoot.querySelector('label').getAttribute('class');
        const helpText = element.shadowRoot.querySelector('lightning-helptext').content;
        const valueClass = element.shadowRoot.querySelector('span').getAttribute('class');

        expect(labelClass).toBe('nds-show--inline nds-form-element__label label class');
        expect(valueClass).toBe('field-value value class');
        expect(helpText).toBe("help text");
    });

    it('if showHeader is true', async () => {

        // ARRANGE
        const element = createElement('c-custom-tooltip', {
            is: CustomTooltip
        });

        element.format = "header";
        element.headerclass = "header class";
        element.helptext = "help text";
        element.subheaderclass = "subheader class";

        // ACT
        document.body.appendChild(element);
        await Promise.resolve();

        // ASSERT
        const headerClass = element.shadowRoot.querySelector('h2').getAttribute('class');
        const helpText = element.shadowRoot.querySelector('lightning-helptext').content;
        const subheaderClass = element.shadowRoot.querySelector('p').getAttribute('class');

        expect(headerClass).toBe("header class");
        expect(helpText).toBe("help text");
        expect(subheaderClass).toBe("subheader class");
    });
});
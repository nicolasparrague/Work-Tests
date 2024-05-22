import { createElement } from 'lwc';
import FieldSearch from 'c/fieldSearch';

describe('c-field-search', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('Should display different input based on selected option', async () => {

        // ARRANGE
        const element = createElement('c-field-search', {
            is: FieldSearch
        });
        element.dispatchEvent = jest.fn();
        element.options = [
            { value: 'option1', type: 'text' }, 
            { value: 'option2', type: 'date' },
        ];

        // ACT
        document.body.appendChild(element); 

        const inputText = element.shadowRoot.querySelectorAll('input[data-id="inputText"]');
        inputText.value = 'inputText';

        const searchButton = element.shadowRoot.querySelector('lightning-button[data-id="search"]');
        searchButton.click();
        
        // ASSERT
        expect(inputText.length).toBe(1);
        expect(element.dispatchEvent).toHaveBeenCalledWith(new CustomEvent({value: 'option1'}));

        // ACT 
        const cancelButton = element.shadowRoot.querySelector('lightning-button[data-id="cancel"]');
        cancelButton.click();

        // ASSERT
        expect(searchButton.disabled).toBe(true);
        expect(cancelButton.disabled).toBe(true);
        expect(element.dispatchEvent).toHaveBeenCalledWith(new CustomEvent('cancel'));

        // ACT
        const combobox = element.shadowRoot.querySelector('lightning-combobox');
        combobox.value = 'option2';
        combobox.dispatchEvent(new CustomEvent('change', {target: { value: 'option2' }}));

        await new Promise(process.nextTick);

        // ASSERT
        const inputDate = element.shadowRoot.querySelectorAll('lightning-input')

        expect(inputDate.length).toBe(2);
    });
});
import { createElement } from 'lwc';
import ViewNearbyEventsLWC from 'c/viewNearbyEventsLWC';

describe('c-view-nearby-events-l-w-c', () => {
    // Helper function to wait until the microtask queue is empty. This is needed for promise
    // timing when calling imperative Apex.
    const flushPromises = () => new Promise(process.nextTick);

    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('Test button tab', async () => {
        const element = createElement('c-view-nearby-events-l-w-c', {
            is: ViewNearbyEventsLWC
        });

        document.body.appendChild(element);

        const addButton = element.shadowRoot.querySelector('button[data-id="goToExternalSite"]');
        addButton.click();

        await flushPromises();

        const buttons = element.shadowRoot.querySelectorAll('button');
        // Assert
        expect(Array.from(buttons)).toContain(addButton);

        const continueButton = element.shadowRoot.querySelector('button[data-id="continue"]');
        continueButton.focus();

        await flushPromises();

        const cancelButton = element.shadowRoot.querySelector('button[data-id="cancel"]');
        const cancelFocusMock = jest.spyOn(cancelButton, 'focus');

        window.dispatchEvent(new KeyboardEvent("keydown", {keycode: 9, key: 'Tab' }));

        await flushPromises();
        // Assert
        expect(cancelFocusMock).toHaveBeenCalled();
    });

    it('Test button escape', async () => {
        const element = createElement('c-view-nearby-events-l-w-c', {
            is: ViewNearbyEventsLWC
        });

        document.body.appendChild(element);

        const addButton = element.shadowRoot.querySelector('button[data-id="goToExternalSite"]');
        addButton.click();

        await flushPromises();

        window.dispatchEvent(new KeyboardEvent("keyup", {keycode: 27, key: 'Escape' }));

        await flushPromises();

        const cancel = element.shadowRoot.querySelector('button[data-id="cancel"]');
        // Assert
        expect(cancel).toBeFalsy();
    });
    it('Test button openLink', async () => {
        const element = createElement('c-view-nearby-events-l-w-c', {
            is: ViewNearbyEventsLWC
        });

        element.url = 'https://www.url.com';
        window.open = jest.fn();
        document.body.appendChild(element);

        const addButton = element.shadowRoot.querySelector('button[data-id="goToExternalSite"]');
        addButton.click();

        await flushPromises();

        const continueButton = element.shadowRoot.querySelector('button[data-id="continue"]');
        continueButton.click();
        // Assert
        expect(window.open).toHaveBeenCalled();
    });
});
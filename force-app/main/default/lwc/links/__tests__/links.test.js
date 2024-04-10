import { createElement } from 'lwc';
import Links from 'c/links';

describe('c-links', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('test of the url links', () => {

        // Arrange
        const element = createElement('c-links', {
            is: Links
        });

        // Act
        document.body.appendChild(element);

        // Assert
        const links = element.shadowRoot.querySelectorAll('a');
        expect(links.length).toBe(3);
    });
});
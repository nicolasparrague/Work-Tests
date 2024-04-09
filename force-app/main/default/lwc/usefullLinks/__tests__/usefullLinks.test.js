import { createElement } from 'lwc';
import UsefullLinks from 'c/usefullLinks';

describe('c-usefull-links', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('test of the url links', () => {
        // Arrange
        const element = createElement('c-usefull-links', {
            is: UsefullLinks
        });

        const fullLinks = [
            { label: 'firstLink', url: 'https://www.google.com' },
            { label: 'SecondLink', url: 'https://www.google.com' },
            { label: 'thirdLink', url: 'https://www.google.com' }
        ];
        element.fullLinks = fullLinks;
        // Act
        document.body.appendChild(element);

        // Assert
        const links = element.shadowRoot.querySelectorAll('a');
        expect(links.length).toBe(fullLinks.length);
    });
});
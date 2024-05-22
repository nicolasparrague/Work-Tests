import { flatObjectsInArray } from 'c/apexRecordsUtils';

describe('c-apex-records-utils', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('correctly flattens nested objects in an array while preserving their hierarchical paths', () => {

        // ARRANGE
        const object = [
            {name: 'name'}, 
            {name: {childName: 'childName'}},
            {name: {childName: {name: 'childName'}}}
        ]

        // ACT
        const result = flatObjectsInArray(object);

        // ASSERT
        expect(result[0].name).toBe('name');
        expect(result[1]['name.childName']).toBe('childName');
        expect(result[2]['name.childName.name']).toBe('childName');   
    });
});
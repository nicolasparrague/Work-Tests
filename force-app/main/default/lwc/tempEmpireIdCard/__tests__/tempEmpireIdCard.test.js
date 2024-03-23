import { createElement } from "lwc";
import TempEmpireIdCard from "c/tempEmpireIdCard";

jest.mock(
    "omnistudio/omniscriptBaseMixin",
    () => ({
        OmniscriptBaseMixin: (Parent) => class extends Parent {}
    }),
    { virtual: true }
);

describe("c-temp-empire-id-card", () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it("test commercial empiretype", () => {
        // ARRANGE comercial empireType

        const element = createElement("c-temp-empire-id-card", {
            is: TempEmpireIdCard
        });

        element.cardData = {
            MemberId: 'someMemberId',
            empireType: 'Commercial',
            MemberName: 'someMemberName'
        }

        element.type = 'someType';

        // ACT element is added to the page

        document.body.appendChild(element);

        // ASSERT component displays information

        const memberName = element.shadowRoot.querySelector(`li[data-id="memberName"]`);
        const memberId = element.shadowRoot.querySelector(`li[data-id="memberId"]`);
        const firstDescription = element.shadowRoot.querySelector(`span[data-id="firstDescription"]`);
        const secondDescription = element.shadowRoot.querySelector(`span[data-id="secondDescription"]`);
        const empirePlanName = element.shadowRoot.querySelector(`li[data-id="empirePlanName"]`);
        const requestButton = element.shadowRoot.querySelector(`.id-card-body-second-description`);

        expect(memberName.textContent).toBe(element.cardData.MemberName);
        expect(memberId.textContent).toBe(`NYC ${element.cardData.MemberId}`);
        expect(firstDescription.textContent).toBe('ER copay*: $150\r\nHospital copay: $300 per admission');
        expect(secondDescription.textContent).toBe('Call NYC HEALTHLINE  for hospital admissions and Empire member services for benefit information\r\n(see back for details).');
        expect(empirePlanName.textContent).toBe(`Health Plan: Hospital`);
        expect(requestButton.classList).toContain('id-card-body-commercial-description');
    });

    it("test Senior empiretype", () => {
        // ARRANGE element is empiretype senior

        const element = createElement("c-temp-empire-id-card", {
            is: TempEmpireIdCard
        });

        element.cardData = {
            MemberId: 'someMemberId',
            empireType: 'Senior',
            MemberName: 'someMemberName'
        }

        element.type = 'someType';

        // ACT element is added to the page

        document.body.appendChild(element);

        // ASSERT displays information

        const memberName = element.shadowRoot.querySelector(`li[data-id="memberName"]`);
        const memberId = element.shadowRoot.querySelector(`li[data-id="memberId"]`);
        const secondDescription = element.shadowRoot.querySelector(`span[data-id="secondDescription"]`);
        const empirePlanName = element.shadowRoot.querySelector(`li[data-id="empirePlanName"]`);
        const requestButton = element.shadowRoot.querySelector(`.id-card-body-second-description`);

        expect(memberName.textContent).toBe(element.cardData.MemberName);
        expect(memberId.textContent).toBe(`NYC ${element.cardData.MemberId}`);
        expect(secondDescription.textContent).toBe('Medicare is primary. Bill Medicare first.');
        expect(empirePlanName.textContent).toBe(`Health Plan: Empire Hospital Senior Care`);
        expect(requestButton.classList).toContain('id-card-body-senior-description');
    });

    it("test buttons", () => {
        // ARRANGE
        const element = createElement("c-temp-empire-id-card", {
            is: TempEmpireIdCard
        });

        element.dispatchEvent = jest.fn();
        element.type = 'someType';
        element.cardData = {
            MemberId: 'someMemberId'
        };

        document.body.appendChild(element);

        // ACT buttons are clicked

        element.shadowRoot.querySelector(`button[data-target-id="downloadButton"]`).click();
        element.shadowRoot.querySelector(`button[data-target-id="requestButton"]`).click();

        // ASSERT component dispatches events

        expect(element.dispatchEvent).toHaveBeenCalledWith(
            new CustomEvent('generatepdf', { detail: {
                type: element.type,
                cardData: element.cardData
            }}));


        expect(element.dispatchEvent).toHaveBeenCalledWith(
            new CustomEvent('requestid', { detail: {
                type: element.type,
            }}));
    });
});

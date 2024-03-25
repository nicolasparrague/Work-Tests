import { createElement } from "lwc";

const { OmniscriptBaseMixin } = require("omnistudio/omniscriptBaseMixin");

jest.mock("c/customIcon");
jest.mock("c/memberSearchCombo");

jest.mock(
  "omnistudio/omniscriptBaseMixin",
  () => ({
    OmniscriptBaseMixin: jest.fn()
  }),
  { virtual: true }
);

// mock omniscriptBaseMixing class and methods
// manually populate OmniscriptBaseMixin.mock.instances on every instance so we can later access it

OmniscriptBaseMixin.mockImplementation((Base) => {
  OmniscriptBaseMixin.mock.instances = [];

  return class extends Base {
    constructor() {
      super();
      this.omniRemoteCall = jest.fn();
      this.omniJsonData = jest.fn();
      this.omniNavigateTo = jest.fn();
      OmniscriptBaseMixin.mock.instances.push(this);
    }
  };
});

// use require to ensure its defined after properly mocking OmniscriptBaseMixin
const FacilityDetailsLWC = require("c/facilityDetailsLWC").default;

describe("c-facility-details-l-w-c", () => {
  // Helper function to wait until the microtask queue is empty. This is needed for promise
  // timing when calling imperative Apex.
  async function flushPromises() {
    return Promise.resolve();
  }

  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }

    jest.clearAllMocks();
  });

  it("test desktop", async () => {
    
    // ARRANGE
    const element = createElement("c-facility-details-l-w-c", {
      is: FacilityDetailsLWC
    });

    const select = (selector) => element.shadowRoot.querySelector(selector);

    global.window.print = jest.fn();

    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const omni = OmniscriptBaseMixin.mock.instances[0];

    omni.omniJsonData = {
      selectedFacility: {
        facetsProviderId: "someFacetsProviderId"
      },
      tenantId: "someTenantId",
      planType: "somePlanType",
      networkId: "someNetworkId",
      selectedFacilityType: "someSelectedFacilityType"
    };

    const memberProviderPlansIpResponse = {
      providerPlanInfo: ["option1", "option2"]
    };

    const memberfacilityDetailsIpResponse = {
      isCOE: "Yes",
      facilityName: "someFacilityName",
      facilityType: "someFacilityType",
      facilityaddress: {
        addressLine1: "someAddressLine1",
        addressLine2: "someAddressLine2",
        addressLine3: "someAddressLine3",
        city: "someCity",
        county: "someCounty",
        state: "someState",
        zip: "000000",
        geoPoint: "someGeoPoint",
        provAddressContact: {
          phone: "1231231231"
        }
      },
      facilityNetwork: {
        participatingNetworks: [
          { value: "someValue" },
          { value: "someOtherValue" }
        ]
      },
      facilityAccreditation: [
        {
          ID: "1",
          accred: "someAccred",
          expirationDate: tomorrow,
          effectiveDate: tomorrow,
          certificateNumber: "1234",
          accreditationLevel: "1"
        },
        { ID: "2", accred: "someOtherAccred", expirationDate: tomorrow }
      ]
    };

    const { addressLine1, addressLine2, city, state, zip, provAddressContact } =
      memberfacilityDetailsIpResponse.facilityaddress;

    const [firstAccred, secondAccred] =
      memberfacilityDetailsIpResponse.facilityAccreditation;

    omni.omniRemoteCall.mockReturnValueOnce(
      Promise.resolve({
        result: { IPResult: memberfacilityDetailsIpResponse }
      })
    );

    omni.omniRemoteCall.mockReturnValue(
      Promise.resolve({
        result: { IPResult: memberProviderPlansIpResponse }
      })
    );

    // ACT
    document.body.appendChild(element);

    await flushPromises();

    // ASSERT

    expect(select('p[data-id="facilityName"]')?.textContent).toBe(
      memberfacilityDetailsIpResponse.facilityName
    );
    expect(select('p[data-id="facilityType"]')?.textContent).toBe(
      omni.omniJsonData.selectedFacilityType
    );
    expect(select('p[data-id="locationPhone"]')?.textContent).toBe(
      provAddressContact.phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")
    );
    expect(select('p[data-id="address"]')?.textContent).toBe(
      `${addressLine1} ${city}, ${state} ${zip.slice(0, -1)}`
    );
    expect(select('p[data-id="isCoe"]')?.textContent).toBe(
      memberfacilityDetailsIpResponse.isCOE
    );
    expect(select('a[data-id="locationAddress"]')?.href).toBe(
      `https://www.google.com/maps/dir/?api=1&destination=${addressLine1}%2C+${addressLine2}%2C+${city}%2C+${state}%2C+${zip.slice(0, -1)}/`
    );
    expect(
      select('lightning-formatted-phone[data-id="locationPhone"]')?.value
    ).toBe(
      provAddressContact.phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")
    );
    expect(select('div[data-id="centerOfExcellence"]')).toBeDefined();

    const agencyElements = [
      ...element.shadowRoot.querySelectorAll(
        "div.nds-col.nds-p-around_small.nds-text-align_right"
      )
    ];
    expect(agencyElements[0].textContent).toBe(firstAccred.accred);
    expect(agencyElements[1].textContent).toBe(firstAccred.certificateNumber);
    expect(agencyElements[2].textContent).toBe(
      firstAccred.effectiveDate.toString()
    );
    expect(agencyElements[3].textContent).toBe(
      firstAccred.expirationDate.toString()
    );
    expect(agencyElements[4].textContent).toBe(firstAccred.accreditationLevel);

    expect([
      ...select('c-member-search-combo[data-id="plans"]').options
    ]).toStrictEqual(memberProviderPlansIpResponse.providerPlanInfo);

    expect([
      ...select('c-member-search-combo[data-id="networks"]').options
    ]).toStrictEqual(
      memberfacilityDetailsIpResponse.facilityNetwork.participatingNetworks.sort(
        (a, b) => (a.value > b.value ? 1 : b.value > a.value ? -1 : 0)
      )
    );

    const agencyElementsDesktop = [
      ...element.shadowRoot.querySelectorAll(
        "div.nds-grid.nds-grid.nds-p-around_small.nds-border_bottom > div"
      )
    ];
    expect(agencyElementsDesktop[0].textContent).toBe(firstAccred.accred);
    expect(agencyElementsDesktop[1].textContent).toBe(
      firstAccred.certificateNumber
    );
    expect(agencyElementsDesktop[2].textContent).toBe(
      firstAccred.effectiveDate.toString()
    );
    expect(agencyElementsDesktop[3].textContent).toBe(
      firstAccred.expirationDate.toString()
    );
    expect(agencyElementsDesktop[4].textContent).toBe(
      firstAccred.accreditationLevel
    );

    expect(select('p[data-id="compareHospitalUrl"]')).toBeDefined();

    expect(select('div[data-id="facilityNameMobile"]')?.textContent).toBe(
      memberfacilityDetailsIpResponse.facilityName
    );
    expect(select('div[data-id="facilityTypeMobile"]')?.textContent).toBe(
      omni.omniJsonData.selectedFacilityType
    );

    expect(select(`div[key="${firstAccred.ID}"]`)).toBeDefined();
    expect(select(`div[key="${secondAccred.ID}"]`)).toBeDefined();

    select('a[data-id="print"]').click();
    expect(global.window.print).toHaveBeenCalledTimes(1);
  });
});

import { LightningElement, api, track } from 'lwc';

export default class ServiceTypeIcon extends LightningElement {
    showGralIcons = false;
    showTelehealth = false;
    showCostCalculator = false;
    showForm = false;
    iconName;
    iconsTypeObj = {
        "Medical": "Doctor_Provider",
        "Hospital": "Hospital_Facility_Urgent_Care",
        "Dental": "Dental",
        "Vision": "Ophthalmology",
        "Pharmacy": "Pharmacy",
        "Calculator": "",
        "Telehealth": ""
    }

    @track
    _serviceType;

    @api
    get claimtype() {
        return this._serviceType;
    }
    set claimtype(val) {
        this._serviceType = val;
    }

    renderedCallback() {
        this.getServiceTypeIcon(this._serviceType);
    }

    getServiceTypeIcon(service) {
        if (service === "Calculator") {
            this.showCostCalculator = true;
        } else if (service === "Telehealth") {
            this.showTelehealth = true;
        } else if (service === "Form") {
            this.showForm = true;
        } else {
            this.iconName = this.iconsTypeObj[service];
            this.showGralIcons = true;
        }
    }
}
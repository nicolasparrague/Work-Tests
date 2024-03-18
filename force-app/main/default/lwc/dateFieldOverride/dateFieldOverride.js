import omniscriptDate from "omnistudio/omniscriptDate";
import template from './dateFieldOverride.html';
import { OmniscriptBaseMixin } from 'omnistudio/omniscriptBaseMixin';

export default class DateFieldOverride extends OmniscriptBaseMixin(omniscriptDate) {
    BadInputErrorMessage = 'Enter a valid value. Please use the format MM/DD/YYYY';
    handleBlur(evt) {
        if (evt.target.value === "") {
            this.applyCallResp(evt.target.value);
            Promise.resolve().then(() => {
                this.setElementValue(null, false, true);
                this.dispatchOmniEventUtil(this, this.createAggregateNode(), 'omniaggregate');
            });
        } else {
            this.applyCallResp(evt.target.value);
        }
    }

    get ariaLabel() {
        console.log("jsonDef: ", JSON.stringify(this.jsonDef));
        return 'test aria-label';
    }

    /*Employer portal addition*/
    get tenant() {
        return document.location.toString().includes("employer") ? "employer" : "member";
    }

    get isEmployerPortal() {
        return this.tenant === 'employer';
    }

    connectedCallback() {
        super.connectedCallback();

        if (this.isEmployerPortal) {
            const dateFormat = this.jsonDef.propSetMap.dateFormat.toUpperCase();
            this.BadInputErrorMessage = `Enter a valid value. Please use the format ${dateFormat}`;
        }
    }
    /*END Employer portal addition */

    render() {
        return template;
    }
}
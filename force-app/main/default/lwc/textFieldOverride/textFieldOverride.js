import { LightningElement } from 'lwc';
import omniscriptText from "omnistudio/omniscriptText";
import template from './textFieldOverride.html';
import pubsub from 'omnistudio/pubsub';
// import { get, cloneDeep } from "omnistudio/lodash";
import { api, track } from 'lwc';
import { OmniscriptBaseMixin } from 'omnistudio/omniscriptBaseMixin';

export default class TextFieldOverride extends OmniscriptBaseMixin(omniscriptText) {

    /**
     * This method is overriden as part of example for clearing the value if we delete the data from the field and the field is Required
     * The OOTB behaviour - This is intentionally done, we are keeping last successfully entered value to avoid loss of data
     * @param {*} evt 
     */
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

    render() {
        return template;
    }
}
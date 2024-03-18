import omniscriptEmail from "omnistudio/omniscriptEmail";
import template from './emailFieldOverride.html';
import { OmniscriptBaseMixin } from 'omnistudio/omniscriptBaseMixin';


export default class EmailFieldOverride extends OmniscriptBaseMixin(omniscriptEmail) {

        handleBlur(evt) {
            if(evt.target.value === "") {
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
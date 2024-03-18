import { LightningElement } from 'lwc';
import omniscriptTelephone from "omnistudio/omniscriptTelephone";
import template from './phoneFieldOverride.html';
import { OmniscriptBaseMixin } from 'omnistudio/omniscriptBaseMixin';

export default class PhoneFieldOverride extends OmniscriptBaseMixin(omniscriptTelephone) {
    
    
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
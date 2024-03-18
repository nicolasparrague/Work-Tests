import { LightningElement, track, api } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import pubsub from "omnistudio/pubsub";

export default class MemberNetworkName extends OmniscriptBaseMixin(LightningElement) {
    loading = true;
    jsonData;
    @api disabled = false;
    @track networkName = '';

    connectedCallback() {
        this.jsonData = JSON.parse(JSON.stringify(this.omniJsonData));
        this.register();
 
        if (this.jsonData) {
            this.loading = false;
        }
    }

    disconnectedCallback() {
        pubsub.unregister('selectPlanChanel', {
            selectPlan: this.handlePlanSelection.bind(this),
        });
    }

    register() {
        pubsub.register('selectPlanChanel', {
            selectPlan: this.handlePlanSelection.bind(this),
        });
    }

    handlePlanSelection(message) {
        this.networkName = message.selectedNetworkName;
    }
 }
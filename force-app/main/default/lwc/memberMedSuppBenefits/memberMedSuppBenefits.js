import { LightningElement, track, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { getDataHandler } from "omnistudio/utility";

export default class MemberMedSuppBenefits extends LightningElement {

    _basicbenefits;
    _additionalbenefits;

    @api
    get basicbenefits() {
       return this._basicbenefits;
    }
    set basicbenefits(value) {
       this._basicbenefits = value;
    }

    @api
    get additionalbenefits() {
       return this._additionalbenefits;
    }
    set additionalbenefits(value) {
       this._additionalbenefits = value;
    }


}
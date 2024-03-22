import { LightningElement, track, api } from 'lwc';
import { getDataHandler } from "omnistudio/utility";

export default class BenefitsDentalPlanBenefits extends LightningElement {

    @track loading;
    @track prevDiagnosticLabel;
    @track prevDiagnosticValue;

    @track basicDentalLabel;
    @track basicDentalValue;

    @track mcDentalServiceLabel;
    @track mcDentalServiceValue;

    @track orthodonticDentalLabel;
    @track orthodonticDentalValue;

    @track dentalServices = [];

    @track disclaimer = 'The information on this page provides highlights of the coverage only. ' +
    ' It is not a contract. Coverage is subject to your plan terms, including ' +
    ' exclusions and limitations. If there are any differences between the ' +
    ' information on this page and your official plan documents, the terms of ' +
    ' the plan documents will control.';
    @track dentalBenefits = [];
    @track limitBenefits;


    @track detail;
    @track limits;
    @track groups = [];

    errorMessage ='Error --> No data returned from IP'


    @api
    get planid() {
        return this._planid;
    }
    set planid(val) {
        this._planid = val;
    }

    @api
    get planname() {
        return this._planname;
    }
    set planname(val) {
        this._planname = val;
    }


    connectedCallback() {
        this.getDentalBenefits();
    }

    getDentalBenefits() {
        this.loading = true;
        let inputMap = {
            planId: this._planid,
            planName: this._planname
        };
        this.callIP("Member_DentalBenefits", inputMap).then((response) => {
            if(response.IPResult){
                this.dentalBenefits = response.IPResult.dental;
                this.limitBenefits = response.IPResult.limits;
                this.groupLimits(this.limitBenefits);
                this.loading = false;
            }else{
                console.error(`${this.errorMessage} Member_DentalBenefits`)
            }
            
        });

    }

    contains(arr, key, val) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i][key] === val) return true;
        }   
        return false;
    }

    groupLimits(limits){
        limits = JSON.parse(JSON.stringify(limits));
        let newGroup;
        let newElement = [];
        let items = [];
        let count = 0;
        limits.forEach((element, index)=>{
            if(!this.contains(this.groups, "group", element.group)){ // create new group
                let showTitle;
                if(element.group == 'N/A'){
                    showTitle = false;
                }else{
                    showTitle = true;
                }
                newGroup = { "key": count, 
                    "group": element.group, 
                    "showtitle": showTitle,
                    "items": [{"title": element.title, "limitLanguage": element.limitLanguage }]
                };
            
                this.groups.push(newGroup);
                count++;
            }else{ // add information in an existent group
                items = this.groups[count - 1].items;
                newElement = { "title": element.title, "limitLanguage": element.limitLanguage };
                items.push(newElement);
                this.groups[count - 1].items = items;
            }
        })
    }

    callIP(ipMethod, inputMap) {
        let datasourcedef = JSON.stringify({
            type: "integrationprocedure",
            value: {
                ipMethod: ipMethod,
                inputMap: inputMap,
                optionsMap: "",
            },
        });

        return getDataHandler(datasourcedef)
            .then((data) => {
                return JSON.parse(data);
            })
            .catch((error) => {
                console.error(`failed at getting IP data => ${JSON.stringify(error)}`);
            });
    }

}
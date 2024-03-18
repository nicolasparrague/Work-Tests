import { LightningElement, api, track } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import { NavigationMixin } from 'lightning/navigation';

export default class MemberReferralFooter extends OmniscriptBaseMixin(NavigationMixin(LightningElement)) {
    @track type;
    @track typeName;
    @track idCardUrl;
    @track grievancesUrl;
    @track memberid;
    @track
    hasRendered = false;
    showFooterMessage = false;
    @track showGrievancesLink = false;

    @api
    get type() {
        return this._type;
    }

    @api
    get memberid() {
        return this._memberid;
    }

    renderedCallback() {
        if (this.type == 'Referrals') {
            this.typeName = 'referrals';
        } else {
            if (this.type == 'PreAuthorizations') {
                this.typeName = 'Preauthorization';
            } else {
                if (this.type == 'DentalPreDetermination') {
                    this.typeName = 'dental predeterminations';
                }
            }
        }
        let pathName = window.location.href;
        let splitPathName = pathName.split('/');
        splitPathName.pop();
        splitPathName = splitPathName.join('/');
        this.idCardUrl = splitPathName + '/id-cards';
        if (!this.hasRendered) {
            this.showGrievancesLink = false;
            // call IP
            let params = {
                sClassName: "omnistudio.IntegrationProcedureService",
                sMethodName: "Member_Demography",
                options: "{}",
                input: {
                    memberId: this.memberid,
                }
            };

            this.omniRemoteCall(params, true).then((response) => {
                let memberType = response.result.IPResult.memberType;

                //change urls to what is needed
                let greviancesCommercial = 'https://www.google.com';
                let grieviancesMedicare = 'https://www.google.com';

                if (memberType == 'Commercial') {
                    this.grievancesUrl = greviancesCommercial;
                    this.showGrievancesLink = true;
                }

                if (memberType == 'Medicare') {
                    this.grievancesUrl = grieviancesMedicare;
                    this.showGrievancesLink = true;
                }

            })
            this.callApexMethod();
            this.hasRendered = true;
        }

    }

    callApexMethod(){
        // MPV-2548 - Verify FacetMemberStatus__c on User object
        const params = {
            input: { '': '' },
            sClassName: "Member_getCurrentUser",
            sMethodName: "getLoggedInMemberKID",
            options: "{}"
        };
        this.omniRemoteCall(params, true).then((response) => {
            let data = response.result;
            if (data.memberKID != null) {
                let memberStatus = data.memberKID.memberStatus;
                if(memberStatus == 'Pre-Effectuated' || memberStatus == 'Terminated' || memberStatus == null){
                    this.showFooterMessage = false;
                }else{
                    this.showFooterMessage = true;
                }
            }
        }).catch(error => {
            console.error("error while posting data", JSON.stringify(error));
        });
    }

    mobileNavigationIdCard() {
        this[NavigationMixin.Navigate]({
            "type": "standard__webPage",
            "attributes": {
                "url": this.idCardUrl
            }
        });
    }


}
import { LightningElement, track, api } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import { loadScript } from 'lightning/platformResourceLoader';

export default class MemberIdCardSelect extends OmniscriptBaseMixin(LightningElement) {
    @track askQuestionParams;
    memberId = '';
    planId = '';
    errorMsg = '';
    showNoUsersMsg = false;
    showCardList = false;
    @track members = [];
    @track isSubscriber = false;
    @track isReadOnly = true;
    @track subscriberId = '';
    @track selectedMember;
    @track selectedMemberId;
    @track loading = true;
    @track showCurrentTab = true;
    @track showFutureTab = false;
    @track currentPlans = [];
    @track futurePlans = [];
    @track planButtonClassesCurrent = 'nds-button nds-button_neutral nds-nowrap-whitespace active';
    @track planButtonClassesFuture = 'nds-button nds-button_neutral nds-nowrap-whitespace';
    memberMap = {};
    userId = '';
    @track hasUserId = false;

    empireCommercialPlans = [
        'MP001052',
        'MP001053',
        'MP001054'
    ];
    empireSeniorPlans = [
        'MP001055',
        'MP001056',
        'MP001058',
        'MP001059',
        'MP001060',
        'MP001062',
    ];

    get showCurrentBtn() {
        return this.currentPlans.length > 0;
    }

    get showFutureBtn() {
        return this.futurePlans.length > 0;
    }

    get isDisabled() {
        return this.isReadOnly;
    }

    get btnGroupClass() {
        return (document.documentElement.clientWidth <= 480) ? 'c-tab-button-group nds-size_12-of-12' : 'c-tab-button-group nds-size_12-of-12 nds-align_absolute-center';
    }

    get plansToShow() {
        if(this.showCurrentTab) {
            return this.currentPlans;
        }
        if(this.showFutureTab) {
            return this.futurePlans;
        }
    }

    connectedCallback() {
        loadScript(this, '../resource/pdfJSTable').then(() => {
            this.getMemberPlans();
        }).catch((error) => {
            console.log('error loading pdfJSTable:');
        });
        this.askQuestionParams = '{"origin":"idCard"}';
        this.currentSelected = "true";
    }

    handleMemberSelect(evt) {
        let id = evt.target.value;
        let memberDetails = this.memberMap[id];
        this.currentPlans = [...memberDetails.currentPlans];
        this.futurePlans =[...memberDetails.futurePlans];
        let memberObj = { 
            memberId: id, 
            planArr: this.plansToShow,
        };
        this.selectedMember = memberObj;
        this.selectedMemberId = id;
    }

    handleCurrentTabSelect() {
        this.planButtonClassesCurrent = 'nds-button nds-button_neutral nds-nowrap-whitespace active';
        this.planButtonClassesFuture = 'nds-button nds-button_neutral nds-nowrap-whitespace';
        this.showFutureTab = false;
        this.futureSelected = "false";
        this.showCurrentTab = true;
        this.currentSelected = "true";
        let memberObj = { memberId: this.selectedMemberId, planArr: this.plansToShow };
        this.selectedMember = memberObj;
    }

    handleFutureTabSelect() {
        this.planButtonClassesCurrent = 'nds-button nds-button_neutral nds-nowrap-whitespace';
        this.planButtonClassesFuture = 'nds-button nds-button_neutral nds-nowrap-whitespace active';
        this.showCurrentTab = false;
        this.currentSelected = "false";
        this.showFutureTab = true;
        this.futureSelected = "true";
        let memberObj = { memberId: this.selectedMemberId, planArr: this.plansToShow };
        this.selectedMember = memberObj;
    }

    getMemberPlans() {
        let params = {
            sClassName: "omnistudio.IntegrationProcedureService",
            sMethodName: "Member_FamilyDetails",
            options: "{}",
            input: {}
        };

        this.omniRemoteCall(params, true).then((response) => {
            if(!response.error) {
                let data = response.result.IPResult.IPResult;
                if(response.result.hasOwnProperty('error') && response.result.error == 'OK') {
                    let loggedInUser = data.loggedInUser;
                    if(data.hasOwnProperty('userId') && data.userId != '') {
                        this.userId = data.userId;
                        this.hasUserId = true;
                    }
                    data.plansInfo.forEach(member => {
                        // For each member, create relevant node and add to memberMap
                        let currArr = [];
                        let futureArr = [];
                        let detailsObj = {
                            name: member.memberName,
                            currentPlans: [],
                            futurePlans: [],
                        };

                        if(member.hasOwnProperty('memberPlans')) {
                            member.memberPlans.forEach(plan => {
                                let empireType = '';
                                if(this.empireCommercialPlans.includes(plan.planId)) {
                                    empireType = 'Commercial';
                                }
                                if(this.empireSeniorPlans.includes(plan.planId)) {
                                    empireType = 'Senior';
                                }
                                let planObj = { 
                                    planId: plan.planId, 
                                    planType: plan.planType,
                                    empireType: empireType, 
                                };
                                if(plan.status == 'Active') {
                                    currArr.push(planObj);
                                }
                                if(plan.status == 'Future Active') {
                                    futureArr.push(planObj);
                                }
                            });
                        }
                        detailsObj.currentPlans = [...currArr];
                        detailsObj.futurePlans = [...futureArr];

                        if(member.subscriberInd == 'Y' && member.memberId == loggedInUser) {
                            this.isSubscriber = true;
                            this.subscriberId = member.memberId;
                        }

                        // Populate memberMap with all members, and dropdown with non-terminated members
                        this.memberMap[member.memberId] = {...detailsObj};
                        if((currArr.length > 0) || (futureArr.length > 0)) {
                            this.members.push({ label: member.memberName, value: member.memberId });
                        }
                    });
                    // If user is a subscriber and has dependents, ensure dropdown is not read-only.
                    if(this.isSubscriber && this.members.length > 1) {
                        this.isReadOnly = false;
                    }
                    // If no users are in the dropdown, show error message
                    // Note: Should not be seen ever, since terminated users should not be able to navigate to the ID Card page, but just in case something bugs out
                    if(this.members.length > 0) {
                        this.showCardList = true;
                    } else {
                        this.errorMsg = 'No active or future-active plans were found.';
                        this.showNoUsersMsg = true;
                    }

                    // If subscriber is present, select them. Otherwise select dependent.
                    if(this.isSubscriber && this.subscriberId != '') {
                        let evt = { target: { value: this.subscriberId } };
                        this.handleMemberSelect(evt);
                    } else {
                        let evt = { target: { value: loggedInUser } };
                        this.handleMemberSelect(evt);
                    }
                    // If no current plans exist, show Future Plans tab onload instead.
                    if(this.currentPlans.length == 0) {
                        this.handleFutureTabSelect();
                    }
                    this.loading = false;
                } else {
                    console.error(`IP Member_FamilyDetails responded with error code ${data.info.statusCode} ${data.info.status}`);
                    this.errorMsg = `An error occured when getting your member information, please try again later.`;
                    this.errorDetails = `Error Code: ${data.info.statusCode} ${data.info.status}`
                    this.showErrorMsg = true;
                }
            } else {
                console.error('Could not call IP Member_FamilyDetails, returned with error.');
                console.log(response);
                this.errorMsg = 'An error occured when getting your member information, please try again later.';
                this.showErrorMsg = true;
            }
        }).catch((error) => {
            console.error('Error when calling omniRemoteCall for Member_FamilyDetails:');
            if(error) {
                console.log(error);
            } else {
                console.error('Unknown error.');
            }
            this.errorMsg = 'An error occured when getting your member information, please try again later.';
            this.showErrorMsg = true;
            this.loading = false;
        });
    }
}
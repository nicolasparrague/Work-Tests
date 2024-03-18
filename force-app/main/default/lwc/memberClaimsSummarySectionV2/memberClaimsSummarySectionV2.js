import { LightningElement, api, track } from 'lwc';
import pubsub from "omnistudio/pubsub";
import { getDataHandler } from "omnistudio/utility";
import { loadCssFromStaticResource } from 'omnistudio/utility';

const options = [
    {
        value: 'Option 1',
        label: 'Option 1'
    },
    {
        value: 'Option 2',
        label: 'Option 2'
    },
    {
        value: 'Option 3',
        label: 'Option 3'
    },
];

export default class MemberClaimsSummarySectionV2 extends LightningElement {
    loading;
    _decryptedParams;
    showClaims;
    showFilters;
    showProvAndFacOption;
    showCustomDateRange;
    pubSubObj;
    _memberId;
    claimsTableStructure;
    today;
    uiCustomDateFrom;
    isAscending;
    fromDateMessage;
    toDateMessage;

    @api
    ariaLabel;

    @api
    ariaLabelCombobox;

    @track readonly= "false";

    options = options;
    selectedOptionValue;
    selectedOptionLabel;


    exportToExcelClaimsData = [];

    providersAndFacilities = [];
    claimTypesOptions = [];
    claimTypeOrder = ["Medical", "Hospital", "Dental", "Pharmacy"];

    claimStatusOptions = [
        { "label": "All", "value": "all" },
        { "label": "Finalized", "value": "Finalized" },
        { "label": "In Process", "value": "In Process" }
    ];

    claimDateRangeOptions = [
        { "label": "All", "value": "last24Months" },
        { "label": "Year to date", "value": "yearToDate" },
        { "label": "Last 12 months", "value": "priorYear" },
        { "label": "Custom", "value": "customDateRange" }
    ];

    //Defult Filter Object 
    filterObject = {
        'providerName': 'All',
        'claimType': 'all',
        'claimStatus': 'all',
        'serviceStartDate': 'last24Months',
        'customDateRange': {
            'show': false,
            'from': '',
            'to': ''
        }
    };

    sortMap = {
        SortingDate: "serviceStartDate",
        SortingProvider: "providerName"
    };

    sortOptions = [
        {
            key: "B002",
            value: "SortingProvider",
            label: "Provider or Facility",
            ascendingDirection: false,
            showBadge: false
        },
        {
            key: "B001",
            value: "SortingDate",
            label: "Service date",
            ascendingDirection: false,
            showBadge: true
        }
    ];

    // Default Sort Object
    sortObject = {
        'sortType': 'SortingDate',
        'ascendingDirection': false
    }

    pagerObject = {
        'firstEle': 0,
        'lastEle': 9,
        'currentPage': 1
    }

    claimsTracked = [];

    get currentlyShown() {
        if (this.claimsTracked) {
            let dataSlice = this.claimsTracked.slice(this.pagerObject.firstEle, (this.pagerObject.lastEle + 1));
            return dataSlice;
        }
        return [];
    }

    get isMemberSet() {
        return !!this._memberId;
    }




    connectedCallback() {

        let completeURL = '/assets/styles/vlocity-newport-design-system-scoped.min.css';

        loadCssFromStaticResource(this, 'newportAttentisAlt', completeURL).then(resource => {
           console.log(`Theme loaded successfully`);
        }).catch(error => {
           console.log(`Theme failed to load => ${error}`);
        });

        console.info("Claims ConnectedCallback");
        this.readonly = true;
        this.searchable = true;
        this.dataShowLookup = "true";
        
        if (document.documentElement.clientWidth < 768) {
            this.pagerObject.firstEle = 0;
            this.pagerObject.lastEle = 4;
        }



        if (this.getQueryParameters().param1 == "1") {
            this.loadConfigurationFromSession();
        }

        this.today = new Date();

        // Export to Excel configuration
        this.claimsTableStructure = {
            "header": [
                [
                    "Claim Type",
                    "Provider or Facility",
                    "Service Start Date",
                    "Claim Number",
                    "Billed Amount",
                    "Your Share",
                    "Claim Status"
                ]
            ],
            "fields": [
                'claimType',
                'providerName',
                'serviceStartDate',
                'claimNumber',
                'billedAmount',
                'youPay',
                "claimStatus"
            ],
            "types": ['text', 'text', 'date', 'number', 'currency', 'currency', 'text']
        };

        this.pubSubObj = {
            memberSelectionAction: this.getClaimsByMembers.bind(this)
        }
        this.pubSubObjProviderAndFacilities = {
            providerNameSelectionAction: this.handleProviderAndFacilitiesChange.bind(this)
        }
        this.pubsubTooltipObj = {
            showPrivacyTooltipAction: this.showTooltipMethod.bind(this)
        }

        this.referringAriaLabel = "Provider or Facility";
        this.referringAriaCombobox = "Provider or Facility combobox"

        pubsub.register('MemberSelection', this.pubSubObj);
        pubsub.register("ProviderNameSelection", this.pubSubObjProviderAndFacilities);
        pubsub.register("ShowPrivacyTooltip", this.pubsubTooltipObj);

        this.viewClaimsWithinArrayType = [
            { id: "01", value: "all", label: "All", key: "All", checked: "checked" },
            { id: "02", value: "Medical", label: "Medical", key: "Medical" },
            { id: "03", value: "Hospital", label: "Hospital", key: "Hospital" }
        ];

        this.viewClaimsWithinArrayStatus = [
            { id: "101", value: "all", label: "All", key: "All", checked: "checked" },
            { id: "102", value: "Finalized", label: "Finalized", key: "Finalized" },
            { id: "103", value: "In process", label: "In Process", key: "In Process" }
        ];

        this.viewClaimsWithinArrayDate = [
            { id: "201", value: "last24Months", label: "All", key: "Last 24 months", checked: "checked" },
            { id: "202", value: "yearToDate", label: "Year to Date", key: "Year-to-date" },
            { id: "203", value: "priorYear", label: "Last 12 Months", key: "Prior year" },
            { id: "204", value: "customDateRange", label: "Custom", key: "Custom date range" }
        ];

    }

    getQueryParameters() {
        var params = {};
        var search = location.search.substring(1);
        if (search) {
            params = JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}', (key, value) => {
                return key === "" ? value : decodeURIComponent(value)
            });
        }

        return params;
    }

    handleOptionChange(event) {
        this.selectedOptionValue = event.detail.value;
        this.selectedOptionLabel = event.detail.label;
    }


    loadConfigurationFromSession() {
        if (sessionStorage.getItem('claimsFilter')) {
            this.filterObject = JSON.parse(sessionStorage.getItem('claimsFilter'));
            this.showCustomDateRange = this.filterObject.customDateRange.show;
        }

        if (sessionStorage.getItem('claimsSort')) {
            this.sortObject = JSON.parse(sessionStorage.getItem('claimsSort'));
        }

        if (sessionStorage.getItem('claimsPage')) {
            this.pagerObject = JSON.parse(sessionStorage.getItem('claimsPage'));
        }
    }

    getClaimsByMembers(member) {
        console.info("Member LOBD_MCTR:", member);
        let inputMap = {
            "memberId": member.memberId,
        };

        this.getClaims('Member_ClaimsSearchByMember', inputMap).then(data => {
            console.log('Data from Member_ClaimsSearchByMember');
            this._memberId = {
                "memberId": member.memberId || '',
                "isLoggedIn": member.selectedMemberIsSignedInUser || '',
                "memberType": data.IPResult.memberType || '',
                "brand": data.IPResult.brand || '',
                "networkCode": member.activePlanNetworkCode || ''
            };
            // Watch Video Show based on (Brand=> HIP + LOBD_MCTR => 1001)
            this.claimsTracked = JSON.parse(JSON.stringify(data.IPResult.claimsList));


            // Filtering Sensitive Service data
            if (member.selectedMemberIsSignedInUser == "No") {
                this.claimsTracked = this.claimsTracked.map(claim => {
                    if (claim.sensitiveService == "Yes") {
                        claim.providerName = "";
                    }
                    return claim;
                });
            }


            let newClaims = [];
            this.claimsTracked.forEach(element => {
                element.lobdMCTR = member.LOBD_MCTR;
                newClaims.push(element);
            });
            this.claimsTrackedFiltered = newClaims;

            // this.claimsTracked = JSON.parse(JSON.stringify(data.IPResult.claimsList));
            // this.claimsTrackedFiltered = this.claimsTracked;
        
            // Populate Provider and Facilities options list
            this.generateProviderAndFacilitiesNameOptionList();
        
            // Populate Claim Type options list
            this.generateClaimTypeOptionList();
        
            // Apply default filter
            this.applyFilter();

            // this.showClaims = true;
            // this.loading = false;
        });
    }

    getClaims(ipMethod, inputMap) {
        this.loading = true;
        let datasourcedef = JSON.stringify({
            "type": "integrationprocedure",
            "value": {
                "ipMethod": ipMethod,
                "inputMap": inputMap,
                "optionsMap": ""
            }
        });

        return getDataHandler(datasourcedef).then(data => {
            let newData = JSON.parse(data);

            if (!newData.IPResult.claimsList && !newData.IPResult.claimsList.length) {
                this._showNoRecordsMessage = true;
            }

            return newData;

        }).catch(error => {
            console.error(`failed at getting IP data => ${JSON.stringify(error)}`);
            this._showNoRecordsMessage = true;
            this.loading = false;
        });
    }

    showTooltipMethod(showTooltip) {
        this._showPrivacyTooltip = showTooltip.showTooltip;
    }

    generateProviderAndFacilitiesNameOptionList() {
        this.claimsAndProvs = [...this.claimsTracked];
        const mappedUniqueObjects = this.claimsAndProvs.map(item => { return { "key": item.providerName, "label": item.providerName, "value": item.providerName } });
        this.providersAndFacilities = mappedUniqueObjects.filter((v, i, a) => a.findIndex(t => (t.value === v.value)) === i);
        this.providersAndFacilities.unshift({ "label": "All", "value": "all", "key": "all" });

        let column = "label";
        this.providersAndFacilities.sort((a, b) => {
            var colA = a[column] ? a[column].toUpperCase() : "";
            var colB = b[column] ? b[column].toUpperCase() : "";

            if (colA < colB) {
                return -1;
            }
            if (colA > colB) {
                return 1;
            }
            return 0;
        });
        this.showProvAndFacOption = true;
    }

    generateClaimTypeOptionList() {
        const mappedClaimTypesOptions = this.claimsTrackedFiltered.map(item => { return { "label": item.claimType, "value": item.claimType } });
        this.claimTypesOptions = mappedClaimTypesOptions.filter((v, i, a) => a.findIndex(t => (t.value === v.value)) === i);
        this.claimTypesOptions.unshift({ "label": "All", "value": "all" });
    }

    handlePagerChange(evt) {
        let pageConfig = evt.detail || evt;
        this.asignPage(pageConfig.firstEle, pageConfig.lastEle, pageConfig.currentPage);
    }

    asignPage(pagerFirstEle, pagerLastEle, currentPage) {
        window.scrollTo(0, 0);
        this.showList = false;
        this.loading = true;
        this.pagerObject.firstEle = pagerFirstEle;
        this.pagerObject.lastEle = pagerLastEle;
        this.pagerObject.currentPage = currentPage;

        sessionStorage.setItem('claimsPage', JSON.stringify(this.pagerObject));

        setTimeout(() => {
            this.loading = false;
            this.showList = true;
        });
    }

    resetPager() {
        let lastElement = document.documentElement.clientWidth < 768 ? 4 : 9;
        this.asignPage(0, lastElement, 1);
    }

    handleProviderAndFacilitiesChange(value) {
        this.filterObject.providerName = value.providerLabel;
    }

    handleRadioButton(evt) {
        this.filterObject[evt.target.name] = evt.target.value;

        // console.log(JSON.stringify(this.filterObject), evt.target.value, evt.target.name)


        if (evt.target.name == 'serviceStartDate' && evt.target.value == 'customDateRange') {
            this.filterObject.customDateRange.show = this.showCustomDateRange = true;
        } else {
            this.filterObject.customDateRange.show = this.showCustomDateRange = false;
        }

        
        if(evt.target.name == 'claimType'){
            this.viewClaimsWithinArrayType.forEach((vrw) => {
                if (vrw.value ==  evt.target.value) {
                    vrw.checked = "checked";
                } else {
                    vrw.checked = "";
                }
            });
        }else if (evt.target.name == 'claimStatus'){
            this.viewClaimsWithinArrayStatus.forEach((vrw) => {
                if (vrw.value ==  evt.target.value) {
                    vrw.checked = "checked";
                } else {
                    vrw.checked = "";
                }
            });
        }else if (evt.target.name == 'serviceStartDate'){
            this.viewClaimsWithinArrayDate.forEach((vrw) => {
                if (vrw.value ==  evt.target.value) {
                    vrw.checked = "checked";
                } else {
                    vrw.checked = "";
                }
            });
        }
        
    }

    setCustomDate(evt) {
        let thisYear = this.today.getFullYear();
        if (evt.target.name == 'from') {
            this.fromDateMessage = !!!evt.target.value || new Date(evt.target.value.replace(/-/g, '\/')) > this.today || new Date(evt.target.value.replace(/-/g, '\/')) < new Date(thisYear - 2, this.today.getMonth(), this.today.getDate());
            this.uiCustomDateFrom = evt.target.value;

        } else if (evt.target.name == 'to') {
            this.toDateMessage = !!!evt.target.value || new Date(evt.target.value.replace(/-/g, '\/')) < new Date(this.filterObject.customDateRange.from) || new Date(evt.target.value.replace(/-/g, '\/')) > this.today;
            
        }
        // this.filterObject.customDateRange[evt.target.name] = evt.target.value;

        // let date1 = new Date(this.fromDateSelected.replace(/-/g, '\/'));
        // let date2 = new Date(this.toDateSelected.replace(/-/g, '\/'));

        this.filterObject.customDateRange[evt.target.name] = evt.target.value ? new Date(evt.target.value.replace(/-/g, '\/')) : '';
        console.log('this.filterObject.customDateRange[evt.target.name] ', this.filterObject.customDateRange[evt.target.name] );
        
    }

    applyFilter(evt) {
        this.loading = true;
        this.showList = false;
        this.showClaims = false;
        this.showProvAndFacOption = false;

        let filterObj = this.filterObject;
        let today = this.today;


        let _compareFilterWithClaims = this.compareFilterWithClaims;

        this.claimsTracked = this.claimsTrackedFiltered.filter(
            function (claim) {
                for (let key in filterObj) {
                    if (key == 'customDateRange') {
                        break;
                    }
                    // console.log('laposta', claim[key], filterObj[key], today, filterObj)
                    if (filterObj[key].toLowerCase() != 'all' && _compareFilterWithClaims(claim[key], filterObj[key], today, filterObj)) {
                        return false;
                    }
                }
                return true;
            }
        );
        
        this.sortBy(this.sortObject.sortType);
        if (evt && evt.target.type) {
            this.resetPager();
        }

        // Save on session storage for preserve filters
        sessionStorage.setItem("claimsFilter", JSON.stringify(this.filterObject));
        setTimeout(() => {
            this.showClaims = true;
            this.showList = true;
            this.showFilters = true;
            this.showProvAndFacOption = true;
            this.loading = false;
        });
    }

    compareFilterWithClaims(claimValue, filterObjValue, today, filterObject) {
        let thisYear = today.getFullYear();

        switch (filterObjValue) {
            case 'yearToDate': // Year To Date
                return thisYear != new Date(claimValue).getFullYear();

            case 'priorYear': // Last 12 Months
                let startDatePriorYear = new Date(thisYear - 1, today.getMonth(), today.getDate());
                // return (thisYear - 1) != new Date(claimValue).getFullYear();
                return !(new Date(claimValue) >= startDatePriorYear && new Date(claimValue) <= today);

            case 'last24Months': // ALL
                let startDateAll = new Date(thisYear - 2, today.getMonth(), today.getDate());
                return !(new Date(claimValue) >= startDateAll && new Date(claimValue) <= today);

            case 'customDateRange': // Custom Date Range
                let fromDate = new Date(filterObject.customDateRange.from);
                let toDate = new Date(filterObject.customDateRange.to);


                if (filterObject.customDateRange.from == '' || filterObject.customDateRange.from == null) {
                    let twoYearsAgo = new Date(thisYear - 2, today.getMonth(), today.getDate());
                    filterObject.customDateRange.from = twoYearsAgo;
                }
                if (filterObject.customDateRange.to == '' || filterObject.customDateRange.to == null) {
                    filterObject.customDateRange.to = today;
                }

                return !(new Date(claimValue) >= fromDate && new Date(claimValue) <= toDate);

            default:
                return claimValue != filterObjValue;
        }
    }

    handleSortBy(evt) {
        evt.stopPropagation();
        if (this.sortObject.sortType == evt.target.getAttribute("data-badge-value")) {
            this.sortObject.ascendingDirection = !this.sortObject.ascendingDirection;
        }

        this.sortObject.sortType = evt.target.getAttribute("data-badge-value");
        this.sortBy(this.sortObject.sortType);
        // this.closeSortDropdown();
    }

    triggerFilter(evt) {
        if (evt.target.getAttribute("data-type") == 'open') {
            this.template.querySelector('.c-filter_dropdown').classList.remove("c-hide_small");
            this.template.querySelector('.claimsSection').classList.add("extra-margin-bottom");
        } else if (evt.target.getAttribute("data-type") == 'close') {
            this.template.querySelector('.c-filter_dropdown').classList.add("c-hide_small");
            this.template.querySelector('.claimsSection').classList.remove("extra-margin-bottom");
        }
    }

    openSortDropdown() {
        this.template.querySelector(".sort_list").classList.remove("nds-hide");
        let sortClaims = this.template.querySelector(".sortClaims");
        sortClaims.setAttribute('aria-expanded', 'true');
    }

    closeSortDropdown() {
        this.template.querySelector(".sort_list").classList.add("nds-hide");
        let sortClaims = this.template.querySelector(".sortClaims");
        sortClaims.setAttribute('aria-expanded', 'false');
        sortClaims.focus();
    }

    sortBy(sortType) {
        this.loading = true;
        this.showList = false;

        let sortCol = this.sortMap[sortType];
        let sortDirection = this.sortObject.ascendingDirection;

        if (this.claimsTracked.length > 1) {
            if (sortType === "SortingDate") {
                this.claimsTracked.sort((a, b) => {
                    const colA = new Date(a[sortCol]);
                    const colB = new Date(b[sortCol]);
                    if (!sortDirection) { // DESC
                        return colB - colA;
                    } else if (sortDirection) { // ASC
                        return colA - colB;
                    } else {
                        return 0;
                    }
                });
            } else {
                this.claimsTracked.sort((a, b) => {
                    var colA = a[sortCol] ? a[sortCol].toUpperCase() : "";
                    var colB = b[sortCol] ? b[sortCol].toUpperCase() : "";

                    if (colA < colB) {
                        return sortDirection ? -1 : 1;
                    }
                    if (colA > colB) {
                        return sortDirection ? 1 : -1;
                    }
                    return 0;
                });
            }

            this.claimsTracked.sort((a, b) => {
                let dateA = new Date(a.serviceStartDate);
                let dateB = new Date(b.serviceStartDate);
                if (dateA.getTime() == dateB.getTime()) {
                    return (this.claimTypeOrder.indexOf(a.claimType) - this.claimTypeOrder.indexOf(b.claimType));
                }
            });
        }

        // Handle show badges
        for (let i = 0; i < this.sortOptions.length; i++) {

            if (this.sortOptions[i].value == sortType) {
                this.sortOptions[i].ascendingDirection = this.sortObject.ascendingDirection;
                this.sortOptions[i].showBadge = true;
            } else {
                this.sortOptions[i].ascendingDirection = !this.sortObject.ascendingDirection;
                this.sortOptions[i].showBadge = false;
            }
        }

        // Save on session storage for preserve sorting
        sessionStorage.setItem("claimsSort", JSON.stringify(this.sortObject));

        setTimeout(() => {
            this.showList = true;
            this.loading = false;
        });
    }

    clearFilters() {
        this.showFilters = false;

        this.filterObject.providerName = 'All';
        this.filterObject.claimType = 'all';
        this.filterObject.claimStatus = 'all';
        this.filterObject.serviceStartDate = 'last24Months';
        this.filterObject.customDateRange.from = '';
        this.filterObject.customDateRange.to = '';
        this.uiCustomDateFrom = '';

        this.fromDateMessage = false;
        this.toDateMessage = false;

        this.filterObject.customDateRange.show = this.showCustomDateRange = false;

        this.applyFilter();
        this.resetPager();
    }

    disconnectedCallback() {
        pubsub.unregister('MemberSelection', this.pubSubObj);
        pubsub.unregister('MemberSelection', this.pubSubObjProviderAndFacilities);
        pubsub.unregister("ShowPrivacyTooltip", this.pubsubTooltipObj);
    }
}
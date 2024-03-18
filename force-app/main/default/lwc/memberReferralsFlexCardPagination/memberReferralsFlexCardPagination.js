import { api, LightningElement, track } from 'lwc';
import { getPagesOrDefault, handlePagerChanged } from "c/pagerUtils";
import { getDataHandler } from "omnistudio/utility";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import pubsub from "omnistudio/pubsub";

export default class MemberReferralsFlexCardPagination extends OmniscriptBaseMixin(LightningElement) {


    getPagesOrDefault = getPagesOrDefault.bind(this);
    handlePagerChanged = handlePagerChanged.bind(this);
    showList;
    @track loading = true;
    _showNoRecordsMessage;
    // invoiceTableStructure;
    // paymentTableStructure;
    //sortIdNum;
    //sortOptions;
    //sortMap;
    @api
    showReferrals = false;
    @api
    showPreAuthorizations = false;
    @api
    showDentalPreDetermination = false;
    /*
        @api
        showPayment;
        @api
        showInvoice;
        @api
        selectedSortId;
        @api
        sortDirection;
        @api
        selectedSort;
    */
    @api
    historyType;
    @api
    brand;
    tabType;
    //@track
    //memberId;    
    @track
    _memberId;
    @track
    dataloaded = true;
    @api
    get memberid() {
        return this._memberId;
    }
    set memberid(val) {
        this._memberId = val;
    }

    @api
    get selectedViewNumber() {
        return (document.documentElement.clientWidth < 768) ? 5 : 10;
    }
    

    get memberId() {
        return this._memberId;
    }

    @track
    paginatedRecords = [];

    @track
    paginatedRecordsPre = [];

    @track
    paginatedRecordForCombo;
    @track pagerLastEle = 9;

    // @track
    // selectedViewNumber;
    @track
    pagerTotalEle = 0;
    @track
    pagerFirstEle = 0;
    //@track
    //hasRendered = false;
    @track
    defaultValueCombo = "All";
    // @track referringAriaLabel = "Referring Provider";
    // @track servicingAriaLabel = "Servicing Provider or Facility";
    // @track exportToExcelAriaLabel = "Export To Excel";


    getDate() {
        var date = new Date();
        var result = date.toLocaleDateString("en-US", { // you can use undefined as first argument
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });

        return result
    }
    getTwoYearsAgoDate() {
        var date = new Date();
        date.setFullYear(date.getFullYear() - 2);
        var result = date.toLocaleDateString("en-US", { // you can use undefined as first argument
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });

        // result.setFullYear(result.getFullYear() - 2);
        return result
    }


    get currentlyShown() {
        if (this.paginatedRecords) {
            let dataSlice = this.paginatedRecords.slice(this.pagerFirstEle, (this.pagerLastEle + 1));
            return dataSlice;
        }
        return [];
    }

    // *************************** MPV-264, MPV-266, MPV-268 ***************************
    // *********************************************************************************
    // *********************************************************************************
    // *********************************************************************************
    @api
    arrayReferringProvs = [];
    @api
    referringList = [];
    @api
    arrayServicingProvs = [];
    @api
    servicingList = [];
    showCombo = true;
    @api
    valueAllReferring;
    @api
    showCards;
    @api
    comboInUse;
    @track
    provider;

    @track
    tempInput;

    @track
    referringProviderArray = [];
    @track
    dateChangeArray = [];
    @track
    servicingProviderArray = [];
    @track
    headerForDates;

    showReferringProvider;
    @track
    viewReferralsWithinArray = [];
    radioSelected;
    @track
    defaultValueSPF = "All";
    @track
    defaultValueRPN = "All";
    @api
    referralsTableStructure;
    @api
    fileName;

    @track
    ipStructure;
    @track
    ipNode;

    disabledApplyFilters = false;

    /** Variables for Custom Date Range */
    customDateRange = false;
    fromDateSelected = null;
    toDateSelected = null;
    today;
    minDateForTo;
    validFromDate = false;
    validToDate;

    fromDateMessage;
    toDateMessage;

    @track valueFrom; //MPV-1159
    @track valueTo; //MPV-1159

    // ********* Filter and Sorting

    @api sorting;
    @api ordering;
    @track indicator = null;
    @track servicingProvFac = null;
    @track referringProv = null;
    @track today;
    @track twoYearsFromNow;

    /******************** SORT ***********************/

    sortIdNum;
    @api
    sortOptions;
    @api
    sortMap;

    @api
    selectedSortId;
    @api
    sortDirection;
    @api
    selectedSort;

    sortLabel;

    @api
    ariaLabelCombobox;


    // *********************************************************************************
    // *********************************************************************************
    // *********************************************************************************



    connectedCallback() {
        // If running on mobile, default to 5 per page
        if (document.documentElement.clientWidth < 768) {
            this.pagerFirstEle = 0;
            this.pagerLastEle = 4;
        }

        if (this.historyType == 'DentalPreDetermination') {
            this.tabType = "DentalPreDetermination";
            this.showDentalPreDetermination = true;
            this.showReferringProvider = false; //MPV-264 Hide Referring Combo
            //MPV-1061 : Change Header Label
            this.headerForDates = "Date";

            this.fileName = "Dental_Predetermination";
            this.indicator = null;

            // Export to Excel configuration - Preauthorizations
            this.referralsTableStructure = {
                "header": [
                    [
                        "Reference ID",
                        "Servicing Provider or Facility",
                        "Date Issued"
                    ]
                ],
                "fields": [
                    'referralId',
                    'servicingProvider',
                    'dateIssued'
                ]
            };

            this.sortLabel = "Date Issued";
        }
        else if (this.historyType == 'Referral') {
            this.tabType = "Referral";
            this.showReferrals = true;
            this.showReferringProvider = true; //MPV-264 Show Referring Combo
            this.headerForDates = "Date";
            this.indicator = "Referral";

            this.fileName = "Referrals";


            // Export to Excel configuration - Referrals
            this.referralsTableStructure = {
                "header": [
                    [
                        "Referral ID",
                        "Referring Provider",
                        "Servicing Provider or Facility",
                        "Service Type",
                        "From",
                        "To",
                        "Visits/Services"
                    ]
                ],
                "fields": [
                    'referralId',
                    'referringProvider',
                    'servicingProviderFacility',
                    'serviceType',
                    'dateFrom',
                    'dateTo',
                    'visits'
                ]
            };
            this.sortLabel = "Start Date From";
        }
        else if (this.historyType == 'Pre-Authorization') {
            this.tabType = "Pre-Authorization";
            this.showPreAuthorizations = true;
            this.showReferringProvider = false; //MPV-264 Hide Referring Combo
            this.headerForDates = "Date";
            this.indicator = "Pre-Authorization";

            this.fileName = "Preauthorizations";

            // Export to Excel configuration - Preauthorizations
            this.referralsTableStructure = {
                "header": [
                    [
                        "Reference ID",
                        "Servicing Provider or Facility",
                        "Service Type",
                        "From",
                        "To",
                        "Visits/Services",
                        "Status"
                    ]
                ],
                "fields": [
                    'referralId',
                    'servicingProviderFacility',
                    'serviceType',
                    'dateFrom',
                    'dateTo',
                    'visits',
                    'status'
                ]
            };

            this.sortLabel = "Start Date From";
        }

        //*********************************************  MPV-264, MPV-266, MPV-268
        this.comboInReferring = "Referring";
        this.comboInServicing = "Servicing";
        // MPV-1061 : Label change and rearranging sequence.
        // this.viewReferralsWithinArray = [
        //     {id: "01", value: "yearToDate", label: "Year-to-date", key: "Year-to-date", checked: "checked"},
        //     {id: "02", value: "priorYear", label: "Prior year", key: "Prior year"},
        //     {id: "03", value: "last24Months", label: "Last 24 months", key: "Last 24 months"},
        //     {id: "04", value: "customDateRange", label: "Custom date range", key: "Custom date range"}
        // ];
        this.viewReferralsWithinArray = [
            { id: "01", value: "last24Months", label: "All", key: "Last 24 months", checked: "checked" },
            { id: "02", value: "yearToDate", label: "Year to Date", key: "Year-to-date" },
            { id: "03", value: "priorYear", label: "Last 12 Months", key: "Prior year" },
            { id: "04", value: "customDateRange", label: "Custom", key: "Custom date range" }
        ];

        // ******************** Provider or Facility
        pubsub.register("ProviderNameSelection", {
            providerNameSelectionAction: this.getProviderOrFacility.bind(this)
        });

        pubsub.register("combo", {
            comboAction: this.combo.bind(this)
        });


        //Get Today's date
        this.today = new Date();
        var ddmap = String(this.today.getDate()).padStart(2, "0");
        var mmmap = String(this.today.getMonth() + 1).padStart(2, "0"); //January is 0!
        var yyyymap = this.today.getFullYear();
        this.today = mmmap + "/" + ddmap + "/" + yyyymap;

        //Get Two years from today's date
        this.twoYearsFromNow = new Date(this.today);
        var ddM2 = String(this.twoYearsFromNow.getDate()).padStart(2, "0");
        var mmmM2 = String(this.twoYearsFromNow.getMonth() + 1).padStart(2, "0"); //January is 0!
        var yyyyMinusTwo = this.twoYearsFromNow.getFullYear() - 2;
        var yyyyMinusOne = this.twoYearsFromNow.getFullYear() - 1;

        this.twoYearsFromNow = mmmM2 + "/" + ddM2 + "/" + yyyyMinusTwo;
        this.oneYearFromNow = mmmM2 + "/" + ddM2 + "/" + yyyyMinusOne;

        //Get prior year from today's date
        this.priorYearStartDate = new Date(this.today);
        var yyyySD = this.priorYearStartDate.getFullYear() - 1;

        this.priorYearStartDate = "01" + "/" + "01" + "/" + yyyySD;
        this.priorYearEndDate = "12" + "/" + "31" + "/" + yyyySD;

        this.sDate = "01" + "/" + "01" + "/" + yyyymap;
        this.eDate = this.today;

        // this.startDate = this.twoYearsFromNow;
        // this.endDate = this.today;

        this.startDate = this.twoYearsFromNow;;
        this.endDate = this.eDate;
        //this.memberId = "K8008481202";
        this.sorting = "startDate";
        this.ordering = "desc";


        // sorting configuration
        this.selectedSort = "SortingDate";
        this.sortDirection = "DESC";

        this.sortMap = {
            SortingDate: "dateFrom"
        };
        this.sortOptions = [
            {
                key: "B001",
                ascBadgeId: "B001-ASC",
                descBadgeId: "B001-DESC",
                value: "SortingDate",
                label: this.sortLabel
            }
        ];

        this.sortMoOptions = [
            {
                key: "B002M",
                ascBadgeId: "B002M-ASC",
                descBadgeId: "B002M-DESC",
                label: this.sortLabel,
                value: "SortingDate",
            }
        ];
        //

        //*********************************************  MPV-264, MPV-266, MPV-268

        let input = {
            memberId: this.memberId,
            //memberId: 'K8008481202',
            from: this.pagerFirstEle,
            size: this.selectedViewNumber,
            startDate: this.twoYearsFromNow, // MPV-940
            endDate: this.eDate, // MPV-940
            indicatorType: this.indicator,
            servicingProviderFacility: this.servicingProvFac,
            referringProvider: this.referringProv
        }

        let inputReferringCombo = {
            memberId: this.memberId,
            indicatorType: this.indicator,
            servicingProviderFacility: this.servicingProvFac,
            referringProvider: this.referringProv,
            startDate: this.twoYearsFromNow,
            endDate: this.eDate
        }

        // let memberIdParent = { memberIdBenefit: this.memberId };
        // pubsub.fire("MemberParentId", "MemberParent", memberIdParent);

        this.tempInput = input;
        this.initialLoad = true;
        this.getData(input);
        // this.getDataToExcel(input); //
        this.getProviderList(inputReferringCombo);

        this.referringAriaLabel = "Referring Provider";
        this.servicingAriaLabel = "Servicing Provider or Facility";
        this.exportToExcelAriaLabel = "Export To Excel";

        this.referringAriaCombobox = "Referring Provider combobox";
        this.servicingAriaCombobox = "Servicing Provider or Facility combobox"
    }

    getData(input) {

        this._mId = {
            "memberId": this.memberId,
            "brand": this.brand
        };

        this.loading = true;
        let methodName = "Member_Referrals";
        if (this.historyType == 'DentalPreDetermination') {
            methodName = "Member_DentalPreDeterminations";
        }

        let params = {
            sClassName: "omnistudio.IntegrationProcedureService",
            sMethodName: methodName,
            options: "{}",
            input: input
        }
        if (this.historyType != 'DentalPreDetermination') {
            params.input.indicatorType = this.historyType;
            this.indicator = this.historyType;

            if (this.historyType == "Pre-Authorizations") {
                params.input.indicatorType = "Pre-Authorization";
                this.indicator = "Pre-Authorization";
            } else if (this.historyType == "Referral") {
                params.input.indicatorType = "Referral";
                this.indicator = "Referral";
            }
        }

        this.omniRemoteCall(params, true).then((response) => {
            // if(!response.error) {
            //     console.log(`${methodName} data successful response:`);
            //     console.log(response);
            // }

            let data = response.result.IPResult;
            this.pagerTotalEle = data.totalRecords;
            this.getDataToExcel(input);
            if (data.totalRecords == 0) {
                this._showNoRecordsMessage = true;
                this.showCards = false;
            }
            else {
                //this.showCards = true;
                if (this.historyType == 'DentalPreDetermination') {
                    this.paginatedRecords = data.dentalPreDeterminations;
                    this.ipNode = "dentalPreDeterminations";
                    // this.paginatedRecordForCombo = [...this.paginatedRecords];
                    // this.paginatedRecordForCombo = Array.from(this.paginatedRecords);
                    //add memberId into records for flexcard
                    if (Array.isArray(this.paginatedRecords)) {
                        this.paginatedRecords.forEach((p) => {
                            Object.assign(p, { memberid: this.memberId });
                        });
                        //Object.assign(this.paginatedRecords, { memberid: this.memberId });
                    } else {
                        this.paginatedRecords.memberid = this.memberId;
                    }
                    this.paginatedRecordForCombo = JSON.parse(JSON.stringify(this.paginatedRecords));
                } else {
                    //this.paginatedRecords = data.referralsAuthList;
                    this.paginatedRecords = JSON.parse(JSON.stringify(data.referralsAuthList));
                    this.paginatedRecordsPre = JSON.parse(JSON.stringify(data.preauthorization));
                    this.ipNode = "referralsAuthList";
                    // this.paginatedRecordForCombo = [...this.paginatedRecords];
                    // this.paginatedRecordForCombo = Array.from(this.paginatedRecords);
                    //add memberId into records for flexcard
                    if (Array.isArray(this.paginatedRecords)) {
                        this.paginatedRecords.forEach((pg) => {
                            Object.assign(pg, { memberid: this.memberId });
                        });
                        //Object.assign(this.paginatedRecords, {memberid: this.memberId});
                    } else {
                        this.paginatedRecords.memberid = this.memberId;
                    }
                    this.paginatedRecordForCombo = JSON.parse(JSON.stringify(this.paginatedRecords));
                }
                //Testing
                this.dataloaded = true;
                this.showCards = true;
            }

            //added 7/29-->  MPV-960-->add the hyphen to dateTo values that are not empty
            this.dateChangeArray = JSON.parse(JSON.stringify(this.paginatedRecords));

            if (Array.isArray(this.dateChangeArray)) {
                this.dateChangeArray.forEach((r) => {
                    for (const key in r) {
                        if (key == "dateTo") {
                            if (r[key] == "" || r[key] == " ") {
                                r[key] = r[key];
                            } else {
                                r[key] = `- ${r[key]}`;
                            }
                        }
                    }
                });

                const tempA = [...this.dateChangeArray];

                this.paginatedRecords = JSON.parse(JSON.stringify(tempA))
            }

            //end added 7/29

            this.showList = true;
            this.showCombo = true;
            this.loading = false;

            //this.setServicingComboValues()
        }).catch(error => {
            console.error(`failed at getting IP data => ${JSON.stringify(error)}`);
            this._showNoRecordsMessage = true;
            this.showCards = false;
            this.loading = false;
        });

    }

    getDataToExcel(input) {
        let methodName = "Member_Referrals";
        if (this.historyType == 'DentalPreDetermination') {
            methodName = "Member_DentalPreDeterminations";
        }

        if (this.initialLoad == true) {
            if (input.startDate == null || input.startDate == undefined) {
                this.startDate = "";
            }
            if (input.endDate == null || input.endDate == undefined) {
                this.endDate = "";
            }

            if (input.referringProvider == null || input.referringProvider == undefined) {
                this.referringProv = "";
            }
            if (input.servicingProviderFacility == null || input.servicingProviderFacility == undefined) {
                this.servicingProvFac = "";
            }
        }

        this.ipStructure = {
            'sMethodName': methodName,
            'input': {
                "memberId": input.memberId,
                "startDate": input.startDate,
                "endDate": input.endDate,
                "from": "",
                "size": this.pagerTotalEle,
                "indicatorType": this.indicator,
                "sortBy": this.sorting,
                "order": this.ordering,
                "referringProvider": this.referringProv,
                "servicingProviderFacility": this.servicingProvFac
            }
        }
    }

    getProviderList(data) {
        this.loading = true;
        if (this.historyType === "DentalPreDetermination") {
            this.methodName = "Member_DentalPreDeterminationsProvidersList";
        } else {
            this.methodName = "Member_ReferralProvidersList";
        }
        let params = {
            sClassName: "omnistudio.IntegrationProcedureService",
            sMethodName: this.methodName,
            options: "{}",
            input: data
        }
        this.omniRemoteCall(params, true).then((response) => {
            let data = response.result.IPResult;

            if (data.totalRecords == 0 || response.result.IPResult.length == 0) {
                console.log("no records found");
            }
            else {
                this.referringList = data.referringProvidersList;
                this.servicingList = data.providersList;

                if (this.historyType === "Referral") {
                    let defaultReferring = {
                        "authReferralIndicatorType": "",
                        "dateFrom": "",
                        "dateTo": "",
                        "referralId": "",
                        "referringProvider": "All",
                        "serviceType": "",
                        "servicingProviderFacility": "",
                        "status": "",
                        "visits": "",
                        "value": "All",
                        "key": "All",
                        "label": "All"
                    }

                    if (Array.isArray(this.referringList)) {
                        this.referringList.forEach((rf) => {
                            if (rf.referringProvider == " " || rf.referringProvider == "") {
                            } else {
                                rf.key = rf.referringProvider;
                                rf.value = rf.referringProvider;
                                rf.label = rf.referringProvider;
                            }
                        });
                    }
                    this.referringList.unshift(defaultReferring);
                }

                let defaultServicing = {
                    "authReferralIndicatorType": "",
                    "dateFrom": "",
                    "dateTo": "",
                    "referralId": "",
                    "referringProvider": "",
                    "serviceType": "",
                    "servicingProviderFacility": "All",
                    "status": "",
                    "visits": "",
                    "value": "All",
                    "key": "All",
                    "label": "All"
                }

                if (Array.isArray(this.servicingList)) {
                    this.servicingList.forEach((sp) => {
                        if (this.historyType === "DentalPreDetermination") {
                            if (sp.servicingProvider == " " || sp.servicingProvider == "") {
                            } else {
                                sp.key = sp.servicingProvider;
                                sp.value = sp.servicingProvider;
                                sp.label = sp.servicingProvider;
                            }
                        } else if (this.historyType === "Pre-Authorization" || this.historyType === "Referral") {
                            if (sp.servicingProviderFacility == " " || sp.servicingProviderFacility == "") {
                            } else {
                                sp.key = sp.servicingProviderFacility;
                                sp.value = sp.servicingProviderFacility;
                                sp.label = sp.servicingProviderFacility;
                            }
                        }
                    });
                }
                this.servicingList.unshift(defaultServicing);
            }
            this.showCombo = true;
            this.loading = false;
        }).catch(error => {
            console.error(`failed at getting IP data => ${JSON.stringify(error)}`);
            this._showNoRecordsMessage = true;
            this.showCards = false;
            this.loading = false;
        });
    }

    handleNewPage(evt) {
        console.info(evt)
    }

    handlePagerChange(evt) {
        this.pagerFirstEle = evt.detail.from;
        this.tempInput.from = this.pagerFirstEle;
        this.showList = false;
        // Build input 
        let input = this.tempInput;
        this.getData(input);
    }
    //*********************************************  MPV-264, MPV-266, MPV-268



    range(evt) {
        if (evt) {
            this.radioSelected = evt.target.getAttribute("value");

            if (this.radioSelected == "yearToDate") {
                this.customDateRange = false;

                // See start and end date for Year to date
                this.startDate = this.sDate;
                this.endDate = this.today;

                this.fromDateMessage = false;
                this.toDateMessage = false;

                //this.disabledApplyFilters = false;
                this.validFromDate = undefined;
                this.validToDate = undefined;

                /***** MPV-1159 */
                this.valueFrom = null;
                this.valueTo = null;
                this.fromDateSelected = null;
                this.toDateSelected = null;

            } else if (this.radioSelected == "priorYear") {
                this.customDateRange = false;

                // See start and end date for Year to date
                // MPV-1489
                this.startDate = this.oneYearFromNow;
                this.endDate = this.today;

                this.fromDateMessage = false;
                this.toDateMessage = false;

                //this.disabledApplyFilters = false;
                this.validFromDate = undefined;
                this.validToDate = undefined;

                /***** MPV-1159 */
                this.valueFrom = null;
                this.valueTo = null;
                this.fromDateSelected = null;
                this.toDateSelected = null;

            } else if (this.radioSelected == "last24Months") {
                this.customDateRange = false;

                // See start and end date for Year to date
                this.startDate = this.twoYearsFromNow;
                this.endDate = this.today;

                this.fromDateMessage = false;
                this.toDateMessage = false;

                //this.disabledApplyFilters = false;
                this.validFromDate = undefined;
                this.validToDate = undefined;

                /***** MPV-1159 */
                this.valueFrom = null;
                this.valueTo = null;
                this.fromDateSelected = null;
                this.toDateSelected = null;
            } else {
                this.customDateRange = true;
            }
        }

        this.viewReferralsWithinArray.forEach((vrw) => {
            if (vrw.value == this.radioSelected) {
                vrw.checked = "checked";
            } else {
                vrw.checked = "";
            }
        });
    }

    setFromDate(evt) {
        if (evt) {
            this.fromDateSelected = evt.target.value;
        }
        this.minDateForTo = this.fromDateSelected;

        let d1 = new Date(this.fromDateSelected);
        let d2 = new Date(this.twoYearsFromNow);
        let d3 = new Date(this.today);
        if (d1.getTime() < d2.getTime() || d1.getTime() > d3.getTime()) {
            this.fromDateMessage = true;
            this.validFromDate = false;
            //this.validToDate = false;

            //this.disabledApplyFilters = true;
        } else {
            this.fromDateMessage = false;
            this.validFromDate = true;
            // this.validToDate = true;

            //this.disabledApplyFilters = false;
        }
        this.getDate(this.fromDateSelected);

        //From will be the start date if it's a valid date
        this.startDate = this.getDate2(this.fromDateSelected).toString();
        this.validateValidDates();
    }

    setToDate(evt) {
        if (evt) {
            this.toDateSelected = evt.target.value;

            let td1 = new Date(this.toDateSelected);
            let td2 = new Date(this.twoYearsFromNow);
            let td3 = new Date(this.today);
            if (td1.getTime() < td2.getTime() || td1.getTime() > td3.getTime()) {
                this.toDateMessage = true;
                this.validToDate = false;
                //this.disabledApplyFilters = true;
            } else {
                this.toDateMessage = false;
                this.validToDate = true
                //this.disabledApplyFilters = false;
            }
        }

        //To will be the end date if it's a valid date
        this.endDate = this.getDate2(this.toDateSelected).toString();
        this.validateValidDates();
    }

    getDate2(fdate) {
        var date = new Date(fdate.replace(/-/g, '\/'));
        var result = date.toLocaleDateString("en-US", { // you can use undefined as first argument
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
        return result
    }

    validateValidDates() {
        if (this.validFromDate != undefined && this.validToDate != undefined) {
            if (this.validFromDate == true && this.validToDate == true) {
                this.disabledApplyFilters = false;
            } else {
                //this.disabledApplyFilters = true;
            }
        }
    }


    getProviderOrFacility(evt) {
        this.provider = evt.providerName;
        if (this.showReferringProvider != true) {
            this.referringProv == null;
        }
    }

    combo(value) {
        this.callReferringServicing(value.obj, this.provider);
    }

    callReferringServicing(v, p) {
        if (v == "Referring") {
            if (p == "All") {
                this.referringProv = null;
            } else {
                this.referringProv = p;
            }

        }

        if (v == "Servicing") {
            if (p == "All") {
                this.servicingProvFac = null;
            } else {
                this.servicingProvFac = p;
            }

        }

        if (v == "Both") {
            if (p == "All") {
                this.referringProv = null;
                this.servicingProvFac = null;
            }
        }
    }

    filterDesktop() {
        this.showList = false;
        // In this method we only need to pass the input param to the getData IP

        //************ MPV-1159 */
        if (this.radioSelected == "customDateRange") {
            if (this.fromDateSelected == null || this.fromDateSelected == undefined) {
                // start date should be 24 months ago.
                this.startDate = this.twoYearsFromNow;
                this.valueFrom = this.twoYearsFromNow;
            }
            if (this.toDateSelected == null || this.toDateSelected == undefined) {
                // end date should current date.
                this.endDate = this.today;
                this.valueTo = this.today;
            }
        }
        //************ MPV-1159 */

        let input = {
            memberId: this.memberId,
            //memberId: 'K8008481202',
            startDate: this.getDate2(this.startDate).toString(),
            endDate: this.getDate2(this.endDate).toString(),
            from: 0,
            size: this.selectedViewNumber,
            sortBy: this.sorting,
            order: this.ordering,
            indicatorType: this.indicator,
            servicingProviderFacility: this.servicingProvFac,
            referringProvider: this.referringProv
        }

        let inputReferringCombo = {
            memberId: this.memberId,
            indicatorType: this.indicator,
            servicingProviderFacility: this.servicingProvFac,
            referringProvider: this.referringProv,
            startDate: this.getDate2(this.startDate).toString(),
            endDate: this.getDate2(this.endDate).toString()
        }

        this.tempInput = input;
        this.initialLoad = false;
        this.goToFirstPage();
        this.getData(input);
        this.getDataToExcel(input);
        this.getProviderList(inputReferringCombo);
    }

    clearFilters() {
        this.showList = false;
        this.showCombo = false;

        this.viewReferralsWithinArray.forEach((vrw) => {
            if (vrw.value == "last24Months") {
                vrw.checked = "checked";
            } else {
                vrw.checked = "";
            }
        });
        this.customDateRange = false; //Hide from and to date picker

        // Prepare default input
        this.servicingProvFac = null;
        this.referringProv = null;
        let input = {
            memberId: this.memberId,
            // memberId: 'K8008481202',
            startDate: this.twoYearsFromNow, // MPV-940
            endDate: this.eDate, // MPV-940
            from: 0,
            size: this.selectedViewNumber,
            sortBy: null,
            order: null,
            indicatorType: this.indicator,
            servicingProviderFacility: this.servicingProvFac,
            referringProvider: this.referringProv
        }

        let inputReferringCombo = {
            memberId: this.memberId,
            indicatorType: this.indicator,
            servicingProviderFacility: this.servicingProvFac,
            referringProvider: this.referringProv,
            startDate: this.twoYearsFromNow,
            endDate: this.eDate
        }

        this.defaultValueSPF = "";
        this.defaultValueRPN = "";
        this.defaultValueCombo = "All";

        this.valueAllReferring = "Yes";
        setTimeout(() => {
            this.defaultValueCombo = "All";
            this.defaultValueSPF = "All";
            this.defaultValueRPN = "All";
        });
        this.tempInput = input;
        this.servicingProvFac = null;
        this.referringProv = null;
        this.initialLoad = true;

        //************ MPV-1159 */
        this.valueFrom = null;
        this.valueTo = null;
        this.fromDateSelected = null;
        this.toDateSelected = null;

        this.goToFirstPage();
        this.provider = "All";
        let value = { obj: "All" };
        this.combo(value);
        this.getData(input);
        this.getDataToExcel(input);
        this.getProviderList(inputReferringCombo);
    }

    goToFirstPage() {
        this.pagerFirstEle = 0;
    }


    /** Sort logic **/

    handleSortSelect(evt) {
        this.selectedSort = evt.target.getAttribute("data-badge-value");
        this.sortSelect(evt);
        // this.sortBy(this.selectedSort);
    }

    handleSortToggle(event) {
        let evtBadgeId = event.target.getAttribute("id");
        if (evtBadgeId) {
            let badgeKey = evtBadgeId.substring(0, evtBadgeId.indexOf("-"));
            let ascBadgeId;
            let descBadgeId;
            if (this.sortIdNum.length > 0) {
                ascBadgeId = "#" + badgeKey + "-ASC-" + this.sortIdNum;
                descBadgeId = "#" + badgeKey + "-DESC-" + this.sortIdNum;
            } else {
                ascBadgeId = "#" + badgeKey + "-ASC";
                descBadgeId = "#" + badgeKey + "-DESC";
            }
            //Toggle
            if (evtBadgeId.indexOf("ASC") > -1) {
                this.template.querySelector(ascBadgeId).classList.add("nds-hide");
                this.template.querySelector(descBadgeId).classList.remove("nds-hide");
                this.sortDirection = "DESC";
            } else {
                this.template.querySelector(ascBadgeId).classList.remove("nds-hide");
                this.template.querySelector(descBadgeId).classList.add("nds-hide");
                this.sortDirection = "ASC";
            }

            this.selectedSortId = badgeKey;
            // this.sortDirSelect(this.sortDirection);
            this.sortApply(this.sortDirection);
        }
    }

    sortApply(sort) {
        //Will call the dynamic API
        this.sorting = "startDate";
        let sortOrder = sort.toLowerCase();
        this.ordering = sortOrder;
        this.filterDesktop();

    }

    sortFocusIn() {
        let sortId = this.selectedSortId;
        let sortDir = this.sortDirection;
        let selectedSort = this.selectedSort;
        if (!sortId) {
            this.sortShowBadge("B001");
        } else {
            this.sortShowBadge(this.selectedSortId);
        }
        let sortAppStatus = this.template.querySelector(".sortAppStatus");
        sortAppStatus.setAttribute('aria-expanded', 'true');

        this.template.querySelector(".sort_list").classList.remove("nds-hide");
        //console.log("sortAppStatus in iput: ", sortAppStatus);
    }

    sortShowBadge(badgeId) {
        let badge = this.template.querySelector('[data-badge-id="' + badgeId + '"]');
        if (badge) {
            let sortId = badge.id;
            this.sortIdNum = sortId.substring(sortId.indexOf("-") + 1);
            let dirBadgeId;
            if (this.sortDirection) {
                dirBadgeId = "#" + badgeId + "-" + this.sortDirection + "-" + this.sortIdNum;
            } else {
                dirBadgeId = "#" + badgeId + "-ASC-" + this.sortIdNum;
            }
            //Display ASC Badge
            this.template.querySelector(dirBadgeId).classList.remove("nds-hide");
        }
    }

    sortWindowClose() {
        this.template.querySelector(".sort_list").classList.add("nds-hide");
        let sortAppStatus = this.template.querySelector(".sortAppStatus");
        sortAppStatus.setAttribute('aria-expanded', 'false');
        sortAppStatus.focus();
    }

    sortSelect(event) {
        let badgeVal = event.target.getAttribute("data-badge-value");
        if (badgeVal) {
            this.selectedSort = badgeVal;
            // console.log("in sortSelect selectedSort: ", this.selectedSort);
            this.selectedSortId = event.target.getAttribute("data-badge-id");
            // console.log("in sortSelect selectedSortId: ", this.selectedSortId);
            let sortId = event.target.id;
            // console.log("in sortSelect sortId: ", this.sortId);
            this.sortIdNum = sortId.substring(sortId.indexOf("-") + 1);
            // console.log("in sortSelect sortIdNum: ", this.sortIdNum);
            this.sortDirection = "ASC";
            //Append the fied name after Sort By.
            // this.sortAppendName();
            let badgeKey = event.target.getAttribute("data-badge-id");
            let ascBadgeId;
            if (this.sortIdNum.length > 0) {
                // console.log("in sortSelect 1: ");
                ascBadgeId = "#" + badgeKey + "-ASC-" + this.sortIdNum;
            } else {
                // console.log("in sortSelect 2: ");
                ascBadgeId = "#" + badgeKey + "-ASC";
            }

            //All badges need to be hiddend
            Array.from(this.template.querySelectorAll(".nds-badge")).forEach((element) => {
                if (element.id) {
                    element.classList.add("nds-hide");
                }
            });
            //Display ASC Badge
            this.template.querySelector(ascBadgeId).classList.remove("nds-hide");
        }
    }

    sortDirSelect(direction) {
        this.sortDirection = direction;
        //this.sortBy(this.selectedSort);
    }
    /** End - Sort logic **/

    /** Sort logic - Mobile **/
    mobileCloseFilterWindow() {
        this.template.querySelector(".item_list").classList.add("nds-hide");
    }

    mobileIsOpen() {
        this.template.querySelector(".item_list").classList.remove("nds-hide");
        this.template.querySelector(".nds-dropdown-trigger").classList.add("nds-is-open");
    }

    mobileSortWindlowClose() {
        this.template.querySelector(".sort_list_mo").classList.add("nds-hide");
    }

    mobileSortFocusIn() {
        this.template.querySelector(".item_list").classList.add("nds-hide");
        this.template.querySelector(".sort_list_mo").classList.remove("nds-hide");
        if (!this.selectedSortId) {
            this.sortShowBadge("B002M");
        } else {
            this.sortShowBadge(this.selectedSortId);
        }
    }

    sortToggle(event) {
        let evtBadgeId = event.target.getAttribute("id");
        if (evtBadgeId) {
            let badgeKey = evtBadgeId.substring(0, evtBadgeId.indexOf("-"));
            let ascBadgeId;
            let descBadgeId;
            if (this.sortIdNum.length > 0) {
                ascBadgeId = "#" + badgeKey + "-ASC-" + this.sortIdNum;
                descBadgeId = "#" + badgeKey + "-DESC-" + this.sortIdNum;
            } else {
                ascBadgeId = "#" + badgeKey + "-ASC";
                descBadgeId = "#" + badgeKey + "-DESC";
            }
            //Toggle
            if (evtBadgeId.indexOf("ASC") > -1) {
                this.template.querySelector(ascBadgeId).classList.add("nds-hide");
                this.template.querySelector(descBadgeId).classList.remove("nds-hide");
                this.sortDirection = "DESC";
            } else {
                this.template.querySelector(ascBadgeId).classList.remove("nds-hide");
                this.template.querySelector(descBadgeId).classList.add("nds-hide");
                this.sortDirection = "ASC";
            }
            this.selectedSortId = badgeKey;
            this.sortDirSelect(this.sortDirection);
        }
    }

    /** End - Sort logic - Mobile **/

    //*********************************************  MPV-264, MPV-266, MPV-268

    disconnectedCallback() {
        // pubsub.unregister("ProviderNameSelection", this.getProviderOrFacility);
        // pubsub.unregister("ProviderNameSelection", providerNameSelectionAction);
        pubsub.unregister("ProviderNameSelection", {
            providerNameSelectionAction: this.getProviderOrFacility.bind(this)
        });
        pubsub.unregister("combo", {
            comboAction: this.combo.bind(this)
        });
    }
}
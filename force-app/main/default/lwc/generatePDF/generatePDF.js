import { LightningElement, api, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import { NavigationMixin } from 'lightning/navigation';
import util from "omnistudio/utility";
const attentislogo = '../resource/AttentisLogo';
const PreferredProviderPNG = '../resource/PreferredProviderPNG';
const OptometryVisionPNG = '../resource/OptometryVisionPNG';
const WheelchairAccessiblePNG = '../resource/WheelchairAccessiblePNG';
export default class GeneratePDF extends OmniscriptBaseMixin(NavigationMixin(LightningElement)) {
  @api omniData;            //Omniscript JSON data
  @api multipleOfficeData;  //Omniscript JSON data from Multiple Office Step
  @api inputParams;         //Filter params to Search Criteria
  @api totalRecords;
  loading;
  rootJson;
  isMultipleOffice;
  userId;
  // Dates Variables
  time;
  today;
  todaydot;
  todayMark;
  day;
  date;
  year;
  pcpIcon = PreferredProviderPNG;
  wheelchairIcon = WheelchairAccessiblePNG;
  visionIcon = OptometryVisionPNG;
  over200 = false;
  // Metadata IP Variables
  lob;
  type;
  tenant;
  lobToShow;
  company;
  // Find Provider/Facility Variables
  ipZipCode;
  ipPlanId;
  ipDistance;
  ipNetworkId;
  ipServiceType;
  ipOrder;
  ipTenantId;
  ipSize;
  ipPlanType;
  ipProviderSpeciality;
  ipSortByField;
  ipResultList;
  ipFHN;
  @track ipFormattedList = [];
  // UI Filters - Provider
  ipLanguage;              // Language
  ipGender;                // Gender
  ipHospitalAffiliation;   // Hospital Affiliation
  ipProviderName;          // Provider Name
  ipWheelchair;            // Wheelchair
  ipAcceptingNewPatients;  // Accepting New Patients
  ipPreferred;             // Preferred
  ipACPNY;                 // ACPNY 
  ipHOMELESS;               //Homeless Shelter
  ipfirstName;             // First Name
  iplastName;              // Last Name
  ipNetworkCode;           // Network Code
  // UI Filters - Facility
  ipfacilityName;          // Facility Name
  ipCOE;                   // Center of Excellence
  ipAccreditation;         // Accreditation
  ipFacilityType;          // Facility Type
  // PDF Metadata Received
  p1;
  p2;
  p3;
  p4;
  p5;
  p6;
  p7;
  p8;
  p13;
  disclaimers;
  contactURL;
  // PDF Variables
  memberInfo;
  currentMetadata;
  updatedTableData = [];
  textLines;
  pdfName;
  validParams = {};
  specialtyFilterLabel;
  // Multiple Office
  moProfileId;
  moNetworkId;
  moZipCode;
  multipleOfficeList;
  officeTableList = [];
  tempProvName;
  //accessibility
  messagePDF;

  connectedCallback() {
    /* Set inputs for Member_GenerateMetadataPDF IP */
    if (this.omniData != null && this.omniData != undefined) {
      this.rootJson = this.omniData;
      this.isMultipleOffice = false;
    } else if (this.multipleOfficeData != null && this.multipleOfficeData != undefined) {
      this.rootJson = this.multipleOfficeData;
      this.isMultipleOffice = true;
    } else {
    }

    if (this.rootJson != null && this.rootJson != undefined) {
      this.tenant = this.rootJson.tenantId;
      this.lob = this.rootJson.SelectedPlanInfo.productBrandGrouping;

      if (this.rootJson.isPublic == true) {
        this.type = "Doctor";
      }
      else {
        this.type = this.rootJson.STEP_ChooseServiceType.radioServiceType;
      }


      if (this.type == 'Doctor' || this.type == 'PCP' || this.type == 'Chiro practor' || this.type == 'Dental') {
        this.type = 'Provider';
      }
      if (this.type == 'lab') {
        this.type = 'Facility';
      }

      console.log('Previuous Tenant =>', this.lob);

      switch (this.lob) {
        case "Commercial":
          this.lob = "Commercial";
          this.lobToShow = "Commercial";
          break;
        case "DSNP":
          this.lob = "Medicare";
          this.lobToShow = "DSNP";
          break;
        case "FEHB":
          this.lob = "Commercial";
          this.lobToShow = "FEHB";
          break;
        case "Medicaid":
          this.lob = "Commercial";
          this.lobToShow = "Medicaid";
          break;
        case "Medicare":
          this.lob = "Medicare";
          this.lobToShow = "Medicare";
          break;
        case "Not Defined":
          this.lob = "Commercial";
          this.lobToShow = "Commercial";
          break;
        default:
          this.lob = "Commercial";
          this.lobToShow = "Commercial";
      }

      console.log(this.type, this.tenant, this.lob, this.lobToShow);
      this.company = 'AttentisHealth';
      this.contactURL = 'https://attentisconsulting.com/contact/';

      let inputp = { Type: this.type, Tenant: this.tenant, LOB: this.lob }
      const parameter = {
        input: inputp,
        sClassName: "omnistudio.IntegrationProcedureService",
        sMethodName: "Member_GetPDFRecords",
        options: "{}",
      }

      this.omniRemoteCall(parameter, true)
        .then((response) => {
          let jsonResponse = response.result.IPResult;
          this.disclaimers = jsonResponse;
        });
    }

    //Accessibility
    if (this.rootJson.selectedFacilityType == "") {
      this.messagePDF = "Export Providers to PDF";
    }
    else {
      this.messagePDF = "Export Facilities to PDF";
    }

  }

  renderedCallback() {
    Promise.all([
      loadScript(this, '../resource/pdfJSTable'),
    ]).catch(e => {
      console.log('catch', e);
    })
  }

  /* Multiple Office PDF */
  async generateMultipleOfficePDF() {
    this.loading = true;
    let multipleOfficeRecords = await this.getDataMultipleOffice();
    this.multipleOfficeList = multipleOfficeRecords.result.IPResult.providerList;
    this.officeTableList = [];
    for (var n = 0; n < this.multipleOfficeList.length; n++) {

      let addressLine1 = ((this.multipleOfficeList[n].addressLine1 != undefined) ? this.multipleOfficeList[n].addressLine1 : '');
      let addressLine2 = ((this.multipleOfficeList[n].addressLine2 != undefined) ? ', ' + this.multipleOfficeList[n].addressLine2 : '');
      let city = ((this.multipleOfficeList[n].city != undefined) ? ', ' + this.multipleOfficeList[n].city : '');
      let state = ((this.multipleOfficeList[n].state != undefined) ? ', ' + this.multipleOfficeList[n].state : '');
      let zip = ((this.multipleOfficeList[n].zip != undefined) ? this.multipleOfficeList[n].zip : '');
      if (zip == this.multipleOfficeList[n].zip) {
        zip = ' ' + zip.substring(0, 5);
      }
      let address = addressLine1 + addressLine2 + city + state + zip;
      let phoneText = this.multipleOfficeList[n].Phone;
      phoneText = phoneText.toString();
      phoneText = phoneText.substring(0, 3) + '-' + phoneText.substring(3, 6) + '-' + phoneText.substring(6, 10);

      var office = {
        "Full Name": this.multipleOfficeList[n].providerFullName,
        "Address": address,
        "Phone Number": phoneText
      };

      this.officeTableList.push(office);
    }
    this.tempProvName = this.multipleOfficeList[0].FirstName + ' ' + this.multipleOfficeList[0].LastName;
    /* PDF Config */
    let options = {
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    }
    var pageWidthPdf = 210,
      margin = 10,
      maxLineWidth = pageWidthPdf - (margin * 2)

    /* Table Header */
    let header = ['Full Name', 'Address', 'Phone Number'];

    let headerConfig = header.map(key => ({
      'id': key,
      'name': key,
      'prompt': key,
      'width': 84,
      'align': 'left',
      'padding': 0,
      'border': 'none'
    }));

    let headerTableConfig = {
      printHeaders: true,
      autoSize: false,
      margins: {
        left: 10,
        top: 10,
        bottom: 10
      },
      fontSize: 10,
      padding: 2,
      headerBackgroundColor: '#c8c8c8'
    }

    /* Dynamic PDF Variables */
    if (this.currentMetadata.DisclaimerParagraph1__c != null && this.currentMetadata.DisclaimerParagraph1__c != undefined) {
      if (this.currentMetadata.DisclaimerParagraph1__c.includes('{datetime}')) {
        this.p1 = '';
        this.p1 = this.currentMetadata.DisclaimerParagraph1__c;
        this.p1 = this.currentMetadata.DisclaimerParagraph1__c.replace('{datetime}', this.today);
      } else {
        this.p1 = '';
      }
    } else {
      this.pi = '';
    }

    if (this.currentMetadata.DisclaimerParagraph13__c != null && this.currentMetadata.DisclaimerParagraph13__c != undefined) {
      if (this.currentMetadata.DisclaimerParagraph13__c.includes('{time}')) {
        this.p13 = '';
        this.p13 = this.currentMetadata.DisclaimerParagraph13__c;
        this.p13 = this.currentMetadata.DisclaimerParagraph13__c.replace('{time}', this.time);
      } else {
        this.p13 = '';
      }
    } else {
      this.p13 = '';
    }
    this.createMultipleOfficePDF(options, headerConfig, headerTableConfig, maxLineWidth);
  }

  async getDataMultipleOffice() {
    this.getDates();
    this.moNetworkId = this.multipleOfficeData.networkId;
    this.moProfileId = this.multipleOfficeData.profileId;
    this.moZipCode = this.multipleOfficeData.zipCode;

    this.currentMetadata = this.disclaimers.records;

    this.pdfName = this.currentMetadata.Document_Name__c;
    if (this.pdfName != null && this.pdfName != undefined) {
      if (this.currentMetadata.Document_Name__c.includes('{today}')) {
        this.pdfName = this.currentMetadata.Document_Name__c.replace('{today}', this.todaydot);
      } else {
        this.pdfName = this.pdfName;
      }
    } else {
      this.pdfName = this.pdfName;
    }

    console.log(this.moNetworkId, this.moProfileId, this.moZipCode);

    let inputp = { profileId: this.moProfileId, zipCode: this.moZipCode, networkId: this.moNetworkId }
    const parameters = {
      input: inputp,
      sClassName: "omnistudio.IntegrationProcedureService",
      sMethodName: "Member_multipleOffices",
      options: "{}",
    }
    let response = await this.omniRemoteCall(parameters, true);
    console.log('Response Multiple Office', JSON.parse(JSON.stringify(response)));
    return response;
  }

  modalHandler() {
    return false;
    if(this.type == 'Provider'){
      if (this.totalRecords > 200) {
        this.over200 = true;
      } else {
        this.generatePDF();
      }
    }else{
      this.generatePDF();
    }
  }

  /* Provider & Faciliy PDF */
  async generatePDF() {
    /* Await the IP response in order to display table info */
    let expectedData = await this.getData();
    console.log('expectedData', expectedData);
    this.ipResultList = expectedData.result.IPResult.hits.hits;

    /* Multispecialty splitting */
    let specialties;
    if (this.type == 'Provider') {
      if (this.rootJson.providerSpeciality.includes('"')) {
        specialties = this.rootJson.providerSpeciality.split('"');
        console.log('specialties', specialties);
        this.specialtyFilterLabel = this.rootJson.providerSpeciality;
      } else {
        this.specialtyFilterLabel = 'All Selected';
      }
    }


    /* Creating new list of records to display on the PDF from the raw JSON */
    console.log('Records: ', this.ipResultList.length);
    for (var r = 0; r < this.ipResultList.length; r++) {
      let addressLine2;
      if (this.ipResultList[r]._source.providerInfo.providerFullName == null) {
        continue;
      }
      if (this.ipResultList[r].inner_hits.providerLocations.hits.hits[0]._source.provAddress.addressLine1 == null) {
        continue;
      }
      if (this.ipResultList[r].inner_hits.providerLocations.hits.hits[0]._source.provAddress.addressLine2 == null) {
        addressLine2 = ' ';
      } else {
        addressLine2 = ' ' + this.ipResultList[r].inner_hits.providerLocations.hits.hits[0]._source.provAddress.addressLine2 + ', ';
      }
      if (this.ipResultList[r].inner_hits.providerLocations.hits.hits[0]._source.provAddress.provAddressContact.phone == null) {
        continue;
      }

      let phoneText = this.ipResultList[r].inner_hits.providerLocations.hits.hits[0]._source.provAddress.provAddressContact.phone;
      phoneText = phoneText.toString();
      phoneText = phoneText.substring(0, 3) + '-' + phoneText.substring(3, 6) + '-' + phoneText.substring(6, 10);
      if (this.type == 'Provider') {
        console.log('Type: Provider');
        // Icon flag indicator
        let isPCP = false;
        let isWheelchair = false;
        let primarySpec;

        if (this.ipResultList[r].inner_hits.providerNetwork.hits.hits[0]._source.pcpIndicator == 'Yes') {
          isPCP = true;
        } else {
          isPCP = false;
        }

        if (this.ipResultList[r]._source.providerInfo.wheelChair == 'Y') {
          isWheelchair = true;
        } else {
          isWheelchair = false;
        }

        if(this.ipResultList[r]._source.providerInfo.speciality != null){
          if(Array.isArray(this.ipResultList[r]._source.providerInfo.speciality)){
            if(this.ipResultList[r]._source.providerInfo.speciality.length > 0){
              primarySpec = ', '+this.ipResultList[r]._source.providerInfo.speciality[0];
            }else{
              primarySpec = '';
            }
          }else{
            primarySpec = '';
          }
        }else{
          primarySpec = '';
        }
        

        let isActive;
        let netStatus;
        if (this.ipResultList[r].inner_hits.providerNetwork.hits.hits[0]._source.networkStatus == 'Active') {
          isActive = true;
          netStatus = 'Active';
        }else{
          isActive = false;
          netStatus = 'Not Applicable';
        }
        
        var rec = {
          "Id": r,
          "FullName": this.ipResultList[r]._source.providerInfo.providerFullName,
          "Address": this.ipResultList[r].inner_hits.providerLocations.hits.hits[0]._source.provAddress.addressLine1 + ',' + addressLine2 +
            this.ipResultList[r].inner_hits.providerLocations.hits.hits[0]._source.provAddress.city + ', ' +
            this.ipResultList[r].inner_hits.providerLocations.hits.hits[0]._source.provAddress.state + ' ' +
            this.ipResultList[r].inner_hits.providerLocations.hits.hits[0]._source.provAddress.zip.substring(0, 5),
          "PhoneNumber": phoneText,
          "isPCP": isPCP,
          "networkStatus": netStatus,
          "networkEffectiveDate": this.ipResultList[r].inner_hits.providerNetwork.hits.hits[0]._source.networkEffectiveDate,
          "wheelchairAccessible": isWheelchair,
          "primarySpecialty": primarySpec,
          "isActive": isActive
        };
        this.ipFormattedList.push(rec);
      } else {
        let isVision;
        if(this.ipResultList[r]._source.providerInfo.eyewearDiscount == 'Yes'){
          isVision = true;
        }else{
          isVision = false;
        }
        var rec = {
          "FacilityName": this.ipResultList[r]._source.providerInfo.providerFullName,
          "Address": this.ipResultList[r].inner_hits.providerLocations.hits.hits[0]._source.provAddress.addressLine1 + ',' + addressLine2 +
            this.ipResultList[r].inner_hits.providerLocations.hits.hits[0]._source.provAddress.city + ', ' +
            this.ipResultList[r].inner_hits.providerLocations.hits.hits[0]._source.provAddress.state + ' ' +
            this.ipResultList[r].inner_hits.providerLocations.hits.hits[0]._source.provAddress.zip.substring(0, 5),
          "PhoneNumber": phoneText,
          "isVision": isVision
        };
        this.ipFormattedList.push(rec);
      }
      console.log('end', r);
    }

    /* PDF Config */
    let options = {
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    }
    var pageWidthPdf = 210,
      margin = 10,
      maxLineWidth = pageWidthPdf - (margin * 2)

    /* Table Header */
    let header;
    if (this.type == 'Provider') {
      header = ['Full Name', 'Address', 'Phone Number'];
    } else {
      header = ['Facility Name', 'Address', 'Phone Number'];
    }
    let headerConfig = header.map(key => ({
      'id': key,
      'name': key,
      'prompt': key,
      'width': 84,
      'align': 'left',
      'padding': 0,
      'border': 'none'
    }));

    let headerTableConfig = {
      printHeaders: true,
      autoSize: false,
      margins: {
        left: 10,
        top: 10,
        bottom: 10
      },
      fontSize: 10,
      padding: 2,
      headerBackgroundColor: '#c8c8c8'
    }

    /* Dynamic PDF Variables */
    if (this.currentMetadata.DisclaimerParagraph1__c != null && this.currentMetadata.DisclaimerParagraph1__c != undefined) {
      if (this.currentMetadata.DisclaimerParagraph1__c.includes('{PlanName}') && this.currentMetadata.DisclaimerParagraph1__c.includes('{PlanType}')) {
        this.p1 = '';
        this.p1 = this.currentMetadata.DisclaimerParagraph1__c;
        if(this.rootJson.SelectedPlanInfo.planName != null){
          this.p1 = this.p1.replace('{PlanName}', this.rootJson.SelectedPlanInfo.planName);
        }else{
          this.p1 = this.p1.replace('{PlanName}', 'Plan Not Selected');
        }

        if(this.rootJson.SelectedPlanInfo.businessUnit != null){
          this.p1 = this.p1.replace('{PlanType}', this.rootJson.SelectedPlanInfo.businessUnit);
        }else{
          this.p1 = this.p1.replace('({PlanType})', '');
        }
      }
    } else {
      this.p1 = 'Plan Not Selected';
    }

    if (this.currentMetadata.DisclaimerParagraph2__c != null && this.currentMetadata.DisclaimerParagraph2__c != undefined) {
      if (this.currentMetadata.DisclaimerParagraph2__c.includes('{Company}')) {
        this.p2 = '';
        this.p2 = this.currentMetadata.DisclaimerParagraph2__c;
        this.p2 = this.p2.replace('{Company}', this.company);
      }
    } else {
      this.p2 = '';
    }

    if (this.currentMetadata.DisclaimerParagraph3__c != null && this.currentMetadata.DisclaimerParagraph3__c != undefined) {
      if (this.currentMetadata.DisclaimerParagraph3__c.includes('{Date}') && this.currentMetadata.DisclaimerParagraph3__c.includes('{Year}') && this.currentMetadata.DisclaimerParagraph3__c.includes('{Time}')) {
        this.p3 = '';
        this.p3 = this.currentMetadata.DisclaimerParagraph3__c;
        this.p3 = this.p3.replace('{Date}', this.date);
        this.p3 = this.p3.replace('{Year}', this.year);
        this.p3 = this.p3.replace('{Time}', this.time);
      }
    } else {
      this.p3 = '';
    }

    if (this.currentMetadata.DisclaimerParagraph5__c != null && this.currentMetadata.DisclaimerParagraph5__c != undefined) {
      if (this.currentMetadata.DisclaimerParagraph5__c.includes('{Company}')) {
        this.p5 = '';
        this.p5 = this.currentMetadata.DisclaimerParagraph5__c;
        this.p5 = this.p5.replace('{Company}', this.company);
      }
    } else {
      this.p5 = '';
    }

    if (this.currentMetadata.DisclaimerParagraph6__c != null && this.currentMetadata.DisclaimerParagraph6__c != undefined) {
      if (this.currentMetadata.DisclaimerParagraph6__c.includes('{Company}')) {
        this.p6 = '';
        this.p6 = this.currentMetadata.DisclaimerParagraph6__c;
        this.p6 = this.p6.replace('{Company}', this.company);
      }
    } else {
      this.p6 = '';
    }

    if (this.currentMetadata.DisclaimerParagraph8__c != null && this.currentMetadata.DisclaimerParagraph8__c != undefined) {
      if (this.currentMetadata.DisclaimerParagraph8__c.includes('{ContactURL}')) {
        this.p8 = '';
        this.p8 = this.currentMetadata.DisclaimerParagraph8__c;
        this.p8 = this.p8.replace('{ContactURL}', this.contactURL);
      }
    } else {
      this.p8 = '';
    }

    if (this.type == 'Provider') {
      /* Provider Filter Data */
      if (this.inputParams.input != null) {
        /* Wheelchair Accessible */
        if ('wheelchair' in this.inputParams.input) {
          if (this.inputParams.input.wheelchair == '' || this.inputParams.input.wheelchair == false) {
            this.validParams.wheelchair = '-';
          } else if (this.inputParams.input.wheelchair == true || this.inputParams.input.wheelchair == 'true') {
            this.validParams.wheelchair = 'Yes';
          }
        } else {
          this.validParams.wheelchair = '-';
        }
        /* Accepting New Patients */
        if ('acceptingNewPatients' in this.inputParams.input) {
          if (this.inputParams.input.acceptingNewPatients == '' || this.inputParams.input.acceptingNewPatients == false) {
            this.validParams.acceptingNewPatients = '-';
          } else if (this.inputParams.input.acceptingNewPatients == true || this.inputParams.input.acceptingNewPatients == 'true') {
            this.validParams.acceptingNewPatients = 'Yes';
          }
        } else {
          this.validParams.acceptingNewPatients = '-';
        }
        /* Gender */
        if ('gender' in this.inputParams.input) {
          if (this.inputParams.input.gender == '') {
            this.validParams.gender = 'Either';
          } else if (this.inputParams.input.gender != '') {
            this.validParams.gender = this.inputParams.input.gender;
          }
        } else {
          this.validParams.gender = 'Either';
        }
        /* Language */
        if ('language' in this.inputParams.input) {
          if (this.inputParams.input.language == '') {
            this.validParams.language = 'All';
          } else if (this.inputParams.input.language != '') {
            this.validParams.language = this.inputParams.input.language;
          }
        } else {
          this.validParams.language = 'All';
        }
        /* Hospital Affiliation */
        if ('hospitalAffiliation' in this.inputParams.input) {
          if (this.inputParams.input.hospitalAffiliation == '') {
            this.validParams.hospitalAffiliation = 'All';
          } else if (this.inputParams.input.hospitalAffiliation != '') {
            this.validParams.hospitalAffiliation = this.inputParams.input.hospitalAffiliation;
          }
        } else {
          this.validParams.hospitalAffiliation = 'All';
        }
        /* ACPNY */
        if ('ACPNY' in this.inputParams.input) {
          if (this.inputParams.input.ACPNY == '' || this.inputParams.input.ACPNY == false) {
            this.validParams.ACPNY = '-';
          } else if (this.inputParams.input.ACPNY == true || this.inputParams.input.ACPNY == 'true') {
            this.validParams.ACPNY = 'Yes';
          }
        } else {
          this.validParams.ACPNY = '-';
        }
        /* BronxDocs */
        if ('bronxDocs' in this.inputParams.input) {
          if (this.inputParams.input.bronxDocs == '' || this.inputParams.input.bronxDocs == false) {
            this.validParams.bronxDocs = '-';
          } else if (this.inputParams.input.bronxDocs == true || this.inputParams.input.bronxDocs == 'true' || this.inputParams.input.bronxDocs == 'Y') {
            this.validParams.bronxDocs = 'Yes';
          }
        } else {
          this.validParams.bronxDocs = '-';
        }
        /* FHN */
        if ('fhn' in this.inputParams.input) {
          if (this.inputParams.input.fhn == '' || this.inputParams.input.fhn == false) {
            this.validParams.fhn = '-';
          } else if (this.inputParams.input.fhn == true || this.inputParams.input.fhn == 'true' || this.inputParams.input.fhn == 'Y') {
            this.validParams.fhn = 'Yes';
          }
        } else {
          this.validParams.fhn = '-';
        }
        /* Homeless Shelter */
        if ('homelessShelter' in this.inputParams.input) {
          if (this.inputParams.input.homelessShelter == '' || this.inputParams.input.homelessShelter == false) {
            this.validParams.homelessShelter = '-';
          } else if (this.inputParams.input.homelessShelter == true || this.inputParams.input.homelessShelter == 'true') {
            this.validParams.homelessShelter = 'Yes';
          }
        } else {
          this.validParams.homelessShelter = '-';
        }
        console.log('Valid Params =>', this.validParams);
      } else {
        console.log('No Params');
      }
      this.createProviderCommercialPDF(options, headerConfig, headerTableConfig, maxLineWidth);

    } else {
      /* Facility Filter Data */
      if (this.inputParams.input != null) {
        /* Accreditation */
        if ('accreditation' in this.inputParams.input) {
          if (this.inputParams.input.accreditation == '') {
            this.validParams.accreditation = 'All';
          } else if (this.inputParams.input.accreditation != '') {
            this.validParams.accreditation = this.inputParams.input.accreditation;
          }
        } else {
          this.validParams.accreditation = 'All';
        }
        /* Wheelchair */
        if ('wheelchair' in this.inputParams.input) {
          if (this.inputParams.input.wheelchair == '' || this.inputParams.input.wheelchair == false) {
            this.validParams.wheelchair = 'No';
          } else if (this.inputParams.input.wheelchair == true || this.inputParams.input.wheelchair == 'true') {
            this.validParams.wheelchair = 'Yes';
          }
        } else {
          this.validParams.wheelchair = 'No';
        }
        /* Center of Excellence (COE) */
        if ('coe' in this.inputParams.input) {
          if (this.inputParams.input.coe == '' || this.inputParams.input.coe == false) {
            this.validParams.coe = 'No';
          } else if (this.inputParams.input.coe == true || this.inputParams.input.coe == 'true') {
            this.validParams.coe = 'Yes';
          }
        } else {
          this.validParams.coe = 'No';
        }
        console.log('Valid Params =>', this.validParams);
      } else {
        console.log('No Params');
      }
       this.createFacilityCommercialPDF(options, headerConfig, headerTableConfig, maxLineWidth);
    }
    this.closeModal();
  }

  async getData() {
    this.loading = true;
    this.getDates();
    this.memberInfo = this.rootJson.MemberInfo;
    this.currentMetadata = this.disclaimers.records;

    this.pdfName = this.currentMetadata.Document_Name__c;
    if (this.pdfName != null && this.pdfName != undefined) {
      if (this.currentMetadata.Document_Name__c.includes('{today}')) {
        this.pdfName = this.currentMetadata.Document_Name__c.replace('{today}', this.todaydot);
      } else {
        this.pdfName = this.pdfName;
      }
    } else {
      this.pdfName = this.pdfName;
    }

    /* Set common inputs to Member_FindDoctorExport and Member_findFacility */
    this.ipFormattedList = [];
    this.ipZipCode = this.rootJson.zipCode;
    this.ipPlanId = this.rootJson.planId;
    this.ipDistance = this.rootJson.distance;
    this.ipNetworkId = this.rootJson.networkId;
    this.ipSize = this.currentMetadata.Records_to_Display__c;
    this.ipTenantId = this.rootJson.tenantId;
    this.ipPlanType = this.rootJson.SelectedPlanInfo.brand;
    this.ipNetworkCode = this.rootJson.SelectedPlanInfo.networkCode;            // Network Code

    if (this.type == 'Provider') {
      /* Set Additional Filters Input Params - Provider */
      this.ipServiceType = this.rootJson.ServiceType;                             // Service Type
      // Specialty
      console.log('this.inputParams.input.providerSpeciality', this.inputParams.input.providerSpeciality);
      if (this.inputParams.input.providerSpeciality == '') {
        this.ipProviderSpeciality = 'All Selected';
      } else {
        this.ipProviderSpeciality = this.inputParams.input.providerSpeciality;
      }
      this.ipLanguage = this.inputParams.input.language;                          // Language
      this.ipGender = this.inputParams.input.gender;                              // Gender
      this.ipHospitalAffiliation = this.inputParams.input.hospitalAffiliation;    // Hospital Affiliation
      this.ipWheelchair = this.inputParams.input.wheelchair;                      // Wheelchair
      this.ipAcceptingNewPatients = this.inputParams.input.acceptingNewPatients;  // Accepting New Patients
      this.ipPreferred = this.inputParams.input.preferredOnly;                    // Preferred
      this.ipACPNY = this.inputParams.input.ACPNY;                                // ACPNY 
      this.ipHOMELESS = this.inputParams.input.homelessShelter                    // Homeless Shelter            
      this.ipProviderName = this.inputParams.input.providerFullName;              // Provider Name   
      this.ipCOE = this.inputParams.input.coe;                                    // COE
      this.ipFHN = this.inputParams.input.fhn;                                    // FHN

      // Check public nodes to retrieve last name/zip code from Find Care
      if (this.rootJson.isPublic == true) {
        if(this.rootJson.firstNamePublic != null){
          this.ipfirstName = this.rootJson.firstNamePublic;
        }else{
          this.ipfirstName = '';
        }
        if(this.rootJson.lastNamePublic != null){
          this.iplastName = this.rootJson.lastNamePublic;
        }else{
          this.iplastName = '';
        }
        this.ipZipCode = this.rootJson.zipCodePublic

      }else {
        if (this.rootJson.firstName == undefined || this.rootJson.firstName == null) {
          this.ipfirstName = "";
        } else {
          this.ipfirstName = this.rootJson.firstName;                               // First Name
        }
        if (this.rootJson.lastName == undefined || this.rootJson.lastName == null) {
          this.iplastName = "";
        } else {
          this.iplastName = this.rootJson.lastName;                               // Last Name
        }
        this.ipZipCode = this.rootJson.zipCode;
      }

      if (this.inputParams.input.order == undefined || this.inputParams.input.order == null) {
        this.ipOrder = "";
      } else {
        this.ipOrder = this.inputParams.input.order;                              // Order
      }

      if (this.inputParams.input.sortByField == undefined || this.inputParams.input.sortByField == null) {
        this.ipSortByField = "";
      } else {
        this.ipSortByField = this.inputParams.input.sortByField;                  // Sort By
      }

      let myinputs =
      {
        zipCode: this.ipZipCode,
        planId: this.ipPlanId,
        distance: this.ipDistance,
        networkId: this.ipNetworkId,
        ServiceType: this.ipServiceType,
        order: this.ipOrder,
        size: this.ipSize,
        tenantId: this.ipTenantId,
        planType: this.ipPlanType,
        sortByField: this.ipSortByField,
        providerSpeciality: this.ipProviderSpeciality,
        networkCode: this.ipNetworkCode,
        /* Filter Section Input - Provider */
        language: this.ipLanguage,
        gender: this.ipGender,
        hospitalAffiliation: this.ipHospitalAffiliation,
        wheelchair: this.ipWheelchair,
        acceptingNewPatients: this.ipAcceptingNewPatients,
        preferredOnly: this.ipPreferred,
        ACPNY: this.ipACPNY,
        homelessShelter: this.ipHOMELESS,
        providerFullName: this.ipProviderName,
        firstName: this.ipfirstName,
        lastName: this.iplastName,
        coe: this.ipCOE
      }
      const parameters = {
        input: myinputs,
        sClassName: "omnistudio.IntegrationProcedureService",
        sMethodName: "Member_FindDoctorExport",
        options: "{}",
      }

      let response = await this.omniRemoteCall(parameters, true);
      console.log('Response IP Provider', JSON.parse(JSON.stringify(response)));
      return response;

    } else if (this.type == 'Facility') {
      /* Set Additional Filters Input Params - Facility */
      this.ipFacilityType = this.inputParams.input.facilityType;
      this.ipCOE = this.inputParams.input.coe;
      this.ipAccreditation = this.inputParams.input.accreditation;                 // Accreditation
      this.ipSortByField = this.inputParams.input.sortByField;                     // Sort By
      this.ipWheelchair = this.inputParams.input.wheelchair;                       // Wheelchair
      if (this.rootJson.facilityName == undefined || this.rootJson.facilityName == null) {
        this.ipfacilityName = "";
      } else {
        this.ipfacilityName = this.rootJson.facilityName;
      }

      if(this.ipCOE == undefined || this.ipCOE == null){
        this.ipCOE = "";
      }

      if(this.ipAccreditation == undefined || this.ipAccreditation == null){
        this.ipAccreditation = "";
      }

      if(this.ipOrder == undefined || this.ipOrder == null){
        this.ipOrder = "";
      }

      if(this.ipWheelchair == undefined || this.ipWheelchair == null){
        this.ipWheelchair = "";
      }

      if(this.ipSortByField == undefined || this.ipSortByField == null){
        this.ipSortByField = "";
      }

      let myinputs =
      {
        zipCode: this.ipZipCode,
        planId: this.ipPlanId,
        distance: this.ipDistance,
        networkId: this.ipNetworkId,
        order: this.ipOrder,
        size: this.ipSize,
        tenantId: this.ipTenantId,
        planType: this.ipPlanType,
        sortByField: this.ipSortByField,
        networkCode: this.ipNetworkCode,
        /* Filter Section Input - Facility */
        wheelchair: this.ipWheelchair,
        facilityType: this.ipFacilityType,
        accreditation: this.ipAccreditation,
        facilityName: this.ipfacilityName,
        coe: this.ipCOE,
        retrieveRaw: "Y",
        isExport: "Y",
      }
      console.log('Facility Input => ', myinputs);
      const parameters = {
        input: myinputs,
        sClassName: "omnistudio.IntegrationProcedureService",
        sMethodName: "Member_findFacility",
        options: "{}",
      }

      let response = await this.omniRemoteCall(parameters, true);
      console.log('Response IP Facility', JSON.parse(JSON.stringify(response)));
      return response;
    } else {
      console.log('Not valid flow to print PDF');
      this.loading = false;
    }
  }

  async createProviderCommercialPDF(options, headerConfig, headerTableConfig, maxLineWidth) {
    var doc = await new jspdf.jsPDF(options);
    var tenant;
    var rgb = [];
    // Page 01
    tenant = 'Attentis';
    rgb = [24, 60, 124];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    //doc.text(this.todayMark, 150, 25);
    doc.text(this.p1, 10, 36);
    doc.setFont("helvetica", "normal");
    this.textLines = doc.splitTextToSize(this.p2, maxLineWidth);
    doc.text(this.textLines, 10, 48);
    this.textLines = doc.splitTextToSize(this.p3, maxLineWidth);
    doc.text(this.textLines, 10, 58);
    this.textLines = doc.splitTextToSize(this.currentMetadata.DisclaimerParagraph4__c, maxLineWidth);
    doc.text(this.textLines, 10, 68);
    this.textLines = doc.splitTextToSize(this.p5, maxLineWidth);
    doc.text(this.textLines, 10, 84); //+6xrow
    this.textLines = doc.splitTextToSize(this.p6, maxLineWidth);
    doc.text(this.textLines, 10, 100);

    // Find Care Public
    let networkUI;
    let planUI;
    let zipCodeUI;

    if(this.rootJson.SelectedPlanInfo.networkName != null){
      networkUI = this.rootJson.SelectedPlanInfo.networkName;
    }else{
      networkUI = '-';
    }

    if(this.rootJson.SelectedPlanInfo.planName != null){
      planUI = this.rootJson.SelectedPlanInfo.planName;
    }else{
      planUI = '-';
    }

    console.log('zipCode', this.rootJson.zipCode);
    if(this.rootJson.zipCode != null){
      zipCodeUI = this.rootJson.zipCode;
    }else{
      zipCodeUI = '-';
    }

    // Search Criteria Section
    doc.setLineWidth(0.25);
    doc.line(10, 112, 200, 112);
    doc.setFont("helvetica", "bold");
    doc.text(this.currentMetadata.DisclaimerParagraph7__c, 10, 124);
    // Row 1
    doc.setFont("helvetica", "bold"); doc.text(`Network`, 10, 137);
    doc.setFont("helvetica", "normal"); this.textLines = doc.splitTextToSize(networkUI, 60); doc.text(this.textLines, 10, 141);
    doc.setFont("helvetica", "bold"); doc.text(`Plan`, 75, 137);
    doc.setFont("helvetica", "normal"); this.textLines = doc.splitTextToSize(planUI, 60); doc.text(this.textLines, 75, 141);
    doc.setFont("helvetica", "bold"); doc.text(`Zip`, 140, 137);
    doc.setFont("helvetica", "normal"); doc.text(zipCodeUI, 140, 141);
    // Row 2
    doc.setFont("helvetica", "bold"); doc.text(`Distance from Zip`, 10, 155);
    doc.setFont("helvetica", "normal"); this.textLines = doc.splitTextToSize(this.rootJson.distance, 60); doc.text(this.textLines, 10, 159);
    doc.setFont("helvetica", "bold"); doc.text(`Specialty`, 75, 155);
    doc.setFont("helvetica", "normal"); this.textLines = doc.splitTextToSize(this.specialtyFilterLabel, 60); doc.text(this.textLines, 75, 159);
    doc.setFont("helvetica", "bold"); doc.text(`Wheelchair Accessible`, 140, 155);
    doc.setFont("helvetica", "normal"); doc.text(this.validParams.wheelchair, 140, 159);
    // Row 3
    doc.setFont("helvetica", "bold"); doc.text(`Accepting New Patients`, 10, 173);
    doc.setFont("helvetica", "normal"); doc.text(this.validParams.acceptingNewPatients, 10, 177);
    doc.setFont("helvetica", "bold"); doc.text(`Gender`, 75, 173);
    doc.setFont("helvetica", "normal"); doc.text(this.validParams.gender, 75, 177);
    doc.setFont("helvetica", "bold"); doc.text(`Language`, 140, 173);
    doc.setFont("helvetica", "normal"); doc.text(this.validParams.language, 140, 177);
    // Row 4
    doc.setFont("helvetica", "bold"); doc.text(`Hospital Affiliation`, 10, 191);
    doc.setFont("helvetica", "normal"); this.textLines = doc.splitTextToSize(this.validParams.hospitalAffiliation, 60); doc.text(this.textLines, 10, 195);
    doc.setFont("helvetica", "bold"); doc.text(`Homeless Shelter`, 75, 191);
    doc.setFont("helvetica", "normal"); doc.text(this.validParams.homelessShelter, 75, 195);
    doc.setLineWidth(0.25);
    doc.line(10, 220, 200, 220);

    doc.addImage(WheelchairAccessiblePNG, 'PNG', 70, 225, 7, 7, '', 'FAST');
    doc.text(`- Wheelchair Accessible`, 78, 230);
    doc.addImage(PreferredProviderPNG, 'PNG', 120, 225, 7, 7, '', 'FAST');
    doc.text(`- PCP`, 129, 230);

    console.log('this.ipFormatedList', this.ipFormattedList);
    doc.autoTable({
      html: this.template.querySelector(".myTable"),
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 57 },
        2: { cellWidth: 30 },
        3: { cellWidth: 40 },
      },
      bodyStyles: { minCellHeight: 28, lineColor: [0, 0 ,0] },
      startY: 240,
      theme: 'grid',
      showHead: 'firstPage',
      margin: { bottom: 15, top: 30},
      headStyles: { fillColor: rgb },
      didDrawPage: function (data) {
        // Header
        doc.addImage(attentislogo, 'PNG', 6, 0, 80, 27);
      },
      didDrawCell: function (data) {
        if (data.column.index === 0 && data.cell.section === 'body') {
          var td = data.cell.raw;
          if (td.getElementsByTagName('img')[0] != null) {
            var img = td.getElementsByTagName('img')[0];
            doc.addImage(img.src, data.cell.x + 2, data.cell.y + 16, 6, 6);
          }

          if (td.getElementsByTagName('img')[1] != null) {
            var img = td.getElementsByTagName('img')[1];
            doc.addImage(img.src, data.cell.x + 8, data.cell.y + 16, 6, 6);
          }

          if (td.getElementsByTagName('img')[2] != null) {
            var img = td.getElementsByTagName('img')[2];
            doc.addImage(img.src, data.cell.x + 15, data.cell.y + 16, 6, 6);
          }
        }
      }
    });

    if (this.lob == 'Commercial' || this.lob == 'Medicaid') {
      doc.addPage();
      doc.addImage(attentislogo, 'PNG', 6, 0, 80, 27);
      this.textLines = doc.splitTextToSize(this.p8, maxLineWidth);
      doc.text(10, 32, this.textLines);
      doc.addImage(attentisMedicaidDisclaimer1, 'PNG', 2, 45, 205, 242, '', 'FAST');
      doc.addPage();
      doc.addImage(attemtosMedicaidDisclaimer2, 'PNG', 2, 5, 205, 275, '', 'FAST');
      doc.addImage(attentislogo, 'PNG', 6, 0, 80, 27);
    } else {
      doc.addPage();
      doc.addImage(attentislogo, 'PNG', 6, 0, 80, 27);
      this.textLines = doc.splitTextToSize(this.p8, maxLineWidth);
      doc.text(10, 32, this.textLines);
      //doc.addImage(attentisMedicareDisclaimer, 'PNG', -12, 50, 235, 242, '', 'FAST');
      doc.addPage();
      //doc.addImage(attemtisMedicareDisclaimer2, 'PNG', -12, 10, 230, 275, '', 'FAST');
      doc.addImage(attentislogo, 'PNG', 6, 0, 80, 27);
    }

    const pages = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    for (let j = 1; j < pages + 1; j++) {
      let horizontalPos = pageWidth / 2;  //210.0015555555555
      let verticalPos = pageHeight - 5;  //297.0000833333333
      doc.setLineWidth(0.25);
      doc.line(10, 286, 199, 286);
      doc.setPage(j);
      doc.text(`${j} of ${pages}`, horizontalPos, verticalPos, { align: 'center' });
      doc.text(this.today, 10, 290);
      doc.text(`Y0026_203118_C`, 170, 290);
    }
    // Download for Desktop or Mobile
    if (window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes('CommunityHybridContainer')) {
      let base64 = doc.output('datauristring'); // base64 string
      this.downloadPDFForMobile(base64);
      this.loading = false;
      while(this.template.querySelector(".recordList").rows.length > 0) {
        this.template.querySelector(".recordList").deleteRow(0);
      }
    } else {
      doc.save(this.pdfName);
      this.loading = false;
      while(this.template.querySelector(".recordList").rows.length > 0) {
        this.template.querySelector(".recordList").deleteRow(0);
      }
    }

  }

  async createFacilityCommercialPDF(options, headerConfig, headerTableConfig, maxLineWidth) {
    var doc = await new jspdf.jsPDF(options);
    var tenant;
    var rgb = [];
    // Page 01
    tenant = 'Attentis';
    rgb = [24, 60, 124];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    //doc.text(this.todayMark, 150, 25);
    doc.text(this.p1, 10, 36);
    doc.setFont("helvetica", "normal");
    this.textLines = doc.splitTextToSize(this.p2, maxLineWidth);
    doc.text(this.textLines, 10, 48);
    this.textLines = doc.splitTextToSize(this.p3, maxLineWidth);
    doc.text(this.textLines, 10, 58);
    this.textLines = doc.splitTextToSize(this.currentMetadata.DisclaimerParagraph4__c, maxLineWidth);
    doc.text(this.textLines, 10, 68);
    this.textLines = doc.splitTextToSize(this.p5, maxLineWidth);
    doc.text(this.textLines, 10, 84); //+6xrow
    this.textLines = doc.splitTextToSize(this.p6, maxLineWidth);
    doc.text(this.textLines, 10, 100);

    // Search Criteria Section
    doc.setLineWidth(0.25);
    doc.line(10, 112, 200, 112);
    doc.setFont("helvetica", "bold");
    doc.text(this.currentMetadata.DisclaimerParagraph7__c, 10, 124);

    // Row 1
    doc.setFont("helvetica", "bold"); doc.text(`Network`, 10, 137);
    doc.setFont("helvetica", "normal"); this.textLines = doc.splitTextToSize(this.rootJson.SelectedPlanInfo.networkName, 60); doc.text(this.textLines, 10, 141);
    doc.setFont("helvetica", "bold"); doc.text(`Plan`, 75, 137);
    doc.setFont("helvetica", "normal"); this.textLines = doc.splitTextToSize(this.rootJson.SelectedPlanInfo.planName, 60); doc.text(this.textLines, 75, 141);
    doc.setFont("helvetica", "bold"); doc.text(`Zip`, 140, 137);
    doc.setFont("helvetica", "normal"); doc.text(this.rootJson.zipCode, 140, 141);
    // Row 2
    doc.setFont("helvetica", "bold"); doc.text(`Distance from Zip`, 10, 155);
    doc.setFont("helvetica", "normal"); this.textLines = doc.splitTextToSize(this.rootJson.distance, 60); doc.text(this.textLines, 10, 159);
    doc.setFont("helvetica", "bold"); doc.text(`Facility Type`, 75, 155);
    doc.setFont("helvetica", "normal"); this.textLines = doc.splitTextToSize(this.rootJson.facilityType, 60); doc.text(this.textLines, 75, 159);
    doc.setFont("helvetica", "bold"); doc.text(`Wheelchair Accessible`, 140, 155);
    doc.setFont("helvetica", "normal"); doc.text(this.validParams.wheelchair, 140, 159);
    // Row 3
    doc.setFont("helvetica", "bold"); doc.text(`Center of Excellence`, 10, 173);
    doc.setFont("helvetica", "normal"); doc.text(this.validParams.coe, 10, 177);
    doc.setFont("helvetica", "bold"); doc.text(`Accreditation`, 75, 173);
    doc.setFont("helvetica", "normal"); doc.text(this.validParams.accreditation, 75, 177);
    doc.setLineWidth(0.25);
    doc.line(10, 190, 200, 190);

    doc.addImage(OptometryVisionPNG, 'PNG', 85, 195, 7, 7, '', 'FAST');
    doc.text(`- Eyewear`, 93, 200);

    console.log('this.ipFormatedList', this.ipFormattedList);
    doc.autoTable({
      html: this.template.querySelector(".myTableFacility"),
      columnStyles: {
        0: { cellWidth: 66 },
        1: { cellWidth: 73 },
        2: { cellWidth: 46 },
      },
      bodyStyles: { minCellHeight: 28, lineColor: [0, 0 ,0] },
      startY: 215,
      theme: 'grid',
      showHead: 'firstPage',
      margin: { bottom: 15, top: 30},
      headStyles: { fillColor: rgb },
      didDrawPage: function (data) {
        // Header
        doc.addImage(attentislogo, 'PNG', 6, 0, 80, 27);
      },
      margin: { top: 30 },
      didDrawCell: function (data) {
        if (data.column.index === 0 && data.cell.section === 'body') {
          var td = data.cell.raw;
          if (td.getElementsByTagName('img')[0] != null) {
            var img = td.getElementsByTagName('img')[0];
            doc.addImage(img.src, data.cell.x + 2, data.cell.y + 16, 6, 6);
          }

          if (td.getElementsByTagName('img')[1] != null) {
            var img = td.getElementsByTagName('img')[1];
            doc.addImage(img.src, data.cell.x + 8, data.cell.y + 16, 6, 6);
          }

          if (td.getElementsByTagName('img')[2] != null) {
            var img = td.getElementsByTagName('img')[2];
            doc.addImage(img.src, data.cell.x + 15, data.cell.y + 16, 6, 6);
          }
        }
      }
    });

    if (this.lob == 'Commercial' || this.lob == 'Medicaid') {
      doc.addPage();
      doc.addImage(attentislogo, 'PNG', 6, 0, 80, 27);
      this.textLines = doc.splitTextToSize(this.p8, maxLineWidth);
      doc.text(10, 32, this.textLines);
      //doc.addImage(attentisMedicaidDisclaimer1, 'PNG', 2, 45, 205, 242, '', 'FAST');
      doc.addPage();
      //doc.addImage(attentisMedicaidDisclaimer2, 'PNG', 2, 5, 205, 275, '', 'FAST');
      doc.addImage(attentislogo, 'PNG', 6, 0, 80, 27);
    } else {
      doc.addPage();
      doc.addImage(attentislogo, 'PNG', 6, 0, 80, 27);
      this.textLines = doc.splitTextToSize(this.p8, maxLineWidth);
      doc.text(10, 32, this.textLines);
      //doc.addImage(attentisMedicareDisclaimer, 'PNG', -12, 50, 235, 242, '', 'FAST');
      doc.addPage();
      //doc.addImage(attemtos,edocareDisclaimer2, 'PNG', -12, 10, 230, 275, '', 'FAST');
      doc.addImage(attentislogo, 'PNG', 6, 0, 80, 27);
    }

    const pages = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    for (let j = 1; j < pages + 1; j++) {
      let horizontalPos = pageWidth / 2;  //210.0015555555555
      let verticalPos = pageHeight - 5;  //297.0000833333333
      doc.setLineWidth(0.25);
      doc.line(10, 286, 199, 286);
      doc.setPage(j);
      doc.text(`${j} of ${pages}`, horizontalPos, verticalPos, { align: 'center' });
      doc.text(this.today, 10, 290);
      doc.text(`Y0026_203118_C`, 170, 290);
    }
    // Download for Desktop or Mobile
    if (window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes('CommunityHybridContainer')) {
      let base64 = doc.output('datauristring'); // base64 string
      this.downloadPDFForMobile(base64);
      this.loading = false;
      while(this.template.querySelector(".recordListFacility").rows.length > 0) {
        this.template.querySelector(".recordListFacility").deleteRow(0);
      }
    } else {
      doc.save(this.pdfName);
      this.loading = false;
      while(this.template.querySelector(".recordListFacility").rows.length > 0) {
        this.template.querySelector(".recordListFacility").deleteRow(0);
      }
    }
}

  async createMultipleOfficePDF(options, headerConfig, headerTableConfig, maxLineWidth) {
  var doc = await new jspdf.jsPDF(options);
  // Page 01
  doc.addImage(attentislogo, 'PNG', 5, 0, 90, 30);
  // Search Criteria Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(this.todayMark, 150, 25);
  doc.text("How do you get insurance:", 10, 41); doc.setFont("helvetica", "normal"); doc.text(this.lobToShow, 56, 41); doc.setFont("helvetica", "bold");
  doc.text("Type of plan:", 10, 47); doc.setFont("helvetica", "normal"); doc.text(this.multipleOfficeData.SelectedPlanInfo.businessUnit, 33, 47); doc.setFont("helvetica", "bold");
  doc.text("Zip:", 10, 53); doc.setFont("helvetica", "normal"); doc.text(this.multipleOfficeData.zipCode, 17, 53);
  // Disclaimer
  doc.setFontSize(10);
  this.textLines = doc.splitTextToSize(this.p1, maxLineWidth);
  doc.text(this.textLines, 10, 65);
  this.textLines = doc.splitTextToSize(this.currentMetadata.DisclaimerParagraph2__c, maxLineWidth);
  doc.text(this.textLines, 10, 88);
  this.textLines = doc.splitTextToSize(this.currentMetadata.DisclaimerParagraph3__c, maxLineWidth);
  doc.text(this.textLines, 10, 115);
  // Languaje & Non-Discrimination Notice
  doc.setFont("helvetica", "bold");
  doc.text(this.currentMetadata.DisclaimerParagraph4__c, 10, 127);
  doc.setFont("helvetica", "normal");
  this.textLines = doc.splitTextToSize(this.currentMetadata.DisclaimerParagraph5__c, maxLineWidth)
  doc.text(this.textLines, 10, 131);
  doc.text(this.currentMetadata.DisclaimerParagraph6__c, 10, 149);
  this.textLines = doc.splitTextToSize(this.currentMetadata.DisclaimerParagraph7__c, maxLineWidth);
  doc.text(this.textLines, 10, 156);
  this.textLines = doc.splitTextToSize(this.currentMetadata.DisclaimerParagraph8__c, maxLineWidth);
  doc.text(this.textLines, 10, 166);
  doc.text(this.currentMetadata.DisclaimerParagraph9__c, 10, 178);
  this.textLines = doc.splitTextToSize(this.currentMetadata.DisclaimerParagraph10__c, maxLineWidth);
  doc.text(this.textLines, 10, 186);
  doc.text(this.currentMetadata.DisclaimerParagraph11__c, 10, 222);
  // Page 02
  doc.addPage();
  doc.addImage(attentislogo, 'PNG', 5, 0, 90, 30);
  //doc.addImage(attentisDisclaimer, 'PNG', 8, 30, 186, 216, '', 'FAST');
  // Page 03
  doc.addPage();
  doc.addImage(attentislogo, 'PNG', 5, 0, 90, 30);
  this.textLines = doc.splitTextToSize(this.currentMetadata.DisclaimerParagraph12__c, maxLineWidth);
  doc.text(this.textLines, 10, 35);
  this.textLines = doc.splitTextToSize(this.p13, maxLineWidth);
  doc.text(this.textLines, 10, 47);
  this.textLines = doc.splitTextToSize(this.currentMetadata.DisclaimerParagraph14__c, maxLineWidth);
  doc.text(this.textLines, 10, 59);
  this.textLines = doc.splitTextToSize(this.currentMetadata.DisclaimerParagraph15__c, maxLineWidth);
  doc.text(this.textLines, 10, 79);
  doc.setLineWidth(0.5);
  doc.line(10, 96, 192, 96);
  doc.setFont("helvetica", "bold");
  doc.text(this.currentMetadata.DisclaimerParagraph16__c, 10, 104);
  // Row 1
  doc.setFont("helvetica", "bold"); doc.text(`Provider Name`, 10, 112);
  doc.setFont("helvetica", "normal"); doc.text(this.tempProvName, 10, 116);
  doc.setLineWidth(0.5);
  doc.line(10, 126, 192, 126);
  doc.addPage();
  doc.table(10, 10, this.officeTableList, headerConfig, headerTableConfig);
  const pages = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  for (let j = 1; j < pages + 1; j++) {
    let horizontalPos = pageWidth / 2;  //210.0015555555555
    let verticalPos = pageHeight - 5;  //297.0000833333333
    doc.setPage(j);
    doc.text(`${j} of ${pages}`, horizontalPos, verticalPos, { align: 'center' });
  }
  // Download for Desktop or Mobile
  if (window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes('CommunityHybridContainer')) {
    let base64 = doc.output('datauristring'); // base64 string
    this.downloadPDFForMobile(base64);
    this.loading = false;
  } else {
    doc.save(this.pdfName);
    this.loading = false;
  }
}

/* Common Methods */
getDates() {
  /* Today Date */
  let today = new Date();

  let daynum = today.getDay(); //0-6
  let monthnum = today.getMonth(); //0-12

  let dd = String(today.getDate()).padStart(2, '0'); // 1-31
  let mm = String(today.getMonth() + 1).padStart(2, '0'); // 01-12
  let yyyy = today.getFullYear(); // 2021
  let hour = today.getHours();
  let min = today.getMinutes();
  today = mm + '/' + dd + '/' + yyyy;

  /* Set Months and Days */
  let weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let monthyear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  /* Watermark Date */
  let todayMark = '';
  //todayMark = weekday[daynum] + ', ' + monthyear[monthnum] + ' ' + dd + ', ' + yyyy;
  todayMark = monthyear[monthnum] + ' ' + dd + ', ' + yyyy;
  this.day = weekday[daynum];
  this.date = monthyear[monthnum] + ' ' + dd;
  this.year = yyyy;

  /* Get AM or PM */
  let ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12;
  hour = hour < 10 ? '0' + hour : hour;
  min = min < 10 ? '0' + min : min;

  /* Variable values */
  this.today = today;
  this.todayMark = todayMark;
  this.time = today + ' ' + hour + ':' + min + ' ' + ampm;
  this.todaydot = mm + '.' + dd + '.' + yyyy;
}

  async downloadPDFForMobile(base64) {
  // MPV-1309 US Sprint 11
  const request = {
    type: "integrationprocedure",
    value: {
      ipMethod: "Member_Base64ToContentDoc",
      inputMap: {
        "base64": base64,
        "title": this.pdfName,
        "fileNameWithExtension": this.pdfName,
        //"contentType": "application/pdf"
      },
      optionsMap: "{}"
    }
  };
  util
    .getDataHandler(JSON.stringify(request))
    .then(result => {
      const contentDocId = JSON.parse(result).IPResult.contentDocId;
      this.loading = false;
      let pathTenant;
      //URL Based on tenant
      pathTenant = 'memberportal'
      this[NavigationMixin.Navigate]({
        type: 'standard__webPage',
        attributes: {
          "url": `${window.top.location.origin}/${pathTenant}/sfc/servlet.shepherd/document/download/${contentDocId}?operationContext=S1`
        }
      });
    })
    .catch(error => {
      console.log("error while posting data", JSON.stringify(error));
      this.loading = false;
    });
  }

  closeModal() {
    this.over200 = false;
  }
}
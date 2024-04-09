import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class UsefullLinks extends NavigationMixin(LightningElement) {

    fullLinks = [ 
        { label: 'Find a Provider', url: 'https://www.antidotehealth.com/insurance/find-provider?_gl=1*muqmne*_gcl_au*MTgzNjA1NTY1MS4xNzEyNjc0MDcx'},
        { label: 'Drug Formulary Ohio', url: 'https://client.formularynavigator.com/Search.aspx?siteCode=6087811787'},
        { label: 'Pharmacy Locator Ohio', url: 'https://ah.rxacloud.com/pharmacylocatorv2?state=OH'},
    ]   
}
import { LightningElement } from 'lwc';
import template from './omniScriptTextElementZipCode.html';
import { OmniscriptBaseMixin } from 'omnistudio/omniscriptBaseMixin';

export default class OmniScriptTextElementZipCode extends OmniscriptBaseMixin(LightningElement) {

    loading = false;
    // MPV-1030 : Automatically fill member zip code when on mobile app
   connectedCallback() {
        if (window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes('CommunityHybridContainer')){
            this.getLocation();
        }
    }
    
    getLocation() {

        if (navigator.geolocation) {
            
            navigator.geolocation.getCurrentPosition((position)=>{
                this.loading = true;
                var lat = parseFloat(position.coords.latitude);
                var lng = parseFloat(position.coords.longitude);
          
                    //old api key
                    //var geocoding ='https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&sensor=false' + '&key=AIzaSyDWLziF73XUtjB-WiMsIFqWx8-IuX8MbP8';
                    
                    //new api key
                    var geocoding ='https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&sensor=false' + '&key=AIzaSyBpbOK2uCz2u5NF2UxCbIqpmPtzKlOl3_A';


                    fetch(geocoding)
                    
                        .then(res => res.json())
                        .then((out) => {                            

                            for(var i in out.results[0].address_components) {
                                // skip items with no types  
                                if(typeof out.results[0].address_components[i].types == 'undefined') {
                                continue;
                                }

                                if(out.results[0].address_components[i].types.indexOf('postal_code') > -1) {

                                    let zipCodeLocation = out.results[0].address_components[i].long_name; 
                                    let zipCodeUseLocation = { TXT_ZipCode: zipCodeLocation};
                                    this.omniApplyCallResp(zipCodeUseLocation);
                                    this.loading = false;   
                                }
                            }
                    }).catch(err => console.error(err));
                
            });

        }
        
        else {
            console.error("Geolocation is not supported by this browser.");

        }
    }

    render(){
        return template;
    }
    
}
import { LightningElement, api, track } from 'lwc';

export default class BenefitsPlanCostShare extends LightningElement {

    @track _benefitspendingrecord;
    hasRendered = false;
    @track costShareRec =[];
    @track newCostShareArr =[];
    @track spendings =[];
    INActive = true;
    OONActive = false;
    INButton;
    OONButton;
    graphDiv=[];
    message="Your plan does not have a deductible."
    INclass = 'nds-show'
    OONclass = "nds-hide"
    errorMessage ='Error --> No data returned from IP'
    defaultNBtn = false


    showOONDiv = true
    showINDiv = true;

    @api
    get benefitspendingrecord() {
        return this._benefitspendingrecord;
    }
    set benefitspendingrecord(value) {
        this._benefitspendingrecord = value;
    }


    dataTransform(){
        if (this._benefitspendingrecord.length === 0) {
            // console.error('no benefit records from parent received');
            } else {
                let count1 = this._benefitspendingrecord.length;
                let count2 = 0;
            this._benefitspendingrecord.forEach(rec=>{
                let progress = (rec.spent * 100) / rec.totalAmount;
                // dont show graph if total amount is zero, but instead show message
                let parsedTotalAmount = parseInt(rec.totalAmount)
                let showGraph = (rec.totalAmount !== "0.00" && parsedTotalAmount >= 1) ? true : false;
                //dont show network tabs if both
                let showINOONTabs = true;
                let both = rec.accumulatorType == "both" ? true : false;
                let inNet = rec.accumulatorType == "In Network" ? true : false;
                let OON = rec.accumulatorType == "Out of Network"? true : false;
                let combo = {
                    "coverageType": rec.coverageType, 
                    "showNetTabs" : showINOONTabs,
                    "showINTab": inNet,
                    "showOONTab": OON,
                    "INbtnID": `${rec.coverageType}-1`,
                    "OONbtnID": `${rec.coverageType}-2`,
                    "BothBtnID": `${rec.coverageType}-3`,
                    "InDivID": `${rec.coverageType}-10`,
                    "OONDivID": `${rec.coverageType}-20`,
                    "BothDivID": `${rec.coverageType}-30`,
                    "showINDiv" : true,
                    "showOONDiv" : false,
                    "both": both,
                    "IIN": false,
                    "IOON" : false,
                    "FIN":false,
                    "FOON": false,
                    "IBoth": false,
                    "FBoth": false  
                }
                if(this.newCostShareArr.length >0){
                    this.newCostShareArr.forEach(element=>{
                        let elIndex = this.newCostShareArr.findIndex(el=>
                        el.coverageType == combo.coverageType)
                        if(count1 >= count2){
                            if(elIndex !== -1 && combo.coverageType == element.coverageType){
                                if(rec.coverageLevel == "INDIVIDUAL"){
                                    if(rec.accumulatorType == "In Network"){
                                        combo.IndIN ={
                                            "showGraph": showGraph,
                                            "coverageLevel": rec.coverageLevel,
                                            "showINTab": inNet,
                                            "totalAmount" : rec.totalAmount, 
                                            "showOONTab": OON,
                                            "progress": progress, 
                                            "spent": rec.spent, 
                                            "remaining": rec.remaining  
                                        }
                                        this.newCostShareArr[elIndex] = {...this.newCostShareArr[elIndex], IIN : true, showINTab: inNet, IndIN: combo.IndIN}
                                        count2++

                                    }else if(rec.accumulatorType == "Out of Network"){
                                        combo.IndOON ={
                                            "showGraph": showGraph,
                                            "coverageLevel": rec.coverageLevel,
                                            "showINTab": inNet,
                                            "totalAmount" : rec.totalAmount, 
                                            "showOONTab": OON,
                                            "progress": progress, 
                                            "spent": rec.spent, 
                                            "remaining": rec.remaining  
                                        }
                                        this.newCostShareArr[elIndex] = {...this.newCostShareArr[elIndex], IOON: true, showOONTab: OON,  IndOON: combo.IndOON}
                                        count2++

                                    }else if(rec.accumulatorType == "both"){
                                        combo.IndBoth ={
                                            "showGraph": showGraph,
                                            "coverageLevel": rec.coverageLevel,
                                            "showINTab": inNet,
                                            "totalAmount" : rec.totalAmount, 
                                            "showOONTab": OON,
                                            "progress": progress, 
                                            "spent": rec.spent, 
                                            "remaining": rec.remaining  
                                        }
                                        this.newCostShareArr[elIndex] = {...this.newCostShareArr[elIndex], IBoth: true, IndBoth: combo.IndBoth}
                                        count2++
                                    }
                                }else if(rec.coverageLevel == "FAMILY"){
                                    if(rec.accumulatorType == "In Network"){
                                        combo.FamIN ={
                                            "showGraph": showGraph,
                                            "coverageLevel": rec.coverageLevel,
                                            "showINTab": inNet,
                                            "totalAmount" : rec.totalAmount, 
                                            "showOONTab": OON,
                                            "progress": progress, 
                                            "spent": rec.spent, 
                                            "remaining": rec.remaining                                
                                        }
                                        this.newCostShareArr[elIndex] = {...this.newCostShareArr[elIndex], showINTab: inNet, FIN: true, FamIN: combo.FamIN}
                                        count2++
                                    }else if (rec.accumulatorType == "Out of Network"){
                                        combo.FamOON ={
                                            "showGraph": showGraph,
                                            "coverageLevel": rec.coverageLevel,
                                            "showINTab": inNet,
                                            "totalAmount" : rec.totalAmount, 
                                            "showOONTab": OON,
                                            "progress": progress, 
                                            "spent": rec.spent, 
                                            "remaining": rec.remaining                                
                                        }
                                        this.newCostShareArr[elIndex] = {...this.newCostShareArr[elIndex], showOONTab : OON, FOON: true, FamOON: combo.FamOON}
                                        count2++
                                    }else if(rec.accumulatorType == "both"){
                                        combo.FamBoth ={
                                            "showGraph": showGraph,
                                            "coverageLevel": rec.coverageLevel,
                                            "showINTab": inNet,
                                            "totalAmount" : rec.totalAmount, 
                                            "showOONTab": OON,
                                            "progress": progress, 
                                            "spent": rec.spent, 
                                            "remaining": rec.remaining  
                                        }
                                        this.newCostShareArr[elIndex] = {...this.newCostShareArr[elIndex], FBoth: true, FamBoth: combo.FamBoth}
                                        count2++
                                    }
                                }
                    
                            }else if (elIndex === -1){
                                if(rec.coverageLevel == "INDIVIDUAL"){
                                    if(rec.accumulatorType == "In Network"){
                                        combo.IndIN= {
                                                "showGraph": showGraph,
                                                "coverageLevel": rec.coverageLevel,
                                                "showINTab": inNet,
                                                "totalAmount" : rec.totalAmount, 
                                                "showOONTab": OON,
                                                "progress": progress, 
                                                "spent": rec.spent, 
                                                "remaining": rec.remaining  
                                            }
                                        combo.IIN= true;
                                    }else if(rec.accumulatorType == "Out of Network"){
                                        combo.IndOON ={
                                            "showGraph": showGraph,
                                            "coverageLevel": rec.coverageLevel,
                                            "showINTab": inNet,
                                            "totalAmount" : rec.totalAmount, 
                                            "showOONTab": OON,
                                            "progress": progress, 
                                            "spent": rec.spent, 
                                            "remaining": rec.remaining  
                                        }
                                        combo.IOON = true;

                                    }else if(rec.accumulatorType == "both"){
                                        combo.IndBoth ={
                                            "showGraph": showGraph,
                                            "coverageLevel": rec.coverageLevel,
                                            "showINTab": inNet,
                                            "totalAmount" : rec.totalAmount, 
                                            "showOONTab": OON,
                                            "progress": progress, 
                                            "spent": rec.spent, 
                                            "remaining": rec.remaining  
                                        }
                                        combo.IBoth = true
                                    }
                                    
                                }else if(rec.coverageLevel == "FAMILY"){
                                    if(rec.accumulatorType == "In Network"){
                                        combo.FamIN ={
                                            "showGraph": showGraph,
                                            "coverageLevel": rec.coverageLevel,
                                            "showINTab": inNet,
                                            "totalAmount" : rec.totalAmount, 
                                            "showOONTab": OON,
                                            "progress": progress, 
                                            "spent": rec.spent, 
                                            "remaining": rec.remaining                                
                                        }
                                        combo.FIN = true;

                                    }else if (rec.accumulatorType == "Out of Network"){
                                        combo.FamOON ={
                                            "showGraph": showGraph,
                                            "coverageLevel": rec.coverageLevel,
                                            "totalAmount" : rec.totalAmount, 
                                            "showOONTab": OON,
                                            "progress": progress, 
                                            "spent": rec.spent, 
                                            "remaining": rec.remaining                                
                                        }
                                        combo.FOON = true;

                                    }else if(rec.accumulatorType == "both"){
                                        combo.FamBoth ={
                                            "showGraph": showGraph,
                                            "coverageLevel": rec.coverageLevel,
                                            "showINTab": inNet,
                                            "totalAmount" : rec.totalAmount, 
                                            "showOONTab": OON,
                                            "progress": progress, 
                                            "spent": rec.spent, 
                                            "remaining": rec.remaining  
                                        }
                                        combo.FBoth = true;

                                    }
                                    this.newCostShareArr.push(combo);
                                    count2++;
                                }
                                this.newCostShareArr.push(combo);
                                count2++;
                            }                            
                        }                        
                    });
                }else if(this.newCostShareArr.length == 0){
                    if(rec.coverageLevel == "INDIVIDUAL"){
                        if(rec.accumulatorType == "In Network"){
                            combo.IndIN ={
                                "showGraph": showGraph,
                                "coverageLevel": rec.coverageLevel,
                                "showINTab": inNet,
                                "totalAmount" : rec.totalAmount, 
                                "showOONTab": OON,
                                "progress": progress, 
                                "spent": rec.spent, 
                                "remaining": rec.remaining, 
                            
                            },
                            combo.IIN= true;

                        }else if(rec.accumulatorType == "Out of Network"){
                            combo.IndOON ={
                                "showGraph": showGraph,
                                "coverageLevel": rec.coverageLevel,
                                "showINTab": inNet,
                                "totalAmount" : rec.totalAmount, 
                                "showOONTab": OON,
                                "progress": progress, 
                                "spent": rec.spent, 
                                "remaining": rec.remaining,
                            
                            },
                            combo.IOON= true
                        }else if (rec.accumulatorType == "both"){
                            combo.IndBoth ={
                                "showGraph": showGraph,
                                "coverageLevel": rec.coverageLevel,
                                "showINTab": inNet,
                                "totalAmount" : rec.totalAmount, 
                                "showOONTab": OON,
                                "progress": progress, 
                                "spent": rec.spent, 
                                "remaining": rec.remaining,
                                                    
                            },
                            combo.IBoth = true

                        }
                        
                    }else if(rec.coverageLevel == "FAMILY"){
                        if(rec.accumulatorType == "In Network"){
                            combo.FamIN ={
                                "showGraph": showGraph,
                                "coverageLevel": rec.coverageLevel,
                                "showINTab": inNet,
                                "totalAmount" : rec.totalAmount, 
                                "showOONTab": OON,
                                "progress": progress, 
                                "spent": rec.spent, 
                                "remaining": rec.remaining,                               
                            },
                            combo.FIN= true

                        }else if (rec.accumulatorType == "Out of Network"){
                            combo.FamOON ={
                                "showGraph": showGraph,
                                "coverageLevel": rec.coverageLevel,
                                "showINTab": inNet,
                                "totalAmount" : rec.totalAmount, 
                                "showOONTab": OON,
                                "progress": progress, 
                                "spent": rec.spent, 
                                "remaining": rec.remaining,
                                                    
                            },
                            combo.FOON = true

                        }else if (rec.accumulatorType == "both"){
                                combo.FamBoth ={
                                    "showGraph": showGraph,
                                    "coverageLevel": rec.coverageLevel,
                                    "showINTab": inNet,
                                    "totalAmount" : rec.totalAmount, 
                                    "showOONTab": OON,
                                    "progress": progress, 
                                    "spent": rec.spent, 
                                    "remaining": rec.remaining,
                                                        
                                },
                                combo.FBoth = true

                            }

                    }
                    this.newCostShareArr.push(combo);
                    count2++

                }
            })
        }
        this.costShareRec = [...this.newCostShareArr];
        this.hasRendered= true;
    } 

    makeOONActive(evt){
        let dataId = evt.target.getAttribute('data-id');
        let deselectDataId = dataId.replace('2', '1')
        let selectedBtn = this.template.querySelector(`[data-id="${dataId}"]`)
        if(this.template.querySelector(`[data-id="${deselectDataId}"]`)){
            let deselectBtn = this.template.querySelector(`[data-id="${deselectDataId}"]`)
            selectedBtn.classList.add("active");
            deselectBtn.classList.remove("active");
        }
        let OONdiv = this.template.querySelector(`[data-id="${dataId}0"]`)
        if(this.template.querySelector(`[data-id="${deselectDataId}0"]`)){
            let INdiv = this.template.querySelector(`[data-id="${deselectDataId}0"]`)
            INdiv.classList.add("nds-hide");
            INdiv.classList.remove("nds-show");
            OONdiv.classList.remove("nds-hide");
            OONdiv.classList.add("nds-show");  
        }      
        
    }

    makeINActive(evt){
        let dataId = evt.target.getAttribute('data-id');
        let deselectDataId = dataId.replace('1', '2')
        let selectedBtn = this.template.querySelector(`[data-id="${dataId}"]`)
        if(this.template.querySelector(`[data-id="${deselectDataId}"]`)){
            let deselectBtn = this.template.querySelector(`[data-id="${deselectDataId}"]`)
            selectedBtn.classList.add("active");
            deselectBtn.classList.remove("active");
        }
        let INdiv = this.template.querySelector(`[data-id="${dataId}0"]`)
        if(this.template.querySelector(`[data-id="${deselectDataId}0"]`)){
            let OONdiv = this.template.querySelector(`[data-id="${deselectDataId}0"]`)
            OONdiv.classList.remove("nds-show");
            OONdiv.classList.add("nds-hide");
            INdiv.classList.remove("nds-hide");
            INdiv.classList.add("nds-show");
        }
    }
            


    connectedCallback(){
    }

    renderedCallback(){
        if(this._benefitspendingrecord.length > 0 && !this.hasRendered){
            this.dataTransform();
        }

        if(this.hasRendered){
            //show OON tab if no IN tab
            this.costShareRec.forEach(rec=>{
                if(rec.IIN === false && rec.IOON === true){
                    if(this.template.querySelector(`[data-id="${rec.OONDivID}"]`)){
                        let OONdiv = this.template.querySelector(`[data-id="${rec.OONDivID}"]`)
                        OONdiv.classList.remove("nds-hide");
                        OONdiv.classList.add("nds-show");  
                    }
                }
            })
        }
    }

}
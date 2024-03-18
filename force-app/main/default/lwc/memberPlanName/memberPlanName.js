import { LightningElement, track } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import pubsub from "omnistudio/pubsub";

export default class MemberPlanName extends OmniscriptBaseMixin(LightningElement) {
   @track plans = [];
   @track planList = [];
   loading = true;
   readOnly = false;
   defaultPlan = "";
   selectedPlanId = "";
   firstRun = false;
   isPublic = false;
   showPlanName = true;

   jsonData;
   networkCodeName;


   connectedCallback() {
      try {
         this.jsonData = JSON.parse(JSON.stringify(this.omniJsonData));

         if (this.jsonData) {
            this.loading = false;
            //Reset readOnly
            this.readOnly = false;

            this.isPublic = this.jsonData.isPublic;
            if (this.isPublic) {
               /******************************************************/
               /************* Handing Public User Request ************/
               /******************************************************/
               let selectedPlanObj = { key: this.jsonData.planName, value: this.jsonData.planName, networkName: this.jsonData.category };
               this.plans.push(selectedPlanObj);
               this.defaultPlan = this.jsonData.planName;
               this.networkCodeName = this.jsonData.category;
               // this.showPlanName = false;
               

               this.updateNetworkName(this.networkCodeName);
               this.updateSelectedPlan(selectedPlanObj);
               this.publishMessage();
            } else {
               /******************************************************/
               /******** Handing Authenticated User Request **********/
               /******************************************************/

               //Get Member List
               let planAllList = [];
               planAllList = this.jsonData.ServiceTypeInfo;

               //MPV-698 Filtering out Terminated Plan
               this.planList = planAllList.filter(function (plan) {
                  return plan.status !== "Terminated";
               });

               if (Array.isArray(this.planList) && this.planList.length === 1) {
                  let planArr = this.planList;
                  let planCodeName;

                  if (planArr[0].planType === "M" || planArr[0].planType === "D" || planArr[0].planType === "R" || planArr[0].planType === "V") {
                     planArr.forEach((plan) => {
                        plan.key = plan.planId;
                        plan.value = plan.planName;
                     });
                     this.readOnly = true;
                     this.plans = planArr;
                     this.defaultPlan = planArr[0].planName;

                     if (this.plans[0].planName != null || this.plans[0].planName != undefined) {
                        planCodeName = this.plans[0].planName;
                        let plan = { TXT_PlanName: planCodeName };
                        this.omniApplyCallResp(plan);
                     }

                     if (this.plans[0].networkName != null || this.plans[0].networkName != undefined) {
                        this.networkCodeName = this.plans[0].networkName;
                        let network = { TXT_Network: this.networkCodeName };
                        this.omniApplyCallResp(network);
                        this.publishMessage();
                     }
                     this.updateSelectedPlan(planArr[0]);
                  }
               }

               if (Array.isArray(this.planList) && this.planList.length > 1) {
                  let planArr = this.planList;
                  this.networkCodeName = "";

                  /**
                     Default plan will be based on the follow sequence:
                     First sort by Status
                     1. Active
                     2. Future Active
                     3. Pre-Effectuated
                     Secondary sort by Plan Type
                     1. Medical
                     2. Dental
                     3. Vision
                     4. Pharmacy
                  **/

                  //Modify this array to change the Sequence of the plans
                  this.statusOrder = ["Active", "Future Active", "Pre-Effectuated"];
                  this.planOrder = ["M", "D", "V", "R"];
                  planArr.sort((a, b) => this.statusOrder.indexOf(a.status) - this.statusOrder.indexOf(b.status) || this.planOrder.indexOf(a.planType) - this.planOrder.indexOf(b.planType));

                  //this.planOrder = ["M", "D", "R", "V"];
                  //planArr.sort((a, b) => this.planOrder.indexOf(a.planType) - this.planOrder.indexOf(b.planType));

                  planArr.forEach((plan) => {
                     plan.key = plan.planId;
                     plan.value = plan.planName;

                     if (!this.defaultPlan) {
                        this.selectDefaultPlan(plan);
                     }
                  });
                  this.plans = planArr;
                  //console.log("this.plans ", JSON.stringify(this.plans));
               }
            }
         }
      } catch (error) {
         console.error("Error", error);
      }
   }

   selectDefaultPlan(plan) {
      if (this.jsonData.firstExecution != "Yes") {
         this.networkCodeName = plan.networkName;
         let network = { TXT_Network: this.networkCodeName };
         this.omniApplyCallResp(network);
         this.defaultPlan = plan.planName;
         this.updateSelectedPlan(plan);
      }
      if (this.jsonData.firstExecution == "Yes") {
         this.defaultPlan = this.jsonData.selectedPlan;
         this.networkCodeName = this.jsonData.selectedPlan.networkName;
      }
      this.publishMessage();
      this.setFirstRun();
   }

   setFirstRun() {
      let firstPlanLoaded = { firstExecution: "Yes" };
      this.omniApplyCallResp(firstPlanLoaded);
   }

   handleItemChange(evt) {
      this.selectedPlanId = evt.detail.itemCode;

      let selectedPlan = this.plans.find((plan) => plan.planId === this.selectedPlanId);
      let selectedNetworkName = selectedPlan.networkName;

      if (selectedNetworkName == null || selectedNetworkName == undefined) {
         selectedNetworkName = "";
      } else {
         selectedNetworkName = selectedPlan.networkName;
      }

      this.updateNetworkName(selectedNetworkName);
      this.updateSelectedPlan(selectedPlan);
      this.publishMessage();

      // if(evt.target.value === "") {
      //     this.applyCallResp(evt.target.value);
      //     Promise.resolve().then(() => {
      //         this.setElementValue(null, false, true);
      //         this.dispatchOmniEventUtil(this, this.createAggregateNode(), 'omniaggregate');
      //     });
      // } else {
      //     this.applyCallResp(evt.target.value);
      // }
   }

   updateNetworkName(name) {
      var networkName = { TXT_Network: name };
      this.networkCodeName = name;
      this.omniApplyCallResp(networkName);
   }

   updateSelectedPlan(plan) {
      let planArray = {};
      planArray.SelectedPlanInfo = plan;

      if (planArray.SelectedPlanInfo.networkName == null || planArray.SelectedPlanInfo.networkName == undefined) {
         planArray.SelectedPlanInfo.networkName = "";
         planArray.SelectedPlanInfo.networkId = "";
         planArray.SelectedPlanInfo.networkCode = "";
      }

      this.omniApplyCallResp(JSON.parse(JSON.stringify(planArray)));
   }

   publishMessage() {
      const message = {
         selectedPlanId: this.selectedPlanId,
         selectedNetworkName: this.networkCodeName,
      };
      console.log("publishMessage", message);
      pubsub.fire("selectPlanChanel", "selectPlan", message);
   }
}
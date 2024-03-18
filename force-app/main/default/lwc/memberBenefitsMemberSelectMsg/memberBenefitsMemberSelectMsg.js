import pubsub from "omnistudio/pubsub";
import { LightningElement } from "lwc";

export default class MemberBenefitsMemberSelectMsg extends LightningElement {
   _showDiffMsg = false;

   connectedCallback() {
      this.registerPubSub();
   }

   registerPubSub() {
      pubsub.register("MemberSelection", {
         showMemberInfo: this.setShowMemberDiffMsg.bind(this),
      });
   }

   disconnectedCallback() {
      pubsub.unregister("MemberSelection", {
         showMemberInfo: this.setShowMemberDiffMsg.bind(this),
      });
   }

   setShowMemberDiffMsg(msg) {
      this._showDiffMsg = msg.showMemberDiffMsg;
   }
}
import { LightningElement, api } from "lwc";

const SVG_SR = "/resource/iconsAttentis/";
const BASE_CLASS = "nds-icon";
const TOOLTIP_CLASS = "customTooltipText";
const COLORS = {
      warning: "#E07339",
      error: "#E3173E",
      information: "#036CB6",
      default: "#63676B",
      inverse: "#ffffff",
};

export default class CustomIcon extends LightningElement {
   @api iconName;
   @api size; //xx-small, x-small, small, medium, large (Default: small)
   @api alternativeText;
   @api color;
   @api extraClass;
   @api variant;
   @api iconPosition;
   @api bgColor;

   //Tooltip
   @api showTooltip;
   @api tooltipContent;
   @api tooltipPosition; //bottom, left, right, top(Default)

   @api customLabel;

   get classes() {
      const classesList = [BASE_CLASS];

      if (this.size) {
         classesList.push(`nds-icon_${this.size}`);
      }

      if (this.variant) {
         classesList.push(`nds-icon-text-${this.variant}`);
      }

      if (this.extraClass) {
         classesList.push(this.extraClass);
      }

      return classesList.join(" ");
   }

   get tooltipPositionClasses() {
      const classesTooltip = [TOOLTIP_CLASS];

      if (this.showTooltip) {
         if (this.tooltipPosition == "bottom") {
            classesTooltip.push(`customTooltipTextBottom`);
         } else if (this.tooltipPosition == "left") {
            classesTooltip.push(`customTooltipTextLeft`);
         } else if (this.tooltipPosition == "right") {
            classesTooltip.push(`customTooltipTextRight`);
         } else {
            classesTooltip.push(`customTooltipTextTop`);
         }
      }

      return classesTooltip.join(" ");
   }

   get name() {
      return `${this.tenant}:${this.iconName}`;
   }

   get tenant() {
      return "attentis";
   }

   get alt() {
      return this.alternativeText;
   }

   get isInPortal() {
      return document.location.pathname.includes("/s/");
   }

   get portalURLBase() {
      const urlParts = document.location.toString().split("/s/");

      return urlParts[0];
   }

   get baseUrl() {
      if (this.isInPortal) {
         return `${this.portalURLBase}${SVG_SR}`;
      }
      return SVG_SR;
   }

   get svgFile() {
      return `${this.baseUrl}${this.tenant}-sprite/svg/symbols.svg`;
   }

   get xlink() {
      return `${this.baseUrl}${this.tenant}-sprite/svg/symbols.svg?#${this.iconName}`;
   }

   get tenantColors() {
      return COLORS;
   }

   get stroke() {
      const tenantColors = this.tenantColors;
      return tenantColors.hasOwnProperty(this.variant) ? tenantColors[this.variant] : tenantColors.default;
   }

   appendSVG() {
      window.customIconLoading = true;
      fetch(this.svgFile)
         .then((response) => {
            return response.text();
         })
         .then((svgContent) => {
            const svgWrapper = document.createElement("div");
            svgWrapper.classList.add('custom-icon-sprite');
            svgWrapper.innerHTML = svgContent;
            document.body.appendChild(svgWrapper);
         });
   }

   connectedCallback() {
      if(!window.customIconLoading){
         this.appendSVG();
      }
   }
}
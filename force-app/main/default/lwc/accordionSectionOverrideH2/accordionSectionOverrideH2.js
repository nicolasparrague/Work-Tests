import { LightningElement, api } from 'lwc';
import AccordionSection from 'omnistudio/accordionSection';
import template from'./accordionSectionOverrideH2.html';

export default class AccordionSectionOverrideH2 extends AccordionSection {    
    // @api accordionClass;
    // @api name;
    // @api title;
    // @api isSectionOpen;
    // @api label;
    // @api toggleAccordion;
    // @api theme;
    // @api accordionIconName;
    // @api iconSize;
    // @api showMenu;
    // @api menuPosition;
    // @api menuSize;
    // @api menuitem;

    // connectedCallback() {
    //     super.connectedCallback();
    // }

    render() {
        return template;
    }


}
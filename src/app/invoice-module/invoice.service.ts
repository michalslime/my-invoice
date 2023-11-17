import { Injectable } from "@angular/core";
import { InvoiceModel } from "./invoice.model";

@Injectable({
    providedIn: 'root'
})
export class InvoiceService {

    constructor() {}

    getInvoice(): InvoiceModel {
        const invoice: InvoiceModel = {  
            items: []
        }

        return invoice;
    }

    saveInvoice(invoice: InvoiceModel) {
        console.log(invoice);
    }
}
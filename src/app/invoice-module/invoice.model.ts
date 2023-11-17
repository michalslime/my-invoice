import { InvoiceLineModel } from "./invoice-line.model";

export interface InvoiceModel {
    nip?: string;
    currency?: string;
    items: InvoiceLineModel[];
    issueDate?: Date;
    deliveryDate?: Date;
    paymentDate?: Date
}
import { Component, OnInit } from '@angular/core';
import {
    FormsModule
} from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { InvoiceLineModel } from '../invoice-line.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import {
    MAT_MOMENT_DATE_FORMATS,
    MomentDateAdapter,
    MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import { InvoiceModel } from '../invoice.model';
import { InvoiceService } from '../invoice.service';
import { vatRates } from '../vat-rates';

@Component({
    selector: 'app-invoice',
    templateUrl: './invoice.component.html',
    styleUrls: ['./invoice.component.scss'],
    standalone: true,
    imports: [FormsModule, MatFormFieldModule, MatInputModule, NgIf, NgFor, MatTableModule, MatSelectModule, MatIconModule, MatButtonModule, MatCardModule, MatDatepickerModule, MatNativeDateModule],
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'pl-PL' },
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
        },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    ]
})
export class InvoiceComponent implements OnInit {

    displayedColumns: string[] = ['vatRate', 'nettoAmount', 'vatAmount', 'bruttoAmount', 'actions'];

    errors: string[] = [];

    dataSource = new MatTableDataSource<InvoiceLineModel>();

    totalNetto = 0;
    totalVat = 0;
    totalBrutto = 0;

    public invoice !: InvoiceModel;

    get vatRates() {
        return vatRates;
    }

    constructor(private invoiceService: InvoiceService) {
    }

    ngOnInit(): void {
        this.invoice = this.invoiceService.getInvoice();
        this.dataSource.data = this.invoice.items;
    }

    add() {
        this.invoice.items.push({
            vatRate: 23,
            nettoAmount: 0,
            vatAmount: 0,
            bruttoAmount: 0
        });

        this.dataSource.data = this.invoice.items;
    }

    save() {
        if (this.isValid()) {
            this.invoiceService.saveInvoice(this.invoice);
        }
    }

    isValid() {
        let toReturn = true;
        this.errors = [];

        toReturn = this.checkCurrency(this.invoice.currency);
        toReturn = this.checkNIP(this.invoice.nip ?? '');

        if (this.invoice.items.length === 0) {
            toReturn = false;
            this.errors.push('Faktura musi zawierać przynajmniej jedną pozycję');
        }

        this.invoice.items.forEach((item, index) => {
            toReturn = this.checkItem(item, index);
        });

        return toReturn;
    }

    checkCurrency(currency?: string) {
        if (currency === undefined || currency === null || currency.length !== 3) {
            this.errors.push('Pole waluta jest nieprawidłowe');
            return false;
        }

        return true;
    }

    checkNIP(nipNumber: string) {
        var nipWithoutDashes = nipNumber.replace(/-/g, "");
        var reg = /^[0-9]{10}$/;
        if (reg.test(nipWithoutDashes) === false) {
            this.errors.push('Numer NIP jest nieprawidłowy');
            return false;
        }
        else {
            var digits = ("" + nipWithoutDashes).split("");
            var checksum = (6 * parseInt(digits[0]) + 5 * parseInt(digits[1]) + 7 * parseInt(digits[2]) + 2 * parseInt(digits[3]) + 3 * parseInt(digits[4]) + 4 * parseInt(digits[5]) + 5 * parseInt(digits[6]) + 6 * parseInt(digits[7]) + 7 * parseInt(digits[8])) % 11;

            if (parseInt(digits[9]) === checksum) {
                return true;
            } else {
                this.errors.push('Numer NIP jest nieprawidłowy');
                return false;
            }
        }
    }

    checkItem(item: InvoiceLineModel, index: number) {
        if (item.bruttoAmount < 0 || item.nettoAmount < 0 || item.vatAmount < 0) {
            this.errors.push(`Jedna z wartości na pozycji ${index + 1} jest ujemna`);
            return false;
        }

        return true;
    }

    remove(element: InvoiceLineModel) {
        var index = this.invoice.items.findIndex(x => x === element);
        this.invoice.items.splice(index, 1);

        this.dataSource.data = this.invoice.items;

        this.recalculateTotals();
    }

    recalculateFromVATPerspective(element: InvoiceLineModel) {
        element.vatAmount = +element.nettoAmount * (+element.vatRate) / 100;
        element.bruttoAmount = +element.nettoAmount + element.vatAmount;

        this.dataSource.data = this.invoice.items;

        this.recalculateTotals();
    }

    recalculateFromVatAmountPerspective(element: InvoiceLineModel) {
        element.nettoAmount = +element.vatAmount / (+element.vatRate / 100);
        element.bruttoAmount = +element.nettoAmount + (+element.vatAmount);

        this.dataSource.data = this.invoice.items;

        this.recalculateTotals();
    }

    recalculateFromBruttoAmountPerspective(element: InvoiceLineModel) {
        element.nettoAmount = +element.bruttoAmount / ((100 + (+element.vatRate)) / 100);
        element.vatAmount = +element.bruttoAmount - (+element.nettoAmount);

        this.dataSource.data = this.invoice.items;

        this.recalculateTotals();
    }

    recalculateTotals() {
        this.totalNetto = this.invoice.items.reduce((acc, curr) => {
            return acc + (+curr.nettoAmount);
        }, 0);

        this.totalVat = this.invoice.items.reduce((acc, curr) => {
            return acc + (+curr.vatAmount);
        }, 0);

        this.totalBrutto = this.invoice.items.reduce((acc, curr) => {
            return acc + (+curr.bruttoAmount);
        }, 0);
    }
}

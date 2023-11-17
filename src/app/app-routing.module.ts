import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
    {
      path: '',
      component: HomeComponent
    },
    {
      path: 'invoice',
      loadChildren: () => import('./invoice-module/invoice.module').then(m => m.InvoiceModule)
    }
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

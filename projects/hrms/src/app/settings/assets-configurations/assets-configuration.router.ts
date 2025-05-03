import { Route } from "@angular/router";
import { AssetVendorComponent } from "./asset-vendor/asset-vendor.component";
import { AssetCatagoryComponent } from "./asset-catagory/asset-catagory.component";
import { SubCatagoryComponent } from "./sub-catagory/sub-catagory.component";

export default [
    { path: '', redirectTo: '/settings/assets-configuration/vendor-detiles', pathMatch: 'full' },
    { path: 'vendor-detiles', component: AssetVendorComponent },
    { path: 'asset-catagory', component: AssetCatagoryComponent },
    { path: 'asset-subcatagory', component: SubCatagoryComponent },
] as Route[];
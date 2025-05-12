import { Route } from "@angular/router";
import { AssetVendorComponent } from "./asset-vendor/asset-vendor.component";
import { AssetCatagoryComponent } from "./asset-catagory/asset-catagory.component";
import { SubCatagoryComponent } from "./sub-catagory/sub-catagory.component";
import { PermissionsGuard } from "../../guards/permissions.guard";

export default [
    { path: 'vendor-detiles', component: AssetVendorComponent, canActivate: [PermissionsGuard], data: { permission: 'Vendor Details.view' } },
    { path: 'asset-catagory', component: AssetCatagoryComponent, canActivate: [PermissionsGuard], data: { permission: 'Asset Catagory.view' } },
    { path: 'asset-subcatagory', component: SubCatagoryComponent, canActivate: [PermissionsGuard], data: { permission: 'Asset Sub Catagory.view' } },
] as Route[];
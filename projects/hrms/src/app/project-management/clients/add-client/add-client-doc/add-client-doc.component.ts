import { Component } from '@angular/core';
import { RbacService } from '../../../../services/rbac.service';
import { MODULE_INFOS } from '../../../../shared/modules-info';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
interface LetterRow {
  type: string;
  required: boolean;
}
@Component({
  selector: 'app-add-client-doc',
  imports: [CommonModule, RouterModule, NgbPopoverModule],
  templateUrl: './add-client-doc.component.html',
  styleUrl: './add-client-doc.component.scss'
})

export class AddClientDocComponent {
  subscription!: Subscription;
  selectedLetters: string[] = [];
  readonly letters: LetterRow[] = [
    { type: 'MSA', required: false },
    { type: 'NDA', required: false }
  ];
  navTabs = [
    {
      label: 'NDA ',
      link: '/project-management/clients/add/nda',
      icon: '/letters-icon/offer-letter-icon.png',
      subject: MODULE_INFOS.NDA_Letter,
      permission: { feature: 'NDA Document', action: 'view' },
      mandatory: false
    },
    {
      label: 'MSA ',
      link: '/project-management/clients/add/msa',
      icon: '/letters-icon/appointment-letter-icon.png',
      subject: MODULE_INFOS.MSA_Letter,
      permission: { feature: 'MSA Document', action: 'view' },
      mandatory: false
    },
  ];
  lettersgeneratedlist = [] as any;

  constructor(private rbac: RbacService, private http: HttpService, private router: Router, private conformationPopup: OpenModalService) { }

  ngOnInit(): void {
    this.getEAV();
    this.getlettergenerateddata();
    this.navTabs = this.navTabs.filter(
      (tab) =>
        tab.permission &&
        tab.permission.feature &&
        tab.permission.action &&
        this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
  
  }

  getEAV() {
    this.subscription = this.http.getData('entityAttributeValues?entity=Project&attribute=Letters').subscribe({
      next: (data: any) => {
        console.log("data", data);
        // 1 Collect all values (single or comma-separated) into a Set
        const selected = new Set<string>();
        data.forEach((row: any) => {
          if (!row?.value) return;
          // Split by comma and trim spaces, push each distinct letter
          row.value.split(',')
            .map((v: string) => v.trim())
            .filter(Boolean)
            .forEach((v: string) => selected.add(v));
        });
        // 2 Convert Set to array and keep in one variable
        this.selectedLetters = Array.from(selected);
        this.navTabs.forEach(tab => {
          tab.mandatory = this.selectedLetters.some(
            letter => letter.trim().toLowerCase() === tab.label.trim().toLowerCase()
          );
        });
        // 3 Update base letters array with required = true/false
        this.letters.forEach(letter => {
          letter.required = selected.has(letter.type);
        });
      },
      error: (error: any) => {
        console.error('Failed to load letters', error);
      },
    });
  }

  ndalettergenerated!: false;
  msalettergenerated!: false;
  getlettergenerateddata() {
    const clientId = localStorage.getItem('newlyAddedClientId');
    this.subscription = this.http.getData(`Documents?entityType=client&entityId=${clientId}&status=active`).subscribe({
      next: (data: any) => {
        this.lettersgeneratedlist = data.data;
        this.ndalettergenerated = this.lettersgeneratedlist?.some((letter: any) => letter?.documentType?.toLowerCase() === 'nda letter');
        this.msalettergenerated = this.lettersgeneratedlist?.some((letter: any) => letter?.documentType?.toLowerCase() === 'msa letter');
      },
      error: (error: any) => {
        this.lettersgeneratedlist = [];
      }
    });
  }

  updateClientSataus() {
    const clientId = localStorage.getItem('newlyAddedClientId');
    const payload = {
      status: 'Active'
    }
    this.subscription = this.http.putData(`Client/${clientId}`, payload).subscribe({
      next: (data: any) => {
        // console.log("client status updated") 
        localStorage.removeItem('newlyAddedClientId');
        this.router.navigate(['/project-management/clients/active']);
        this.conformationPopup.openSuccessModal('Client added successfully');
      },
      error: (error: any) => {
        console.log("client status not updated");
      }
    });
  }
}
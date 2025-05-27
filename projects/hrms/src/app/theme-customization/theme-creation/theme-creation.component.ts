import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme-service/theme.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../services/open-modal.service';

@Component({
  selector: 'app-theme-creation',
  imports: [CommonModule, FormsModule],
  templateUrl: './theme-creation.component.html',
  styleUrl: './theme-creation.component.scss'
})

export class ThemeCreationComponent {
  // Theme variables
  layoutName: string = '';
  // font family
  selectedFont: string = 'Roboto-flex';
  // header 
  headerBackgroundColor: string = '#FFFFFF';
  //sidenav
  sidebarBackgroundColor: string = '#0B3A83';
  sidebarNavItemColor: string = '#EAEAEA';
  sidebarNavItemActiveColor: string = '#0B3A83';
  sidebarNavItemActiveBackgroundColor: string = '#FFFFFF4D';
  //Body
  bodyBackgroundColor: string = '#ECF1F5';
  // button and links
  primaryButtonColor: string = '#0B3A83';
  secondaryButtonColor: string = '#FFFFFF';
  primaryButtonTextColor: string = '#FFFFFF';
  secondaryButtonTextColor: string = '#0B3A83';
  buttonBorderColor: string = '#305889';
  //popup variables
  @ViewChild('addTheme') addTheme: any;
  @ViewChild('deleteConfirmation') deleteConfirmation: any;

  constructor(private router: Router, private themeService: ThemeService, public modalService: NgbModal,
    private conformationPopup: OpenModalService) { }

  ngOnInit() {
    this.themeService.getEditingTheme().subscribe((editingTheme) => {
      if (editingTheme) {
        this.layoutName = editingTheme.layoutName;
        this.selectedFont = editingTheme.selectedFont;
        // header 
        this.headerBackgroundColor = editingTheme.headerBackgroundColor;
        //sidenav
        this.sidebarBackgroundColor = editingTheme.sidebarBackgroundColor;
        this.sidebarNavItemColor = editingTheme.sidebarNavItemColor;
        this.sidebarNavItemActiveColor = editingTheme.sidebarNavItemActiveColor;
        this.sidebarNavItemActiveBackgroundColor = editingTheme.sidebarNavItemActiveBackgroundColor;
        //Body
        this.bodyBackgroundColor = editingTheme.bodyBackgroundColor;
        // button and links
        this.primaryButtonColor = editingTheme.primaryButtonColor;
        this.secondaryButtonColor = editingTheme.secondaryButtonColor;
        this.primaryButtonTextColor = editingTheme.primaryButtonTextColor;
        this.secondaryButtonTextColor = editingTheme.secondaryButtonTextColor;
        this.buttonBorderColor = editingTheme.buttonBorderColor;
      }
    });
  }

  openSaveModal() {
    this.modalService.open(this.addTheme, { backdrop: 'static', centered: true });
  }

  saveThemeColors(): void {
    if (!this.layoutName) {
      alert('Please enter a layout name before saving.');
      return;
    }
    const themeData = {
      layoutName: this.layoutName,
      selectedFont: this.selectedFont,
      // header 
      headerBackgroundColor: this.headerBackgroundColor,
      //sidenav
      sidebarBackgroundColor: this.sidebarBackgroundColor,
      sidebarNavItemColor: this.sidebarNavItemColor,
      sidebarNavItemActiveColor: this.sidebarNavItemActiveColor,
      sidebarNavItemActiveBackgroundColor: this.sidebarNavItemActiveBackgroundColor,
      //Body
      bodyBackgroundColor: this.bodyBackgroundColor,
      // button and links
      primaryButtonColor: this.primaryButtonColor,
      secondaryButtonColor: this.secondaryButtonColor,
      primaryButtonTextColor: this.primaryButtonTextColor,
      secondaryButtonTextColor: this.secondaryButtonTextColor,
      buttonBorderColor: this.buttonBorderColor,
    };
    const editingTheme = this.themeService.getEditingThemeValue();
    if (editingTheme) {
      // Update the existing theme
      this.themeService.updateSavedTheme(themeData);
      this.modalService.dismissAll();
      this.conformationPopup.openSuccessModal("Theme Updated successfully");
    } else {
      // Store the new theme
      this.themeService.storeThemeWithLayoutName(themeData);
      this.modalService.dismissAll();
      this.conformationPopup.openSuccessModal("Theme Created successfully");
    }
    this.router.navigate(['/theme']);
  }
}
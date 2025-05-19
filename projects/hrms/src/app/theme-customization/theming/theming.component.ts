import { Component } from '@angular/core';
import { ThemeService } from '../../services/theme-service/theme.service';
import { LogoService } from '../../services/theme-service/logo.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-theming',
  imports: [CommonModule, FormsModule],
  templateUrl: './theming.component.html',
  styleUrl: './theming.component.scss'
})

export class ThemingComponent {
  // Logo selection
  selectedLogo: string | null = null;
  // Theme variables
  layoutName: string = '';
  // font family
  selectedFont: string = 'Roboto-flex';
  // button and links
  primaryColor: string = '#0573d6';
  primaryColorHover: string = '#0573d6';
  secondaryColor: string = '#979797';
  secondaryColorHover: string = '#979797';
  textPrimaryColor: string = '#ffffff';
  textSecondaryColor: string = '#ffffff';
  primaryColorLink: string = '#0573d6';
  primaryColorLinkHover: string = '#0573d6';
  // header
  headerBackgroundColor: string = '#212121';
  //sidenav
  imagePrimaryColor: string = '#0573d6';
  imageSecondaryColor: string = '#05b0d6';
  navItemColor: string = '#ffffff';
  navActiveBgColor: string = '#e9f4ff';
  navActiveColor: string = '#000000';
  //body
  breadCrumBgColor: string = 'rgba(0, 0, 0, 0.24)';
  breadCrumTextColor: string = '#ffffff';
  bodyPrimaryColor: string = '#346d9f';
  bodySecondaryColor: string = '#a4d4ff';
  bodyTertiaryColor: string = '#69b6fc';
  //footer
  footerBgColor: string = 'rgba(0, 0, 0, 0.24)';
  brandColor: string = '#ffffff';
  //use profile colors
  usertopBg: string = '#212121';
  userBottomBg: string = '#ffffff';
  userBottomFont: string = '#595f69';
  profileBg: string = '#0573d6';
  logoutFont: string = '#0573d6';
  //unused colors
  headerBgColor: string = '#0573d6';
  headerTextColor: string = '#ffffff';
  moduleBgColor: string = '#0573d6';
  topTextColor: string = '#ffffff';
  dropBtnBgColor: string = '#063f6f';
  logos: { id: string, path: string }[] = [
    { id: 'logo1', path: './assets/logo/logo@2x.png' },
    { id: 'logo2', path: './assets/logo/averon@2x.png' },
    { id: 'logo3', path: './assets/logo/fusion@2x.png' },
    { id: 'logo4', path: './assets/logo/mushroom@2x.png' },
    { id: 'logo5', path: './assets/logo/SNAD@2x.png' },
    { id: 'logo6', path: './assets/logo/SIS_info@2x.png' },
    { id: 'logo7', path: './assets/logo/Siri_Info_Health@2x.png' },
    // Add more logos as needed
  ];

  constructor(private router: Router, private themeService: ThemeService, private logoService: LogoService) { }

  //navigation function
  navigateSelectOrderType() {
    this.router.navigate(['/access']);
  }

  ngOnInit() {
    this.logoService.getSelectedLogo().subscribe((selectedLogo) => {
      this.selectedLogo = selectedLogo!;
    });
    this.themeService.getEditingTheme().subscribe((editingTheme) => {
      if (editingTheme) {
        this.layoutName = editingTheme.layoutName;
        this.selectedFont = editingTheme.selectedFont;
        this.primaryColor = editingTheme.primaryColor;
        this.primaryColorHover = editingTheme.primaryColorHover;
        this.secondaryColor = editingTheme.secondaryColor;
        this.secondaryColorHover = editingTheme.secondaryColorHover;
        this.textPrimaryColor = editingTheme.textPrimaryColor;
        this.textSecondaryColor = editingTheme.textSecondaryColor;
        this.primaryColorLink = editingTheme.primaryColorLink;
        this.primaryColorLinkHover = editingTheme.primaryColorLinkHover;
        this.headerBackgroundColor = editingTheme.headerBackgroundColor;
        this.imagePrimaryColor = editingTheme.imagePrimaryColor;
        this.imageSecondaryColor = editingTheme.imageSecondaryColor;
        this.navItemColor = editingTheme.navItemColor;
        this.navActiveBgColor = editingTheme.navActiveBgColor;
        this.navActiveColor = editingTheme.navActiveColor;
        this.breadCrumBgColor = editingTheme.breadCrumBgColor;
        this.breadCrumTextColor = editingTheme.breadCrumTextColor;
        this.bodyPrimaryColor = editingTheme.bodyPrimaryColor;
        this.bodySecondaryColor = editingTheme.bodySecondaryColor;
        this.bodyTertiaryColor = editingTheme.bodyTertiaryColor;
        this.footerBgColor = editingTheme.footerBgColor;
        this.brandColor = editingTheme.brandColor;
        this.usertopBg = editingTheme.usertopBg;
        this.userBottomBg = editingTheme.userBottomBg;
        this.userBottomFont = editingTheme.userBottomFont;
        this.profileBg = editingTheme.profileBg;
        this.logoutFont = editingTheme.logoutFont;
        // unused colors
        this.headerBgColor = editingTheme.headerBgColor;
        this.headerTextColor = editingTheme.headerTextColor;
        this.moduleBgColor = editingTheme.moduleBgColor;
        this.topTextColor = editingTheme.topTextColor;
        this.dropBtnBgColor = editingTheme.dropBtnBgColor;
        this.selectedLogo = editingTheme.selectedLogo || this.themeService.getDefaultLogo();
      }
      else {
        // Set the default logo as checked initially
        this.selectedLogo = this.themeService.getDefaultLogo();
      }
    });
  }

  onLogoChange(logoPath: string): void {
    this.selectedLogo = logoPath;
    this.logoService.setSelectedLogo(logoPath);
  }

  getBackgroundImage(): string {
    return `linear-gradient(to bottom, ${this.imagePrimaryColor} 0%, ${this.imageSecondaryColor} 100%)`;
  }

  getBackgroundBody(): string {
    return `linear-gradient(126deg, ${this.bodyPrimaryColor} 0%, ${this.bodySecondaryColor} 74%, ${this.bodyTertiaryColor} 101%)`;
  }

  saveThemeColors(): void {
    if (!this.layoutName) {
      alert('Please enter a layout name before saving.');
      return;
    }
    const themeData = {
      layoutName: this.layoutName,
      selectedFont: this.selectedFont,
      primaryColor: this.primaryColor,
      primaryColorHover: this.primaryColorHover,
      secondaryColor: this.secondaryColor,
      secondaryColorHover: this.secondaryColorHover,
      textPrimaryColor: this.textPrimaryColor,
      textSecondaryColor: this.textSecondaryColor,
      primaryColorLink: this.primaryColorLink,
      primaryColorLinkHover: this.primaryColorLinkHover,
      headerBackgroundColor: this.headerBackgroundColor,
      imagePrimaryColor: this.imagePrimaryColor,
      imageSecondaryColor: this.imageSecondaryColor,
      navItemColor: this.navItemColor,
      navActiveBgColor: this.navActiveBgColor,
      navActiveColor: this.navActiveColor,
      breadCrumBgColor: this.breadCrumBgColor,
      breadCrumTextColor: this.breadCrumTextColor,
      bodyPrimaryColor: this.bodyPrimaryColor,
      bodySecondaryColor: this.bodySecondaryColor,
      bodyTertiaryColor: this.bodyTertiaryColor,
      footerBgColor: this.footerBgColor,
      brandColor: this.brandColor,
      usertopBg: this.usertopBg,
      userBottomBg: this.userBottomBg,
      userBottomFont: this.userBottomFont,
      profileBg: this.profileBg,
      logoutFont: this.logoutFont,
      //unused colors
      headerBgColor: this.headerBgColor,
      headerTextColor: this.headerTextColor,
      moduleBgColor: this.moduleBgColor,
      topTextColor: this.topTextColor,
      dropBtnBgColor: this.dropBtnBgColor,
      selectedLogo: this.selectedLogo,
    };
    const editingTheme = this.themeService.getEditingThemeValue();
    if (editingTheme) {
      // Update the existing theme
      this.themeService.updateSavedTheme(themeData);
    } else {
      // Store the new theme
      this.themeService.storeThemeWithLayoutName(themeData);
    }
    this.router.navigate(['./main/layout']);
  }
}
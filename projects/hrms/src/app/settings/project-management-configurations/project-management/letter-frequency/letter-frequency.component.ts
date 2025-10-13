import { Component } from '@angular/core';
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { SettingsLoaderComponent } from "../../../../shared/settings-loader/settings-loader.component";
import { IEAV } from '../../models/project-type.modal';
import { HttpService } from '../../../../services/http.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-letter-frequency',
  imports: [NoDataFoundComponent, SettingsLoaderComponent,CommonModule],
  templateUrl: './letter-frequency.component.html',
  styleUrl: './letter-frequency.component.scss'
})
export class LetterFrequencyComponent {
  loading = false;
  letterFrequencies: IEAV[] = [];
  subscription!: Subscription;

  constructor(private http: HttpService) { }
  ngOnInit(): void {

    this.getLetterFrequencies();
  }

  getLetterFrequencies() {
    this.loading = true;
    this.subscription = this.http
      .getData('entityAttributeValues?entity=ProjectManagementLetterConfiguration&attribute=frequency')
      .subscribe({
        next: (data: any) => {
          this.loading = false;
          this.letterFrequencies = data;

        },
        error: (error: any) => {
          this.loading = false;
          this.letterFrequencies = [];
          console.error('Error fetching letter frequencies', error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

}

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-multi-sucesspopup',
  imports: [],
  templateUrl: './multi-sucesspopup.component.html',
  styleUrl: './multi-sucesspopup.component.scss'
})
export class MultiSucesspopupComponent implements OnInit {
 
 @Input() status!: any;
 ngOnInit(): void {
 //  console.log(this.status)
 }
}

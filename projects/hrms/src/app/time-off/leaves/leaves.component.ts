import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-leaves',
  imports: [ CommonModule,NgbNavModule],
  templateUrl: './leaves.component.html',
  styleUrl: './leaves.component.scss'
})
export class LeavesComponent {
  active=1
  cardItems = [
    {
      label: 'Sick leave',
      available: 5,
      processed: 12,
      entitled: 12,
      booked: 5,
      backgroundColor: '#E1E8FE',
      profileColor: '#06274F',
    },
    {
      label: 'Casual Leave',
      available: 5,
      processed: 12,
      entitled: 12,
      booked: 5,
      backgroundColor: '#FEEFE1',
      profileColor: '#A95200',
    },
    {
      label: 'Comp Off',
      available: 5,
      processed: 12,
      entitled: 12,
      booked: 5,
      backgroundColor: '#E1FEF4',
      profileColor: '#2B8D6B',
    },
    {
      label: 'Optional Leave',
      available: 5,
      processed: 12,
      entitled: 12,
      booked: 5,
      backgroundColor: '#FEE1F7',
      profileColor: '#95267A',
    },
    {
      label: 'Anniversary Leave',
      available: 5,
      processed: 12,
      entitled: 12,
      booked: 5,
      backgroundColor: '#FEE7E1',
      profileColor: '#994530',
    },
    {
      label: 'Achievement Leaves',
      available: 5,
      processed: 12,
      entitled: 12,
      booked: 5,
      backgroundColor: '#FEE1F1',
      profileColor: '#760C46',
    },
    {
      label: 'Family/Emergency leave',
      available: 5,
      processed: 12,
      entitled: 12,
      booked: 5,
      backgroundColor: '#FEEFE1',
      profileColor: '#A95200',
    },
    {
      label: 'Birthday Leave',
      available: 5,
      processed: 12,
      entitled: 12,
      booked: 5,
      backgroundColor: '#E1FEE1',
      profileColor: '#0A850A',
    },
  ];
}

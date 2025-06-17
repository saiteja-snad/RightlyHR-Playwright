import { AllEmployeesPipe } from './all-employees.pipe';

describe('AllEmployeesPipe', () => {
  it('create an instance', () => {
    const pipe = new AllEmployeesPipe();
    expect(pipe).toBeTruthy();
  });
});

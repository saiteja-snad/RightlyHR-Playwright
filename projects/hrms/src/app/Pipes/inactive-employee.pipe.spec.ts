import { InactiveEmployeePipe } from './inactive-employee.pipe';

describe('InactiveEmployeePipe', () => {
  it('create an instance', () => {
    const pipe = new InactiveEmployeePipe();
    expect(pipe).toBeTruthy();
  });
});

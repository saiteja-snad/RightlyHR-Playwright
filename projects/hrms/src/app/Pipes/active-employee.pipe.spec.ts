import { ActiveEmployeePipe } from './active-employee.pipe';

describe('ActiveEmployeePipe', () => {
  it('create an instance', () => {
    const pipe = new ActiveEmployeePipe();
    expect(pipe).toBeTruthy();
  });
});

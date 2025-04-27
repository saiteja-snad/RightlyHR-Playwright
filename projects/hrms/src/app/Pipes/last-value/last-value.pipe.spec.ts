import { LastValuePipe } from './last-value.pipe';

describe('LastValuePipe', () => {
  it('create an instance', () => {
    const pipe = new LastValuePipe();
    expect(pipe).toBeTruthy();
  });
});

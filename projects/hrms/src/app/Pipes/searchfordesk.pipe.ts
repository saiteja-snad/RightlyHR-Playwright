import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchfordesk'
})
export class SearchfordeskPipe implements PipeTransform {

   transform(items: any[], searchText: string, searchProperties: string[] = []): any[] {
    if (!items || !searchText || !searchProperties.length) {
      return items;
    }

    const searchTokens = searchText.toLowerCase().split(/\s+/);

    return items.filter(item =>
      searchTokens.every(token =>
        searchProperties.some(property => {
          const value = this.getNestedProperty(item, property);
          return value.toLowerCase().includes(token);
        })
      )
    );
  }

  public getNestedProperty(obj: any, path: string): string {
    return path.split('.').reduce((o, p) => (o && o[p] !== undefined) ? o[p] : '', obj)?.toString() || '';
  }

}

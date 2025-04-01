import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchfilter'
})
export class SearchfilterPipe implements PipeTransform {

  transform(items: any[], searchText: string, searchProperties: string[] = []): any[] {
    if (!items || !searchText || !searchProperties.length) {
        return items;
    }

    const searchTokens = searchText.toLowerCase().split(/\s+/);

    return items.filter(item => {
        return searchTokens.every(token => {
            return searchProperties.some(property => {
                const value = (item[property] || '').toString().toLowerCase();
                return value.includes(token);
            });
        });
    });
}

}

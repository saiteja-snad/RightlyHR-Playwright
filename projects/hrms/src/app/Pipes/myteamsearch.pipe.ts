import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'myteamsearch'
})
export class MyteamsearchPipe implements PipeTransform {

  transform(items: any[], searchText: string, keys: string[]): any[] {
    if (!items) return [];

    if (!searchText) return items;

    searchText = this.normalize(searchText);

    const filtered = items
      .map(node => this.filterNode(node, searchText, keys))
      .filter(node => node !== null);

    // ⭐ IMPORTANT FIX
    return filtered.length > 0 ? filtered : [];
  }

  private filterNode(node: any, searchText: string, keys: string[]) {
    const searchTokens = searchText.toLowerCase().trim().split(/\s+/); // split by ANY spaces

    const matches = keys.some(key => {
      const value = node.data[key]
        ? node.data[key].toString().toLowerCase().replace(/\s+/g, ' ')
        : "";

      // Every search token must be present
      return searchTokens.every(token => value.includes(token));
    });

    let matchedChildren = [];

    if (node.children?.length) {
      matchedChildren = node.children
        .map((child: any) => this.filterNode(child, searchText, keys))
        .filter((child: null) => child !== null);
    }

    if (matches || matchedChildren.length > 0) {
      return {
        ...node,
        children: matchedChildren
      };
    }
    return null;
  }

  private normalize(text: string) {
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
  }

}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'myteamsearch'
})
export class MyteamsearchPipe implements PipeTransform {

  transform(items: any[], searchText: string, keys: string[]): any[] {
    if (!items) return [];

    if (!searchText) return items;

    searchText = searchText.toLowerCase();

    const filtered = items
        .map(node => this.filterNode(node, searchText, keys))
        .filter(node => node !== null);

    // ⭐ IMPORTANT FIX
    return filtered.length > 0 ? filtered : [];
  }

  private filterNode(node: any, searchText: string, keys: string[]) {
    const matches = keys.some(key =>
      node.data[key]?.toString().toLowerCase().includes(searchText)
    );

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

}

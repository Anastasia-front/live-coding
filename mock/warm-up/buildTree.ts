export type Category = { id: number; name: string; parentId: number | null };
export type CategoryNode = Category & { children: CategoryNode[] };

export function buildTree(categories: Category[]): CategoryNode[] {
  const map: Record<number, CategoryNode> = {};

  categories.forEach((cat) => {
    map[cat.id] = { ...cat, children: [] };
  });

  const tree: CategoryNode[] = [];

  categories.forEach((cat) => {
    if (cat.parentId === null) {
      tree.push(map[cat.id]);
    } else {
      map[cat.parentId].children.push(map[cat.id]);
    }
  });

  return tree;
}

// Related example:
// const categories: Category[] = [
//   { id: 1, name: "Electronics", parentId: null },
//   { id: 2, name: "Laptops", parentId: 1 },
//   { id: 3, name: "Phones", parentId: 1 },
//   { id: 4, name: "Clothing", parentId: null },
//   { id: 5, name: "Gaming Laptops", parentId: 2 },
// ];
//
// console.log(buildTree(categories));
// Output:
// [
//   {
//     id: 1,
//     name: "Electronics",
//     parentId: null,
//     children: [
//       {
//         id: 2,
//         name: "Laptops",
//         parentId: 1,
//         children: [
//           { id: 5, name: "Gaming Laptops", parentId: 2, children: [] },
//         ],
//       },
//       { id: 3, name: "Phones", parentId: 1, children: [] },
//     ],
//   },
//   { id: 4, name: "Clothing", parentId: null, children: [] },
// ]

import { Component, For } from 'solid-js';
import { useParams, useRouteData } from 'solid-start';

import * as styles from '@cubeartisan/cubeartisan/components/templates/cube/list/list-table.css';
import type { CubeRouteData } from '@cubeartisan/cubeartisan/routes/(app)/cube/[cubeId]/(list)';

const TableColumn: Component<{ title: string; content: string[] }> = (props) => (
  <section class={styles.tableColumn}>
    <h2 class={styles.tableColumnTitle}>{props.title}</h2>
    <ul class={styles.tableColumnContent}>
      <For each={props.content}>
        {(item) => (
          <li>
            <p class={styles.tableColumnItem}>{item}</p>
          </li>
        )}
      </For>
    </ul>
  </section>
);

export const CubeListTable = () => {
  const data = useRouteData<CubeRouteData>(useParams<{ cubeId: string }>().cubeId);

  const mockCards = [
    'lightning bolt',
    'mother of runes',
    'shock',
    'stoneforge mystic',
    'kaldra compleat',
    "umezawa's jitte",
  ];

  return (
    <div class={styles.tableContainer}>
      <div class={styles.table}>
        <TableColumn title="White" content={mockCards} />
        <TableColumn title="Blue" content={mockCards} />
        <TableColumn title="Black" content={mockCards} />
        <TableColumn title="Red" content={mockCards} />
        <TableColumn title="Green" content={mockCards} />
        {/* <TableColumn title="Hybrid" content={mockCards} /> */}
        <TableColumn title="Multicolor" content={mockCards} />
        <TableColumn title="Colorless" content={mockCards} />
        <TableColumn title="Lands" content={mockCards} />
      </div>
    </div>
  );
};
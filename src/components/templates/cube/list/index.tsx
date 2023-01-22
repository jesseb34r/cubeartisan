import { Component } from 'solid-js';

import { CubeListContextProvider } from '@cubeartisan/cubeartisan/components/templates/cube/list/CubeListContext';
import { CubeListHero } from '@cubeartisan/cubeartisan/components/templates/cube/list/CubeListHero';

export const CubeListView: Component<{ cube: { name: string; owner_name: string } }> = (props) => (
  <CubeListContextProvider cube={props.cube}>
    <CubeListHero />
  </CubeListContextProvider>
);

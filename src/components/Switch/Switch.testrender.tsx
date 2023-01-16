import { createSignal } from 'solid-js';

import { Switch } from '@cubeartisan/cubeartisan/components/Switch/Switch';
import * as styles from '@cubeartisan/cubeartisan/components/Switch/Switch.testrender.css';

export const TestSwitch = () => {
  const [checked, setChecked] = createSignal(false);

  return (
    <>
      <Switch.Root isChecked={checked()} onCheckedChange={setChecked}>
        <Switch.Input />
        <Switch.Label>Test Switch</Switch.Label>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Root>
      <span class={styles.toggleLabel}>{checked() ? 'on' : 'off'}</span>
    </>
  );
};

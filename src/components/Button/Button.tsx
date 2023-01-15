import { Button as BaseButton, ButtonOptions as BaseButtonOptions } from '@kobalte/core';
import { ParentComponent, splitProps } from 'solid-js';

import { buttonRecipe, ButtonVariants } from '@cubeartisan/cubeartisan/components/Button/Button.css';

export const Button: ParentComponent<{ recipe?: ButtonVariants } & BaseButtonOptions> = (props) => {
  const [local, others] = splitProps(props, ['recipe']);

  return <BaseButton class={buttonRecipe(local.recipe)} {...others} />;
};

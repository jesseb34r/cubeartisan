import { Dialog as BaseDialog } from '@kobalte/core';
import clsx from 'clsx';
import { Component, ComponentProps, splitProps } from 'solid-js';

import * as styles from '@cubeartisan/cubeartisan/components/Modal/Modal.css';

const ModalTrigger = BaseDialog.Trigger;

const ModalCloseButton = BaseDialog.CloseButton;

const ModalPortal = BaseDialog.Portal;

const ModalOverlay: Component<ComponentProps<typeof BaseDialog.Overlay>> = (props) => {
  const [local, others] = splitProps(props, ['class']);

  return <BaseDialog.Overlay class={clsx(styles.overlay, local.class)} {...others} />;
};

const ModalContent: Component<ComponentProps<typeof BaseDialog.Content>> = (props) => {
  const [local, others] = splitProps(props, ['class']);

  return <BaseDialog.Content class={clsx(styles.content, local.class)} {...others} />;
};

const ModalTitle: Component<ComponentProps<typeof BaseDialog.Title>> = (props) => {
  const [local, others] = splitProps(props, ['class']);

  return <BaseDialog.Title class={clsx(styles.title, local.class)} {...others} />;
};

const ModalDescription: Component<ComponentProps<typeof BaseDialog.Description>> = (props) => {
  const [local, others] = splitProps(props, ['class']);

  return <BaseDialog.Description class={clsx(styles.description, local.class)} {...others} />;
};

const ModalRoot = BaseDialog.Root;

export const Modal = {
  Trigger: ModalTrigger,
  CloseButton: ModalCloseButton,
  Portal: ModalPortal,
  Overlay: ModalOverlay,
  Content: ModalContent,
  Title: ModalTitle,
  Description: ModalDescription,
  Root: ModalRoot,
};

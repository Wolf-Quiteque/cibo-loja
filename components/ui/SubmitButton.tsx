"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Button } from "./Button";

type Props = React.ComponentProps<typeof Button>;

export function SubmitButton({ children, ...rest }: Props) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} {...rest}>
      {children}
    </Button>
  );
}

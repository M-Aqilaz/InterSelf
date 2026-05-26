"use client";

import { useState } from "react";
import { ClassSelectionModal } from "@/components/sections/class-selection-modal";

type Props = {
  hasChosenClass: boolean;
  children: React.ReactNode;
};

export function ClassGate({ hasChosenClass, children }: Props) {
  const [chosen, setChosen] = useState(hasChosenClass);

  return (
    <>
      {!chosen && (
        <ClassSelectionModal
          onClassChosen={() => {
            setChosen(true);
            window.location.reload();
          }}
        />
      )}
      {children}
    </>
  );
}

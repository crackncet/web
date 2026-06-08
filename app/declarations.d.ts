import * as React from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "math-field": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        value?: string;
        style?: React.CSSProperties;
        ref?: React.RefObject<any>;
      }, HTMLElement>;
    }
  }
}

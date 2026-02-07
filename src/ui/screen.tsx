import React from "react";
import { View, ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = ViewProps & {
  children: React.ReactNode;
  padTop?: boolean;
  padBottom?: boolean;
};

export function Screen({ children, style, padTop = true, padBottom = true, ...rest }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      {...rest}
      style={[
        { flex: 1, paddingTop: padTop ? insets.top : 0, paddingBottom: padBottom ? insets.bottom : 0 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

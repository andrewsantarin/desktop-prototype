/**
 * Builds a props retrieval function which includes the default
 *
 * @export
 * @template DefaultProps
 * @param {DefaultProps} defaultProps
 * @returns
 * @see https://medium.com/@martin_hotell/react-typescript-and-defaultprops-dilemma-ca7f81c661c7#9ad8
 */
export const createPropsGetter = function createPropsGetter<DefaultProps extends object>(defaultProps: DefaultProps) {
  return <Props extends Partial<DefaultProps>>(props: Props) => {
    // Extract the default props from the component props type.
    type PropsExcludingDefaults = Pick<Props, Exclude<keyof Props, keyof DefaultProps>>;

    // Recreate the props definition by creating an intersection type
    // between the component props type without defaults and NonNullable DefaultProps
    type RecomposedProps = DefaultProps & PropsExcludingDefaults;

    // Return the same props provided as argument - identity function.
    // Deactivate compiler and cast the type to the new RecomposedProps type.
    return (props as any) as RecomposedProps;
  }
}
